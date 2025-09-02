package wsnet

import "time"

type IConnector interface {
	Put(key string, v any)
	Get(key string) (any, bool)
	SendData(data []byte)
	Close()
}

type IWsServer interface {
	Start(port int)
	SetCallback(cb HandleCallback)
	Close()
}

type HandleCallback func(conn IConnector, data []byte)

var (
	pongWait     = 30 * time.Second // 读取超时时间
	pingPeriod   = 10 * time.Second // 发送 ping 间隔
	connectIndex = 0                // 连接索引
)
