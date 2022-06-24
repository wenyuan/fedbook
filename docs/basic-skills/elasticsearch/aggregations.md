# 统计语法：聚合查询

## 前言

聚合就是按照某些条件从数据集合中统计一些信息，例如统计销量前十的书本、统计每个出版社书本的数量、统计有多少个出版社等。

可以使用 ES 提供的聚合计算 API，来满足对数据进行统计分析的需求。

ES 中聚合的类型主要有以下 3 种：

* **Metric Aggregations**：提供求 sum（求总和）、average（求平均数） 等数学运算，可以对字段进行统计分析。
* **Bucket Aggregations**：对满足特定条件的文档进行分组，例如将 A 出版社的书本分为一组，将 B 出版社的书本分为一组，类似于 SQL 里的 Group By 功能。
* **Pipeline Aggregations**：对其他聚合输出的结果进行再次聚合。

ES 的聚合**可以进行多种组合来构建的统计查询**，从而解决复杂的统计分析的需求。下面是聚合查询的通用语法结构：

```bash
# 聚合查询的语法
POST your_index/_search
{
  "aggs": {             # 和 "query" 同级别的关键词
    "aggs_name1": {     # 自定义的聚合名字，会从聚合结果中返回
      "aggs_type": {    # 聚合的定义：聚合类型 + 聚合body
          aggs body
      },
      "aggs": {         # 子聚合
        "aggs_name": {
          "aggs_type": {
            aggs body
          }
        }
      }
    },
    "aggs_name2": {     # 第二个聚合的名字，可以进行多个同级别的聚合查询
        ......
    }
  },
  "size": 0             # 建议设置为0，这样不会返回 _source
}
```

* `"aggs"` 是与 `"query"` 同级的关键词，同时使用时类似 MySQL 里的 `where condition group by column`。
* 一个聚合里可以同时开启多个聚合查询，每个聚合查询的名字不一样，例如 `"aggs_name1"` 和 `"aggs_name2"`。
* 上例中的 `"aggs_type" : {}` 这个键值对是聚合的定义，实际的 DSL 语法里 key 就是 `max`、`buckets` 这些，value 就是聚合的具体内容（字段名等等）。
* 用到聚合时，大部分情况下我们只关心聚合后的结果，不关心返回的匹配文档，所以可以设置 `"size"` 为 0。

## Metric Aggregations

Metric Aggregations 可以计算一组文档中的某个指标，它分为单值分析和多值分析两类：

* 单值分析：只输出一个分析结果的聚合操作，例如：`min`、`max`、`sum`、`avg`、`cardinality`（类似于 SQL 中的 distinct count）等。
* 多值分析：会输出多个分析结果的聚合操作，例如：`stats`、`extended_stats`、`percentiles`、`percentile ranks`、`top hits` 等。

下面是几个例子：

### 查看最高售价

要找出书本的最高售价，可以使用 `max` 聚合，其示例如下：

```bash
# 查看最高售价
POST books/_search
{
  "aggs": {
    "most-expensive": {
      "max": { "field": "price" }
    }
  },
  "size": 0
}

# 结果
{
  ......
  "aggregations" : {
    "most-expensive" : {
      "value" : 20.9
    }
  }
}
```

### 同时查看最高售价、最低售价、平均售价

一次聚合查询中可以发起多个同级别的聚合操作，所有可以同时查询最高售价、最低售价、平均售价，其示例如下：

```bash
# 一个请求里同时获取 最高售价、最低售价、平均售价
POST books/_search
{
  "aggs": {
    "most-expensive": {
      "max": { "field": "price" }
    },
    "cheapest": {
      "min": { "field": "price" }
    },
    "avg-price": {
      "avg": { "field": "price" }
    }
  },
  "size": 0
}

# 结果
{
  ......
  "aggregations" : {
    "cheapest" : { "value" : 9.9 },
    "avg-price" : { "value" : 15.471428571428572 },
    "most-expensive" : { "value" : 20.9 }
  }
}
```

不过除了上述方法外，还可以使用 `stat`。`stats` 聚合除了返回最高售价、最低售价、平均售价外还有售价之和（`sum`）、文档个数的信息。其示例如下：

