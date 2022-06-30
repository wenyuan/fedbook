# @property 装饰器

> 这篇里面我会更多的把「实例变量」称为「实例属性」，前面说过变量和属性其实只是叫法不同，但这篇里面的某些语境里，叫属性会更加通顺一点。

## 前言

前面在讲实例变量的时候，我们可以通过 `实例对象.实例属性` 来访问对应的实例属性，但这种做法是不建议的，因为它破坏了类的封装原则。

正常情况下，实例属性应该是隐藏的，只允许通过类提供的方法来间接实现对实例属性的访问和操作。

## getter、setter 方法

这两个方法用于在不破坏类封装原则的基础上，操作实例属性。用 Java 写类的时候，IDE 会帮我们自动生成对属性的操作方法，一个是 get，另一个是 set（一般称为 getter、setter 方法）。

Python 中虽然不能自动生成，但也可以自己写。

```python
class Student(object):
    # 构造方法
    def __init__(self, name):
        self.name = name

    # set 属性的方法（setter）
    def set_name(self, name):
        self.name = name

    # get 属性的方法（getter）
    def get_name(self):
        return self.name


s = Student("张三")
# 获取 s 实例对象的 name 实例变量
print(s.get_name())

# 设置 name 实例属性
s.set_name("李四")
print(s.get_name())
```

## property() 方法

上面为了实现 getter、setter 方法，写了很长一段代码，显得有点麻烦。于是 `property()` 方法诞生了，它可以实现在不破坏类封装原则的前提下，让开发者依旧使用 `实例对象.实例属性` 的方式操作类中的属性。

### 语法格式

```python
属性名 = property(fget=None, fset=None, fdel=None, doc=None)
```

* fget：用于获取属性的方法
* fset：用于设置属性的方法
* fdel：用于删除属性的方法
* doc：属性的说明文档字符串

### 代码示例

```python
# property() 函数
class Student(object):
    # 构造方法
    def __init__(self, name):
        self.__name = name

    # setter
    def set_name(self, name):
        self.__name = name

    # getter
    def get_name(self):
        return self.__name

    # del
    def del_name(self):
        self.__name = "xxx"

    # property()
    name = property(get_name, set_name, del_name, "学生类")


# 调用说明文档
# help(Student.name)
print(Student.name.__doc__)

s = Student("张三")

# 自动调用 get_name()
print(s.name)

# 自动调用 set_name()
s.name = "李四"
print(s.name)

# 自动调用 del_name()
del s.name
print(s.name)


# 输出结果
学生类
张三
李四
xxx
```

注意：`get_name` return 的是私有属性 `__name`，注意不是 `name`，不然会陷入死循环。

### 都是默认参数

property() 方法的四个参数都是默认参数，可以不传参。

比如下面这么写：

```python
# 没有 fdel、doc
age = property(get_age, set_age)


# 如果尝试删除
del p.age
# 输出报错信息
AttributeError: can't delete attribute 
```

上述代码中，因为 property() 没有传 `fdel` 方法，所以无法删除属性，它是一个可读写，不可删的属性。

其他传参解析：

```python
# name 属性可读，不可写，也不能删除
name = property(get_name)

# name 属性可读、可写、也可删除，就是没有说明文档
name = property(get_name, set_name,del_name)
```

## @property

* 这是一个装饰器，相当于 getter 装饰器。
* 可以使用 `@property` 来创建只读属性，将一个实例方法变成一个相同名称的**只读实例属性**，这样可以防止属性被修改。

### 代码示例

```python
class Student(object):
    def __init__(self, name):
        self.__name = name

    @property
    def name(self):
        return self.__name


s = Student("张三")
print(s.name)


# 输出结果
张三

# 如果尝试修改
s.name = "李四"
# 输出报错信息
AttributeError: can't set attribute
```

上述代码中，`name` 是一个只读属性，不可写，相当于 `__name` 私有属性只有 getter 方法，没有 setter 方法。

等价写法：

```python
class Student(object):
    def __init__(self, name):
        self.__name = name

    def get_name(self):
        return self.__name

    name = property(get_name)


s = Student("张三")
print(s.name)
```

## setter 装饰器

使用了 `@property` 装饰器后，只读不可写。那想给 `__name` 设置值怎么办呢？可是使用 setter 装饰器。

### 语法格式

```python
@方法名.setter
def 方法名(self, value):
    self.__value = value
     ...
```

### 代码示例

```python
class Student(object):
    def __init__(self, name):
        self.__name = name

    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, name):
        self.__name = name


s = Student("张三")
# 打印属性值
print(s.name)
# 修改属性
s.name = "李四"
print(s.name)


# 输出结果
张三
李四
```

## deleter 装饰器

和 setter 装饰器差不多写法。

### 语法格式

```python
@方法名.deleter
def 方法名(self):
     ...
```

### 代码示例

```python
class Student(object):
    def __init__(self, name):
        self.__name = name

    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, name):
        self.__name = name

    @name.deleter
    def name(self):
        print("删除 __name")


s = Student("张三")
# 打印属性值
print(s.name)
# 修改属性
s.name = "李四"
# 删除属性
del s.name


# 输出结果
张三
删除 __name
```

## @property 踩坑

加了 `@property` 的方法相当于一个实例属性，所以不能和其他实例属性重名。

否则会报一个递归错误：`RecursionError: maximum recursion depth exceeded`（超过最大递归深度）。其实就是因为命名冲突导致了死循环

（完）
