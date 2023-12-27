# Django 用户模型扩展/重写

## 内置 User 模型

Django 自带的 User 模型是这个框架的核心部分，它的完整的路径是在 `django.contrib.auth.models.User`。

内置的 User 模型拥有以下的字段：

* `username`：用户名。150 个字符以内。可以包含数字和英文字符，以及 `_`、`@`、`+`、`.` 和 `-` 字符。不能为空，且必须唯一。
* `first_name`：歪果仁的 `first_name` 也就是我们的「名」，在 30 个字符以内。可以为空。
* `last_name`：歪果仁的 `last_name` 也就是我们的「姓」，在 150 个字符以内。可以为空。
* `email`：邮箱。可以为空。
* `password`：密码。经过哈希过后的密码。
* `groups`：分组。一个用户可以属于多个分组，一个分组可以拥有多个用户。groups 这个字段是跟 Group 的一个多对多的关系。
* `user_permissions`：权限。一个用户可以拥有多个权限，一个权限可以被多个用户所有用。和 Permission 属于一种多对多的关系。
* `is_staff`：是否可以进入到 Django 自带的 Admin 管理后台。代表是否是员工。
* `is_active`：是否是可用的。对于一些想要删除账号的数据，我们设置这个值为 `False` 就可以了，而不是真正的从数据库中删除。
* `is_superuser`：是否是超级管理员。如果是超级管理员，那么拥有整个网站的所有权限。
* `last_login`：上次登录的时间。
* `date_joined`：账号创建的时间。

基于内置的 User 模块，Django 实现了现成的登录验证功能。通过 `django.contrib.auth.authenticate` 即可实现。这个方法只能通过 `username` 和 `password` 来进行验证。就像这样：

```python
from django.contrib.auth import authenticate


user = authenticate(username='zhangsan', password='******')
# 如果验证通过了，那么就会返回一个user对象。
if user is not None:
    # 执行验证通过后的代码
else:
    # 执行验证没有通过的代码。
```

但是有时候 Django 内置的 User 模型还是不能满足我们的需求。比如在验证用户登录的时候，他用的是用户名作为验证，而我们有时候需要通过手机号码或者邮箱来进行验证。还有比如我们想要增加一些新的字段。那么这时候我们就需要扩展用户模型了。扩展用户模型的方式目前有四种比较主流的，接下来一一举例。

## 第一种：设置 Proxy 模型

* 作用: 给模型增加操作方法
* 局限: 不能增加或减少 User 模型的字段
* 好处: 不破坏原来的 User 模型的表结构

如果对 Django 提供的字段，以及验证的方法都比较满意，没有什么需要改的。但是只是需要在他原有的基础之上增加一些操作的方法。那么建议使用这种方式。示例代码如下：

```python
# models.py
class Person(User):
    # 如果模型是一个代理模型
    # 那么就不能在这个模型中添加新的 Field
    # telephone = models.CharField(max_length=11)  # 错误写法
    class Meta:
        proxy = True

    # proxy 正确用法是给模型添加自定义方法
    # 如添加列出黑名单的方法
    def get_blacklist(self):
        return self.objects.filter(is_active=False)
```

上述代码，我们定义了一个 Person 类，让他继承自 User，并且在 Meta 中设置 `proxy=True`，说明这个只是 User 的一个代理模型。他并不会影响原来 User 模型在数据库中表的结构。以后如果你想方便的获取所有黑名单的人，那么你就可以使用 `Person.get_blacklist()` 来获得。并且 `User.objects.all()` 和 `Person.objects.all()` 其实是等价的。因为他们都是从 User 这个模型中获取所有的数据。

## 第二种：一对一外键

* 作用：给模型增加新的字段、新方法
* 局限：只能增加字段，不能减少字段，不能修改用户验证方法：`authenticate`
* 好处：不破坏原来的 User 模型的表结构

如果你对用户验证方法 `authenticate` 没有其他要求，就是使用 `username` 和 `password` 即可完成。但是想要在原来模型的基础之上添加新的字段，那么可以使用一对一外键的方式。示例代码如下：

```python
# models.py
from django.contrib.auth.models import User
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save


class UserExtension(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='extension')
    birthday = models.DateField(null=True, blank=True)
    school = models.CharField(max_length=100)


@receiver(post_save, sender=User)
def create_user_extension(sender, instance, created, **kwargs):
    if created:
        UserExtension.objects.create(user=instance)
    else:
        instance.extension.save()
```

