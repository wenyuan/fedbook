# 索引模板：Index Template

## 前言

索引模板：就是把已经创建好的某个索引的参数设置（settings）和索引映射（mappings）保存下来作为模板，在创建新索引时，ES 根据 index 名称去匹配相应的模板，就可以直接重用已经定义好的模板中的设置和映射。

* 模板仅在一个索引被新创建时，才会产生作用，修改模板不会影响已创建的索引。
* 可以设定多个索引模板，这些设置会被 merge 在一起。
* 可以指定 order 的数值，控制 merging 的过程。
* [create index API](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/indices-create-index.html) 请求中指定的设置和映射会覆盖索引模板中指定的配置。

索引模板一般用在时间序列相关的索引中，也就是说，如果你需要每间隔一定的时间就建立一次索引，那么只需要配置好索引模板，以后就可以直接使用这个模板中的设置，不用每次都设置 settings 和 mappings。

<div style="text-align: center;">
  <svg id="SvgjsSvg1602" width="518" height="260.5" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1603"></defs><g id="SvgjsG1604" transform="translate(25,137)"><path id="SvgjsPath1605" d="M 0 40L 47.5 0L 95 40L 47.5 80Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1606"><text id="SvgjsText1607" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="75px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="29.775" transform="rotate(0)"><tspan id="SvgjsTspan1608" dy="16" x="47.5"><tspan id="SvgjsTspan1609" style="text-decoration:;">客户端</tspan></tspan></text></g></g><g id="SvgjsG1610" transform="translate(70,63)"><path id="SvgjsPath1611" d="M 0 33.5C 0 -11.166666666666666 130 -11.166666666666666 130 33.5Q 127.39999999999999 65.66 65 67Q 43.333333333333336 67 21.666666666666668 60.300000000000004L 0 67L 15.21 57.419Q 0 46.9 0 33.5" stroke="none" fill-opacity="1" fill="#64b5f6"></path><g id="SvgjsG1612"><text id="SvgjsText1613" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="110px" fill="#ffffff" font-weight="400" align="middle" lineHeight="150%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.75" transform="rotate(0)"><tspan id="SvgjsTspan1614" dy="19" x="65"><tspan id="SvgjsTspan1615" style="text-decoration:;">是时候为另外一个</tspan></tspan><tspan id="SvgjsTspan1616" dy="19" x="65"><tspan id="SvgjsTspan1617" style="text-decoration:;">月生成 index 了</tspan></tspan></text></g></g><g id="SvgjsG1618" transform="translate(249,103.5)"><path id="SvgjsPath1619" d="M 0 0L 211 0L 211 132L 0 132Z" stroke="rgba(224,224,224,1)" stroke-width="1" fill-opacity="1" fill="#f5f5f5"></path><g id="SvgjsG1620"><text id="SvgjsText1621" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="191px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="55.375" transform="rotate(0)"></text></g></g><g id="SvgjsG1622" transform="translate(275,110.5)"><path id="SvgjsPath1623" d="M 0 0L 115 0L 115 34L 0 34Z" stroke="rgba(129,199,132,1)" stroke-width="1" fill-opacity="1" fill="#b5ffb7"></path><g id="SvgjsG1624"><text id="SvgjsText1625" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="95px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="6.375" transform="rotate(0)"><tspan id="SvgjsTspan1626" dy="16" x="57.5"><tspan id="SvgjsTspan1627" style="text-decoration:;">syslog-2022.03</tspan></tspan></text></g></g><g id="SvgjsG1628" transform="translate(294,152.5)"><path id="SvgjsPath1629" d="M 0 0L 115 0L 115 34L 0 34Z" stroke="rgba(129,199,132,1)" stroke-width="1" fill-opacity="1" fill="#b5ffb7"></path><g id="SvgjsG1630"><text id="SvgjsText1631" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="95px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="6.375" transform="rotate(0)"><tspan id="SvgjsTspan1632" dy="16" x="57.5"><tspan id="SvgjsTspan1633" style="text-decoration:;">syslog-2022.02</tspan></tspan></text></g></g><g id="SvgjsG1634" transform="translate(319,194.5)"><path id="SvgjsPath1635" d="M 0 0L 115 0L 115 34L 0 34Z" stroke="rgba(129,199,132,1)" stroke-width="1" fill-opacity="1" fill="#b5ffb7"></path><g id="SvgjsG1636"><text id="SvgjsText1637" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="95px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="6.375" transform="rotate(0)"><tspan id="SvgjsTspan1638" dy="16" x="57.5"><tspan id="SvgjsTspan1639" style="text-decoration:;">syslog-2022.01</tspan></tspan></text></g></g><g id="SvgjsG1640" transform="translate(334,25)"><path id="SvgjsPath1641" d="M 0 36.25C 0 -12.083333333333334 159 -12.083333333333334 159 36.25Q 155.82 71.05 79.5 72.5Q 53 72.5 26.5 65.25L 0 72.5L 18.603 62.1325Q 0 50.75 0 36.25" stroke="none" fill-opacity="1" fill="#64b5f6"></path><g id="SvgjsG1642"><text id="SvgjsText1643" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="139px" fill="#ffffff" font-weight="400" align="middle" lineHeight="150%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="2.5" transform="rotate(0)"><tspan id="SvgjsTspan1644" dy="19" x="79.5"><tspan id="SvgjsTspan1645" style="text-decoration:;">使用一个</tspan></tspan><tspan id="SvgjsTspan1646" dy="19" x="79.5"><tspan id="SvgjsTspan1647" style="text-decoration:;">index template </tspan><tspan id="SvgjsTspan1648" style="text-decoration:;font-size: inherit;">将简化</tspan></tspan><tspan id="SvgjsTspan1649" dy="19" x="79.5"><tspan id="SvgjsTspan1650" style="text-decoration:;font-size: inherit;">这个过程</tspan></tspan></text></g></g></svg>
  <p style="text-align:center; color: #888;">（时序索引很适合用索引模板）</p>
