# Redis 常用命令

## 基本命令

```bash
# 连接 redis 服务端
redis-cli -h 127.0.0.1 -p 6379

# 沟通命令，查看状态（ping 返回 PONG 表示 redis 服务运行正常）
127.0.0.1:6379> ping

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

## String（字符串）类型命令

### 设置

#### set

* 语法：`set key value [ex seconds|px milliseconds|exat timestamp|pxat milliseconds-timestamp|keepttl] [nx|xx] [get]`
* 作用：设置 string 类型的键值，如果 key 已经保存了一个值，那么这个操作会直接覆盖原来的值，并且忽略原始类型

```bash
# 设置一个最基本的键值
127.0.0.1:6379> set name zhangsan

# 设置一个键值，并指定过期时间秒，ttl 可以查看过期时间
127.0.0.1:6379> set name zhangsan ex 60

# 设置一个键值，但是加上 nx 代表只能更新已经存在的，如不存在 name 键则无法添加
127.0.0.1:6379> set name zhangsan nx

# 生长一个键值，但是 xx 和 nx 相反
127.0.0.1:6379> set name zhangsan xx
```

#### setnx

* 语法：`setnx key value`
* 作用：设置键值，存在此键则返回 0 不覆盖，否则正常设置

```bash
# 设置 name 为键，并赋值
127.0.0.1:6379> setnx name zhangsan
```

#### setrange

* 语法：`setrange key offset value`
* 作用：偏移量 offset>=0 开始，用 value 参数覆盖键 key 储存的字符串值，不存在的键 key 当作空白字符串处理

```bash
# 创建原始键值
127.0.0.1:6379> set name zhangsan

# 把原有的 zhangsan 从第五位之后更改（0下标），最终变为 "zhang yu xiao"
127.0.0.1:6379> setrange name 5 ' yu xiao'

# 超出偏移则使用空格 '\x00' 代替一个空格；最终变为 "zhang yu xiao\x00out"
127.0.0.1:6379> setrange name 14 out

# 如果设置的键不存在则会新建，但是偏移量会以空格代替；最终变为 "\x00\x00anhui"
127.0.0.1:6379> setrange address 2 anhui
```

#### mset

* 语法：`mset key value [key value ...]`
* 作用：和 set 命令差不多，但是这个是批量设置，如果设置键存在则覆盖，不存在则添加

```bash
# 批量设置 name 和 age 和 address
127.0.0.1:6379> mset name zhangsn age 22 address anhui
```

#### append

* 语法：`append key value`
* 作用：用于为指定的 key 追加值，成功后返回当前键里面的字符串全部长度（如果追加有空格需要使用 `''`）

```bash
# 追加有空格的，并且成功后返回当前 key 的全部长度
127.0.0.1:6379> append name 'good good boy'
```

#### getset

* 语法：`getset key value`
* 作用：设置更新 key 值，设置前先把原有的值返回出来，并设置新的值，如果 key 不存在时使用 getset 则返回 nil，并设置新值

### 查询

#### get

* 语法：`get key`
* 作用：如果键 key 不存在，那么返回特殊值 nil，否则返回键 key 的值

```bash
# 获取 name 键的值
127.0.0.1:6379> get name
```

#### mget

* 语法：`mget key [key ...]`
* 作用：批量获取键的值，如果获取的某个不存在则返回（nil），其它正常返回

```bash
# 批量获取 name 和 aaa 的值（aaa 键不存在则返回 nil）
127.0.0.1:6379> mget name aaa
```

#### strlen

* 语法：`strlen key`
* 作用：获取指定 key 所储存的字符串值的长度，当 key 储存的不是字符串类型时，返回错误

#### getrange

* 语法：`getrange key start end`
* 作用：获取指定的范围值，start（从 0 开始）end（从 0 开始）

```bash
127.0.0.1:6379> set name zhangsan

