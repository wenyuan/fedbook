# 类成员保护

在 JAVA 语言中，有 `private` 关键字，可以将类的某些变量和方法设为私有，阻止外部访问。但是 Python 没有这个机制。

在 Python 中，如果要让内部成员不被外部访问，可以利用变量和方法名字的变化：在成员的名字前加上两个下划线 `__`，这个成员就变成了一个私有成员（private）。私有成员只能在类的内部访问，外部无法访问。

## 1. 设置私有成员

如下所示，在 `Student` 类中，`title` 可以在外部访问；而 `__name` 和 `__age` 由于加了两个下划线，已经变成了私有成员，只能在类的内部访问，外部访问时会报错。

```python
class Student:
    title = "学生"

    def __init__(self, name, age):
        self.__name = name
        self.__age = age

    def print_age(self):
        print('%s: %s' % (self.__name, self.__age))

obj = Student("zhangsan", 13)
print(obj.title)
print(obj.__name) # 这里会报错
```

## 2. 外部访问和修改私有成员

如果要在外部访问和修改类的私有成员，可以通过在类的内部创建 get 和 set 方法。这种设计思想在很多编程语言中都很常见。

如下代码所示：

```python
class Student:
    title = "学生"

    def __init__(self, name, age):
        self.__name = name
        self.__age = age

    def print_age(self):
        print('%s: %s' % (self.__name, self.__age))

    def get_name(self):
        return self.__name

    def get_age(self):
        return self.__age

    def set_name(self, name):
        self.__name = name

    def set_age(self, age):
        self.__age = age

obj = Student("zhangsan", 13)
obj.get_name()
obj.set_name("lisi")
```

这样做，不但对数据进行了保护的同时也提供了外部访问的接口，而且在 `get_name`，`set_name` 这些方法中，可以额外添加对数据进行检测、处理、加工、包裹等等各种操作。

比如下面这个方法，会在设置年龄之前对参数进行检测，如果参数不是一个整数类型，则抛出异常。

```python
def set_age(self, age):
    if isinstance(age, int):
        self.__age = age
    else:
        raise ValueError
```

## 3. 私有成员的原理

为什么以双下划线开头的数据成员就不能从外部访问了呢？

以上面的代码为例，从内部机制原理讲，外部不能直接访问 `__age` 是因为 Python 解释器对外把 `__age` 变量改成了 `_Student__age` ，也就是 `_类名__age`（类名前是一个下划线）。因此，投机取巧的话，你可以通过 `_Student__age` 在类的外部访问 `__age` 变量。

知道了这样一个原理，我们就要规避这样一个问题：

```python
obj = Student("zhangsan", 13)
obj.__name = "lisi" # 注意这一行
```

注意上面第二行，千万不要写这样的代码，因为这相当于给 `obj` 实例添加了一个新的实例变量 `__name`，而不是对原有私有成员 `__name` 重新赋值。

## 4. 类的成员与下划线总结

* `_name`、`_name_`、`_name__`：建议性的私有成员，不要在外部访问。
* `__name`、 `__name_`：强制的私有成员，但是你依然可以蛮横地在外部危险访问。
* `__name__`：特殊成员，与私有性质无关，尽量不要给自定义的成员这样命名，它们都是 Python 中具有特殊意义的魔法方法名。例如 `__doc__`。
* `name_`、`name__`：没有任何特殊性，普通的标识符，但最好不要这么起名。

（完）
