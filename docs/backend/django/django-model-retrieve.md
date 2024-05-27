# model 查询/检索操作

## 查询结果集

### QuerySet 是什么

想要从数据库内检索对象，需要基于模型类，通过管理器（Manager）操作数据库并返回一个查询结果集（QuerySet）。

每个 QuerySet 代表一些数据库对象的集合。它可以包含零个、一个或多个过滤器（filters）。Filters 能够缩小查询结果的范围。在 SQL 语法中，一个 QuerySet 相当于一个 SELECT 语句，而 filter 则相当于 WHERE 或者 LIMIT 一类的子句。

每个模型至少具有一个 Manager，默认情况下，Django 自动为我们提供了一个，也是最常用最重要的一个，99%的 情况下我们都只使用它。它被称作 `objects`，可以通过模型类直接调用它，但不能通过模型类的实例调用它，以此实现「表级别」操作和「记录级别」操作的强制分离。

### QuerySet 惰性特点

QuerySet 都是懒惰的，创建 QuerySet 的动作不会立刻导致任何的数据库行为。你可以不断地进行 filter 动作一整天，Django 不会运行任何实际的数据库查询动作，直到 QuerySet 被提交（evaluated）。

简而言之就是，只有碰到某些特定的操作，Django 才会将所有的操作体现到数据库内，否则它们只是保存在内存和 Django 的层面中。这是一种提高数据库查询效率，减少操作次数的优化设计。

比如下面的例子：

```python
q = Article.objects.filter(title__startswith="What")
q = q.filter(pub_date__lte=datetime.date.today())
q = q.exclude(body__icontains="food")
print(q)
```

上面的例子，看起来执行了 3 次数据库访问，实际上只是在 print 语句时才执行 1 次访问。通常情况，QuerySet 的检索不会立刻执行实际的数据库查询操作，直到出现类似 print 的请求，也就是所谓的 evaluated。

### QuerySet 何时被提交

在内部，创建、过滤、切片和传递一个 QuerySet 不会真实操作数据库，在你对查询集提交之前，不会发生任何实际的数据库操作。

那么如何判断哪种操作会触发真正的数据库操作呢？简单的逻辑思维如下：

* 第一次需要真正操作数据的值的时候。比如上面 `print(q)`，如果你不去数据库拿 q，print 什么呢？
* 落实修改动作的时候。你不操作数据库，怎么落实？

了解了 QuerySet 的概念，下面详细介绍 Django model select 的用法，配以对应的 MySQL 查询语句，理解起来更轻松。

## 基本操作

```python
# 获取所有数据
# 对应 SQL：select * from User;
User.objects.all()

# 匹配
# 对应 SQL：select * from User where name = '张三';
User.objects.filter(name='张三')

# 不匹配
# 对应 SQL：select * from User where name != '张三';
User.objects.exclude(name='张三')

# 获取单条数据（有且仅有一条，id 唯一）
# 对应 SQL：select * from User where id = 123;
User.objects.get(id=123)
```

需要注意：

* filter 方法始终返回的是 QuerySet，那怕只有一个对象符合过滤条件，返回的也是包含一个对象的 QuerySet，这是一个集合类型对象，你可以类比 Python列表，可迭代可循环可索引。
* get 方法只会返回一个对象，但是如果在查询时没有匹配到对象，那么将抛出 `DoesNotExist` 异常；如果结果超过 1 个，则会抛出 `MultipleObjectsReturned` 异常。
* 所以，比起使用 filter 方法然后通过 `[0]` 的方式分片，要慎用 get 方法。除非你确定你的检索必定只会获得一个对象。

## 常用操作

### 操作语法

```python
# 获取总数
# 对应 SQL：select count(1) from User;
User.objects.count()
User.objects.filter(name='张三').count()

# 比较，gt:>，gte:>=，lt:<，lte:<=
# 对应 SQL：select * from User where id > 724;
User.objects.filter(id__gt=724)
User.objects.filter(id__gt=1, id__lt=10)

# 包含，in
# 对应 SQL：select * from User where id in (11,22,33);
User.objects.filter(id__in=[11, 22, 33])
User.objects.exclude(id__in=[11, 22, 33])

# isnull：isnull=True 为空，isnull=False 不为空
# 对应 SQL：select * from User where pub_date is null;
User.objects.filter(pub_date__isnull=True)

# like，contains 大小写敏感，icontains 大小写不敏感，相同用法的还有 startswith、endswith
User.objects.filter(name__contains="sre")
User.objects.exclude(name__contains="sre")

# 范围，between and
# 对应 SQL：select * from User where id between 3 and 8;
User.objects.filter(id__range=[3, 8])

# 排序，order by，'id' 按 id 正序，'-id' 按 id 倒序
User.objects.filter(name='张三').order_by('id')
User.objects.filter(name='张三').order_by('-id')

# 多级排序，order by，先按 name 进行正序排列，如果 name 一致则再按照 id 倒序排列
User.objects.filter(name='张三').order_by('name','-id')
```

### 字段查询参数

上面好几个语法用到了**字段查询**，字段查询是指如何指定 SQL WHERE 子句的内容。它们用作 QuerySet 的 filter()，exclude() 和 get() 方法的关键字参数。

其基本格式是：`field__lookuptype=value`，注意其中是双下划线。

如果不加 `__lookuptype`，默认查找类型为 `exact`（精确匹配）。

其中的字段必须是模型中定义的字段之一。但是有一个例外，那就是 ForeignKey 字段，你可以为其添加一个 `_id` 后缀（单下划线）。这种情况下键值是外键模型的主键原生值。例如：

```python
# 模型中定义的字段
# 对应 SQL：SELECT * FROM blog_entry WHERE pub_date <= '2022-01-01';
Article.objects.filter(pub_date__lte='2022-01-01')

# ForeignKey 字段
Article.objects.filter(category_id=2)
```

Django 的数据库 API 支持 20 多种查询类型，下表列出了所有的字段查询参数：

