module.exports = [
  {
    title: 'Django 基础知识',
    collapsable: true,
    children: []
  },
  {
    title: 'Django 第三方集成',
    collapsable: true,
    children: [
      {
        title: 'Django 与 Celery 的集成',
        path: '/backend-knowledge/django/django-celery'
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
