module.exports = [
  {
    title: 'Django 基础知识',
    collapsable: true,
    children: [
      {
        title: 'model 字段与属性',
        path: '/backend-knowledge/django/django-model'
      },
      {
        title: 'model 外键关系',
        path: '/backend-knowledge/django/django-model-relationship'
      },
    ]
  },
  {
    title: 'Django 第三方集成',
    collapsable: true,
    children: [
      {
        title: 'Django 与 Celery 的集成',
        path: '/backend-knowledge/django/django-integrating-celery'
      },
    ]
  },
  {
    title: 'Django 常见问题',
    collapsable: true,
    children: [
      {
        title: '执行 migrate 时报错 SQLite 版本过低',
        path: '/backend-knowledge/django/migrate-error-caused-by-sqlite3'
      },
    ]
  }
]
