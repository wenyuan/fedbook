# ORM 增删改操作

增删改查是数据库基本操作，Django 自动为所有的模型提供了一套完善、方便、高效的 API。其中「查」是比较复杂的、功能也最多，所以后面单独整理。

## 增加数据

### save()

创建一个模型实例，然后显式地调用 `save()` 方法。该方法没有返回值。

**用法示例**：

```python
obj = Person(first_name="John", last_name="Lennon")
obj.save()
```

**常见需求**：

有时候出于业务需要，我们会重写 save 方法，添加自己的业务逻辑，然后在其中调用原来的 save 方法，保证 Django 基本工作机制正常。比如下面的例子：

```python
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=100)
    body = models.TextField()

    def save(self, *args, **kwargs):
        do_something()                 # 保存前做点事情，比如限制要符合哪些条件才能被保存
        super().save(*args, **kwargs)  # 一定不要忘记这行代码
        do_something_else()            # 保存后又可以做点事情
```

`*args, **kwargs` 的参数设计，确保我们自定义的 save 方法是个万金油，不论 Django 源码中的 save 方法的参数怎么变，我们自己的 save 方法不会因为参数定义的不正确而出现 Bug。

### create()

在一步操作中同时创建并且保存对象。该方法会返回新创建的对象。

**用法示例**：

```python
obj = Person.objects.create(first_name="John", last_name="Lennon")

# 或者

dic = {'first_name': 'John', 'last_name': 'Lennon'}
obj = Person.objects.create(**dic)
```

### get_or_create()

查询对象，如果没有找到就新建对象。该方法返回一个由 `(object, created)` 组成的元组，元组中的 object 是一个查询到的或者是被创建的对象，created 是一个表示是否创建了新的对象的布尔值。

**用法示例**：

```python
obj, created = Person.objects.get_or_create(
    first_name='John',
    last_name='Lennon',
    defaults={'birthday': date(2020, 10, 9)},
)
```

等价于下面的代码，只不过在模型的字段数量较大的情况下，会更方便。

```python
try:
    obj = Person.objects.get(first_name='John', last_name='Lennon')
except Person.DoesNotExist:
    obj = Person(first_name='John', last_name='Lennon', birthday=date(2020, 10, 9))
    obj.save()
```

不过建议只在 Django 视图的 POST 请求中使用 `get_or_create()`，因为这是一个具有修改性质的动作，不应该使用在 GET 请求中，那样不安全。

### update_or_create()

类似前面的 `get_or_create()`，更新对象，如果没有找到就创建对象。该方法返回一个由 `(object, created)` 组成的元组，元组中的 object 是一个创建的或者是被更新的对象，created 是一个标示是否创建了新的对象的布尔值。

**用法示例**：

```python
# 通过给出的 kwargs 去从数据库中获取匹配的对象，如果找到匹配的对象，它将会依据 defaults 字典给出的值更新字段
obj, created = Person.objects.update_or_create(
    first_name='John', last_name='Lennon',
    defaults={'first_name': 'Bob'},
)
```

等价于下面的代码，只不过在模型的字段数量较大的情况下，会更方便。

```python
defaults = {'first_name': 'Bob'}
try:
    obj = Person.objects.get(first_name='John', last_name='Lennon')
    for key, value in defaults.items():
        setattr(obj, key, value)
    obj.save()
except Person.DoesNotExist:
    new_values = {'first_name': 'John', 'last_name': 'Lennon'}
    new_values.update(defaults)
    obj = Person(**new_values)
    obj.save()
```

和 `get_or_create()` 一样，这个方法也容易导致竞态条件，如果数据库层级没有前置唯一性会让多行同时插入。

### bulk_create()

> `bulk_create(objs, batch_size=None, ignore_conflicts=False)`

批量创建对象，以高效的方式（通常只有 1 个查询，无论有多少对象）将提供的对象列表插入到数据库中。

**用法示例**：

```python
Article.objects.bulk_create([
    Article(title='This is a test'),
    Article(title='This is only a test'),
])
```

**注意事项**：

* 不会调用模型的 `save()` 方法，并且不会发送 `pre_save` 和 `post_save` 信号。
* 不适用于多表继承场景中的子模型。
* 如果模型的主键是 AutoField，则不会像 `save()` 那样检索并设置主键属性，除非数据库后端支持。
* 不适用于多对多关系。

