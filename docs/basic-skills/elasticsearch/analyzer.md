# 分词器的原理和使用

## 前言

我们存储到 ES 中的数据大致可以分为以下两种：

* **全文本**，例如文章内容、通知内容等。
* **精确值**，如实体 ID 等。

在对这两类值进行查询的时候，精确值类型会比较它们的二进制值，其结果只有相等或者不相等。而对全文本类型进行等值比较是不太现实的，一是用相关性评分来评估两个文本是否相似。**而要得到相关性评分，我们就需要对全文本进行分词处理，然后得到统计数据才能进行评估**。

## 分词与分词器

**分词**（Analysis）是将全文本转换为一系列单词的过程，这些单词称为 **term 或者 token**。

分词是通过**分词器**（Analyzer）来实现的，比如用于中文分词的 IK 分词器等。ES 内置了一些常用的分词器，如果不能满足需求，也可以安装第三方的分词器或者定制化自己的分词器。

**除了在数据写入的时候对数据进行分词，在对全文本进行查询的时候也需要使用相同的分词器对检索内容进行分析**。例如，查询 `"Java Book"` 的时候会分为 `"java"` 和 `"book"` 这两个单词。

## 分词器的组成

分词器主要由 3 部分组成。

* **Character Filter**：主要对原文本进行格式处理，如去除 html 标签等。
* **Tokenize**r：按照指定的规则对文本进行切分，比如按空格来切分单词，同时也负责标记出每个单词的顺序、位置以及单词在原文本中开始和结束的偏移量。
* **Token Filter**：对切分后的单词进行处理，如转换为小写、删除停用词、增加同义词、词干化等。

如下图就是分词器工作的流程，**需要进行分词的文本依次通过 Character Filter、Tokenizer、Token Filter，最后得出切分后的词项**。

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="453" height="320" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1058" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1059" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1062" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1063" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1008" transform="translate(25,25)"><path id="SvgjsPath1009" d="M 0 0L 403 0L 403 44L 0 44Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="383px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="11.375" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="16" x="201.5"><tspan id="SvgjsTspan1013" style="text-decoration:;">需要处理的文本：张三是中国人</tspan></tspan></text></g></g><g id="SvgjsG1014" transform="translate(25,124)"><path id="SvgjsPath1015" d="M 0 0L 403 0L 403 90L 0 90Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="383px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.375" transform="rotate(0)"></text></g></g><g id="SvgjsG1018" transform="translate(44,149)"><path id="SvgjsPath1019" d="M 0 4Q 0 0 4 0L 111 0Q 115 0 115 4L 115 36Q 115 40 111 40L 4 40Q 0 40 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffcdd2"></path><g id="SvgjsG1020"><text id="SvgjsText1021" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="95px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1022" dy="16" x="57.5"><tspan id="SvgjsTspan1023" style="text-decoration:;">Character Filter</tspan></tspan></text></g></g><g id="SvgjsG1024" transform="translate(194,149)"><path id="SvgjsPath1025" d="M 0 4Q 0 0 4 0L 78 0Q 82 0 82 4L 82 36Q 82 40 78 40L 4 40Q 0 40 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#b2ebf2"></path><g id="SvgjsG1026"><text id="SvgjsText1027" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="62px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1028" dy="16" x="41"><tspan id="SvgjsTspan1029" style="text-decoration:;">Tokenizer</tspan></tspan></text></g></g><g id="SvgjsG1030" transform="translate(311,149)"><path id="SvgjsPath1031" d="M 0 4Q 0 0 4 0L 93 0Q 97 0 97 4L 97 36Q 97 40 93 40L 4 40Q 0 40 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#fff9c4"></path><g id="SvgjsG1032"><text id="SvgjsText1033" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="77px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1034" dy="16" x="48.5"><tspan id="SvgjsTspan1035" style="text-decoration:;">Token Filter</tspan></tspan></text></g></g><g id="SvgjsG1036" transform="translate(73,267)"><path id="SvgjsPath1037" d="M 0 4Q 0 0 4 0L 96 0Q 100 0 100 4L 100 24Q 100 28 96 28L 4 28Q 0 28 0 24Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1038"><text id="SvgjsText1039" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="80px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="3.375" transform="rotate(0)"><tspan id="SvgjsTspan1040" dy="16" x="50"><tspan id="SvgjsTspan1041" style="text-decoration:;">张三</tspan></tspan></text></g></g><g id="SvgjsG1042" transform="translate(280,267)"><path id="SvgjsPath1043" d="M 0 4Q 0 0 4 0L 96 0Q 100 0 100 4L 100 24Q 100 28 96 28L 4 28Q 0 28 0 24Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1044"><text id="SvgjsText1045" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="80px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="3.375" transform="rotate(0)"><tspan id="SvgjsTspan1046" dy="16" x="50"><tspan id="SvgjsTspan1047" style="text-decoration:;">中国人</tspan></tspan></text></g></g><g id="SvgjsG1048" transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,246,117)"><path id="SvgjsPath1049" d="M 16.5 0L 33 16.5L 22.110000000000003 16.5L 22.110000000000003 42L 10.89 42L 10.89 16.5L 0 16.5L 16.5 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1050"><text id="SvgjsText1051" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="47px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.474999999999998" transform="rotate(0)"></text></g></g><g id="SvgjsG1052" transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,245,260)"><path id="SvgjsPath1053" d="M 16.5 0L 33 16.5L 22.110000000000003 16.5L 22.110000000000003 42L 10.89 42L 10.89 16.5L 0 16.5L 16.5 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1054"><text id="SvgjsText1055" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="47px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.474999999999998" transform="rotate(0)"></text></g></g><g id="SvgjsG1056"><path id="SvgjsPath1057" d="M160 169L190.39999999999998 169" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1058)"></path></g><g id="SvgjsG1060"><path id="SvgjsPath1061" d="M277 169L307.4 169" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1062)"></path></g></svg>
  <p style="text-align: center; color: #888;">（分词过程示例）</p>
