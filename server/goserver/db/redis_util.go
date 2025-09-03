package db

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	ctx = context.Background()
	rdb *redis.Client
)

// Config Redis 配置
type Config struct {
	Addr     string
	Password string
	DB       int
	PoolSize int
}

// Init 初始化 Redis 客户端
func Init(cfg Config) {
	rdb = redis.NewClient(&redis.Options{
		Addr:         cfg.Addr,
		Password:     cfg.Password,
		DB:           cfg.DB,
		PoolSize:     cfg.PoolSize,
		MinIdleConns: 5,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})
}

// ---------------- String ----------------

// Set 设置 key
func Set(key string, value interface{}, expiration time.Duration) error {
	return rdb.Set(ctx, key, value, expiration).Err()
}

// Get 获取 key
func Get(key string) (string, error) {
	return rdb.Get(ctx, key).Result()
}

// Incr 自增
func Incr(key string) (int64, error) {
	return rdb.Incr(ctx, key).Result()
}

// Decr 自减
func Decr(key string) (int64, error) {
	return rdb.Decr(ctx, key).Result()
}

// ---------------- Hash ----------------

func HSet(key string, values ...interface{}) error {
	return rdb.HSet(ctx, key, values...).Err()
}

func HGet(key, field string) (string, error) {
	return rdb.HGet(ctx, key, field).Result()
}

func HGetAll(key string) (map[string]string, error) {
	return rdb.HGetAll(ctx, key).Result()
}

// ---------------- List ----------------

func LPush(key string, values ...interface{}) error {
	return rdb.LPush(ctx, key, values...).Err()
}

func RPush(key string, values ...interface{}) error {
	return rdb.RPush(ctx, key, values...).Err()
}

func LPop(key string) (string, error) {
	return rdb.LPop(ctx, key).Result()
}

func LRange(key string, start, stop int64) ([]string, error) {
	return rdb.LRange(ctx, key, start, stop).Result()
}

// ---------------- Set ----------------

func SAdd(key string, members ...interface{}) error {
	return rdb.SAdd(ctx, key, members...).Err()
}

func SMembers(key string) ([]string, error) {
	return rdb.SMembers(ctx, key).Result()
}

func SIsMember(key string, member interface{}) (bool, error) {
	return rdb.SIsMember(ctx, key, member).Result()
}

// ---------------- ZSet ----------------

func ZAdd(key string, members ...redis.Z) error {
	return rdb.ZAdd(ctx, key, members...).Err()
}

func ZRangeWithScores(key string, start, stop int64) ([]redis.Z, error) {
	return rdb.ZRangeWithScores(ctx, key, start, stop).Result()
}

func ZRevRangeWithScores(key string, start, stop int64) ([]redis.Z, error) {
	return rdb.ZRevRangeWithScores(ctx, key, start, stop).Result()
}

// ---------------- 分布式锁 ----------------

// TryLock 尝试获取锁（过期时间必须设置）
func TryLock(key, value string, expiration time.Duration) (bool, error) {
	return rdb.SetNX(ctx, key, value, expiration).Result()
}

// Unlock 释放锁（简单版，没做 value 校验）
func Unlock(key string) error {
	return rdb.Del(ctx, key).Err()
}

// ---------------- 发布订阅 ----------------

func Publish(channel, msg string) error {
	return rdb.Publish(ctx, channel, msg).Err()
}

func Subscribe(channel string) *redis.PubSub {
	return rdb.Subscribe(ctx, channel)
}

// ---------------- 清除缓存 ----------------

// Del 删除一个或多个 key
func Del(keys ...string) (int64, error) {
	return rdb.Del(ctx, keys...).Result()
}

// Expire 设置 key 过期时间
func Expire(key string, expiration time.Duration) (bool, error) {
	return rdb.Expire(ctx, key, expiration).Result()
}

// TTL 查看 key 剩余过期时间
func TTL(key string) (time.Duration, error) {
	return rdb.TTL(ctx, key).Result()
}

// DelByPrefix 按前缀删除缓存
func DelByPrefix(prefix string) (int64, error) {
	var cursor uint64
	var totalDeleted int64
	for {
		// 使用 Scan 遍历匹配的 key，避免阻塞 Redis
		keys, nextCursor, err := rdb.Scan(ctx, cursor, prefix+"*", 100).Result()
		if err != nil {
			return totalDeleted, err
		}
		cursor = nextCursor

		if len(keys) > 0 {
			deleted, err := rdb.Del(ctx, keys...).Result()
			if err != nil {
				return totalDeleted, err
			}
			totalDeleted += deleted
		}

		// 游标为 0 表示遍历完毕
		if cursor == 0 {
			break
		}
	}
	return totalDeleted, nil
}

