# 类型提示进阶：typing 模块

[typing 模块](https://github.com/python/cpython/blob/main/Lib/typing.py)为类型提示（Type Hints）提供运行时支持，从 Python 3.5 版本开始被作为标准库引入。

## 常用类型提示

### 数据类型

* `int`，`long`，`float`：整型，长整形，浮点型
* `bool`，`str`：布尔型，字符串类型
* `List`，`Tuple`，`Dict`，`Set`：列表，元组，字典，集合
* `Iterable`，`Iterator`：可迭代类型，迭代器类型
* `Generator`：生成器类型

前两行小写的不需要 `import`，后面三行都需要通过 `typing` 模块 `import`。 

虽然指定类型的时候也可以用 `list`、`tuple`、`dict`、`set`，但是不能指定里面元素数据类型，这就是用 `typing` 模块的好处了。

### 代码示例

#### 函数单个参数

```python
# name 参数类型为 str
def greeting(name: str) :
    return "hello"
```

#### 函数多个参数

```python
# 多个参数，参数类型均不同
def add(a: int, string: str, f: float, b: bool or str):
    print(a, string, f, b)
```

bool or str：代表参数 b 可以是布尔类型，也可以是字符串。

#### 函数返回类型

```python
# 函数返回值指定为字符串
def greeting(name: str) -> str:
    return "hello"
```

#### 复杂例子

```python
from typing import Tuple, List, Dict


# 返回一个 Tuple 类型的数据，第一个元素是 List，第二个元素是 Tuple，第三个元素是 Dict，第四个元素可以是字符串或布尔
def add(a: int, string: str, f: float, b: bool or str) -> Tuple[List, Tuple, Dict, str or bool]:
    list1 = list(range(a))
    tup = (string, string, string)
    d = {"a": f}
    bl = b
    return list1, tup, d, bl

# 调用
result = add(1, "2", 123, True)
print(result)


# 输出结果
([0], ('2', '2', '2'), {'a': 123}, True)
```

## List[T]、Set[T]

List[T] 和 Set[T] 只能传一个类型，传多个 IDE 不会报错，但运行时会报错。

```python
from typing import List, Set

a: List[int, str] = [1, '2']
b: Set[int, str] = {1, 2, 3}


# 运行时报错
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "D:\Python39\lib\typing.py", line 275, in inner
    return func(*args, **kwds)
  File "D:\Python39\lib\typing.py", line 828, in __getitem__
    _check_generic(self, params, self._nparams)
  File "D:\Python39\lib\typing.py", line 212, in _check_generic
    raise TypeError(f"Too {'many' if alen > elen else 'few'} parameters for {cls};"
TypeError: Too many parameters for typing.List; actual 2, expected 1
```

## Tuple[T]

只写一个 int，赋值两个 int 元素会报 warning。

```python
from typing import Tuple

# 会报 warning
t1: Tuple[int] = (1, 2)

# 应该这么写
t2: Tuple[int, str] = (1, "2")
```

如果 Tuple[T] 指定类型数量和赋值的元素数量，也会有 warning。

```python
from typing import Tuple

# 会报 warning
t: Tuple[int, str] = (1, "2", "2") 
```

综上可以得出结论，Tuple[T] 指定一个类型的时候，仅针对同一个索引下的元素类型。

如果想像 List[T] 一样，指定一个类型，可以对所有元素生效，就要在后面加上 `...`：

```python
from typing import Tuple, Dict

t1: Tuple[int, ...] = (1, 2, 3)
t2: Tuple[Dict[str, str], ...] = ({"name": "张三"}, {"age": "13"})
```

## 类型别名

可以给复杂的类型给个别名，这样使用起来方便一些。

变量的例子：

```python
from typing import List

# 别名
vector = List[float]

var: vector = [1.1, 2.2]
# 等价写法
var: List[float] = [1.1, 2.2]
```

函数的例子：

```python
from typing import List, Dict

# float 组成的列表别名
vector_list_es = List[float]
# 字典别名
vector_dict = Dict[str, vector_list_es]
# 字典组成列表别名
vector_list = List[vector_dict]

# vector_list 等价写法，不用别名的话，有点像套娃
vector = List[Dict[str, List[float]]]

# 函数
def scale(scalar: float, vector: vector_list) -> vector_list:
    for item in vector:
        for key, value in item.items():
            item[key] = [scalar * num for num in value]
    print(vector)
    return vector

# 调用函数
scale(2.2, [{"a": [1, 2, 3]}, {"b": [4, 5, 6]}])


# 输出结果
[{'a': [2.2, 4.4, 6.6000000000000005]}, {'b': [8.8, 11.0, 13.200000000000001]}]
```

实际应用举例：

```python
from typing import Dict, Tuple

# 更接近实际应用的栗子
ConnectionOptions = Dict[str, str]
Address = Tuple[str, int]
Server = Tuple[Address, ConnectionOptions]


def broadcast_message(message: str, servers: Server) -> None:
    print(message, servers)


# 调用函数
message = "发送服务器消息"
servers = (("127.0.0.1", 127), {"name": "测试服务器"})
broadcast_message(message, servers)


# 输出结果
发送服务器消息 (('127.0.0.1', 127), {'name': '测试服务器'})
```

## NewType

可以自定义创建一个新类型：

* 主要用于类型检查
* `NewType(name, tp)` 返回一个函数，这个函数返回其原本的值
* 静态类型检查器会将新类型看作是原始类型的一个子类
* `tp` 就是原始类型

代码举例：

```python
from typing import NewType

UserId = NewType('UserId', int)


def name_by_id(user_id: UserId):
    print(user_id)


# 测试一下
UserId('user')   # Expected type 'int', got 'str' instead
num = UserId(5)  # type: int

name_by_id(42)          # Expected type 'UserId', got 'int' instead
name_by_id(UserId(42))  # OK

print(type(UserId(5)))


# 输出结果
42
42
<class 'int'>
```

可以看到 `UserId` 其实也是 int 类型。

使用 `UserId` 类型做算术运算，得到的是 int 类型数据：

```python
# 'output' is of type 'int', not 'UserId'
output = UserId(23413) + UserId(54341)
print(output)
print(type(output))

# 输出结果
77754
<class 'int'>
```

## Callable

这是一个可调用对象类型。

查看对象是否可调用（函数是可调用的，变量不是可调用对象）：

```python
# 返回 True 或 False
isinstance(对象, Callable)    
```

Callable 作为函数参数用法举例：

```python
def print_name(name: str):
    print(name)


# Callable 作为函数参数使用，其实只是做一个类型检查的作用，检查传入的参数值 get_func 是否为可调用对象
def get_name(get_func: Callable[[str], None]):
    return get_func

# 调用函数
vars = get_name(print_name)
vars("test 1")


# 等价写法，其实就是将函数作为参数传入
def get_name_test(func):
    return func

# 调用函数
vars2 = get_name_test(print_name)
vars2("test 2")


# 输出结果
test 1
test 2
```

Callable 作为函数返回值用法举例：

```python
# Callable 作为函数返回值使用，其实只是做一个类型检查的作用，看看返回值是否为可调用对象
def get_name_return() -> Callable[[str], None]:
    return print_name

# 调用函数
vars = get_name_return()
vars("test 1")


# 等价写法，相当于直接返回一个函数对象
def get_name_test():
    return print_name

# 调用函数
vars2 = get_name_test()
vars2("test 2")


# 输出结果
test 1
test 2
```

## TypeVar 泛型

任意类型：

```python
# 可以是任意类型
T = TypeVar('T')

def test(name: T) -> T:
    print(name)
    return name

# 调用函数
test(11)
test("aa")


# 输出结果
11
aa
```

指定类型：

```python
# 可以是 int，也可以是 str 类型
AA = TypeVar('AA', int, str)

# 使用 AA 类型
num1: AA = 1
num2: AA = "123"
print(num1, num2)

num3: AA = []  # Expected type 'AA', got 'list' instead


# 输出结果
1 123
```

自定义泛型类（目前 Python 中用的不多）：

```python
# 自定义泛型
from typing import Generic

T = TypeVar('T')


class UserInfo(Generic[T]):  # 继承 Generic[T]，UserInfo[T] 也就是有效类型
    def __init__(self, v: T):
        self.v = v

    def get(self):
        return self.v


l = UserInfo("张三")

print(l.get())


# 输出结果
张三
```

## Any Type

Any 是一种特殊的类型，静态类型检查器会将每种类型都视为与 Any 兼容，将 Any 视为与每种类型兼容。

```python
# Any
from typing import Any

a = None  # type: Any
a1 = []  # OK
a2 = 2  # OK

s = ''  # type: str
s1 = a  # OK


def foo(item: Any) -> int:
    # Typechecks; 'item' 可以是任意类型
    print(item)
    return 1


# 调用函数
foo(a)
foo(a1)
foo(a2)
foo(s)
foo(s1)
```

隐式使用 Any：

```python
def legacy_parser(text):
    ...
    return data

# 上述写法等价于下述写法
# 所有没有返回类型或参数类型的函数将隐式默认使用 Any

def legacy_parser(text: Any) -> Any:
    ...
    return data
```

## Union

联合类型，`Union[int, str]` 表示既可以是 `int`，也可以是 `str`。

```python
from typing import Union

# vars 变量可以是 int 也可以是 str 类型
vars: Union[int, str]
vars = 1
vars = '123'

# 如果赋值成其他的会有 warning
vars = []  # Expected type 'Union[int, str]', got 'list' instead
```

等价写法：

```python
vars: Union[int, str]
# 等价于
vars: [int or str]

vars: Union[int]
# 等价于
vars: int
```

细节注意点：

```python
# 最终 Union[int] 返回的也是 int 类型
Union[int] == int

# 重复的类型参数会自动忽略掉
Union[int, str, int] == Union[int, str]

# 自动忽略类型参数顺序
Union[int, str] == Union[str, int]

# union 嵌套 union 会自动解包
Union[Union[int, str], float] == Union[int, str, float]
```

## Optional

可选类型。

和默认参数有什么不一样？

* 官方原话：可选参数具有默认值，具有默认值的可选参数不需要在其类型批注上使用 Optional，因为它是可选的
* 不过 Optional 和默认参数其实没啥实质上的区别，只是写法不同
* 使用 Optional 是为了让 IDE 识别到该参数有一个类型提示，可以传指定的类型和 None，且参数是可选非必传的

```python
# 可选参数
def foo(arg: int = 0) -> None:
    ...

# 不传 arg 默认取 0
foo()
```

重点：

* `Optional[int]` 等价于 `Union[int, None]`
* 意味着：既可以传指定的类型 `int`，也可以传 `None`

```python
def foo_func(arg: Optional[int] = None):
    print(arg)

# 调用函数
foo_func()
foo_func(1)

# 输出结果
None
1
```

使用默认参数的写法（这种写法，Pycharm 并不会 warning）：

```python
def foo_func(arg: int = None):
    print(arg)

# 调用函数
foo_func()
foo_func(1)


# 输出结果
None
1
```

`Optional[]` 里面只能写一个数据类型：

```python
# 正确
Optional[str]
Optional[List[str]]
Optional[Dict[str, Any]]

# 错误
Optional[str, int]
Optional[Union[str, int, float]]
```

（完）