</div>

## ES 内置的分词器

为了方便用户使用，ES 为用户提供了多个内置的分词器，常见的有以下 8 种。

* **Standard Analyzer**：这个是默认的分词器，使用 Unicode 文本分割算法，将文本按单词切分并且转为小写。
* **Simple Analyzer**：按照非字母切分并且进行小写处理。
* **Stop Analyzer**：与 Simple Analyzer 类似，但增加了停用词过滤（如 `a`、`an`、`and`、`are`、`as`、`at`、`be`、`but` 等）。
* **Whitespace Analyzer**：使用空格对文本进行切分，并不进行小写转换。
* **Pattern Analyzer**：使用正则表达式切分，默认使用 `\W+`（非字符分隔）。支持小写转换和停用词删除。
* **Keyword Analyzer**：不进行分词。
* **Language Analyzer**：提供了多种常见语言的分词器。如 Irish、Italian、Latvian 等。
* **Customer Analyzer**：自定义分词器。

### _analyze API

`_analyze` API 是一个非常有用的工具，它可以**帮助我们查看分词器是如何工作的**。[`_analyze`](https://www.elastic.co/guide/en/elasticsearch/reference/current/test-analyzer.html) API 提供了 3 种方式来查看分词器是如何工作的。

#### 第一种方式

使用 `_analyze` API 直接指定 Analyzer 来进行测试，示例如下：

```bash
GET _analyze
{
  "analyzer": "standard",
  "text": "Your cluster could be accessible to anyone."
}

# 结果
{
  "tokens": [
    {
      "token": "your",
      "start_offset": 0,
      "end_offset": 4,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "cluster",
      "start_offset": 5,
      "end_offset": 12,
      "type": "<ALPHANUM>",
      "position": 1
    }
    ......
  ]
}
```

如上示例，在这段代码中我们可以看到它将 text 的内容用 standard 分词器进行分词，text 的内容按单词进行了切分并且 `Your` 转为了小写。

#### 第二种方式

对指定的索引进行测试，示例如下：

```bash
# 创建和设置索引
PUT my-index
{
  "mappings": {
    "properties": {
      "my_text": {
        "type": "text",
        "analyzer": "standard"  # my_text字段使用了standard分词器
      }
    }
  }
}

GET my-index/_analyze 
{
  "field": "my_text", # 直接使用my_text字段已经设置的分词器
  "text":  "Is this déjà vu?"
}

# 结果：
{
  "tokens": [
    {
      "token": "is",
      "start_offset": 0,
      "end_offset": 2,
      "type": "<ALPHANUM>",
      "position": 0
    },
    ......
  ]
}
```

如上示例可以看到，text 字段的内容使用了 my-index 索引设置的 standard 分词器来进行分词。

#### 第三种方式

组合 tokenizer、filters、character filters 进行测试，示例如下：

```bash
GET _analyze 
{
  "tokenizer": "standard",                    # 指定一个tokenizer
  "filter":  [ "lowercase", "asciifolding" ], # 可以组合多个token filter
  # "char_filter":"html_strip", 可以指定零个 Character Filter
  "text": "java app"
}
```

从上面的示例可以看到，tokenizer 使用了 standard 而 token filter 使用了 lowercase 和 asciifolding 来对 text 的内容进行切分。用户可以组合一个 tokenizer、零个或多个 token filter、零个或多个 character filter。

### 分词器工作流程

下面以 Standard Analyzer 为例演示分词器的工作流程。

Standard Analyzer 是 ES 默认的分词器，它会将输入的内容按词切分，并且将切分后的词进行小写转换，默认情况下停用词（Stop Word）过滤功能是关闭的。

<div style="text-align: center;">
  <svg id="SvgjsSvg1064" width="424" height="499" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1065"><marker id="SvgjsMarker1084" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1085" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1098" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1099" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1132" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1133" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1066" transform="translate(39.25,94.5)"><path id="SvgjsPath1067" d="M 0 0L 345 0L 345 78L 0 78Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1068"><text id="SvgjsText1069" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="325px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="28.375" transform="rotate(0)"></text></g></g><g id="SvgjsG1070" transform="translate(45.25,25)"><path id="SvgjsPath1071" d="M 0 0L 333 0L 333 28L 0 28Z" stroke="none" fill="none"></path><g id="SvgjsG1072"><text id="SvgjsText1073" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="333px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="0" transform="rotate(0)"><tspan id="SvgjsTspan1074" dy="20" x="166.5"><tspan id="SvgjsTspan1075" style="text-decoration:;">Your cluster could be accessible to anyone.</tspan></tspan></text></g></g><g id="SvgjsG1076" transform="translate(38.25,98)"><path id="SvgjsPath1077" d="M 0 0L 78 0L 78 28L 0 28Z" stroke="none" fill="none"></path><g id="SvgjsG1078"><text id="SvgjsText1079" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="78px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="3.375" transform="rotate(0)"><tspan id="SvgjsTspan1080" dy="16" x="39"><tspan id="SvgjsTspan1081" style="text-decoration:;">Tokenizer</tspan></tspan></text></g></g><g id="SvgjsG1082"><path id="SvgjsPath1083" d="M211.75 54L211.75 90.9" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1084)"></path></g><g id="SvgjsG1086" transform="translate(38.25,214)"><path id="SvgjsPath1087" d="M 0 0L 347 0L 347 191L 0 191Z" stroke="rgba(158,158,158,1)" stroke-width="2" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1088"><text id="SvgjsText1089" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="327px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="84.875" transform="rotate(0)"></text></g></g><g id="SvgjsG1090" transform="translate(38.25,216)"><path id="SvgjsPath1091" d="M 0 0L 97 0L 97 28L 0 28Z" stroke="none" fill="none"></path><g id="SvgjsG1092"><text id="SvgjsText1093" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="97px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="3.375" transform="rotate(0)"><tspan id="SvgjsTspan1094" dy="16" x="48.5"><tspan id="SvgjsTspan1095" style="text-decoration:;">Token Filters</tspan></tspan></text></g></g><g id="SvgjsG1096"><path id="SvgjsPath1097" d="M211.75 173.5L211.75 210.39999999999998" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1098)"></path></g><g id="SvgjsG1100" transform="translate(133.75,296.5)"><path id="SvgjsPath1101" d="M 0 4Q 0 0 4 0L 152 0Q 156 0 156 4L 156 37Q 156 41 152 41L 4 41Q 0 41 0 37Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1102"><text id="SvgjsText1103" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="136px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.875" transform="rotate(0)"><tspan id="SvgjsTspan1104" dy="16" x="78"><tspan id="SvgjsTspan1105" style="text-decoration:;">Lower Case：小写转换</tspan></tspan></text></g></g><g id="SvgjsG1106" transform="translate(131.25,116)"><path id="SvgjsPath1107" d="M 0 4Q 0 0 4 0L 152 0Q 156 0 156 4L 156 37Q 156 41 152 41L 4 41Q 0 41 0 37Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1108"><text id="SvgjsText1109" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="136px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.875" transform="rotate(0)"><tspan id="SvgjsTspan1110" dy="16" x="78"><tspan id="SvgjsTspan1111" style="text-decoration:;">Standard：按词切分</tspan></tspan></text></g></g><g id="SvgjsG1112" transform="translate(133.75,241)"><path id="SvgjsPath1113" d="M 0 4Q 0 0 4 0L 152 0Q 156 0 156 4L 156 37Q 156 41 152 41L 4 41Q 0 41 0 37Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1114"><text id="SvgjsText1115" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="136px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.875" transform="rotate(0)"><tspan id="SvgjsTspan1116" dy="16" x="78"><tspan id="SvgjsTspan1117" style="text-decoration:;">Standard</tspan></tspan></text></g></g><g id="SvgjsG1118" transform="translate(133.75,352)"><path id="SvgjsPath1119" d="M 0 4Q 0 0 4 0L 152 0Q 156 0 156 4L 156 37Q 156 41 152 41L 4 41Q 0 41 0 37Z" stroke="rgba(255,152,0,1)" stroke-width="2" fill-opacity="1" fill="#ffe0b2"></path><g id="SvgjsG1120"><text id="SvgjsText1121" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="136px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.875" transform="rotate(0)"><tspan id="SvgjsTspan1122" dy="16" x="78"><tspan id="SvgjsTspan1123" style="text-decoration:;">Stop Word (默认关闭)</tspan></tspan></text></g></g><g id="SvgjsG1124" transform="translate(25,442)"><path id="SvgjsPath1125" d="M 0 0L 373.5 0L 373.5 32L 0 32Z" stroke="none" fill="none"></path><g id="SvgjsG1126"><text id="SvgjsText1127" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="374px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="2" transform="rotate(0)"><tspan id="SvgjsTspan1128" dy="20" x="187"><tspan id="SvgjsTspan1129" style="text-decoration:;">[your, cluster, could, be, accessible, to, anyone]</tspan></tspan></text></g></g><g id="SvgjsG1130"><path id="SvgjsPath1131" d="M211.75 406L211.75 438.4" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1132)"></path></g></svg>
  <p style="text-align: center; color: #888;">（Standard Analyzer 工作流程）</p>
