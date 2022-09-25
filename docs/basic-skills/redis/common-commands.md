# Redis 常用命令

## 基本命令

```bash
# 连接 redis 服务端
redis-cli -h 127.0.0.1 -p 6379

# 如果 redis 设置了密码，在连接后，输入密码命令（显示 OK 则登录成功）
# 一旦设置密码，必须先验证通过密码，否则所有操作不可用，都将只返回：
# (error) NOAUTH Authentication required.
127.0.0.1:6379> auth <password>

# 沟通命令，查看状态（ping 返回 PONG 表示 redis 服务运行正常）
127.0.0.1:6379> ping

# 查看密码
127.0.0.1:6379> config get requirepass

# 设置临时密码（临时密码在服务重启后失效，所以一般生产环境不使用这种方式）
127.0.0.1:6379> config set requirepass <password>

# 取消临时密码
127.0.0.1:6379> config set requirepass ''

# 通过 select 命令来切换数据库。数据库初始是 16 个（0~15），可通过配置文件修改
# 默认是第 0 个数据库
127.0.0.1:6379> select 1

# 查看数据库中 key 的数量
127.0.0.1:6379> dbsize

# 往数据库设置 string 类型值
127.0.0.1:6379> set name zhangsan

# 查看刚才添加的 key 的值
127.0.0.1:6379> get name

# 查看所有 key 的值
127.0.0.1:6379> keys *

# 删除添加的 name key 键
127.0.0.1:6379> del name

# 清空当前数据库的数据
127.0.0.1:6379> flushdb
# 清空全部数据库的数据
127.0.0.1:6379> flushall

# redis 自带的客户端退出当前 redis 连接：exit 或 quit
```

::: tip 小贴士
如果通过命令行往 redis 写数据时，出现报错：`(error) READONLY You can't write against a read only replica.`

报错原因：当前 redis 服务是只读的，没有写权限，估计该服务是被当作从数据库使用了。

解决方案：

* 方法一：在 `redis-cli` 命令行客户端中，输入 `slaveof no one` 命令，让当前 redis 服务停止接收其他 redis 服务的同步，同时把自己升格为主数据库。
* 方法二：打开 redis 服务对应的配置文件，把其中的属性 `slave-read-only` 的值修改为 `no`，即给从服务器写入的权限，这样就可写了。
:::

## Key 的操作命令

key 值命令可以说是一些类型的公共命令，比如有设置定时时间，排序，数据迁移等等。

### 查询

#### keys

* 语法：`keys pattern`
* 作用：查找所有符合 pattern 的 key，支持通配符（`*` 表示零到多个字符，`?` 表示单个字符）

```bash
# 例如：
# h?llo       匹配 hello, hallo 和 hxllo
# h*llo       匹配 hllo 和 heeeello
# h[ae]llo    匹配 hello 和 hallo, 不匹配如 hillo
# h[^e]llo    匹配 hallo, hbllo, ... 不匹配如 hello
# h[a-e]llo   匹配 hallo 和 hbllo, [a-e]说明是a~e这个范围，如 hcllo 也可以匹配

# 示例：若想匹配转义字符，就需要使用 \ 转义你想匹配的特殊字符，如下：
127.0.0.1:6379> set na\me zhangsan
127.0.0.1:6379> keys na[\\]me
```

#### exists

* 语法：`exists key [key ...]`
* 作用：判断 key 是否存在
* 返回值：整数，存在 key 返回 1，其他返回 0。如果查询多个 key，返回存在的 key 的数量

```bash
# 示例1：查看是否存在名为 name 的 key
127.0.0.1:6379> exists name

# 示例2：重复写两次 name，如果 name 存在则返回2
127.0.0.1:6379> exists name name

# 示例3：查看当前是否存在 name 和 address 这两个 key
127.0.0.1:6379> exists name address
```

#### type

* 语法：`type key`
* 作用：查看 key 所存储值的数据类型返回值
* 返回值：字符串表示的数据类型，可返回的类型是：
  * none（key 不存在）
  * string（字符串）
  * list（列表）
  * set（集合）
  * zset（有序集）
  * hash（哈希表）

