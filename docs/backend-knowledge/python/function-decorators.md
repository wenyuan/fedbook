# 函数装饰器

函数装饰器（Function Decorators）：从字面上理解，就是装饰一个函数。可以在不修改原代码的情况下，为被装饰的函数添加一些功能并返回它。

函数装饰器的语法是将 `@装饰器名` 放在被装饰函数上面，下面是个例子：

```python
@dec
def func():
    pass
```

## 前置概念

首先需要明确以下几个概念和原则，才能更好的理解装饰器：

* Python 程序是从上往下顺序执行的，碰到函数的定义代码块不会立即执行，只有等到该函数被调用时，才会执行其内部的代码块。
* Python 中函数也是一个对象，而且函数对象可以被赋值给变量，所以，通过变量也能调用该函数。
* 可以将一个函数作为参数传递给另一个函数。

有了这些基本的概念，我们就可以通过一个实例来讲解 Python 中函数装饰器的用法了。

## 模拟场景

模拟一个场景，假设在某项目中，有下列五个接口（f1~f5）：

```python
def f1():
    print("第一个接口......")
def f2():
    print("第二个接口......")
def f3():
    print("第三个接口......")
def f4():
    print("第四个接口......")
def f5():
    print("第五个接口......")
```

现在有个需求，每个接口执行前都需要做用户权限判断。如果逐次修改这五个接口的内部代码显然是一种比较糟糕的方案，我们可以使用装饰器完成这一任务。代码如下：

```python
def outer(func):
    def inner():
        print("权限验证成功")
        return func()
    return inner

@outer
def f1():
    print("第一个接口......")

@outer
def f2():
    print("第二个接口......")

@outer
def f3():
    print("第三个接口......")

@outer
def f4():
    print("第四个接口......")

@outer
def f5():
    print("第五个接口......")
```

使用装饰器 `@outer`，仅需对原接口代码进行拓展，就可以实现操作结束后保存日志，并且无需对原接口代码做任何修改，调用方式也不用变。

## 实现原理

下面以 `f1` 函数为例，对函数装饰器的实现原理进行分析：

```python
def outer(func):
    def inner():
        print("权限验证成功")
        return func()
    return inner

@outer
def f1():
    print("第一个接口......")
```

* Step1：程序开始运行，解释器从上往下逐行运行代码，读到 `def outer(func):` 时，把函数体加载到内存里。
* Step2：读到 `@outer` 时，发现这是个装饰器，按规则 `@outer` 相当于 `outer(f1)`，因此**立即执行 `outer` 函数**。
  * 被装饰的函数（`f1`）会被当作参数传递给装饰函数 `outer`，即形参（`func`）。
* Step3：在 `outer` 函数内部，如果有代码就执行。在这里是直接碰到了一个函数定义 `inner`，将它读入内存中。
* Step4：继续执行直到 return，可以发现返回值是个函数名（`inner`）。按照装饰器的规则这个函数名会指向被装饰的函数 `f1`，也就是 `f1 = inner`。
  * 此时装饰器函数 `outer` 已经执行完毕，造成的结果是 `f1` 函数被新的函数 `inner` 替代了。
* Step5：接下来，当调用方通过 `f1()`（函数名+括号）的方式调用 `f1` 函数时，执行的就不再是旧的 `f1` 函数的代码，而是 `inner` 函数的代码。
  * 在本例中，它会先执行权限验证的代码，然后执行 `func` 函数并将返回值（如果有） return 出去给调用方。这个 `func` 函数就是旧的 `f1` 函数。
  * 通常每个接口都会返回一个类似 `HttpResponse` 的对象，因此这里将`func` 函数的返回值 return 出去是必要的。
  * 这只是个示例，可以换成任何你想要的。
* Step6：最后，调用方可以和以前一样通过 `res = f1()` 的方式接受返回的值。

> 总结就是装饰函数（`outer`）执行完它自己内部的代码后，会将一个闭包函数（`inner`）作为返回值赋值给被装饰的函数（`f1`）。因此被装饰后的 `f1` 已经不是原来的 `f1` 了，这个函数名本质上已经指向 `inner` 函数了。

