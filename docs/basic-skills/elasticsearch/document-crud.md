# 文档的基本操作

> 在 Kibana 的 Dev Tools 中，以在线书店业务为例，展示 DSL 语法。

## 索引管理

文档是存在于索引里面的，所以要先创建一个索引并定义其 Mapping（就像使用 MySQL 数据库插入数据前，肯定要先创建表）。

现在定义如下 Mapping，并且创建索引（主要字段：书本的 ID、名字、作者、简介）：

```bash
# 创建 books 索引
PUT books
{
  "mappings": {
    "properties": {
        "book_id": {
          "type": "keyword"
        },
        "name": {
          "type": "text"
        },
        "author": {
          "type": "keyword"
        },
        "intro": {
          "type": "text"
        }
      }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# 返回结果
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "books"
}
```

上述操作创建了 books 索引，它包含 `book_id`（书本 ID）、`name`（书本名字）、`author`（作者）、`intro`（简介）四个字段。其中 books 索引还有 3 个分片和 1 个副本备份。

如果之前已经创建过 books 索引的话，这里再次创建会报错，此时需要先将之前的索引删除，然后再重新创建。在 Kibana 执行以下示例可以删除索引：

```bash
# 删除索引 books
DELETE books

# 返回结果
{
  "acknowledged" : true
}
```

## 新建文档

ES 提供了两种创建文档的方式，一种是使用 Index API 索引文档，一种是使用 Create API 创建文档。

### 使用 Index API 索引文档

```bash
# 使用 Index API 索引文档
PUT books/_doc/1
{
  "book_id": "4ee82462",
  "name": "深入Linux内核架构",
  "author": "Wolfgang Mauerer",
  "intro": "内容全面深入，领略linux内核的无限风光。"
}

# 结果
{
  "_index" : "books",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

索引一个文档比较简单，将 Mapping 中对应的字段做成 Json Object 对应的 Key 即可，并且上面的例子中我们指定文档 ID 为 1。需要说明的是，在 ES 7.0 版本后 `type` 统一为 `_doc`。

如果索引的文档已经存在，比如在不改变文档 ID 的情况下多次执行上面的索引文档的语句，系统并不会报错，而是将返回结果中 "`_version`" 字段的值自加。

那是因为在索引一个文档的时候，如果文档 ID 已经存在，会先删除旧文档，然后再写入新文档的内容，并且增加文档版本号。

### 使用 Create API 创建文档

使用 Create API 创建文档有两种写法：PUT 和 POST 方式，其示例分别如下：

使用 PUT 的方式创建文档需要指定文档的 ID，如果文档 ID 已经存在，则返回 http 状态码为 409 的错误

```bash
# 使用 PUT 的方式创建文档
PUT books/_create/2
{
  "book_id": "4ee82463",
  "name": "时间简史",
  "author": "史蒂芬霍金",
  "intro": "探索时间和空间核心秘密的引人入胜的故事。"
}

# PUT 方式返回的结果
{
  "_index" : "books",
  "_type" : "_doc",
  "_id" : "2",
  "_version" : 1
  ......
}
```

使用 POST 的方式创建文档时候，则不需要指定文档 ID，系统会自动创建。

```bash
# 使用 POST 的方式，不需要指定文档 ID，系统自动生成
POST books/_doc
{
  "book_id": "4ee82464",
  "name": "时间简史（插画版）",
  "author": "史蒂芬霍金",
  "intro": "用精美的插画带你探索时间和空间的核心秘密"
}

