# 魔术方法（双下划线方法）

Python 给类和对象提供了大量的内置方法，这些内置方法也称魔法方法。它们总是在某种条件下自动触发执行，并且都是以 `__` 双下划线包起来的方法，所以也叫双下划线方法。

常见的魔法方法大致可分为以下几类：

* 构造与初始化
* 类的表示
* 访问控制
* 比较操作
* 容器类操作
* 可调用对象
* 序列化

## 构造与初始化

### `__new__`

该方法是当类被调用实例化对象时首先被触发的方法，用来实例化一个空对象并返回。

```python
class Student(object):
    def __new__(cls，*args, **kwargs):
        # cls 表示这个类，剩余所有的参数传给 __init__() 方法
        # 若不返回，则 __init__() 不会被调用
        return object.__new__(cls, *args, **kwargs) 
    
    def __init__(self, name):
        self.name = name
```

当我们需要继承内置类时，例如想要继承 `int`、`str`、`tuple`，就无法使用 `__init__` 来初始化了，只能通过 `__new__` 来初始化数据。

下面这个例子实现了一个类，这个类继承了 `float`，之后就可以对这个类的实例进行计算了。

```python
class kg2g(float):
    """千克转克"""
    def __new__(cls, kg):
        return float.__new__(cls, kg * 1000)

a = kg2g(50) # 50千克转为克
print(a) 	 # 50000.0
print(a + 100)	# 50100.0 由于继承了float，所以可以直接运算，非常方便！
```

### `__init__`

该方法称为构造方法，用于创建实例对象时使用，每当创建一个类的实例对象时，Python 解释器都会自动调用它。**一般用来初始化对象的某些属性**。

```python
class Student(object):
    def __init__(self, name):
        self.name = name
        
    def show(self):
        print(self.name)
   
s1 = Student('张三')
s2 = Student('李四')
```

值得注意的是，`__init__()` 构造方法并不是必写，假设不写，Python 也会自动添加一个仅包含 `self` 参数的 `__init__()` 构造方法，这又称为类的默认构造方法。

### `__del__`

Python 提供了 `del` 语句用于删除不再使用的变量，语法是 `del 表达式`。

例如删除一个变量：

```python
tmp = "hello"
del tmp
print(tmp)


# 输出结果
    print(tmp)
NameError: name 'tmp' is not defined
```

变量已经被删除了，所以无法访问变量。

Python 提供了一种机制使得对象被删除前能够得到通知：对象被删除时，如果该对象拥有名为 `__del__`  的方法，该方法在删除前被自动调用，该方法又被称为析构方法。

但由于 Python 的垃圾回收机制会自动清理程序中没用的资源，因此如果一个对象只是占用应用程序的资源，没有必要定义 `__del__` 方法，但是如果涉及到占用系统资源的话比如打开的文件对象，由于关系到操作系统的资源，Python 的垃圾回收机制派不上用场的时候，就需要为对象创建 `__del__` 方法，用于对象被删除后自动触发回收操作系统资源。

```python
class Test(object):
    def __init__(self):
        # 占用的是操作系统资源
        self.x = open('a.txt', mode='w')

    def __del__(self):
        # 发起系统调用，告诉操作系统回收相关的系统资源
        self.x.close()

t = T()
del t  # t.__del__() 
```

总而言之，析构方法一般无须定义，日常使用时无需关心内存的分配和释放，因为此工作都是交给 Python 解释器来执行。

## 类的表示

### `__str__` 和 `__repr__`

这两个方法都是用来描述类或对象信息的，比如你直接实例化了一个对象，打印出来的是这个对象的地址。而要是重新在类中定义了这两个方法，那打印对象的结果就是方法返回的信息。

重点：这两个方法必须返回字符串。

```python
class Test(object):
    def __int__(self):
        pass

    def __repr__(self):
        return '我是 __repr__ 魔法方法！'

    def __str__(self):
        """
        这个str的作用就是：类的说明或对象状态的说明
        :return:
        """
        return '我是 __str__ 魔法方法！'

t = Test()
# 不定义 str 方法，直接打印，结果是对象的内存地址
# 定义了 str 方法，显示的就是 str 方法返回的内容
print(t)  # 我是 __str__ 魔法方法！
```

要是同时写了这两个方法，只会调用 `__str__` 方法。都是用来描述类或对象的信息，那为啥要定义两个呢？

* `__repr__` 的目标是准确性，或者说，`__repr__` 的结果是让解释器用的。
* `__str__` 的目标是可读性，或者说，`__str__` 的结果是让人看的。

另外：

* 通过 `str()` 调用对象也会返回 `__str__` 方法返回的值
* 通过 `repr()` 调用对象也会返回 `__repr__` 方法返回的值

### `__bool__`

当调用 `bool(obj)` 时，会调用 `__bool__()` 方法，返回 `True` 或 `False`。(目前没找到什么应用场景)

```python
class Test(object):
    def __init__(self, uid):
        self.uid = uid

    def __bool__(self):
        return self.uid > 10

t1 = Test(4)
t2 = Test(14)
print(bool(t1))  # False
print(bool(t1))  # True
```

## 访问控制

关于访问控制的魔法方法，主要包括以下几种：

