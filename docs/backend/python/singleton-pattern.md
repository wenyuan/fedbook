# 实现单例模式

单例模式确保某个类**有且仅有一个实例**，而且自行实例化并向整个系统提供这个实例。当我们在程序中的不同位置调用这个类进行实例化，如果类的实例不存在，会创建一个实例；如果已存在就会返回这个实例。

优点：

+ 因为单例模式在全局内只有一个实例，因此可以节省比较多的内存空间。
+全局只有一个接入点，可以更好地进行数据同步控制，避免多重占用。

Python 实现单例模式有五种方式。

## 使用模块

模块在 Python 中天然就是单例的，即使是在多线程环境下也是如此。因为模块只会被加载一次，加载之后，其他脚本里如果使用 `import` 二次加载这个模块时，会从 `sys.modules` 里找到已经加载好的模块。

因此可以在一个模块中创建一个对象，然后在其他地方导入这个模块来使用这个对象。

编写脚本 `my_singleton.py`：

```python
class Singleton():
    def __init__(self, name):
        self.name = name

    def do_something(self):
        pass


singleton = Singleton('模块单例')
```

在其他脚本里：

```python
from my_singleton import singleton
```

在任何引用 `singleton` 的脚本里，`singleton` 都是同一个对象，这就确保了系统中只有一个 `Singleton` 的实例。

这种方法是官方所推荐的，它简单，代码编写容易，不需要考虑多线程的问题。只要别恶意搞破坏：比如在其他脚本里，故意主动的创建 `Singleton` 的实例对象。

## 使用装饰器方式实现

### 函数装饰器方式

编写一个单例模式的装饰器，来装饰那些需要支持单例的类：

```python
import threading
import time


def singleton(cls):
    # 创建一个字典用来保存被装饰类的实例对象
    _instance = {}
    # 使用线程锁来确保在同一时间只有一个线程能够访问创建实例的代码段
    _lock = threading.Lock()

    def wrapper(*args, **kwargs):
        # 初次检查：如果已经有一个实例存在，则可以直接返回这个实例（减少了获取锁的开销）
        if cls not in _instance:
            with _lock:
                # 二次检查：在锁的内部再次检查实例是否存在，不存在就创建（解决多线程问题）
                if cls not in _instance:
                    _instance[cls] = cls(*args, **kwargs)
        return _instance[cls]

    return wrapper


@singleton
class MyObject(object):
    def __init__(self, *args, **kwargs):
        # 添加延迟，模拟线程不安全的情况，实际的生产环境中不要加
        time.sleep(0.1)
        # 一些初始化操作
        # ...


if __name__ == '__main__':
    # --- 测试代码 ---
    def task():
        obj = MyObject(1)
        print(f"id: {id(obj)}")

    for i in range(10):
        t = threading.Thread(target=task)
        t.start()
```

上述代码有两个重要点：

+ 线程锁：
  + 如果多个线程几乎同时到达 `if cls not in _instance:` 这一行，它们都可能判断出没有实例存在，然后都试图去创建一个新的实例，这就违反了单例模式的原则。
  + 因此需要在创建实例之前获取锁，确保同一时间只有一个线程能够创建实例。这就是 `with _lock:` 这一行的作用。
  + 注意为了保证线程安全，在类内部加入锁机制，会使加锁部分代码串行执行，速度降低。
+ 双重检查锁定：
  + 第一次检查是为了在已经有实例存在的情况下，减少获取锁的开销。
  + 第二次检查是为了解决多线程下的安全问题。

**接下来实现单例模式的其它方式中，都将沿用这两个思想**。

### 类装饰器方式

```python
import threading
import time


class Singleton(object):
    _lock = threading.Lock()

    def __init__(self, cls):
        self._cls = cls
        self._instance = {}

    def __call__(self, *args, **kwargs):
        if self._cls not in self._instance:
            with Singleton._lock:
                if self._cls not in self._instance:
                    self._instance[self._cls] = self._cls(*args, **kwargs)
        return self._instance[self._cls]


@Singleton
class MyObject(object):
    def __init__(self, *args, **kwargs):
        # 添加延迟，模拟线程不安全的情况，实际的生产环境中不要加
        time.sleep(0.1)
        # 一些初始化操作
        # ...


if __name__ == '__main__':
    # --- 测试代码 ---
    def task():
        obj = MyObject(1)
        print(f"id: {id(obj)}")

    for i in range(10):
        t = threading.Thread(target=task)
        t.start()
```

上述代码的注意点在于：在 `MyObject` 的 `__init__` 方法中接收了 `*args` 和 `**kwargs` 参数，因此 `Singleton` 类的 `__call__` 方法也需要添加对参数的支持，并且在调用 `self._cls()` 时传入这些参数。

## 使用类的方式实现

```python
import threading
import time


class MyObject(object):
    _single_lock = threading.Lock()
    _single_instance = None

    def __init__(self, *args, **kwargs):
        # 一些初始化操作
        # ...
        pass

    @classmethod
    def get_instance(cls, *args, **kwargs):
        # 添加延迟，模拟线程不安全的情况，实际的生产环境中不要加
        time.sleep(0.1)
        # 使用 cls 变量代替硬编码的类名，
        # 这样凡是继承当前类的子类，都可以使用这个单例模式的实现，而不需要重新实现当前方法
        if cls._single_instance is None:
            with cls._single_lock:
                if cls._single_instance is None:
                    cls._single_instance = cls(*args, **kwargs)

        return cls._single_instance


if __name__ == '__main__':
    # --- 测试代码 ---
    def task():
        obj = MyObject.get_instance(1)
        print(f"id: {id(obj)}")

    for i in range(10):
        t = threading.Thread(target=task)
        t.start()
```

