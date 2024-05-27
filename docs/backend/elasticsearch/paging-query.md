# 分页查询的三种语法

在大数据系统中，如果一下子从数据集中获取过多的数据可能会造成系统抖动、占用带宽等问题。特别是进行全文搜索时，用户只关心相关性最高的那个几个结果，从系统中拉取过多的数据等于浪费资源。

因此分页查询是必需且常见的操作，ES 提供了 3 种分页方式：

* **from + size**：最普通、简单的分页方式，但是会产生深度分页的问题。
* **search after**：解决了深度分页的问题，但只能一页一页地往下翻，不支持跳转到指定页数。
* **scroll API**：会创建数据快照，无法检索新写入的数据，适合对结果集进行遍历的时候使用。

这 3 种方式的分页操作都有其优缺点，适合不同的场合使用。

## from + size 分页操作

### 基本语法

在我们检索数据时，系统会对数据按照相关性算分进行排序，然后**默认返回前 10 条**数据。可以使用 from + size 来指定获取哪些数据。其使用示例如下：

```bash
# 简单的分页操作
GET books/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0,  # 指定开始位置
  "size": 10  # 指定获取文档个数
}
```

但当我们将 `from` 设置大于 `10000` 或者 `size` 设置大于 `10001` 的时候，这个查询将会报错：

```bash
# 返回结果中的部分错误信息
......
"root_cause" : [
  {
    "type" : "illegal_argument_exception",
    "reason" : "Result window is too large, from + size must be less than or equal to: [10000] but was [10001]. See the scroll api for a more efficient way to request large data sets. This limit can be set by changing the [index.max_result_window] index level setting."
  }
],
"type" : "search_phase_execution_exception",
"reason" : "all shards failed",
"phase" : "query",
"grouped" : true,
......
```

从报错信息可以看出，我们要获取的数据集合太大了，系统拒绝了我们的请求。我们可以使用 `"index.max_result_window"` 配置项设置这个上限：

```bash
PUT books/_settings
{
  "index": {
    "max_result_window": 20000
  }
}
```

如上示例，我们设置了这个上限为 `20000`。虽然使用这个配置有时候可以解决燃眉之急，但是这个上限设置过大的情况下会产生非常严重的后果，因为 ES 中会存在深度分页的问题。

### 深度分页问题