</div>

## 工作方式

当一个索引被创建时，会依次经历大致如下四个过程：

* 使用 ES 默认的 settings 和 mappings
* 使用 `order` 数值低的 Index Template 中的设定
* 使用 `order` 数值高的 Index Template 中的设定，之前的设定会被覆盖
* 使用创建索引时，用户所指定的 settings 和 mappings，并覆盖之前模板的设定

## 创建索引模板

可以使用如下的接口来定义一个 index template：

```bash
PUT /_template/<index-template>
```

实际例子：

```bash
PUT _template/syslog_template
{
  "index_patterns": "syslog-*",
  "order": 1, 
  "settings": {
    "number_of_shards": 4,
    "number_of_replicas": 1
  },
  "mappings": { 
    "properties": {
      "@timestamp": {
        "type": "date"
      }
    }
  }
}
```

注意 order 的值越大，权重越大，最后更有可能使用它（除非被 create index API 覆盖）。

## 索引匹配多个模板

一个索引可能同时匹配上了索引模板，在这种情况下，设置和映射都合并到索引的最终配置中。可以使用 order 参数控制合并的顺序，首先应用较低的顺序，并且覆盖它们的较高顺序。例如：

```bash
PUT /_template/template_1
{
  "index_patterns": ["*"],
  "order": 0,
  "settings": {
    "number_of_shards": 1
  },
  "mappings": {
    "_source": {
      "enabled": false
    }
  }
}

PUT /_template/template_2
{
  "index_patterns": ["te*"],
  "order": 1,
  "settings": {
    "number_of_shards": 1
  },
  "mappings": {
    "_source": {
      "enabled": true
    }
  }
}
```

以上的 `template_1` 将禁用存储 `_source`，但对于以 `te*` 开头的索引，仍将启用 `_source`。

创建一个例子看看：

```bash {10}
PUT test10

GET test10


# 显示结果
{
  "test10" : {
    "aliases" : { },
    "mappings" : { },  # 空白就是 true 的意思
    "settings" : {
      "index" : {
        "creation_date" : "1658469249000",
        "number_of_shards" : "1",
        "number_of_replicas" : "1",
        "uuid" : "iEwaQFl9RAKyTt79PduN-Q",
        "version" : {
          "created" : "7030099"
        },
        "provided_name" : "test10"
      }
    }
  }
}
```

再创建一个不是以 `te` 开头的 index，就是另外一种情况了：

```bash {12}
PUT my_test_index

GET my_test_index


# 显示结果
{
  "my_test_index" : {
    "aliases" : { },
    "mappings" : {  # 显然在 mappings 里显示 source 是被禁止的
      "_source" : {
        "enabled" : false
      }
    },
    "settings" : {
      "index" : {
        "creation_date" : "1658469249000",
        "number_of_shards" : "1",
        "number_of_replicas" : "1",
        "uuid" : "aSsIZMT2RyWKT44G2dF2zg",
        "version" : {
          "created" : "7030099"
        },
        "provided_name" : "my_test_index"
      }
    }
  }
}
```

如果对于两个 templates 来说，如果 order 是一样的话，我们可能陷于一种不可知论的合并状态，在实际的使用中必须避免。

## 查看索引模板

```bash
GET _template                # 查看所有模板
GET _template/temp*          # 查看与通配符相匹配的模板
GET _template/temp1,temp2    # 查看多个模板
GET _template/my_template    # 查看指定模板
```

## 判断模板是否存在

```bash
HEAD _template/my_template
```

* 如果存在, 响应结果是: 200 - OK
* 如果不存在, 响应结果是: 404 - Not Found

## 删除索引模板

```bash
DELETE _template/my_template
```

## 参考资料

* [Index templates](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/index-templates.html)
* [Index Settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/index-modules.html#index-modules-settings)
* [Mapping](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/mapping.html)

（完）
