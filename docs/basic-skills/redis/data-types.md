# Redis 数据类型

Redis 支持 5 种数据类型：string（字符串），hash（哈希），list（列表），set（集合）及 zset（sorted set：有序集合）。

## String

最简单的数据存储类型。一个存储空间只保存一个数据，若字符串是数字按照数字处理。Redis 所有的操作是原子性的，采用单线程处理所有的业务，命令是一个一个执行的，因此无需考虑高并发带来的数据影响。

> 原子性：指一个操作序列就像一个操作一样不可分割，要么完整的被执行，要么完全不执行（银行转账：A 帐户成功扣款必然 B 账户成功入款，否则两个账户都回归原始状态）。

最大存储量：512MB

### 常用操作

```bash
set key value        # 赋值
get key              # 获取指定 key 的 value
del key              # 删除指定 key
incr key             # 给指定 key 的值加一
decr key             # 给指定的 key 的值减一
incrby key increment # 给指定的 key 的值加 increment
decrby key decrement # 给指定的 key 的值减 decrement
```

### 适用场景

#### 1）投票的有效时长

可以指定数据的生命周期，来控制数据是什么时候失效，用过数据失效控制对应的业务行为，适用于具有时效性限定控制操作。

```bash
setnx key seconds value  # 设置 key 对应 value 值的有效时长是 seconds
```

#### 2）大 V 用户信息的数据存储情况：粉丝数、博文数等

增加一个关注的粉丝，使用 `incr` 直接增加：

```bash
set user:id:12:fans 34
incr user:id:12:fans
```

Redis 用于各种数据结构和非结构高热度数据流访问。

这里说明一下数据库中热点数据 key 命名惯例：使用 `:` 分割数据层次：

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="441" height="91" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25,25)"><path id="SvgjsPath1009" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="120px" fill="#f44336" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-14" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="20" x="60"><tspan id="SvgjsTspan1013" style="text-decoration:;">表名:</tspan></tspan><tspan id="SvgjsTspan1014" dy="20" x="60"><tspan id="SvgjsTspan1015" style="text-decoration:;"> </tspan></tspan><tspan id="SvgjsTspan1016" dy="20" x="60"><tspan id="SvgjsTspan1017" style="text-decoration:;">news:</tspan></tspan></text></g></g><g id="SvgjsG1018" transform="translate(115,25)"><path id="SvgjsPath1019" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1020"><text id="SvgjsText1021" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="120px" fill="#ff9800" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-14" transform="rotate(0)"><tspan id="SvgjsTspan1022" dy="20" x="60"><tspan id="SvgjsTspan1023" style="text-decoration:;">主键名:</tspan></tspan><tspan id="SvgjsTspan1024" dy="20" x="60"><tspan id="SvgjsTspan1025" style="text-decoration:;"> </tspan></tspan><tspan id="SvgjsTspan1026" dy="20" x="60"><tspan id="SvgjsTspan1027" style="text-decoration:;">id:</tspan></tspan></text></g></g><g id="SvgjsG1028" transform="translate(205.5,25)"><path id="SvgjsPath1029" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1030"><text id="SvgjsText1031" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="120px" fill="#2196f3" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-14" transform="rotate(0)"><tspan id="SvgjsTspan1032" dy="20" x="60"><tspan id="SvgjsTspan1033" style="text-decoration:;">主键值:</tspan></tspan><tspan id="SvgjsTspan1034" dy="20" x="60"><tspan id="SvgjsTspan1035" style="text-decoration:;"> </tspan></tspan><tspan id="SvgjsTspan1036" dy="20" x="60"><tspan id="SvgjsTspan1037" style="text-decoration:;">202202:</tspan></tspan></text></g></g><g id="SvgjsG1038" transform="translate(296,25)"><path id="SvgjsPath1039" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1040"><text id="SvgjsText1041" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="120px" fill="#4caf50" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-14" transform="rotate(0)"><tspan id="SvgjsTspan1042" dy="20" x="60"><tspan id="SvgjsTspan1043" style="text-decoration:;">字段名:</tspan></tspan><tspan id="SvgjsTspan1044" dy="20" x="60"><tspan id="SvgjsTspan1045" style="text-decoration:;"> </tspan></tspan><tspan id="SvgjsTspan1046" dy="20" x="60"><tspan id="SvgjsTspan1047" style="text-decoration:;">title:</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（热点数据 key 命名惯例）</p>
</div>