## 为什么要两层函数

> 我们称 `outer` 函数为装饰器函数，`inner` 为内层的闭包函数。

这里可能会有疑问，为什么我们要搞一个 `outer` 函数和一个 `inner` 函数这么复杂呢？一层函数不行吗？

请看下面的例子，它只有一层函数：

```python
def outer(func):
    print("权限验证成功")
    return func()

@outer
def f1():
    print("第一个接口......")
```

执行上述代码，可以发现我们只是定义好了装饰器，还没有调用 `f1` 函数呢，程序就把工作全做了。

这显然和初衷不符，因为通常我们使用装饰器的目的是为了在不修改原始函数的情况下，给函数添加一些额外的功能，这些功能通常是需要在实际调用被装饰函数之前或之后执行，而不是函数定义时就早早地执行。

那上述代码为什么会这样提前执行？

答：因为对于 `@outer` 这行代码，也相当于是函数调用，在程序执行到这里的时候就会自动执行 `outer` 函数内部的代码。

而如果定义两层函数：

```python
def outer(func):
    def inner():
        print("权限验证成功")
        return func()
    return inner

@outer
def f1():
    print("第一个接口......")
```

在执行 `outer` 函数内部的代码时，会把内层的闭包函数 `inner` 给 return 出来。return 一个函数的名字，只是返回了一个对象而已，只有函数名带有括号和参数才会去执行。也就是只有在调用被装饰后的 `f1` 时（此时 `f1` 函数不是原始的 `f1` 了，被新的函数 `inner` 替代了），`inner` 函数才会被执行。

因此，位于 `inner` 函数之外， `outer` 函数之内的代码会先执行，即使不调用被装饰的 `f1` 函数。如果你有这个有需求也可以利用一下这个特性，就像下面这样：

```python
def outer(func):
    print(1)
    def inner():
        print("权限验证成功")
        return func()
    print(2)
    return inner

@outer
def f1():
    print("第一个接口......")
```

上述代码没有调用被装饰函数 `f1`，就先输出了 `1` 然后输出了 `2`。

## 常用的 @wraps(func) 装饰器

前面提到，当我们使用装饰器来装饰一个函数时，实际上是在运行时将该函数替换为装饰器返回的新函数。这就意味着原函数的一些属性（如 `__name__`，`__doc__`等）会被新函数的对应属性所替代。

例如，如果装饰器返回的新函数的 `__name__` 属性是 `'inner'`，那么被装饰函数的 `__name__` 属性就会变为 `'inner'`，如下代码所示：

```python
def outer(func):
    def inner():
        print("权限验证成功")
        return func()
    return inner

@outer
def f1():
    print("第一个接口......")

print(f1.__name__)  # inner
```

这在某些情况下可能会导致问题，比如当我们想要获取原函数的名字或者文档字符串时，却得到了装饰器中新函数的名字或者文档字符串。为了解决这个问题，我们可以使用 `functools` 模块中的 `wraps` 装饰器。它能够将原函数的元信息拷贝到装饰器函数中，使得装饰器函数具有和原函数一样的元信息。

用法如下：

```python {1,4}
from functools import wraps

def outer(func):
    @wraps(func)
    def inner():
        print("权限验证成功")
        return func()
    return inner

@outer
def f1():
    print("第一个接口......")

print(f1.__name__)  # f1
```

## 被装饰函数的参数传递

上面的例子中，`f1` 函数没有参数，在实际情况中肯定会需要参数的，函数的参数怎么传递的呢？看下面一个例子：

```python
def outer(func):
    def inner(username):
        print("权限验证成功")
        return func(username)
    return inner

@outer
def f1(username):
    print(f"{username} 正在连接第一个接口......")

# 调用方法
f1("zhangsan")
```

在 `inner` 函数的定义部分也加上一个参数，调用 `func` 函数（即装饰后的 `f1` 函数）时传递这个参数就可以了。

