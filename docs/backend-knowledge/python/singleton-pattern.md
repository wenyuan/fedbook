# 实现单例模式

单例模式确保某个类**有且仅有一个实例**，而且自行实例化并向整个系统提供这个实例。当我们在程序中的不同位置调用这个类进行实例化，如果类的实例不存在，会创建一个实例；如果已存在就会返回这个实例。

优点：

* 因为单例模式在全局内只有一个实例，因此可以节省比较多的内存空间。
* 全局只有一个接入点，可以更好地进行数据同步控制，避免多重占用。

Python 实现单例模式有三种方式。

## 使用装饰器方式实现

### 函数装饰器方式

```python
def singleton(cls):

    # 创建一个字典用来保存被装饰类的实例对象 _instance = {}
    def _singleton(*args, **kwargs):
        # 判断这个类有没有创建过对象，没有新创建一个，有则返回之前创建的  
        if cls not in _instance:
            _instance[cls] = cls(*args, **kwargs)
        return _instance[cls]
    return _singleton

@singleton
class A(object):
    def __init__(self, a=0):
        self.a = a


a1 = A(1)
a2 = A(2)
# id() 函数可以获取对象的内存地址，同一内存地址即为同一对象
print(id(a1), id(a2))
```

### 类装饰器方式

```python
class Singleton(object):
    def __init__(self, cls):
        self._cls = cls
        self._instance = {}

    def __call__(self):
        if self._cls not in self._instance:
            self._instance[self._cls] = self._cls()
        return self._instance[self._cls]


@Singleton
class B(object):
    def __init__(self):
        pass

b1 = B()
b2 = B()
print(id(b1), id(b2))
```

## 使用类的方式实现

```python
class Singleton(object):
    def __init__(self, *args, **kwargs):
        pass
        
    @classmethod
    def get_instance(cls, *args, **kwargs):
        # hasattr() 函数用于判断对象是否包含对应的属性，这里是看看这个类有没有 _instance 属性  
        if not hasattr(Singleton, '_instance' ):
            Singleton._instance = Singleton(*args, **kwargs)

        return Singleton._instance


s1 = Singleton()  # 使用这种方式创建实例的时候，并不能保证单例 
s2 = Singleton.get_instance()  # 只有使用这种方式创建的时候才可以实现单例 
s3 = Singleton()
s4 = Singleton.get_instance()

print(id(s1), id(s2), id(s3), id(s4))
```

其实这种方式的思路就是，调用类的 `get_instance()` 方法去创建对象，这个方法会判断之前有没有创建过对象，有的话也是会返回之前已经创建的对象，不再新创建。

但是这样有一个弊端，就是在使用类创建 `s3 = Singleton()` 这种方式的时候，就不能保证单例了，也就是说在创建类的时候一定要用类里面规定的 `get_instance()` 方法创建。

再者，当使用多线程时这样也会存在问题，比如下面的代码：

```python
class Singleton(object):
    def __init__(self, *args, **kwargs):
        import time
        time.sleep(1)

    @classmethod
    def get_instance(cls, *args, **kwargs):
        # hasattr() 函数用于判断对象是否包含对应的属性，这里是看看这个类有没有 _instance 属性
        if not hasattr(Singleton, '_instance'):
            Singleton._instance = Singleton(*args, **kwargs)

        return Singleton._instance


def task():
    obj = Singleton.get_instance()
    print(obj)


for i in range(10):
    t = threading.Thread(target=task)
    t.start()
```

程序执行后，打印结果：

```python
<__main__.Singleton object at 0x031014B0>
<__main__.Singleton object at 0x00DA32F0>
<__main__.Singleton object at 0x03101430>
<__main__.Singleton object at 0x03101530>
<__main__.Singleton object at 0x031015B0>
<__main__.Singleton object at 0x031016B0>
<__main__.Singleton object at 0x03101630>
<__main__.Singleton object at 0x03101830>
<__main__.Singleton object at 0x03101730>
<__main__.Singleton object at 0x031017B0>

Process finished with exit code 0
```

如果在 `__init__()` 方法中有一些 IO 操作（此处使用 `time.sleep(1)` 来模拟），就会发现此时并不是同一个实例对象，这是因为在一个对象创建的过程中，会先去获取 `_instance` 属性，判断之前有没有实例对象，因为 IO 耗时操作，当他们判断的时候，还没有对象完成实例化，所以就会调用 `init()` 方法进行实例化，结果就是调用了多次，然后就创建了多个对象。

那要如何解决呢？

答案是加锁，在获取对象属性 `_instance` 的时候加锁，如果已经有人在获取对象了，其他的人如果要获取这个对象，就先等一下，因为前面的那个人，可能在创建对象，就是还没创建完成。

代码如下：

```python
class Singleton(object):
    _instance_lock = threading.Lock()  # 线程锁
    
    def __init__(self, *args, **kwargs):
        import time
        time.sleep(1)

    @classmethod
    def get_instance(cls, *args, **kwargs):
        with Singleton._instance_lock:
            # hasattr() 函数用于判断对象是否包含对应的属性，这里是看看这个类有没有 _instance 属性
            if not hasattr(Singleton, '_instance'):
                Singleton._instance = Singleton(*args, **kwargs)

            return Singleton._instance
```

但是为了保证线程安全，在类内部加入锁机制，又会使加锁部分代码串行执行，速度降低。

## 使用 `__new__()` 函数实现

```python
class Singleton(object):

    def __init__(self):
        print("__init__")

    def __new__(cls, *args, **kwargs):
        print("__new__")
        if not hasattr(Singleton, "_instance" ):
            print("创建新实例")
            Singleton._instance = object.__new__(cls)
        return Singleton._instance


obj1 = Singleton()
obj2 = Singleton()
print(obj1, obj2)
```

当 Python 实例化一个对象时，是先执行类的 `__new__()` 方法，当我们没写 `__new__()` 方法时，默认调用基类 `object` 的 `__new__()` 方法，然后再执行类的 `__init__()` 方法，对这个对象进行初始化。

所以我们可以基于这个，去实现单例模式。我们通过 `hasattr(Singleton, **"_instance"** )`（其中 `hasattr()` 的功能是判断一个对象有没有指定的属性）去判断之前有没有实例化过对象，如果有，就直接返回，没有就新创建一个。

从控制台输出可以看出，同样实现了单例：

```python
__new__
创建新实例
__init__
__new__
__init__
<__main__.Singleton object at 0x7f5350b5bb50> <__main__.Singleton object at 0x7f5350b5bb50>
```

但这样其实有个小问题，看输出其实执行了两遍 `__init__()` 方法，既然是同一个对象，初始化两次，这是不太合理的，我们可以改造一下。

和单例模式的解决思路差不多：定义一个类属性标记（`_first_init`）表示是否第一次执行初始化动作。

```python
class Singleton(object):

    def __init__(self):
        if not hasattr(Singleton, "_first_init"):
            print("__init__")
            Singleton._first_init = True

    def __new__(cls, *args, **kwargs):
        print("__new__")
        if not hasattr(Singleton, "_instance"):
            print("创建新实例")
            Singleton._instance = object.__new__(cls)
        return Singleton._instance


obj1 = Singleton()
obj2 = Singleton()
print(obj1, obj2)
```

输出结果：

```python
__new__
创建新实例
__init__
__new__
<__main__.Singleton object at 0x7f1069f4fb50> <__main__.Singleton object at 0x7f1069f4fb50>
```

而且 `__new__()` 方法是支持多线程的，不需要单独再加线程锁进行规避操作，省时又省力。

（完）