# 获取范围值，最终返回 'angs'
127.0.0.1:6379> getrange name 2 5
#  获取范围值，最终返回 'ngsa'
127.0.0.1:6379> getrange name 3 -2
```

注：若使用 `getrange name 0 -1`（其中 -1 代表从后往前数）

#### getex

* 语法：`getex key [ex seconds|px milliseconds|exat timestamp|pxat milliseconds-timestamp|persist]`
* 作用：获取指定的 key 值，并且获取后可以对当前 key 设置超时时间或者清除超时时间

#### getdel

* 语法：`getdel key`
* 作用：先获取到指定的 key 后，再删除获取的那个 key，最终返回被删除的值

### 不常用

```bash
# 语法：setex key seconds value
# 作用：将键 key 的值设置为 value ，并将键 key 的过期时间设置为 seconds 秒钟，如果 key 存在则覆盖原有值
# 示例：设置key为name，并且设置60秒过期时间
127.0.0.1:6379> setex name 60 zhangsan

# 语法：psetex key milliseconds value
# 作用：将键 key 的值设置为 value ，并将键 key 的过期时间设置为 milliseconds 毫秒，如果 key 存在则覆盖原有值
# 示例：设置 key 为 name，并且设置 70 秒过期时间
127.0.0.1:6379> psetex name 70000 zhangsan

# 语法：msetnx key value [key value ...]
# 作用：当且仅当所有给定键都不存在时，为所有给定键设置值（如果添加的其中键在当前数据库存在则都不成功）
# msetnx 是一个原子性（atomic）操作，所有给定键要么就全部都被设置，要么就全部都不设置
# 示例：设置 name 和 age 两个键值
127.0.0.1:6379> msetnx name zhangsan age 22

# 语法：incr key
# 作用：将 key 中储存的数字值增一，并返回增加后的值（只能用在整型，字符串啥的会报错）

# 语法：incrby key increment
# 作用：将key中储存的数字值增加指定步长increment，并返回增加后的值（只能用在整型，字符串啥的会报错）

# 语法：incrbyfloat key increment
# 作用：将key中储存的数字值增加指定步长increment，并返回增加后的值（只能用在浮点型，字符串啥的会报错）
# 示例：对 salary 添加步长 333.33
127.0.0.1:6379> incrbyfloat salary 333.33

# 语法：decr key
# 语法：将key中储存的数字值减一，并返回减后的值（只能用在整型，字符串啥的会报错）

# 语法：decrby key decrement
# 作用：将 key 中储存的数字值减指定步长 increment，并返回减后的值（只能用在整型，字符串啥的会报错）
```

## Hash（哈希表）类型命令

```bash
# 语法：hset key field value [field value ...]
# 作用：用于为存储在 key 中的哈希表的 field 字段赋值 value
# 示例：设置 key 为 student 但里面存储着 name 和 age 字段
127.0.0.1:6379> hset student name zhangsan age 22

# 语法：hsetnx key field value
# 作用：用于为存储在 key 中的哈希表的 field 字段赋值 value；如果当前 field 存在则添加失败（不可覆盖添加）

# 语法：hget key field
# 作用：用于返回哈希表中指定字段field的值
# 示例：获取哈希表里的 field 字段
127.0.0.1:6379> hget student name

# 语法：hmget key field [field ...]
# 作用：用于返回哈希表中指定字段 field 的值；但是可以一次性返回多个 field 值
# 示例：获取哈希表里的field多个字段
127.0.0.1:6379> hmget student name age

# 语法：hdel key field [field ...]
# 作用：用于删除哈希表 key 中的一个或多个指定字段，不存在的字段将被忽略。如果 key 不存在，会被当作空哈希表处理并返回 0
# 示例：删除哈希表中 key 为 student 里的 name 字段
127.0.0.1:6379> hdel student name

# 语法：hexists key field
# 作用：用于查看哈希表的指定字段 field 是否存在，1 存在，0 不存在
# 示例：查看哈希表中 key 为 student 里的 name 字段是否存在
127.0.0.1:6379> hexists student name

# 语法：hgetall key
# 作用：用于返回存储在 key 中的哈希表中所有的 field 和 value

# 语法：hkeys key
# 作用：返回存储在 key 中哈希表的所有 field

# 语法：hvals key
# 作用：返回存储在 key 中哈希表的所有 value