可问题又来了，如果 `f2` 函数有 2 个参数，`f3` 函数有 3 个参数，该怎么传递？通过万能参数 `*args` 和 `**kwargs` 就可以了。简单修改一下上面的代码：

```python
def outer(func):
    def inner(*args, **kwargs):
        print("权限验证成功")
        return func(*args, **kwargs)
    return inner

@outer
def f2(username, id):
    print(f"{username}({id}) 正在连接第二个接口......")

# 调用方法
f2("lisi", 14)
```

## 多层装饰器

上面已经介绍了函数装饰器的基本概念和用法，接下来再进一步，一个函数可以被多个函数装饰吗？答案是可以的。看下面的例子：

```python
def outer1(func):
    print("outer1 装饰器已经安装上")
    def inner(*args, **kwargs):
        print("用户已登录")
        result = func(*args, **kwargs)
        print("outer1 装饰的 func 执行完毕")
        return result
    return inner

def outer2(func):
    print("outer2 装饰器已经安装上")
    def inner(*args, **kwargs):
        print("权限验证成功")
        result = func(*args, **kwargs)
        print("outer2 装饰的 func 执行完毕")
        return result
    return inner

@outer1
@outer2
def f2(username, id):
    print(f"{username}({id}) 正在连接第二个接口......")

# 调用方法
f2("lisi", 14)
```

怎么分析多装饰器情况下的代码运行顺序呢？可以将它理解成洋葱模型：每个装饰器一层层包裹住最内部核心的原始函数，执行的时候逐层穿透进入最核心内部，执行完内部最原始的函数后，再反向逐层穿回来。

> + 装饰顺序：就近原则。原始函数在组装装饰器时，是按从下往上的顺序依次装饰。
> + 执行顺序：就远原则。实际调用执行时，装饰器是按从上往下的顺序依次调用执行。

所以，最后的运行结果就显而易见了：

```bash
outer2 装饰器已经安装上
outer1 装饰器已经安装上
用户已登录
权限验证成功
lisi(14) 正在连接第二个接口......
outer2 装饰的 func 执行完毕
outer1 装饰的 func 执行完毕
```

## 装饰器携带参数

装饰器自己可以有参数吗？答案也是可以的。只不过这个时候需要三层函数：

* 最外层的函数（函数名一般是自定义的装饰器名）接收装饰器的参数，并返回中间层函数的名字，通常也会说这个函数返回了一个装饰器，因为中间层函数的作用就是生成装饰器。
* 中间层的函数（函数名一般是 `decorator`，因为它的作用就是生成装饰器）接收被装饰的函数作为参数（形参一般定义为 `func`），并返回最内层函数的名字。
* 最内层的函数（函数名一般是 `wrapper`，因为它的作用就是「包装」被装饰的函数，常见的也有用 `inner` 的）包装被装饰的函数，这个函数在被装饰的函数执行前后添加了一些额外的代码（比如权限验证），然后返回这个包装后的函数。

比如下面的例子，模拟封装一个权限验证的装饰器，应用在需要的接口上：

```python
from functools import wraps

def check_permissions(permission_required):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 这里只是一个示例，实际环境中需要从数据库中获取当前登录用户所拥有的权限列表
            user_permissions = ['read', 'write']

            if permission_required in user_permissions:
                return func(*args, **kwargs)
            else:
                raise PermissionError(f"用户没有 {permission_required} 权限执行此操作")

        return wrapper
    return decorator

@check_permissions('write')
def f1(username):
    print(f"{username} 正在连接第一个接口......")

# 测试
try:
    f1("zhangsan")
except PermissionError as e:
    print(e)
```

运行结果：

```bash
zhangsan 正在连接第一个接口......
```

## 总结

装饰器体现的是设计模式中的装饰模式，实际上，在 Python 中装饰器可以用函数实现，也可以用类实现。我在实际开发中函数装饰器用的比较多，所以本文主要介绍的是函数装饰器。

而如果要对装饰器的用法作更加深入的学习，官方文档和框架源码是比较好的学习对象。

（完）