#### 3）分布式锁

## Hash

对存储的数据进行编组，典型的应用存储对象信息。一个存储空间可以保存多个键值对数据。底层是 hash 表的实现。

<div style="text-align: center;">
  <svg id="SvgjsSvg1007" width="414" height="222" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1020" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1021" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1008" transform="translate(25,95)"><path id="SvgjsPath1009" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(251,192,45,1)" stroke-width="2" fill-opacity="1" fill="#fff9c4"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="16" x="40.5"><tspan id="SvgjsTspan1013" style="text-decoration:;">key</tspan></tspan></text></g></g><g id="SvgjsG1014" transform="translate(153,25)"><path id="SvgjsPath1015" d="M 0 4Q 0 0 4 0L 232 0Q 236 0 236 4L 236 168Q 236 172 232 172L 4 172Q 0 172 0 168Z" stroke-dasharray="10,6" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="216px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="75.375" transform="rotate(0)"></text></g></g><g id="SvgjsG1018"><path id="SvgjsPath1019" d="M107 111L129.5 111L129.5 111L149.39999999999998 111" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1020)"></path></g><g id="SvgjsG1022" transform="translate(180,44)"><path id="SvgjsPath1023" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(33,150,243,1)" stroke-width="2" fill-opacity="1" fill="#c9e2f7"></path><g id="SvgjsG1024"><text id="SvgjsText1025" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1026" dy="16" x="40.5"><tspan id="SvgjsTspan1027" style="text-decoration:;">field1</tspan></tspan></text></g></g><g id="SvgjsG1028" transform="translate(284,44)"><path id="SvgjsPath1029" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(33,150,243,1)" stroke-width="2" fill-opacity="1" fill="#c9e2f7"></path><g id="SvgjsG1030"><text id="SvgjsText1031" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1032" dy="16" x="40.5"><tspan id="SvgjsTspan1033" style="text-decoration:;">value1</tspan></tspan></text></g></g><g id="SvgjsG1034" transform="translate(180,95)"><path id="SvgjsPath1035" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(76,175,80,1)" stroke-width="2" fill-opacity="1" fill="#d8f0d8"></path><g id="SvgjsG1036"><text id="SvgjsText1037" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1038" dy="16" x="40.5"><tspan id="SvgjsTspan1039" style="text-decoration:;">field2</tspan></tspan></text></g></g><g id="SvgjsG1040" transform="translate(284,95)"><path id="SvgjsPath1041" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(76,175,80,1)" stroke-width="2" fill-opacity="1" fill="#d8f0d8"></path><g id="SvgjsG1042"><text id="SvgjsText1043" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1044" dy="16" x="40.5"><tspan id="SvgjsTspan1045" style="text-decoration:;">value2</tspan></tspan></text></g></g><g id="SvgjsG1046" transform="translate(180,146)"><path id="SvgjsPath1047" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(156,39,176,1)" stroke-width="2" fill-opacity="1" fill="#f5dafa"></path><g id="SvgjsG1048"><text id="SvgjsText1049" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1050" dy="16" x="40.5"><tspan id="SvgjsTspan1051" style="text-decoration:;">field3</tspan></tspan></text></g></g><g id="SvgjsG1052" transform="translate(284,146)"><path id="SvgjsPath1053" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(156,39,176,1)" stroke-width="2" fill-opacity="1" fill="#f5dafa"></path><g id="SvgjsG1054"><text id="SvgjsText1055" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1056" dy="16" x="40.5"><tspan id="SvgjsTspan1057" style="text-decoration:;">value3</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（Hash 存储结构）</p>
</div>

value 值只存储字符串，每个 hash 可以存储 2^32^-1 个键值对。

### 常用操作

```bash
hset key field value   # 为指定的 key 设置一个含有 field、value 的值
hmset key field1 value1 field2 value2 # 给指定的 key 设置多个含有 field、value 的值
hget key field         # 获取指定 key、field 的值
hmget key field field2 # 获取多个 key、field 的值
hgetall key            # 获取 key 下所有 field 的值，若内部 field 过多，遍历整体数据效率会很耗时
hdel key field1 field2 # 删除指定 key 下指定 field 的值（可以单个或者多个）
hdel key               # 删除指定 key 下所有 field 的值
hexists key field      # 查看指定 key 的 field 是否存在
hlen key               # 查看指定 key 下 field 的个数
hkeys key              # 获取指定 key 下所有的 field
hvals key              # 获取指定 key 下所有的 value
```

