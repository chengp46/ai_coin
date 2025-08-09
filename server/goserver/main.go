package main

import (
	"fmt"
	"unsafe"

	"goserver/wsnet"
)

func main() {
	var wsServer = &wsnet.WsServer{Clients: make(map[int]*wsnet.WsConnector)}
	wsServer.SetCallback(handleMessage)
	wsServer.Start(8080)
}

func handleMessage(conn wsnet.IConnector, data []byte) {
	fmt.Printf("%s\n", data)
	s := "hello client"
	conn.SendData(unsafe.Slice(unsafe.StringData(s), len(s)))
}
