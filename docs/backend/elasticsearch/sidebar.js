module.exports = [
  {
    title: 'Elasticsearch 基础知识',
    collapsable: false,
    children: [
      {
        title: 'ES 中的概念与名词',
        path: '/backend/elasticsearch/concepts-and-noun'
      },
      {
        title: '正排索引与倒排索引',
        path: '/backend/elasticsearch/forward-and-inverted-index'
      },
      {
        title: '文档基本操作',
        path: '/backend/elasticsearch/document-crud'
      },
      {
        title: '全文搜索语法',
        path: '/backend/elasticsearch/match-query'
      },
      {
        title: 'Term 查询语法',
        path: '/backend/elasticsearch/term-query'
      },
      {
        title: '组合查询语法',
        path: '/backend/elasticsearch/compound-query'
      },
      {
        title: '搜索词自动补全语法',
        path: '/backend/elasticsearch/suggester-query'
      },
      {
        title: '统计语法：聚合查询',
        path: '/backend/elasticsearch/aggregations'
      },
      {
        title: '嵌套类型和父子文档',
        path: '/backend/elasticsearch/nested-and-join'
      },
      {
        title: '分词器的原理和使用',
        path: '/backend/elasticsearch/analyzer'
      },
      {
        title: '分页查询的三种语法',
        path: '/backend/elasticsearch/paging-query'
      }
    ]
  },
  {
    title: 'Elasticsearch 日常运维',
    collapsable: false,
    children: [
      {
        title: 'ES 的安装',
        path: '/backend/elasticsearch/installation-of-elasticsearch'
      },
      {
        title: '命令行操作',
        path: '/backend/elasticsearch/command-with-curl'
      },
      {
        title: '集群管理 API',
        path: '/backend/elasticsearch/cluster-manage-apis'
      },
      {
        title: '索引管理 API',
        path: '/backend/elasticsearch/index-manage-apis'
      },
      {
        title: '定义字段类型：Mapping',
        path: '/backend/elasticsearch/mapping'
      },
      {
        title: '索引模板：Index Template',
        path: '/backend/elasticsearch/index-template'
      },
      {
        title: 'ES 集群性能优化小记录',
        path: '/backend/elasticsearch/performance-optimization'
      }
    ]
  }
]
