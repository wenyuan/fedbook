# 搜索词自动补全语法

## 前言

搜索词自动补全的功能可以改善用户的搜索体验。具体的表现形式就是当用户在搜索框输入部分内容后，出现对应的推荐选项，让用户可以快速选择。这种自动补全或纠错的功能在现代搜索引擎中都很常见。

想要实现这样的需求，可以使用 ES 提供的 Suggesters API。它的原理简单来说，就是 Suggesters 会将输入的文本分解为 token（token 就是根据规则切分文本后一个个的词），然后在索引里查找相似的 Term。

根据使用场景的不同，ES 提供了以下 4 种 Suggester：

* **Term Suggester**：基于单词的纠错补全。
* **Phrase Suggester**：基于短语的纠错补全。
* **Completion Suggester**：自动补全单词，输入词语的前半部分，自动补全单词。
* **Context Suggester**：基于上下文的补全提示，可以实现上下文感知推荐。

## Term Suggester

Term Suggester 提供了基于单词的纠错、补全功能，其工作原理是基于编辑距离（edit distance）来运作的，编辑距离的**核心思想是一个词需要改变多少个字符就可以和另一个词一致**。

所以如果一个词转化为原词所需要改动的字符数越少，它越有可能是最佳匹配。（例如 `linvx` 通过改变一个字符 `v` 可以转化成 `linux`）

Term Suggester 工作的时候，会先将输入的文本切分为一个个单词（称为 token），然后根据每个单词提供建议，所以其不会考虑输入文本间各个单词的关系。

示例如下：

```bash
# Term Suggester，"architture" 是错误的拼写，正确的是 "architecture"
POST books/_search
{
  "query": {
    "match": {
      "name": "kernel architture"
    }
  },
  
  "suggest": {
    "my_suggest": {
      "text": "kernel architture",
      "term": {
        "suggest_mode": "missing",
        "field": "name"
      }
    }
  }
}
```

上述示例里，用户搜索词中的 `architture` 是错误的拼写。Suggester API 需要在 `suggest` 块中指定使用的参数。`my_suggest` 是这次建议的名字，是我们自定义的。`term` 指的是使用 Term Suggester，如果是 Phrase Suggester 则用的是 `phrase`。

Term Suggester 比较常用的参数：

* **`text`**：指定需要产生建议的文本，一般是照搬用户的输入内容。
* **`field`**：指定从文档的哪个字段中获取建议。
* **`suggest_mode`**：设置建议的模式。其值有以下几个选项：
  * `missing`：如果索引中存在就不进行建议，默认的选项。上例中的 `kernel` 是存在索引中的，所以返回结果里这个词是没有建议的。
  * `popular`：推荐出现频率更高的词。
  * `always`：不管是否存在，都进行建议。
* **`analyzer`**：指定分词器来对输入文本进行分词，默认与 `field` 指定的字段设置的分词器一致。
* **`size`**：为每个单词提供的最大建议数量。
* **`sort`**：建议结果排序的方式，有以下两个选项：
  * `score`：先按相似性得分排序，然后按文档频率排序，最后按词项本身（字母顺序的等）排序。 
  * `frequency`：先按文档频率排序，然后按相似性得分排序，最后按词项本身排序。

下面是上述示例的返回结果：

```bash
# 返回的结果
{
  "hits" : {
    "hits" : [
      {
        "_id" : "1",
        "_source" : {
          "book_id" : "4ee82462",
          "name" : "Dive into the Linux kernel architecture"
        }
      }
    ]
  },
  "suggest" : {
    "my_suggest" : [
      {
        "text" : "kernel",
        "offset" : 0,
        "length" : 6,
        "options" : [ ]
      },
      {
        "text" : "architture",
        "offset" : 7,
        "length" : 10,
        "options" : [
          {
            "text" : "architecture",
            "score" : 0.8,
            "freq" : 1
          }
        ]
      }
    ]
  }
}
```

从返回结果中可以看出，对于每个词语的建议结果，放在了 `options` 数组中。如果一个词语有多个建议，那么将按照 `sort` 参数指定的方式进行排序。示例中，由于 `kernel` 这个词是有存在的，并且设置了 `"suggest_mode": "missing"`，所以不进行建议，其 `option` 是空的。

## Phrase Suggester

Term Suggester 产生的建议是基于每个单词的，如果想要针对整个短语或者一句话做建议，就有点无能为力了。

而 Phrase Suggester 可以获取与用户输入文本相似的内容。它在前者的基础上增加了一些额外的逻辑，因为是短语形式的建议，所以会考量多个 term 间的关系，比如相邻的程度、词频等。