# POST 方式返回的结果
{
  "_index" : "books",
  "_type" : "_doc",
  "_id" : "LfwVtH0BxOuNtEd4yM4F",
  "_version" : 1
  ......
}
```

### 总结三种创建文档方式

| 序号  | 语句                    | 特性描述                                                           |
|:----|:----------------------|:---------------------------------------------------------------|
| 1   | `PUT books/_doc/1`    | 使用 Index API 索引文档，如果文档存在，会先删除然后再写入，即有覆盖原内容的功能。                 |
| 2   | `PUT books/_create/2` | Create API 中使用 PUT 的方式创建文档，需要指定文档 ID。如果文档已经存在，则返回 http 409 错误。 |
| 3   | `POST books/_doc`     | Create API 中使用 POST 的方式，不需要指定文档 ID， 系统自动生成。                    |

* 如果有更新文档内容的需求，应该使用第一种方式。
* 如果写入文档时有唯一性校验需求的话，应该使用第二种方式。
* 如果需要系统为你创建文档 ID，应该使用第三种方式。

相对于第一种方式来说，第三种方式写入的效率会更高，因为不需要在库里查询文档是否已经存在，并且进行后续的删除工作。

## 获取文档

可以使用 ES 提供的 GET API 来获取文档内容，获取文档有 2 种情况，一种是只获取一个文档内容，另一种是同时获取多个文档的内容。

### 使用 GET API 获取单个文档

通过文档的 ID 获取文档的信息时可以使用 GET API 来实现，其示例如下：

```bash
# 使用 GET API 获取单个文档的内容
GET books/_doc/1

# 结果
{
  "_index" : "books",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "book_id" : "4ee82462",
    "name" : "深入Linux内核架构",
    "author" : "Wolfgang Mauerer",
    "intro" : "内容全面深入，领略linux内核的无限风光。"
  }
}
```

如果获取如果成功，文档的原生内容保存在 "`_source`" 字段中，其他字段是这个文档的元数据。

GET API 提供了多个参数，更多的信息可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/docs-get.html)，下面是几个比较常用的：

| 参数                 | 简介                                                                     |
|:-------------------|:-----------------------------------------------------------------------|
| `preference`       | 默认的情况下，GET API 会从多个副本中随机挑选一个，设置 `preference` 参数可以控制 GET 请求被路由到哪个分片上执行。 |
| `realtime`         | 控制 GET 请求是实时的还是准实时的，默认为 `true`。                                        |
| `refresh`          | 是否在执行 GET 操作前执行 `refresh`（默认的情况下新写入的数据需要一秒后才能被搜索到），默认为 `false`。        |
| `routing`          | 自定义 routing key。                                                       |
| `stored_fields`    | 返回在 Mapping 中 `store` 设置为 `true` 的字段，而不是 `_source`。默认为 `false`。        |
| `_source`          | 指定是否返回 `_source` 的字段，或者设置某些需要返回的字段。                                    |
| `_source_excludes` | 不返回哪些字段，逗号分割的字符串列表。如果 `_source` 设置为 `false`，此参数会被忽略。                   |
| `_source_includes` | 返回哪些字段，逗号分割的字符串列表。如果 `_source` 设置为 `false`，此参数会被忽略。                    |
| `version`          | 指定版本号，如果获取的文档的版本号与指定的不一样，返回 http 409。                                  |

### 使用 MGET API 获取多个文档

当需要通过多个文档 ID 同时获取它们的信息时，可以使用 GET API 发起多个请求，但效率比较低下。这时可以使用 ES 提供的 MGET API 来解决这个需求。

MGET API 的请求格式有 3 种，其示例如下：

```bash
# 1：在 body 中指定 index
GET /_mget
{
  "docs": [
    { "_index": "books", "_id": "1" },
    { "_index": "books", "_id": "2" }
  ]
}
```

```bash
# 2：直接指定 index
GET /books/_doc/_mget
{
  "docs": [
    { "_id": "1" },
    { "_id": "2" }
  ]
}
```

```bash
# 3：也可以简写为一下例子
GET /books/_mget
{
  "ids" : ["1", "2"]
}
```

```bash
# 结果
{
  "docs" : [
    {
      "found" : true,
      "_source" : {
        "book_id" : "4ee82462",
        "name" : "深入Linux内核架构"
        ......
      }
    },
    {
      "found" : true,
      "_source" : {
        "book_id" : "4ee82463",
        "name" : "时间简史",
        ......
      }
    }
  ]
}
```

如上示例，如果在 body 中指定 index，可以获取多个索引中的文档数据，比较灵活。而使用直接指定 index 的方式只能获取指定索引中的文档。更多的 MGET API 使用例子可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/docs-multi-get.html)。

如果对应的文档找不到，`found` 字段为 `false`。

## 更新文档

ES 提供了 Update API 来更新文档信息，更新一个文档，需要指定文档的 ID 和需要更新的字段与其对应的值。Update API 使用如下：

```bash
# 更新文档
POST books/_update/2
{
  "doc": {
    "name":"时间简史（视频版）",
    "intro": "探索时间和空间核心秘密的引人入胜的视频故事。"
  }
}

