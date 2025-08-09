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
	pongWait     = 30 * time.Second // 读取超时时间
	pingPeriod   = 10 * time.Second // 发送 ping 间隔
	connectIndex = 0                // 连接索引
)