#### randomkey

* 语法：`randomkey`
* 作用：随机返回一个 key 名称

### 删除

#### del

* 语法：`del key [key ...]`
* 作用：删除指定的 key，不存在的 key 忽略
* 返回值：数字，删除的 key 的数量

```bash
127.0.0.1:6379> del name age address
```

#### unlink

* 语法：`unlink key [key ...]`
* 作用：其实这个和删除 del 命令很像，也是存在 key 删除，不存在则忽略；删除几个键值，则返回删除的个数

```bash
127.0.0.1:6379> unlink name1 name2 name3
```

`del` 和 `unlink` 区别：
* `del`：它是线程阻塞的，当执行 del 命令时，del 在没执行完时，其它后续的命令是无法进入的（要安全就使用 del）
* `unlink`：它不是线程阻塞的，当执行 unlink 命令时，它会将要删除的键移交给另外线程，然后将当前要删除的键与数据库空间断开连接。后续则由其它线程异步删除这些键（要效率快就使用 unlink）。

### 改动

#### rename

* 语法：`rename key newkey`
* 作用：修改 key 名称，存在则覆盖，不存在则抛错；如果修改 key1 为 key2，key2 存在，则 key1 覆盖 key2 的值

```bash
127.0.0.1:6379> rename name name1
```

#### renamenx

* 语法：`renamenx key newkey`
* 作用：修改 key 名称，存在则覆盖，不存在则抛错；如果修改 key1 为 key2，key2 存在，则 key1 修改不成功

```bash
127.0.0.1:6379> renamenx name name1
```

#### copy

* 语法：`copy source destination [db destination-db] [replace]`
* 说明：拷贝当前某一个 key 的值，存放到新的 key 中（可以跨库拷贝）
* 返回值：成功返回数字 1，失败返回数字 0

```bash
copy name1 name2          # 把 name1 的值 拷贝到 name2 里
copy name1 name2 db 5     # 把 name1 的值拷贝到第 6 号数据库 name2 里
copy name1 name2 replace  # 把 name1 的值拷贝到 name2 里，存在则强行覆盖
```

#### move

* 语法：`move key db`
* 作用：把指定的键值移动到选定的数据库 db 当中。如果 key 在目标数据库中已存在，或者 key 在源数据库中不存，则 key 不会被移动

```bash
# 把 name 移动到三号数据库里
127.0.0.1:6379> move name 2
```

#### touch

* 语法：`touch key [key ...]`
* 作用：修改指定 key 的最后访问时间。忽略不存在的 key
* 返回值：操作的 key 的数量

```bash
# 返回被设置成功的键个数
127.0.0.1:6379> touch name1 name2 name3
```

### 过期时间

#### expire

* 语法：`expire key seconds`
* 作用：设置 key 的过期时间，超过时间 key 就自动删除（单位是秒）
* 返回值：设置成功返回数字 1，其他情况是 0

```bash
# 把 name 键设置 300 秒过期
127.0.0.1:6379> expire name 300
```

#### pexpire

* 语法：`pexpire key milliseconds`
* 作用：设置 key 的过期时间，超过时间 key 就自动删除（单位是毫秒）
* 返回值：设置成功返回数字 1，其他情况是 0

```bash
# 把 name 键设置 3000 毫秒过期（3 秒）
127.0.0.1:6379> pexpire name 3000
```

#### expireat

* 语法：`expireat key timestamp`
* 作用：设置 key 的过期时间，超过时间 key 就自动删除（格式是 unix 时间戳并精确到秒）
* 返回值：设置成功返回数字 1，其他情况是 0

```bash
# 把 name 键设置为 2022-10-01 00:00:00 到期（精确到秒）
127.0.0.1:6379> expireat name 1664553600
```

#### pexpireat

* 语法：`pexpireat key milliseconds-timestamp`
* 作用：设置 key 的过期时间，超过时间 key 就自动删除（格式是 unix 时间戳并精确到毫秒）
* 返回值：设置成功返回数字 1，其他情况是 0

```bash
# 把 name 键设置为 2022-10-01 00:00:00 到期（精确到毫秒）
127.0.0.1:6379> pexpireat name 1664553600000
```