```bash
# 使用 stat 查询 最高售价、最低售价、平均售价
POST books/_search
{
  "aggs": {
    "stat_price": {
      "stats": {
        "field": "price"
      }
    }
  },
  "size": 0
}

# 结果
{
  ......
  "aggregations" : {
    "stat_price" : {
      "count" : 7,
      "min" : 9.9,
      "max" : 20.9,
      "avg" : 15.471428571428572,
      "sum" : 108.3
    }
  }
}
```

### 统计出版社的数量

可以使用 `cardinality` 聚合获取出版社的数量，其作用类似于 SQL 中的 distinct count。其示例如下：

```bash
# 统计出版社的数量
POST books/_search
{
  "aggs": {
    "cardinality_publisher": {
      "cardinality": {
        "field": "publisher"
      }
    }
  },
  "size": 0
}

# 结果
{
  ......
  "aggregations" : {
    "cardinality_publisher" : {
      "value" : 3
    }
  }
}
```

更多 Metric Aggregations 的使用案例可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/search-aggregations-metrics.html)。

## Bucket Aggregations

Bucket 可以理解为一个桶，或者一个分组，当遍历文档库的时候会把符合条件的文档放到一个分组里面去，分组就相当于 SQL 中的 Group By。

对数据进行分组后，我们还可以组合 Metric Aggregations 的聚合操作来完成复杂的统计需求，例如找出每个出版社最贵的售价是多少。

ES 提供的 Bucket Aggregations 中常用的有以下几个：

* Terms：根据某个字段进行分组，例如根据出版社进行分组。
* Range、Data Range：根据用户指定的范围参数作为分组的依据来进行聚合操作。
* Histogram、Date Histogram：可以指定间隔区间来进行聚合操作。

下面是几个例子：

### 统计每个出版社的书本数量

使用 Terms Aggregations，以出版社作为分组条件，然后计算每个分组中文档的个数，得出的结果就是每个出版社拥有的书本数量了：

```bash
# Terms Aggregations 统计每个出版社拥有的书本数量
POST books/_search
{
  "aggs": {
    "publisher_book_count": {
      "terms": {               # 使用 "terms" 关键字
        "field": "publisher",
        "size": 3              # 只返回聚合后前三组的结果
      }
    }
  },
  "size": 0
}

# 结果
{
  ......
  "aggregations" : {
    "publisher_book_count" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        { "key" : "linux publisher", "doc_count" : 3 },
        { "key" : "autobiography publisher", "doc_count" : 2 },
        { "key" : "science publisher", "doc_count" : 2 }
      ]
    }
  }
}
```

返回结果中，还有两个字段，它们是对本次聚合的评估结果：

* `doc_count_error_upper_bound`：没有在本次聚合返回的分桶中，包含文档数的**可能最大值**的和。如果是 0，说明聚合结果是准确的。
* `sum_other_doc_count`：除了返回结果中的 terms 外，其他没有返回的 terms 的文档数量之和。

### 统计每个价格区间的书本数量

Range Aggregations 可以根据用户指定的范围参数作为分组的依据来进行聚合操作。

所以可以指定 0 ~ 10，10 ~ 20，20 ~ 30 这样的 3 个区间来作为分组，然后统计数据，使用示例如下：

```bash
# 价格区间统计
POST books/_search
{
  "aggs": {
    "price_range": {
      "range": {           # 使用 "range" 关键字
        "field": "price",
        "keyed": true,     # true 使得我们可以对每个区间进行命名
        "ranges": [
          { "key": "cheap", "from": 0.0, "to": 10.0 },  # "key" 表示区间的名字
          { "key": "average", "from": 10.0, "to": 20.0 },
          { "key": "expensive", "from": 20.0, "to": 30.0 }
        ]
      }
    }
  },
  "size": 0
}

# 结果
{
  ......
  "aggregations" : {
    "range_price" : {
      "buckets" : {
        "cheap" : { "from" : 0.0, "to" : 10.0, "doc_count" : 1 },
        "average" : { "from" : 10.0, "to" : 20.0, "doc_count" : 5 },
        "expensive" : { "from" : 20.0, "to" : 30.0, "doc_count" : 1 }
      }
    }
  }
}
```

> 注意点：关键字 `from` 和 `to` 指定了区间的开始值和结束值，其取值范围为前闭后开：`[from, to)`。

当区间值非常多的时候，为了避免手写冗长的查询语句，可以使用 Histogram Aggregation。它也可以对区间进行分组，但这个区间是固定间隔的，例如上例的间隔是 10，那可以这样实现：