<svg id="SvgjsSvg1006" width="916" height="1240" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25.000015258789062,24.99999237060547)"><path id="SvgjsPath1009" d="M0 0L127.40979904 0L127.40979904 45.458 L0 45.458Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1010" d="M127.40979904 0L370.02506174999996 0L370.02506174999996 45.458 L127.40979904 45.458Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1011" d="M370.02506175 0L865.5557 0L865.5557 45.458 L370.02506175 45.458Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1012" d="M0 45.458L127.40979904 45.458L127.40979904 78.064 L0 78.064Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1013" d="M127.40979904 45.458L370.02506174999996 45.458L370.02506174999996 78.064 L127.40979904 78.064Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1014" d="M370.02506175 45.458L865.5557 45.458L865.5557 78.064 L370.02506175 78.064Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1015" d="M0 78.18299999999999L127.40979904 78.18299999999999L127.40979904 110.78899999999999 L0 110.78899999999999Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1016" d="M127.40979904 78.18299999999999L370.02506174999996 78.18299999999999L370.02506174999996 110.78899999999999 L127.40979904 110.78899999999999Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1017" d="M370.02506175 78.18299999999999L865.5557 78.18299999999999L865.5557 110.78899999999999 L370.02506175 110.78899999999999Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1018" d="M0 110.789L127.40979904 110.789L127.40979904 143.395 L0 143.395Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1019" d="M127.40979904 110.789L370.02506174999996 110.789L370.02506174999996 143.395 L127.40979904 143.395Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1020" d="M370.02506175 110.789L865.5557 110.789L865.5557 143.395 L370.02506175 143.395Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1021" d="M0 143.39499999999998L127.40979904 143.39499999999998L127.40979904 176.00099999999998 L0 176.00099999999998Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1022" d="M127.40979904 143.39499999999998L370.02506174999996 143.39499999999998L370.02506174999996 176.00099999999998 L127.40979904 176.00099999999998Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1023" d="M370.02506175 143.39499999999998L865.5557 143.39499999999998L865.5557 176.00099999999998 L370.02506175 176.00099999999998Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1024" d="M0 176.12L127.40979904 176.12L127.40979904 208.726 L0 208.726Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1025" d="M127.40979904 176.12L370.02506174999996 176.12L370.02506174999996 208.726 L127.40979904 208.726Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1026" d="M370.02506175 176.12L865.5557 176.12L865.5557 208.726 L370.02506175 208.726Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1027" d="M0 208.726L127.40979904 208.726L127.40979904 241.332 L0 241.332Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1028" d="M127.40979904 208.726L370.02506174999996 208.726L370.02506174999996 241.332 L127.40979904 241.332Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1029" d="M370.02506175 208.726L865.5557 208.726L865.5557 241.332 L370.02506175 241.332Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1030" d="M0 241.33200000000002L127.40979904 241.33200000000002L127.40979904 273.93800000000005 L0 273.93800000000005Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1031" d="M127.40979904 241.33200000000002L370.02506174999996 241.33200000000002L370.02506174999996 273.93800000000005 L127.40979904 273.93800000000005Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1032" d="M370.02506175 241.33200000000002L865.5557 241.33200000000002L865.5557 273.93800000000005 L370.02506175 273.93800000000005Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1033" d="M0 273.938L127.40979904 273.938L127.40979904 306.544 L0 306.544Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1034" d="M127.40979904 273.938L370.02506174999996 273.938L370.02506174999996 306.544 L127.40979904 306.544Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1035" d="M370.02506175 273.938L865.5557 273.938L865.5557 306.544 L370.02506175 306.544Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1036" d="M0 306.66299999999995L127.40979904 306.66299999999995L127.40979904 339.26899999999995 L0 339.26899999999995Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1037" d="M127.40979904 306.66299999999995L370.02506174999996 306.66299999999995L370.02506174999996 339.26899999999995 L127.40979904 339.26899999999995Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1038" d="M370.02506175 306.66299999999995L865.5557 306.66299999999995L865.5557 339.26899999999995 L370.02506175 339.26899999999995Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1039" d="M0 339.269L127.40979904 339.269L127.40979904 371.875 L0 371.875Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1040" d="M127.40979904 339.269L370.02506174999996 339.269L370.02506174999996 371.875 L127.40979904 371.875Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1041" d="M370.02506175 339.269L865.5557 339.269L865.5557 371.875 L370.02506175 371.875Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1042" d="M0 371.875L127.40979904 371.875L127.40979904 404.481 L0 404.481Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1043" d="M127.40979904 371.875L370.02506174999996 371.875L370.02506174999996 404.481 L127.40979904 404.481Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1044" d="M370.02506175 371.875L865.5557 371.875L865.5557 404.481 L370.02506175 404.481Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1045" d="M0 404.6L127.40979904 404.6L127.40979904 437.206 L0 437.206Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1046" d="M127.40979904 404.6L370.02506174999996 404.6L370.02506174999996 437.206 L127.40979904 437.206Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1047" d="M370.02506175 404.6L865.5557 404.6L865.5557 437.206 L370.02506175 437.206Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1048" d="M0 437.206L127.40979904 437.206L127.40979904 469.812 L0 469.812Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1049" d="M127.40979904 437.206L370.02506174999996 437.206L370.02506174999996 469.812 L127.40979904 469.812Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1050" d="M370.02506175 437.206L865.5557 437.206L865.5557 469.812 L370.02506175 469.812Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1051" d="M0 469.81199999999995L127.40979904 469.81199999999995L127.40979904 588.3359999999999 L0 588.3359999999999Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1052" d="M127.40979904 469.81199999999995L370.02506174999996 469.81199999999995L370.02506174999996 588.3359999999999 L127.40979904 588.3359999999999Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1053" d="M370.02506175 469.81199999999995L865.5557 469.81199999999995L865.5557 588.3359999999999 L370.02506175 588.3359999999999Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1054" d="M0 588.455L127.40979904 588.455L127.40979904 670.089 L0 670.089Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1055" d="M127.40979904 588.455L370.02506174999996 588.455L370.02506174999996 670.089 L127.40979904 670.089Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1056" d="M370.02506175 588.455L865.5557 588.455L865.5557 670.089 L370.02506175 670.089Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1057" d="M0 670.089L127.40979904 670.089L127.40979904 741.6080000000001 L0 741.6080000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1058" d="M127.40979904 670.089L370.02506174999996 670.089L370.02506174999996 741.6080000000001 L127.40979904 741.6080000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1059" d="M370.02506175 670.089L865.5557 670.089L865.5557 741.6080000000001 L370.02506175 741.6080000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1060" d="M0 741.727L127.40979904 741.727L127.40979904 774.333 L0 774.333Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1061" d="M127.40979904 741.727L370.02506174999996 741.727L370.02506174999996 774.333 L127.40979904 774.333Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1062" d="M370.02506175 741.727L865.5557 741.727L865.5557 774.333 L370.02506175 774.333Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1063" d="M0 774.333L127.40979904 774.333L127.40979904 806.939 L0 806.939Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1064" d="M127.40979904 774.333L370.02506174999996 774.333L370.02506174999996 806.939 L127.40979904 806.939Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1065" d="M370.02506175 774.333L865.5557 774.333L865.5557 806.939 L370.02506175 806.939Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1066" d="M0 806.9390000000001L127.40979904 806.9390000000001L127.40979904 839.5450000000001 L0 839.5450000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1067" d="M127.40979904 806.9390000000001L370.02506174999996 806.9390000000001L370.02506174999996 839.5450000000001 L127.40979904 839.5450000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1068" d="M370.02506175 806.9390000000001L865.5557 806.9390000000001L865.5557 839.5450000000001 L370.02506175 839.5450000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1069" d="M0 839.5450000000001L127.40979904 839.5450000000001L127.40979904 872.1510000000001 L0 872.1510000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1070" d="M127.40979904 839.5450000000001L370.02506174999996 839.5450000000001L370.02506174999996 872.1510000000001 L127.40979904 872.1510000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1071" d="M370.02506175 839.5450000000001L865.5557 839.5450000000001L865.5557 872.1510000000001 L370.02506175 872.1510000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1072" d="M0 872.27L127.40979904 872.27L127.40979904 904.876 L0 904.876Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1073" d="M127.40979904 872.27L370.02506174999996 872.27L370.02506174999996 904.876 L127.40979904 904.876Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1074" d="M370.02506175 872.27L865.5557 872.27L865.5557 904.876 L370.02506175 904.876Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1075" d="M0 904.876L127.40979904 904.876L127.40979904 937.482 L0 937.482Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1076" d="M127.40979904 904.876L370.02506174999996 904.876L370.02506174999996 937.482 L127.40979904 937.482Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1077" d="M370.02506175 904.876L865.5557 904.876L865.5557 937.482 L370.02506175 937.482Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1078" d="M0 937.482L127.40979904 937.482L127.40979904 970.088 L0 970.088Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1079" d="M127.40979904 937.482L370.02506174999996 937.482L370.02506174999996 970.088 L127.40979904 970.088Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1080" d="M370.02506175 937.482L865.5557 937.482L865.5557 970.088 L370.02506175 970.088Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1081" d="M0 970.207L127.40979904 970.207L127.40979904 1027.684 L0 1027.684Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1082" d="M127.40979904 970.207L370.02506174999996 970.207L370.02506174999996 1027.684 L127.40979904 1027.684Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1083" d="M370.02506175 970.207L865.5557 970.207L865.5557 1027.684 L370.02506175 1027.684Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1084" d="M0 1027.565L127.40979904 1027.565L127.40979904 1060.171 L0 1060.171Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1085" d="M127.40979904 1027.565L370.02506174999996 1027.565L370.02506174999996 1060.171 L127.40979904 1060.171Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1086" d="M370.02506175 1027.565L865.5557 1027.565L865.5557 1060.171 L370.02506175 1060.171Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1087" d="M0 1060.29L127.40979904 1060.29L127.40979904 1092.896 L0 1092.896Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1088" d="M127.40979904 1060.29L370.02506174999996 1060.29L370.02506174999996 1092.896 L127.40979904 1092.896Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1089" d="M370.02506175 1060.29L865.5557 1060.29L865.5557 1092.896 L370.02506175 1092.896Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1090" d="M0 1092.896L127.40979904 1092.896L127.40979904 1125.502 L0 1125.502Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1091" d="M127.40979904 1092.896L370.02506174999996 1092.896L370.02506174999996 1125.502 L127.40979904 1125.502Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1092" d="M370.02506175 1092.896L865.5557 1092.896L865.5557 1125.502 L370.02506175 1125.502Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1093" d="M0 1125.502L127.40979904 1125.502L127.40979904 1158.108 L0 1158.108Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1094" d="M127.40979904 1125.502L370.02506174999996 1125.502L370.02506174999996 1158.108 L127.40979904 1158.108Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1095" d="M370.02506175 1125.502L865.5557 1125.502L865.5557 1158.108 L370.02506175 1158.108Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1096" d="M0 1158.227L127.40979904 1158.227L127.40979904 1190 L0 1190Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1097" d="M127.40979904 1158.227L370.02506174999996 1158.227L370.02506174999996 1190 L127.40979904 1190Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1098" d="M370.02506175 1158.227L865.5557 1158.227L865.5557 1190 L370.02506175 1190Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1099"><text id="SvgjsText1100" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="8.729" transform="rotate(0)"><tspan id="SvgjsTspan1101" dy="20" x="0"><tspan id="SvgjsTspan1102" style="text-decoration:;">  字段名</tspan></tspan></text></g><g id="SvgjsG1103"><text id="SvgjsText1104" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="8.729" transform="rotate(0)"><tspan id="SvgjsTspan1105" dy="20" x="127.40979904"><tspan id="SvgjsTspan1106" style="text-decoration:;">  说明</tspan></tspan></text></g><g id="SvgjsG1107"><text id="SvgjsText1108" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="8.729" transform="rotate(0)"><tspan id="SvgjsTspan1109" dy="20" x="370.02506175"><tspan id="SvgjsTspan1110" style="text-decoration:;">  示例</tspan></tspan></text></g><g id="SvgjsG1111"><text id="SvgjsText1112" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="47.760999999999996" transform="rotate(0)"><tspan id="SvgjsTspan1113" dy="20" x="0"><tspan id="SvgjsTspan1114" style="text-decoration:;">  exact</tspan></tspan></text></g><g id="SvgjsG1115"><text id="SvgjsText1116" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="47.760999999999996" transform="rotate(0)"><tspan id="SvgjsTspan1117" dy="20" x="127.40979904"><tspan id="SvgjsTspan1118" style="text-decoration:;">  精确匹配</tspan></tspan></text></g><g id="SvgjsG1119"><text id="SvgjsText1120" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="47.760999999999996" transform="rotate(0)"><tspan id="SvgjsTspan1121" dy="20" x="370.02506175"><tspan id="SvgjsTspan1122" style="text-decoration:;">  Article.objects.get(id__exact=3)</tspan></tspan></text></g><g id="SvgjsG1123"><text id="SvgjsText1124" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="80.48599999999999" transform="rotate(0)"><tspan id="SvgjsTspan1125" dy="20" x="0"><tspan id="SvgjsTspan1126" style="text-decoration:;">  iexact</tspan></tspan></text></g><g id="SvgjsG1127"><text id="SvgjsText1128" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="80.48599999999999" transform="rotate(0)"><tspan id="SvgjsTspan1129" dy="20" x="127.40979904"><tspan id="SvgjsTspan1130" style="text-decoration:;">  不区分大小写的精确匹配</tspan></tspan></text></g><g id="SvgjsG1131"><text id="SvgjsText1132" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="80.48599999999999" transform="rotate(0)"><tspan id="SvgjsTspan1133" dy="20" x="370.02506175"><tspan id="SvgjsTspan1134" style="text-decoration:;">  Article.objects.get(title__iexact="first article")</tspan></tspan></text></g><g id="SvgjsG1135"><text id="SvgjsText1136" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="113.092" transform="rotate(0)"><tspan id="SvgjsTspan1137" dy="20" x="0"><tspan id="SvgjsTspan1138" style="text-decoration:;">  contains</tspan></tspan></text></g><g id="SvgjsG1139"><text id="SvgjsText1140" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="113.092" transform="rotate(0)"><tspan id="SvgjsTspan1141" dy="20" x="127.40979904"><tspan id="SvgjsTspan1142" style="text-decoration:;">  包含匹配</tspan></tspan></text></g><g id="SvgjsG1143"><text id="SvgjsText1144" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="113.092" transform="rotate(0)"><tspan id="SvgjsTspan1145" dy="20" x="370.02506175"><tspan id="SvgjsTspan1146" style="text-decoration:;">  Article.objects.get(title__contains='first')</tspan></tspan></text></g><g id="SvgjsG1147"><text id="SvgjsText1148" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="145.69799999999998" transform="rotate(0)"><tspan id="SvgjsTspan1149" dy="20" x="0"><tspan id="SvgjsTspan1150" style="text-decoration:;">  icontains</tspan></tspan></text></g><g id="SvgjsG1151"><text id="SvgjsText1152" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="145.69799999999998" transform="rotate(0)"><tspan id="SvgjsTspan1153" dy="20" x="127.40979904"><tspan id="SvgjsTspan1154" style="text-decoration:;">  不区分大小写的包含匹配</tspan></tspan></text></g><g id="SvgjsG1155"><text id="SvgjsText1156" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="145.69799999999998" transform="rotate(0)"><tspan id="SvgjsTspan1157" dy="20" x="370.02506175"><tspan id="SvgjsTspan1158" style="text-decoration:;">  contains 的大小写不敏感模式</tspan></tspan></text></g><g id="SvgjsG1159"><text id="SvgjsText1160" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="178.423" transform="rotate(0)"><tspan id="SvgjsTspan1161" dy="20" x="0"><tspan id="SvgjsTspan1162" style="text-decoration:;">  in</tspan></tspan></text></g><g id="SvgjsG1163"><text id="SvgjsText1164" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="178.423" transform="rotate(0)"><tspan id="SvgjsTspan1165" dy="20" x="127.40979904"><tspan id="SvgjsTspan1166" style="text-decoration:;">  在 ... 之内的匹配</tspan></tspan></text></g><g id="SvgjsG1167"><text id="SvgjsText1168" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="178.423" transform="rotate(0)"><tspan id="SvgjsTspan1169" dy="20" x="370.02506175"><tspan id="SvgjsTspan1170" style="text-decoration:;">  Article.objects.filter(id__in=[1, 3, 4])</tspan></tspan></text></g><g id="SvgjsG1171"><text id="SvgjsText1172" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="211.029" transform="rotate(0)"><tspan id="SvgjsTspan1173" dy="20" x="0"><tspan id="SvgjsTspan1174" style="text-decoration:;">  gt</tspan></tspan></text></g><g id="SvgjsG1175"><text id="SvgjsText1176" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="211.029" transform="rotate(0)"><tspan id="SvgjsTspan1177" dy="20" x="127.40979904"><tspan id="SvgjsTspan1178" style="text-decoration:;">  大于</tspan></tspan></text></g><g id="SvgjsG1179"><text id="SvgjsText1180" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="211.029" transform="rotate(0)"><tspan id="SvgjsTspan1181" dy="20" x="370.02506175"><tspan id="SvgjsTspan1182" style="text-decoration:;">  Article.objects.filter(id__gt=2)</tspan></tspan></text></g><g id="SvgjsG1183"><text id="SvgjsText1184" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="243.63500000000002" transform="rotate(0)"><tspan id="SvgjsTspan1185" dy="20" x="0"><tspan id="SvgjsTspan1186" style="text-decoration:;">  gte</tspan></tspan></text></g><g id="SvgjsG1187"><text id="SvgjsText1188" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="243.63500000000002" transform="rotate(0)"><tspan id="SvgjsTspan1189" dy="20" x="127.40979904"><tspan id="SvgjsTspan1190" style="text-decoration:;">  大于等于</tspan></tspan></text></g><g id="SvgjsG1191"><text id="SvgjsText1192" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="243.63500000000002" transform="rotate(0)"><tspan id="SvgjsTspan1193" dy="20" x="370.02506175"><tspan id="SvgjsTspan1194" style="text-decoration:;">  同上</tspan></tspan></text></g><g id="SvgjsG1195"><text id="SvgjsText1196" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="276.241" transform="rotate(0)"><tspan id="SvgjsTspan1197" dy="20" x="0"><tspan id="SvgjsTspan1198" style="text-decoration:;">  lt</tspan></tspan></text></g><g id="SvgjsG1199"><text id="SvgjsText1200" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="276.241" transform="rotate(0)"><tspan id="SvgjsTspan1201" dy="20" x="127.40979904"><tspan id="SvgjsTspan1202" style="text-decoration:;">  小于</tspan></tspan></text></g><g id="SvgjsG1203"><text id="SvgjsText1204" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="276.241" transform="rotate(0)"><tspan id="SvgjsTspan1205" dy="20" x="370.02506175"><tspan id="SvgjsTspan1206" style="text-decoration:;">  同上</tspan></tspan></text></g><g id="SvgjsG1207"><text id="SvgjsText1208" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="308.96599999999995" transform="rotate(0)"><tspan id="SvgjsTspan1209" dy="20" x="0"><tspan id="SvgjsTspan1210" style="text-decoration:;">  lte</tspan></tspan></text></g><g id="SvgjsG1211"><text id="SvgjsText1212" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="308.96599999999995" transform="rotate(0)"><tspan id="SvgjsTspan1213" dy="20" x="127.40979904"><tspan id="SvgjsTspan1214" style="text-decoration:;">  小于等于</tspan></tspan></text></g><g id="SvgjsG1215"><text id="SvgjsText1216" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="308.96599999999995" transform="rotate(0)"><tspan id="SvgjsTspan1217" dy="20" x="370.02506175"><tspan id="SvgjsTspan1218" style="text-decoration:;">  同上</tspan></tspan></text></g><g id="SvgjsG1219"><text id="SvgjsText1220" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="341.572" transform="rotate(0)"><tspan id="SvgjsTspan1221" dy="20" x="0"><tspan id="SvgjsTspan1222" style="text-decoration:;">  startswith</tspan></tspan></text></g><g id="SvgjsG1223"><text id="SvgjsText1224" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="341.572" transform="rotate(0)"><tspan id="SvgjsTspan1225" dy="20" x="127.40979904"><tspan id="SvgjsTspan1226" style="text-decoration:;">  从开头匹配</tspan></tspan></text></g><g id="SvgjsG1227"><text id="SvgjsText1228" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="341.572" transform="rotate(0)"><tspan id="SvgjsTspan1229" dy="20" x="370.02506175"><tspan id="SvgjsTspan1230" style="text-decoration:;">  大小写敏感</tspan></tspan></text></g><g id="SvgjsG1231"><text id="SvgjsText1232" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="374.178" transform="rotate(0)"><tspan id="SvgjsTspan1233" dy="20" x="0"><tspan id="SvgjsTspan1234" style="text-decoration:;">  istartswith</tspan></tspan></text></g><g id="SvgjsG1235"><text id="SvgjsText1236" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="374.178" transform="rotate(0)"><tspan id="SvgjsTspan1237" dy="20" x="127.40979904"><tspan id="SvgjsTspan1238" style="text-decoration:;">  不区分大小写从开头匹配</tspan></tspan></text></g><g id="SvgjsG1239"><text id="SvgjsText1240" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="374.178" transform="rotate(0)"><tspan id="SvgjsTspan1241" dy="20" x="370.02506175"><tspan id="SvgjsTspan1242" style="text-decoration:;">  不区分大小写</tspan></tspan></text></g><g id="SvgjsG1243"><text id="SvgjsText1244" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="406.903" transform="rotate(0)"><tspan id="SvgjsTspan1245" dy="20" x="0"><tspan id="SvgjsTspan1246" style="text-decoration:;">  endswith</tspan></tspan></text></g><g id="SvgjsG1247"><text id="SvgjsText1248" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="406.903" transform="rotate(0)"><tspan id="SvgjsTspan1249" dy="20" x="127.40979904"><tspan id="SvgjsTspan1250" style="text-decoration:;">  从结尾处匹配</tspan></tspan></text></g><g id="SvgjsG1251"><text id="SvgjsText1252" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="406.903" transform="rotate(0)"><tspan id="SvgjsTspan1253" dy="20" x="370.02506175"><tspan id="SvgjsTspan1254" style="text-decoration:;">  大小写敏感</tspan></tspan></text></g><g id="SvgjsG1255"><text id="SvgjsText1256" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="439.509" transform="rotate(0)"><tspan id="SvgjsTspan1257" dy="20" x="0"><tspan id="SvgjsTspan1258" style="text-decoration:;">  iendswith</tspan></tspan></text></g><g id="SvgjsG1259"><text id="SvgjsText1260" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="439.509" transform="rotate(0)"><tspan id="SvgjsTspan1261" dy="20" x="127.40979904"><tspan id="SvgjsTspan1262" style="text-decoration:;">  不区分大小写从结尾处匹配</tspan></tspan></text></g><g id="SvgjsG1263"><text id="SvgjsText1264" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="439.509" transform="rotate(0)"><tspan id="SvgjsTspan1265" dy="20" x="370.02506175"><tspan id="SvgjsTspan1266" style="text-decoration:;">  不区分大小写</tspan></tspan></text></g><g id="SvgjsG1267"><text id="SvgjsText1268" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="515.074" transform="rotate(0)"><tspan id="SvgjsTspan1269" dy="20" x="0"><tspan id="SvgjsTspan1270" style="text-decoration:;">  range</tspan></tspan></text></g><g id="SvgjsG1271"><text id="SvgjsText1272" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="515.074" transform="rotate(0)"><tspan id="SvgjsTspan1273" dy="20" x="127.40979904"><tspan id="SvgjsTspan1274" style="text-decoration:;">  范围匹配</tspan></tspan></text></g><g id="SvgjsG1275"><text id="SvgjsText1276" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="475.07399999999996" transform="rotate(0)"><tspan id="SvgjsTspan1277" dy="20" x="370.02506175"><tspan id="SvgjsTspan1278" style="text-decoration:;">  import datetime</tspan></tspan><tspan id="SvgjsTspan1279" dy="20" x="370.02506175"><tspan id="SvgjsTspan1280" style="text-decoration:;"> </tspan></tspan><tspan id="SvgjsTspan1281" dy="20" x="370.02506175"><tspan id="SvgjsTspan1282" style="text-decoration:;">  start_date = datetime.date(2022, 1, 1)</tspan></tspan><tspan id="SvgjsTspan1283" dy="20" x="370.02506175"><tspan id="SvgjsTspan1284" style="text-decoration:;">  end_date = datetime.date(2022, 3, 31)</tspan></tspan><tspan id="SvgjsTspan1285" dy="20" x="370.02506175"><tspan id="SvgjsTspan1286" style="text-decoration:;">  Article.objects.filter(pub_date__range=(start_date, end_date))</tspan></tspan></text></g><g id="SvgjsG1287"><text id="SvgjsText1288" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="615.272" transform="rotate(0)"><tspan id="SvgjsTspan1289" dy="20" x="0"><tspan id="SvgjsTspan1290" style="text-decoration:;">  date</tspan></tspan></text></g><g id="SvgjsG1291"><text id="SvgjsText1292" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="615.272" transform="rotate(0)"><tspan id="SvgjsTspan1293" dy="20" x="127.40979904"><tspan id="SvgjsTspan1294" style="text-decoration:;">  日期匹配</tspan></tspan></text></g><g id="SvgjsG1295"><text id="SvgjsText1296" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="595.272" transform="rotate(0)"><tspan id="SvgjsTspan1297" dy="20" x="370.02506175"><tspan id="SvgjsTspan1298" style="text-decoration:;">  compare_date = datetime.date(2022, 1, 1)</tspan></tspan><tspan id="SvgjsTspan1299" dy="20" x="370.02506175"><tspan id="SvgjsTspan1300" style="text-decoration:;">  Article.objects.filter(pub_date__date=compare_date)</tspan></tspan><tspan id="SvgjsTspan1301" dy="20" x="370.02506175"><tspan id="SvgjsTspan1302" style="text-decoration:;">  Article.objects.filter(pub_date__date__gt=compare_date)</tspan></tspan></text></g><g id="SvgjsG1303"><text id="SvgjsText1304" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="691.8485000000001" transform="rotate(0)"><tspan id="SvgjsTspan1305" dy="20" x="0"><tspan id="SvgjsTspan1306" style="text-decoration:;">  year</tspan></tspan></text></g><g id="SvgjsG1307"><text id="SvgjsText1308" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="691.8485000000001" transform="rotate(0)"><tspan id="SvgjsTspan1309" dy="20" x="127.40979904"><tspan id="SvgjsTspan1310" style="text-decoration:;">  年份</tspan></tspan></text></g><g id="SvgjsG1311"><text id="SvgjsText1312" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="681.8485000000001" transform="rotate(0)"><tspan id="SvgjsTspan1313" dy="20" x="370.02506175"><tspan id="SvgjsTspan1314" style="text-decoration:;">  Article.objects.filter(pub_date__year=2022)</tspan></tspan><tspan id="SvgjsTspan1315" dy="20" x="370.02506175"><tspan id="SvgjsTspan1316" style="text-decoration:;">  Article.objects.filter(pub_date__year__gte=2022)</tspan></tspan></text></g><g id="SvgjsG1317"><text id="SvgjsText1318" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="744.03" transform="rotate(0)"><tspan id="SvgjsTspan1319" dy="20" x="0"><tspan id="SvgjsTspan1320" style="text-decoration:;">  iso_year</tspan></tspan></text></g><g id="SvgjsG1321"><text id="SvgjsText1322" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="744.03" transform="rotate(0)"><tspan id="SvgjsTspan1323" dy="20" x="127.40979904"><tspan id="SvgjsTspan1324" style="text-decoration:;">  以 ISO 8601 标准确定的年份</tspan></tspan></text></g><g id="SvgjsG1325"><text id="SvgjsText1326" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="744.03" transform="rotate(0)"><tspan id="SvgjsTspan1327" dy="20" x="370.02506175"><tspan id="SvgjsTspan1328" style="text-decoration:;">  Article.objects.filter(pub_date__iso_year=2022)</tspan></tspan></text></g><g id="SvgjsG1329"><text id="SvgjsText1330" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="776.636" transform="rotate(0)"><tspan id="SvgjsTspan1331" dy="20" x="0"><tspan id="SvgjsTspan1332" style="text-decoration:;">  month</tspan></tspan></text></g><g id="SvgjsG1333"><text id="SvgjsText1334" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="776.636" transform="rotate(0)"><tspan id="SvgjsTspan1335" dy="20" x="127.40979904"><tspan id="SvgjsTspan1336" style="text-decoration:;">  月份，取整数 1~12</tspan></tspan></text></g><g id="SvgjsG1337"><text id="SvgjsText1338" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="776.636" transform="rotate(0)"><tspan id="SvgjsTspan1339" dy="20" x="370.02506175"><tspan id="SvgjsTspan1340" style="text-decoration:;">  Article.objects.filter(pub_date__month=12)</tspan></tspan></text></g><g id="SvgjsG1341"><text id="SvgjsText1342" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="809.2420000000001" transform="rotate(0)"><tspan id="SvgjsTspan1343" dy="20" x="0"><tspan id="SvgjsTspan1344" style="text-decoration:;">  day</tspan></tspan></text></g><g id="SvgjsG1345"><text id="SvgjsText1346" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="809.2420000000001" transform="rotate(0)"><tspan id="SvgjsTspan1347" dy="20" x="127.40979904"><tspan id="SvgjsTspan1348" style="text-decoration:;">  日期</tspan></tspan></text></g><g id="SvgjsG1349"><text id="SvgjsText1350" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="809.2420000000001" transform="rotate(0)"><tspan id="SvgjsTspan1351" dy="20" x="370.02506175"><tspan id="SvgjsTspan1352" style="text-decoration:;">  Article.objects.filter(pub_date__day=3)</tspan></tspan></text></g><g id="SvgjsG1353"><text id="SvgjsText1354" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="841.8480000000001" transform="rotate(0)"><tspan id="SvgjsTspan1355" dy="20" x="0"><tspan id="SvgjsTspan1356" style="text-decoration:;">  week</tspan></tspan></text></g><g id="SvgjsG1357"><text id="SvgjsText1358" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="841.8480000000001" transform="rotate(0)"><tspan id="SvgjsTspan1359" dy="20" x="127.40979904"><tspan id="SvgjsTspan1360" style="text-decoration:;">  第几周</tspan></tspan></text></g><g id="SvgjsG1361"><text id="SvgjsText1362" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="841.8480000000001" transform="rotate(0)"><tspan id="SvgjsTspan1363" dy="20" x="370.02506175"><tspan id="SvgjsTspan1364" style="text-decoration:;">  Article.objects.filter(pub_date__week=52)</tspan></tspan></text></g><g id="SvgjsG1365"><text id="SvgjsText1366" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="874.573" transform="rotate(0)"><tspan id="SvgjsTspan1367" dy="20" x="0"><tspan id="SvgjsTspan1368" style="text-decoration:;">  week_day</tspan></tspan></text></g><g id="SvgjsG1369"><text id="SvgjsText1370" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="874.573" transform="rotate(0)"><tspan id="SvgjsTspan1371" dy="20" x="127.40979904"><tspan id="SvgjsTspan1372" style="text-decoration:;">  周几，星期日为 1，星期六为 7</tspan></tspan></text></g><g id="SvgjsG1373"><text id="SvgjsText1374" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="874.573" transform="rotate(0)"><tspan id="SvgjsTspan1375" dy="20" x="370.02506175"><tspan id="SvgjsTspan1376" style="text-decoration:;">  Article.objects.filter(pub_date__week_day=2)</tspan></tspan></text></g><g id="SvgjsG1377"><text id="SvgjsText1378" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="907.179" transform="rotate(0)"><tspan id="SvgjsTspan1379" dy="20" x="0"><tspan id="SvgjsTspan1380" style="text-decoration:;">  iso_week_day</tspan></tspan></text></g><g id="SvgjsG1381"><text id="SvgjsText1382" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="907.179" transform="rotate(0)"><tspan id="SvgjsTspan1383" dy="20" x="127.40979904"><tspan id="SvgjsTspan1384" style="text-decoration:;">  以 ISO 8601 标准确定的星期几</tspan></tspan></text></g><g id="SvgjsG1385"><text id="SvgjsText1386" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="907.179" transform="rotate(0)"><tspan id="SvgjsTspan1387" dy="20" x="370.02506175"><tspan id="SvgjsTspan1388" style="text-decoration:;">  Article.objects.filter(pub_date__iso_week_day=1)</tspan></tspan></text></g><g id="SvgjsG1389"><text id="SvgjsText1390" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="939.785" transform="rotate(0)"><tspan id="SvgjsTspan1391" dy="20" x="0"><tspan id="SvgjsTspan1392" style="text-decoration:;">  quarter</tspan></tspan></text></g><g id="SvgjsG1393"><text id="SvgjsText1394" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="939.785" transform="rotate(0)"><tspan id="SvgjsTspan1395" dy="20" x="127.40979904"><tspan id="SvgjsTspan1396" style="text-decoration:;">  季度，取值范围 1~4</tspan></tspan></text></g><g id="SvgjsG1397"><text id="SvgjsText1398" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="939.785" transform="rotate(0)"><tspan id="SvgjsTspan1399" dy="20" x="370.02506175"><tspan id="SvgjsTspan1400" style="text-decoration:;">  Article.objects.filter(pub_date__quarter=2)</tspan></tspan></text></g><g id="SvgjsG1401"><text id="SvgjsText1402" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="984.9455" transform="rotate(0)"><tspan id="SvgjsTspan1403" dy="20" x="0"><tspan id="SvgjsTspan1404" style="text-decoration:;">  time</tspan></tspan></text></g><g id="SvgjsG1405"><text id="SvgjsText1406" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="974.9455" transform="rotate(0)"><tspan id="SvgjsTspan1407" dy="20" x="127.40979904"><tspan id="SvgjsTspan1408" style="text-decoration:;">  时间，</tspan><tspan id="SvgjsTspan1409" style="text-decoration:;font-size: inherit;">将字段的值转为</tspan></tspan><tspan id="SvgjsTspan1410" dy="20" x="127.40979904"><tspan id="SvgjsTspan1411" style="text-decoration:;font-size: inherit;">  datetime.time 格式并进行对比</tspan></tspan></text></g><g id="SvgjsG1412"><text id="SvgjsText1413" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="984.9455" transform="rotate(0)"><tspan id="SvgjsTspan1414" dy="20" x="370.02506175"><tspan id="SvgjsTspan1415" style="text-decoration:;">  Article.objects.filter(pub_date__time=datetime.time(14, 30))</tspan></tspan></text></g><g id="SvgjsG1416"><text id="SvgjsText1417" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1029.8680000000002" transform="rotate(0)"><tspan id="SvgjsTspan1418" dy="20" x="0"><tspan id="SvgjsTspan1419" style="text-decoration:;">  hour</tspan></tspan></text></g><g id="SvgjsG1420"><text id="SvgjsText1421" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1029.8680000000002" transform="rotate(0)"><tspan id="SvgjsTspan1422" dy="20" x="127.40979904"><tspan id="SvgjsTspan1423" style="text-decoration:;">  小时，取 0~23 之间的整数</tspan></tspan></text></g><g id="SvgjsG1424"><text id="SvgjsText1425" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1029.8680000000002" transform="rotate(0)"><tspan id="SvgjsTspan1426" dy="20" x="370.02506175"><tspan id="SvgjsTspan1427" style="text-decoration:;">  Event.objects.filter(timestamp__hour=23)</tspan></tspan></text></g><g id="SvgjsG1428"><text id="SvgjsText1429" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1062.593" transform="rotate(0)"><tspan id="SvgjsTspan1430" dy="20" x="0"><tspan id="SvgjsTspan1431" style="text-decoration:;">  minute</tspan></tspan></text></g><g id="SvgjsG1432"><text id="SvgjsText1433" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1062.593" transform="rotate(0)"><tspan id="SvgjsTspan1434" dy="20" x="127.40979904"><tspan id="SvgjsTspan1435" style="text-decoration:;">  分钟，取 0~59 之间的整数</tspan></tspan></text></g><g id="SvgjsG1436"><text id="SvgjsText1437" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1062.593" transform="rotate(0)"><tspan id="SvgjsTspan1438" dy="20" x="370.02506175"><tspan id="SvgjsTspan1439" style="text-decoration:;">  Event.objects.filter(timestamp__minute=29)</tspan></tspan></text></g><g id="SvgjsG1440"><text id="SvgjsText1441" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1095.199" transform="rotate(0)"><tspan id="SvgjsTspan1442" dy="20" x="0"><tspan id="SvgjsTspan1443" style="text-decoration:;">  second</tspan></tspan></text></g><g id="SvgjsG1444"><text id="SvgjsText1445" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1095.199" transform="rotate(0)"><tspan id="SvgjsTspan1446" dy="20" x="127.40979904"><tspan id="SvgjsTspan1447" style="text-decoration:;">  秒，取 0~59 之间的整数</tspan></tspan></text></g><g id="SvgjsG1448"><text id="SvgjsText1449" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1095.199" transform="rotate(0)"><tspan id="SvgjsTspan1450" dy="20" x="370.02506175"><tspan id="SvgjsTspan1451" style="text-decoration:;">  Event.objects.filter(timestamp__second=31)</tspan></tspan></text></g><g id="SvgjsG1452"><text id="SvgjsText1453" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1127.805" transform="rotate(0)"><tspan id="SvgjsTspan1454" dy="20" x="0"><tspan id="SvgjsTspan1455" style="text-decoration:;">  regex</tspan></tspan></text></g><g id="SvgjsG1456"><text id="SvgjsText1457" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1127.805" transform="rotate(0)"><tspan id="SvgjsTspan1458" dy="20" x="127.40979904"><tspan id="SvgjsTspan1459" style="text-decoration:;">  区分大小写的正则匹配</tspan></tspan></text></g><g id="SvgjsG1460"><text id="SvgjsText1461" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1127.805" transform="rotate(0)"><tspan id="SvgjsTspan1462" dy="20" x="370.02506175"><tspan id="SvgjsTspan1463" style="text-decoration:;">  Article.objects.get(title__regex=r'^(An?|The) +')</tspan></tspan></text></g><g id="SvgjsG1464"><text id="SvgjsText1465" font-family="微软雅黑" text-anchor="start" font-size="16px" width="128px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1160.1135" transform="rotate(0)"><tspan id="SvgjsTspan1466" dy="20" x="0"><tspan id="SvgjsTspan1467" style="text-decoration:;">  iregex</tspan></tspan></text></g><g id="SvgjsG1468"><text id="SvgjsText1469" font-family="微软雅黑" text-anchor="start" font-size="16px" width="243px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1160.1135" transform="rotate(0)"><tspan id="SvgjsTspan1470" dy="20" x="127.40979904"><tspan id="SvgjsTspan1471" style="text-decoration:;">  不区分大小写的正则匹配</tspan></tspan></text></g><g id="SvgjsG1472"><text id="SvgjsText1473" font-family="微软雅黑" text-anchor="start" font-size="16px" width="496px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1160.1135" transform="rotate(0)"><tspan id="SvgjsTspan1474" dy="20" x="370.02506175"><tspan id="SvgjsTspan1475" style="text-decoration:;">  Article.objects.get(title__iregex=r'^(an?|the) +')</tspan></tspan></text></g></g></svg>

