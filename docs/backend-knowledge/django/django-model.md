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

下面列举一些常用的内置字段和常用的参数，但不包括关系字段类型（字段名采用驼峰命名法，初学者请一定要注意）：

1. **AutoField**：一个自动增加的整数类型字段。通常不需要主动添加它，Django 会自动帮你添加字段：`id = models.AutoField(primary_key=True)`，这是一个自增字段，从 1 开始计数。如果一定要自己设置主键，那么一定要将字段设置为 `primary_key=True`。Django 在一个模型中只允许有一个自增字段，并且该字段必须为主键。

2. **SmallAutoField**：Django3.0 新增。类似 AutoField，但是只允许 1 到 32767。

3. **BigAutoField**：64 位整数类型自增字段，数字范围更大，从 1 到 9223372036854775807。

4. **CharField**：最常用的类型，字符串类型。必须接收一个 `max_length` 参数，表示字符串长度不能超过该值。

5. **TextField**：用于储存大量的文本内容，最常用的字段类型之一。Admin 管理界面用 `<textarea>` 多行编辑框表示该字段数据。

6. **BooleanField**：布尔值类型。默认值是 None。

7. **DateField**：日期类型。Python 中  `datetime.date`的实例。两个重要且不能共存的参数：`auto_now`：每次对象更新都会更新这个时间；`auto_now_add` 对象第一次创建添加，之后的更新不再改变。

8. **DateTimeField**：日期时间类型。Python 中 `datetime.datetime` 的实例。与 DateField 相比就是多了小时、分和秒的显示，其它功能、参数、用法、默认值等等都一样。

9. **TimeField**：时间类型，Python 中 `datetime.time` 的实例。接收同 DateField 一样的参数，只作用于小时、分和秒。类似于 DateField 和 DateTimeField。

10. **DecimalField**：固定精度的十进制小数。Python 中 Decimal 的实例。必须提供两个指定的参数：`max_digits`：最大的位数，必须大于或等于小数点位数；`decimal_places`：小数点位数，精度。

11. **EmailField**：邮箱类型，默认 `max_length` 最大长度 254 位。使用这个字段的好处是，可以使用 Django 内置的 EmailValidator 进行邮箱格式合法性验证。

12. **FloatField**：浮点数类型，对应 Python 的 float。参考整数类型字段。

13. **IntegerField**：整数类型，最常用的字段之一。取值范围 -2147483648 到 2147483647。

14. **BigIntegerField**：长的整数类型，64 位整数字段，类似 IntegerField ，-9223372036854775808 到 9223372036854775807。

15. **SmallIntegerField**：小的整数类型，包含 -32768 到 32767。

16. **PositiveIntegerField**：正整数（但可以包括 0），从 0 到 2147483647。

17. **PositiveBigIntegerField**：较大的正整数，从 0 到 9223372036854775807。

18. **PositiveSmallIntegerField**：较小的正整数，从  0到 32767。

19. **GenericIPAddressField**：字符串类型（IPV4 和 IPV6 是可选的），参数 `protocol` 可以是：`both`、`ipv4`、`ipv6`，验证时，会根据设置报错。

20. **SlugField**：slug 是一个新闻行业的术语。一个 slug 就是一个某种东西的简短标签，包含字母、数字、下划线或者连接线，通常用于 URLs 中。可以设置 `max_length` 参数，默认为 50。

21. **URLField**：一个用于保存 URL 地址的字符串类型，默认最大长度 200。

22. **BinaryField**：二进制数据类型。较少使用。

23. **ImageField**：图像类型，后面单独介绍。

24. **FileField**：上传文件类型，后面单独介绍。

25. **FilePathField**：文件路径类型，后面单独介绍。

26. **DurationField**：持续时间类型。存储一定期间的时间长度。类似 Python 中的 `timedelta`。在不同的数据库实现中有不同的表示方法。常用于进行时间之间的加减运算。但是小心了，这里有坑，PostgreSQL等数据库之间有兼容性问题！

