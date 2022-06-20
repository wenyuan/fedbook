# 全文搜索语法

## 前言

ES 在写入数据的时候，会先使用分词器把文本数据进行分词（比如 `hello world` -> `hello` 和 `world`），并且统计每个词语出现的次数等信息。

当我们检索文本数据（比如查询 `hello java`）的时候，会使用同样的分词器对检索内容进行分词，然后与文本内容匹配，根据统计信息给每个词语打分，最后根据公式算出相关性评分（内容的相似性），并且返回相关性最高的 TopN 个文档给用户。

这种检索方式就是全文搜索，它就跟使用百度搜索一下，当我们在查询一些文本内容的时候一般不会做精确匹配，一来性能开销大，二来实际意义不大，正所谓吃力不讨好。

ES 支持全文搜索的 API 主要有以下几个：

* **match**：匹配查询可以处理全文本、精确字段（日期、数字等）。
* **match phrase**：短语匹配会将检索内容分词，这些词语必须全部出现在被检索内容中，并且顺序必须一致，默认情况下这些词都必须连续。
* **match phrase prefix**：与 match phrase 类似，但最后一个词项会作为前缀，并且匹配这个词项开头的任何词语。
* **multi match**：通过 multi match 可以在多个字段上执行相同的查询语句。

## match（匹配查询）

### match all

match all 是我最常见使用的 API，用于查询目标 index 的大体数据结构（有哪些字段）：

```bash
# 匹配所有文档，如果不指定 from size 则在 Kibana 中默认返回前十条
POST books/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0,
  "size": 100
}
```

```bash
# 按时间倒叙查询
POST books/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "@timestamp": {
        "order": "desc"
      }
    }
  ]
}
```

### 匹配字段

可以通过指定字段名和字段值，使用 match 进行一次全文本字段的查询：

```bash
# 匹配查询
POST books/_search
{
  "query": {
    "match": {
      "name": "linux architecture"
    }
  }
}
```

在进行全文本字段检索的时候， match API 提供了 `operator` 和 `minimum_should_match` 参数：

* `operator`：参数值可以为 `or` 或者 `and` 来控制检索词项间的关系。默认值为 `or`，表示被分词后，只要含有部分词项的文档都可以匹配上。
* `minimum_should_match`：可以指定词项的最少匹配个数，其值可以指定为某个具体的数字，但因为我们无法预估检索内容的词项数量，一般将其设置为一个百分比。

```bash
# 匹配查询，表示只要含有下述四个词项中的三个，就可以匹配上
POST books/_search
{
  "query": {
    "match": {
      "name": {
        "query": "Dive linux kernea architecture",
        "operator": "or",
        "minimum_should_match": "75%"
      }
    }
  }
}
```

除了处理全文本外，我们还可以使用 match API 查询包含精确字段的文档：

```bash
POST books/_search
{
  "query": {
    "match": {
      "date": "2010-06-01"
    }
  }
}
```

## match phrase（短语匹配）

### 匹配完整短语

短语匹配会将检索内容进行分词，这些词语必须全部出现在被检索内容中，并且顺序必须一致，默认情况下这些词都必须连续。

```bash
# 短语匹配
POST books/_search
{
  "query": {
    "match_phrase": {
      "name": "linux architecture"
    }
  }
}
```

### slop 参数

上述查询语法只能查询出 `name` 中带有 `linux architecture` 短语的文档，但无法查询出 `Linux kernel architecture`，因为当中隔了一个词项。

这个时候可以使用 `slop` 参数，这个参数默认是 `0`，表示移动次数。

> * 比如文档中是 `You know, for search.`。
> * 搜索 `you search` （有间隔词项）时，需要把 `search` 往后移动 2 个词，所以 slop 至少为 2 才能匹配。
> * 搜索 `know you时`（顺序不一致），把搜索词中的 `know` 往后移动 1 位，把 `you` 往前移动1位（移动后变成 `you know`），需要移动 2 次，所以 slop 为2时可以匹配到。

那么用 slop 改写上面的语法，使得搜索 `linux architecture` 时可以查询出值为 `Linux kernel architecture` 的文档：

```bash
# match_phrase 使用 slop
POST books/_search
{
  "query": {
    "match_phrase": {
      "name": {
        "query": "linux architecture",
        "slop": 1
      }
    }
  }
}
```

## match phrase prefix（短语前缀匹配）

### 短语前缀匹配

match phrase prefix 与 match phrase 类似，但最后一个词项会作为前缀，并且匹配这个词项开头的任何词语。