### 适用场景

#### 1）电商网站购物车

购物车信息，可以容易增删改查，管理数量等。

#### 2）商家信息管理

应用于抢购，发放消费券（发完为止）等数据存储设计。

## List

存储多个数据，对数据进入存储空间的顺序要进行区分。数据主要要体现顺序，底层使用双向链表实现。

list 保存的数据都是 string 类型的，最多有 2^32^-1 个数据。list 有索引的概念。

### 常用操作

```bash
# 给指定的 key 从头部开始添加 value，如果 key 不存在则会自动创建
lpush key value1 value2
# 给指定的 key 从尾部开始添加 value，如果 key 不存在同样自动创建
rpush key value1 value2

# 获取指定 key 从开始位置到结束位置的值，从 0 开始 -1 为最后一位
lrange key 0 -1

# 将指定 key 头部的值弹出，如果 key 不存在返回 nil，如果存在返回头部元素
lpop key
# 将指定 key 尾部的值弹出，如果 key 不存在返回 nil，如果存在返回尾部元素
rpop key

# 获取指定 key 链表的长度，如果 key 不存在返回 0
llen key

# 给指定 key 从头部开始添加 value，只有 key 存在才能添加，不存在返回 0，并且只能添加一个值
lpushx key value
# 给指定 key 从尾部开始添加 value，同上
rpushx key value

# 删除指定 key 的指定值
# 如果 index 大于 0 则删除 index 位置上与 value 相等的值
# 小于 0 则从尾部开始
# 等于 0 则删除链表中所有与 value 相等的值
lrem key index value
# 给指定位置上的 value 修改为指定值，如果角标不存在则报错（(error) ERR index out of range）
lset key index value

# 给指定 key 链表中指定 value 前添加一个新 value，从头开始
linsert key before value newValue
# 给指定 key 链表中指定 value 前添加一个新 value，从尾开始
linsert key after value newValue

# 将指定 key 的尾部元素弹出压入 key2 的头部，如果两个 key 相同，则在同一个链表中执行尾弹头压的操作
rpoplpush key key2
```

### 适用场景

#### 1）朋友圈点赞，按照点赞顺序显示好友

应用于具有操作先后顺序的数据控制。

#### 2）分页操作

通常第一页信息来自 list，其他页信息来自数据库进行加载。

## Set

存储大量数据，在查询方面提供更好的查询效率。与 hash 的存储结构相同，不同的是，只存储 field 值，不存储 value 值。Set 不允许数据重复，也不能启动 value 功能。