# 结果
{
  "_index" : "books",
  "_type" : "_doc",
  "_id" : "2",
  "_version" : 3,
  "result" : "updated",
  ......
}
```

更新文档后，版本号会增加，"`result`" 字段为 `updated`。

前面提到的，索引文档的方式也有更新数据的效果，那它跟文档更新接口有啥区别呢？

* 索引文档的更新效果是先删除数据，然后再写入新数据。所以**索引文档的方式会覆盖旧的数据，使其无法实现只更新某些字段的需求**。

## 删除文档

ES 提供了 Delete API 来删除一个文档，删除一个文档是非常简单的，只需要指定索引和文档 ID 即可。Delete API 使用如下：

```bash
# 删除 id 为 2 的文档
DELETE books/_doc/2

# 结果
{
  "_index" : "books",
  "_type" : "_doc",
  "_id" : "2",
  "_version" : 4,
  "result" : "deleted",
  ......
}
```

除了指定文档 ID 进行文档删除外，我们还可以使用 Delete By Query API 进行查询删除。

```bash
# 使用 Delete By Query API 删除文档
POST /books/_delete_by_query
{
  "query": {
    "term": {
      "book_id": "4ee82462"
    }
  }
}

# 结果
{
  
  "total" : 1,
  "deleted" : 1,
  ......
  "failures" : [ ]
}
```

如上示例，将删除掉所有满足查询条件的内容。在返回结果中，"`deleted`" 字段为 `1`，即删除了 `1` 个文档。

## 批量操作文档

当我们需要写入多个文档的时候，如果每写一个文档就发起一个请求的话，多少有点浪费。这个时候我们可以使用 Bulk API 来批量处理文档。

Bulk API 支持在一次调用中操作不同的索引，使用时可以在 Body 中指定索引也可以在 URI 中指定索引。而且还可以同时支持 4 种类型的操作：

* Index
* Create
* Update
* Delete

Bulk API 的格式是用换行符分隔 JSON 的结构，第一行指定操作类型和元数据（索引、文档 id 等），紧接着的一行是这个操作的内容（文档数据，如果有的话。像简单的删除就没有。），其格式如下：

```bash
POST _bulk
# 第一行指定操作类型和元数据（索引、文档id等）
{ "index" : { "_index" : "books", "_id" : "1" } } 
# 紧接着的一行是这个操作的内容（文档数据，如果有的话。像简单的删除就没有）
{ "book_id": "4ee82462","name": "深入Linux内核架构", ......}
```

下面示例是在 Bulk API 中同时使用多种操作类型的例子：

```bash
# 在 Bulk API 中同时使用多种操作类型的实例
POST _bulk
{ "index" : { "_index" : "books", "_id" : "1" } }
{ "book_id": "4ee82462","name": "深入Linux内核架构","author": "Wolfgang Mauerer","intro": "内容全面深入，领略linux内核的无限风光。" }
{ "delete" : { "_index" : "books", "_id" : "2" } }
{ "create" : { "_index" : "books", "_id" : "3" } }
{ "book_id": "4ee82464","name": "深入Linux内核架构第三版","author": "Wolfgang Mauerer","intro": "内容全面深入，再次领略linux内核的无限风光。" }
{ "update" : {"_index" : "books", "_id" : "4"} } # 指定操作类型、索引、文档 id
{ "doc" : {"intro" : "书本的内容非常好，值得一看"} } # 指定文档内容

# 结果
{
  "items" : [
    {
      "index" : {
        "_id" : "1",
        "result" : "created",
        ......
      }
    },
    {
      "delete" : {
        "_id" : "2",
        "result" : "deleted",
        ......
      }
    },
    {
      "create" : {
        "_id" : "3",
        "result" : "created",
        ......
      }
    },
    {
      "update" : {
        "_id" : "4",
        "status" : 404,
        ......
      }
    }
  ]
}
```

因为一个请求中有多个操作，所以返回结果中会对每个操作有相应的执行结果。如果其中一条操作失败，是不会影响其他操作的执行。

更详细 Bulk API 使用方式，可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/docs-bulk.html)。

## 参考资料

* [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/index.html)

(完)
