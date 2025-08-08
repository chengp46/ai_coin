package net

type IConnector interface {
	SendData(data []byte)
}

type IWsServer interface {
	Start(port int)
	SetCallback(cb HandleCallback)
}

type HandleCallback func(conn IConnector, data []byte)
