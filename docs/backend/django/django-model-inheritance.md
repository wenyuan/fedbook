# model 的继承

Django 中所有的模型都必须直接或间接地继承自 django.db.models.Model。

而在实际开发中，对于 model 的继承我们需要决定，父模型是否是一个在数据库中创建数据表的模型，还是一个只用来保存子模型共有内容、并不实际创建数据表的抽象模型。

基于不同的需求，在 Django 中有三种继承方式：

* 抽象基类（Abstract base classes）：父类只用来保存每个子类共有的信息，它本身是不会被独立使用的，而且它不会创建实际的数据库表。
* 多表继承（Multi-table inheritance）：每一个模型都有自己的数据库表，父子之间独立存在。
* 代理模型（Proxy models）：如果你只想修改模型的 Python 层面的行为，并不想改动模型的字段，可以使用代理模型。

## 抽象基类

### 用法示例

只需要在模型的 Meta 类里添加 `abstract=True` 元数据项，就可以将一个模型转换为抽象基类。Django 不会为这种类创建实际的数据库表，它们也没有管理器，不能被实例化也无法直接保存。抽象基类完全就是用来保存子模型们共有的内容部分，达到重用的目的。当它们被继承时，它们的字段会全部复制到子模型中。

比如下面的例子：

```python
from django.db import models

class CommonInfo(models.Model):
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()

    class Meta:
        abstract = True

class Student(CommonInfo):
    home_group = models.CharField(max_length=5)
```

### Meta 数据

如果子类没有声明自己的 Meta 类，那么它将自动继承抽象基类的 Meta 类。如果子类要设置自己的 Meta 属性，则需要扩展基类的 Meta。如下：

```python
from django.db import models

class CommonInfo(models.Model):
    # ...
    class Meta:
        abstract = True
        ordering = ['name']

class Student(CommonInfo):
    # ...
    class Meta(CommonInfo.Meta):  # 注意这里有个继承关系
        db_table = 'student_info'
```

总结一下：

* 抽象基类中有的元数据，子模型没有的话，直接继承。
* 抽象基类中有的元数据，子模型也有的话，直接覆盖。
* 子模型可以额外添加元数据。
* 抽象基类中的 `abstract=True` 这个元数据不会被继承。也就是说如果想让一个抽象基类的子模型，同样成为一个抽象基类，那必须显式地在该子模型的 Meta 中同样声明一个 `abstract = True`。
* 有一些元数据对抽象基类无效，比如 `db_table`，因为抽象基类本身不会创建数据表，而且它的所有子类也不会按照这个元数据来设置表名。
* 由于 Python 继承的工作机制，如果子类继承了多个抽象基类，则默认情况下仅继承第一个列出的基类的 Meta 选项。如果要从多个抽象基类中继承 Meta 选项，必须显式地声明 Meta 继承。方法如下：
  ```python
  from django.db import models

  class CommonInfo(models.Model):
      name = models.CharField(max_length=100)
      age = models.PositiveIntegerField()

      class Meta:
          abstract = True
          ordering = ['name']

  class Unmanaged(models.Model):
      class Meta:
          abstract = True
          managed = False

  class Student(CommonInfo, Unmanaged):
      home_group = models.CharField(max_length=5)

      class Meta(CommonInfo.Meta, Unmanaged.Meta):
          pass
  ```

### related_name 和 related_query_name

如果在抽象基类中存在 ForeignKey 或者 ManyToManyField 字段，并且使用了 `related_name` 或者 `related_query_name` 参数，那么会导致抽象基类出现问题。因为按照默认规则，每一个子类都将拥有同样的字段，在关联对象反查的时候会出现混乱。

为了解决这个问题，当在抽象基类中使用 `related_name` 或者 `related_query_name` 参数时，它们两者的值中应该包含 `%(app_label)s` 和 `%(class)s` 部分：

* `%(class)s` 用字段所属子类的小写名替换
* `%(app_label)s` 用子类所属 app 的小写名替换

例如，对于 common/models.py 模块：

```python
from django.db import models

class Base(models.Model):
    m2m = models.ManyToManyField(
        OtherModel,
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)ss",
    )

    class Meta:
        abstract = True

class ChildA(Base):
    pass

class ChildB(Base):
    pass
```

对于另外一个应用中的 rare/models.py：

```python
from common.models import Base

class ChildB(Base):
    pass
```

对于上面的继承关系：

* `common.ChildA.m2m` 字段的反向名称应该是 `common_childa_related`；反向查询名称应该是 `common_childas`。
* `common.ChildB.m2m` 字段的反向名称应该是 `common_childb_related`；反向查询名称应该是 `common_childbs`。
* `rare.ChildB.m2m` 字段的反向名称应该是 `rare_childb_related`；反向查询名称应该是 `rare_childbs`。