`batch_size` 参数控制在单个查询中创建的对象数，默认情况是一次数据库连接将所有创建动作完成，但这在要创建的对象数量和字段数量非常巨大的时候往往是不行的，比如 SQLite3 一次只允许最多 999 个变量。`batch_size` 参数的作用其实就类似文件的分块读写，参考下面的例子：

```python
from itertools import islice

batch_size = 100
objs = (Article(title='Test %s' % i) for i in range(1000))
while True:
    batch = list(islice(objs, batch_size))
    if not batch:
        break
    Article.objects.bulk_create(batch, batch_size)
```

## 删除数据

### delete()

删除对象，能批量删除，这个动作是立即执行的，并返回删除的对象个数和每个对象类型的删除次数的字典。

**用法示例**：

```python
# 删除 id=6 的数据
Article.objects.filter(id=6).delete()
```

## 修改数据

### save()

> Model.save(force_insert=False, force_update=False, using=DEFAULT_DB_ALIAS, update_fields=None)

文章开头说 `save()` 是用来新增数据的，实际上 Django 对 SQL 的 INSERT 和 UPDATE 语句进行了抽象合并，共用一个 save 方法。

正常情况下调用 save 方法会新增一条数据，但是当自己指定主键的值，并且该值已经存在，那么在这种情况下，Django 认为你是在更新一条已有的数据对象，而不是新建对象。

**用法示例**：

```python
# 新增一条主键 id=3 的数据
obj3 = Article(id=3, title='Cheddar Talk', body='Thoughts on cheese.')
obj3.save()

# 实际上是更新了上面的 obj3，而不是新建，此时 obj4==obj3
obj4 = Article(id=3, title='Not Cheddar', body='Anything but cheese.')
obj4.save() 
```

有些罕见情况下，可能你必须强制进行 INSERT 或者 UPDATE 操作，而不是让 Django 自动决定。这时候可以使用 save 方法的 `force_insert` 和 `force_update` 参数，将其中之一设置为 `True`，强制指定保存模式。

**常见需求**：

有一种常见的需求是根据现有字段的值，更新成为新的值，比如点赞数 +1 的操作，通常我们可能写成如下的代码：

```python
article = Article.objects.get(id=1)
article.number_of_like += 1
article.save()
```

看起来没有什么问题，但实际上这里有个漏洞。首先会访问一次数据库，将 `number_of_like` 的值取出来，然后在 Python 的内存中进行加一操作，最后将新的值写回到数据库。两次读写倒还算好，关键是可能存在数据冲突，比如在同一时间有很多人点赞，肯定会出现错误。那如何解决这个问题呢？最简单的方法是使用 Django 的 **F 表达式**：

```python
from django.db.models import F

article = Article.objects.get(id=1)
article.number_of_like = F('number_of_like') + 1
article.save()
```

为什么 F 表达式就可以避免上面的问题呢？因为 Django 设计的这个 F 表达式在获取关联字段值的时候不用先去数据库中取值然后在 Python 内存里计算，而是直接在数据库中取值和计算，直接更新数据库，不需要在 Python 中操作，自然就不存在数据竞争和冲突问题了。

**save 方法的参数**：

save 方法的最后一个参数是 `update_fields`，它用于指定你要对模型的哪些字段进行更新，这对于性能可能有细微地提升，比如：

```python
product.name = 'Name changed again'
product.save(update_fields=['name'])
```

一些 `update_fields` 参数的说明：

* 接收任何的可迭代对象，每个元素都是字符串
* 参数值为空的迭代对象时，相当于跳过 save 方法
* 参数值为 None 时，默认更新所有字段
* 将强制为 UPDATE 方式

**内部执行顺序**：

当调用 `save()` 方法的时候，Django 内部的执行顺序是这样的：

1. 触发 `pre_save` 信号，让任何监听此信号者执行动作。
2. 预处理数据。触发每个字段的 `pre_save()` 方法，用于实施自动地数据修改动作，比如时间字段处理 `auto_now_add` 或者 `auto_now` 参数。
3. 准备数据库数据。要求每个字段提供的当前值是能够写入到数据库中的类型。类似整数、字符串等大多数类型不需要处理，只有一些复杂的类型需要做转换，比如时间。
4. 将数据插入到数据库内。
5. 触发 `post_save` 信号。