27. **JSONField**：JSON 类型字段。Django3.1 新增。参数 `encoder` 和 `decoder` 为可选的编码器和解码器，用于自定义编码和解码方式。如果为该字段提供 `default` 值，务必保证该值是个不可变的对象，比如字符串对象。

28. **UUIDField**：用于保存通用唯一识别码（Universally Unique Identifier）的字段。使用 Python 的 UUID 类。在 PostgreSQL 数据库中保存为 uuid 类型，其它数据库中为 char(32)。这个字段是自增主键的最佳替代品。

### 重点字段使用详解

1. **FileField**

```python
class FileField(upload_to=None, max_length=100, **options)
```

上传文件字段（不能设置为主键）。在数据库内，我们实际保存的是一个字符串类型，默认最大长度 100，可以通过 `max_length` 参数自定义。真实的文件是保存在服务器的文件系统内的。

重要参数 `upload_to` 用于设置上传地址的目录和文件名。如下例所示：

```python
class MyModel(models.Model):
    # 文件被传至 MEDIA_ROOT/uploads 目录，MEDIA_ROOT 由你 settings 文件中设置
    upload = models.FileField(upload_to='uploads/')
    # 或者
    # 被传到 MEDIA_ROOT/uploads/2022/10/02 目录，增加了一个时间划分
    upload = models.FileField(upload_to='uploads/%Y/%m/%d/')
```

Django 很人性化地帮我们实现了根据日期生成目录或文件的方式。

`upload_to` 参数也可以接收一个回调函数，该函数返回具体的路径字符串，如下例：

```python
def user_directory_path(instance, filename):
    # 文件上传到 MEDIA_ROOT/user_<id>/<filename> 目录中
    return 'user_{0}/{1}'.format(instance.user.id, filename)

class MyModel(models.Model):
    upload = models.FileField(upload_to=user_directory_path)
```

例子中，`user_directory_path` 这种回调函数，必须接收两个参数，然后返回一个 Unix 风格的路径字符串。参数 instace 代表一个定义了 FileField 的模型的实例，说白了就是当前数据记录。filename 是原本的文件名。

从 Django3.0 开始，支持使用 pathlib.Path 处理路径。

当你访问一个模型对象中的文件字段时，Django 会自动给我们提供一个 FieldFile 实例作为文件的代理，通过这个代理，我们可以进行一些文件操作，主要如下：

* `FieldFile.name`：获取文件名
* `FieldFile.size`：获取文件大小
* `FieldFile.url`：用于访问该文件的 url
* `FieldFile.open(mode='rb')`：以类似 Python 文件操作的方式，打开文件
* `FieldFile.close()`：关闭文件
* `FieldFile.save(name, content, save=True)`：保存文件
* `FieldFile.delete(save=True)`：删除文件

这些代理的 API 和 Python 原生的文件读写 API 非常类似，其实本质上就是进行了一层封装，让我们可以在 Django 内直接对模型中文件字段进行读写，而不需要绕弯子。

2. **ImageField**

```python
class ImageField(upload_to=None, height_field=None, width_field=None, max_length=100, **options)
```

用于保存图像文件的字段。该字段继承了 FileField，其用法和特性与 FileField 基本一样，只不过多了两个属性 height 和 width。在数据库内，我们实际保存的也是一个字符串类型，默认最大长度 100，可以通过 `max_length` 参数自定义。真实的图片是保存在服务器的文件系统内的。

`height_field` 参数：保存有图片高度信息的模型字段名。`width_field` 参数：保存有图片宽度信息的模型字段名。

::: tip 小贴士
使用 Django 的 ImageField 需要提前安装 pillow 模块：`pip install pillow` 即可。
:::

::: warning
使用 FileField 或者 ImageField 字段的步骤：