当然，如果你不设置 `related_name` 或者 `related_query_name` 参数，这些问题就不存在了。因为默认反向名称将是子类的名称，后跟 `_set`。

## 多表继承

### 用法示例

这种继承方式下，父类和子类都是独立自主、功能完整、可正常使用的模型，都有自己的数据库表，内部隐含了一个一对一的关系（通过自动创建的 OneToOneField）。例如：

```python
from django.db import models

class Place(models.Model):
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=80)

class Restaurant(Place):
    serves_hot_dogs = models.BooleanField(default=False)
    serves_pizza = models.BooleanField(default=False)
```

所有 Place 的字段都可以在 Restaurant 中使用，虽然数据存放在不同的数据表中。如下：

```python
Place.objects.filter(name="Bob's Cafe")
Restaurant.objects.filter(name="Bob's Cafe")
```

如果一个 Place 对象存在相应的 Restaurant 对象，那么就可以使用 Place 对象通过关系获得 Restaurant 对象。如下：

```python
p = Place.objects.get(id=12)
# 如果 p 也是一个 Restaurant 对象，那么下面的调用可以获得该 Restaurant 对象
p.restaurant
```

但是，如果上面示例中的 p 不是 Restaurant 对象（它已直接创建为 Place 对象或是其他类的父对象），那么上面的调用方式会弹出 `Restaurant.DoesNotExist` 异常。

在 Restaurant 上自动创建的 OneToOneField 将其链接到 Place 如下所示：

```python
place_ptr = models.OneToOneField(
    Place, on_delete=models.CASCADE,
    parent_link=True,
)
```

可以通过创建一个 OneToOneField 字段并设置 `parent_link=True`，自定义这个一对一字段。

从上面的API操作展示可以看出，这种继承方式还是有点混乱的，不如抽象基类来得直接明了。

### Meta 和多表继承

在多表继承的情况下，由于父类和子类都在数据库内有物理存在的表，父类的 Meta 类会对子类造成不确定的影响，因此，Django 在这种情况下关闭了子类继承父类的 Meta 功能。这一点和抽象基类的继承方式有所不同。

但是，还有两个 Meta 元数据属性特殊一点，那就是 `ordering` 和 `get_latest_by`，这两个参数是会被继承的。因此，如果在多表继承中，如果不想让子类继承父类的上面两种参数，就必须在子类中显示地指出或重写。如下：

```python
class ChildModel(ParentModel):
    # ...

    class Meta:
        # 移除父类对子类的排序影响
        ordering = []
```

### 多表继承和反向关联

因为多表继承使用了一个隐含的 OneToOneField 来链接子类与父类，所以可以从父类访问子类。但是这个 OnetoOneField 字段默认的 `related_name` 值与 ForeignKey 和 ManyToManyField 默认的反向名称相同。

也就是说，如果你要与父类或另一个子类做多对一或是多对多关系，就必须在每个多对一和多对多字段上强制指定 `related_name`。否则 Django 就会在运行或验证（validation）时抛出异常。

例如上面的例子，我们再创建一个子类，其中包含一个到父 model 的 ManyToManyField 关系字段：

```python
class Supplier(Place):
    customers = models.ManyToManyField(Place)
```

这会产生下面的错误：

```bash
Reverse query name for 'Supplier.customers' clashes with reverse query
name for 'Supplier.place_ptr'.
HINT: Add or change a related_name argument to the definition for
'Supplier.customers' or 'Supplier.place_ptr'.
```

解决方法是：向 customers 字段中添加 `related_name` 参数：

```python
customers = models.ManyToManyField(Place, related_name='provider')
```

## 代理模型

### 用法示例

使用多表继承时，父类的每个子类都会创建一张新数据表，通常情况下，这是我们想要的操作，因为子类需要一个空间来存储不包含在父类中的数据。但有时，你可能只想更改模型在 Python 层面的行为，比如更改默认的 manager 管理器，或者添加一个新方法。

这时就应该使用代理模式的继承：创建原始 model 的代理。你可以创建一个用于 create，delete 和 update 的代理 model，使用代理 model 的时候数据将会真实保存。这和使用原始 model 是一样的，所不同的是当你改变 model 操作时，不需要去更改原始的 model。

代理模型其实就是给原模型换了件衣服（API），实际操作的还是原来的模型和数据。

声明一个代理模型只需要将 Meta 中 proxy 的值设为 True。

例如想给 Person 模型添加一个方法：

```python
from django.db import models

class Person(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)

class MyPerson(Person):
    class Meta:
        proxy = True

    def do_something(self):
        # ...
        pass
```

MyPerson 类将操作和 Person 类同一张数据库表。并且任何新的 Person 实例都可以通过 MyPerson 类进行访问，反之亦然。

