module.exports = [
  {
    title: 'Elasticsearch 基础知识',
    collapsable: false,
    children: [
      {
        title: 'ES 中的概念与名词',
        path: '/basic-skills/elasticsearch/concepts-and-noun'
      },
      {
        title: '正排索引与倒排索引',
        path: '/basic-skills/elasticsearch/forward-and-inverted-index'
      },
      {
        title: '文档基本操作',
        path: '/basic-skills/elasticsearch/document-crud'
      },
      {
        title: '全文搜索语法',
        path: '/basic-skills/elasticsearch/match-query'
      },
      {
        title: 'Term 查询语法',
        path: '/basic-skills/elasticsearch/term-query'
      },
      {
        title: '组合查询语法',
        path: '/basic-skills/elasticsearch/compound-query'
      },
      {
        title: '搜索词自动补全语法',
        path: '/basic-skills/elasticsearch/suggester-query'
      },
      {
        title: '统计语法：聚合查询',
        path: '/basic-skills/elasticsearch/aggregations'
      },
      {
        title: '嵌套类型和父子文档',
        path: '/basic-skills/elasticsearch/nested-and-join'
      },
      {
        title: '分词器的原理和使用',
        path: '/basic-skills/elasticsearch/analyzer'
      },
      {
        title: '分页查询的三种语法',
        path: '/basic-skills/elasticsearch/paging-query'
      }
    ]
  },
  {
    title: 'Elasticsearch 日常运维',
    collapsable: false,
    children: [
      {
        title: 'ES 的安装',
        path: '/basic-skills/elasticsearch/installation-of-elasticsearch'
      },
      {
        title: '集群管理 API',
        path: '/basic-skills/elasticsearch/cluster-manage-apis'
      },
      {
        title: '索引管理 API',
        path: '/basic-skills/elasticsearch/index-manage-apis'
      },
      {
        title: '定义字段类型：Mapping',
        path: '/basic-skills/elasticsearch/mapping'
      },
      {
        title: '索引模板：Index Template',
        path: '/basic-skills/elasticsearch/index-template'
      }
    ]
  }
]