## 进阶操作

```python
# limit
# 对应 SQL：select * from User limit 3;
User.objects.all()[:3]

# limit，取第三条以后的数据
# 没有对应的 SQL，类似的如：select * from User limit 3,10000000;
# 从第 3 条开始取数据，取 10000000 条（10000000 大于表中数据条数）
User.objects.all()[3:]

# offset，取出结果的第 10-20 条数据（不包含 10，包含 20）
# 也没有对应 SQL，参考上边的 SQL 写法
User.objects.all()[10:20]

# 分组，group by
# 对应 SQL：select username,count(1) from User group by username;
from django.db.models import Count
User.objects.values_list('username').annotate(Count('id'))

# 去重 distinct
# 对应 SQL：select distinct(username) from User;
User.objects.values('username').distinct().count()

# filter 多列、查询多列
# 对应 SQL：select username,fullname from accounts_user;
User.objects.values_list('username', 'fullname')

# filter 单列、查询单列
# 正常 values_list 给出的结果是个列表，里边的每条数据对应一个元组
# 当只查询一列时，可以使用 flat 标签去掉元组，将每条数据的结果以字符串的形式存储在列表中，从而避免解析元组的麻烦
User.objects.values_list('username', flat=True)

# int 字段取最大值、最小值、综合、平均数
from django.db.models import Sum,Count,Max,Min,Avg

User.objects.aggregate(Count('id'))
User.objects.aggregate(Sum('age'))
```