```python
p = Person.objects.create(first_name="foobar")
MyPerson.objects.get(first_name="foobar")  # -> <MyPerson: foobar>
```

下面的例子通过代理进行排序，但父类却不排序：

```python
class OrderedPerson(Person):
    class Meta:
        # 现在，普通的Person查询是无序的，而 OrderedPerson 查询会按照 last_name 排序
        ordering = ["last_name"]
        proxy = True
```

### 一些约束

* 代理模型必须继承自一个非抽象的基类，并且不能同时继承多个非抽象基类；
* 代理模型可以同时继承任意多个抽象基类，前提是这些抽象基类没有定义任何模型字段。
* 代理模型可以同时继承多个别的代理模型，前提是这些代理模型继承同一个非抽象基类。

### 代理模型的管理器

如不指定，则继承父类的管理器。如果你自己定义了管理器，那它就会成为默认管理器，但是父类的管理器依然有效。如下例子：

```python
from django.db import models

class NewManager(models.Manager):
    # ...
    pass

class MyPerson(Person):
    objects = NewManager()

    class Meta:
        proxy = True
```

如果你想要向代理中添加新的管理器，而不是替换现有的默认管理器，你可以创建一个含有新的管理器的基类，并在继承时把他放在主基类的后面：

```python
# Create an abstract class for the new manager.
from django.db import models

class NewManager(models.Manager):
    # ...
    pass

class ExtraManagers(models.Model):
    secondary = NewManager()

    class Meta:
        abstract = True

class MyPerson(Person, ExtraManagers):
    class Meta:
        proxy = True
```

## 多重继承

多重继承和多表继承是两码事，两个概念。

Django 的模型体系支持多重继承，就像 Python 一样。如果多个父类都含有 Meta 类，则只有第一个父类的会被使用，剩下的会忽略掉。

一般情况，能不要多重继承就不要，尽量让继承关系简单和直接，避免不必要的混乱和复杂。

需要注意，继承同时含有相同 id 主键字段的类将抛出异常。为了解决这个问题，你可以在基类模型中显式的使用 `AutoField` 字段。如下例所示：

```python
class Article(models.Model):
    article_id = models.AutoField(primary_key=True)
    ...

class Book(models.Model):
    book_id = models.AutoField(primary_key=True)
    ...

class BookReview(Book, Article):
    pass
```

或者使用一个共同的祖先来持有 AutoField 字段，并在直接的父类里通过一个 OneToOne 字段保持与祖先的关系，如下所示：

```python
class Piece(models.Model):
    pass

class Article(Piece):
    article_piece = models.OneToOneField(Piece, on_delete=models.CASCADE, parent_link=True)
    ...

class Book(Piece):
    book_piece = models.OneToOneField(Piece, on_delete=models.CASCADE, parent_link=True)
    ...

class BookReview(Book, Article):
    pass
```

::: warning
在 Python 语言层面，子类可以拥有和父类相同的属性名，这样会造成覆盖现象。

但是对于 Django，如果继承的是一个非抽象基类，那么子类与父类之间不可以有相同的字段名。比如下面是不行的：

```python
class A(models.Model):
    name = models.CharField(max_length=30)

class B(A):
    name = models.CharField(max_length=30)
```

上述代码如果执行 `python manage.py makemigrations` 会弹出下面的错误：

```bash
django.core.exceptions.FieldError: Local field 'name' in class 'B' clashes with field of the same name from base class 'A'.
```

但是，如果父类是个抽象基类就没有问题，如下：

```python
class A(models.Model):
    name = models.CharField(max_length=30)

    class Meta:
        abstract = True

class B(A):
    name = models.CharField(max_length=30)
```
:::

## 用包来组织模型

在我们使用 `python manage.py startapp xxx` 命令创建新的应用时，Django 会自动帮我们建立一个应用的基本文件组织结构，其中就包括一个 `models.py` 文件。通常，我们把当前应用的模型都编写在这个文件里，但是如果你的模型很多，那么将单独的 `models.py` 文件分割成一些独立的文件是个更好的做法。

首先，我们需要在应用中新建一个叫做 `models` 的包，再在包下创建一个 `__init__.py` 文件，这样才能确立包的身份。然后将 `models.py` 文件中的模型分割到一些 `.py` 文件中，比如 `organic.py` 和 `synthetic.py`，然后删除 `models.py` 文件。最后在 `__init__.py` 文件中导入所有的模型。如下例所示：

```python
# myapp/models/__init__.py

from .organic import Person
from .synthetic import Robot
```

要显式明确地导入每一个模型，而不要使用 `from .models import *` 的方式，这样不会混淆命名空间，让代码更可读，更容易被分析工具使用。

（完）
