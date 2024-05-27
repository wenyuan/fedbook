# model 元数据 Meta

在一个模型中，除了定义 model 的字段外还能定义一些其他属性，比如排序方式、数据库表名、人类可读的单数或者复数名等等，这些统称元数据。

元数据不是必须的。但有些元数据选项在实际使用中具有重要的作用。

## 元数据的写法

元数据对于 models 来说是一个内部类 `Meta`，名字是固定，然后在这个 Meta 类下面增加各种元数据选项，下面是一个简单的例子：

```python
class UserInfo(models.Model):
    nid = models.AutoField(primary_key=True)
    username = models.CharField(max_length=32)
        
    class Meta:
        # 数据库中生成的表名默认是：app名称_类名
        db_table = "table_name"
        # 联合索引
        index_together = [
            ("pub_date", "deadline"),
        ]
        # 联合唯一索引
        unique_together = (("driver", "restaurant"),)
        # Admin 中显示的表名称
        verbose_name = "用户信息"
        # verbose_name 加 s
        verbose_name_plural = "用户信息"
```

注意：每个模型都可以有自己的元数据类，每个元数据类也只对自己所在模型起作用。

## Meta 选项说明

Meta 选项大致包含以下几类：

#### 1. **abstract**

如果 `abstract=True`，那么模型会被认为是一个抽象模型。抽象模型本身不实际生成数据库表，而是作为其它模型的父类，被继承使用。一般我们用它来归纳一些公共属性字段，然后继承它的子类可以继承这些字段。

#### 2. **app_label**

如果该模型所在的 app 没有在 `INSTALLED_APPS` 中注册，则必须通过此元选项声明它属于哪个已注册的 app，例如：

```python
app_label = 'myapp'
```

#### 3. **base_manager_name**

模型的 `_base_manager` 管理器的名字，默认是 `'objects'`。模型管理器是 Django 为模型提供的 API 所在。

#### 4. **db_table**

指定在数据库中，当前模型生成的数据表的表名。比如：

```python
db_table = 'my_freinds'
```

如果没有指定这个选项，那么 Django 会自动使用 app 名和模型名，通过下划线连接生成数据表名，比如 `app_book`。

注意不能使用 SQL 语言或者 Python 的保留字，注意冲突。

一般建议使用 MySQL 和 MariaDB 数据库时，`db_table` 用小写英文。

#### 5. **db_tablespace**

自定义数据库表空间的名字。默认值是项目的 `DEFAULT_TABLESPACE` 配置项指定的值。

#### 6. **default_manager_name**

模型的 `_default_manager` 管理器的名字。

#### 7. **default_related_name**

默认情况下，从一个模型反向关联设置有关系字段的源模型，我们使用 `<model_name>_set`，也就是：源模型的名字+下划线+set。

这个元数据选项可以让你自定义反向关系名，同时也影响反向查询关系名，如下面的例子：

```python
from django.db import models

class Foo(models.Model):
    pass

class Bar(models.Model):
    foo = models.ForeignKey(Foo, on_delete=models.CASCADE)

    class Meta:
        default_related_name = 'bars'  # 关键在这里
```

反向关联使用时：

```python
bar = Bar.objects.first()
# 不能再使用 "bar" 作为反向查询的关键字了
Foo.objects.get(bar=bar)
# 而要使用你自己定义的 "bars" 了
Foo.objects.get(bars=bar)
```

#### 8. **get_latest_by**

Django 管理器给我们提供有 `latest()` 和 `earliest()` 方法，分别表示获取最近一个和最前一个数据对象。但是它是根据什么来排序呢？

`get_latest_by` 元数据选项可以指定一个类似 `DateField`、`DateTimeField` 或者 `IntegerField` 这种可以排序的字段，作为 `latest()` 和 `earliest()` 方法的排序依据，从而得出最近一个或最前面一个对象。例如：

```python
# 根据 order_date 升序排列
get_latest_by = "order_date"

# 根据 priority 降序排列，如果发生同序，则接着使用 order_date 升序排列
get_latest_by = ['-priority', 'order_date']
```

#### 9. **managed**

该元数据默认值为 `True`，表示 Django 将按照既定的规则，管理数据库表的生命周期。

如果设置为 `False`，将不会针对当前模型创建和删除数据库表，也就是说 Django 暂时不管这个模型了。

目前还没有遇到需要修改它的场景，可能某些场景下会有用。

#### 10. **order_with_respect_to**

这个选项不好理解。其用途是根据指定的字段进行排序，通常用于关系字段。看下面的例子：

```python
from django.db import models

class Question(models.Model):
    text = models.TextField()
    # ...

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    # ...

    class Meta:
        order_with_respect_to = 'question'
```

上面在 Answer 模型中设置了 `order_with_respect_to = 'question'`，这样的话，Django 会自动提供两个 API，`get_RELATED_order()` 和 `set_RELATED_order()`，其中的 `RELATED` 用小写的模型名代替。

假设现在有一个 Question 对象，它关联着多个 Answer 对象，下面的操作返回包含关联的 Answer 对象的主键的列表 `[1,2,3]`：

```python
question = Question.objects.get(id=1)
question.get_answer_order()
```