## 时间字段

```python
# 匹配日期，date
User.objects.filter(create_time__date=datetime.date(2018, 8, 1))
User.objects.filter(create_time__date__gt=datetime.date(2018, 8, 2))

# 匹配年，year
# 相同用法的还有匹配月 month，匹配日 day，匹配周 week_day，匹配时 hour，匹配分 minute，匹配秒 second
User.objects.filter(create_time__year=2018)
User.objects.filter(create_time__year__gte=2018)

# 按天统计归档
today = datetime.date.today()
select = {'day': connection.ops.date_trunc_sql('day', 'create_time')}
deploy_date_count = Task.objects.filter(
    create_time__range=(today - datetime.timedelta(days=7), today)
).extra(select=select).values('day').annotate(number=Count('id'))
```

## Q 对象

Q 对象可以对关键字参数进行封装，从而更好的应用多个查询，可以组合 `&(and)`、`|(or)`、`~(not)` 操作符。

例如下面的语句：

```python
from django.db.models import Q

User.objects.filter(
    Q(role__startswith='sre_'),
    Q(name='张三') | Q(name='李四')
)
```

转换成 SQL 语句如下：

```sql
select * from User where role like 'sre_%' and (name='张三' or name='李四');
```

通常更多的时候我们用 Q 来做搜索逻辑，比如前台搜索框输入一个字符，后台去数据库中检索标题或内容中是否包含：

