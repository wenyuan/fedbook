# 如何查看 ORM 对应的 SQL 语句

## 问题描述

在开发时，有时需要查看 Django ORM 语法对应的原始 SQL 语句。

## 方案一

当是查询语句且查询结果是 QuerySet 对象时，可以使用 QuerySet 的 `query` 属性查看转化成的 SQL 语句，如下：

```python
qs = MyModel.objects.all()
print(qs.query)
```

## 方案二

* 在 Django 项目的 `settings.py` 文件中，找到日志配置 [`LOGGING`](https://docs.djangoproject.com/en/dev/topics/logging/)，没有找到日志配置项的直接复制粘贴如下代码即可。
* 配置好之后，重新运行项目，再执行任何对数据库进行操作的 ORM 语句时，会自动将 Django 执行的原生 SQL 语句记录下来。

```python
# 日志配置
LOGGING = {
     'version': 1,
     'disable_existing_loggers': False,
     'formatters': {
         'verbose': {
             'format': '%(asctime)s-%(module)s-%(levelname)s :: %(message)s'
         },
         'simple': {
             'format': '%(levelname)s :: %(message)s'
         }
     },
     'handlers': {
           'console': {
             'level': 'DEBUG',
             'class': 'logging.StreamHandler',
             'formatter': 'verbose'
         },
     },
     'loggers': {
         'django.db.backends': {
             'handlers': ['console'],
             'propagate': False,
             'level': 'DEBUG'
         },
     }
 }
```

在 `loggers` 那里配置：`django.db.backends` 就表示打印出数据库操作的语句。

（完）


