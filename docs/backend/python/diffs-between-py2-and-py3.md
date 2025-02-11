# Py2 和 Py3 语法特性区别

> 记录升级项目时遇到的语法特性区别。

## 移除了 unicode 和 long 这两种数据类型

+ 整数类型的统一
  + 在 Python 2 中，整数类型分为两种：普通整数（`int`）和长整数（`long`）。当需要处理超过 `int` 类型范围的整数时，会自动转换为 `long` 类型。
  + 在 Python 3 中，将这两种整数类型进行了统一，只保留了 `int` 类型。
+ 字符串类型的统一
  + 在 Python 2 中，字符串分为两种类型：普通字符串（`str`）和 Unicode 字符串（`unicode`）。
  + 在 Python 3 中，字符串默认采用 Unicode 编码，因此不需要显式地判断字符串是否为 Unicode 类型。即在Python 3中，所有的字符串都是 Unicode 类型。

```python
# python2 的写法
isinstance(time_offset, (int, long, float)):
isinstance(camel_format, (str, unicode)):

# python3 的写法
isinstance(time_offset, (int, float)):
isinstance(camel_format, str):
```

## 关于一些库返回的文本信息编码解码问题

比如 `requests` 库返回的响应内容，因为出于数据的完整性和灵活性等考虑，这些数据都是以二进制数据的形式传递的。

+ 在 Python 2 中，`str` 类型可以同时用于表示文本字符串和二进制数据，统称字节串（byte string）， `unicode` 类型表示文本字符串。这种设计在处理文本和二进制数据时容易引起混淆，因为 `str` 类型可以同时表示文本和二进制数据。
+ 在 Python3 中，`str` 类型被设计为用来表示文本字符串（默认采用 Unicode 编码），而 `bytes` 类型则专门用来表示字节串（byte string），即二进制数据。这样明确的区分就让代码更加清晰了。

于是这个重大的改变就让我们在使用 `requests` 这类库时，对响应内容的处理略有不同了。

```python
import requests

# python2 的写法
res = requests.post(url, data={'key': 'value'})
print(type(response.content))  # 输出：<type 'str'>
content = res.content
if 'abc' in content.lower():
    print(True)
else:
    print(False)

# python3 的写法
res = requests.post(url, data={'key': 'value'})
print(type(response.content))  # 输出：<class 'bytes'>
# 按原来的代码会报错：TypeError: a bytes-like object is required, not 'str'
# 需要将 bytes 类型的响应内容转换为字符串，可以通过指定字符编码进行解码
content = response.content.decode('utf-8')
if 'abc' in content.lower():
    print(True)
else:
    print(False)
```

## 字典的有序性

+ 在 Python2 中字典是无序的数据结构，如果需要创建有序字典得借助 `from collections import OrderedDict`。
+ 在 Python3（实际上是 Python3.7）以后字典是有序的，字典的插入顺序和修改顺序被保留。

## map 方法的不同

在 Python 2 中，map 函数会返回一个列表，其中包含了将函数应用于迭代器中每个元素后得到的结果。但是在 Python 3 中，map 函数的行为发生了变化，它现在返回的是一个迭代器，而不是一个列表。

因此，如果你在 Python 3 中运行 map(register_fields, [SnmpTS]) 这行代码，它不会像在 Python 2 中那样直接返回一个列表。如果你想要在 Python 3 中获得与 Python 2 相同的结果，可以使用 list 函数将 map 函数返回的迭代器转换为列表。例如：

```python3
result = list(map(register_fields, [SnmpTS]))
```

上面这行代码会将 register_fields 函数应用于列表 [SnmpTS] 中的每个元素，并将结果存储在一个列表中。这样你就可以在 Python 3 中获得与 Python 2 中相同的结果。

## filter 函数返回值的区别

> 报错信息：  
> object of type 'filter' has no len()
> Object of type filter is not JSON serializable

+ 在 Python 2 中，filter 返回的是一个 list，可以直接使用它。
+ 在 Python 3 中，filter 返回的是一个 filter 对象，同样的需求应该将 filter 转换成 list 再使用。