注意：

* 使用 del 可以删除定时的 key
* 使用 set 可以覆盖定时的 key
* 使用 getset 可以返回并设置值，并会删除定时
* 如使用 rename 修改 key 名称，那么 key 定时器会被携带不会被删除

#### persist

* 语法：`persist key`
* 作用：清除当前有定时时间的键值，设置永不过期（和普通键值一样了），关闭后并不会删除已有的键值

```bash
# 关闭存在定时的键值
127.0.0.1:6379> persist name
```

#### ttl

* 语法：`ttl key`
* 作用：查看当前有定时 key 的剩余时间，返回秒
* 返回值：
  * -1：没有设置 key 的生存时间，key 永不过期
  * -2：key 不存在
  * 数字：key 的剩余时间，秒为单位

```bash
# 查看 name 的剩余时间（秒）
127.0.0.1:6379> ttl name
```

::: tip 小贴士
ttl：time to live
:::

#### pttl

* 语法：`pttl key`
* 作用：查看当前有定时 key 的剩余时间，返回毫秒
* 返回值：
  * -1：没有设置 key 的生存时间，key 永不过期
  * -2：key 不存在
  * 数字：key 的剩余时间，秒为单位

```bash
# 查看 name 的剩余时间（毫秒）
127.0.0.1:6379> pttl name
```

## 字符串 String 操作命令

```bash
# 设置指定的 key 值
SET key value

# 获取指定 key 的值
GET key

# 设置指定 key 的值，并将 key 的过期时间设为 seconds 秒
SETEX key seconds value

# 只有在 key 不存在时设置 key 的值
SETNX key value
```

## 哈希表 Hash 操作命令

Redis hash 是一个 string 类型的 field 和 value 的映射表，hash 特别适用于存储对象，常用命令：

```bash
# 将哈希表 key 中的字段 field 的值设为 value
HSET key field value

# 获取存储在哈希表中指定字段的值
HGET key field

# 删除存储在哈希表中的指定字段
HDEL key field

# 获取哈希表中所有字段
HKEYS key

# 获取哈希表中所有值
HVALS key 

# 获取在哈希表中指定 key 的所有字段和值
HGETALL key
```

## 集合 List 操作命令

Redis 列表是简单的字符串列表，按照插入顺序排序，常用命令：

```bash
# 将一个或多个值插入到列表头部
LPUSH key value1 [value2] 

# 获取列表指定范围内的元素
LRANGE key start stop 

# 移除并获取列表最后一个元素
RPOP key

# 获取列表长度
LLEN key

# 移出并获取列表的最后一个元素，如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止
BRPOP key1 [key2] timeout
```

## 无序集合 Set 操作命令

Redis set 是 string 类型的无序集合。集合成员是唯一的，这就意味着集合中不能出现重复的数据，常用命令：

```bash
# 向集合添加一个或多个成员
SADD key member1 [member2]

# 返回集合中的所有成员
SMEMBERS key 

# 获取集合中的成员数
SCARD key

# 返回给定所有集合的交集
SINTER key1 [key2]

# 返回所有给定集合的并集
SUNION key1 [key2]

# 返回给定所有集合的差集
SDIFF key1 [key2]

# 移除集合中一个或多个成员
SREM key member1 [member2]
```

## 有序集合 SortedSet 操作命令

Redis sorted set 有序集合是 string 类型元素的集合，且不允许重复的成员。每个元素都会关联一个 double 类型的分数（score）。redis 正是通过分数来为集合中的成员进行从小到大排序。有序集合的成员是唯一的，但分数却可以重复。

常用命令：

```bash
# 向有序集合添加一个或多个成员，或者更新已存在成员的分数
ZADD key score1 member1 [score2 member2]

# 通过索引区间返回有序集合中指定区间内的成员
ZRANGE key start stop [WITHSCORES]

# 有序集合中对指定成员的分数加上增量 increment
ZINCRBY key increment member

# 移除有序集合中的一个或多个成员
ZREM key member [member...]
```

## 参考文档

* [官方文档](https://redis.io/commands/)

（完）