// FlushDB 清空当前数据库
func FlushDB() error {
	return rdb.FlushDB(ctx).Err()
}

// FlushAll 清空所有数据库（生产环境慎用⚠️）
func FlushAll() error {
	return rdb.FlushAll(ctx).Err()
}

// ---------------- JSON ----------------

// SetJSON 存储结构体（自动序列化）
func SetJSON(key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return rdb.Set(ctx, key, data, expiration).Err()
}

// GetJSON 获取结构体（自动反序列化）
func GetJSON(key string, dest interface{}) error {
	data, err := rdb.Get(ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

// HSetJSON 将结构体存储到 Hash
func HSetJSON(key string, field string, value interface{}) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return rdb.HSet(ctx, key, field, data).Err()
}

// HGetJSON 从 Hash 中取结构体
func HGetJSON(key, field string, dest interface{}) error {
	data, err := rdb.HGet(ctx, key, field).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

/*--------------------------------------------------------------------
// 使用示例
// 初始化
	redisutil.Init(redisutil.Config{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
		PoolSize: 20,
	})

	// String
	redisutil.Set("name", "GoRedis", time.Hour)
	val, _ := redisutil.Get("name")
	fmt.Println("name =", val)

	// Hash
	redisutil.HSet("user:1", "name", "Alice", "age", 20)
	user, _ := redisutil.HGetAll("user:1")
	fmt.Println("user =", user)

	// 分布式锁
	ok, _ := redisutil.TryLock("lock:order", "1", 10*time.Second)
	if ok {
		fmt.Println("获取锁成功")
		redisutil.Unlock("lock:order")
	}

	type User struct {
		ID    int    `json:"id"`
		Name  string `json:"name"`
		Age   int    `json:"age"`
		Email string `json:"email"`
	}
	// 示例数据
	u := User{ID: 1, Name: "Alice", Age: 20, Email: "alice@test.com"}

	// 存储结构体
	_ = redisutil.SetJSON("user:1", u, time.Hour)

	// 读取结构体
	var u2 User
	_ = redisutil.GetJSON("user:1", &u2)
	fmt.Println("User struct:", u2)

	// 存储到 Hash
	_ = redisutil.HSetJSON("userhash:1", "profile", u)

	// 从 Hash 读取
	var u3 User
	_ = redisutil.HGetJSON("userhash:1", "profile", &u3)
	fmt.Println("User from hash:", u3)

	// 设置 key
	_ = redisutil.SetJSON("cache:user:1", map[string]string{"name": "Alice"}, time.Minute)

	// 查看 TTL
	ttl, _ := redisutil.TTL("cache:user:1")
	fmt.Println("TTL:", ttl)

	// 修改过期时间
	ok, _ := redisutil.Expire("cache:user:1", 10*time.Second)
	fmt.Println("Expire set:", ok)

	// 删除 key
	n, _ := redisutil.Del("cache:user:1")
	fmt.Println("Deleted keys:", n)

	// 清空数据库
	// _ = redisutil.FlushDB()
	// _ = redisutil.FlushAll()


	// 批量设置缓存
	for i := 1; i <= 5; i++ {
		key := fmt.Sprintf("cache:user:%d", i)
		_ = redisutil.SetJSON(key, map[string]string{"name": fmt.Sprintf("User%d", i)}, time.Hour)
	}

	// 按前缀删除
	deleted, _ := redisutil.DelByPrefix("cache:user:")
	fmt.Println("Deleted keys count:", deleted)

	// 事务与流水线
	//Pipeline（减少网络往返）
	pipe := rdb.Pipeline()
	pipe.Set(ctx, "k1", "v1", 0)
	pipe.Set(ctx, "k2", "v2", 0)
	pipe.Incr(ctx, "counter")
	cmds, err := pipe.Exec(ctx)

	// 事务（乐观锁）
	txf := func(tx *redis.Tx) error {
		// 取值
		n, err := tx.Get(ctx, "counter").Int()
		if err != nil && err != redis.Nil {
			return err
		}
		// 条件更新
		_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Set(ctx, "counter", n+1, 0)
				return nil
		})
		return err
	}

	err := rdb.Watch(ctx, txf, "counter")

--------------------------------------------------------------------*/