`__setattr__`：定义当一个属性被设置时的行为
`__getattr__`：定义当用户试图获取一个不存在的属性时的行为
`__delattr__`：定义当一个属性被删除时的行为
`__getattribute__`：定义当该类的属性被访问时的行为

例子：

```python
class Student(object):

    def __setattr__(self, key, value):
        """属性赋值"""
        if key not in ['name', 'age']:
            return
        if key == 'age' and value < 0:
            raise ValueError()
        super(Student, self).__setattr__(key, value)

    def __getattr__(self, key):
        """访问某个不存在的属性"""
        return 'unknown'

    def __delattr__(self, key):
        """删除某个属性"""
        if key == 'name':
            raise AttributeError()
        super().__delattr__(key)

    def __getattribute__(self, key):
        """所有属性/方法调用都经过这里"""
        if key == 'money':
            return 100
        elif key == 'hello':
            return self.say
        return super().__getattribute__(key)


s1 = Student()
s1.name = '张三'         # 调用 __setattr__
s1.age = 13             # 调用 __setattr__
print(s1.name, s1.age)  # 张三 13

setattr(s1, 'name', '李四')	# 调用__setattr__
setattr(s1, 'age', 14)      # 调用__setattr__
print(s1.name, s1.age)      # 李四 14

print(s1.sex)  # 调用__getattr__

# 上面只要是访问属性的地方，都会调用 __getattribute__ 方法
```

## 比较操作

### `__eq__`

可以判断两个对象是否相等：

```python
class Student(object):
    def __init__(self, uid):
        self.uid = uid

    def __eq__(self, other):
        return self.uid == other.uid

s1 = Student(1)
s2 = Student(1)
s3 = Student(2)
print(s1)
print(s1 == s2)  # True
print(s2 == s3)  # False
```

### `__ne__`

判断两个对象是否不相等，这个和 `__eq__()` 方法基本一样，只不过这个是反面：

```python
class Student(object):
    def __init__(self, uid):
        self.uid = uid

    def __ne__(self, other):
        """对象 != 判断"""
        return self.uid != other.uid

s1 = Student(1)
s2 = Student(1)
s3 = Student(2)

print(s1 != s2)  # False
print(s2 != s3)  # True
```

### `__lt__` 和 `__gt__`

这两个方法比较对象的大小的，`__lt__` 为小于，`__gt__` 为大于：

```python
class Student(object):
    def __init__(self, uid):
        self.uid = uid

    def __lt__(self, other):
        """对象 < 判断 根据self.uid"""
        return self.uid < other

    def __gt__(self, other):
        """对象 > 判断 根据self.uid"""
        return self.uid > other

s1 = Student(1)
s2 = Student(1)
s3 = Student(2)

print(s1 < s2)  # False
print(s2 < s3)  # True

print(s1 > s2)  # False
print(s2 > s3)  # False
```

## 容器类操作（重要）

在介绍容器的魔法方法之前，首先要知道，Python 中的容器类型都有哪些，Python 中常见的容器类型有：

* 字典
* 元组
* 列表
* 字符串

因为它们都是「可迭代」的。可迭代是因为，它们都实现了容器协议，也就是下面要介绍到的魔法方法。

容器类的魔法方法，主要包括：

* `__setitem__(self, key, value)`：定义设置容器中指定元素的行为，相当于 `self[key] = value`。
* `__getitem__(self, key)`：定义获取容器中指定元素的行为，相当于 `self[key]`。
* `__delitem__(self, key)`：定义删除容器中指定元素的行为，相当于 `del self[key]`。
* `__len__(self)`：定义当被 `len()` 调用时的行为（返回容器中元素的个数）。
* `__iter__(self)`：定义当迭代容器中的元素的行为。
* `__contains__(self, item)`：定义当使用成员测试运算符（`in` 或 `not in`）时的行为。
* `__reversed__(self)`：定义当被 `reversed()` 调用时的行为。

下面通过自己定义类实现列表，来说明这些方法的用法：

```python
class MyList(object):
    """自己实现一个list"""

    def __init__(self, values=None):
        # 初始化自定义list
        self.values = values or []
        self._index = 0

    def __setitem__(self, key, value):
        # 添加元素
        self.values[key] = value

    def __getitem__(self, key):
        # 获取元素
        return self.values[key]

    def __delitem__(self, key):
        # 删除元素
        del self.values[key]

    def __len__(self):
        # 自定义list的元素个数
        return len(self.values)

    def __iter__(self):
        # 可迭代
        return self

    def __next__(self):
        # 迭代的具体细节
        # 如果 __iter__ 返回 self 则必须实现此方法
        if self._index >= len(self.values):
            raise StopIteration()
        value = self.values[self._index]
        self._index += 1
        return value

    def __contains__(self, key):
        # 元素是否在自定义 list 中
        return key in self.values

    def __reversed__(self):
        # 反转
        return list(reversed(self.values))


# 初始化自定义 list
my_list = MyList([1, 2, 3, 4, 5])

print(my_list[0])	     # __getitem__
my_list[1] = 20		     # __setitem__

print(1 in my_list)	     # __contains__
print(len(my_list))      # __len__

print([i for i in my_list])  # __iter__
del my_list[0]	             # __del__

reversed_list = reversed(my_list)  # __reversed__
print([i for i in reversed_list])  # __iter__
```

