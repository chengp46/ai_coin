package wsnet

import (
	"bytes"
	"compress/zlib"
	"crypto/rc4"
	"io"
)

type EncryptType byte
type MessageType byte

const (
	MT_Request  MessageType = 0x00 // ----000- 客户端发请求，服务端需要返回
	MT_Notify   MessageType = 0x01 // ----001- 客户端发通知，服务端无需返回
	MT_Response MessageType = 0x02 // ----010- 服务端对 request 的回应
	MT_Push     MessageType = 0x03 // ----011- 服务端主动推送
)

const (
	ET_NONE EncryptType = 0x00 // 无加密
	ET_XOR  EncryptType = 0x01 // XOR加密
	ET_RC4  EncryptType = 0x02 // RC4加密
)

const (
	SECRET_KEY = "asdef123"
)

type MsgPackage struct {
	MsgType int
	MsgData []byte
}

type MessageID struct {
	MsgType  uint32 // 1-4 位：消息类型(0 ~ 15)
	Compress uint32 // 5位：压缩标识
	EncType  uint32 // 6-9 位：加密类型 (0 ~ 15)
	TypeID   uint32 // 10-19位：类型ID (0 ~ 1023)
	MsgID    uint32 // 20-32 位：消息编号(0 ~ 8191)
}

func EncodeHeader(packageID MessageID) uint32 {
	var msgID uint32 = 0
	msgID |= packageID.MsgType & 0x0F         // 1–4 位
	msgID |= (packageID.Compress & 0x01) << 4 // 第5 位
	msgID |= (packageID.EncType & 0x0F) << 5  // 6–9 位
	msgID |= (packageID.TypeID & 0x3FF) << 9  // 10–19 位 (10 位)
	msgID |= (packageID.MsgID & 0x1FFF) << 19 // 20–32 位 (13 位)
	return msgID
}

func DecodeHeader(packageID uint32) MessageID {
	var msgID MessageID
	msgID.MsgType = packageID & 0x0F         // 1–4 位
	msgID.Compress = (packageID >> 4) & 0x01 // 第5 位
	msgID.EncType = (packageID >> 5) & 0x0F  // 6–9 位
	msgID.TypeID = (packageID >> 9) & 0x3FF  // 10–19 位
	msgID.MsgID = (packageID >> 19) & 0x1FFF // 20–32 位
	return msgID
}

/*
key := []byte("my-secret-key")
plain := []byte("hello world")
encrypted := XOREncrypt(plain, key) // 加密
decrypted := XOREncrypt(encrypted, key) // 再次 XOR = 原文
*/
func XOREncrypt(data, key []byte) []byte {
	out := make([]byte, len(data))
	for i := range data {
		out[i] = data[i] ^ key[i%len(key)]
	}
	return out
}

/*
key := []byte("my-secret-key")
plain := []byte("hello world")
encrypted, _ := RC4Encrypt(key, plain) // 加密数据
decrypted, _ := RC4Encrypt(key, encrypted) // RC4 解密与加密相同
*/
func RC4Encrypt(data, key []byte) ([]byte, error) {
	c, err := rc4.NewCipher(key)
	if err != nil {
		return nil, err
	}
	dst := make([]byte, len(data))
	c.XORKeyStream(dst, data)
	return dst, nil
}

// zlib压缩
func Compress(data []byte) ([]byte, error) {
	var b bytes.Buffer
	w := zlib.NewWriter(&b)
	_, err := w.Write(data)
	if err != nil {
		return nil, err
	}
	w.Close()
	return b.Bytes(), nil
}

// zlib解压缩
func Decompress(data []byte) ([]byte, error) {
	b := bytes.NewReader(data)
	r, err := zlib.NewReader(b)
	if err != nil {
		return nil, err
	}
	defer r.Close()
	return io.ReadAll(r)
}
