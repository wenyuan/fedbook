# Django 与权限模块的集成

## 背景

Django 自带的权限机制中，权限分配的最小粒度是表，也就是说一旦我们给了用户某个表的修改权限，那么用户就可以修改表中所有数据，这在某些情况下是无法满足需求的，例如对于一个 Article 文章表来说，我们规定用户只能修改自己的文章，而不能修改别人的文章，Django 的默认权限机制就无法做到。

当然了，简单的需求可以通过[扩展 Django 内置权限系统](/backend-knowledge/django/django-auth-extension)来实现，原理就是在 Article 表新加字段来标识谁有修改的权限。但试想如果我们有很多表都需要类似的权限控制呢？就需要不断地去添加字段来标识权限，这种方案的弊端显而易见。那么有没有一种更为优雅的方案来解决呢？

基于对象的权限控制就是很好的方法，它的权限控制粒度为表中的对象，可以给每一个对象赋予权限，[django-guardian](https://github.com/django-guardian/django-guardian) 便是基于 Django 的原生逻辑扩展出来的对象权限控制方案，他扩展了 Django 的默认权限方案，从而使 Django 的权限控制机制更加完善。

## 安装配置

`django-guardian` 当前的最新版本是 v2.4.0，支持 Django2.2 以上版本以及最新的版本，依赖 Python 版本 3.5+。

可以直接通过 pip 来安装 django-guardian：

```python
pip install django-guardian
```

安装完成后，需要将 guardian 以独立 app 的方式安装进 Django。即修改 Django 配置文件 settings.py，在 `INSTALLED_APPS` 配置中添加 `guardian`：

```python
INSTALLED_APPS = [
    'guardian',
]
```

然后将 guardian 作为额外的授权 BACKEND 添加进配置文件 settings.py：

```python
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
)
```

Django 默认通过 `django.contrib.auth.backends.ModelBackend` 进行用户验证授权，我们这里添加了 `guardian.backends.ObjectPermissionBackend` 作为默认验证授权的扩展。

最后创建 guardian 的数据库表：

```python
python manage.py migrate
```

创建完成后，会发现数据库里多了两张表 `guardian_groupobjectpermission` 和 `guardian_userobjectpermission`，两个表分别记录了用户/组与 model 以及 model 内的具体 object 的权限对应关系，以 `guardian_groupobjectpermission` 表为例，说下各字段的含义：

* `id`：默认主键
* `object_pk`：object 的 id，标识具体是哪个对象需要授权，对应的是具体的某一条数据
* `content_type_id`：记录具体哪个表的 id，对应的是 Django 系统表 `django_content_type` 内的某条数据，Django 所有注册的 model 都会在这个表里记录
* `group_id`：group 的 id，记录是那个组的用户会有权限，对应的是 `auth_group` 表里的某条记录
* `permission_id`：permission 的 id，记录具体的某个权限，对应的是 `auth_permission` 表里的某条记录

从这几个字段就可以清晰的表示出某个组里的用户是否对某个表里的某条数据具有具体的某权限，`guardian_userobjectpermission` 表类似，只是将 group 换成了 user 而已。

## 权限分配

启用 guardian 对象权限之后，可以通过 `guardian.shortcuts.assign_perm()` 方法来为用户/组分配权限。

假如现在有 CommonTask 表如下：

```python
class Article(models.Model):
    title = models.CharField(verbose_name='标题', max_length=70)
    category = models.ForeignKey(Category, on_delete=models.DO_NOTHING, verbose_name='分类', blank=True, null=True)
    tags = models.ManyToManyField(Tag, verbose_name='标签', blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='作者')
    created_time = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
    updated_time = models.DateTimeField(verbose_name='更新时间', auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        default_permissions = ()

        permissions = (
            ("article_read", "文章查看权限"),
            ("article_change", "文章修改权限"),
            ("article_delete", "文章删除权限"),
        )
```

如果想把 id 为 `1` 的文章赋权给 username 为 `zhangsan` 的用户，可以这样处理：

```bash
# 获取文章对象
>>> from blog.models import Article
>>> article = Article.objects.get(id=1)

# 获取用户对象
>>> from django.contrib.auth.models import User
>>> user = User.objects.get(username='zhangsan')

# 确认用户 zhangsan 对当前的文章无删除权限
>>> user.has_perm('blog.article_delete', article)
False

# 给用户赋权
>>> from guardian.shortcuts import assign_perm
>>> assign_perm('article_delete', user, article)
<UserObjectPermission: first-article | zhangsan | article_delete>
```

通过 `assign_perm` 可以给用户赋权，`assign_perm` 接收三个参数，分别为 `perm`、`user_or_group` 以及 `object`：

* `perm`：权限，可以是字符串或者 instance 实例，当填写字符串时格式为 `app_label.codename`，虽然在 object 不为 Node 的情况下可以只写 `codename` 但不推荐
* `user_or_group`：用户或组的实例，也可以是用户或组的 QuerySet 集合
* `object`：对象实例，可以为 None，当为 None 时表示给整个 model 赋予权限，也可以是对象的 QuerySet 集合

通过 `has_perm` 可以检查用户是否具有权限，`has_perm` 接收两个参数，第一个参数为权限，第二个参数为具体的对象，其中第二个参数为可选参数，如果没有则跟 Django 默认权限机制一样会去检查用户对 model 是否具有权限，如果有则检查用户对 model 下的 object 是否有权限。

赋权过后就可以再次查看用户是否有此对象的对应权限了：

```bash
>>> user.has_perm('blog.article_delete', task)
True
```

对于 group 组授权，操作类似：

```bash
# 获取用户对象
>>> user = User.objects.get(username='lisi')

# 获取组对象
>>> from django.contrib.auth.models import Group
>>> group = Group.objects.get(name='内容审核组')

# 给用户加入组
>>> user.groups.add(group)

# 先确认下用户 lisi 对 id 为 1 的文章无删除权限
>>> user.has_perm('blog.article_delete', article)
False

# 给组赋权
>>> assign_perm('article_delete', group, article)
<GroupObjectPermission: first-article | 内容审核组 | article_delete>
```

`assign_perm` 同样可以给组赋权，只需要把第二个参数替换为组对象即可。赋权过后查看组内用户就有权限了：

```bash
>>> user.has_perm('blog.article_delete', article)
True
```

由于只赋予了用户组对某个具体对象的权限，并没有赋予用户组对整个 model 的权限，所以 `has_perm` 检查用户对整个 model 的权限时会返回 False：

```bash
>>> user.has_perm('blog.article_delete')
False
```

## 去除权限

当我们需要去除权限时，可以使用 `remove_perm` 方法，`remove_perm` 方法与 `assign_perm` 方法类似，同样接收三个参数，参数类型也类似，唯一不同的是 `assign_perm` 的第二个参数可以是 QuerySet，而 `remove_perm` 的第二个参数必须是 instance。

就像这样 `assign_perm` 可以同时给多个用户赋权：

```bash
>>> article =  Article.objects.get(id=1)
>>> assign_perm('blog.article_delete', User.objects.filter(id__in=[3,4]), article)
[<UserObjectPermission: first-article | zhangsan | article_delete>, <UserObjectPermission: first-article | lisi | article_delete>]
```

却不能同时去除多个用户的权限，而应该一次一次地删去。

相反，可以把用户在某个 model 下，对所有数据的权限给去掉。比如以下例子会清除用户 `lisi` 对 Article 表下所有对象 `blog.article_delete` 的权限：

```bash
>>> from guardian.shortcuts import remove_perm
>>>
>>> remove_perm('blog.article_delete', User.objects.get(username='lisi'), Article.objects.all())
(3, {'guardian.UserObjectPermission': 3})
```

当然第三个参数 object 是可以不用写的，意思也是清除整个 model 的权限，与以下用法效果一样：

```bash
>>> remove_perm('blog.article_delete', User.objects.get(username='lisi'))
```

## 根据用户和对象获取权限

`get_perms` 方法可以根据用户或组以及对象来获取权限，接收两个参数 `user_or_group` 实例以及对象实例：

```bash
>>> from guardian.shortcuts import get_perms

>>> get_perms(User.objects.get(username='zhangsan'), article)
['article_delete']
```

## 根据对象和权限获取用户

当我们需要获取某个对象哪些用户有权限时，可以通过 `get_users_with_perms` 方法来处理，例子如下：

先来准备数据：

```bash
>>> article =  Article.objects.get(id=1)
>>>
>>> u1 = User.objects.get(username='zhangsan')
>>> u2 = User.objects.get(username='lisi')
>>>
>>> group = Group.objects.get(id=1)
>>>
# 赋予用户 u1 对 article 对象有 article_delete 的权限
>>> assign_perm('article_delete', u1, araticle)
<UserObjectPermission: first-article | zhangsan | article_delete>

# 赋予用户 u2 对 article 对象有 article_change 的权限
>>> assign_perm('article_change', u2, araticle)
<UserObjectPermission: first-article | lisi | article_change>
>>>

# 把用户 wangwu 加入到组 group
>>> User.objects.get(username='wangwu').groups.add(group)

# 赋予组 group 对 article 对象有 article_read 的权限
>>> assign_perm('article_read', group, article)
<GroupObjectPermission: first-article | 游客组 | article_read>
>>>
```

通过 `get_users_with_perms` 方法获取对象的所有权限：

```bash
>>> from guardian.shortcuts import get_users_with_perms
>>>
>>> get_users_with_perms(article)
<QuerySet [<User: zhangsan>, <User: lisi>, <User: wangwu>]>
```

这里发现 superuser 用户并没有在最终的用户列表里，如果我们想让 superuser 用户也包含在内，可以设置参数 `with_superusers=True`：

```bash
>>> get_users_with_perms(article, with_superusers=True)
<QuerySet [<User: admin>, <User: zhangsan>, <User: lisi>, <User: wangwu>]>
```

以上输出结果展示了所有具有权限的用户，如果我们想要查看用户的具体权限，可以设置参数 `attach_perms=True`，返回的结构是以用户为 key 权限为 value 的一个字典，看起来清晰明了：

```bash
>>> get_users_with_perms(article, with_superusers=True, attach_perms=True)
{<User: admin>: ['article_read', 'article_change', 'article_delete'], <User: zhangsan>: ['article_delete'],
 <User: lisi>: ['article_change'], <User: wangwu>: ['article_read']}
```

如果我们仅想查看具有某个权限的用户，可以设置 `only_with_perms_in` 参数，例如我们只想查看对象所有具有 `article_change` 权限的用户：

```bash
>>> get_users_with_perms(article, with_superusers=True, only_with_perms_in=['article_change'])
<QuerySet [<User: admin>, <User: lisi>]>
```

默认情况下用户所属组如果具有权限的话也会返回，例如上面我们把用户 wangwu 加入到了 group，然后给 group 赋予了权限，那么用户也就具有了相应的权限，如果我们只想查看直接拥有权限，而并非通过 group 间接取得权限的用户列表，可以设置参数 `with_group_users=False`，此参数默认为 `True`：

```bash
>>> get_users_with_perms(article, with_superusers=True, with_group_users=False)
<QuerySet [<User: admin>, <User: zhangsan>, <User: lisi>]>
```

与 `get_users_with_perms` 方法相类似的是 `get_groups_with_perms` 方法，但 `get_groups_with_perms` 要简单许多，只能接收两个参数 `object` 和 `attach_perms`。

## 根据用户和权限获取对象

当我们给对象赋予权限后，很多时候我们都需要根据用户和权限来获取对象列表，此时可以通过 `get_objects_for_user` 方法来实现：

```bash
>>> from guardian.shortcuts import get_objects_for_user
>>> user = User.objects.get(username='zhangsan')
>>> 
>>> get_objects_for_user(user, 'blog.article_delete')
<QuerySet [<Article: first-article>, <Article: second-article>, <Article: third-article>]>
```

`get_objects_for_user` 接收两个参数，第一个参数为用户对象，第二个参数为权限，同时第二个参数也可以写成列表的方式，表示**同时满足**列表中的权限：

```bash
>>> get_objects_for_user(user, ['blog.article_read', 'blog.article_change'])
<QuerySet [<Article: second-article>]>
```

如果想要仅满足列表中的**任意一个**权限，可以添加第三个参数 `any_perm=True`：

```bash
>>> get_objects_for_user(user, ['blog.article_read', 'blog.article_change'], any_perm=True)
<QuerySet [<Article: first-article>, <Article: second-article>, <Article: third-article>]>
```

与 `get_objects_for_user` 类似的方法还有 `get_objects_for_group`，可以根据 group 和权限来获取对象列表，使用方法参考 `get_objects_for_user` 即可。

## 装饰器的使用

Django 默认权限机制就提供了一个 `permission_required` 的装饰器，以方便在 view 中对用户权限的检查，在 guardian 中对 `permission_required` 装饰器做了扩展，不仅能够检查全局权限，还能对对象权限做校验。

使用方式兼容 Django 默认的 `permission_required` 装饰器：

```python
from guardian.decorators import permission_required

@permission_required('blog.article_read')
def article_view(request):
    return HttpResponse('Hello')
```

当仅有一个权限参数时，则与 Django 默认的 `permission_required` 装饰器无疑，表示用户是否具有整个 model 的 `article_read` 权限。

但在 guardian 的 `permission_required` 装饰器还支持第二个参数，参数类型为一个元组，类似这样 `(Article, 'id', 'pk')`，用来指定具体的对象，其中 `Article` 为 model，`id` 为 model 的字段，`pk` 为 view 中用户传入的具体参数，`id` 与 `pk` 为对应关系，大概的查询逻辑就是 `Article.objects.get(id=pk)`，判断用户对此对象是否有 Article 的权限，示例代码如下：

```python
@permission_required('blog.article_delete', (Article, 'id', 'pk'))
def on_article_delete(request, pk):
    if request.method == 'POST':
        try:
            _data = Article.objects.get(id=int(pk))
            _data.delete()

            return JsonResponse({'state': 1, 'message': '删除成功!'})
        except Exception as e:
            return JsonResponse({'state': 0, 'message': 'Error: ' + str(e)})
    else:
        return JsonResponse({"state": 0, "message": "Request method '%s' not supported" % request.method.upper()})
```

`permission_required` 还接收以下几个参数：`login_url`、`redirect_field_name`、`return_403`、`return_404`、`accept_global_perms`，其中 `accept_global_perms` 参数表示是否检查用户的全局权限，如果指定了特定对象，且设置了 `accept_global_perms=False` 则只检查对象权限，不检查全局权限，`accept_global_perms` 默认为 False。

## 模板中使用

guardian 提供了模板标签，以方便在模板中对用户进行对象权限的校验，使用起来也比较简单。

先加载标签：

```python
{% load guardian_tags %}
```

然后就可以使用 `get_obj_perms` 来获取用户或组关于对象的权限列表了：

```python
{% get_obj_perms user/group for obj as "context_var" %}
```

一个简单的例子如下，如果当前登陆的用户对 article 对象有 `article_delete` 权限，则能看到删除按钮：

```html
{% get_obj_perms request.user for article as "article_perms" %}

{% if "article_delete" in article_perms %}
    <button>删除</button>
{% endif %}
```

至此，guardian 的所有基础用法就差不多了，可以通过 guardian 搞定几乎所有的权限问题了。

（完）
