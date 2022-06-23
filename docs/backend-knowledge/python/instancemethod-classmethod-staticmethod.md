# 实例方法、类方法、静态方法

Python 的类中包含实例方法、类方法、静态方法三种方法。这些方法无论是在代码编排中还是内存中都归属于类，区别在于传入的参数和调用方式不同。

## 实例方法

### 定义方式

* 至少要包含一个 `self` 参数，且为第一个参数，用于绑定调用此方法的实例对象（Python 会自动完成绑定）
* `self` 代表的是类的实例，而非类本身

注意：`self` 不是关键字，而是 Python 约定成俗的命名，可以取别的名字，但一般不建议这么做。

### 调用方式

实例方法通常会用实例对象直接调用。

```python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    # 定义实例方法
    def print_age(self):
        print('%s: %s' % (self.name, self.age))


# 调用实例方法
p1 = Student("张三", 13)
p2 = Student("李四", 14)

p1.print_age()
p2.print_age()
```

Python 也支持通过类名调用实例方法，但需要手动给 `self` 参数传实例对象。

```python
p1 = Student("张三", 13)

Student.print_age(p1)  # 假设不传实例对象，PyCharm 会有 warning
```

### 使用场景

如果一个方法内部**既需要**访问实例属性，**又需要**访问类属性，那应该定义为实例方法。

因为可以通过 `类对象.类属性` 来访问，但在类方法中无法访问实例属性（下面马上就会举例）。

## 类方法

### 定义方式

* 采用 `@classmethod` 装饰
* 至少传入一个 `cls`（代指类本身，类似 `self`）参数。执行类方法时，自动将调用该方法的类赋值给 `cls`

### 调用方式

类方法由类调用，虽然也可以使用 `实例名.类方法` 的方式调用，但**建议只使用 `类名.类方法` 的调用方式**。

在调用类方法时，无需显式为 `cls` 参数传参，并且它指向的不是实例对象，而是类对象本身。

```python
class Foo:
    @classmethod
    def class_func(cls):
        pass

Foo.class_func()
```

#### 拓展1：类方法可以调用实例方法吗？

答案是可以，但有局限性：

```python
class Foo:
    # 类变量
    name = '你的名字'

    def __init__(self, name):
        self.name = name

    # 实例方法
    def func(self):
        print('self id is：', id(self))
        print('self.name：', self.name)

    # 类方法, 添加装饰器
    @classmethod
    def class_func(cls):
        print('cls id is：', id(cls))
        print('cls.name：', cls.name)
        # 调用实例方法
        cls.func(cls)

Foo.class_func()

# 输出结果
cls id is： 140598048392416
cls.name： 你的名字
self id is： 140598048392416
self.name： 你的名字
```

* 类方法调用实例方法的方式：`cls.实例方法(cls)`，通过 `cls` 调用，且还要传递 `cls` 为参数
* 从 `id` 相同即可看出，实例方法接收的**仍然是一个类对象**

#### 拓展2：实例对象可以调用类方法吗？

答案是可以，但不建议：

```python
# 类的定义和上面一样，此处省略

foo = Foo('你好，世界')
foo.class_func()

# 输出结果
cls id is： 140500829788000
cls.name： 你的名字
self id is： 140500829788000
self.name： 你的名字
```

* `foo` 是一个实例对象，且初始化赋值了 `name` 实例变量
* 但最后实例方法打印的仍然是 `name` 类变量，表明类方法无法访问实例变量
* 且 `cls`、`self` 参数的 `id` 和上面的例子完全一样，表明即使通过实例对象调用类方法，**传递的仍然是类对象的引用，所有类方法都被同一个类对象调用，一个类只有一个类对象**

#### 拓展3：实例方法可以调用类变量吗？

答案是可以，但不能通过实例对象调用，只能通过类对象：

```python
class Foo:
    # 类变量
    name = '你的名字'

    def __init__(self, name):
        self.name = name

    # 实例方法
    def func(self):
        # 错误用法，会报错
        # print(name)
    
        # 访问的仍然是实例变量
        print(self.name)
    
        # 通过类名访问类变量
        print(Foo.name)

foo = Foo('你好，世界')
foo.func()

# 输出结果
你好，世界
你的名字
```

### 使用场景

假设有个方法，在逻辑上采用类本身作为对象来调用更合理，那么这个方法就可以定义为类方法。另外，如果这个方法需要被子类继承，也可以定义为类方法。

比如一个学生类，我们要获得学生总数，以及对学生总数进行加减，那就可以定义成类方法。因为没有必要特地实例化出一个具体的学生，再从这个学生上获得班级总人数。

## 静态方法

### 定义方式

* 和普通的 Python 函数定义方式一模一样，**唯一区别是**：静态方法需要定义在类体中，并且采用 `@staticmethod` 装饰
* 静态方法没有 `self`、`cls` 参数，也不需要至少传一个参数，和普通函数一样
* Python 解释器**不会对它包含的参数做任何类或对象的绑定**，所以静态方法无法调用任何类属性、类方法、实例属性、实例方法，除非通过类名和实例对象

### 调用方式

静态方法由类调用，无默认参数。它属于类，和实例无关。**建议只使用 `类名.静态方法` 的调用方式**。（虽然也可以使用 `实例名.静态方法` 的方式调用）

```python
class Foo:
    @staticmethod
    def static_method():
        pass

# 调用方法
Foo.static_method()
```

### 使用场景

静态方法主要是用来存放逻辑性的代码，逻辑上属于类，但是和类本身没有关系，它不会涉及到类中的属性和方法的操作。也就是说，**静态方法是个独立的、单纯的函数，它仅仅托管于某个类的名称空间中，便于使用和维护**。你完全可以在类外面写一个同样的函数来做这些事，只不过因为只有这个类在使用它，其它地方都没有用到它，单独放外面显得多余。

比如某个类专用的工具函数，就适合定义成类的静态方法，因为它：

* 既不需要访问实例变量、实例方法
* 也不需要访问类变量、类方法

## 总结一下

关于实例方法、类方法和静态方法的实际应用场景，简单来说：

* **实例方法**：方法内部需要访问实例属性、实例方法就定义为实例方法；既需要访问实例属性、方法，也需要访问类属性、方法，那必须定义为实例方法
* **类方法**：方法内部只需要访问类属性、类方法就定义为类方法
* **静态方法**：方法内部既不需要访问实例属性、实例方法，也不需要访问类属性、类方法就定义为静态方法

下面是一个综合例子：

```python
class Foo: 

    def __init__(self, name):
        self.name = name 

    def ord_func(self):
        """定义实例方法，至少有一个 self 参数 """
        print('实例方法')

    @classmethod
    def class_func(cls):
        """ 定义类方法，至少有一个 cls 参数 """
        print('类方法')

    @staticmethod
    def static_func():
        """ 定义静态方法 ，无默认参数"""
        print('静态方法') 

# 调用实例方法
f = Foo("zhangsan")
f.ord_func()

# 调用类方法
Foo.class_func()

# 调用静态方法
Foo.static_func()
```

## 参考文档

* [Python 中的 classmethod 和 staticmethod 有什么具体用途](https://www.zhihu.com/question/20021164)

（完）