注意：对于批量创建和批量更新操作，`save()` 方法不会调用，甚至连 `pre_delete` 或者 `post_delete` 信号都不会触发，此时自定义的代码都是无效的。

**保存外键和多对多字段**：

保存一个外键字段和保存普通字段没什么区别，只是要注意值的类型要正确。如下所示：

```python
# 外键字段：Article 与 Category 是多对一（一篇文章只能属于一个分类）
from blog.models import Article, Category
article = Article.objects.get(id=1)
category = Category.objects.get(name="后端开发")
article.category = category  # 注意这里的值是 category 实例
article.save()
```

多对多字段的保存稍微有点区别，需要调用一个 `add()` 方法，而不是直接给属性赋值，但它不需要调用 save 方法。如下所示：

```python
# 多对多字段：Article 与 Tag 是多对多（一篇文章可以有多个标签）
from blog.models import Article, Tag

article = Article.objects.get(id=1)
tag_python = Tag.objects.create(name="Python")
article.tags.add(tag_python)
```

在一行语句内，可以同时添加多个对象到多对多的字段，如下所示：

```python
tag_python = Tag.objects.create(name="Python")
tag_django = Tag.objects.create(name="Django")
tag_mysql = Tag.objects.create(name="MySQL")

article.tags.add(tag_python, tag_django, tag_mysql)
```

如果你指定或添加了错误类型的对象，Django 会抛出异常。

### update()

更新对象，对指定的字段执行更新操作，并返回匹配的行数（如果某些行已具有新值，则返回值可能不等于已更新的行数）。该方法无需 save 操作，会立刻写入数据库。

**用法示例**：

```python
# 对 2022 年发布的所有文章关闭评论功能
Article.objects.filter(pub_date__year=2022).update(comments_on=False)

# 可以同时更新多个字段（没有多少字段的限制）
Article.objects.filter(pub_date__year=2010).update(comments_on=False, title='This is old')
```

**常见需求**：

如果你只是更新一下对象，不需要为对象做别的事情，最有效的方法是调用 update()，而不是将模型对象加载到内存中。例如：

```python
# 推荐这样做
Article.objects.filter(id=10).update(comments_on=False)

# 不推荐这样做
obj = Article.objects.get(id=10)
obj.comments_on = False
obj.save()
```

用 update() 还可以防止在加载对象和调用 save() 之间的短时间内数据库中某些内容可能发生更改的竞争条件。

update() 方法不会调用 save() 方法，也不会发出 `pre_save` 和 `post_save` 信号。所以，如果想更新一个具有自定义 save() 方法的模型的记录，请循环遍历它们并调用 save()，如下所示：

```python
for obj in Article.objects.filter(pub_date__year=2020):
    obj.comments_on = False
    obj.save()
```

::: warning
需要注意的是，update() 是作用于查询集（QuerySet）的，而 get（）方法得到的是查询对象，因此不能用 update。

所以要用 filter() 来获取目标对象，然后才能通过 update() 来更新对象得字段。

查询集（QuerySet）的概念下一篇就讲，这里先引入一下。
:::

### bulk_update()

> `bulk_update(objs, fields, batch_size=None)`

批量更新对象。

**用法示例**：

```python
objs = [
    Article.objects.create(title='Article 1'),
    Article.objects.create(title='Article 2'),
]
objs[0].title = 'This is article 1'
objs[1].title = 'This is article 2'
Article.objects.bulk_update(objs, ['title'])
```

**注意事项**：

这种方式比用 for 循环逐个更新效率要高，但要注意几点：

* 不能更新主键
* 不会调用模型的 `save()` 方法，也不会发送 `pre_save` 和 `post_save` 信号。
* 对于大量数据大量字段的情况下，建议使用 `batch_size`，分割数据，分组更新。
* 不适用于多表继承场景中的子模型。
* 如果 `objs` 中有重复的对象，则只有第一个会被更新。
* 合理使用 `batch_size` 参数，将大数据分割成多次小数据的写入操作。

（完）