```python
# python2 的用法
q = filter(lambda x: x % 2 == 0, range(1, 10))
print(q)
# 输出：2，4，6，8

# python3 的用法
# 同样的代码输出：<filter object at 0x7f5e4661dcc0>
# 应该将 filter 转换成 list
q = list(filter(lambda x: x % 2 == 0, range(1, 10)))
```

由于业务上经常碰到「统计 filter 后结果集的个数」这种需求场景，正是因为这种变动，使得现在写代码时，可以考虑一些优化。

+ 在结果集较小的时候，先将结果集转换成 list 对象然后调用 `len()` 函数进行统计，这种方式对性能的影响不大。
+ 但当结果集较大的情况下，将 `filter()` 函数的结果转换为列表可能会牺牲性能，因为在转换为列表时需要创建一个新的列表对象，再遍历原始数据集并复制满足条件的元素到新列表中。此时不妨用 `sum()` 函数来更高效地统计结果数量。

```python
# 优化前
# 1. 创建一个新列表
# 2. 遍历原始数据集，将满足条件的元素添加到新列表中
# 3. 返回新列表的长度
count = len(list(filter(lambda x: x % 2 == 0, range(1, 10))))

# 优化后
# 1. 遍历原始数据集，对满足条件的元素计数
# 2. 返回计数结果
count = sum(1 for elem in filter(lambda x: x % 2 == 0, range(1, 10)))
```

还有一种业务常见的使用场景，就是获取过滤后的第一个值：

```python
numbers = [1, 2, 3, 4, 5]
filtered_numbers = filter(lambda x: x > 2, numbers)

# python2 的写法
first_number = filtered_numbers[0] if filtered_numbers else None

# python3 的写法 1
# 转成 list 后跟 python2 一样用，显然在大数据量的时候性能较差
first_number = list(filtered_numbers)[0] if list(filtered_numbers) else None

# python3 的写法 2
# 使用 next 获取迭代器下一个数据，并且从数据集中移除该数据。当没有数据时会抛出错误 `StopIteration`。
# 需要注意不能用 `if filtered_numbers` 来判断过滤后是否是空数据集，因为 filter 对象恒返回 True
# 需要注意 next 调用前不能使用类似 list(filtered_numbers) 方法，因为一旦调用这个方法，就相当于是对数据集执行了一次完整迭代操作，下一次 next 必然就报错了
first_number = next(filtered_numbers)

# python3 的写法 2 优化
# 即设置 next 的第二参数，当遇到 `StopIteration` 时指定默认值，不抛出错误
first_number = next(filtered_numbers, None)
```

## range 函数返回值的区别

> 报错信息：  
> unsupported operand type(s) for +: 'range' and 'range'

Python2 和 Python3 的 range 函数返回结果不一样：

* 在 Python 2 中，直接返回一个列表了。
* 在 Python 3 中，返回值变成了一个可迭代对象。可以直接遍历，也可以根据需要将其转为其他的可迭代数据结构。

```python
# python2 的用法
range(2, 5)  # [2, 3, 4]

# python3 的用法
range(2, 5)        # range(2, 5) --- <class 'range'>
list(range(2, 5))  # [2, 3, 4]
```

## 字典的.keys() 方法返回结果不一样

Python2 和 Python3 的字典 `.keys()` 方法返回不一样：

* 在 Python 2 中，字典的 `.keys()` 方法返回一个所有键的列表。
* 在 Python 3 中，字典的 .keys() 方法返回一个 `dict_keys` 对象，它是一个类似于集合的可迭代对象，可以用来迭代字典中的键。

由于 `dict_keys` 对象不是 JSON 可序列化的类型，因此不能直接使用 `json.dumps()` 函数将其序列化为 JSON 字符串，而是应该先将 `dict_keys` 对象转换为列表，然后再进行序列化。例如：

```python3
import json

dic = {'a': 1, 'b': 2, 'c': 3}
dic_keys = dic.keys()
# 将可迭代对象转为列表
dic_keys_list = list(dic_keys)
json_str = json.dumps(dic_keys_list)
```

因此所有设计到这种用法的代码都需要增加 `list()` 转换（比如 ES 的 ORM，像 `terms` 这种查询语法在转成 DSL 后会以列表的形式发送给服务端，但返回的报错信息提示有限）

