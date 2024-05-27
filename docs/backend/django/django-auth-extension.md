# Django 内置权限系统扩展

## 背景介绍

Django 内置权限系统是基于 model 层做控制的，新的 model 创建后会默认新建三个权限，分别为：add、change、delete，如果给用户或组赋予 delete 的权限，那么用户将可以删除这个 model 下的所有数据。

这个时候来了一个新的需求，用户 A 只能操作表中特定的数据，用户 B 也只能操作表中特定的数据，Django 内置的基于 model 的权限机制就无法满足需求了。

## 实现过程

先来确定下需求：

* 保持原本的基于功能的权限控制不变，例如用户 A 有查询权限，用户 B 有修改权限
* 增加针对表中数据的权限控制，例如用户 A 只能查询特定的数据，用户 B 只能修改特定的数据

对于第一个需求用内置的权限系统已经可以实现，这里不赘述，重点看下第二个需求。数据都存放在同一个表里，不同用户的权限不同，也就是需要把每一条数据与有权限操作的用户进行关联。为了方便操作，我们考虑把数据跟用户组关联，在用户组里的用户都有权限，而操作类型经过分析主要有两类：读和写，那么需要给表中每条数据添加两个字段分别记录对它有用读、写权限的用户组。

如下代码以 Article（文章）类为例，在 model 基础字段上添加 `read_groups` 和 `write_groups` 字段。这里假定每条数据跟用户组应是 ManyToManyField 多对多关系，一条数据可以关联多个用户组，一个用户组也可以属于多个数据。

```python
class Article(models.Model):
    title = models.CharField(verbose_name='标题', max_length=70)
    category = models.ForeignKey(Category, on_delete=models.DO_NOTHING, verbose_name='分类', blank=True, null=True)
    tags = models.ManyToManyField(Tag, verbose_name='标签', blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='作者')
    created_time = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
    updated_time = models.DateTimeField(verbose_name='更新时间', auto_now=True)

    read_groups = models.ManyToManyField(Group, related_name='read', verbose_name='读权限')
    write_groups = models.ManyToManyField(Group, related_name='write', verbose_name='写权限')
```

model 确定了，接下来我们分三部分详细介绍下权限验证的具体实现。

## 查询接口权限控制

需求：每个用户进入系统后只能查看自己有读权限的文章列表，管理员能查看所有，代码如下：

```python
def article_list(request):
    if request.method == 'GET':
        if request.user.is_superuser:
            _lists = Article.objects.all().order_by('id')
        else:
            # 获取登录用户的所有组
            _user_groups = request.user.groups.all()

            # 构造一个空的 QuerySet 然后合并
            _lists = Article.objects.none()
            for group in _user_groups:
                _lists = _lists | group.read.all()

        return render(request, 'blog/article_list.html', {'request': request, 'lPage': _lists})
```

实现的思路是：获取登录用户的所有组，然后循环查询每个组有读取权限的文章，最后把每个组有权限读的文章进行合并返回。

获取登录用户的所有组用到了 ManyToMany 的查询方法：`request.user.groups.all()`。

最终返回的一个结果是 QuerySet，所以我们需要先构造一个空的 Queryset：`Mysql.objects.none()`。

QuerySet 合并不能用简单的相加，应该通过自带的方法：`QuerySet_1 | QuerySet_2`。这种方式合并的结构还是一个 QuerySet，合并后还可以用 `order_by` 等函数，但只能合并同种 model 对象的数据。

根据 group 去反查都有哪些数据包含了该组，这里用到了 M2M 的 `related_name` 属性：`group.read.all()`。

## 编辑接口权限控制

除了查询之外，我们还对编辑进行的权限控制。例如执行修改文章的操作前判断用户是否对此文章有修改权限。

有很多地方都需要做这个判断，所以把这个权限判断单独写个方法来处理，代码如下：

```python
def check_permission(perm, article, user):
    # 如果用户是超级管理员则有权限
    if user.is_superuser:
        return True

    # 取出用户所属的所有组
    _user_groups = user.groups.all()

    # 取出当前 Article 实例对应权限的所有组
    if perm == 'read':
        _article_groups = article.read_groups.all()
    if perm == 'write':
        _article_groups = article.write_groups.all()

    # 用户组和 Article 权限组取交集，有则表示有权限，否则没有权限
    group_list = list(set(_user_groups).intersection(set(_article_groups)))

    return False if len(group_list) == 0 else True
```

实现思路是：根据传入的第三个用户参数，来获取到用户所有的组，然后根据传入的第一个参数类型读取或写入和第二个参数 Article 实例来获取到有权限的所有组，然后对两个组取交集，交集不为空则表示有权限，为空则没有。

M2M 的 `.all()` 取出来的结果是个 list，两个 list 取交集的方法为：`list(set(list_A).intersection(set(list_B)))`

view 中使用就很简单了，如下：

```python
from django.shortcuts import get_object_or_404 

def query(request):
    if request.method == 'POST':
        postdata = request.body.decode('utf-8')
        _article = get_object_or_404(Article, id=int(postdata.get('article')))

        # 检查用户是否有当前 article 的查询权限
        if check_permission('read', _article, request.user) == False:
            return JsonResponse({'state': 0, 'message': '当前用户没有查询此文章的权限'})
```

## 总结

Django 有第三方的基于 object 的权限管理模块 [django-guardian](https://github.com/django-guardian/django-guardian)，这里没有使用主要是因为权限需求并不复杂，自己实现也很方便，相反如果每次引入一个庞大的包而仅仅是为了用到其中一小块功能，那么太多的第三方包会让项目变得越来越笨重。

（完）
