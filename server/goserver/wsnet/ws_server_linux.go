package wsnet

import (
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	"github.com/mailru/easygo/netpoll"
)

type WsConnector struct {
	Conn     net.Conn
	ConnId   int
	LastPing time.Time
	Mutex    sync.Mutex
}

func (g *WsConnector) SendData(data []byte) {
	g.Mutex.Lock()
	g.LastPing = time.Now()
	g.Mutex.Unlock()
	err := wsutil.WriteServerBinary(g.Conn, data)
	if err != nil {
		log.Fatalf("SendData err: %v", err)
	}
}

func (g *WsConnector) UpdatePing() {
	g.Mutex.Lock()
	defer g.Mutex.Unlock()
	g.LastPing = time.Now()
}

func (g *WsConnector) IsAlive(timeout time.Duration) bool {
	g.Mutex.Lock()
	defer g.Mutex.Unlock()
	return time.Since(g.LastPing) <= timeout
}

type WsServer struct {
	Mutex    sync.RWMutex
	Clients  map[int]*WsConnector
	Callback HandleCallback
}

func (g *WsServer) Start(port int) {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%v", port))
	if err != nil {
		log.Fatalf("listen err: %v", err)
	}

	poller, err := netpoll.New(nil)
	if err != nil {
		log.Fatalf("netpoll err: %v", err)
	}

	g.StartHeartbeat(30 * time.Second)

	for {
		// 接收连接并升级为 WebSocket（或普通 TCP）
		connRaw, err := ln.Accept()
		if err != nil {
			continue
		}
		go func(conn net.Conn) {
			// 升级 WebSocket
			_, err := ws.Upgrade(conn)
			if err != nil {
				conn.Close()
				return
			}

			connectIndex++
			c := &WsConnector{
				Conn:     conn,
				ConnId:   connectIndex,
				LastPing: time.Now(),
			}
			g.Clients[c.ConnId] = c
			conn.SetReadDeadline(time.Now().Add(35 * time.Second))
			desc := netpoll.Must(netpoll.HandleReadOnce(connRaw)) // 只监听一次 Read 事件
			poller.Start(desc, func(ev netpoll.Event) {
				if ev&(netpoll.EventReadHup|netpoll.EventHup) != 0 {
					g.Mutex.Lock()
					delete(g.Clients, c.ConnId)
					g.Mutex.Unlock()
					conn.Close()
					return
				}

				// 处理客户端消息
				data, err := wsutil.ReadClientBinary(conn)
				if err != nil {
					g.Mutex.Lock()
					delete(g.Clients, c.ConnId)
					g.Mutex.Unlock()
					conn.Close()
					return
				}
				// 判断是否是 PING/PONG 消息（或加入自定义协议类型）
				c.UpdatePing()

				if g.Callback != nil {
					g.Callback(c, data)
				}
				// 重新订阅读事件
				poller.Resume(desc)
			})
		}(connRaw)
	}
}

func (g *WsServer) SetCallback(cb HandleCallback) {
	g.Callback = cb
}

func (g *WsServer) StartHeartbeat(timeout time.Duration) {
	ticker := time.NewTicker(timeout / 2)
	go func() {
		for range ticker.C {
			for _, c := range g.Clients {
				if !c.IsAlive(timeout) {
					c.Conn.Close()
					g.Mutex.Lock()
					delete(g.Clients, c.ConnId)
					g.Mutex.Unlock()
				}
			}
		}
	}()
}
