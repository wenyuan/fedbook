module.exports = [
  {
    title: 'Elasticsearch 基础知识',
    collapsable: false,
    children: [
      {
        title: 'ES 中的概念与名词',
        path: '/basic-skills/elasticsearch/concepts-and-noun',
        collapsable: true
      },
      {
        title: '文档基本操作',
        path: '/basic-skills/elasticsearch/document-crud',
        collapsable: true
      },
      {
        title: '全文搜索语法',
        path: '/basic-skills/elasticsearch/match-query',
        collapsable: true
      },
      {
        title: 'Term 查询语法',
        path: '/basic-skills/elasticsearch/term-query',
        collapsable: true
      },
      {
        title: '组合查询语法',
        path: '/basic-skills/elasticsearch/compound-query',
        collapsable: true
      },
      {
        title: '搜索词自动补全语法',
        path: '/basic-skills/elasticsearch/suggester-query',
        collapsable: true
      },
      {
        title: '统计语法：聚合查询',
        path: '/basic-skills/elasticsearch/aggregations',
        collapsable: true
      }
    ]
  },
  {
    title: 'Elasticsearch 日常运维',
    collapsable: false,
    children: [
      {
        title: 'ES 的安装',
        path: '/basic-skills/elasticsearch/installation-of-elasticsearch',
        collapsable: true
      },
      {
        title: '集群管理 API',
        path: '/basic-skills/elasticsearch/cluster-manage-apis',
        collapsable: true
      },
      {
        title: '索引管理 API',
        path: '/basic-skills/elasticsearch/index-manage-apis',
        collapsable: true
      }
    ]
  }
]