同理，字典的 `.items` 和 `.values()` 方法现在均返回迭代器，如果需要当列表使用，需要进行转换。

## 迭代字典时禁止更改字典的大小

> 报错信息：  
> RuntimeError: dictionary changed size during iteration

在迭代字典时更改字典大小，Python2 不会报错，但是可能会引发一些问题（比如迭代器可能会丢失或重复访问某些元素），Python 会直接抛出这个错误。

Python3 处理这种需求的两种常见方式：

```python3
# 创建一个字典键的副本并在副本上迭代，而不是在原始字典上迭代
# 迭代 keys，而不是 obj.keys()
keys = list(obj.keys())

# 创建一个新的带有所需更改的字典，而不是在迭代原始字典时修改它。
```

总之，不管是在 Python 2 还是 Python 3 中，都不建议在迭代字典时更改字典大小。

## commands 模块被废弃

在 Python 3 中，`commands` 模块已经被废弃并移除，因此无法在 Python 3 中使用。如果想执行命令行操作，可以使用 `subprocess` 模块来代替。

具体用法看代码，之前几个地方我已经用 `subprocess` 模块来实现的了。

## 在字符串和 Unicode 处理方面的差异

在 Python 3 中，`str` 类型已经支持 Unicode 编码，因此不再需要单独的 `unicode` 类型。

> 现在字符串只有 `str` 一种类型，但它跟 2.x 版本的 `unicode` 几乎一样。

其中一个影响：

* 在 Python 2 中，`json.loads()` 函数会将 JSON 字符串解析为 Python 字典，并将所有字符串值转换为 `unicode` 类型。
* 在 Python 3 中，`json.loads()` 函数会将 JSON 字符串解析为 Python 字典，并将所有字符串值保留为 `str` 类型。

## 列表.sort() 参数的变化

> 报错信息：  
> dimension_cmp() missing 1 required positional argument: 'b'

* Python2：`列表.sort(cmp=None, key=None, reverse=False)`
  * `cmp` 接受一个比较函数 func，该函数有两个参数，通过对这两个参数的比较，返回负值为小于，如果它们相等则返回零，或者返回正为大于。
  * `key` 接受一个函数 func，传入 func 的参数是列表的元素，它接受一个参数并返回一个用于排序的键，也就是说是根据列表元素经过 func 处理后的结果进行排序。
  * `reverse`：接受布尔值，为 `True` 时表示降序排序。
* Python3：`列表.sort(key=None, reverse=False)`
  * 取消了 `cmp` 参数，但是可以构造排序函数传递给 `key` 来实现。

Python2 的写法：

```python2
# 用 key 参数
my_list = ["bb", "a", "dddd", "ccc"]
my_list.sort(key=lambda x: len(x))
print(my_list)

# 用 cmp 参数
def compare_length(x, y):
    return len(x) - len(y)
my_list = ["bb", "a", "dddd", "ccc"]
my_list.sort(cmp=compare_length)
print(my_list)
```

Python3 的写法：

```python3
# 用 key 参数（同 Python2）
my_list = ["bb", "a", "dddd", "ccc"]
my_list.sort(key=lambda x: len(x))
print(my_list)

# 像 cmp 那样传递两个参数给比较函数
# 从 functools 导入 cmp_to_key() 方法，改造排序函数让其可以传递给 key 参数
from functools import cmp_to_key
def compare_length(x, y):
    return len(x) - len(y)
my_list = ["bb", "a", "dddd", "ccc"]
my_list.sort(key=cmp_to_key(compare_length))
print(my_list)
```

`functools.cmp_to_key()` 函数接受一个比较函数作为参数，返回一个键函数，该键函数接受单个参数并返回一个可供排序使用的关键字值。这样就可以在 `key` 参数中使用转换后的键函数，并实现类似于 `cmp` 的比较效果了。

## 整数和空值（None）之间的比较

> 报错信息：  
> TypeError: '<' not supported between instances of 'int' and 'NoneType'

+ 在 Python 2 中，对整数和空值进行比较时，空值 `None` 被视为小于任何整数（包括 0 和 负数）。
+ 在 Python 3 中，由于引入了更严格的类型检查，在对不兼容类型进行比较时会引发 `TypeError` 异常。