* 在 `settings.py` 文件中，配置 `MEDIA_ROOT`，作为你上传文件在服务器中的基本路径（为了性能考虑，这些文件不会被储存在数据库中）。再配置个 `MEDIA_URL`，作为公用 URL，指向上传文件的基本路径。还要确保 Web 服务器的用户账号对该目录具有写的权限。
* 添加 `FileField` 或者 `ImageField` 字段到你的模型中，定义好 `upload_to` 参数，文件最终会放在 `MEDIA_ROOT` 目录的 "`upload_to`" 子目录中。
* 所有真正被保存在数据库中的，只是指向你上传文件路径的字符串而已。可以通过 url 属性，在 Django 的 template 模板中方便的访问这些文件。当然了，如果是前后端分离项目，那就根据前端 UI 组件的图片组件的 API 使用方式，传入 url 即可。
* 可以通过 `name` 和 `size` 属性，获取文件的名称和大小信息。

以上是大致的使用步骤，更详细的代码编写示例，网上搜一下即可，还是很多文章的，这里就不赘述了。
:::

安全建议：

无论你如何保存上传的文件，一定要注意他们的内容和格式，避免安全漏洞！务必对所有的上传文件进行安全检查，确保它们不出问题！如果你不加任何检查就盲目的让任何人上传文件到你的服务器文档根目录内，比如上传了一个 CGI 或者 PHP 脚本，很可能就会被访问的用户执行，这具有致命的危害。

3. **FilePathField**

```python
class FilePathField(path='', match=None, recursive=False, allow_files=True, allow_folders=False, max_length=100, **options)
```

一种用来保存文件路径信息的字段。在数据表内以字符串的形式存在，默认最大长度 100，可以通过 `max_length` 参数设置。

它包含有下面的一些参数：

* `path`：必须指定的参数。表示一个系统绝对路径。path通常是个字符串，也可以是个可调用对象，比如函数。
* `match`：可选参数，一个正则表达式，用于过滤文件名。只匹配基本文件名，不匹配路径。例如 `foo.*\.txt$`，只匹配文件名 `foo23.txt`，不匹配 `bar.txt` 与 `foo23.png`。
* `recursive`：可选参数，只能是 `True` 或者 `False`。默认为 `False`。决定是否包含子目录，也就是是否递归的意思。
* `allow_files`：可选参数，只能是 `True` 或者 `False`。默认为 `True`。决定是否应该将文件名包括在内。它和 `allow_folders` 两者之间，必须有一个为 `True`。
* `allow_folders`：可选参数，只能是 `True` 或者 `False`。默认为 `False`。决定是否应该将目录名包括在内。

比如：

```python
FilePathField(path="/home/images", match="foo.*", recursive=True)
```

它只匹配 `/home/images/foo.png`，但不匹配 `/home/images/foo/bar.png`，因为默认情况，只匹配文件名，而不管路径是怎么样的。

例子：

```python
import os
from django.conf import settings
from django.db import models

def images_path():
    return os.path.join(settings.LOCAL_FILE_DIR, 'images')

class MyModel(models.Model):
    file = models.FilePathField(path=images_path)
```

4. **UUIDField**

数据库无法自己生成 uuid，因此需要如下使用 default 参数：

```python
import uuid  # Python的内置模块
from django.db import models

class MyUUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # 其它字段
```

注意不要写成 `default=uuid.uuid4()`。

## 字段的参数

所有的模型字段都可以接收一定数量的参数，比如 `CharField` 至少需要一个 `max_length` 参数。下面的这些参数是所有字段都可以使用的，并且是可选的。

1. **null**：数据库中字段是否可以为空。默认值为 `False`。该值为 True 时，Django 在数据库用 `NULL` 保存空值。对于保存字符串类型数据的字段，请尽量避免将此参数设为 True，那样会导致两种「没有数据」的情况，一种是 `NULL`，另一种是空字符串 `''`。Django 的惯例是使用空字符串而不是 `NULL`。

2. **blank**：Admin 中是否允许用户提交空表单。默认值为 `False`。该值为 True 时，字段可以为空。和 null 参数不同的是，null 是纯数据库层面的，而 blank 是验证相关的，它与 Django 自带的表单验证是否允许输入框内为空有关，与数据库无关。所以要小心一个 null 为 False，blank 为 True 的字段接收到一个空值可能会出 bug 或异常。

