package net

import (
	"log"
	"net"
	"sync"
	"time"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	"github.com/mailru/easygo/netpoll"
)

type Gob_Connector struct {
	Conn     net.Conn
	ConnId   int
	LastPing time.Time
	Mutex    sync.Mutex
	Closed   bool
}

func (g *Gob_Connector) SendData(data []byte) {
	wsutil.WriteServerBinary(g.Conn, data)
}

func (c *Gob_Connector) UpdatePing() {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	c.LastPing = time.Now()
}

func (c *Gob_Connector) IsAlive(timeout time.Duration) bool {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	return time.Since(c.LastPing) <= timeout
}

func (c *Gob_Connector) Close() {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	if !c.Closed {
		c.Closed = true
		c.Conn.Close()
	}
}

type Gob_WsServer struct {
	Mutex    sync.RWMutex
	Clients  map[int]*Gob_Connector
	Callback HandleCallback
}

func (g *Gob_WsServer) Start(port int) {
	ln, err := net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatalf("listen err: %v", err)
	}

	poller, err := netpoll.New(nil)
	if err != nil {
		log.Fatalf("netpoll err: %v", err)
	}
	for {
		// 接收连接并升级为 WebSocket（或普通 TCP）
		connRaw, err := ln.Accept()
		if err != nil {
			continue
		}
		go func(conn net.Conn) {
			// 升级 WebSocket
			_, err := ws.Upgrade(connRaw)
			if err != nil {
				connRaw.Close()
				return
			}

			c := &Gob_Connector{
				Conn:     connRaw,
				UserID:   connRaw.RemoteAddr().String(), // 示例 userID
				LastPing: time.Now(),
			}
			desc := netpoll.Must(netpoll.HandleReadOnce(connRaw)) // 只监听一次 Read 事件
			poller.Start(desc, func(ev netpoll.Event) {
				if ev&(netpoll.EventReadHup|netpoll.EventHup) != 0 {
					connManager.Remove(c.UserID)
					connRaw.Close()
					return
				}

				// 处理客户端消息
				data, err := wsutil.ReadClientBinary(connRaw)
				if err != nil {
					connManager.Remove(c.UserID)
					connRaw.Close()
					return
				}

				// 判断是否是 PING/PONG 消息（或加入自定义协议类型）
				c.UpdatePing()

				// 处理聊天消息
				handler.HandleMessage(c, data, connManager)

				// 重新订阅读事件
				poller.Resume(desc)
			})
		}(connRaw)
	}
}