```python
x = 5
y = None

if x < y:
    print("x 小于 y")
else:
    print("x 大于等于 y")

# python2 会返回 "x 大于等于 y"
# python3 会报错
```

## 除法的区别

+ 在 Python2 中：
  + `/`：整数相除，向下取整；浮点数相除，结果包含小数（因此对于 `1/2` 如果想保留小数应该写成 `1.0/2` 或者 `1*1.0/2`）。
  + `//`：整数相除，与 `/` 相同；浮点数相除，只返回整数部分，小数部分取零。
  + `%`：取余。
+ 在 Python3 中：
  + `/`：**整数相除，也包含小数**。
  + `//`：**不管结果中有没有小数，去掉小数取整**。
  + `%`：取余。

因此，当用 Python3 写代码时，对于两个整数相除仍旧希望得到整数的场景，需要使用双斜杠 `//`。

## 列表推导式对变量作用域的处理不同

+ 在 Python2 中：列表推导式并没有创建一个新的局部作用域。如果在列表推导式中使用了一个与外部作用域中同名的变量，那么这个变量的值会在列表推导式执行后被改变。
+ 在 Python3 中：列表推导式会创建一个新的局部作用域。在列表推导式中使用的变量不会影响到外部作用域中的同名变量。

```python
# python2 的现象
x = 1
[x for x in range(5)]
print(x)  # 输出：4

# python3 的现象
x = 1
[x for x in range(5)]
print(x)  # 输出：1
```

## 类型提示

> + 这是 Python 3.5、3.6 新增的两个特性 [PEP 484](https://peps.python.org/pep-0484/) 和 [PEP 526](https://peps.python.org/pep-0526/)，帮助 IDE 为我们提供更智能的提示。
> + 这些新特性不会影响语言本身，只是增加一点提示。也就是说，假设变量标注了类型，传错了并不会报错，但是会有 warning，是 IDE 的智能语法提示。所以这个类型提示更像是一个规范约束，并不是一个语法限制。

简单数据类型：

```python
# Python2 的写法
age = 13
name = '张三'
sex = True
weight = 52.5
x = b"moon"


# Python3 的写法
age: int = 13
name: str = '张三'
sex: bool = True
weight: float: 52.5
x: bytes = b"moon"
```

复杂数据类型：

```python
# Python2 的写法
items_l = ['Python', 'Java', 'Go']
items_t = (1, 2, 3)
items_s = {10, 20, 30, 40, 50}
items_d = {'score': 99}


# Python3 的写法
from typing import List, Tuple, Set, Dict

items_l: List[str] = ['Python', 'Java', 'Go']
# 元组的方括号里面不加 ... 的话，IDE 会有一个 warning 提示
items_t: Tuple[int, ...] = (1, 2, 3)
items_s: Set[int] = {10, 20, 30, 40, 50}
# 第一个声明所有键的类型，第二个声明所有值的类型
items_d: Dict[str, float] = {'score': 99}
```

函数参数与返回值：

```python
# Python2 的写法
def add(a, b):
    """
    这是一个加法运算函数
    :param a: int 加数
    :param b: int 加数
    :return: int 两数相加之和
    """
    return a + b


# Python3 的写法（无需在注释里说明参数类型了）
def add(a:int, b:int) -> int:
    """
    这是一个加法运算函数
    :param a: 加数
    :param b: 加数
    :return: 两数相加之和
    """
    return a + b
```

类作为类型：

```python
class Person:
    def __init__(self, name: str):
        self.name = name


def get_person_name(one_person: Person):
    return one_person.name
```

## 异步编程

> + Python 3.4 版本引入的协程，需要借助 `asyncio` 库。
> + Python 3.5 版本引入的 `await/async` 关键字（语法糖），不再需要使用回调函数或者协程来实现异步编程，因此异步代码的编写更方便了。
>   + 在函数定义前面加上`async` 关键字，使它变成一个协程函数，调用该函数就会返回一个协程对象。
>   + 在函数内部使用 `await` 关键字来等待异步操作的完成。
>   + 可以在协程函数中使用其他的协程或异步函数。

不过需要注意异步代码会让代码整体变得较难维护和理解，视场景而定，在需要编写单线程异步代码的时候可以使用。

（完）