什么是深度分页和为什么会产生深度分页的问题呢？

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="457" height="240" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1050" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1051" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1054" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1055" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1058" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1059" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1008" transform="translate(25,25)"><path id="SvgjsPath1009" d="M 0 0L 407 0L 407 114L 0 114Z" stroke-dasharray="10,6" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="387px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="46.375" transform="rotate(0)"></text></g></g><g id="SvgjsG1012" transform="translate(45,58)"><path id="SvgjsPath1013" d="M 0 4Q 0 0 4 0L 91 0Q 95 0 95 4L 95 44Q 95 48 91 48L 4 48Q 0 48 0 44Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1014"><text id="SvgjsText1015" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="13.375" transform="rotate(0)"><tspan id="SvgjsTspan1016" dy="16" x="47.5"><tspan id="SvgjsTspan1017" style="text-decoration:;">100 个文档</tspan></tspan></text></g></g><g id="SvgjsG1018" transform="translate(181,58)"><path id="SvgjsPath1019" d="M 0 4Q 0 0 4 0L 91 0Q 95 0 95 4L 95 44Q 95 48 91 48L 4 48Q 0 48 0 44Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1020"><text id="SvgjsText1021" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="13.375" transform="rotate(0)"><tspan id="SvgjsTspan1022" dy="16" x="47.5"><tspan id="SvgjsTspan1023" style="text-decoration:;">100 个文档</tspan></tspan></text></g></g><g id="SvgjsG1024" transform="translate(317,58)"><path id="SvgjsPath1025" d="M 0 4Q 0 0 4 0L 91 0Q 95 0 95 4L 95 44Q 95 48 91 48L 4 48Q 0 48 0 44Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1026"><text id="SvgjsText1027" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="13.375" transform="rotate(0)"><tspan id="SvgjsTspan1028" dy="16" x="47.5"><tspan id="SvgjsTspan1029" style="text-decoration:;">100 个文档</tspan></tspan></text></g></g><g id="SvgjsG1030" transform="translate(45,169)"><path id="SvgjsPath1031" d="M 0 0L 95 0L 95 46L 0 46Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1032"><text id="SvgjsText1033" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.375" transform="rotate(0)"><tspan id="SvgjsTspan1034" dy="16" x="47.5"><tspan id="SvgjsTspan1035" style="text-decoration:;">分片 1</tspan></tspan></text></g></g><g id="SvgjsG1036" transform="translate(181,169)"><path id="SvgjsPath1037" d="M 0 0L 95 0L 95 46L 0 46Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1038"><text id="SvgjsText1039" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.375" transform="rotate(0)"><tspan id="SvgjsTspan1040" dy="16" x="47.5"><tspan id="SvgjsTspan1041" style="text-decoration:;">分片 2</tspan></tspan></text></g></g><g id="SvgjsG1042" transform="translate(317,169)"><path id="SvgjsPath1043" d="M 0 0L 95 0L 95 46L 0 46Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1044"><text id="SvgjsText1045" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.375" transform="rotate(0)"><tspan id="SvgjsTspan1046" dy="16" x="47.5"><tspan id="SvgjsTspan1047" style="text-decoration:;">分片 3</tspan></tspan></text></g></g><g id="SvgjsG1048"><path id="SvgjsPath1049" d="M92.5 168L92.5 109.6" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1050)"></path></g><g id="SvgjsG1052"><path id="SvgjsPath1053" d="M228.5 168L228.5 109.6" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1054)"></path></g><g id="SvgjsG1056"><path id="SvgjsPath1057" d="M364.5 168L364.5 109.6" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1058)"></path></g></svg>
  <p style="text-align:center; color: #888;">（from + size 查询时数据与分片模型）</p>
</div>

如上图，ES 把数据保存到 3 个主分片中，当使用 from = 90 和 size = 10 进行分页的时候，ES 会先从每个分片中分别获取 100 个文档，然后把这 300 个文档再汇聚到协调节点中进行排序，最后选出排序后的前 100 个文档，返回第 90 到 99 的文档。

可以看到，当页数变大（发生了深度分页）的时候，在每个分片中获取的数据就越多，消耗的资源就越多。并且如果分片越多，汇聚到协调节点的数据也越多，最终汇聚到协调节点的文档数为：`shard_amount * (from + size)`。

## search after

### 基本语法

使用 search after API 可以避免产生深度分页的问题，不过 **search after 不支持跳转到指定页数，只能一页页地往下翻**。

使用 search after 接口分为两步：

* 在 sort 中指定需要排序的字段，并且保证其值的唯一性（可以使用文档的 ID）。
* 在下一次查询时，带上返回结果中最后一个文档的 sort 值进行访问。

使用示例如下：

```bash
# 第一次调用 search after
POST books/_search
{
  "size": 2,
  "query": { "match_all": {} },
  "sort": [
    { "price": "desc" },
    { "_id": "asc" }
  ]
}

# 返回结果
"hits" : [
  {
    "_id" : "6",
    "_source" : {
      "book_id" : "4ee82467",
      "price" : 20.9
    },
    "sort" : [20.9, "6"]
  },
  {
    "_id" : "1",
    "_source" : {
      "book_id" : "4ee82462",
      "price" : 19.9
    },
    "sort" : [19.9, "1"]
  }
]
```

如上示例，在第一次调用 search after 时指定了 `sort` 的值，并且 `sort` 中指定以 `price` 倒序排序。为了保证排序的唯一性，我们指定了文档 `_id` 作为唯一值。

