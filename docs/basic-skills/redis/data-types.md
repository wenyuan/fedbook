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

## 总结

| 类型               | 简介                                          | 特性                                                                                     | 场景                                                                        |
|:-----------------|:--------------------------------------------|:---------------------------------------------------------------------------------------|:--------------------------------------------------------------------------|
| String（字符串）      | 二进制安全                                       | 可以包含任何数据，比如 jpg 图片或者序<br>列化的对象，一个键最大能存储 512M                                           | ---                                                                       |
| Hash（字典）         | 键值对集合，<br>即编程语言中的 Map 类型                    | 适合存储对象，并且可以像数据库中 <br>update 一个属性一样只修改某一项属性值（Memcached 中需要取出整个字符串<br>反序列化成对象修改完再序列化存回去） | 存储、读取、修改用户属性                                                              |
| List（列表）         | 链表（双向链表）                                    | 增删快，提供了操作某一段元素的 API                                                                    | 1. 最新消息排行等功能<br>（比如朋友圈的时间线）<br>2. 消息队列                                    |
| Set（集合）          | 哈希表实现，元素不重复                                 | 1. 添加、删除、查找的复杂度都是 O(1) <br>2. 为集合提供了求交集、并集、差集等操作                                       | 1. 共同好友<br>2. 利用唯一性，统计访问网站<br>的所有独立 ip<br>3. 好友推荐时，根据 tag 求交集，大于某个阈值就可以推荐 |
| Sorted Set（有序集合） | 将 Set 中的元素增加一<br>个权重参数 score，元素按 score 有序排列 | 数据插入集合时，已经进行天然排序                                                                       | 1. 排行榜<br>2. 带权重的消息队列                                                     |

（完）
