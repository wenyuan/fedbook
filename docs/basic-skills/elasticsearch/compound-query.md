# 组合查询语法

## 前言

复杂的搜索需求往往需要组合各种搜索 API 来进行操作。

带有组合功能的 API 有以下几个：

* **Bool Query**：布尔查询，可以组合多个过滤语句来过滤文档。
* **Boosting Query**：在 `positive` 块中指定匹配文档的语句，同时降低在 `negative` 块中也匹配的文档的得分，提供调整相关性算分的能力。
* **Constant Score Query**：包装了一个过滤器查询，不进行算分。
* **Dis Max Query**：返回匹配了一个或者多个查询语句的文档，但只将最佳匹配的评分作为相关性算分返回。
* **Function Score Query**：支持使用函数来修改查询返回的分数。

## Bool Query

Bool Query 使用一个或者多个布尔查询子句进行构建，每个子句都有一个类型，有如下类型：

* `must`：查询的内容必须在匹配的文档中出现，并且会进行相关性算分。（与 AND 等价）
* `filter`：查询的内容必须在匹配的文档中出现，但它的相关性算分是会被忽略的，并且子句将被考虑用于缓存。（与 AND 等价）
* `should`：查询的内容应该在匹配的文档中出现，可以指定最小匹配的数量。（与 OR 等价）
* `must_not`：查询的内容不能在匹配的文档中出现。与 filter 一样其相关性算分也会被忽略。（与 NOT 等价）

must 示例：

```bash
POST books/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "author": {
              "value": "Wolfgang Mauerer"
            }
          }
        },
        {
          "term": {
            "date": {
              "value": "2010-06-01"
            }
          }
        }
      ]
    }
  }
}
```

同样的需求，也可以用 should 子句来实现，但因为 should 默认只要匹配到一个就行了，所以需要借助 [`minimum_should_match`](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/query-dsl-minimum-should-match.html) 这个属性，可以指定最少匹配的查询数量或者百分比。此处把它指定为 2 就可以了，示例：

```bash
POST books/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "term": {
            "author": {
              "value": "Wolfgang Mauerer"
            }
          }
        },
        {
          "term": {
            "date": {
              "value": "2010-06-01"
            }
          }
        }
      ],
      "minimum_should_match": 2
    }
  }
}
```

但要注意，当在 Bool Query 里面使用了 should ，但同时还有 must 或者 filter 的情况下，`minimum_should_match` 默认就不是 1 而是 0 了。因为这时候只看 must 、filter 的结果。

就像这样的一种情况：

```bash {42}
# should 与 must 共用，should 失效
POST books/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match_all": {}
        }
      ],
      "must_not": [],
      "should": [
        {
          "match_phrase": {
            "basicName": "测试"
          }
        }
      ],
      "filter": []
    }
  }
}

# 指定 "minimum_should_match": 1，即可解决这个问题
POST books/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match_all": {}
        }
      ],
      "must_not": [],
      "should": [
        {
          "match_phrase": {
            "basicName": "测试"
          }
        }
      ],
      "minimum_should_match": 1,
      "filter": []
    }
  }
}
```

同样的需求，甚至可以用 must 子句和 filter 子句的组合来实现，虽然对于这个需求来说这么做自找麻烦。示例：

```bash
POST books/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "author": {
              "value": "Wolfgang Mauerer"
            }
          }
        }
      ],
      "filter": [
        {
          "term": {
            "date": {
              "value": "2010-06-01"
            }
          }
        }
      ]
    }
  }
}
```

## Boosting Query

Boosting Query 可以指定两个块：`positive` 块和 `negative` 块。

可以在 positive 块来指定匹配文档的语句，而在 negative 块中匹配的文档其相关性算分将会降低。相关性算分降低的程度将由 `negative_boost` 参数决定，其取值范围为：`[0.0, 1.0]`。

在 negative 块中匹配的文档，其相关性算分为：在 positive 中匹配时的算分 * `negative_boost`。

```bash
POST books/_search
{
  "query": {
    "boosting": {
      "positive": {
        "term": {
          "name": {
            "value": "linux"
          }
        }
      },
      "negative": {
        "term": {
          "name": {
            "value": "programming"
          }
        }
      },
      "negative_boost": 0.5
    }
  }
}
```

## Constant Score Query

Constant Score 其实就是包装了一个过滤器查询，不进行算分。可以将 query 转化为 filter，可以忽略相关性算分的环节，并且 filter 可以有效利用缓存，从而提高查询的性能。

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

## Dis Max Query

Disjunction Max Query 的简称，是分离最大化查询的意思。

* disjunction（分离）的含义是：表示把同一个文档中的每个字段上的查询都分开，分别进行算分操作。
* max（最大化）：是将多个字段查询的得分的最大值作为最终评分返回。