> 说明：
> 
> 这个例子实现了一个 MyList 类，在这个类中，定义了很多容器类的魔法方法。这样一来，这个 MyList 类就可以像操作普通 list 一样，通过切片的方式添加、获取、删除、迭代元素了。

重点关注 `__iter__` 这个方法，它的返回值可以有两种：

* 返回 `iter(obj)`：代表使用 `obj` 对象的迭代协议，一般 `obj` 是内置的容器对象。
* 返回 `self`：代表迭代的逻辑由本类来实现，此时需要重写 `next` 方法，实现自定义的迭代逻辑

在上面这个例子中，`__iter__` 返回的是 `self`，所以需要定义 `__next__` 方法，实现自己的迭代细节。`__next__` 方法使用一个索引变量，用于记录当前迭代的位置，这个方法每次被调用时，都会返回一个元素，当所有元素都迭代完成后，此时 for 会停止迭代，若迭代时下标超出边界，这个方法会返回 `StopIteration` 异常。

## 可调用对象

如果想让一个对象变成一个可调用对象（加括号可以调用），需要在该对象的类中定义 `__call__` 方法，调用可调用对象的返回值就是 `__call__` 方法的返回值。

```python
class Circle(object):

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __call__(self, x, y):
        self.x = x
        self.y = y

a = Circle(10, 20)  # __init__
print(a.x, a.y)     # 10 20

a(100, 200)	     # 此时 a 这个对象可以当做一个方法来执行，这是 __call__ 魔法方法的功劳
print(a.x, a.y)	 # 100 200
```

也就是说，Python 中的实例，也是可以被调用的，通过定义 `__call__` 方法，就可以传入自定义参数实现自己的逻辑。

这个魔法方法通常会用在类实现一个装饰器、元类等场景中，当遇到这个魔法方法时，能理解其中的原理就可以了。

## 序列化

Python 提供了序列化模块 `pickle`，当使用这个模块序列化一个实例化对象时，也可以通过魔法方法来实现自己的逻辑，这些魔法方法包括：

* `__getstate__`
* `__setstate__`

例子：

```python
import pickle

class Student(object):

    def __init__(self, name, age, birthday):
        self.name = name
        self.age = age
        self.birthday = birthday

    def __getstate__(self):
        # 执行 pick.dumps 时 忽略 age 属性
        return {
            'name': self.name,
            'birthday': self.birthday
        }

    def __setstate__(self, state):
        # 执行 pick.loads 时 忽略 age 属性
        self.name = state['name']
        self.birthday = state['birthday']

student = Student('李四', 20, (2017, 2, 23))
pickled_student = pickle.dumps(student) # 自动执行 __getstate__ 方法

s = pickle.loads(pickled_student) # 自动执行 __setstate__ 方法
print(s.name, s.birthday)  # 李四 (2022, 2, 22)
# 由于执行 pick.loads 时 忽略 age 属性，所以下面执行回报错
print(s.age)  # AttributeError: 'Student' object has no attribute 'age'
```

说明：

* `__getstate__`：这个例子首先初始了 Student 对象，其中包括 3 个属性：name、age、birthday。当调用 `pickle.dumps(student)` 时，`__getstate__` 方法就会被调用，在这里忽略了 Student 对象的 age 属性，那么 student 在序列化时，就只会对其他两个属性进行保存。
* `__setstate__`：同样地，当调用 `pickle.loads(pickled_student)` 时，`__setstate__` 会被调用，其中传入的参数就是 `__getstate__` 返回的结果。在 `__setstate__` 方法，我们从入参中取得了被序列化的 dict，然后从 dict 中取出对应的属性，就达到了反序列化的效果。

## 一个类总结魔法方法

社区里有人用一个类总结了 Python 代码中的魔法方法。

