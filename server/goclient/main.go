package main

import (
	"time"
)

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
