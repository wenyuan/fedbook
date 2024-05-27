# Elasticsearch

> 本系列以 Elasticsearch 7.x 作为安装版本进行知识点梳理，最早接触的是 5.x 版本，其跟 2.x 前后相差还是挺大的。但 5.x 往后的便很少有 breaking changes 了。

**Elasticsearch 简介**：

Elasticsearch 是一个分布式、RESTful 风格的搜索和数据分析引擎。除了搜索领域外，Elasticsearch 与 Kibana、Logstash 组成的 ELK 系统还可以应用到日志采集、分析、监控等领域。

一般大家都会把 Elasticsearch 简称为 ES，后面的内容大都会用这个简称（有特别说明的除外）。

<hr>

**Elasticsearch 优点**：

* **可从数据中探寻各种问题的答案**：通过 Elasticsearch 你能够执行及合并多种类型的搜索（结构化数据、非结构化数据、地理位置、指标），搜索方式随心而变。
* **快到不可思议的速度**：你可以用快到令人惊叹的速度使用和访问你所有的数据。
  * ES 可以提供秒级的近实时性的搜索，但至少是一秒，是因为refresh 操作默认 1s 执行一次，即新 insert 的 doc，默认在 1s 后才能被检索到。
  * 但在精度要求极高的一些需求里，我们可以在插入时手动强制 refresh。大部分情况下不建议，但碰到这种需求的场景下正好数据压力不大。
* **高度的可扩展性**：它能够水平扩展，每秒钟可处理海量事件，同时能够自动管理索引和查询在集群中的分布方式，以实现极其流畅的操作。
  * 在我们的实际项目中，使用了 16 个节点的 ES 集群以应对每秒 2w 条数据实时写入的压力。
* **安全性和可靠性**：Elasticsearch 可以为你检测到硬件、网络分区等故障，并确保你的集群和数据的安全性和可用性。通过跨集群复制功能，辅助集群可以作为热备份随时投入使用。

<hr>

**这个系列主要整理**：

* 业务中解决搜索需求常用的 Elasticsearch DSL 语法。
* Elasticsearch 集群运维、调优经验。
* Elasticsearch 核心技术的实现原理。

<hr>

关于 Elasticsearch 的知识点，可以参考：

* [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.13/elasticsearch-intro.html)：这个非常重要，关于 API 使用的示例上面都有。早期网上没有那么多博客和教程的时候，很多复杂的聚合查询和计算指标的 DSL 语法，都能通过反复研读文档直接或间接摸索出来。
* 《Elasticsearch 源码解析与优化实战》：基于 6.x 源码分析的书本。
* [Elasticsearch 权威指南](https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html)：这个是官方的资料，不过内容是基于 2.x 版本的，部分内容已经过时了，现在走马观花地看看简介就行了。

<div style="text-align: right">
  <svg width="64px" height="64px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="icon-/-product-logo-/-64x64px-/-elastic-sesrch-/-color" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="logo-elastic-search-64x64-color" transform="translate(8.000000, 4.999500)"><path d="M47.7246,9.708 L47.7276,9.702 C42.7746,3.774 35.3286,0 26.9996,0 C16.4006,0 7.2326,6.112 2.8136,15 L38.0056,15 C40.5306,15 42.9886,14.13 44.9206,12.504 C45.9246,11.659 46.8636,10.739 47.7246,9.708" id="Fill-1" fill="#FEC514"></path><path d="M0,27.0005 C0,29.4225 0.324,31.7675 0.922,34.0005 L34,34.0005 C37.866,34.0005 41,30.8665 41,27.0005 C41,23.1345 37.866,20.0005 34,20.0005 L0.922,20.0005 C0.324,22.2335 0,24.5785 0,27.0005" id="Fill-4" fill="#343741"></path><path d="M47.7246,44.293 L47.7276,44.299 C42.7746,50.227 35.3286,54.001 26.9996,54.001 C16.4006,54.001 7.2326,47.889 2.8136,39.001 L38.0056,39.001 C40.5306,39.001 42.9886,39.871 44.9206,41.497 C45.9246,42.342 46.8636,43.262 47.7246,44.293" id="Fill-6" fill="#00BFB3"></path></g></g></svg>
</div>
