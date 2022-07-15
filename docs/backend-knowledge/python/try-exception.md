# 错误和异常

异常有很多种类型，Python 内置了几十种常见的异常，就在 builtins 模块内，无需特别导入，直接就可使用。需要注意的是，所有的异常都是异常类，首字母是大写的。

为了保证程序的正常运行，提高程序健壮性和可用性。我们应当尽量考虑全面，将可能出现的异常进行处理，而不是留在那里，任由其发生。

## Python 中处理异常

### 基本语法

Python 内置了一套 try...except 的异常处理机制，来帮助我们进行异常处理。其基本语法是：

```python
try:
    ...
except AttributeError as e:
    ...
except ValueError as e:
    ...
```

其工作顺序是：

* 首先，执行 `try` 子句。
* 如果没有异常发生，则不执行 `except` 里面的代码，并执行 `try` 里面剩下的代码。
* 如果在执行 `try` 里面代码时发生了异常，则不再执行剩下代码：
  * 如果抛出异常的类型和 `except` 的异常类匹配，则执行 `except` 里面的代码。
  * 如果抛出的异常没有被 `except` 的异常类匹配上，则直接抛出原生异常，在控制台打印。

### 多个 except 和 else

为了更精准的捕获异常并做出恰当的处理，一般会编写多个 except 和 else：

```python
import sys

try:
    ...
except OSError as e:
    ...
except ValueError as e:
    ...
except:
    print("Unexpected error:", sys.exc_info()[0])
    raise
else:
    print("没异常才执行")
```

* 最后一个 `except` 不指定异常类时，可以作为通配符，若前面所有异常类都没有匹配上，则会自动匹配这个 `except` ，并执行里面代码，注意：最好要 `raise` 一下，否则不知道异常是什么。
* 如果写 `else` 必须放在所有 `except` 后面。
* `else` 的作用：当 `try` 里面的代码没有异常时就执行 `else` 里面的代码，可以理解成：`try` 里面写有可能发生异常的代码块，而 `else` 里面写若无异常则正常执行的代码块。

### finally

finally 里面的代码块，无论是否报异常都会执行：

```python
import sys

try:
    ...
except OSError as e:
    ...
except ValueError as e:
    ...
except:
    print("Unexpected error:", sys.exc_info()[0])
    raise
else:
    print("没异常才执行")
finally:
    print("无论是否报异常都会执行")
```

finally 的作用：一般写清理关闭操作，如关闭文件、关闭数据库连接等等。

执行顺序：

* 若没有 break、continue、return、异常，执行顺序是：try -> else -> finally
* try 里面有 break、continue、return，在执行 break、continue、return 前也得执行 finally 代码块，且不执行 else 代码块。
* 若 try 和 finally 里面都有 return ，则优先执行 finally 的 return。

## 通用异常：Exception

在 Python 的异常中，有一个通用异常：`Exception`，它可以捕获任意异常。

```python
try:
    ...
except Exception as e:
    print('错误')
```

* 所有内置的非系统退出类异常都继承自此类
* 所有自定义异常类都应该继承此类

## 常见异常类

Python 内置了很多的异常类，并且这些类都是从 `BaseException` 类派生的。

下面是一些常见异常类，在见到大多数异常的时候根据它们就能快速准确地判断异常类型：

| 异常名               | 解释                      |
|:------------------|:------------------------|
| AttributeError    | 试图访问一个对象没有的属性           |
| IOError           | 输入/输出异常                 |
| ImportError       | 无法引入模块或包；多是路径问题或名称错误    |
| IndentationError  | 缩进错误                    |
| IndexError        | 下标索引错误                  |
| KeyError          | 试图访问不存在的键               |
| KeyboardInterrupt | Ctrl+C 被按下，键盘终止输入       |
| NameError         | 使用未定义的变量                |
| SyntaxError       | 语法错误                    |
| TypeError         | 传入对象的类型与要求的不符合          |
| UnboundLocalError | 试图访问一个还未被设置的局部变量        |
| ValueError        | 传入一个调用者不期望的值，即使值的类型是正确的 |
| OSError           | 操作系统执行错误                |

## 自定义异常

大多数情况下，内置异常已经够用了，但是有时候你还是需要自定义一些异常。自定义异常应该继承 `Exception` 类，直接继承或者间接继承都可以，例如：

```python
class MyException(Exception):

    def __init__(self, message):
        '''
        :param message: 异常信息
        '''
        self.message = message

    # override
    # 如果我们上面的变量名不是定义的 message，比如改成了 msg
    # 该方法就必须定义，因为基类中使用的就是 message，否则无法正常输出异常信息
    def __str__(self):
        return self.message

try:
    raise MyException('我的异常!')
except MyException as e:
    print(e)
```

异常的名字都以 `Error` 结尾，所以在实际开发中，我们在为自定义异常命名的时候也需要遵守这一规范，就跟标准的异常命名一样。

## 主动抛出异常：raise

很多时候，我们需要主动抛出一个异常。Python 内置了一个关键字 `raise`，可以主动触发异常。

raise 唯一的一个参数指定了要被抛出的异常的实例，如果什么参数都不给，那么会默认抛出当前异常。

一般用到 raise 主要是为了记录错误信息，然后将异常继续往上层传递，让上层去处理异常：

```python
try:
    1/0
except ZeroDivisionError as e:
    print("记录异常日志：", e)
    print("但是我自己无法处理，只能继续抛出，看看上层能否处理")
    raise
```

有时候，你需要主动弹出异常，作为警告或特殊处理：

```python
sex = int(input("Please input a number: "))

try:
    if sex == 1:
        print("这是个男人！")
    elif sex == 0:
        print("这是个女人！")
    else:
        print("好像有什么不符合常理的事情发生了！！")
        raise ValueError("非法的输入")
except ValueError:
    print("这是个什么物种！")
```

更多的时候，你需要使用 raise 抛出你自定义的异常。

（完）