```python
#!/usr/bin/python3
# _*_ Coding: UTF-8 _*_
from __future__ import division

import collections
import copy
import math
import operator
import pickle
import sys
import asyncio
from typing import Iterable


class MedusaSorcerer:
    instance = 'medusa'

    def __abs__(self):
        """
        >>> abs(MedusaSorcerer())
        返回数字绝对值的方法
        """
        return '__abs__'

    def __add__(self, other):
        """
        >>> MedusaSorcerer() + 123
        实现加法运算
        """
        return '__add__'

    async def __aenter__(self):
        """
        异步上下文管理器是上下文管理器的一种
        它能够在其 __aenter__ 和 __aexit__ 方法中暂停执行

        在语义上类似于 __enter__
        仅有的区别是它必须返回一个 可等待对象

        官方中文文档:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__aenter__#object.__aenter__
        """
        await asyncio.sleep(123)

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """
        异步上下文管理器是上下文管理器的一种
        它能够在其 __aenter__ 和 __aexit__ 方法中暂停执行

        在语义上类似于 __exit__
        仅有的区别是它必须返回一个 可等待对象

        官方中文文档:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__aenter__#object.__aexit__
        """
        await asyncio.sleep(123)

    def __aiter__(self):
        """
        异步迭代器 可以在其 __anext__ 方法中调用异步代码

        返回一个 异步迭代器 对象

        官方中文文档:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__aiter__#object.__aiter__
        """
        return self

    def __and__(self, other):
        """
        >>> MedusaSorcerer() & 123
        实现按位 and 运算
        """
        return '__and__ True'

    def __anext__(self):
        """
        必须返回一个 可迭代对象 输出迭代器的下一结果值
        当迭代结束时应该引发 StopAsyncIteration 错误

        官方中文文档:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__aiter__#object.__anext__
        """
        pass

    def __await__(self):
        """
        返回一个迭代器
        官方中文文档:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__aiter__#object.__await__
        """
        pass

    def __call__(self, *args, **kwargs):
        """
        >>> MedusaSorcerer()()
        调用对象(callable):
            但凡是可以把一对括号()应用到某个对象身上都可称之为可调用对象
        如果在类中实现了 __call__ 方法, 那么实例对象也将成为一个可调用对象
        """
        self.params = '__call__'

    def __init__(self, **kwargs):
        """
        >>> MedusaSorcerer(element='__element__')
        构造实例对象后初始化实例属性的方法
        """
        self.params = 'params'
        self.element = kwargs.get('element')

    def __bool__(self):
        """
        >>> if MedusaSorcerer(): print('True')
        布尔值比较时调度该方法
        """
        return True

    def __bytes__(self):
        """
        >>> bytes(MedusaSorcerer())
        返回字节数组调度的方法
        """
        return bytes('123', encoding='UTF-8')

    def __ceil__(self):
        """
        >>> math.ceil(MedusaSorcerer())
        返回最小整数的时候调度该方法
        """
        return '__ceil__'

    def __class_getitem__(cls, item):
        """
        按照 key 参数指定的类型返回一个表示泛型类的专门化对象

        官方中文文档, 或许你还需要查阅 PEP484 和 PEP560:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__class_getitem__#object.__class_getitem__

        PEP560案例和说明:
        https://www.python.org/dev/peps/pep-0560/#class-getitem
        """
        pass

    def __cmp__(self, other):
        """
        >>> sorted(MedusaSorcerer(), MedusaSorcerer())
        在实现我们自定义的排序规则的时候我们需要对实例实现__cmp__方法
        例如我给的例子中:
            如果传递的对象params属性 大于 本身实例对象的params属性: 返回 -1
            如果传递的对象params属性 小于 本身实例对象的params属性: 返回 +1
            如果传递的对象params属性 等于 本身实例对象的params属性: 返回 0
        """
        if self.params < other.params:
            return -1
        elif self.params > other.params:
            return 1
        return 0

    def __coerce__(self, other):
        """
        >>> coerce(MedusaSorcerer(), MedusaSorcerer())
        实现了混合模式运算
        Python3中已经废弃
        """
        pass

    def __complex__(self):
        """
        >>> complex(MedusaSorcerer())
        实现复数转换的时候调度该方法
        """
        return complex(123)

    def __contains__(self, item):
        """
        >>> item not in MedusaSorcerer()
        >>> item in MedusaSorcerer()
        判断是否包含元素时
        """
        return True if item == '123' else False

    def __copy__(self):
        """
        >>> copy.copy(MedusaSorcerer())
        返回浅拷贝对象
        """
        return 123

    def __deepcopy__(self, memodict={}):
        """
        >>> copy.deepcopy(MedusaSorcerer())
        返回深拷贝对象
        """
        return self

    def __del__(self):
        """
        >>> medusa = MedusaSorcerer()
        >>> del medusa
        对象进行垃圾回收时候的行为函数
        """
        print('__del__')

    def __delattr__(self, item):
        """
        >>> del self.params
        实现删除实例属性的时候将会调度该方法
        """
        self.__dict__.pop(item)

    def __delete__(self, instance):
        """
        >>> class Test: medusa = MedusaSorcerer()
        >>> del Test().medusa
        官方: 调用此方法以删除 instance 指定的所有者类的实例的属性
        在其实例拥有者对其进行删除操作的时候调用该方法
        """
        print('__delete__')

    def __delitem__(self, key):
        """
        >>> del MedusaSorcerer()['params']
        使用键值对删除的时候将会调度该方法
        """
        self.__dict__.pop(key)

    def __delslice__(self, i, j):
        """
        __getslice__、__setslice__、__delslice__：用于分片的三个操作
        Python3中已经废弃
        """
        pass

    def __dir__(self) -> Iterable[str]:
        """
        >>> dir(MedusaSorcerer())
        返回所有实例属性和方法
        """
        return super().__dir__()

    def __divmod__(self, other):
        """
        >>> divmod(MedusaSorcerer(), 123)
        返回 (整数, 取余) 的元组数组
        """
        return 123, 123

    def __enter__(self):
        """
        >>> with MedusaSorcerer(): pass
        调度 with 语句块的时候需要实现该方法
        """
        self.enter = '__enter__'

    def __eq__(self, other):
        """
        >>> MedusaSorcerer() == 123
        调度判等条件的时候需要实现的方法
        """
        return True

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        >>> with MedusaSorcerer(): pass
        退出 with 语句块的时候将会调度该方法

        退出关联到此对象的运行时上下文
        各个参数描述了导致上下文退出的异常
        如果上下文是无异常地退出的, 三个参数都将为 None
        如果提供了异常并且希望方法屏蔽此异常(即避免其被传播)
        则应当返回真值, 否则的话, 异常将在退出此方法时按正常流程处理
        """
        self.enter = '__exit__'

    def __float__(self):
        """
        >>> float(MedusaSorcerer())
        返回浮点数将会调度该方法
        """
        return float(123)

    def __floor__(self):
        """
        >>> math.floor(MedusaSorcerer())
        返回最大整数的时候调度该方法
        """
        return '__floor__'

    def __floordiv__(self, other):
        """
        >>> MedusaSorcerer() // 123
        进行除法运算的时候将会调度该方法
        """
        return 123.0

    def __format__(self, format_spec):
        """
        >>> format(MedusaSorcerer(), 'self.params = %params%')
        作为格式化字符串将字符串格式化返回
        """
        return format_spec.replace('%params%', self.params)

    def __fspath__(self):
        """
        PEP 519
        返回当前对象的文件系统表示
        这个方法只应该返回一个 str 字符串或 bytes 字节串, 优先选择 str 字符串

        官方中文文档:
        https://docs.python.org/zh-cn/3/library/os.html?highlight=__fspath__#os.PathLike.__fspath__
        https://www.python.org/dev/peps/pep-0519/#protocol
        https://www.python.org/dev/peps/pep-0519/#have-fspath-only-return-strings
        """
        pass

    def __ge__(self, other):
        """
        >>> MedusaSorcerer() >= 123
        调度大于等于条件的时候需要实现的方法
        """
        return True

    def __get__(self, instance, owner):
        """
        >>> class Test: medusa = MedusaSorcerer()
        >>> print(Test().medusa)
        官方: 调用此方法以获取所有者类的属性（类属性访问）或该类的实例的属性（实例属性访问）
        官方: 可选的 owner 参数是所有者类而 instance 是被用来访问属性的实例，如果通过 owner 来访问属性则返回 None
        在其实例拥有者对其进行查询操作的时候调用该方法
        """
        return '__get__'

    def __getattr__(self, item):
        """
        >>> MedusaSorcerer().params_2 = 123
        引用不存在实例属性时将会调度该方法
        __getattr__存在时__getattr__不会被调用, 除非显示调用或引发AttributeError异常
        """
        return f'object has no attribute "{item}"'

    def __getattribute__(self, item):
        """
        >>> MedusaSorcerer().params
        引用存在实例属性时将会调度该方法
        __getattr__存在时__getattr__不会被调用, 除非显示调用或引发AttributeError异常
        """
        return super().__getattribute__(item)

    def __getinitargs__(self):
        """
        >>> pickle.loads(pickle.dumps(MedusaSorcerer()))
        在旧式类中(Python 3.x中默认都是新式类, 经典类被移除)
        当你需要unpickle的时候调度__init__方法, 则需要定义该方法
        并返回__init__所需参数元组
        """
        return '__getinitargs__',

    def __getitem__(self, item):
        """
        >>> MedusaSorcerer()['params']
        实现用键值下表的方式获取数据
        """
        return self.__dict__.get(item)

    def __getnewargs__(self):
        """
        >>> pickle.loads(pickle.dumps(MedusaSorcerer()))
        对新式类来说, 你可以通过这个方法改变类在反pickle时传递给__new__的参数
        这个方法应该返回一个参数元组
        在Python3.6前, 第2、3版协议会调用__getnewargs__, 更高版本协议会调用__getnewargs_ex__

        其实pickle并不直接调用以下几个函数:
            __getnewargs_ex__
            __getnewargs__
            __getstate__
        事实上,, 这几个函数是复制协议的一部分它们实现了__reduce__这一特殊接口
        复制协议提供了统一的接口, 用于在封存或复制对象的过程中取得所需数据
        尽管这个协议功能很强, 但是直接在类中实现__reduce__接口容易产生错误
        因此, 设计类时应当尽可能的使用高级接口, 比如__getnewargs_ex__、__getstate__和__setstate__
        """
        return '__getnewargs__',

    def __getstate__(self):
        """
        >>> pickle.loads(pickle.dumps(MedusaSorcerer()))
        在pickle之前获取对象的状态

        其实pickle并不直接调用以下几个函数:
            __getnewargs_ex__
            __getnewargs__
            __getstate__
        事实上,, 这几个函数是复制协议的一部分它们实现了__reduce__这一特殊接口
        复制协议提供了统一的接口, 用于在封存或复制对象的过程中取得所需数据
        尽管这个协议功能很强, 但是直接在类中实现__reduce__接口容易产生错误
        因此, 设计类时应当尽可能的使用高级接口, 比如__getnewargs_ex__、__getstate__和__setstate__
        """
        return self.__dict__

    def __gt__(self, other):
        """
        >>> MedusaSorcerer() > 123
        调度大于条件的时候需要实现的方法
        """
        return False

    def __hash__(self):
        """
        >>> hash(MedusaSorcerer())
        返回自定义散列值
        """
        return -123

    def __hex__(self):
        """
        __oct__, __hex__: use __index__ in oct() and hex() instead.
        Python3 已经废弃
        官方中文文档:
        https://docs.python.org/zh-cn/3/whatsnew/3.0.html?highlight=__hex__#operators-and-special-methods
        """
        pass

    def __iadd__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa += 123
        实现就地加法运算
        """
        return self.params + f'{str(other)}(__iadd__)'

    def __iand__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa &= 123
        实现就地按位 and 运算
        """
        return '__iand__ True'

    def __idiv__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa /= 123
        实现就地除法运算
        Python3已不再使用该方法, 迁移至__itruediv__
        """
        return '__idiv__'

    def __ifloordiv__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa //= 123
        实现就地整除运算
        """
        return '__ifloordiv__'

    def __ilshift__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa <<= 123
        实现就地左移位赋值运算符
        """
        return 123 << other

    def __imatmul__(self, other):
        """
        查阅 PEP465:
        https://www.python.org/dev/peps/pep-0465/#specification

        官方中文文档 (无说明文档):
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__imatmul__#object.__imatmul__
        """
        pass

    def __imod__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa %= 123
        实现就地取余运算
        """
        return '__imatmul__'

    def __imul__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa *= 123
        实现就地乘法运算
        """
        return '__imul__'

    def __index__(self):
        """
        >>> bin(MedusaSorcerer())
        >>> hex(MedusaSorcerer())
        >>> oct(MedusaSorcerer())
        >>> operator.index(MedusaSorcerer())
        调用此方法以实现operator.index()以及Python需要无损地将数字对象转换为整数对象的场合
        例如切片或是内置的bin(), hex()和oct()函数
        存在此方法表明数字对象属于整数类型, 且必须返回一个整数
        """
        return 123

    def __init_subclass__(cls, **kwargs):
        """
        >>> class Test(MedusaSorcerer, params='class Test'): ...
        >>> print(Test.params)
        当一个类继承其他类时, 那个类的__init_subclass__会被调用
        这样就可以编写能够改变子类行为的类
        __init_subclass__只作用于定义了该方法的类下所派生的子类
        """
        cls.params = '__init_subclass__' if not kwargs.get('params') else kwargs.get('params')
        super().__init_subclass__()

    def __instancecheck__(self, instance):
        """
        >>> class BaseTypeClass(type):
        >>>     def __new__(cls, name, bases, namespace, **kwd): return type.__new__(cls, name, bases, namespace)
        >>>     def __instancecheck__(self, other): return False
        >>> class A(metaclass=BaseTypeClass): ...
        >>> print(isinstance(A(), A))
        控制某个对象是否是该对象的实例

        isinstance函数会进行快速检查
        查看参数提供的实例的类型是否与该类的类型相同
        如果相同则将提早返回结果, 并且不会调用__instancecheck__方法
        这是为了避免不必要时对__instancecheck__进行复杂调用而使用的优化
        """
        pass

    def __int__(self):
        """
        >>> int(MedusaSorcerer())
        转换为数字类型的调度方法
        """
        return 123

    def __invert__(self):
        """
        >>> ~MedusaSorcerer()
        实现一元运算的返回值调度方法
        """
        return ~123

    def __ior__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa |= 123
        实现就地按位 or 操作的方法
        """
        return '__ior__'

    def __ipow__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa **= 123
        实现就地幂算法
        """
        return '__ipow__'

    def __irshift__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa >>= 123
        实现右移位赋值运算符
        """
        return '__irshift__'

    def __isub__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa -= 123
        实现减法赋值操作
        """
        return '__isub__'

    def __iter__(self):
        """
        >>> medusa = iter(MedusaSorcerer())
        >>> next(medusa)
        创建可迭代对象需要实现的方法, 并需要实现__next__方法
        """
        self.integer = 0
        return self

    def __itruediv__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa /= 123
        实现就地除法运算
        Python2中在 from __future__ import division 下才有用
        """
        return '__itruediv__'

    def __ixor__(self, other):
        """
        >>> medusa = MedusaSorcerer()
        >>> medusa ^= 123
        实现就地按位异或运算
        """
        return '__ixor__'

    def __le__(self, other):
        """
        >>> MedusaSorcerer() <= 123
        定义小于等于操作符行为
        """
        return '__le__'

    def __len__(self):
        """
        >>> len(MedusaSorcerer())
        返回容器的长度
        """
        return len(self.params)

    def __long__(self):
        """
        >>> long(MedusaSorcerer)
        Python2需要实现的Long类型转换
        """
        return '__long__'

    def __lshift__(self, other):
        """
        >>> MedusaSorcerer() << 123
        实现左移位运算符
        """
        return '__lshift__'

    def __lt__(self, other):
        """
        >>> MedusaSorcerer() < 123
        定义小于操作符行为
        """
        return '__lt__'

    def __matmul__(self, other):
        """
        查阅 PEP465:
        https://www.python.org/dev/peps/pep-0465/#specification

        官方中文文档 (无说明文档):
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__imatmul__#object.__matmul__
        """
        pass

    def __missing__(self, key):
        """
        >>> class Dict(dict):
        >>>     def __missing__(self, key): return f'__missing__({key})'
        >>> medusa = Dict({'1': 1})
        >>> print(medusa['123'])
        在字典的子类中使用, 访问字典类型的实例中不存在的Key值将会调用该方法
        """
        pass

    def __mod__(self, other):
        """
        >>> MedusaSorcerer() % 123
        实现取余运算操作
        """
        return '__mod__'

    def __mro_entries__(self, bases):
        """
        如果在类定义中出现的基类不是 type 的实例, 则使用 __mro_entries__ 方法对其进行搜索
        当找到结果时, 它会以原始基类元组做参数进行调用
        此方法必须返回类的元组以替代此基类被使用
        元组可以为空, 在此情况下原始基类将被忽略
        具体参阅 PEP560

        官方中文文档:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__imatmul__#resolving-mro-entries
        https://www.python.org/dev/peps/pep-0560/#mro-entries
        """
        pass

    def __mul__(self, other):
        """
        >>> MedusaSorcerer() * 123
        实现乘法运算操作
        """
        return '__mul__'

    def __ne__(self, other):
        """
        >>> MedusaSorcerer() != 123
        定义不等判断行为
        """
        return '__ne__'

    def __neg__(self):
        """
        >>> -MedusaSorcerer()
        实现取负行为的方法
        """
        return '__neg__'

    def __new__(cls, *args, **kwargs):
        """
        >>> MedusaSorcerer()
        类对象实例化时将会首先调度该方法
        """
        if '__getnewargs__' in args: return 123
        return super().__new__(cls)

    def __next__(self):
        """
        >>> medusa = iter(MedusaSorcerer())
        >>> next(medusa)
        创建迭代对象需要实现的方法, 并需要实现__iter__方法
        """
        self.integer += 1
        return self.integer

    def __oct__(self):
        """
        >>> oct(MedusaSorcerer())
        实现八进制数据转换
        此处被__index__方法覆盖
        """
        return '__oct__'

    def __or__(self, other):
        """
        >>> MedusaSorcerer() | 132
        实现按位或运算符
        """
        return '__or__'

    def __pos__(self):
        """
        >>> +MedusaSorcerer()
        实现取正行为的方法
        """
        return '__pos__'

    def __pow__(self, power, modulo=None):
        """
        >>> MedusaSorcerer() ** 123
        实现幂值运算操作
        """
        return '__pow__'

    @classmethod
    def __prepare__(metacls, name, bases):
        """
        >>> MedusaSorcerer()
        __prepare__只在元类中有用, 而且必须声明为类方法
        主要功能是罗列类的属性定义的顺序
        第一个参数是元类, 随后两个参数分别是要构建的类的名称和基类组成的元组, 返回值必须是映射数据
        元类构建新类时, 解释器会先调用__prepare__方法, 使用类定义体中的属性创建映射
        接着把__prepare__方法返回的映射会传给__new__方法的最后一个参数
        然后再传给__init__方法
        此处我们传递的是一个空的OrderedDict实例对象
        """
        return collections.OrderedDict()

    def __radd__(self, other):
        """
        >>> 123 + MedusaSorcerer()
        实现反射加法操作
        """
        return '__radd__'

    def __rand__(self, other):
        """
        >>> 123 & MedusaSorcerer()
        实现反射按位与运算符
        """
        return '__rand__'

    def __rdiv__(self, other):
        """
        >>> 123 / MedusaSorcerer()
        实现反射除法
        Python3 失效
        """
        return '__rdiv__'

    def __rdivmod__(self, other):
        """
        >>> divmod(123, MedusaSorcerer())
        返回反射 (整数, 取余) 的元组数组
        """
        return '__rdivmod__'

    def __reduce__(self):
        """
        >>> pickle.dumps(MedusaSorcerer())
        当定义扩展类型时, 也就是使用Python的C语言API实现的类型
        如果你想pickle它们, 你必须告诉Python如何pickle它们
        __reduce__ 被定义之后, 当对象被Pickle时就会被调用
        它要么返回一个代表全局名称的字符串, Python会查找它并pickle
        要么返回一个元组, 这个元组包含2到5个元素:
            一个可调用的对象, 用于重建对象时调用
            一个参数元素, 供那个可调用对象使用
            被传递给 __setstate__ 的状态(可选)
            一个产生被pickle的列表元素的迭代器(可选)
            一个产生被pickle的字典元素的迭代器选可
        """
        return super().__reduce__()

    def __reduce_ex__(self, protocol):
        """
        >>> pickle.dumps(MedusaSorcerer())
        __reduce_ex__的存在是为了兼容性
        如果它被定义, 在pickle时__reduce_ex__会代替__reduce__被调用
        """
        return super().__reduce_ex__(protocol)

    def __repr__(self):
        """
        >>> repr(MedusaSorcerer())
        返回对象转化为供解释器读取的形式的数据
        """
        return '__repr__'

    def __reversed__(self):
        """
        >>> reversed(MedusaSorcerer())
        返回一个反转的迭代器
        """
        return '__reversed__'

    def __rfloordiv__(self, other):
        """
        >>> 123 // MedusaSorcerer()
        实现反射整除运算
        """
        return '__rfloordiv__'

    def __rlshift__(self, other):
        """
        >>> 123 << MedusaSorcerer()
        实现反射左位移运算
        """
        return '__rlshift__'

    def __rmatmul__(self, other):
        """
        PEP465 (无说明文档)：
        https://www.python.org/dev/peps/pep-0465/#specification
        官方中文文档 (无说明文档):
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__rmatmul__#object.__rmatmul__
        """
        pass

    def __rmod__(self, other):
        """
        >>> 123 % MedusaSorcerer()
        实现反射取余操作符
        """
        return '__rmod__'

    def __rmul__(self, other):
        """
        >>> 123 * MedusaSorcerer()
        实现反射乘法操作
        """
        return '__rmul__'

    def __ror__(self, other):
        """
        >>> 123 | MedusaSorcerer()
        实现反射按位或运算符
        """
        return '__ror__'

    def __round__(self, n=None):
        """
        >>> round(MedusaSorcerer())
        实现浮点数n的四舍五入值
        """
        return '__round__'

    def __rpow__(self, other):
        """
        >>> 123 ** MedusaSorcerer()
        反射幂值运算操作符
        """
        return '__rpow__'

    def __rrshift__(self, other):
        """
        >>> 123 >> MedusaSorcerer()
        实现反射右位移操作
        """
        return '__rrshift__'

    def __rshift__(self, other):
        """
        >>> MedusaSorcerer() >> 123
        实现右位移操作
        """
        return '__rshift__'

    def __rsub__(self, other):
        """
        >>> 123 - MedusaSorcerer()
        实现反射减法操作
        """
        return '__rsub__'

    def __rtruediv__(self, other):
        """
        >>> 123 / MedusaSorcerer()
        实现_true_反射除法
        Python2 这个函数只有使用from __future__ import division时才有作用
        Python3 全局生效
        """
        return '__rtruediv__'

    def __rxor__(self, other):
        """
        >>> 123 ^ MedusaSorcerer()
        实现反射按位异或运算符
        """
        return '__rxor__'

    def __set__(self, instance, value):
        """
        >>> class Test: medusa = MedusaSorcerer()
        >>> Test().medusa = 1
        在其拥有者对其进行修改值的时候调用
        一个类要成为描述器, 必须实现__get__, __set__, __delete__ 中的至少一个方法
        """
        instance.params = value

    def __set_name__(self, owner, name):
        """
        在所有者类 owner 创建时被调用, 描述器会被赋值给 name
        官方中文文档:
        https://docs.python.org/zh-cn/3/reference/datamodel.html?highlight=__set_name__#object.__set_name__
        https://www.python.org/dev/peps/pep-0487/#proposal
        """
        pass

    def __setattr__(self, key, value):
        """
        >>> self.params = 123
        实例对象设置实例属性的时候将会调度该方法
        """
        self.__dict__[key] = value

    def __setitem__(self, key, value):
        """
        >>> MedusaSorcerer()['key'] = 123
        使用键值方式增加元素值
        """
        self.__dict__[key] = value

    def __setslice__(self, i, j, sequence):
        """
        __getslice__、__setslice__、__delslice__：用于分片的三个操作
        Python3中已经废弃
        """
        pass

    def __setstate__(self, state):
        """
        >>> pickle.loads(pickle.dumps(MedusaSorcerer()))
        当一个对象被反pickle时, 如果定义了__setstate__, 对象的状态会传递给这个魔法方法
        而不是直接应用到对象的__dict__属性
        这个魔法方法和__getstate__相互依存
        当这两个方法都被定义时, 你可以在Pickle时使用任何方法保存对象的任何状态

        在 unpickling 之后还原对象的状态
        """
        pass

    def __sizeof__(self):
        """
        >>> sys.getsizeof(MedusaSorcerer())
        返回对象的大小
        """
        return 123

    def __str__(self):
        """
        >>> str(MedusaSorcerer())
        >>> print(MedusaSorcerer())
        返回字符串调度的方法
        """
        return '__str__'

    def __sub__(self, other):
        """
        >>> MedusaSorcerer() - 123
        实现了加号运算
        """
        return '__sub__'

    def __subclasscheck__(self, subclass):
        """
        >>> issubclass(MedusaSorcerer(), MedusaSorcerer)
        对实例使用issubclass(subclass, class)时调用
        它会判断subclass否是该类的子类
        返回会与__instancecheck__一致, 忽略该方法
        """
        pass

    def __truediv__(self, other):
        """
        >>> MedusaSorcerer() // 123
        实现了整除运算
        Python2 只有你声明了from __future__ import division该方法才会生效
        """
        return '__truediv__'

    def __trunc__(self):
        """
        >>> math.trunc(MedusaSorcerer())
        实现了math.trunc(), 向0取整
        """
        return '__trunc__'

    def __unicode__(self):
        """
        >>> unicode(MedusaSorcerer())
        Python2 中实现unicode转码
        """
        pass

    def __xor__(self, other):
        """
        >>> MedusaSorcerer() ^ 123
        实现按位异或运算符
        """
        return '__xor__'
```

## 参考资料

* [Python提供的魔术方法](https://www.cnblogs.com/dachenzi/p/8185792.html)
* [一个类带你了解Python魔法方法](https://juejin.cn/post/6844904051608387598)

（完）