</div>

在 Kibana 中运行这个例子：

```bash
GET _analyze
{
  "analyzer": "standard", # 设定分词器为 standard
  "text": "Your cluster could be accessible to anyone."
}

# 结果
{
  "tokens": [
    {
      "token": "your",
      "start_offset": 0,
      "end_offset": 4,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "cluster",
      "start_offset": 5,
      "end_offset": 12,
      "type": "<ALPHANUM>",
      "position": 1
    } 
    ......
  ]
}
```

如上示例，从其结果中可以看出，单词 `You` 做了小写转换，停用词 `be` 没有被去掉，并且返回结果里记录了这个单词在原文本中的开始偏移、结束偏移以及这个词出现的位置。

其他内置分词器的使用与 Standard Analyzer 没有太多的差异，但各有各的特点，可以参考官方文档：[Text analysis](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-analyzers.html)。

## 自定义分词器

除了使用内置的分词器外，我们还可以通过组合 Tokenizer、Filters、Character Filters 来自定义分词器。其用例如下：

```bash
PUT my-index-001
{
  "settings": {
    "analysis": {
      "char_filter": {             # 自定义char_filter
        "and_char_filter": {
          "type": "mapping",
          "mappings": ["& => and"] # 将 '&' 转换为 'and'
        }
      },
      "filter": {                  # 自定义 filter
        "an_stop_filter": {
          "type": "stop",
          "stopwords": ["an"]      # 设置 "an" 为停用词
        }
      },
      "analyzer": {                # 自定义分词器为 custom_analyzer
        "custom_analyzer": {
          "type": "custom",
          # 使用内置的html标签过滤和自定义的 my_char_filter
          "char_filter": ["html_strip", "and_char_filter"],
          "tokenizer": "standard",
          # 使用内置的 lowercase filter 和自定义的 my_filter
          "filter": ["lowercase", "an_stop_filter"]
        }
      }
    }
  }
}


GET my-index-001/_analyze
{
  "analyzer": "custom_analyzer",
  "text": "Tom & Gogo bought an orange <span> at an orange shop"
}
```