<div style="text-align: center;">
  <svg id="SvgjsSvg1058" width="414" height="222" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1059"><marker id="SvgjsMarker1072" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1073" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1060" transform="translate(25.000015258789062,94.99999237060547)"><path id="SvgjsPath1061" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(251,192,45,1)" stroke-width="2" fill-opacity="1" fill="#fff9c4"></path><g id="SvgjsG1062"><text id="SvgjsText1063" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1064" dy="16" x="40.5"><tspan id="SvgjsTspan1065" style="text-decoration:;">key</tspan></tspan></text></g></g><g id="SvgjsG1066" transform="translate(153.00001525878906,24.99999237060547)"><path id="SvgjsPath1067" d="M 0 4Q 0 0 4 0L 232 0Q 236 0 236 4L 236 168Q 236 172 232 172L 4 172Q 0 172 0 168Z" stroke-dasharray="10,6" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1068"><text id="SvgjsText1069" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="216px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="75.375" transform="rotate(0)"></text></g></g><g id="SvgjsG1070"><path id="SvgjsPath1071" d="M107.00001525878906 110.99999237060547L129.50001525878906 110.99999237060547L129.50001525878906 110.99999237060547L149.40001525878904 110.99999237060547" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1072)"></path></g><g id="SvgjsG1074" transform="translate(180.00001525878906,43.99999237060547)"><path id="SvgjsPath1075" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(33,150,243,1)" stroke-width="2" fill-opacity="1" fill="#c9e2f7"></path><g id="SvgjsG1076"><text id="SvgjsText1077" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1078" dy="16" x="40.5"><tspan id="SvgjsTspan1079" style="text-decoration:;">field1</tspan></tspan></text></g></g><g id="SvgjsG1080" transform="translate(284.00001525878906,43.99999237060547)"><path id="SvgjsPath1081" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(33,150,243,1)" stroke-width="2" fill-opacity="1" fill="#c9e2f7"></path><g id="SvgjsG1082"><text id="SvgjsText1083" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1084" dy="16" x="40.5"><tspan id="SvgjsTspan1085" style="text-decoration:;">nil</tspan></tspan></text></g></g><g id="SvgjsG1086" transform="translate(180.00001525878906,94.99999237060547)"><path id="SvgjsPath1087" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(76,175,80,1)" stroke-width="2" fill-opacity="1" fill="#d8f0d8"></path><g id="SvgjsG1088"><text id="SvgjsText1089" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1090" dy="16" x="40.5"><tspan id="SvgjsTspan1091" style="text-decoration:;">field2</tspan></tspan></text></g></g><g id="SvgjsG1092" transform="translate(284.00001525878906,94.99999237060547)"><path id="SvgjsPath1093" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(76,175,80,1)" stroke-width="2" fill-opacity="1" fill="#d8f0d8"></path><g id="SvgjsG1094"><text id="SvgjsText1095" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1096" dy="16" x="40.5"><tspan id="SvgjsTspan1097" style="text-decoration:;">nil</tspan></tspan></text></g></g><g id="SvgjsG1098" transform="translate(180.00001525878906,145.99999237060547)"><path id="SvgjsPath1099" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(156,39,176,1)" stroke-width="2" fill-opacity="1" fill="#f5dafa"></path><g id="SvgjsG1100"><text id="SvgjsText1101" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1102" dy="16" x="40.5"><tspan id="SvgjsTspan1103" style="text-decoration:;">field3</tspan></tspan></text></g></g><g id="SvgjsG1104" transform="translate(284.00001525878906,145.99999237060547)"><path id="SvgjsPath1105" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(156,39,176,1)" stroke-width="2" fill-opacity="1" fill="#f5dafa"></path><g id="SvgjsG1106"><text id="SvgjsText1107" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1108" dy="16" x="40.5"><tspan id="SvgjsTspan1109" style="text-decoration:;">nil</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（Set 存储结构）</p>
</div>

### 常用操作

```bash
# 给指定 key 中添加数据，元素不重复
sadd key value1 value2
# 获取指定 key 中的元素
smembers key
# 删除指定 key 中的指定 value
srem key members value1 value2
# 获取某个 key，将该数据移除
spop key

# 判断指定 key 中的指定 value 值是否存在，存在返回 1，不存在返回 0 或者该 key 本身
sismember key value

# 获取 key 自身元素中与 key2 不相同的元素（差集）
sdiff key key2
# 获取 key 与 key2 中相同的元素（交集）
sinter key key2
# 将 key 与 key2 元素合并返回，不包括相同元素（并集）
sunion key key2

# 获取指定 key 中元素的个数
scard key
# 随机获取指定 key 中的一个元素
srandmember key

# 将 key1 与 key2 的差集存储到 key 中
sdiffstore key key1 key2
# 将 key1 与 key2 的交集存储到 key 中
sinterstore key key1 key2
# 将 key1 与 key2 的并集存储到 key 中
sunionstore key key1 key2
```

### 适用场景

#### 1）应用于同类消息的关联搜索

* 显示共同好友/关注（一度）
* 由用户A出发，获取共同好友B的好友列表（一度）
* 由用户A出发，获取共同好友B的购物清单/游戏充值列表（二度）

#### 2）随机推荐类信息检索，例如推荐热点音乐、新闻等

#### 3）不同类型不重复数据的合并操作，如权限配置

#### 4）应用于同类型数据的快速去重，如访问量统计

#### 5）基于黑名单与白名单设定服务控制（利用 set 的去重性）

## Sorted Set

需求：数据排序有利于数据的展示，需要提供一种根据自身特征进行排序。在 set 的基础上添加 score 排序字段。score 不存储数据，只用于排序。