```python
_s = request.GET.get('search')

_t = Article.objects.all()
if _s:
    _t = _t.filter(
        Q(title__icontains=_s) |
        Q(body__icontains=_s)
    )

return _t
```

## F 表达式

到目前为止的例子中，我们都是将模型字段与常量进行比较。但是，如果你想将模型的一个字段与同一个模型的另外一个字段进行比较该怎么办？

使用 Django 提供的 F 表达式即可。

例如，为了查找评论数目多于点赞数目的文章，可以构造一个 `F()` 对象来引用点赞数目，并在查询中使用该 `F()` 对象：

```python
from django.db.models import F

Article.objects.filter(number_of_comment__gt=F('number_of_like'))
```

Django 支持对 `F()` 对象进行加、减、乘、除、求余以及幂运算等算术操作。两个操作数可以是常数和其它 `F()` 对象。

## 外键：ForeignKey

* 表结构：

```python
class Role(models.Model):
    name = models.CharField(max_length=16, unique=True)


class User(models.Model):
    username = models.EmailField(max_length=255, unique=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
```

* 正向查询:

```python
# 查询用户的角色名
_t = User.objects.get(username='张三')
_t.role.name
```

* 反向查询：

```python
# 查询角色下包含的所有用户
_t = Role.objects.get(name='Role03')
_t.user_set.all()
```