上述代码定义一个 `UserExtension` 的模型，并且让它和 User 模型进行一对一的绑定，以后我们新增的字段，就添加到 UserExtension 上。并且还写了一个接受保存模型的信号处理方法，只要是 User 调用了 `save` 方法，那么就会创建一个 UserExtension 和 User 进行绑定。如下所示：

```python
# views.py
from django.contrib.auth.models import User
from django.http import HttpResponse


def one_to_one_view(request):
    user = User.objects.create_user(username='lisi', email='lisi@qq.com', password='******')
    # 给扩展的字段设置值
    user.extension.school = 'Harvard'
    user.save()
    return HttpResponse('一对一扩展User模型')
```

## 第三种：继承 AbstractUser

* 作用：给模型增加新的字段，修改用户验证方法: `authenticate`
* 局限：只能增加，不能减少字段
* 坏处：破坏了原来的 User 模型的表结构

对于 `authenticate` 不满意，并且不想要修改原来 User 对象上的一些字段，但是想要增加一些字段，那么这时候可以直接继承自 `django.contrib.auth.models.AbstractUser`，其实这个类也是 `django.contrib.auth.models.User` 的父类。它继承自 AbstractBaseUser 和 PermissionsMixin，默认管理器是 UserManager。

比如我们想要在原来 User 模型的基础之上添加一个 `telephone` 和 `school` 字段。步骤如下：

### 创建模型

示例代码如下：

```python
# models.py
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    telephone = models.CharField(max_length=11, unique=True)
    school = models.CharField(max_length=100)
    # 指定 telephone 作为 USERNAME_FIELD，而不是原来的 username 字段，所以 username 要重写
    username = models.CharField(max_length=150)

    # 指定 telephone 作为 USERNAME_FIELD，以后使用 authenticate
    # 函数验证的时候，就可以根据 telephone 来验证
    # 而不是原来的 username
    USERNAME_FIELD = 'telephone'
    # USERNAME_FIELD 对应的 'telephone' 字段和密码字段默认是必须的字段
    # [] 可以添加其它必须的字段，比如 ['username', 'email']
    REQUIRED_FIELDS = []

    # 重新定义 Manager 对象，在创建 user 的时候使用 telephone 和 password
    # 而不是使用 username 和 password
    objects = UserManager()
```

### 重新定义 UserManager

如果自定义的用户模型定义了和默认用户相同的 `username`，`email`，`is_staff`，`is_active`，`is_superuser`，`last_login`，和 `date_joined` 等字段，可以直接使用 UserManager；但是，如果自定义的用户模型还定义了其他字段，那么就需要定义一个自定义管理器，它继承自 BaseUserManager，这个父类提供了两个额外的方法：

* `create_user()`
* `create_superuser()`

```python
# models.py
from django.contrib.auth.models import BaseUserManager


# 重写 UserManager
class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, telephone, password, **extra_fields):
        if not telephone:
            raise ValueError("请填入手机号码！")
        if not password:
            raise ValueError("请填入密码!")
        user = self.model(telephone=telephone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, telephone, password, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(telephone, password, **extra_fields)

    def create_superuser(self, telephone, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(telephone, password, **extra_fields)
```

### 配置 settings 文件

然后再在 settings.py 中配置好：

```python
# settings.py
AUTH_USER_MODEL = 'appname.User'
```

上面的值表示 Django 应用的名称（必须位于 `INSTALLLED_APPS` 中）和你想使用的 User 模型的名称，即 `app名.类名`。

### 在 admin 中注册模型

```python
# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

admin.site.register(User, UserAdmin)
```

### 使用自定义的模型

如何使用这个自定义的模型：比如以后我们有一个 Article 模型，需要通过外键引用这个 User 模型。

如果**直接将 User 导入到当前文件中**，也是可行的，如下：

```python
# models.py
from django.db import models
from appname.models import User


class Article(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
```

但是按照官网所说，我们以后有可能会需要更改 `settings.AUTH_USER_MODEL` 配置，也就是说可能会更改项目的用户模型。那么为了更灵活的适配各种情况，官方建议使用 `django.contrib.auth.get_user_model()` 来引用用户模型，如下：

