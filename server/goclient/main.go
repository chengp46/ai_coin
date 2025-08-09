package main

import (
	"log"
	"net/url"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

type WSClient struct {
	url       string
	conn      *websocket.Conn
	done      chan struct{}
	interrupt chan os.Signal
	send      chan []byte // 发消息通道
}

func NewWSClient(addr string) *WSClient {
	return &WSClient{
		url:       addr,
		done:      make(chan struct{}),
		interrupt: make(chan os.Signal, 1),
		send:      make(chan []byte, 256), // 缓冲区
	}
}

// 连接 WebSocket
func (c *WSClient) connect() error {
	u := url.URL{Scheme: "ws", Host: c.url, Path: "/ws"}
	log.Printf("Connecting to %s", u.String())

	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}
	c.conn = conn

	// 设置超时
	c.conn.SetReadDeadline(time.Now().Add(30 * time.Second))

	// 收到 Pong 重置超时
	c.conn.SetPongHandler(func(appData string) error {
		log.Println("收到 Pong:", appData)
		c.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
		return nil
	})

	// 收到 Ping 回 Pong
	c.conn.SetPingHandler(func(appData string) error {
		log.Println("收到 Ping:", appData)
		err := c.conn.WriteMessage(websocket.PongMessage, []byte(appData))
		if err != nil {
			log.Println("发送 Pong 失败:", err)
			return err
		}
		c.conn.SetReadDeadline(time.Now().Add(30 * time.Second))
		return nil
	})

	return nil
}

// 启动客户端
func (c *WSClient) Start() {
	signal.Notify(c.interrupt, os.Interrupt)

	// 初次连接
	if err := c.connect(); err != nil {
		log.Fatal("初次连接失败:", err)
	}

	// 读取协程
	go c.readLoop()

	// 写协程
	go c.writeLoop()

	// 心跳协程
	go c.heartbeatLoop()

	for {
		select {
		case <-c.done:
			return
		case <-c.interrupt:
			log.Println("收到退出信号")
			c.close()
			return
		}
	}
}

// 读取消息
func (c *WSClient) readLoop() {
	defer close(c.done)

	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			log.Println("读取错误:", err)
			c.reconnect()
			return
		}
		log.Println("收到消息:", string(msg))
	}
}

// 写消息
func (c *WSClient) writeLoop() {
	for {
		select {
		case message := <-c.send:
			err := c.conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Println("写入错误:", err)
				c.reconnect()
				return
			}
		case <-c.done:
			return
		}
	}
}

// 心跳（30 秒 Ping 一次）
func (c *WSClient) heartbeatLoop() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := c.conn.WriteMessage(websocket.PingMessage, []byte("ping")); err != nil {
				log.Println("发送 Ping 失败:", err)
				c.reconnect()
				return
			}
		case <-c.done:
			return
		}
	}
}

// 主动发消息
func (c *WSClient) SendMessage(data []byte) {
	select {
	case c.send <- data:
	default:
		log.Println("发送队列已满，消息丢弃")
	}
}

// 关闭连接
func (c *WSClient) close() {
	if c.conn != nil {
		_ = c.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		c.conn.Close()
	}
}

// 断线重连
func (c *WSClient) reconnect() {
	log.Println("尝试重连中...")
	c.close()
	time.Sleep(3 * time.Second)
	if err := c.connect(); err != nil {
		log.Println("重连失败:", err)
		return
	}
	go c.readLoop()
	go c.writeLoop()
	go c.heartbeatLoop()
}

func main() {
	client := NewWSClient("localhost:8080") // 修改为你的服务端地址
	go client.Start()

	// 模拟主动发消息
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		<-ticker.C
		client.SendMessage([]byte("Hello Server!"))
	}
}