* 另一种反向查询的方法：

```python
_t = Role.objects.get(name='Role03')

# 这种方法比上一种 _set 的方法查询速度要快
User.objects.filter(role=_t)
```

* 第三种反向查询的方法：

如果外键字段有 `related_name` 属性，例如 models 如下：

```python
class User(models.Model):
    username = models.EmailField(max_length=255, unique=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='roleUsers')
```

那么可以直接用 `related_name` 属性取到某角色的所有用户：

```python
_t = Role.objects.get(name='Role03')
_t.roleUsers.all()
```

## M2M：ManyToManyField

* 表结构：

```python
class Group(models.Model):
    name = models.CharField(max_length=16, unique=True)

class User(models.Model):
    username = models.CharField(max_length=255, unique=True)
    groups = models.ManyToManyField(Group, related_name='groupUsers')
```

* 正向查询:

```python
# 查询用户隶属组
_t = User.objects.get(username='张三')
_t.groups.all()
```

* 反向查询：

```python
# 查询组包含用户
_t = Group.objects.get(name='groupC')
_t.user_set.all()
```

* 同样 M2M 字段如果有 `related_name` 属性，那么可以直接用下面的方式反查：

```python
_t = Group.objects.get(name='groupC')
_t.groupUsers.all()
```

## `get_object_or_404`