可以使用 `max_expansions` 参数来控制最后一个词项的匹配数量，此参数默认值为 `50`。

下面这个例子可以匹配到 `name` 中含有 `linux kernea`、`linux kerneb` 等短语的文档。

```bash
# 匹配以 "linux kerne" 开头的短语
POST books/_search
{
  "query": {
    "match_phrase_prefix": {
      "name": "linux kerne"
    }
  }
}
```

### 限制返回文档数

下面这个例子中限制了最后一个词项的通配匹配个数为 `2`，因为 **`max_expansions` 参数是分片级别的**，也就是当前规定了每个分片最多匹配 2 个文档，如果有 3 个分片的话，最多返回 6 个匹配的文档。

```bash
# 匹配以 "linux kerne" 开头的短语，最多匹配 2 个
POST books/_search
{
  "query": {
    "match_phrase_prefix": {
      "name": {
        "query": "linux kern",
         "max_expansions": 2
      }
    }
  }
}
```

一般来说，`match_phrase_prefix` API 可以实现比较粗糙的自动建议功能，但要实现自动建议的功能，可以使用 Suggest API（后面再单独介绍）。

## multi match

### 多字段查询 

multi-match API 构建在 match 查询的基础上，可以允许在多个字段上执行相同的查询。

```bash
# multi match API
GET /books/_search
{
  "query": {
    "multi_match": {
      "query": "linux architecture",
      "fields": ["nam*", "intro^2"]
    }
  }
}
```

`fields` 参数是一个列表，里面的元素是需要查询的字段名字。`fields` 中的值既可以支持以通配符方式匹配文档的字段，又可以支持提升字段的权重。

* 如 `nam*` 就是使用了通配符匹配的方式，其可以匹配到 `name` 字段。
* 而 `intro^2` 就是对 `intro` 这个字段的相关性评分乘以 2，其他字段不变。

### 设置计分方式

multi-match API 还提供了多种类型来设置其执行的方式：

* `best_fields`：默认的类型，会执行 match 查询并且将所有与查询匹配的文档作为结果返回，但是只使用评分最高的字段的评分来作为评分结果返回。
* `most_fields`：会执行 match 查询并且将所有与查询匹配的文档作为结果返回，并将所有匹配字段的评分加起来作为评分结果。
* `phrase`：在指定的每个字段上均执行 `match_phrase` 查询，并将最佳匹配字段的评分作为结果返回。
* `phrase_prefix`：在指定的每个字段上均执行 `match_phrase_prefix` 查询，并将最佳匹配字段的评分作为结果返回。
* `cross_fields`：它将所有字段当成一个大字段，并在每个字段中查找每个词。例如当需要查询英文人名的时候，可以将名和姓两个字段组合起来当作全名来查询。
* `bool_prefix`：在每个字段上创建一个 [`match_bool_prefix`](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/query-dsl-match-bool-prefix-query.html) 查询，并且合并每个字段的评分作为评分结果。

上述的这几种类型，无非就是设置算分的方式和匹配文档的方式不一样，可以使用 `type` 字段来指定这些类型，以 `best_fields` 为例，示例如下：

```bash
# multi match API
# 此查询将会在 books 索引中查找 "name" 字段
# 包含 "linux " 或者 "architecture" 的文档
# 或者在 "intro" 字段中包含 "linux " 或者 "architecture" 的文档。
GET /books/_search
{
  "query": {
    "multi_match": {
      "query": "linux architecture",
      "fields": ["name", "intro"],
      "type": "best_fields",  # 指定对应的类型
      "tie_breaker": 0.3
    }
  }
}
```

> 关于 `tie_breaker`：
> 
> 一般来说文档的相关性算分是由得分最高的字段来决定的，但当指定 `tie_breaker` 的时候，算分结果将会由以下算法来决定：
> * 令算分最高的字段的得分为 s1
> * 令其他匹配的字段的算分 * `tie_breaker` 的和为 s2
> * 最终算分为：s1 + s2

`tie_breaker` 的取值范围为：`[0.0, 1.0]`。

* 当其为 0.0 的时候，按照上述公式来计算，表示使用最佳匹配字段的得分作为相关性算分。
* 当其为 1.0 的时候，表示所有字段的得分同等重要。
* 当其在 0.0 到 1.0 之间的时候，代表其他字段的得分也需要参与到总得分的计算当中去。

通俗来说就是其他字段可以使用 `tie_breaker` 来进行「维权」。

## 参考文档

* [multi-match](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/query-dsl-multi-match-query.html)

（完）