# 语法：hincrby key field increment
# 作用：为哈希表 key 中的 field 的值加上指定的增量，并返回增量后的值（增量正数累加，增量负数递减）
# 该命令只可操作整数类型，而字符串，浮点类型等会报错
# 示例1：对年龄累加
127.0.0.1:6379> hincrby student age 2
# 示例2：对年龄递减
127.0.0.1:6379> hincrby student age -28


# 语法：hincrbyfloat key field increment
# 作用：为哈希表 key 中的 field 的值加上指定的增量，并返回增量后的值（增量正数累加，增量负数递减）
# 该命令只可操作整数类型、浮点类型，而操作字符串会报错
# 示例1：对工资累加
127.0.0.1:6379> hincrby student salary 300.3
# 示例2：对工资递减
127.0.0.1:6379> hincrby student salary -432.84

# 语法：hstrlen key field
# 作用：返回存储在 key 中给定 field 相关联的值的字符串长度（string length）

# 语法：hlen key
# 作用：用于获取哈希表中字段（fields）的数量
```

## List（集合）类型命令

```bash
# 语法：lpush key element [element ...]
# 说明：将一个或多个值插入到集合 key 的头部（头插法），如果当前 key 不存在则创建新的
# 示例1：插入的这个案例数据，下面的语法会用到
127.0.0.1:6379> lpush listNumber 8.4 13 14 10.5 4 19.6 10 14 5.2 10 3 2.5 7 4.7 10 11.2 8 2.2 15.7 20.9
# 示例2：插入的这个案例数据，下面的语法会用到
127.0.0.1:6379> lpush listString  remini Momen Pledg Memo Tende Biode Revie silen Romanti AusL SimplPromis Romanti Bautifu smil Initiall sunse lemo firs Chaffere

# 语法：lpushx key element [element ...]
# 说明：往集合左边插入一个元素；若集合 key 不存在无法插入

# 语法：rpush key element [element ...]
# 说明：将一个或多个值插入到集合 key 的尾部（尾插法），如果当前 key 不存在则创建新的

# 语法：rpushx key element [element ...]
# 说明：往集合右边插入一个元素，若集合key不存在无法插入

# 语法：lpop key [count]
# 说明：从集合左边（头部）弹出（删除）指定的count个元素删除
# 示例：从集合左边弹出两个元素删除
127.0.0.1:6379> lpop listString 2

# 语法：rpop key [count]
# 说明：从集合右边（尾部部）弹出（删除）指定的 count 个元素删除

# 语法：blpop key [key ...] timeout
# 说明：移出并获取集合头部第一个元素，如果集合没有元素会阻塞集合直到等待超时或发现可弹出元素为止，它是 lpop 的阻塞版
# key：如果当前 key 不存在或者 key 内部没元素，则一直阻塞等待，等待其它客户端创建此 key 和元素，会立马弹出。但是超出延迟时间的话还没有弹出元素则会在最后弹出（nil）
# [key ...]：设置多个 key 时，如果第一个 key 不存在则会考虑弹出第二个 key，第三个 key....，如果每个 key 都不存在或没元素，则当前客户端会进入一个阻塞状态，直到有元素弹出，或者自动超时弹出（nil）
# 示例：设置两个 key，其中 listString 为空，会自动去找 mylist 集合，发现存在元素，并立刻弹出
127.0.0.1:6379> blpop listA mylist 480
1) "mylist"
2) "remini"

# 语法：brpop key [key ...] timeout
# 说明：移出并获取集合尾部第一个元素，如果集合没有元素会阻塞集合直到等待超时或发现可弹出元素为止，它是 lpop 的阻塞版

# 语法：llen key
# 说明：获取到集合里元素的总个数

# 语法：lrange key start stop
# 说明：查询集合元素，并设置查询区间
# start：起始值，设置正数则从左往右，设置负数则从右往左开始
# stop：终点值，设置正数则从左往右，设置负数则从右往左开始
# 注：start（0） stop（-1）代表查询全部
# 示例1：起点从尾部往前数 5 个，终点从尾部往前数 3 个，最终显示 -5，-4，-3 这三个元素
127.0.0.1:6379> lrange listString -5 -3
# 示例2：起点从尾部往前数 5 个，终点从尾部往前数 8 个，最终显示(empty array)
127.0.0.1:6379> lrange listString -5 -8