```bash
# Phrase Suggester 使用示例
POST books/_search
{
  
  "suggest": {
    "my_suggest": {
      "text": "Brief Hestory Of Tome",
      "phrase": {
        "field": "name",
        "highlight": {
          "pre_tag": "<em>",
          "post_tag": "</em>"
        }
      }
    }
  }
}

# 结果
{
  ......
  "suggest" : {
    "my_suggest" : [
      {
        ......
        "options" : [
          {
            "text" : "brief history of time",
            "highlighted" : "brief <em>history</em> of <em>time</em>",
            "score" : 0.030559132
          },
          {
            "text" : "brief history of tome",
            "highlighted" : "brief <em>history</em> of tome",
            "score" : 0.025060574
          },
          {
            "text" : "brief hestory of time",
            "highlighted" : "brief hestory of <em>time</em>",
            "score" : 0.0236486
          }
        ]
      }
    ]
  }
}
```

如上示例，`phrase` 指定使用 Phrase Suggester。从返回结果可以看出，"options" 返回了一个短语列表，并且因为 "history" 和 "time" 在一个文档里出现过，其可信度相对于其他来说更高，所以得分更高。

因为使用了 `highlight` 选项，所以返回结果中被替换的词语会高亮显示。

Phrase Suggester 比较常用的参数：

* **`max_error`**：指定最多可以拼写错误的词语的个数。
* **`confidence`**：其作用是用来控制返回结果条数的。如果用户输入的数据（短语）得分为 `N`，那么返回结果的得分需要大于 `N * confidence`。confidence 默认值为 1.0。
* **`highlight`**：高亮被修改后的词语。

## Completion Suggester

**Completion Suggester 提供了自动补全的功能，其应用场景是用户每输入一个字符就需要返回匹配的结果给用户**。

在并发量大、用户输入速度快的时候，对服务的吞吐量来说是个不小的挑战。所以 Completion Suggester 不能像上面的几个 Suggester 那样简单通过倒排索引来实现，必须通过某些更高效的数据结构和算法才能满足需求。