<div style="text-align: center;">
  <svg id="SvgjsSvg1110" width="524" height="243.59999084472656" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1111"><marker id="SvgjsMarker1166" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1167" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1112" transform="translate(25.000015258789062,109.09999084472656)"><path id="SvgjsPath1113" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(251,192,45,1)" stroke-width="2" fill-opacity="1" fill="#fff9c4"></path><g id="SvgjsG1114"><text id="SvgjsText1115" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1116" dy="16" x="40.5"><tspan id="SvgjsTspan1117" style="text-decoration:;">key</tspan></tspan></text></g></g><g id="SvgjsG1118" transform="translate(155.00001525878906,31.599990844726562)"><path id="SvgjsPath1119" d="M 0 4Q 0 0 4 0L 340 0Q 344 0 344 4L 344 183Q 344 187 340 187L 4 187Q 0 187 0 183Z" stroke-dasharray="10,6" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1120"><text id="SvgjsText1121" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="324px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="82.875" transform="rotate(0)"></text></g></g><g id="SvgjsG1122" transform="translate(182.50001525878906,64.99999237060547)"><path id="SvgjsPath1123" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(33,150,243,1)" stroke-width="2" fill-opacity="1" fill="#c9e2f7"></path><g id="SvgjsG1124"><text id="SvgjsText1125" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1126" dy="16" x="40.5"><tspan id="SvgjsTspan1127" style="text-decoration:;">field1</tspan></tspan></text></g></g><g id="SvgjsG1128" transform="translate(286.50001525878906,64.99999237060547)"><path id="SvgjsPath1129" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(33,150,243,1)" stroke-width="2" fill-opacity="1" fill="#c9e2f7"></path><g id="SvgjsG1130"><text id="SvgjsText1131" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1132" dy="16" x="40.5"><tspan id="SvgjsTspan1133" style="text-decoration:;">nil</tspan></tspan></text></g></g><g id="SvgjsG1134" transform="translate(182.50001525878906,115.99999237060547)"><path id="SvgjsPath1135" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(76,175,80,1)" stroke-width="2" fill-opacity="1" fill="#d8f0d8"></path><g id="SvgjsG1136"><text id="SvgjsText1137" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1138" dy="16" x="40.5"><tspan id="SvgjsTspan1139" style="text-decoration:;">field2</tspan></tspan></text></g></g><g id="SvgjsG1140" transform="translate(286.50001525878906,115.99999237060547)"><path id="SvgjsPath1141" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(76,175,80,1)" stroke-width="2" fill-opacity="1" fill="#d8f0d8"></path><g id="SvgjsG1142"><text id="SvgjsText1143" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1144" dy="16" x="40.5"><tspan id="SvgjsTspan1145" style="text-decoration:;">nil</tspan></tspan></text></g></g><g id="SvgjsG1146" transform="translate(182.50001525878906,166.99999237060547)"><path id="SvgjsPath1147" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(156,39,176,1)" stroke-width="2" fill-opacity="1" fill="#f5dafa"></path><g id="SvgjsG1148"><text id="SvgjsText1149" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1150" dy="16" x="40.5"><tspan id="SvgjsTspan1151" style="text-decoration:;">field3</tspan></tspan></text></g></g><g id="SvgjsG1152" transform="translate(286.50001525878906,166.99999237060547)"><path id="SvgjsPath1153" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(156,39,176,1)" stroke-width="2" fill-opacity="1" fill="#f5dafa"></path><g id="SvgjsG1154"><text id="SvgjsText1155" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1156" dy="16" x="40.5"><tspan id="SvgjsTspan1157" style="text-decoration:;">nil</tspan></tspan></text></g></g><g id="SvgjsG1158" transform="translate(390.50001525878906,64.99999237060547)"><path id="SvgjsPath1159" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1160"><text id="SvgjsText1161" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1162" dy="16" x="40.5"><tspan id="SvgjsTspan1163" style="text-decoration:;">23</tspan></tspan></text></g></g><g id="SvgjsG1164"><path id="SvgjsPath1165" d="M107.00001525878906 125.09999084472656L130.50001525878906 125.09999084472656L130.50001525878906 125.09999084472656L151.40001525878904 125.09999084472656" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1166)"></path></g><g id="SvgjsG1168" transform="translate(390.50001525878906,115.99999237060547)"><path id="SvgjsPath1169" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1170"><text id="SvgjsText1171" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1172" dy="16" x="40.5"><tspan id="SvgjsTspan1173" style="text-decoration:;">4</tspan></tspan></text></g></g><g id="SvgjsG1174" transform="translate(390.50001525878906,166.99999237060547)"><path id="SvgjsPath1175" d="M 0 4Q 0 0 4 0L 77 0Q 81 0 81 4L 81 28Q 81 32 77 32L 4 32Q 0 32 0 28Z" stroke-dasharray="10,6" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1176"><text id="SvgjsText1177" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="61px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="5.375" transform="rotate(0)"><tspan id="SvgjsTspan1178" dy="16" x="40.5"><tspan id="SvgjsTspan1179" style="text-decoration:;">57</tspan></tspan></text></g></g><g id="SvgjsG1180" transform="translate(371.00001525878906,24.99999237060547)"><path id="SvgjsPath1181" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1182"><text id="SvgjsText1183" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1184" dy="16" x="60"><tspan id="SvgjsTspan1185" style="text-decoration:;">score</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（Sorted Set 存储结构）</p>
