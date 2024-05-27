# 迭代器 Iterator

## 前置知识

### 可迭代对象（Iterable）

可以直接用 for 循环来**遍历**的对象都叫可迭代对象，在 Python 中，list/tuple/string/dict/set/bytes 都是可以迭代的数据类型。

可以通过 `collections` 模块的 Iterable 类型来判断一个对象是否可迭代：

```python
from collections.abc import Iterable

print(isinstance([1, 2, 3, 4, 5], Iterable))
print(isinstance({"a": 1}, Iterable))
print(isinstance({"test"}, Iterable))
print(isinstance(1234, Iterable))


# 输出结果
True
True
True
False
```

### 生成器（generator）

它可以用 for 循环拿到下一个值，也可以用 `.next()` 函数来拿到下一个值。

## 什么是迭代器

迭代器是一种可以被遍历的对象，但只能往后遍历不能回溯，不像列表，你随时可以取后面的数据，也可以返回头取前面的数据。

迭代器通常要实现两个基本的方法：`iter()` 和 `next()`。

很多时候，为了让我们自己写的类成为一个迭代器，需要在类里实现 `__iter__()` 和 `__next__()` 方法。

### 判断是不是迭代器

可以使用 `isinstance()` 判断一个对象是否是 Iterator 对象。

```python
from collections.abc import Iterator

print(isinstance([], Iterator))      # False
print(isinstance({}, Iterator))      # False
print(isinstance("test", Iterator))  # False
print(isinstance(1234, Iterator))    # False
print(isinstance([x for x in range(2)], Iterator))  # False
print(isinstance((x for x in range(2)), Iterator))  # True
print(isinstance(enumerate([]), Iterator))          # True
```

生成器都是 Iterator 对象，但 list、dict、str 虽然是 Iterable，却不是 Iterator。

### `iter()` 函数

这个函数可以把 list、dict、str 等 Iterable 变成 Iterator

```python
from collections.abc import Iterator

print(isinstance(iter([]), Iterator))      # True
print(isinstance(iter({}), Iterator))      # True
print(isinstance(iter("test"), Iterator))  # True
print(isinstance(iter([x for x in range(2)]), Iterator))  # True
```

### `next()` 函数

Python 的迭代器对象（Iterator）表示的是一个数据流，它可以被 `next()` 函数调用并不断返回下一个数据，直到没有数据时抛出 `StopIteration` 错误。可以把这个数据流看做是一个有序序列，但我们却不能提前知道序列的长度，只能不断通过 `next()` 函数实现按需计算下一个数据，所以 Iterator 的计算是惰性的，只有在需要返回下一个数据时它才会计算。

```python
# 首先获得 Iterator 对象
it = iter([1, 2, 3, 4, 5])
# 循环
while True:
    try:
        # 获得下一个值:
        x = next(it)
        print(x)
    except StopIteration:
        # 遇到 StopIteration 就退出循环
        break


# 输出结果
1
2
3
4
5
```

或者使用 for 循环遍历迭代器：

```python
# 创建迭代器对象
it = iter([1, 2, 3, 4, 5])
# 使用for循环遍历迭代对象
for x in it:
    print(x)


# 输出结果
1
2
3
4
5
```

## 迭代器和可迭代的区别：

* 凡是可作用于 for 循环的对象都是可迭代类型（Iterable）。
* 凡是可作用于 `next()` 函数的对象都是迭代器类型（Iterator）。
* list、dict、str 等是可迭代的但不是迭代器，因为 `next()` 函数无法调用它们。可以通过 `iter()` 函数将它们转换成迭代器。
* Python 的 for 循环本质上就是通过不断调用 `next()` 函数实现的。
* 迭代器可以表示一个无限大的数据流，例如全体自然数。而使用 list 是永远不可能存储全体自然数的。

（完）