**Completion Suggester 在实现的时候会将 analyze（将文本分词，并且去除没用的词语，例如 is、at这样的词语） 后的数据进行编码，构建为 FST 并且和索引存放在一起**。FST（[finite-state transducer](https://en.wikipedia.org/wiki/Finite-state_transducer)）是一种高效的前缀查询索引。由于 FST 天生为前缀查询而生，所以其非常适合实现自动补全的功能。ES 会将整个 FST 加载到内存中，所以在使用 FST 进行前缀查询的时候效率是非常高效的。

在使用 Completion Suggester 前需要定义 Mapping，对应的字段需要使用 `completion` type。

比如构建一个新的 `books_completion` 索引，其 Mapping 和测试数据如下：

```bash
# 先删除原来的索引和数据
DELETE books_completion

# 新增 "name_completion" 字段做 Completion Suggester 测试, 其类型为 "completion"
PUT books_completion
{
  "mappings": {
    "properties": {
        "book_id": {
          "type": "keyword"
        },
        "name": {
          "type": "text",
          "analyzer": "standard"
        },
        "name_completion": {
          "type": "completion"
        },
        "author": {
          "type": "keyword"
        },
        "intro": {
          "type": "text"
        },
        "price": {
          "type": "double"
        },
        "date": {
          "type": "date"
        }
      }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# 插入三条测试数据
PUT books_completion/_doc/1
{
  "book_id": "4ee82462",
  "name": "Dive into the Linux kernel architecture",
  "name_completion": "Dive into the Linux kernel architecture",
  "author": "Wolfgang Mauerer",
  "intro": "The content is comprehensive and in-depth, appreciate the infinite scenery of the Linux kernel.",
  "price": 19.9,
  "date": "2010-06-01"
}

PUT books_completion/_doc/2
{
  "book_id": "4ee82463",
  "name": "A Brief History Of Time",
  "name_completion": "A Brief History Of Time",
  "author": "Stephen Hawking",
  "intro": "A fascinating story that explores the secrets at the heart of time and space.",
  "price": 9.9,
  "date": "1988-01-01"
}

PUT books_completion/_doc/3
{
  "book_id": "4ee82464",
  "name": "Beginning Linux Programming 4th Edition",
  "name_completion": "Beginning Linux Programming 4th Edition",
  "author": "Neil Matthew、Richard Stones",
  "intro": "Describes the Linux system and other UNIX-style operating system on the program development",
  "price": 12.9,
  "date": "2010-06-01"
}
```

在测试数据准备好后，可以执行下面 Completion Suggester 的使用示例：

```bash
# Completion Suggester 
POST books_completion/_search
{
  
  "suggest": {
    "my_suggest": {
      "prefix": "a brief hist",
      "completion": {
        "field": "name_completion"
      }
    }
  }
}

# 结果
{
  ......
  "suggest" : {
    "my_suggest" : [
      {
        "text" : "a brief hist",
        "offset" : 0,
        "length" : 12,
        "options" : [
          {
            "text" : "A Brief History Of Time",
            "_id" : "2",
            "_source" : {
              "book_id" : "4ee82463",
              "name_completion" : "A Brief History Of Time",
              ......
            }
          }
        ]
      }
    ]
  }
}
```

如上示例，在 `my_suggest` 中，`prefix` 指定了需要匹配的前缀数据，`completion` 中的 `field` 指定了需要匹配文档的哪个字段。返回结果中 `options` 包含了整个文档的数据。

需要注意的是，Completion Suggester 在索引数据的时候经过了 analyze 阶段，所以使用不同的 analyzer（分词器） 会造成构建 FST 的数据不同，例如某些词（is、at 等停用词）被去除、某些词被转换（大小写等）。由于构建的数据不同，可能会影响查询匹配的结果。

## Context Suggester

**Context Suggester 是 Completion Suggester 的扩展，可以实现上下文感知推荐**。例如当我们在编程类型的书籍中查询 `linu` 的时候，可以返回 linux 编程相关的书籍，但在人物自传类型的书籍中，将会返回 linus 的自传。要实现这个功能，可以在文档中加入分类信息，帮助我们做精准推荐。

ES 支持两种类型的上下文：

* **Category**：任意字符串的分类。
* **Geo**：地理位置信息。

下面演示如何基于任意字符串的分类来做上下文推荐。同样，在使用 Context Suggester 前，首先要创建 Mapping，然后在数据中加入相关的 Context 信息。下面是使用 Context Suggester 时的 Mapping：

```bash
#删除原来的索引
DELETE books_context

# 创建用于测试 Context Suggester 的索引
PUT books_context
{
  "mappings": {
    "properties": {
        "book_id": {
          "type": "keyword"
        },
        "name": {
          "type": "text",
          "analyzer": "standard"
        },
        "name_completion": {
          "type": "completion",
          "contexts": [
            {
              "name": "book_type",
              "type": "category"
            }  
          ]
        },
        "author": {
          "type": "keyword"
        },
        "intro": {
          "type": "text"
        },
        "price": {
          "type": "double"
        },
        "date": {
          "type": "date"
        }
      }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}

# 插入三条测试数据
PUT books_context/_doc/4
{
  "book_id": "4ee82465",
  "name": "Linux Programming",
  "name_completion": {
    "input": ["Linux Programming"],
    "contexts": {
      "book_type": "program"
    }
  },
  "author": "Richard Stones",
  "intro": "Happy to Linux Programming",
  "price": 10.9,
  "date": "2022-06-01"
}

PUT books_context/_doc/5
{
  "book_id": "4ee82466",
  "name": "Linus Autobiography",
  "name_completion": {
    "input": ["Linus Autobiography"],
    "contexts": {
      "book_type": "autobiography"
    }
  },
  "author": "Linus",
  "intro": "Linus Autobiography",
  "price": 14.9,
  "date": "2012-06-01"
}
```

如上所示的 Mapping，其中 `name_completion` 的类型还是为 `completion`，在 `contexts` 中有两个字段，其中 `type` 为上下文的类型，就是上面提到的 Category 和 Geo，本例子使用了 Category。而 `name` 则为上下文的名称（即哪个分类），本例子为 `book_type`。

导入的数据中，`name_completion` 中的 `input` 字段用于内容匹配。`book_type` 的值有多个，`program` 是编程类的，`autobiography` 是自传类的。

导入数据成功后，下面来看看 Context Suggester 的使用例子：

```bash
POST books_context/_search
{
  
  "suggest": {
    "my_suggest": {
      "prefix": "linu",
      "completion": {
        "field": "name_completion",
        "contexts": {
          "book_type": "program"
        }
      }
    }
  }
}
```

如上示例，还是使用 `prefix` 字段来指定需要匹配的前缀数据，其将与 `input` 字段的数据进行匹配。而 `contexts` 中指定了 `book_type` 为 `program`。所以查询的意思是：在书本类别为 `program` 的数据里，推荐以 `linu` 开头的书本。

## 总结

* **Term Suggester 提供基于单词的纠错、补全功能**。其工作原理是基于编辑距离（edit distance）来运作的，编辑距离的核心思想是一个词需要改变多少个字符就可以和另一个词一致。Term Suggester 是根据每个单词提供建议，所以其不会考虑输入文本间各个单词的关系 。
* **Phrase Suggester 是基于短语的纠错补全的**，不像Term Suggester 只能提供基于单词的纠错。所以其会考量多个 term 间的关系，比如相邻的程度、词频等。
* **Completion Suggester 提供自动补全单词的功能，输入词语的前半部分，自动补全整个单词**。由于 Completion Suggester 需要比较高的性能，所以底层使用了 FST 来实现。需要注意的是，Completion Suggester 在写入数据时会将数据进行分词等操作，而不同的分词器分词后的结果不尽相同，这会导致构建的 FST 也是不同的，这样将会造成某些查询无法匹配到结果的现象。
* **Context Suggester 提供基于上下文的补全功能**。当我们需要根据不同类别进行相关上下文补全的时候，Context Suggester 就派上用场了。Context Suggester 可以定义两种上下文类型：Category 和 Geo，其中我们今天详细讲解了 Category 类型的实例。

## 参考资料

* [Suggesters](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/search-suggesters.html#global-suggest)

（完）