</div>

### 常用操作

```bash
# 将 score name 存储到指定的 key 中
# 如果有相同的 name 则覆盖之前的，返回值为新加入的元素，之前存在的不算
zadd key score name score2 name

# 获取指定 key 中 name 的 score
zscore key name
# 获取指定 key 中成员数量
zcard key
# 删除指定 key 中指定 name、name2 的值，可以指定多个
zrem key name name2

# 获取指定 key 中起始位置到结束位置的元素
# 不加 withscores 则只返回 name，加上将 score 一并返回，从小到大
zrange key start end withscores
# 获取指定 key 中起始位置到结束位置元素以从大到小的顺序返回，包含两端
zrevrange key start end withscores

# 按照指定的排名范围删除元素，排名为分数从小到大，排名从 0 开始
zremrangebyrank key start end
# 按照指定的分数范围删除元素，包含min和max
zremrangebyscore key min max

# 返回指定 key 中指定分数范围的元素从小大
zrangebyscore key min max withscores
# 返回指定 key 中指定分数范围中指定角标范围的元素，start 和 end 是索引
zrangebyscore key min max withscores limit start end

# 将指定 key中指定 name 的元素的分数在原有基础上加 score，并返回增加后的分数
zincrby key score name
# 返回指定 key 中指定分数范围中元素的个数，包括起始和结束
zcount key min max
# 返回指定 key 中指定 name 元素的排名（从小到大），起始位置从 0 开始
zrank key name
# 返回指定 key 中指定 name 元素的排名（从大到小），起始位置从 0 开始
zrevrank key name
```

### 适用场景

#### 1）为所有参与排名的资源建立排序依据。

TOP10（歌曲，电影）。

#### 2）定时任务执行顺序管理或者过期管理。

会员制度（月、季度、年），time 获取系统当前时间。

## 总结

| 类型               | 简介                                          | 特性                                                                                     | 场景                                                                        |
|:-----------------|:--------------------------------------------|:---------------------------------------------------------------------------------------|:--------------------------------------------------------------------------|
| String（字符串）      | 二进制安全                                       | 可以包含任何数据，比如 jpg 图片或者序<br>列化的对象，一个键最大能存储 512M                                           | ---                                                                       |
| Hash（字典）         | 键值对集合，<br>即编程语言中的 Map 类型                    | 适合存储对象，并且可以像数据库中 <br>update 一个属性一样只修改某一项属性值（Memcached 中需要取出整个字符串<br>反序列化成对象修改完再序列化存回去） | 存储、读取、修改用户属性                                                              |
| List（列表）         | 链表（双向链表）                                    | 增删快，提供了操作某一段元素的 API                                                                    | 1. 最新消息排行等功能<br>（比如朋友圈的时间线）<br>2. 消息队列                                    |
| Set（集合）          | 哈希表实现，元素不重复                                 | 1. 添加、删除、查找的复杂度都是 O(1) <br>2. 为集合提供了求交集、并集、差集等操作                                       | 1. 共同好友<br>2. 利用唯一性，统计访问网站<br>的所有独立 ip<br>3. 好友推荐时，根据 tag 求交集，大于某个阈值就可以推荐 |
| Sorted Set（有序集合） | 将 Set 中的元素增加一<br>个权重参数 score，元素按 score 有序排列 | 数据插入集合时，已经进行天然排序                                                                       | 1. 排行榜<br>2. 带权重的消息队列                                                     |

（完）