可以在 Kibana 中运行上述的语句并且查看结果是否符合预期，`Tom` 和 `Gogo` 将会变成小写，而 `&` 会转为 `and`，`an` 这个停用词和 `<span>` 这个 html 标签将会被处理掉，但 `at` 不会。

ES 的内置分词器可以很方便地处理英文字符，但对于中文却并不那么好使，一般我们需要依赖第三方的分词器插件才能满足日常需求。

## 中文分词器

中文分词不像英文分词那样可以简单地以空格来分隔，而是要分成有含义的词汇，但相同的词汇在不同的语境下有不同的含义。社区中有很多优秀的分词器，这里列出几个日常用得比较多的。

* [analysis-icu](https://github.com/elastic/elasticsearch/tree/master/plugins/analysis-icu)：这是官方的插件，其将 Lucene ICU module 融入了 ES 中，使用 ICU 函数库来提供处理 Unicode 的工具。
* [IK](https://github.com/medcl/elasticsearch-analysis-ik)：支持自定义词典和词典热更新。
* [THULAC](https://github.com/microbun/elasticsearch-thulac-plugin)：其安装和使用官方文档中有详细的说明，这里就不再赘述了。

### analysis-icu 分词器

analysis-icu 是官方的插件，安装如下：

```bash
# 进入脚本目录
# 参见ES 的安装一节我们安装在 /opt/elasticsearch-7.13.0
# 多节点集群需要对每个节点分别进行安装

cd /opt/elasticsearch-7.13.0

bin/elasticsearch-plugin install https://artifacts.elastic.co/downloads/elasticsearch-plugins/analysis-icu/analysis-icu-7.13.0.zip

# 如果安装出错，并且提示你没有权限，请加上 sudo：

sudo bin/elasticsearch-plugin install https://artifacts.elastic.co/downloads/elasticsearch-plugins/analysis-icu/analysis-icu-7.13.0.zip
```

使用示例如下：

```bash
POST _analyze
{  
    "analyzer": "icu_analyzer",
    "text": "Linus 在90年代开发出了linux操作系统"  
}

# 结果
{
  "tokens" : [
    ......
    {
      "token" : "开发",
      "start_offset" : 11,
      "end_offset" : 13,
      "type" : "<IDEOGRAPHIC>",
      "position" : 4
    },
    {
      "token" : "出了",
      "start_offset" : 13,
      "end_offset" : 15,
      "type" : "<IDEOGRAPHIC>",
      "position" : 5
    },
    {
      "token" : "linux",
      "start_offset" : 15,
      "end_offset" : 20,
      "type" : "<ALPHANUM>",
      "position" : 6
    }
    ......
  ]
}
```

通过在 Kibana 上运行上述查询语句，可以看到结果与 Standard Analyzer 是不一样的，同样你可以将得出的结果和下面的 IK 分词器做一下对比，看看哪款分词器更适合你的业务。更详细的使用文档可以查看：[官方文档](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu-analyzer.html)

### IK 分词器

IK 的算法是基于词典的，其支持自定义词典和词典热更新。下面来安装 IK 分词器插件：

```bash
# 还是一样，多节点集群需要对每个节点分别进行安装

cd /opt/elasticsearch-7.13.0

# 如果因为没有权限而安装失败的话，使用 sudo 命令来安装
./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.13.0/elasticsearch-analysis-ik-7.13.0.zip
```

**在每个节点**执行完上述指令后，需要**重启服务才能使插件生效**。重启后，可以在 Kibana 中测试一下 IK 中文分词器的效果了。

```bash
POST _analyze
{  
    "analyzer": "ik_max_word",
    "text": "Linus 在90年代开发出了linux操作系统"  
}

POST _analyze
{  
    "analyzer": "ik_smart",
    "text": "Linus 在90年代开发出了linux操作系统"  
}
```

如上示例可以看到，**IK 有两种模式：`ik_max_word` 和 `ik_smart`**，它们的区别可总结为如下（以下是 IK 项目的原文）。

* **`ik_max_word`**：会将文本做最细粒度的拆分，比如会将 `"中华人民共和国国歌"` 拆分为 `"中华人民共和国、中华人民、中华、华人、人民共和国、人民、人、民、共和国、共和、和、国国、国歌"`，会穷尽各种可能的组合，适合 Term Query。
* **`ik_smart`**：会做最粗粒度的拆分，比如会将 `"中华人民共和国国歌"` 拆分为 `"中华人民共和国、国歌"`，适合 Phrase 查询。

关于 IK 分词器插件更详细的使用信息，可以参考 [IK 项目](https://github.com/medcl/elasticsearch-analysis-ik/tree/v7.13.0)的文档。

（完）
