package main

import (
	"fmt"
	"net/http"
	"sync/atomic"

	"github.com/olahol/melody"
)

// 使用atomic包中的Int64类型来保证idCounter的线程安全
var idCounter atomic.Int64

func main() {
	// 创建一个新的Melody实例，用于处理WebSocket连接
	m := melody.New()

	// 设置HTTP处理器，当访问/ws路径时，处理WebSocket请求
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// 将HTTP请求升级为WebSocket连接
		_ = m.HandleRequest(w, r)
	})

	// 设置连接处理器，当有新的WebSocket连接时触发
	m.HandleConnect(func(s *melody.Session) {
		// 增加idCounter，并获取新的ID
		id := idCounter.Add(1)

		// 将ID存储在当前的WebSocket会话中
		s.Set("id", id)

		// 向客户端发送一条消息，告知其ID
		_ = s.Write([]byte(fmt.Sprintf("iam %d", id)))
	})

	// 设置断开连接处理器，当WebSocket连接断开时触发
	m.HandleDisconnect(func(s *melody.Session) {
		// 获取当前会话的ID
		if id, ok := s.Get("id"); ok {
			// 向其他所有连接广播断开连接的消息
			_ = m.BroadcastOthers([]byte(fmt.Sprintf("dis %d", id)), s)
		}
	})

	// 设置消息处理器，当收到消息时触发
	m.HandleMessage(func(s *melody.Session, msg []byte) {
		// 获取当前会话的ID
		if id, ok := s.Get("id"); ok {
			// 向其他所有连接广播收到的消息
			_ = m.BroadcastOthers([]byte(fmt.Sprintf("set %d %s", id, msg)), s)
		}
	})

	// 启动HTTP服务器，监听5000端口
	_ = http.ListenAndServe(":5000", nil)
}