# 语法：lindex key index
# 说明：返回集合 key 里索引 index 位置存储的元素，0~n 从左往右索引、-1~-n 从右往左索引
# 示例：获取集合 listString 里的最后一个索引的元素
127.0.0.1:6379> lindex listString -1

# 语法：lrem key count element
# 说明：从集合 key 中删除前 count 个值等于 element 的元素
# count > 0: 从头到尾删除值为 value 的元素
# count < 0: 从尾到头删除值为 value 的元素
# count = 0: 移除所有值为 value 的元素
# 示例：移除集合 listString 中的 Romanti 元素，删除个数 -2（代表从尾部查找并删除两个），并返回删除成功个数
127.0.0.1:6379> lrem listString -2 Romanti

# 语法：lset key index element
# 说明：设置集合 key 中 index 位置的元素值为新的 element，index 为正数则从头到位索引，为负数从尾到头索引查询
# 示例：修改集合 listString 中索引为 2 的元素为 yyds
127.0.0.1:6379> lset listString 2 yyds

# 语法：linsert key before|after pivot element
# 说明：把 element 元素插入到指定集合 key 里，但是还要以 pivot 内部的一个元素为基准，看是插到这个元素的左边还是右边
# before|after：插入元素的前后位置选项
# pivot：集合里的参考元素
# element：待插入的元素
# 注：当集合 key 不存在时，这个 list 会被看作是空 list，什么都不执行
# 注：当集合 key 存在，值不是列表类型时，返回错误
# 注：当给定的参考元素 pivot 不存在是则返回 -1，因为程序不知道往哪插入
# 示例：把 niuniu 插入到 listString 集合里，插入参考 Romanti 元素的后面
127.0.0.1:6379> linsert listString after Romanti niuniu

# 语法：lpos key element [rank rank] [count num-matches] [maxlen len]
# 说明：返回集合 key 中匹配给定 element 成员的索引
# key：要查询的集合 key
# element：要查询索引的元素
# [rank rank]：选择匹配上的第几个元素，若超出集合指定元素的个数则返回(nil)
# [count num-matches]：返回匹配上元素的索引个数，默认返回1个
# [maxlen len]：告知lpos命令查询集合的前len个元素，限制查询个数
# 示例1：查询集合 listString 里的 Romanti 出现的索引位置（0 开始索引）
127.0.0.1:6379> lpos listString Romanti
# 示例2：查询 Romanti 元素的第二个索引位置
127.0.0.1:6379> lpos listString Romanti rank 2
# 示例3：查询 Romanti 索引的三条记录
127.0.0.1:6379> lpos listString Romanti rank 1 count 3
# 示例4：限制查询下标为 0~20
127.0.0.1:6379> lpos listString Romanti rank 1 count 3 maxlen 20

# 语法：lmove source destination left|right left|right
# 说明：用于原子地从 source 集合左边或者右边弹出一个元素，添加到 destination 新集合里的左边或右边
# source：源集合
# destination：目标集合
# left|right left|right：
# 第一个：代表从源集合的左边或者右边弹出元素
# 第二个：代表从目标集合的左边或者右边添加
# 示例：从 listString 源集合的左边弹出个元素，添加到 mylist 目标集合的右边
127.0.0.1:6379> lmove listString mylist left right

# 语法：blmove source destination left|right left|right timeout
# 说明：用于原子地从 source 集合左边或者右边弹出一个元素，添加到 destination 新集合里的左边或右边，但是它时 lmove 的阻塞版本
# 示例：从集合 listString 左边弹出一个元素放到目标集合 mylist 的尾部，但是存在 60 秒的超时时间，超过 60 秒没有弹出元素则自动失败，返回(nil)
127.0.0.1:6379> blmove listString mylist left right 60
```

## SortedSet（有序集合）类型命令



## 参考文档

* [官方文档](https://redis.io/commands/)

（完）
