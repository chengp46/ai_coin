package main

type IConnector interface {
	SendData(data []byte)
	Close()
}

type IServer interface {
	Start(port int)
	HandleMessage(conn IConnector, data []byte)
}