正常如果我们要去数据库里搜索某一条数据时，通常使用下面的方法：

```python
_t = User.objects.get(id=734)
```

但当 `id=724` 的数据不存在时，程序将会抛出一个错误：

```python
abcer.models.DoesNotExist: User matching query does not exist.
```

为了程序兼容和异常判断，我们可以使用下面两种方式：

* 方式一：`get` 改为 `filter`

```python
_t = User.objects.filter(id=724)
# 取出 _t 之后再去判断 _t 是否存在
```

* 方式二：使用 `get_object_or_404`

```python
from django.shortcuts import get_object_or_404

_t = get_object_or_404(User, id=724)
# get_object_or_404 方法，它会先调用 Django 的 get 方法，如果查询的对象不存在的话，则抛出一个 Http404 的异常
```

实现方法类似于下面这样：

```python
from django.http import Http404

try:
    _t = User.objects.get(id=724)
except User.DoesNotExist:
    raise Http404
```

## `get_or_create`

顾名思义，查找一个对象如果不存在则创建，如下：

```python
object, created = User.objects.get_or_create(username='张三')
```

返回一个由 `object` 和 `created` 组成的元组，其中 object 就是一个查询到的或者是被创建的对象，created 是一个表示是否创建了新对象的布尔值。

实现方式类似于下面这样：