```python
from django.contrib.auth import get_user_model

User = get_user_model()
```

同时，当要定义一个外键或者多对多关系时，应该使用 `settings.AUTH_USER_MODEL` 设置来指定自定义的模型。示例代码如下：

```python
# models.py
from django.conf import settings
from django.db import models


class Article(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
```

在连接用户模型发送的信号时，也应使用 `settings.AUTH_USER_MODEL` 配置指定自定义模型。示例代码如下：

```python
from django.conf import settings
from django.db.models.signals import post_save

def post_save_receiver(sender, instance, created, **kwargs):
    pass

post_save.connect(post_save_receiver, sender=settings.AUTH_USER_MODEL)
```

一般来说，在导入时候执行的代码中，应该使用 `AUTH_USER_MODEL` 设置引用用户模型。`get_user_model()` 只在 Django 已经导入所有的模型后才工作。

这种方式因为破坏了原来 User 模型的表结构，所以必须要在第一次 migrate 前就先定义好。

## 第四种：继承 AbstractBaseUser

* 作用：给模型增加或减少字段，修改用户验证方法：`authenticate`
* 坏处：破坏了原来的User模型的表结构
* 注意：继承自 `AbstractBaseUser` 同时还要继承 `PermissionsMixin`

如果想修改默认的验证方式，并且对于原来 User 模型上的一些字段不想要，那么可以自定义一个模型，然后继承自 AbstractBaseUser，再添加你想要的字段。这种方式会比较麻烦，最好是确定自己对 Django 比较了解才推荐使用。步骤如下：

### 创建模型

示例代码如下：

```python
# models.py
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    telephone = models.CharField(max_length=11,unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'telephone'
    REQUIRED_FIELDS = []

    # 这里的 UserManager 同方法 3，需要重写
    objects = UserManager()

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username
```

其中 `password` 和 `last_login` 是在 AbstractBaseUser 中已经添加好了的，我们直接继承就可以了。然后我们再添加我们想要的字段。比如 `email`、`username`、`telephone` 等。这样就可以实现自己想要的字段了。但是因为我们重写了 User，所以应该尽可能的模拟 User 模型：

* `USERNAME_FIELD`：用来描述 User 模型名字字段的字符串，作为唯一的标识。如果没有修改，那么会使用 `USERNAME` 来作为唯一字段。
* `REQUIRED_FIELDS`：一个字段名列表，用于当通过 `createsuperuser` 管理命令创建一个用户时的提示。
* `is_active`：一个布尔值，用于标识用户当前是否可用。
* `get_full_name()`：获取完整的名字。
* `get_short_name()`：一个比较简短的用户名。

### 重新定义 UserManager

我们还需要定义自己的 UserManager，示例代码如下：

```python
# models.py
from django.contrib.auth.models import BaseUserManager


# 重写 UserManager
class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, telephone, password, **extra_fields):
        if not telephone:
            raise ValueError("请填入手机号码！")
        if not password:
            raise ValueError("请填入密码!")
        user = self.model(telephone=telephone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, telephone, password, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(telephone, password, **extra_fields)

    def create_superuser(self, telephone, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
 
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
 
        return self._create_user(telephone, password, **extra_fields)
```

### 配置 settings 文件

在创建了新的 User 模型后，还需要在 settings.py 中配置好：

```python
# settings.py
AUTH_USER_MODEL = 'appname.User'
```

### 在 admin 中注册模型

同 AbstractUser。

### 使用自定义的模型

同 AbstractUser。

最后，这种方式同样因为破坏了原来 User 模型的表结构，所以必须要在第一次 migrate 前就先定义好。

## 总结

Django 官方建议[启动一个新项目时使用 AbstractUser 来自定义用户模型](https://docs.djangoproject.com/zh-hans/4.1/topics/auth/customizing/#using-a-custom-user-model-when-starting-a-project)，即使是现有的 User 模型完全满足现有的需求，因为这个模型的行为与默认用户模型相通，但是我们能在未来需要的时候更方便地拓展它。

在自定义用户模型时，有两个常用的父类：AbstractUser 和 AbstractBaseUser。一般来说这两个模型都可以使用，但是 AbstractBaseUser 需要做更多的工作来构建它，除非对 Django 比较熟悉，否则还是更推荐 AbstractUser。

（完）