```bash
# 使用 Histogram Aggregation
POST books/_search
{
  "aggs": {
    "price_histogram": {
      "histogram": {
        "field": "price",
        "interval": 10
      }
    }
  },
  "size": 0
}

# 结果
{
  "aggregations" : {
    "price_histogram" : {
      "buckets" : [
        { "key" : 0.0, "doc_count" : 1 },
        { "key" : 10.0, "doc_count" : 5 },
        { "key" : 20.0, "doc_count" : 1 }
      ]
    }
  }
}
```

Histogram Aggregation 返回的结果比较简单，其并不能像 Range Aggregation 那样手动指定每个区间的名字，所以更多时候用在显示图表的需求上。

### 统计每个出版社书本的销售量

要统计每个出版社书本的销售量的话，需要先按每个出版社进行分组，然后最每个分组所有文档的销售量求和，所以使用 Terms Aggregation 和 Sum Aggregation 可以解决这个需求，其示例如下：

```bash
# 使用子聚合 组合 Terms Aggregation 和 Sum Aggregation 
POST books/_search
{
  "aggs": {
    "publisher_sales_total": {
      "terms": { "field": "publisher" },
      "aggs": {
        "sales_total": {
          "sum": { "field": "sales" }
        }
      }
    }
  },
  "size": 0
}

# 结果
{
  ......
  "aggregations" : {
    "publisher_sales_total" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "linux publisher",
          "doc_count" : 3,
          "sales_total" : { "value" : 400.0 }
        },
        {
          "key" : "autobiography publisher",
          "doc_count" : 2,
          "sales_total" : { "value" : 5140.0 }
        },
        {
          "key" : "science publisher",
          "doc_count" : 2,
          "sales_total" : { "value" : 19800.0 }
        }
      ]
    }
  }
}
```

从结果可以看出，查询以出版社名称为分组，然后求得每个分组中书本的销售量的总和，并放在了 `"sales_total"` 中。

更多 Bucket Aggregations 的使用案例可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/search-aggregations-bucket.html)。

## Pipeline Aggregations

Pipeline Aggregations 可以对其他聚合输出的结果进行再次聚合，下面通过一个例子来说明其使用方式。

现在有这样一个需求，在销售量最好的 2 个出版社里，找出平均价格最低的出版社。其示例如下：

```bash
POST books/_search
{
  "aggs": {
    "publisher": {
      "terms": {
        "field": "publisher",
        "size": 2,
        "order": { "sales_total": "desc" }
      },
      "aggs": {
        "sales_total": {
          "sum": { "field": "sales" }
        },
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    },
    "min_avg_price": {
      "min_bucket": {
        "buckets_path": "publisher>avg_price"
      }
    }
  },
  "size": 0
}

# 结果
{
  "aggregations" : {
    "publisher" : { ...... },
    "min_avg_price" : {
      "value" : 14.399999999999999,
      "keys" : [ "science publisher" ]
    }
  }
}
```

如上示例，在 `"publisher"` 中我们做了以下几件事：

1. 按出版社进行分桶。
2. 执行子聚合，计算每个出版社的销售总额和书本平均价格。
3. 排序结果按 `"sales_total"`（销售额）倒序排序，并且获取排序后的前两个结果。

最终在 `"publisher"` 中我们得出了销售额最多的两个出版社和它们书本的平均售价、销售额。

最后使用 Pipeline Aggregations 找出平均售价最低的出版社即可。上面的示例是一个简单的例子，`"min_avg_price"` 是我们指定的名字，使用 `"min_bucket"` 求出之前结果的最小值，并且通过 `"buckets_path"` 关键字来指定路径，例子中我们的路径为 `"publisher"` 下的 `"avg_price"`。

Pipeline 分析的结果会输出到原查询的结果中，根据位置的不同可以分为两类：

* Sibling：结果和原结果同级，如上面的列子就是 Sibling。Sibling 可以有 Max Bucket、Min Bucket、Avg Bucket、Sum Bucket 等。
* Parent：结果会内嵌到现有的聚合分析结果中。提供如 Derivative （求导）、Moving Function （滑动窗口）等功能。

更多 Pipeline Aggregations 的使用案例可以参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/search-aggregations-pipeline.html)。

## 参考文档

* [Aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/search-aggregations.html)

（完）