```python
try:
    object = User.objects.get(username='张三')

    created = False
exception User.DoesNoExist:
    object = User(username='张三')
    object.save()

    created = True

returen object, created
```

## 执行原生 SQL

Django 中能用 ORM 的就用 ORM 吧，不建议执行原生 SQL，可能会有一些安全问题。如果实在是 SQL 太复杂 ORM 实现不了，那就看看下面执行原生 SQL 的方法，跟直接使用 pymysql 基本一致：

```python
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute('select * from accounts_User')
    row = cursor.fetchall()

return row
```

注意这里表名字要用 `app名+下划线+model名` 的方式（如果你在模型的元数据中指定了 `db_table` 字段，就另说了）。

## pk

pk 就是 primary key 的缩写。通常情况下，一个模型的主键为 `id`，所以下面三个语句的效果一样：

```python
Article.objects.get(id__exact=14)
Article.objects.get(id=14)
Article.objects.get(pk=14)
```

## 转义百分符号和下划线

在原生 SQL 语句中 `%` 符号有特殊的作用。Django 帮你自动转义了百分符号和下划线，你可以和普通字符一样使用它们，如下所示：

```python
Article.objects.filter(title__contains='%')
# 它和下面的一样
# SELECT ... WHERE title LIKE '%\%%';
```

## 缓存与查询集

每个 QuerySet 都包含一个缓存，用于减少对数据库的实际操作。理解这个概念，有助于你提高查询效率。

对于新创建的 QuerySet，它的缓存是空的。当 QuerySet 第一次被提交后，数据库执行实际的查询操作，Django 会把查询的结果保存在 QuerySet 的缓存内，随后的对于该 QuerySet 的提交将重用这个缓存的数据。

要想高效的利用查询结果，降低数据库负载，你必须善于利用缓存。看下面的例子，这会造成 2 次实际的数据库操作，加倍数据库的负载，同时由于时间差的问题，可能在两次操作之间数据被删除或修改或添加，导致脏数据的问题：

```python
print([obj.title for obj in Article.objects.all()])
print([obj.pub_date for obj in Article.objects.all()])
```

为了避免上面的问题，好的使用方式如下，这只产生一次实际的查询操作，并且保持了数据的一致性：

```python
queryset = Article.objects.all()
print([obj.title for obj in queryset])     # 提交查询
print([obj.pub_date for obj in queryset])  # 重用查询缓存
```

何时不会被缓存呢？

有一些操作不会缓存 QuerySet，例如切片和索引。这就导致这些操作没有缓存可用，每次都会执行实际的数据库查询操作。例如：

```python
queryset = Article.objects.all()
print(queryset[5])  # 查询数据库
print(queryset[5])  # 再次查询数据库
```

但是，如果已经遍历过整个 QuerySet，那么就相当于缓存过，后续的操作则会使用缓存，例如：

```python
queryset = Article.objects.all()
[obj for obj in queryset]  # 查询数据库
print(queryset[5])         # 使用缓存
print(queryset[5])         # 使用缓存
```

下面的这些操作都将遍历 QuerySet 并建立缓存：

```python
[obj for obj in queryset]
bool(queryset)
obj in queryset
list(queryset)
```

注意：简单地打印 QuerySet 并不会建立缓存，因为 `__repr__()` 调用只返回全部查询集的一个切片。

（完）
