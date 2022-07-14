# 嵌套类型和父子文档

## 前言

在传统的关系型数据库领域，想要表达关系型模型是非常自然的（通过外键关联），但在 ES 里要处理这个事情就并不那么简单了。

在 ES 中可以保存关系型模型数据的方式主要有以下两种：

* **nested**：在这种方式中，会将一对多的关系保存在同一个文档中。
* **join（Parent / Child）**：通过维护文档的父子关系，将两个对象分离。

**上述的这两种方式都可以描述一对多的关系**，下面分别介绍这两种实现关系型模型的方式和它们各种的优缺点以及适用场景。

## nested（嵌套类型）

nested 类型是**一种特殊的 object 数据类型，其允许数组中的对象可以被单独索引，使它们可以被独立地检索**。

### 不指定 nested 的情况

如果使用普通的 object 数组来保存书本与作者的一对多关系：

```bash
# 创建 Mapping
PUT books_index
{
  "mappings": {
    "properties": { 
      "book_id": { "type": "keyword" },
      "author": { 
        "properties": {
          "first_name": { "type": "keyword" },
          "last_name": { "type": "keyword" }
        }
      }
    }
  }
}

# 写入书本数据
PUT books_index/_doc/1
{
  "book_id": "1234",
  "author": [
    { "first_name": "zhang", "last_name": "san" },
    { "first_name": "wang", "last_name": "wu" }
  ]
}
```

写入数据的时候，书本的作者有两个（描述了一对多的关系）：`"zhangsan"` 和 `"wangwu"`。

执行查询语句：

```bash
GET books_index/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "author.first_name": "zhang" } },
        { "term": { "author.last_name": "wu" } }
      ]
    }
  }
}
```

用上面的查询语法，本意是查 `"zhangwu"` 这个姓名，数据中不存在这个作者。但是这个查询却可以命中文档 1，跟我们预期的不一样。

这是因为 object 被扁平化处理后，其丢失了 `first_name` 和 `last_name` 之间的关系，变成了下面这样的关系：

```bash
{
    "book_id": "1234",
    "author.first_name": ["zhang", "wang"],
    "author.last_name": ["san", "wu"]
}
```

对于这个扁平化数组，原先 `first_name` 和 `last_name` 间的对应关系已经不复存在了。所以查询语句在 `author.first_name` 中匹配了 `"zhang"`，在 `author.last_name` 匹配了 `"wu"`，自然而然就命中了文档 1。

### 指定 nested 的情况

使用 nested 数据类型可以使对象数组中的对象被独立索引，这样 `first_name` 和 `last_name` 间的对应关系就不会丢失了。

下面示例修改一下 Mapping，把 `author` 的类型定义为 nested：

```bash {11}
# 删除索引
DELETE books_index

# 创建索引，author 类型为 nested
PUT books_index
{
  "mappings": {
    "properties": { 
      "book_id": { "type": "keyword" },
      "author": { 
        "type": "nested", # author 定义为 nested 类型的对象
        "properties": {
          "first_name": { "type": "keyword" },
          "last_name": { "type": "keyword" }
        }
      }
    }
  }
}
```

指定 `author` 这个对象的类型为 nested 后，在内部 nested 类型将数组中的每个对象索引为单独的隐藏文档，这样数组中的每个对象就可以被单独检索了。

nested 数据类型的检索示例如下：

```bash
# nested 数据类型的查询
GET books_index/_search
{
  "query": {
    "nested": {         # 使用 nested 关键字
      "path": "author", # path 关键字指定对象名字
      "query": {
        "bool": {
          "must": [
            { "term": { "author.first_name": "zhang" } },
            { "term": { "author.last_name": "san" } }
          ]
        }
      }
    }
  }
}
```

如上示例，使用 `nested` 关键字指定一个 nested 对象的查询，使用 `path` 指定 nested 对象的名字。

从上面的示例来看，nested 通过冗余的方式将对象和文档存储在一起，所以查询时的性能是很高的。但在需要更新对象信息的时候需要更新所有包含此对象的文档，例如某个作者的信息更改了，那么所有这个作者的书本文档都要更新。**所以 nested 适合查询频繁但更新频率低的场景**。

## Parent / Child（文档的父子关系）

除了提供 nested 来描述一对多关系外，ES 还提供了 join 数据类型来表达关系型数据模型。

**join 数据类型允许在一个索引中的文档创建父子关系，通过维护父子文档的关系独立出来两个对象**。父文档和子文档是相互独立的，通过类似引用的关系进行绑定，所以当父文档更新时，不需要更新子文档，而子文档可以被任意添加、修改、删除而不会影响到父文档和其他子文档。

需要注意的是，**为了维护父子文档的关系需要占用额外的内存资源，并且读取性能相对较差**。但由于父子文档是互相独立的，所以**适合子文档更新频率高的场景**。

下面是 join 数据类型的使用示例。

### 在 Mapping 中定义 join 数据类型

在使用 join 前，先进行字段的定义，Mapping 的定义如下：

```bash
PUT join_books_index
{
  "mappings": {
    "properties": { 
      "book_id": { "type": "keyword" },
      "name": { "type": "text" },
      "book_comments_relation": {  # 定义字段名字
        "type": "join",            # 此字段为 join 类型
        "relations": {             # 声明 Parent / Child 的关系
          "book": "comment"        # book 是 Parent 的名称，comment 是 Child 的名称
        }
      }
    }
  },
  "settings": {
    "number_of_shards": 3,  # 定义 3 个主分片
    "number_of_replicas": 1
  }
}
```

