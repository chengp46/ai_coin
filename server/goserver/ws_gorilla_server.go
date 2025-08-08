package net

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Gor_Connector struct {
	Conn     *websocket.Conn
	ConnId   int
	SendChan chan []byte
}

func (g *Gor_Connector) SendData(data []byte) {
	g.SendChan <- data
}

func (g *Gor_Connector) ReadMessage(server *Gor_WsServer) {
	for {
		_, message, err := g.Conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error:", err)
			break
		}
		if server.Callback != nil {
			server.Callback(g, message)
		}
	}
}

func (g *Gor_Connector) WriteMessage(server *Gor_WsServer) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		g.Conn.Close()
		server.Mutex.Lock()
		delete(server.Clients, g.ConnId)
		server.Mutex.Unlock()
	}()
	for {
		select {
		case message, ok := <-g.SendChan:
			g.Conn.SetWriteDeadline(time.Now().Add(30 * time.Second))
			if !ok {
				g.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			err := g.Conn.WriteMessage(websocket.BinaryMessage, message)
			if err != nil {
				return
			}
		case <-ticker.C:
			// 发送 ping 保活
			g.Conn.SetWriteDeadline(time.Now().Add(30 * time.Second))
			if err := g.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

type Gor_WsServer struct {
	Mutex    sync.RWMutex
	Clients  map[int]*Gor_Connector
	Callback HandleCallback
}

var upgrader = websocket.Upgrader{
	// 允许跨域连接
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var connectIndex = 0

func (g *Gor_WsServer) Start(port int) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		// 升级连接为 WebSocket
		connect, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println("Upgrade error:", err)
			return
		}
		connectIndex++
		connector := &Gor_Connector{
			Conn:     connect,
			ConnId:   connectIndex,
			SendChan: make(chan []byte, 2048),
		}
		g.Mutex.Lock()
		g.Clients[connectIndex] = connector
		g.Mutex.Unlock()
		connect.SetReadLimit(8129)
		connect.SetReadDeadline(time.Now().Add(30 * time.Second))
		connect.SetPongHandler(func(string) error {
			connect.SetReadDeadline(time.Now().Add(30 * time.Second))
			return nil
		})
		go connector.ReadMessage(g)
		go connector.WriteMessage(g)
	})
	http.ListenAndServe(fmt.Sprintf(":%v", port), nil)
}

func (g *Gor_WsServer) SetCallback(cb HandleCallback) {
	g.Callback = cb
}
