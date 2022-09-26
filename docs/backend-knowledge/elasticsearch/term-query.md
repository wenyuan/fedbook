# Term 查询语法

## 前言

Match 是基于全文的搜索，Term 是基于词项的搜索。

Term 查询不会对输入内容进行分词，它会将输入的内容会作为一个整体来进行检索，并且使用相关性算分公式对包含整个检索内容的文档进行相关性算分。

Term 是文本经过分词处理后得出来的词项，是 ES 中表达语义的最小单位。ES 中提供很多基于 Term 的查询功能，例如：

* **Term Query**：返回在指定字段中准确包含了检索内容的文档。
* **Terms Query**：跟 Term Query 类似，不过可以同时检索多个词项的功能。
* **Range Query**：范围查询。
* **Exist Query**：返回在指定字段上有值的文档，一般用于过滤没有值的文档。
* **Prefix Query**：返回在指定字段中包含指定前缀的文档。
* **Wildcard Query**：通配符查询。

## Term Query

Term Query 返回在指定字段中准确包含了检索内容的文档，可以使用此 API 去查询精确值的字段，如书本 ID、价格等。

```bash
# 使用 Term Query API 查询书本 id 为 "4ee82463" 的文档 
POST books/_search
{
  "query": {
    "term": {
      "book_id": {
        "value": "4ee82463"
      }
    }
  }
}
```

要避免将 Term Query 用在 `text` 类型的字段上，因为基于 Term 的查询是不会对输入的内容进行分词的，输入的文本会作为一个整体进行查询。但是索引里的数据是进行过分词并且转化为小写的（如果使用的是 standard 分词器，会进行小写转换）。

如果要对 `text` 类型的字段进行搜索，应该使用 match 而不是 Term Query。

## Terms Query

Terms Query 的功能跟 Term Query 类似，不过可以同时检索多个词项的功能。

```bash
# 使用 Terms Query 进行查询
POST books/_search
{
  "query": {
    "terms": {
      "author": [  # 数组，可以指定多个作者的名字
        "Stephen Hawking",
        "Wolfgang Mauerer"
      ]
    }
  }
}
```

## Range Query

Range Query 可以查询字段值符合某个范围的文档数据。

```bash
# 使用 Range Query 查询书本价格大于等于 10.0 小于 20.0 的书本
POST books/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 10.0,
        "lt": 20.0
      }
    }
  }
}
```

大小的比较：

* `gt`：表示大于
* `gte`：表示大于或者等于
* `lt`：表示小于
* `lte`：表示小于或者等于

## Exist Query

使用 Exist Query 可以查询那些在指定字段上有值的文档，一般情况下会使用这个 API 来做文档过滤。

```bash
# 查询出所有存在 "price" 字段的文档
POST books/_search
{
  "query": {
    "exists": {
      "field": "price"
    }
  }
}
```

ES 中空值的标准：

* 字段的 JSON 值为 `null` 或者 `[]`，如果一个字段压根不存在于文档的 `_source` 里，也被认为是空的。
* 一个字段在 Mapping 定义的时候设置了 `"index" : false`。
* 一个字段的值的长度超出了 Mapping 里这个字段设置的 `ignore_above` 时。
* 当字段的值不合规，并且 Mapping 中这个字段设置了 `ignore_malformed` 时。

## Prefix Query

使用 Prefix Query 可以查询在指定字段中包含特定前缀的文档。

```bash
# 使用 Prefix Query 查询含有 "linu" 前缀的文档
POST books/_search
{
  "query": {
    "prefix": {
      "name": {
        "value": "linu"
      }
    }
  }
}
```

需要注意的是，`text` 类型的字段会被分词，成为一个个的 term（词项），所以这里的前缀匹配是匹配这些分词后 term。

## Wildcard Query

Wildcard Query 允许使用通配符表达式进行匹配。它支持两个通配符：

* 使用 `?` 来匹配任意字符。
* 使用 `*` 来匹配 0 或多个字符。

```bash
# 使用 Wildcard Query 查询书名中含有 "linu" 开头的文档
POST books/_search
{
  "query": {
    "wildcard": {
      "name": "linu*"
    }
  }
}
```

需要注意的是，Prefix Query 和 Wildcard Query 在进行查询的时候需要扫描倒排索引中的词项列表才能找到全部匹配的词项，然后再获取匹配词项对应的文档 ID。

所以使用 Wildcard Query 的时候需要注意性能问题，要尽量避免使用左通配匹配模式，如 `*linux`、`.*linux`。

## 结构化搜索

结构化搜索指的是对结构化的数据进行搜索。所谓结构化数据，就是像日期、价格等这些有精确格式的数据。

我们可以对这些数据进行逻辑操作，例如判断价格的范围等。一般我们会对结构化数据进行精确匹配，而精确匹配的结果为布尔值，这个时候可以考虑跳过相关性算分的步骤，从而提高搜索的性能。

使用 Constant Score 可以将 `query` 转化为 `filter`，可以忽略相关性算分的环节，并且 `filter` 可以有效利用缓存，从而提高查询的性能。示例如下：

```bash
# 使用 Range 查询，并且不进行相关性算分
POST /books/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "price": {
            "gte": 10,
            "lte": 20
          }
        }
      }
    }
  }
}
```

## 参考资料

[Term-level queries](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/term-level-queries.html)

（完）
