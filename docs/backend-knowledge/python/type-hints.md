# 类型提示 Type Hints

这是 Python 3.5、3.6 新增的两个特性 [PEP 484](https://peps.python.org/pep-0484/) 和 [PEP 526](https://peps.python.org/pep-0526/)，帮助 IDE 为我们提供更智能的提示。

这些新特性不会影响语言本身，只是增加一点提示。也就是说，假设变量标注了类型，传错了并不会报错，但是会有 warning，是 IDE 的智能语法提示。所以这个类型提示更像是一个规范约束，并不是一个语法限制。

## 简单数据类型

Python 变量类型的声明方式是：`变量名: 变量类型`，其中 `变量类型` 可以是所有的标准 Python 类型，如下所示：

```python
age: int = 13
name: str = '张三'
sex: bool = True
weight: float: 52.5
x: bytes = b"moon"
```

## 复杂数据类型

有些容器数据结构可以包含其他的值，比如 dict、list、set 和 tuple。它们内部的值也会拥有自己的类型。

我们可以使用 Python 的 `typing` 标准库来声明这些类型以及子类型，它专门用来支持这些类型提示。

### 列表

比如定义一个由 `str` 组成的列表变量。

从 `typing` 模块导入 `List`（注意是大写的 `L`）：

```python
from typing import List

courses: List[str] = ['Python', 'Java', 'Go']
```

同样以冒号（`:`）来声明这个变量，输入 `List` 作为类型，把子类型放在方括号中。

### 元组和集合

声明 `tuple` 和 `set` 的方法也是一样的：

```python
from typing import Tuple, Set

items_t: Tuple[int, ...] = (1, 2, 3)
items_s: Set[int] = {10, 20, 30, 40, 50}
```

这表示：

* 变量 `items_t` 是一个 `tuple`，其中的每个元素都是 `int` 类型。
* 变量 `items_s` 是一个 `set`，其中的每个元素都是 `int` 类型。

至于元组的方括号里面为什么要加 `...`，那是因为不加的话，IDE 会有一个 warning 提示。

### 字典

定义 `dict` 时，需要传入两个子类型，用逗号进行分隔：

* 第一个子类型声明 `dict` 的所有键。
* 第二个子类型声明 `dict` 的所有值：

```python
from typing import Dict

user_info: Dict[str, float] = {'score': 99}
```

这表示：

* 变量 `user_info` 是一个 dict
  * 这个字典的所有键为 `str` 类型
  * 这个字典的所有值为 `float` 类型

## 函数参数与返回值

不仅提供了函数参数的类型提示，也提供了函数返回的类型提示。

* 函数参数类型的定义跟变量类型一样，也是 `变量名: 变量类型`。
* 函数返回的类型则是通过 `->` 来指定。

示例一：

```python
# 以前的写法
def add(a, b):
    """
    这是一个加法运算函数
    :param a: int 加数
    :param b: int 加数
    :return: int 两数相加之和
    """
    return a + b

# 现在的写法（无需在注释里说明参数类型了）
def add(a:int, b:int) -> int:
    """
    这是一个加法运算函数
    :param a: 加数
    :param b: 加数
    :return: 两数相加之和
    """
    return a + b
```

示例二：

```python
from typing import List, Tuple, Set

def foo(p1: List[int], p2: Tuple[int], p3: Set[str]) -> None:
    print(p1)
    print(p2)
    print(p3)
```

## 类作为类型

你也可以将类声明为变量的类型。

假设你有一个名为 `Person` 的类，拥有 `name` 属性：

```python
class Person:
    def __init__(self, name: str):
        self.name = name
```

接下来，你可以将一个变量声明为 `Person` 类型：

```python
def get_person_name(one_person: Person):
    return one_person.name
```

## 总结

如果应用类型提示（Hint）会略微降低写代码的效率，但会显著增加代码的可维护性。

我们在工作中编写的代码，必然在后期会有人来阅读来理解并做修改，那么写过类型提示的代码能够让人很快理解并作出修改，并显著减少调试时间，在这整个过程中实际是省时间的。

这篇文章用到的 `typing` 模块，后面会单独写一篇来展开详解。

（完）
