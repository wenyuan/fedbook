# Model 字段与属性

## 前言

模型（Model）代表对数据库的操作，通常一个 Model 会映射为一张数据库中的表，包含了数据的字段和操作方法。

以往要对数据库进行增删改查，需要借助一些第三方模块（比如连接 MySQL 的 pymysql 和 mysqlclient），但这需要我们自己手写 SQL 语句，对于大部分开发者来说既不方便也不安全。于是诞生了一个叫 ORM（对象关系映射）的工具，它能够将 Python 代码翻译成原生的 SQL 语句。

Django 自带 ORM 系统，通过 Model 操作数据库，不管使用的是 MySQL 还是 SQLite，它都能自动生成相应数据库的 SQL 语句，所以不需要过度关注 SQL 语句和数据库种类。

当然也可以安装并使用其它的 ORM，比如 SQLAlchemy，但是不对于 Django 来说使用自带的 ORM 更方便更可靠，而且功能也非常强大了。

## Model 的定义

定义一个 Model 的基本原则如下：

* 每个模型在 Django 中的存在形式为一个 Python 类
* 每个类都是 `django.db.models.Model` 的子类
* 模型（类）的每个字段（属性）代表数据表的某一列
* 建议将模型编写在其所属 app 下的 models.py 文件中

```python
from django.db import models

class Person(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    class Meta:
        app_label = 'myapp'                 # 声明模型属于哪个 app
        db_table = 'my_friends'             # 指定在数据库中的表名，默认是：项目名称_小写类名
        verbose_name = _('my students')     # 声明打印对象时显示的名字，默认是：小写的模型名
        verbose_name_plural = verbose_name  # 模型对象的复数名，一边设置同上即可
        unique_together = (                 # 联合约束，保证多字段的组合唯一
            ('name', 'birthday'),
            ('name', 'address'),
        )
```

元数据 Meta 用于定义除了模型字段外的所有内容，这里仅列举一些定义模型时常用的，更多属性后面会单独整理。

## Model 的字段

### 字段命名约束

* 字段名不能与 Python 关键字冲突（比如 `pass` 等）
* 字段名不能有两个以上的下划线在一起，因为两个下划线是 Django 的查询语法（比如 `foo__bar` 等）
* 字段名不能以下划线结尾，原因同上

### 常用字段类型

Django 内置了许多字段类型，它们都位于 `django.db.models` 中，例如 `models.CharField`，它们的父类都是 `Field` 类。这些类型基本满足需求，如果还不够，也可以自定义字段。

Django 内置的字段类型如下所示，但不包括关系字段类型（字段名采用驼峰命名法，初学者请一定要注意）：