可以看到，第一次调用的返回结果中除了文档的信息外，还有 sort 相关的信息，在下一次调用的时候需要带上最后一个文档的 sort 值，示例中其值为：`[19.9, "1"]`。

下面是第二次调用 search after 接口进行翻页操作：

```bash
# 第二次调用 search after
POST books/_search
{
  "size": 2,
  "query": {
    "match_all": {}
  },
  "search_after":[19.9, "1"], # 设置为上次返回结果中最后一个文档的 sort 值
  "sort": [
    { "price": "desc" },
    { "_id": "asc" }
  ]
}
```

如上示例，进行翻页操作的时候在 search after 字段中设置上一次返回结果中最后一个文档的 `sort` 值，并且保持 sort 的内容不变。

### 翻页原理

那为什么 search after 不会产生深度分页的问题呢？其关键就是 `sort` 中指定的唯一排序值。

<div style="text-align: center;">
  <svg id="SvgjsSvg1007" width="457" height="241" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1050" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1051" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1054" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1055" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1058" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1059" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1008" transform="translate(25,26)"><path id="SvgjsPath1009" d="M 0 0L 407 0L 407 114L 0 114Z" stroke-dasharray="10,6" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="387px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="46.375" transform="rotate(0)"></text></g></g><g id="SvgjsG1012" transform="translate(45,59)"><path id="SvgjsPath1013" d="M 0 4Q 0 0 4 0L 91 0Q 95 0 95 4L 95 44Q 95 48 91 48L 4 48Q 0 48 0 44Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1014"><text id="SvgjsText1015" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="13.375" transform="rotate(0)"><tspan id="SvgjsTspan1016" dy="16" x="47.5"><tspan id="SvgjsTspan1017" style="text-decoration:;">10 个文档</tspan></tspan></text></g></g><g id="SvgjsG1018" transform="translate(181,59)"><path id="SvgjsPath1019" d="M 0 4Q 0 0 4 0L 91 0Q 95 0 95 4L 95 44Q 95 48 91 48L 4 48Q 0 48 0 44Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1020"><text id="SvgjsText1021" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="13.375" transform="rotate(0)"><tspan id="SvgjsTspan1022" dy="16" x="47.5"><tspan id="SvgjsTspan1023" style="text-decoration:;">10 个文档</tspan></tspan></text></g></g><g id="SvgjsG1024" transform="translate(317,59)"><path id="SvgjsPath1025" d="M 0 4Q 0 0 4 0L 91 0Q 95 0 95 4L 95 44Q 95 48 91 48L 4 48Q 0 48 0 44Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1026"><text id="SvgjsText1027" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="13.375" transform="rotate(0)"><tspan id="SvgjsTspan1028" dy="16" x="47.5"><tspan id="SvgjsTspan1029" style="text-decoration:;">10 个文档</tspan></tspan></text></g></g><g id="SvgjsG1030" transform="translate(45,170)"><path id="SvgjsPath1031" d="M 0 0L 95 0L 95 46L 0 46Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1032"><text id="SvgjsText1033" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.375" transform="rotate(0)"><tspan id="SvgjsTspan1034" dy="16" x="47.5"><tspan id="SvgjsTspan1035" style="text-decoration:;">分片 1</tspan></tspan></text></g></g><g id="SvgjsG1036" transform="translate(181,170)"><path id="SvgjsPath1037" d="M 0 0L 95 0L 95 46L 0 46Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1038"><text id="SvgjsText1039" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.375" transform="rotate(0)"><tspan id="SvgjsTspan1040" dy="16" x="47.5"><tspan id="SvgjsTspan1041" style="text-decoration:;">分片 2</tspan></tspan></text></g></g><g id="SvgjsG1042" transform="translate(317,170)"><path id="SvgjsPath1043" d="M 0 0L 95 0L 95 46L 0 46Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1044"><text id="SvgjsText1045" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.375" transform="rotate(0)"><tspan id="SvgjsTspan1046" dy="16" x="47.5"><tspan id="SvgjsTspan1047" style="text-decoration:;">分片 3</tspan></tspan></text></g></g><g id="SvgjsG1048"><path id="SvgjsPath1049" d="M92.5 169L92.5 110.6" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1050)"></path></g><g id="SvgjsG1052"><path id="SvgjsPath1053" d="M228.5 169L228.5 110.6" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1054)"></path></g><g id="SvgjsG1056"><path id="SvgjsPath1057" d="M364.5 169L364.5 110.6" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1058)"></path></g><g id="SvgjsG1060" transform="translate(25,25)"><path id="SvgjsPath1061" d="M 0 0L 63 0L 63 26L 0 26Z" stroke="none" fill="none"></path><g id="SvgjsG1062"><text id="SvgjsText1063" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="63px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="2.375" transform="rotate(0)"><tspan id="SvgjsTspan1064" dy="16" x="31.5"><tspan id="SvgjsTspan1065" style="text-decoration:;">协调节点</tspan></tspan></text></g></g></svg>
  <p style="text-align:center; color: #888;">（search after 查询时数据与分片模型）</p>