它的效果是：**将所有与任一查询匹配的文档作为结果返回，但是只将最佳匹配的得分作为查询的算分结果进行返回**。不过其他匹配的字段可以使用 `tie_breaker` 参数来进行「维权」。

示例如下：

```bash
# 最终返回的相关性评分将以匹配 "linux" 或者匹配 "kernel" 中最大的那个评分为准
POST books/_search
{
  "query": {
    "dis_max": {
      "queries": [
        {
          "term": {
            "name": {
              "value": "linux"
            }
          }
        },
        {
          "term": {
            "intro": {
              "value": "kernel"
            }
          }
        }
      ],
      "tie_breaker": 0.9
    }
  }
}
```

> 维权算法
>
> * 令算分最高的字段的得分为 s1
> * 令其他匹配的字段的算分 * `tie_breaker` 的和为 s2
> * 最终算分为：s1 + s2
>
> `tie_breaker` 的取值范围为：`[0.0, 1.0]`。当其为 0.0 的时候，表示使用最佳匹配字段的得分作为相关性算分。当其为 1.0 的时候，表示所有字段的得分同等重要。

## Function Score Query

Function Score Query 允许你在查询结束以后去修改每一个匹配文档的相关性算分，所以使用算分函数可以改变或者替换原来的相关性算分结果。

它提供了以下几种算分函数：

* `script_score`：利用自定义脚本完全控制算分逻辑。
* `weight`：为每一个文档设置一个简单且不会被规范化的权重。
* `random_score`：为每个用户提供一个不同的随机算分，对结果进行排序。
* `field_value_factor`：使用文档字段的值来影响算分，例如将好评数量这个字段作为考虑因数。
* `decay functions`：衰减函数，以某个字段的值为标准，距离指定值越近，算分就越高。例如我想让书本价格越接近 10 元，算分越高排序越靠前。

### field_value_factor

`field_value_factor` 的作用是用文档某个字段的值来影响相关性算分，它可以解决这样的需求：价格优惠的优先推荐、点赞数多的优先推荐、购买量多的优先推荐等。

它提供了以下几个参数选项：

* **field**：文档的字段。
* **factor**：指定文档的值将会乘以这个因子，默认为 1。
* **modifier**：修改最终值的函数，其值可以为：none、log、log1p、log2p、ln、ln1p、ln2p、square、 sqrt、reciprocal，默认为 none。

假如我想让 `price` 影响相关性算分，随着价格的增加，相关性算分将相应地降低，要满足这个需求可以这样做：

```bash
POST books/_search
{
  "query": {
    "function_score": {
      "query": {
        "term": {
          "name": {
            "value": "linux"
          }
        }
      },
      "field_value_factor": {
        "field": "price",
        "factor": 1.2,
        "modifier": "reciprocal",
        "missing": 1
      },
      "boost_mode": "multiply"
    }
  }
}
```

上述示例中，使用价格字段来影响相关性算分，其中 `factor` 为 1.2，将会乘以价格。

`modifier` 使用的是 `reciprocal`，其作用类似于 `1/x`，这里 x 的值就是 price * factor 了。

`boost_mode` 为 `multiply`，其作用是使得旧算分与 `field_value_factor` 产生的算分相乘。

所以最终得分的计算过程如下：`新算分 = 匹配过程产生的旧算分 * reciprocal(1.2 * doc['price'].value)`。

对于 `boost_mode` 参数，它的值有以下几种：

* **multiply**：算分与函数值的积，multiply 是默认值。
* **replace**：使用函数值作为最终的算分结果。
* **sum**：算分与函数值的和。
* **avg**：算分与函数值的平均数。
* **min**：在算分与函数值中取最小值。
* **max**：在算分与函数值中去最大值。

### random_score

`random_score` 算分函数可以实现为每一个用户推荐随机数据的需求，但是希望一段时间内同一个用户访问的时候，这部分内容的排序都是一样的。

```bash
POST books/_search
{
  "query": {
    "function_score": {
      "random_score": {
        "seed": 81819,
        "field": "_seq_no"
      }
    }
  }
}
```

上述示例中，当 `seed` 的值不变的时候，随机内容的排序结果将不会变化。

需要注意的是，在使用 `random_score` 算分函数的时候，需要指定 `seed` 和 `field`，如果只指定 seed，需要在 `_id` 字段上加载 `fielddata`，这样将会消耗大量的内存。

一般来说，使用 `_seq_no` 作为 field 的值是比较推荐的，但是如果 seed 不变的情况下，文档被更新了，这个时候文档的 `_seq_no` 是会变化的，将会导致排序结果的变化。

### 其他算分函数

参考[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/query-dsl-function-score-query.html)。

## 参考资料

* [Compound queries](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/compound-queries.html)

（完）
