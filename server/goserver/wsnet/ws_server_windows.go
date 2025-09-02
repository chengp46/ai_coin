package wsnet

import (
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

type WsConnector struct {
	Conn     *websocket.Conn
	ConnId   int64
	SendChan chan []byte
}

func (g *WsConnector) SendData(data []byte) {
	select {
	case g.SendChan <- data:
	case <-time.After(time.Second):
		g.Conn.Close()    // 主动断开连接
		close(g.SendChan) // 通知 WriteMessage 退出
		fmt.Printf("send timeout, client %d disconnected", g.ConnId)
	}
}

func (g *WsConnector) ReadMessage(server *WsServer) {
	for {
		_, message, err := g.Conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error:", err)
			g.Conn.Close()
			server.Mutex.Lock()
			delete(server.Clients, g.ConnId)
			server.Mutex.Unlock()
			break
		}
		g.Conn.SetWriteDeadline(time.Now().Add(pongWait))
		if server.Callback != nil {
			server.Callback(g, message)
		}
	}
}

func (g *WsConnector) WriteMessage(server *WsServer) {
	ticker := time.NewTicker(pingPeriod)
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
			if !ok {
				g.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := g.Conn.WriteMessage(websocket.BinaryMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			// 发送 ping 保活
			g.Conn.SetWriteDeadline(time.Now().Add(pongWait))
			if err := g.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
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

var upgrader = websocket.Upgrader{
	// 允许跨域连接
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (g *WsServer) Start(port int) {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		// 升级连接为 WebSocket
		connect, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println("Upgrade error:", err)
			return
		}
		connID := atomic.AddInt64(&g.nextID, 1)
		connector := &WsConnector{
			Conn:     connect,
			ConnId:   connID,
			SendChan: make(chan []byte, 4096),
		}
		g.Mutex.Lock()
		g.Clients[connID] = connector
		g.Mutex.Unlock()
		connect.SetReadLimit(8192)
		connect.SetReadDeadline(time.Now().Add(pongWait))
		connect.SetPongHandler(func(appData string) error {
			connect.SetReadDeadline(time.Now().Add(pongWait))
			return nil
		})
		connect.SetPingHandler(func(appData string) error {
			err := connect.WriteMessage(websocket.PongMessage, []byte(appData))
			if err != nil {
				return err
			}
			connect.SetReadDeadline(time.Now().Add(pongWait))
			return nil
		})

		go connector.ReadMessage(g)
		go connector.WriteMessage(g)
	})
	http.ListenAndServe(fmt.Sprintf(":%v", port), nil)
}

func (g *WsServer) SetCallback(cb HandleCallback) {
	g.Callback = cb
}