</div>

如上图，因为有了唯一的排序值做保证，所以每个分片只需要返回比 sort 中唯一值大的 size 个数据即可。

例如，上一次的查询返回的最后一个文档的 sort 为 `a`，那么这一次查询只需要在分片 1、2、3 中返回 size 个排序比 `a` 大的文档，协调节点汇总这些数据进行排序后返回 size 个结果给客户端。

而 from + size 的方式因为没有唯一排序值，所以**没法保证每个分片上的排序就是全局的排序**，必须把每个分片的 from + size 个数据汇总到协调节点进行排序处理，导致出现了深分页的问题。

因为 sort 的值是根据上一次请求结果来设置的，所以 search after 不支持跳转到指定的页数，甚至不能返回前一页，只能一页页往下翻。但我们可以结合缓存中间件，把每页返回的 sort 值缓存下来，即可实现往前翻页的功能。

## scroll API

当我们想对结果集进行遍历的时候，例如做全量数据导出时，可以使用 scroll API。**scroll API 会创建数据快照，后续的访问将会基于这个快照来进行，所以无法检索新写入的数据**。

scroll API 的使用示例如下：

```bash
# 第一次使用 scroll API
POST books/_search?scroll=10m
{
  "query": {
    "match_all": {}
  },
  "sort": { "price": "desc" }, 
  "size": 2
}

# 结果
{
  "_scroll_id" : "FGluY2x1ZGVfY29udGV4dF9......==",
  "hits" : {
    "hits" : [
      {
        "_id" : "6",
        "_source" : {
          "book_id" : "4ee82467",
          "price" : 20.9
        }
      },
      ......
    ]
  }
}
```

如上示例，在第一次使用 scroll API 时需要初始化 scroll 搜索并且创建快照，使用 scroll 查询参数指定本次「查询上下文」（快照）的有效时间，本示例中为 10 分钟。

其返回的结果中除了匹配文档的列表外还有 `_scroll_id`，我们需要在翻页请求中带上这个 `_scroll_id`：

```bash
# 进行翻页
POST /_search/scroll                                                    
{
  "scroll" : "5m",   
  "scroll_id" : "FGluY2x1ZGVfY29udGV4dF9......==" 
}
```

如上示例，我们把上一次返回结果中的 `_scroll_id` 值放到本次请求的 `scroll_id` 字段中，并且指定「查询上下文」的有效时间为 5 分钟。同样此次的返回结果也会带有新的 `_scroll_id`。

其实在 ES 7.10 中引入了 Point In Time 后，scroll API 就不建议被使用了。在新版的 ES 官方文档中建议使用 PIT + search after 代替 scroll API 来做分页和数据遍历，即使 scroll API 还可以使用。

## 新特性：Point In Time

