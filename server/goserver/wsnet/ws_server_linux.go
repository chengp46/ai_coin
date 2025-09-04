package wsnet

import (
	"fmt"
	"log"
	"net"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	"github.com/mailru/easygo/netpoll"
)

type WsConnector struct {
	sync.RWMutex
	Conn     net.Conn
	ConnId   int64
	LastPing time.Time
	data     map[string]any
	Mutex    sync.Mutex
}

func (c *WsConnector) Put(key string, v any) {
	c.Lock()
	defer c.Unlock()
	c.data[key] = v
}

func (c *WsConnector) Get(key string) (any, bool) {
	c.RLock()
	defer c.RUnlock()
	v, ok := c.data[key]
	return v, ok
}

func (c *WsConnector) SendData(data []byte) {
	c.Mutex.Lock()
	c.LastPing = time.Now()
	c.Mutex.Unlock()

	err := wsutil.WriteServerBinary(c.Conn, data)
	if err != nil {
		log.Printf("SendData err: %v", err)
		_ = c.Conn.Close()
	}
}

func (c *WsConnector) UpdatePing() {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	c.LastPing = time.Now()
}

func (c *WsConnector) IsAlive(timeout time.Duration) bool {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	return time.Since(c.LastPing) <= timeout
}

func (g *WsConnector) Close() {
	g.Lock()
	defer g.Unlock()
	g.Conn.Close()
	g.data = make(map[string]any)
}

type WsServer struct {
	Mutex    sync.RWMutex
	Clients  map[int64]*WsConnector
	Callback HandleCallback
	nextID   int64
}

func NewWsServer() *WsServer {
	return &WsServer{
		Clients: make(map[int64]*WsConnector),
	}
}

func (s *WsServer) Start(port int) {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		log.Fatalf("listen err: %v", err)
	}

	poller, err := netpoll.New(nil)
	if err != nil {
		log.Fatalf("netpoll err: %v", err)
	}

	s.StartHeartbeat(30 * time.Second)

	for {
		connRaw, err := ln.Accept()
		if err != nil {
			continue
		}

		go func(conn net.Conn) {
			_, err := ws.Upgrade(conn)
			if err != nil {
				_ = conn.Close()
				return
			}

			connID := atomic.AddInt64(&s.nextID, 1)
			c := &WsConnector{
				Conn:     conn,
				ConnId:   connID,
				LastPing: time.Now(),
			}

			s.Mutex.Lock()
			s.Clients[connID] = c
			s.Mutex.Unlock()

			conn.SetReadDeadline(time.Now().Add(35 * time.Second))
			desc := netpoll.Must(netpoll.HandleReadOnce(conn))
			err = poller.Start(desc, func(ev netpoll.Event) {
				if ev&(netpoll.EventReadHup|netpoll.EventHup) != 0 {
					s.removeClient(c)
					return
				}

				data, err := wsutil.ReadClientBinary(conn)
				if err != nil {
					s.removeClient(c)
					return
				}

				c.UpdatePing()
				if s.Callback != nil {
					s.Callback(c, data)
				}
				// 继续订阅读事件
				poller.Resume(desc)
			})
			if err != nil {
				log.Printf("poller start err: %v", err)
				s.removeClient(c)
			}
		}(connRaw)
	}
}

func (s *WsServer) removeClient(c *WsConnector) {
	s.Mutex.Lock()
	defer s.Mutex.Unlock()
	_ = c.Conn.Close()
	delete(s.Clients, c.ConnId)
}

func (s *WsServer) SetCallback(cb HandleCallback) {
	s.Callback = cb
}

func (s *WsServer) StartHeartbeat(timeout time.Duration) {
	ticker := time.NewTicker(timeout / 2)
	go func() {
		for range ticker.C {
			s.Mutex.RLock()
			clients := make([]*WsConnector, 0, len(s.Clients))
			for _, c := range s.Clients {
				clients = append(clients, c)
			}
			s.Mutex.RUnlock()

			for _, c := range clients {
				if !c.IsAlive(timeout) {
					s.removeClient(c)
				}
			}
		}
	}()
}

func (s *WsServer) Close() {
	for _, v := range s.Clients {
		v.Close()
	}
	clear(s.Clients)
}