如上示例，`book_comments_relation` 是字段的名字，使用 `join` 关键字定义此字段的类型为 join 类型。`relations` 处声明了 Parent / Child 的关系。

### 索引父文档

在定义了 Mapping 后，写入父文档的数据。

```bash
PUT join_books_index/_doc/11
{
  "book_id": "1234",
  "name": "java book",
  "book_comments_relation": {
    "name": "book"
  }
}
```

这里父文档的 ID 为 11，其中 `book_comments_relation` 声明了文档类型为 `book`（即我们概念里的父文档）。

### 索引子文档

索引子文档的示例如下：

```bash
PUT join_books_index/_doc/21?routing=11
{
  "comment": "a good book!!",
  "user_name": "tom",
  "book_comments_relation": {
    "name": "comment",
    "parent": "11"
  }
}
```

如上示例，`book_comments_relation` 中声明了文档的类型为 `comment`（即我们概念里的子文档），并且使用 `parent` 字段指定父文档的 ID。

为了确保查询时的性能，父文档和子文档必须在同一个分片，所以需要强制使用 `routing` 参数，并且其值为父文档的 ID（如果写入父文档的时候也用 `routing` 参数，那么需要保证它们的值是一样的）。

### 数据检索

在索引了父子文档的数据后，下面来做几个搜索。

#### 1）获取父文档的信息

```bash
# 获取父文档
GET join_books_index/_doc/11

# 结果
{
  "_id" : "11",
  "_source" : {
    "book_id" : "1234",
    "name" : "java book",
    "book_comments_relation" : {
      "name" : "book"
    }
  }
}
```

如上示例，可以看到获取的父文档的数据是不包含子文档的信息的，因为父子文档是相互独立的。

#### 2）获取子文档的信息

```bash
# 获取子文档信息
GET join_books_index/_doc/21

# 结果，失败的
{
  "_index" : "join_books_index",
  "_type" : "_doc",
  "_id" : "21",
  "found" : false
}

# 获取子文档信息，需要加入 routing 参数
GET join_books_index/_doc/21?routing=11
```

如上示例，在获取子文档时，如果不加 `routing` 参数是无法找到对应的子文档的。`routing` 参数的值为父文档的 ID。

#### 3）Parent Id 查询

如果我们要查询一本书的评价列表，可以用 Parent Id 进行查询。

```bash
POST join_books_index/_search
{
  "query": {
    "parent_id": {
      "type": "comment",
      "id": "11"
    }
  }
}
```

如上示例，`parent_id` 字段里，我们查询了父文档 ID 为 `11` 并且 `comment` 类型的文档。

#### 4）Has Child 查询

如果我们想查询用户 "tom" 评论了哪些书本，可以使用 **Has Child 查询**。Has Child 查询将在子文档中进行条件匹配，然后返回匹配文档对应的父文档的信息。

```bash
# Has Child 查询
POST join_books_index/_search
{
  "query": {
    "has_child": {
      "type": "comment", # 在评论中查询
      "query": {
        "term": {
          "user_name": "tom"
        }
      }
    }
  }
}

# 结果
{
  "_id" : "11",
  "_source" : {
    "book_id" : "1234",
    "name" : "java book",
    "book_comments_relation" : {
      "name" : "book"
    }
  }
}
```

如上示例，使用 `has_child` 字段来声明一次 Has Child 查询，其中我们查询文档类型（`type` 字段的值）为 `comment`（子文档） 的文档，条件为用户名字为 `"tom"`，而返回结果则为父文档的列表。

#### 5）Has Parent 查询

那如果我们想查询 java 相关书籍的评论时，可以使用 **Has Parent** 查询。Has Parent 查询会在父文档中进行匹配，然后返回匹配文档对应的子文档的信息。

```bash
# Has Parent 查询
POST join_books_index/_search
{
  "query": {
    "has_parent": {
      "parent_type": "book",
      "query": {
        "term": {
          "name": "java"
        }
      }
    }
  }
}

# 结果
{
  "hits" : {
    "hits" : [
      {
        "_id" : "21",
        "_source" : {
          "comment" : "a good book!!",
          "user_name" : "tom",
          "book_comments_relation" : {
            "name" : "comment",
            "parent" : "11"
          }
        }
      }
    ]
  }
}
```

如上示例，使用 `has_parent` 字段开启一次 Has Parent 查询，`parent_type` 的值设置为 `book`（父文档），查询条件为书名中带有 `"java"` 的文档，最终返回结果则为子文档列表。

## 总结

因为对象数组在存储的时候被扁平化了，会导致对象字段间的关系丢失，从而影响搜索的精准度。所以普通的 object 类型数组不能满足关系型数据这种需求。

nested 数据类型和 join 数据类型可以解决这个问题。

下面是 nested 和 join 数据类型的优缺点：

|      | Nested 类型                   | Join 类型                         |
|:-----|:----------------------------|:--------------------------------|
| 缺点   | 文档变更时，需要更新所有引用这个文档信<br>息的文档 | 占用额外的内存资源来维护父子关系，并且读取性<br>能相对较差 |
| 优点   | 对象与文档存储在一起，读取性能高            | 父子文档互相独立                        |
| 使用场景 | 适合查询频繁但更新频率低的场景             | 适合子文档更新频率高的场景                   |

## 参考文档

* [nested](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/nested.html#nested)
* [join](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/parent-join.html)

（完）