其实这种方式的思路就是，调用类的 `get_instance()` 方法去创建对象，这个方法会判断之前有没有创建过对象，有的话也是会返回之前已经创建的对象，不再新创建。

但是这样有一个弊端，就是在使用类创建 `obj = MyObject()` 这种方式的时候，就不能保证单例了，也就是说在创建类的时候一定要用类里面规定的 `get_instance()` 方法。

## 使用 `__new__()` 函数实现

```python
import threading
import time


class MyObject(object):
    _single_lock = threading.Lock()
    _single_instance = None
    _has_initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._single_instance is None:
            with cls._single_lock:
                if cls._single_instance is None:
                    # 添加延迟，模拟线程不安全的情况，实际的生产环境中不要加
                    time.sleep(0.1)
                    cls._single_instance = super().__new__(cls)
        return cls._single_instance

    def __init__(self, *args, **kwargs):
        if not self._has_initialized:
            with self._single_lock:
                if not self._has_initialized:
                    # 一些初始化操作
                    # ...
                    self._has_initialized = True


if __name__ == '__main__':
    # --- 测试代码 ---
    def task():
        obj = MyObject(1)
        print(f"id: {id(obj)}")

    for i in range(10):
        t = threading.Thread(target=task)
        t.start()
```

在 Python 中，当创建一个新的对象实例时，Python 首先会调用 `__new__()` 方法来创建实例（没写 `__new__()` 方法时默认调用基类 `object` 的 `__new__()` 方法），然后再调用 `__init__()` 方法来初始化这个实例。

所以可以基于这个去实现单例模式：在创建实例前去判断之前有没有实例化过对象，如果有就直接返回，没有就新创建一个。

值得一提的是，在对象的生命周期中，这两个方法并不是原子的，它们是两个独立的步骤，先执行 `__new__()`，然后执行 `__init__()`，在这两个步骤之间，其他的操作是可以插入的。

因此上面的代码中用到了**两次线程锁**和**两次双重检查锁定**，各自的作用如下：

+ 在 `__new__` 方法中：
  + 线程锁用来保护 `_single_instance` 变量，防止在等待获取锁的过程中，其他线程已经创建了实例吗，从而重复创建实例，违反单例模式的原则。
  + 双重检查锁定用于确保单例对象只被创建一次。
+ 在 `__init__` 方法中：
  + 线程锁用来保护 `_has_initialized` 变量，防止在等待获取锁的过程中，其他线程已经完成了初始化，从而重复执行初始化逻辑，引发一些不必要的问题。
  + 双重检查锁定用于确保单例对象只被初始化一次。

## 使用元类

在上述所有实现单例模式的方法中，基于元类的实现可能是最难理解的一个。

在 Python 中，`type` 和 `object` 是两个特殊的内置类：

+ `type` 是所有类的元类，包括它自身。
  + 当创建一个类并让它继承自 `type` 时，实际上是在创建一个元类。
  + 元类是用来创建类的类，**元类的实例是类，而不是普通的对象**。
  + 在下面的例子中，`SingletonType` 是一个元类。
+ `object` 是所有类和实例的基类。
  + 当创建一个类并让它继承自 `object` 时，创建的是一个普通的类。
  + **类的实例是普通的对象**，而不是类。

> 元类是一个高级特性，通常只在构建复杂的库或框架时使用。在大多数情况下并不需要直接使用元类。

下面使用更多的注释来解释代码的含义：

```python
import threading
import time


class SingletonType(type):
    _single_lock = threading.Lock()

    # __call__ 方法可以让类的实例像函数一样去调用
    # 下面的 MyObject 继承了 SingletonType 这个元类，那么 MyObject 就是元类 SingletonType 通过 __new__ 构造出来的实例
    # 当实例 MyObject 调用 Singleton() 时，就是在调用元类SingletonType 的 __call__ 方法
    # 在 __call__ 方法里，cls 就是下面的类 MyObject
    def __call__(cls, *args, **kwargs):
        with SingletonType._single_lock:
            if not hasattr(cls, "_instance"):
                # 创建 cls 的对象
                # 使用 super 来调用 __call__ 方法，而不能直接写成 cls(*args, **kwargs)，这样等于又把 SingletonType 的 __call__ 方法调用了一次，会形成死循环
                cls._instance = super(SingletonType, cls).__call__(*args, **kwargs)

        return cls._instance


# 在定义类时通过 metaclass 关键字参数来指定元类
# 当创建 MyObject 的一个实例时，SingletonType 元类中的方法（例如 __new__ 和 __init__）会被调用，从而允许我们控制 MyObject 的创建过程
class MyObject(metaclass=SingletonType):
    def __init__(self, *args, **kwargs):
        # 添加延迟，模拟线程不安全的情况，实际的生产环境中不要加
        time.sleep(0.1)
        # 一些初始化操作
        # ...


if __name__ == '__main__':
    # --- 测试代码 ---
    def task():
        obj = MyObject(1)
        print(f"id: {id(obj)}")

    for i in range(10):
        t = threading.Thread(target=task)
        t.start()
```

## 总结

上述五种方法都可以实现多线程环境下的安全的单例模式，但是具体哪个最好取决于需求和使用场景。

+ 考虑降低代码复杂性：使用模块或函数装饰器来实现单例无疑是最好的选择。
+ 考虑灵活性：例如希望能够在运行时改变单例的实例，那么可能需要使用 `__new__` 方法或元类，但是它们的代码也更复杂。
+ 考虑性能：使用模块或 `__new__` 方法，这两种方法的性能通常比使用装饰器或元类要好。

（完）
