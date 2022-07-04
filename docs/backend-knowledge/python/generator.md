# 生成器 generator

## 什么是生成器

* 若列表元素可以按照某种算法算出来，就可以在循环的过程中不断推算出后续需要用的元素，而不必创建完整的 list，从而节省大量的空间
* 边循环边计算的机制，叫生成器（generator）

## 最简易生成器

```python
L = [x * x for x in range(10)]
print(L)
print(type(L))

L = (x * x for x in range(10))
print(L)
print(type(L))


# 输出结果
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
<class 'list'>
<generator object <genexpr> at 0x7f55431c1970>
<class 'generator'>
```

只要把一个列表生成式的 `[]` 改成 `()` ，就创建了一个 generator。

## 打印生成器的元素

上面发现直接打印 `L` 得到的是一个生成器对象，而不是直观可见的一个列表。所以有几种方法来访问生成器的每个元素。

### 通过 for 循环遍历

```python
L = (x * x for x in range(10))

for i in L:
    print(i)
```

### next() 方法

可以获取 generator 的下一个元素（目前几乎没用使用过这个）。

```python
L = (x for x in range(10))
print(next(L))
print(next(L))
print(next(L))
print(next(L))
print(next(L))
print(next(L))

# 输出结果
0
1
2
3
4
5
```

generator 能够迭代的关键就是 `next()` 方法，通过重复调用 `next()` 方法，直到捕获一个异常。

### `.__next()__`

```python
L = (x for x in range(10))
print(L.__next__())
print(L.__next__())
print(L.__next__())
print(L.__next__())
print(L.__next__())
print(L.__next__())

# 输出结果
0
1
2
3
4
5
```

## yield 函数

* 带有 `yield` 的函数不再是一个普通函数，而是一个生成器 generator
* `yield` 相当于 `return` 返回一个值，并且记住这个返回值的位置，下次迭代时，代码会从 `yield` 的下一条语句开始执行，直到函数结束或遇到下一个 `yield`。

### 斐波拉契数列

1, 1, 2, 3, 5, 8, 13, 21, 34, ...，除第一个和第二个数外，任意一个数都可由前两个数相加得到。

不用生成器可以这么实现：

```python
# 斐波拉契数列
res = []
def fib(max):
    n, a, b = 0, 0, 1
    while n < max:
        res.append(b)
        a, b = b, a + b
        n = n + 1

fib(8)
print(res)


# 输出结果
[1, 1, 2, 3, 5, 8, 13, 21]
```

因为知道第一个元素值，就可以推算后面的任意个元素了，所以可以使用生成器来实现：

```python
def fib(max):
    n, a, b = 0, 0, 1
    while n < max:
        yield b
        a, b = b, a + b
        n = n + 1

res = fib(8)
for i in res:
	print(i)


# 输出结果
1
1
2
3
5
8
13
21
```

## 生成器的执行流程

* 普通函数是顺序执行，遇到 `return` 或者最后一行执行完就返回。
* 生成器的执行流程是
  * 每次调用 `next()` 或 `for` 循环的时候执行，遇到 `yield` 就返回
  * 一个生成器里面可以有多个 `yield`
  * 再次执行时从上次返回的 `yield` 语句处继续执行

```python
# 执行流程
def odd():
    print('step 1')
    yield 1
    print('step 2')
    yield 3
    print('step 3')
    yield 5

L = odd()
for i in L:
    print(i)


# 输出结果
step 1
1
step 2
3
step 3
5
```

## 生成器的工作原理

* 它是在 for 循环过程中不断计算下一个元素，并在适当的条件结束 for 循环。
* 对于函数改成的 generator 来说，遇到 `return` 语句或者执行到函数最后一行时，就是结束 generator 的指令，`for` 循环随之结束。

## 生成器的优点

在不牺牲过多速度情况下，释放了内存，支持大数据量的操作。

可以运行下面两种写法的代码，观察电脑内存的变化。

不使用生成器：

```python
from tqdm import tqdm

res = []
for i in tqdm(range(10000000)):
    temp = ['你好'] * 2000
    res.append(temp)

for ele in res:
    continue
```

使用生成器：

```python
def test():
    for i in tqdm(range(10000000)):
        temp = ['你好'] * 2000
        yield temp

res = test()
for ele in res:
    continue
```

## 生成器的应用场景

需要处理大数据量的场景，比如一个文件有几百万行数据，或者有几百万个文件需要分别读取处理。

（完）
