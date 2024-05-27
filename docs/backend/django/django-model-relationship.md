# model 外键关系

多表关联是常见的需求之一，Django 提供了一组关系类型字段，用来表示模型与模型之间的关系：ForeignKey，ManyToMany，OneToOneField。

## 外键/多对一（ForeignKey）

### 用法示例

多对一的关系，通常被称为外键，**需要定义在「多」的一方**。

外键需要两个位置参数，一个是关联的模型，另一个是 `on_delete`。在 Django2.0 版本后，`on_delete` 属于必填参数。

下面是一个简单的例子：

```python
from django.db import models

class Manufacturer(models.Model):
    # ...
    pass

class Car(models.Model):
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)
    # ...
```

多对一字段的变量名一般设置为关联的模型的小写单数，而多对多则一般设置为小写复数。

::: tip 小贴士
在实际的数据库后台，Django 会为每一个外键添加 `_id` 后缀，并以此创建数据表里的一列。在上面的工厂与车的例子中，Car 模型对应的数据表中，会有一列叫做 `manufacturer_id`。但实际上，在 Django 代码中我们不需要使用这个列名，除非是书写原生的 SQL 语句，一般我们都直接使用字段名 `manufacturer`。
:::

### 参数说明

外键还有一些参数，下面仅列举一些常见且重要的。

#### 1. **on_delete**

当一个外键关联的对象被删除时，Django 将模仿 `on_delete` 参数定义的 SQL 约束执行相应操作。比如，你有一个可为空的外键，并且你想让它在关联的对象被删除时，自动设为 `null`，可以如下定义：

```python
user = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    blank=True,
    null=True,
)
```

该参数可选的值（全部为大写）都内置在 `django.db.models` 中，包括：

* CASCADE：模拟SQL语言中的 `ON DELETE CASCADE` 约束，将定义有外键的模型对象同时删除。
* PROTECT：阻止上面的删除操作，但是弹出 `ProtectedError` 异常。
* SET_NULL：将外键字段设为 `null`，只有当字段设置了 `null=True` 时，方可使用该值。
* SET_DEFAULT：将外键字段设为默认值。只有当字段设置了 `default` 参数时，方可使用。
* DO_NOTHING：什么也不做。
* SET()：设置为一个传递给 SET() 的值或者一个回调函数的返回值。注意大小写。
  ```python
  from django.conf import settings
  from django.contrib.auth import get_user_model
  from django.db import models

  def get_sentinel_user():
      return get_user_model().objects.get_or_create(username='deleted')[0]

  class MyModel(models.Model):
      user = models.ForeignKey(
          settings.AUTH_USER_MODEL,
          on_delete=models.SET(get_sentinel_user),
      )
  ```
* RESTRICT: Django3.1 新增。它与 PROTECT 不同，在大多数情况下，同样不允许删除，但是在某些特殊情况下，却是可以删除的。这个模式比较难以理解，目前想不到应用场景就先作为了解。

::: warning
这个参数在 Django2.0 之后，不可以省略了，需要显式的指定。这也是除了路由编写方式外，Django2 和 Django1.x 最大的不同点之一。
:::

#### 2. **related_name**

这个参数很好用，用于关联对象反向引用模型的名称。以前面车和工厂的例子解释，就是从工厂反向关联到车的关系名称。

通常情况下，这个参数我们可以不设置，Django 会默认以模型的小写加上 `_set` 作为反向关联名，比如对于工厂就是 `car_set`，如果你觉得 `car_set` 还不够直观，可以如下定义：

```python
class Car(models.Model):
    manufacturer = models.ForeignKey(
        'production.Manufacturer',      
        on_delete=models.CASCADE,
        related_name='car_producted_by_this_manufacturer',  # 自定义一个反向关联名
    )
```

以后获取一个工厂对象后，想获取到所有它所生产的汽车，就可以使用下面的方式了：

```python
maufacturer = Manufacturer.objects.first()

cars = maufacturer.car_producted_by_this_manufacturer.all()
```

#### 3. **limit_choices_to**

这个参数用于限制外键所能关联的对象，只能用于 Django 的 ModelForm（Django 的表单模块）和 Admin 后台，对其它场合无限制功能。它的值可以是一个字典、Q 对象或者一个返回字典或 Q 对象的函数调用。

例如：

```python
# 这样定义，则 ModelForm 的 staff_member 字段列表中，只会出现 is_staff=True 的 Users 对象，这一功能对于 Admin 后台非常有用
staff_member = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    limit_choices_to={'is_staff': True},
)
```

#### 4. **to_field**

默认情况下，外键都是关联到被关联对象的主键上（一般为 `id`）。如果指定这个参数，可以关联到指定的字段上，但是该字段必须具有 `unique=True` 属性，也就是具有唯一属性。

#### 5. **db_constraint**

