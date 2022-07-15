# 类型提示增强：typing 模块

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