3. **choices**：Admin 中显示选择框的内容，需要先提供一个二维的二元元组，第一个元素表示存在数据库内真实的值，第二个表示页面上显示的具体内容。在浏览器页面上将显示第二个元素的值。例如：

```python
YEAR_IN_SCHOOL_CHOICES = (
    ('FR', 'Freshman'),
    ('SO', 'Sophomore'),
    ('JR', 'Junior'),
    ('SR', 'Senior'),
    ('GR', 'Graduate'),
)
```

一般来说，最好将选项定义在类里，并取一个直观的名字，如下所示：

```python
from django.db import models

class Student(models.Model):
    FRESHMAN = 'FR'
    SOPHOMORE = 'SO'
    JUNIOR = 'JR'
    SENIOR = 'SR'
    YEAR_IN_SCHOOL_CHOICES = (
        (FRESHMAN, 'Freshman'),
        (SOPHOMORE, 'Sophomore'),
        (JUNIOR, 'Junior'),
        (SENIOR, 'Senior'),
    )
    year_in_school = models.CharField(
        max_length=2,
        choices=YEAR_IN_SCHOOL_CHOICES,
        default=FRESHMAN,
    )

    def is_upperclass(self):
        return self.year_in_school in (self.JUNIOR, self.SENIOR)
```

注意：每当 `choices` 的顺序变动时将会创建新的迁移。

如果一个模型中有多个字段需要设置 choices，可以将这些二维元组组合起来，显得更加整洁优雅，例如下面的做法：

```python
MEDIA_CHOICES = [
    ('Audio', (
            ('vinyl', 'Vinyl'),
            ('cd', 'CD'),
        )
    ),
    ('Video', (
            ('vhs', 'VHS Tape'),
            ('dvd', 'DVD'),
        )
    ),
    ('unknown', 'Unknown'),
]
```

反过来，要获取一个 choices 的第二元素的值，可以使用 `get_FOO_display()` 方法，其中的 FOO 用字段名代替。对于下面的例子：

```python
from django.db import models

class Person(models.Model):
    SHIRT_SIZES = (
    ('S', 'Small'),
    ('M', 'Medium'),
    ('L', 'Large'),
    )
    name = models.CharField(max_length=60)
    shirt_size = models.CharField(max_length=1, choices=SHIRT_SIZES)
```

使用方法：

```bash
>>> p = Person(name="Fred Flintstone", shirt_size="L")
>>> p.save()
>>> p.shirt_size
'L'
>>> p.get_shirt_size_display()
'Large'
```

从 Django3.0 开始，新增了 TextChoices、IntegerChoices 和 Choices 三个类，用来达到类似 Python 的 enum 枚举库的作用。不过用起来还挺复杂的，个人觉得只有当需要设置很多个 Choice 选项时，才非得用类的形式管理起来封装起来。否则还是二维元组更加方便。


4. **db_column**：该参数用于定义当前字段在数据表内的列名。如果未指定，Django 将使用字段名作为列名。