默认情况下，这个参数被设为 `True`，表示遵循数据库约束，这也是大多数情况下你的选择。

如果设为 False，那么将无法保证数据的完整性和合法性。除非在下面的场景中，才可能需要将它设置为 False：

* 有历史遗留的不合法数据，没办法的选择
* 你正在分割数据表

当它为 False，并且你试图访问一个不存在的关系对象时，会抛出 DoesNotExist 异常。

## 多对多（ManyToManyField）

### 用法示例

多对多关系在数据库中也是非常常见的关系类型。比如一本书可以有好几个作者，一个作者也可以写好几本书。

多对多的字段可以定义在任何的一方，不过最好定义在符合人们思维习惯的一方，但不要同时都定义，只能选择一个模型设置该字段（比如我们通常将披萨上的配料字段放在披萨模型中，而不是在配料模型中放置披萨字段）。

下面是一个简单的例子：

```python
from django.db import models

class Topping(models.Model):
    # ...
    pass

class Pizza(models.Model):
    # ...
    toppings = models.ManyToManyField(Topping)
```

一般建议为**多对多字段名使用复数形式**。

多对多关系需要一个位置参数：关联的对象模型，其它用法和外键多对一基本类似。

在在数据库后台，Django 实际上会额外创建一张用于体现多对多关系的中间表。默认情况下，该表的名称是 `多对多字段名+包含该字段的模型名+一个独一无二的哈希码`，例如 `author_books_9cdf4`，不过也可以通过 `db_table` 选项，自定义中间表的表名。

### 参数说明

#### 1. **related_name**

参考外键的相同参数。

#### 2. **limit_choices_to**

参考外键的相同参数。但是对于使用 `through` 参数自定义中间表的多对多字段无效。

#### 3. **through**

用于自定义多对多关系的那张额外的中间表，参数的值为一个中间模型。

最常见的使用场景是你需要为多对多关系添加额外的数据，比如添加两个人建立 QQ 好友关系的时间。

下面是一个简单的例子：

```python
from django.db import models

class Person(models.Model):
    name = models.CharField(max_length=50)

class Group(models.Model):
    name = models.CharField(max_length=128)
    members = models.ManyToManyField(
        Person,
        through='Membership',  # 自定义中间表
        through_fields=('group', 'person'),
    )

# 这就是具体的中间表模型
class Membership(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    inviter = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name="membership_invites",
    )
    invite_reason = models.CharField(max_length=64)
```

上面的代码中，定义了一个新的模型 `Membership`，用来保存 `Person` 和 `Group` 模型的多对多关系，并且同时增加了「邀请人」和「邀请原因」的字段。

#### 4. **through_fields**

上面的例子中，就用到了这个参数。可以看到作为多对多关系的中间表，本质上 `Membership` 模型中是包含了两个 ForeignKey 外键（`group` 和 `person`），也就是说，中间表的作用是把两个多对一关系衔接起来，实现多对多关系。

但在上面的自定义中间表模型中，关联 Person 模型的外键有两个（`person` 和 `inviter`），Django 无法确定到底使用哪个作为和 Group 关联的对象。所以，在这个例子中，必须显式的指定 `through_fields` 参数，用于定义关系。

`through_fields` 参数接收一个二元元组，它指定了从中间表模型 `Membership` 中选择哪两个字段，作为关系连接字段。

#### 5. **db_table**

设置中间表的名称。不指定的话，则使用默认值。

#### 6. **db_constraint**

参考外键的相同参数。

::: warning
* ManyToManyField 多对多字段不支持 Django 内置的 validators 验证功能。
* null 参数对 ManyToManyField 多对多字段无效，所以设置 `null=True` 毫无意义。
:::

## 一对一（OneToOneField）

### 用法示例

这种关系类型一般用于某张表的补充。比如使用了 Django 自带的 User 用户表，但是想要在原来的模型的基础上添加新的字段，那么就可以使用一对一外键的方式，定义一个用户的扩展模型。

下面是一个简单的例子：

```python
from django.contrib.auth.models import User
from django.db import models

class UserExtension(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='extension')
    school = models.CharField(max_length=100)
```

因为设置了级联删除，所以当某个 User 对象被删除后，与之相关联的 UserExtension 对象也会被删除。

简单理解，OneToOneField 与声明了 `unique=True` 的 ForeignKey 非常相似，不同的是使用反向关联的时候，得到的不是一个对象列表，而是一个单独的对象。

::: warning
对于 Django2.0 及以上的版本，在使用 OneToOneField 和 ForeignKey 时，需要加上 `on_delete` 参数。
:::

### 参数说明

OneToOneField（一对一关系）拥有和 ForeignKey（多对一外键关系）一样的额外可选参数，只是多了一个不常用的 `parent_link` 参数。

（完）
