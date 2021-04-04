# 类和实例

## 1. 类和实例

类是抽象的模板，用来描述具有相同属性和方法的对象的集合；实例是根据类创建出来的一个个具体的「对象」，每个对象都拥有相同的方法，但各自的数据可能不同。

Python 使用 `class` 关键字来定义类，类名通常采用大驼峰式命名方式。

Python 采用多继承机制，一个类可以同时继承多个父类（也叫基类、超类），继承的基类有先后顺序，写在类名后的圆括号里。继承的父类列表可以为空，此时的圆括号可以省略。但在 Python3 中，即使没有显式继承任何父类，也会默认继承 `object` 类。

因为，`object` 是 Python3 中所有类的基类。

下面是一个学生类：

```python
class Student:
    classroom = '101'
    address = 'beijing' 

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def print_age(self):
        print('%s: %s' % (self.name, self.age))
```

可以通过调用类的实例化方法（构造函数）来创建一个类的实例。

默认情况下，使用类似 `obj = Student()` 的方式就可以生成一个类的实例。但是，通常每个类的实例都会有自己的实例变量，例如这里的 `name` 和 `age`，为了在实例化的时候体现实例的不同，Python 提供了一个实例化机制，任何一个类中，名字为 `__init__` 的方法就是类的实例化方法，该方法会在类实例化的时候，自动调用，并传递对应的参数。

比如：

```python
p1 = Student("张三", 13)
p2 = Student("李四", 14)
```

## 2. 类变量和实例变量

### 2.1 类变量

定义在类中，方法之外的变量，称作类变量。类变量是所有实例公有的变量，每一个实例都可以访问、修改类变量。

在上述 `Student` 类中，`classroom` 和 `address` 两个变量就是类变量。可以通过类名或者实例名加圆点的方式访问类变量，比如：

```python
Student.classroom
Student.address
```

也可以使用实例变量去访问类变量，此时实例会先在自己的实例变量列表里查找是否有这个实例变量，如果没有，那么它就会去类变量列表里找，如果还没有，弹出异常。

不过，为了防止发生一些混淆情况，**对于类变量，最好只使用 `类名.类变量` 的访问方式，不要用实例去访问类变量**。

Python 动态语言的特点，让我们也可以给实例添加新的实例变量，给类添加新的类变量和方法，或给已有的变量或方法重新赋值。

### 2.2 实例变量

实例变量指的是实例本身拥有的变量。每个实例的变量在内存中都不一样。`Student` 类中 `__init__` 方法里的 `name` 和 `age` 就是两个实例变量。通过实例名加圆点的方式调用实例变量。


## 3. 类的方法

Python 的类中包含实例方法、静态方法和类方法三种方法。这些方法无论是在代码编排中还是内存中都归属于类，区别在于传入的参数和调用方式不同。

### 3.1 实例方法

类的实例方法由实例调用，至少包含一个 `self` 参数，且为第一个参数。执行实例方法时，会自动将调用该方法的实例赋值给 `self`。`self` 代表的是类的实例，而非类本身。

`self` 不是关键字，而是 Python 约定成俗的命名，可以取别的名字，但一般不建议这么做。

例如，前面 `Student` 类中的 `print_age()` 就是实例方法：

```python
def print_age(self):
        print('%s: %s' % (self.name, self.age))

# 调用方法
p1.print_age()
p2.print_age()
```

### 3.2 静态方法

静态方法由类调用，无默认参数。将实例方法参数中的 `self` 去掉，然后在方法定义上方加上 `@staticmethod`，就成为静态方法。它属于类，和实例无关。**建议只使用 `类名.静态方法` 的调用方式**。（虽然也可以使用 `实例名.静态方法` 的方式调用）

```python
class Foo:
    @staticmethod
    def static_method():
        pass

# 调用方法
Foo.static_method()
```

### 3.3 类方法

类方法由类调用，采用 `@classmethod` 装饰，至少传入一个 `cls`（代指类本身，类似 `self`）参数。执行类方法时，自动将调用该方法的类赋值给 `cls`。**建议只使用 `类名.类方法` 的调用方式**。（虽然也可以使用 `实例名.类方法` 的方式调用）

```python
class Foo:
    @classmethod
    def class_method(cls):
        pass

Foo.class_method()
```

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

（完）
