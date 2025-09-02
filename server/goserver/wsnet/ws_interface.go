package wsnet

import "time"

type IConnector interface {
	SendData(data []byte)
}

type IWsServer interface {
	Start(port int)
	SetCallback(cb HandleCallback)
}

type HandleCallback func(conn IConnector, data []byte)

var (
	pongWait   = 60 * time.Second    // 读取超时时间
	pingPeriod = (pongWait * 9) / 10 // 发送 ping 间隔
)