我们可以通过 `set_RELATED_order()` 方法，指定上面这个列表的顺序：

```python
question.set_answer_order([3, 1, 2])
```

同样的，关联的对象也获得了两个方法 `get_next_in_order()` 和 `get_previous_in_order()`，用于通过特定的顺序访问对象，如下所示：

```python
answer = Answer.objects.get(id=2)
answer.get_next_in_order()      # -> <Answer: 3>
answer.get_previous_in_order()  # -> <Answer: 1>
```

同样，这个元数据目前还没有遇到需要使用它的场景。

#### 11. **ordering**

这是最常用的元数据之一。

用于指定该模型生成的所有对象的排序方式，接收一个字段名组成的元组或列表。默认按升序排列，如果在字段名前加上字符 `-` 则表示按降序排列，如果使用字符问号 `？` 表示随机排列。

这个顺序是你通过查询语句，获得 QuerySet 后的列表内元素的顺序，切不可和前面的 `get_latest_by` 等混淆。

看下面的例子：

```python
ordering = ['pub_date']             # 表示按 'pub_date' 字段进行升序排列
ordering = ['-pub_date']            # 表示按 'pub_date' 字段进行降序排列
ordering = ['-pub_date', 'author']  # 表示先按 'pub_date' 字段进行降序排列，再按 'author' 字段进行升序排列
```

#### 12. **permissions**

该元数据用于当创建对象时增加额外的权限。它接收一个所有元素都是二元元组的列表或元组，每个元素都是 `(权限代码, 直观的权限名称)` 的格式。

这个 Meta 选项非常重要，和 auth 框架的权限系统紧密相关。比如下面的例子：

```python
permissions = (("can_deliver_pizzas", "可以送披萨"),)
```

#### 13. **default_permissions**

Django 默认会在建立数据表的时候就自动给所有的模型设置 `('add', 'change', 'delete')` 的权限，也就是增删改。你可以自定义这个选项，比如设置为一个空列表，表示你不需要默认的权限，但是这一操作必须在执行 migrate 命令之前。也是配合 auth 框架使用。

#### 14. **proxy**

如果设置了 `proxy = True`，表示使用代理模式的模型继承方式，即该 model 是其父的代理 model。具体内容与 `abstract` 选项一样。

#### 15. **required_db_features**

声明模型依赖的数据库功能。比如 `['gis_enabled']`，表示模型的建立依赖 GIS 功能。

#### 16. **required_db_vendor**

声明模型支持的数据库。Django 默认支持 `sqlite`, `postgresql`, `mysql`, `oracle`。

#### 17. **select_on_save**

决定是否使用 1.6 版本之前的 `django.db.models.Model.save()` 算法保存对象。默认值为 False。这个选项我们通常不用关心。

#### 18. **indexes**

接收一个应用在当前模型上的索引列表，如下例所示：

```python
from django.db import models

class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    class Meta:
        indexes = [
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['first_name'], name='first_name_idx'),
        ]
```

#### 19. **unique_together**

这个元数据是非常重要的一个，它等同于数据库的联合约束。

当你需要通过两个字段保持唯一性时可以使用这个选项。比如假设你希望，一个 Person 对象的 FirstName 和 LastName 两者的组合必须是唯一的，那么需要这样设置：

```python
unique_together=(("first_name","last_name"),)
```

这个元数据接收一个二维的元组，每个元素都是一维元组，表示一组联合唯一约束，可以同时设置多组约束。

最后需要注意，ManyToManyField 字段不能包含在 `unique_together` 中。如果你需要验证关联到 ManyToManyField 字段的唯一验证，可以尝试使用 signal（信号）或者明确指定 through 属性。

#### 20. **index_together**

联合索引，用法和特性类似 `unique_together`。

#### 21. **constraints**

为模型添加约束条件。通常是列表的形式，每个列表元素就是一个约束。

```python
from django.db import models

class Customer(models.Model):
    age = models.IntegerField()

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(age__gte=18), name='age_gte_18'),
        ]
```

上例中，会检查 age 年龄的大小，不得低于 18。

#### 22. **verbose_name**

最常用的元数据之一，用于设置模型对象的直观、人类可读的名称，用于在各种打印、页面展示等场景。可以用中文。例如：

```python
verbose_name = "story"
verbose_name = "披萨"
```

如果你不指定它，那么 Django 会使用小写的模型名作为默认值。

#### 23. **verbose_name_plural**

英语有单数和复数形式。这个就是模型对象的复数名，比如 apples。因为我们中文通常不区分单复数，所以保持和 `verbose_name` 一致也可以。

```python
verbose_name_plural = "stories"
verbose_name_plural = "披萨"
verbose_name_plural = verbose_name
```

如果不指定该选项，那么默认的复数名字是 `verbose_name` 加上 `s`。

#### 24. **label**

前面介绍的元数据都是可修改和设置的，但还有两个只读的元数据，label 就是其中之一。

label 等同于 `app_label.object_name`。例如 `polls.Question`，`polls` 是应用名，`Question` 是模型名。

#### 25. **label_lower**

同上，不过是小写的模型名。

（完）
