# 集群管理 API

## 前言

Cerebro 为我们提供了简单的集群管理功能，这些监控、管理的功能本质上也都是通过 ES 提供的 API 来实现的。

## cat APIs

`_cat` APIs 提供查看集群相关信息的同时，其特别之处在于它返回的结果不是 JSON，而是非常适合人类阅读的格式。

当使用 `_cat` 时其后面不跟任何子节点，返回结果是各个 API 的目录（URL），在忘记有啥接口的时候这个功能非常好用：

```bash
# 使用 _cat API 获取所有可用的目录
GET /_cat/

# 结果
/_cat/allocation
/_cat/shards
/_cat/shards/{index}
/_cat/master
/_cat/nodes
/_cat/tasks
/_cat/indices
/_cat/indices/{index}
/_cat/segments
/_cat/segments/{index}
/_cat/count
/_cat/count/{index}
......
```

上述这些 API 都可以加入下面几个参数：

* **v 参数**：每个命令都可以使用 v 参数来打印详细信息。如：`GET /_cat/nodes?v`。
* **h 参数**：使用 h 参数可以强制只显示某些列。如：`GET /_cat/nodes?h=node.role,port,name`。
* **help 参数**：使用 help 参数可以输出这个接口可用的列名和其解析。如：`GET /_cat/master?help`。

### 查看索引文档总数和整个集群文档总数

```bash
# 获取索引 books 的文档总数
GET /_cat/count/books?v

# 获取整个集群所有索引的文档总数
GET /_cat/count?v
```

### 查看集群健康状态

```bash
# 查看集群健康状态
GET /_cat/health?v
GET /_cat/health?v&ts=false
```

`ts=false` 的参数是返回结果中去除时间戳。

### 查看磁盘使用情况

```bash
# 获取各个节点磁盘的使用情况
GET /_cat/allocation?v
```

更多的关于 `_cat` APIs 的使用示例，可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/cat.html)。

## 集群管理 API

集群管理的 API 提供了获取或者更改集群信息的功能，例如集群节点过滤、查看集群信息、查看节点信息、更新集群设置、重置路由等。

### 集群节点过滤

```bash
# 获取所有节点
GET /_nodes/_all
```

除了 `_all` 外，ES 支持的节点过滤器有如下几个：

* **`_all`**：列出所有节点。
* **`_local`**：列出本地节点。
* **`_master`**：列出主节点
* **IP 或者主机名字**：列出指定 IP 或者主机名字的节点。
* **节点 ID 或者名称**：列出指定 ID 或者名称的节点。
* **`*`**：IP、主机名字、节点 ID、名称都可以包括通配符。
* **`master:true/false`**：列出主节点 / 不列出主节点。 
* **`data:true/false`**：列出数据节点 / 不列出数据节点。 
* **`ingest:true/false`**：列出索引预处理节点 / 不列出索引预处理节点。 
* **`coordinating_only:true/false`**：列出协调节点 / 不列出协调节点。

比如：

```bash
# 节点类型过滤：过滤出 master、data、ingest、coordinating 节点的信息
GET /_nodes/master:true,data:true,ingest:true,coordinating:true
```

如果只想返回某个节选部分的结果，可以使用以下示例：

```bash
# 列出 process 节选信息
GET /_nodes/master:true,data:true,ingest:true,coordinating:true/process
```

更多的使用示例你可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/cluster-nodes-info.html)。

### 查看集群信息

可以使用集群信息查看的接口**查看集群健康状态、集群状态、集群统计信息、集群的设置**等，示例如下：

```bash
# 查看集群健康状态
GET /_cluster/health

# 查看集群状态
GET /_cluster/state

# 查看集群统计信息
GET /_cluster/stats?human&pretty

# 查看集群的设置
GET /_cluster/settings?include_defaults=true
```

### 查看节点信息

查看节点信息的 API 比较简单，示例如下：

```bash
# 获取节点信息的请求格式
GET /_nodes
GET /_nodes/<node_id>
GET /_nodes/<metric>
GET /_nodes/<node_id>/<metric>

# 获取节点信息的示例
GET /_nodes
GET /_nodes/node_id1,node_id2       # 获取 node_id1 和 node_id2 的信息
GET /_nodes/stats 
GET /_nodes/node_id1,node_id2/stats # 获取 node_id1 和 node_id2 的统计信息
```

其中 metric 可以指定获取结果中的每个部分，其选项比较多，参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/cluster-nodes-info.html)。

### 更新集群设置

更新集群设置的示例如下：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "indices.recovery.max_bytes_per_sec": "100m"
  }
}
```

如上示例，我们设置了集群恢复时的吞吐量，其默认值为 0 的时候为无限制。

### 重置路由

reroute API 可以允许用户手动修改集群中分片的分配情况。使用 reroute API 可以将一个分片从某个节点移到另一个节点，也可以将未分配的分片指定分配到某个节点。

官方的示例：

```bash
POST /_cluster/reroute
{
  "commands": [
    {
      "move": {
        "index": "test", "shard": 0,
        "from_node": "node1", "to_node": "node2"
      }
    },
    {
      "allocate_replica": {
        "index": "test", "shard": 1,
        "node": "node3"
      }
    }
  ]
}
```

如上示例，使用 `"move"` 指令，将索引 `"test"` 的分片 0 从节点 `"node1"` 移动到了 `"node2"`。使用 `"allocate_replica"` 指令将 `"test"` 索引未分配的分片 1 的副本分配到节点 `"node3"`。

需要注意的是，在执行了任何路由重置指令后， ES 将会执行重新平衡数据的操作来保持平衡状态，但是这个操作受 [cluster.routing.rebalance.enable](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/modules-cluster.html#cluster-shard-allocation-settings)（是否允许重新平衡）设置值的影响。

reroute API 在 ES 集群运维的时候经常用到，更详细的使用示例可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/cluster-reroute.html)。

## 参考资料

* [Cluster APIs](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/cluster.html)

（完）
