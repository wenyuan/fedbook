# 反射

## 定义

反射的概念是由 Smith 在 1982 年首次提出的，主要是指程序可以访问、检测和修改它本身状态或行为的一种能力。

## Python 中的反射

* 通过字符串的形式操作对象的属性
* Python 中一切皆为对象，所以只要是对象都可以使用反射
* 比如：实例对象、类对象、本模块、其他模块，因为他们都能通过 `对象.属性` 的方式获取、调用

## 反射中关键的四个函数

### hasattr

内置源码：

```python
def hasattr(*args, **kwargs): 
    """
    Return whether the object has an attribute with the given name.
    This is done by calling getattr(obj, name) and catching AttributeError.

    """
    pass
```

功能描述：

* 返回：`True`/`False`，表示对象是否具有给定名称的属性
* 这是通过调用 `getattr(obj，name)` 并捕获 `AttributeError` 来完成的

### getattr

内置源码：

```python
def getattr(object, name, default=None): 
    """
    getattr(object, name[, default]) -> value
    Get a named attribute from an object; getattr(x, 'y') is equivalent to x.y.
    When a default argument is given, it is returned when the attribute doesn't
    exist; without it, an exception is raised in that case.

    """
    pass
```

功能描述：

* 获取对象指定名称的属性
* `getattr(x, y)` 等价写法 `x.y`
* 当属性不存在，则返回 default 值，如果没有指定 default 就会抛出异常

### setattr

内置源码：

```python
def setattr(x, y, v):
    """
    Sets the named attribute on the given object to the specified value.
    setattr(x, 'y', v) is equivalent to ``x.y = v''
    """
    pass
```

功能描述：

* 给指定对象的指定属性设置为值
* `setattr(x, y, v)` 等价写法 `x.y = v`

### delattr

内置源码：

```python
def delattr(x, y): 
    """
    Deletes the named attribute from the given object.
    delattr(x, 'y') is equivalent to ``del x.y''
    """
    pass
```

功能描述：

* 从指定对象中删除指定属性
* `delattr(x, y)` 等价写法 `del x.y` 

## 反射类的成员

利用反射，可以检测实例对象、类对象中有没有某个属性、方法。

```python
class Student(object):
    desc = '学生类'

    def __init__(self, name):
        self.name = name

    def show(self):
        print("姓名：", self.name)
```

### hasattr 例子

```pythonm
s = Student('张三')

print(hasattr(s, 'name'))        # 实例对象-实例属性
print(hasattr(s, 'desc'))        # 实例对象-类属性
print(hasattr(Student, 'desc'))  # 类对象-类属性
print(hasattr(Student, 'name'))  # 类对象-实例属性


# 输出结果
True
True
True
False
```

### getattr 例子

```pythonm
s = Student('张三')

print(getattr(s, 'name'))                 # 实例对象-实例属性
print(getattr(s, 'desc'))                 # 实例对象-类属性
print(getattr(Student, 'desc'))           # 类对象-类属性
print(getattr(Student, 'name', '默认值'))  # 类对象-实例属性


# 输出结果
张三
学生类
学生类
默认值
```

### setattr 例子

```python
s = Student('张三')

# 设置一个新的实例属性
setattr(s, 'age', 13)

# 设置一个新的实例方法
setattr(s, 'show_detail', lambda self: f"姓名：{self.name} 年龄：{self.age}")

print(s.__dict__)
print(s.show_detail(s))


# 输出结果
{'name': '张三', 'age': 13, 'show_detail': <function <lambda> at 0x7f3b0b1661f0>}
姓名：张三 年龄：13
```

### delattr 例子

```python
s = Student('张三')
# 设置一个新的实例属性
setattr(s, 'age', 13)
# 设置一个新的实例方法
setattr(s, 'show_detail', lambda self: f"姓名：{self.name} 年龄：{self.age}")

print(s.__dict__)
delattr(s, 'age')
delattr(s, 'show_detail')
print(s.__dict__)


# 输出结果
{'name': '张三', 'age': 13, 'show_detail': <function <lambda> at 0x7f7e799921f0>}
{'name': '张三'}
```

## 反射本模块的成员

利用反射，还可以检测某个模块下有没有方法、类、变量。

```python
import sys

DESC = '一个模块文件'


def test():
    print('test')


class A():
    pass


this_module = sys.modules[__name__]
print(__name__)
print(this_module)

print(hasattr(this_module, 'DESC'))  # 变量
print(hasattr(this_module, 'test'))  # 方法
print(hasattr(this_module, 'A'))     # 类


# 输出结果
__main__
<module '__main__' from 'test.py'>
True
True
True
```

## 反射其他模块的成员

假设有一个模块名为 `models.py`：

```python
def test():
    print('测试一下')
```

这时在另一个模块中反射它的成员：

```python
import models

# 判断是否有 test 这个方法
print(hasattr(models, 'test'))

# 获取属性
f = getattr(models, 'test')
f()

# 设置属性
setattr(models, 'desc', '这是一个模块文件')
print(models.desc)


# 输出
True
测试一下
这是一个模块文件
```

## 反射的应用

当封装了多个方法，然后需要根据不同条件去调用不同方法的时候，就可以考虑使用反射了，可以极大地减少代码量。

### 应用一

#### 需求：

* 打开浏览器，访问一个网站
* 单击登录就跳转到登录界面
* 单击注册就跳转到注册界面
* 单击的其实是一个个的链接，每一个链接都会有一个函数或者方法来处理

#### 未使用反射前：

```python
class Web:
    def login(self):
        print('欢迎来到登录页面')

    def register(self):
        print('欢迎来到注册页面')

    def save(self):
        print('欢迎来到存储页面')


while True:
    obj = Web()
    choose = input(">>>").strip()
    if choose == 'login':
        obj.login()
    elif choose == 'register':
        obj.register()
    elif choose == 'save':
        obj.save()
```

#### 使用反射后：

```python
class Web:
    def login(self):
        print('欢迎来到登录页面')

    def register(self):
        print('欢迎来到注册页面')

    def save(self):
        print('欢迎来到存储页面')


while True:
    obj = Web()
    choose = input(">>>").strip()
    # 判断对象是否有对应的方法
    if hasattr(obj, choose):
        # 获取对应的方法
        f = getattr(obj, choose)
        # 执行方法
        f()
```

### 应用二

#### 需求：

在做接口自动化测试的时候，我们一般都会封装 BaseRequest 类来进行复用，类里面会封装不同请求方法。

#### Base 类代码：

```python
class BaseRequest:
    req = requests.Session()

    def get(self, url):
        resp = self.req.get(url)
        print("==get==")
        return resp

    def post(self, url):
        resp = self.req.post(url)
        print("==post==")
        return resp

    def put(self, url):
        resp = self.req.put(url)
        print("==put==")
        return resp

    # 不使用反射的方法
    def main(self, method, url):
        if method == "get":
            self.get(url)
        elif method == "post":
            self.post(url)
        elif method == "put":
            self.put(url)
    
    # 使用反射的方法
    def main_attr(self, method, url):
        if hasattr(self, method):
            func = getattr(self, method)
            func(url)
```

#### 执行代码：

```python
request = BaseRequest()
# 不使用反射
request.main("get", "https://www.baidu.com")
request.main("post", "https://www.baidu.com")
request.main("put", "https://www.baidu.com")

# 使用反射
request.main_attr("get", "https://www.baidu.com")
request.main_attr("post", "https://www.baidu.com")
request.main_attr("put", "https://www.baidu.com")


# 输出结果
==get==
==post==
==put==

==get==
==post==
==put==
```

（完）