5. **db_index**：该参数接收布尔值。如果为 True，数据库将为该字段创建索引（[默认为 False](https://github.com/django/django/blob/b92ffebb0cdc469baaf1b8f0e72dddb069eb2fb4/django/db/models/fields/__init__.py#L188)）。如果该字段经常作为查询的条件，那么可以设置为 True 从而加快数据的检索速度。

6. **db_tablespace**：用于字段索引的数据库表空间的名字，前提是当前字段设置了索引。默认值为工程的 `DEFAULT_INDEX_TABLESPACE` 设置。如果使用的数据库不支持表空间，该参数会被忽略。

7. **default**：字段的默认值，可以是值或者一个可调用对象。如果是可调用对象，那么每次创建新对象时都会调用。设置的默认值不能是一个可变对象，比如列表、集合等等。lambda 匿名函数也不可用于 default 的调用对象，因为匿名函数不能被 migrations 序列化。

::: warning
注意：在某种原因不明的情况下将 `default` 设置为 `None`，可能会引发 intergyerror：not null constraint failed，即非空约束失败异常，导致 `python manage.py migrate` 失败，此时可将 `None` 改为 `False` 或其它的值，只要不是 `None` 就行。
:::

8. **primary_key**：如果没有给模型的任何字段设置这个参数为 True，Django 将自动创建一个 AutoField 自增字段，名为 `id`，并设置为主键。也就是 `id = models.AutoField(primary_key=True)`。

如果为某个字段设置了 `primary_key=True`，则当前字段变为主键，并关闭 Django 自动生成 id 主键的功能。

`primary_key=True` 隐含 `null=False` 和 `unique=True` 的意思。一个模型中只能有一个主键字段。

另外，主键字段不可修改，如果给某个对象的主键赋个新值实际上是创建一个新对象，并不会修改原来的对象。

9. **unique**：设为 `True` 时，在整个数据表内该字段的数据不可重复。

* 注意 1：对于 `ManyToManyField` 和 `OneToOneField` 关系类型，该参数无效。
* 注意 2： 当 `unique=True` 时，`db_index` 参数无须设置，因为 unqiue 隐含了索引。

10. **unique_for_date**：日期唯一。有点类似联合约束，比如对字段 `title` 设置 `unique_for_date="pub_date"`，就表示 Django 将不允许有两个模型对象具备同样的 `title` 和 `pub_date`。

11. **unique_for_month**：同上，只是月份唯一。

12. **unique_for_year**：同上，只是年份唯一。

13. **verbose_name**：为字段设置一个人类可读，更加直观的别名，这个值会在 Admin 中显示。

对于每一个字段类型，除了 ForeignKey、ManyToManyField 和 OneToOneField 这三个特殊的关系类型，其第一可选位置参数都是 `verbose_name`。如果没指定这个参数，Django 会利用字段名自动创建它，并将下划线转换为空格。

对于外键、多对多和一对一字段，由于第一个参数需要用来指定关联的模型，因此必须用关键字参数 `verbose_name` 来明确指定。如下：

```python
poll = models.ForeignKey(
    Poll,
    on_delete=models.CASCADE,
    verbose_name="the related poll",
    )
sites = models.ManyToManyField(Site, verbose_name="list of sites")
    place = models.OneToOneField(
    Place,
    on_delete=models.CASCADE,
    verbose_name="related place",
)
```

另外，无须大写 `verbose_name` 的首字母，Django 在 Admin 中会自动完成这一工作。

14. **auto_now**：更新时自动更新当前时间。

15. **auto_now_add**：创建时自动更新当前时间。

16. **editable**：Admin 中是否可以编辑。默认值为 `True`。如果设为 False，那么当前字段将不会在 Admin 后台或者其它的 ModelForm 表单中显示，同时还会被模型验证功能跳过。

17. **error_messages**：用于自定义错误信息。参数接收字典类型的值。字典的键可以是 `null`、`blank`、`invalid`、`invalid_choice`、`unique` 和 `unique_for_date` 其中的一个。例如：

```python
{"null": "不能为空", "invalid": "格式错误"}
```

18. **help_text**：Admin 中该字段的提示信息。当然了，即便你的字段未用于表单，有时候它对于生成文档也是很有用的。

::: warning
该帮助文本默认情况下是可以带 HTML 代码的，具有风险：

```python
help_text="Please use the following format: <em>YYYY-MM-DD</em>."
```

所以使用时请注意转义为纯文本，防止脚本攻击。
:::

19. **validators**：自定义错误验证（列表类型），从而定制想要的验证规则。例如：

```python
from django.core.validators import RegexValidator
from django.core.validators import EmailValidator,URLValidator,DecimalValidator,
MaxLengthValidator,MinLengthValidator,MaxValueValidator,MinValueValidator

test = models.CharField(
    max_length=32,
    error_messages={
    'c1': '优先错信息1',
    'c2': '优先错信息2',
    'c3': '优先错信息3',
},
validators=[
    RegexValidator(regex='root_\d+', message='错误了', code='c1'),
    RegexValidator(regex='root_112233\d+', message='又错误了', code='c2'),
    EmailValidator(message='又错误了', code='c3'), ]
)
```

（完）
