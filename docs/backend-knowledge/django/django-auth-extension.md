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

## 列表页权限控制

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

## 查询接口权限控制