Point In Time（PIT）是 ES 7.10 中引入的新特性，**PIT 是一个轻量级的数据状态视图，用户可以利用这个视图反复查询某个索引，仿佛这个索引的数据集停留在某个时间点上**。也就是说，在创建 PIT 之后更新的数据是无法被检索到的。

当我们想要获取、统计以当前时间节点为准的数据而不考虑后续数据更新的时候，PIT 就显得非常有用了。使用 PIT 前需要显式使用 `_pit` API 获取一个 PID ID：

```bash
# 使用 pit API 获取一个 PID ID
POST /books/_pit?keep_alive=20m

# 结果
{
  "id": "46ToAwMDaWR5BXV1aWQy......=="
}
```

如上示例，使用 `_pit` 接口获取了一个 PIT ID，`keep_alive` 参数设置了这个视图的有效时长。有了这个 PIT ID 后续的查询就可以结合它来进行了。

**PIT 可以结合 search after 进行查询，能有效保证数据的一致性**。用法和正常使用 search after 差不多，主要区别是需要在请求 body 中带上 PIT ID，示例如下：

```bash
# 第一次调用 search after，因为使用了 PIT，这个时候搜索不需要指定 index 了。
POST _search
{
  "size": 2,
  "query": { "match_all": {} },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQy......==", # 添加 PIT id
    "keep_alive": "5m" # 视图的有效时长
  },
  "sort": [
    { "price": "desc" } # 按价格倒序排序
  ]
}

# 结果
{
  "pit_id" : "46ToAwMDaWR5BXV1aWQy......==",
  "hits" : {
    "hits" : [
      {
        "_id" : "6",
        "_source" : {
          "book_id" : "4ee82467",
          "price" : 20.9
        },
        "sort" : [20.9, 8589934593]
      },
      {
        "_id" : "1",
        "_source" : {
          "book_id" : "4ee82462"
          "price" : 19.9
        },
        "sort" : [19.9, 8589934592]
      }
    ]
  }
}
```

如上示例，在 pit 字段中指定 PIT ID 和设置 `keep_alive` 来指定视图的有效时长。需要注意的是，**使用了 PIT 后不再需要在 sort 中指定唯一的排序值了，也不需要在路径中指定索引名称了**。

在其返回结果中，sort 数组中包含了两个元素，其中第一个是我们用作排序的 `price` 的值，第二个值是一个隐含的排序值。所有的 PIT 请求都会自动加入一个隐式的用于排序的字段称为：`_shard_doc`，当然这个排序值可以显式指定。**这个隐含的字段官方也称它为：tiebreaker（决胜字段），其代表的是文档的唯一值，保证了分页不会丢失或者分页结果的数据不会重复**，其作用就好像原 search after 的 sort 字段中要指定的唯一值一样。

在进行翻页的时候和原 search after 一样，需要把上次结果中最后一个文档的 sort 值带上：

```bash
# 第二次调用 search after，因为使用了 PIT，这个时候搜索不需要指定 index 了。
POST _search
{
  "size": 2,
  "query": {
    "match_all": {}
  },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQy......==", # 添加 PIT id
    "keep_alive": "5m" # 视图的有效时长
  },
  "search_after": [19.9, 8589934592], # 上次结果中最后一个文档的 sort 值
  "sort": [
    { "price": "desc" }
  ]
}
```

search after + PIT 实现的功能似乎和 scroll API 类似，那它们间有啥区别呢？

* 使用 scroll API 的时候，**scroll 产生的上下文是与本次查询绑定的**，很明显的一点就是，生成一个 scroll id 后，其他查询无法重用这个 id，scroll 的翻页也只能一直向下翻。
* 而 **PIT 可以允许用户在同一个固定数据集合上运行不同的查询，例如多个请求可以使用同一个 PIT 视图而互不影响**。


## 参考资料

* [Search after](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/paginate-search-results.html#search-after)

（完）
