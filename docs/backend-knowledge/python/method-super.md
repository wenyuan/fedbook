# super() 函数

## super() 的作用

在子类中如果有与父类同名的成员，那就会覆盖（Override）掉父类里的成员。

此时如果想强制调用父类的成员，可以使用 `super()` 函数。这是一个非常重要的函数，最常见的就是通过 `super` 调用父类的实例化方法 `__init__`。

语法：`super(子类名, self).父类方法()`，需要传入的是子类名和 `self`，调用的是父类里的方法，按父类的方法需要传入参数。如下例所示：

```python
class A:
    def __init__(self, name):
        self.name = name
        print("父类的__init__方法被执行了！")
    def show(self):
        print("父类的show方法被执行了！")

class B(A):
    def __init__(self, name, age):
        super(B, self).__init__(name=name)
        self.age = age

    def show(self):
        super(B, self).show()

obj = B("张三", 13)
obj.show()
```

## 多继承中使用 super

其实 `super()` 并不一定调用父类的方法，它是根据类的 MRO 方法搜索顺序来决定调用谁的。真正调用的是 MRO 中的下一个类，而不一定是父类。

```python
class A:
    def show(self):
        print("AAA")
        super().show()


class B:
    def show(self):
        print("BBB")


class C(A, B):
    def show(self):
        print("CCC")
        super().show()

c = C()
c.show()


# 输出结果
CCC
AAA
BBB
```

为什么在 A 类里调用 `super().show()` 后会打印出 B 类里的内容呢？看看 A 类的 MRO：

```python
print(A.__mro__)

# 输出结果
(<class '__main__.A'>, <class 'object'>)
```

当然，这种情况只会出现在多继承。

## 调用父类方法有两种方式

* `super().父类方法()`：注意，只能在 Python 3.x 中使用
* `super(子类名, self).父类方法()`

**重点**：无论使用哪种方法来调用，此时父类方法的 `self` 并不是父类实例对象，**而是子类实例对象**。

```python
class A:
    def show(self):
        print("self in A：id(self) = {0}".format(id(self)))

class B(A):
    def show(self):
        print("self in B：id(self) = {0}".format(id(self)))
        super(B, self).show()

obj = B()
obj.show()

# 输出结果
self in B：id(self) = 139740502242640
self in A：id(self) = 139740502242640
```

（完）
