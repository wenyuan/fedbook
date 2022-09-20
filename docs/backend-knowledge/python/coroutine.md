# 协程

## 前置知识

### 并发和并行

* **并发**指的是一个 CPU 同时处理多个程序，但是在同一时间点只会处理其中一个。核心是程序切换的速度非常快，1 秒钟内可以完全很多次程序切换，肉眼无法感知。
* **并行**指的是多个 CPU 同时处理多个程序，同一时间点可以处理多个。

### 同步和异步

* **同步**是执行 IO 操作时，必须等待执行完成才得到返回结果。
* **异步**是执行 IO 操作时，不必等待执行就能得到返回结果。

在 Python 中，异步函数本质上依旧是函数，只是在执行过程中会将执行权交给其它协程，与普通函数定义的区别是在 `def` 关键字前增加 `async`。

### 协程的历史

> 协程，英文名是 Coroutine， 又称为微线程，是一种用户态的轻量级线程。协程不像线程和进程那样，需要进行系统内核上的上下文切换，协程的上下文切换是由程序员决定的。在 Python 中协程就是一个可以暂停执行的函数，听起来和生成器的概念一样。

* Python 中协程概念是从 3.4 版本增加的，当时的协程是通过` @asyncio.coroutine` 和 `yield from` 实现的，看起来和生成器的实现方式没什么区别。
* Python 3.5 中，为了更好地将协程和生成器的使用场景进行区分，引入了 `async` 和 `await` 语法糖，用于定义原生协程。
* Python 3.6 中，逐渐稳定，被更多的人认可。
* Python 3.7 官方把 `async` 和 `await` 作为保留字，同时协程的调用也变得简单了许多。但是，正是保留字的原因导致之前很多 `async` 为函数名的库报错，典型的有 scrapy，但解决方法肯定是有的。

### 协程，线程和进程的区别

* 多进程通常利用的是多核 CPU 的优势，同时执行多个计算任务。每个进程有自己独立的内存管理，所以不同进程之间要进行数据通信比较麻烦。
* 多线程是在一个 cpu 上创建多个子任务，当某一个子任务休息的时候其他任务接着执行。多线程的控制是由 Python 自己控制的。子线程之间的内存是共享的，并不需要额外的数据通信机制。但是线程存在数据同步问题，所以要有锁机制。
* 协程的实现是在一个线程内实现的，相当于流水线作业。由于线程切换的消耗比较大，所以对于并发编程，可以优先使用协程。

## 协程的用法

使用协程也就意味着你需要一直写异步方法。在 Python 中我们使用 `asyncio` 模块来实现一个协程。如果我们把 Python 中普通函数称之为同步函数（方法），那么用协程定义的函数我们称之为异步函数（方法）。

> 注意，以下所有的代码实例运行环境均要求版本大于等于 Python3.7。

### 协程的基础使用

这是 Python 3.7 里面的基础协程用法，现在这种用法已经基本稳定，不太建议使用之前的语法了。

```python
import asyncio
import time


async def func(x):
    print('异步函数...')
    await asyncio.sleep(2)
    return 2 * x


if __name__ == '__main__':
    start_time = time.perf_counter()
    print("开始运行协程")
    coro = func(2)
    asyncio.run(coro)
    print("结束运行协程")
    print(f"运行时间：{time.perf_counter() - start_time} s")
```

包含如下步骤：

* 在普通的函数前面加 `async` 关键字。
* `await` 表示在这个地方等待子函数执行完成，再往下执行。
  * 在并发操作中，把程序控制权教给主程序，让他分配其他协程执行。
  * `await` 只能在带有 `async` 关键字的函数中运行。
* `asynico.run()` 运行程序
* 这个程序消耗时间 2s 左右。

::: tip 小贴士
`await` 的作用就是等待当前的协程运行结束之后再继续进行下面代码。
:::

### 多个协程子任务

可以通过使用 `await` 关键字，在一个协程中调用一个协程。一个协程可以启动另一个协程，从而可以使任务根据工作内容，封装到不同的协程中。

就像下面的例子一样：

```python
import asyncio
import time


# 异步函数1
async def task1(x):
    print("任务1")
    await asyncio.sleep(2)
    print("恢复任务1")
    return x


# 异步函数2
async def task2(x):
    print("任务2")
    await asyncio.sleep(1)
    print("恢复任务2")
    return x


async def main():
    start_time = time.perf_counter()
    res_1 = await task1(1)
    res_2 = await task2(2)
    print(f"任务1 返回的值是：{res_1}")
    print(f"任务2 返回的值是：{res_2}")
    print(f"运行时间：{time.perf_counter() - start_time} s")


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

执行结果：

```
任务1
恢复任务1
任务2
恢复任务2
任务1 返回的值是：1
任务2 返回的值是：2
运行时间：3.0183316000000002 s
```

上述代码创建了 3 个协程，其中 `task1` 和 `task2` 都放在了协程函数 `main` 中，I/O 操作通过 `asyncio.sleep(1)` 进行模拟，整个函数运行时间约为 3 秒，但依旧是串行进行，并没有发挥并发编程的优势。如果是并发编程，这个程序只需要消耗 2 秒，也就是 task1 的等待时间。

### 并发执行协程子任务

#### gather 方法

如果希望修改为并发执行，需要把上面的代码改一下：

```python {23}
import asyncio
import time


# 异步函数1
async def task1(x):
    print("任务1")
    await asyncio.sleep(2)
    print("恢复任务1")
    return x


# 异步函数2
async def task2(x):
    print("任务2")
    await asyncio.sleep(1)
    print("恢复任务2")
    return x


async def main():
    start_time = time.perf_counter()
    res_1, res_2 = await asyncio.gather(task1(1), task2(2))

    print(f"任务1 返回的值是：{res_1}")
    print(f"任务2 返回的值是：{res_2}")
    print(f"运行时间：{time.perf_counter() - start_time} s")


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

执行结果：

```
任务1
任务2
恢复任务2    -->  任务2 由于等待时间短，先返回。
恢复任务1
任务1 返回的值是：1
任务2 返回的值是：2
运行时间：2.0262786 s
```

上述代码最大的变化是将 `task1` 和 `task2` 放到了 `asyncio.gather()` 中运行，此时代码输出时间明显变短。

`asyncio.gather` 会创建 2 个子任务，当出现 `await` 的时候，程序会在这 2 个子任务之间进行调度。

#### wait 方法

`asyncio.gather()` 可以更换为 `asyncio.wait()`，修改代码如下：

```python {29}
import asyncio
import time


# 异步函数1
async def task1(x):
    print("任务1")
    await asyncio.sleep(2)
    print("恢复任务1")
    return x


# 异步函数2
async def task2(x):
    print("任务2")
    await asyncio.sleep(1)
    print("恢复任务2")
    return x


async def main():
    start_time = time.perf_counter()
    # 参考 wait() 源码中的注释，需要把协程对象变成 Tasks 对象（3.8 之前会自动生成为 Tasks 对象）
    # 如果直接把协程对象传给 wait() 方法，Python3.8 会警告，Python3.11 会报错
    tasks = [
        asyncio.create_task(task1(1)),
        asyncio.create_task(task2(2))
    ]
    done, pending = await asyncio.wait(tasks)
    print(done)
    print(pending)

    print("运行时间", time.perf_counter() - start_time)


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

`asyncio.wait()` 返回一个元组，其中包含一个已经完成的任务集合，一个未完成任务的集合。

#### gather 和 wait 的区别

* `gather`：需要所有任务都执行结束，如果任意一个协程函数崩溃了，都会抛异常，不会返回结果。
* `wait`：可以定义函数返回的时机，可以设置为 `FIRST_COMPLETED`（第一个结束的），`FIRST_EXCEPTION`（第一个出现异常的），`ALL_COMPLETED`（全部执行完，默认的）。
  ```python
  done, pending = await asyncio.wait(tasks, return_when=asyncio.tasks.FIRST_EXCEPTION)
  ```

::: tip 小贴士
在 Python3.8 之前，gather 具有把普通协程函数包装成协程任务的能力，wait 没有。wait 只能接收包装后的协程任务列表做参数。

这也导致了：gather 返回的任务执行结果是有序的，wait 方法获取的结果是无序的。

但在 Python3.8 之后，这种[直接向 `wait()` 传入协程对象的方式已弃用](https://docs.python.org/zh-cn/3/library/asyncio-task.html#asyncio-example-wait-coroutine)。

测试代码：

```python
import asyncio


async def num(n):
    print(f"当前的数字是：{n}")
    await asyncio.sleep(n)
    print(f"等待时间：{n}")


async def main():
    tasks = [num(i) for i in range(10)]  # 协程列表
    # await asyncio.gather(*tasks)  # gather 有序并发
    # await asyncio.wait(tasks)     # wait   无序并发

    # wait 新写法，需要传递 Tasks 对象，且这种写法之下也是有序并发了
    await asyncio.wait([asyncio.create_task(task) for task in tasks])


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```
:::

### 在协程中使用普通函数

在普通函数中调用普通函数，直接函数名加括号即可。而在协程中调用一个普通函数，则需要通过一些方法，可以使用的关键字有：

* `call_soon`：立即执行
* `call_later`：延迟执行
* `call_at`：在某时刻执行
* `loop.time`：是事件循环内部的一个即时方法，返回值是时刻，数据类型为 `float`

这三个 `call_xxx` 方法的作用都是将函数作为任务排定到事件循环中，返回值都是 `asyncio.events.TimerHandle` 实例，注意它们不是协程任务，不能作为 `loop.run_until_complete` 的参数。

#### call_soon

通过字面意思理解就是调用立即返回。具体的使用例子：

```python
import asyncio
import functools


def callback(args, *, kwargs="default"):
    print(f"普通函数做为回调函数，获取参数：{args}，{kwargs}")


async def main():
    loop = asyncio.get_running_loop()
    print("注册 callback")
    loop.call_soon(callback, 1)
    wrapped = functools.partial(callback, kwargs="not default")
    loop.call_soon(wrapped, 2)
    await asyncio.sleep(0.2)


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

执行结果：

```
注册 callback
普通函数做为回调函数，获取参数：1，default
普通函数做为回调函数，获取参数：2，not default
```

::: tip 小贴士
`functools.partial` 接收一个函数，并返回一个新的函数，与装饰器不同的是它可以传递更多的参数。可参考[偏函数](https://www.liaoxuefeng.com/wiki/1016959663602400/1017454145929440)
:::

#### call_later

有时候我们不想立即调用一个函数，此时我们就可以用 `call_later` 延时去调用一个函数了。

它的意思就是事件循环在 delay 多长时间之后才执行 callback 函数。配合上面的 `call_soon` 看一个小例子：

```python
import asyncio


def callback(args, *, kwargs="default"):
    print(f"普通函数做为回调函数，获取参数：{args}，{kwargs}")


async def main():
    loop = asyncio.get_running_loop()
    print("注册 callback")
    loop.call_later(0.2, callback, 1)
    loop.call_later(0.1, callback, 2)
    loop.call_soon(callback, 3)
    await asyncio.sleep(0.4)


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

执行结果：

```
注册 callback
普通函数做为回调函数，获取参数：3，default
普通函数做为回调函数，获取参数：2，default
普通函数做为回调函数，获取参数：1，default
```

通过上面的输出可以得到如下结论：

* `call_soon` 会在 `call_later` 之前执行，和它的位置在哪无关。
* `call_later` 的第一个参数越小，越先执行。

#### call_at

`call_at` 第一个参数的含义代表的是一个单调时间，它和我们平时说的系统时间有点差异，这里的时间指的是事件循环内部时间，可以通过 `loop.time()` 获取，然后可以在此基础上进行操作。后面的参数和前面的两个方法一样。实际上 `call_later` 内部就是调用的 `call_at`。

```python
import asyncio


def callback(n, loop):
    print(f"回调函数 {n} 运行时间点 {loop.time()}")


async def main():
    loop = asyncio.get_running_loop()
    now = loop.time()
    print(f"当前的内部时间：{now}")
    print(f"循环时间：{now}")
    print("注册 callback")
    loop.call_at(now + 0.1, callback, 1, loop)
    loop.call_at(now + 0.2, callback, 2, loop)
    loop.call_soon(callback, 3, loop)
    await asyncio.sleep(1)


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

执行结果：

```
当前的内部时间：1142173.546
循环时间：1142173.546
注册 callback
回调函数 3 运行时间点 1142173.546
回调函数 1 运行时间点 1142173.656
回调函数 2 运行时间点 1142173.75
```

## asyncio 异步 I/O 库

> 上面的代码都用到了 asyncio 库，这里展开讲一下。

Python 中的 `asyncio` 库提供了管理事件、协程、任务和线程的方法，以及编写并发代码的原语，即 `async` 和 `await`。

该模块的主要内容：

* 事件循环：`event_loop`，管理所有的事件，是一个无限循环方法，在循环过程中追踪事件发生的顺序将它们放在队列中，空闲时则调用相应的事件处理者来处理这些事件。
* 协程：`coroutine`，子程序的泛化概念，协程可以在执行期间暂停，等待外部的处理（I/O 操作）完成之后，再从暂停的地方继续运行，函数定义式使用 `async` 关键字，这样这个函数就不会立即执行，而是返回一个协程对象。
* `Future` 和 `Task`：Future 对象表示尚未完成的计算，Task 是 Future 的子类，包含了任务的各个状态，作用是在运行某个任务的同时可以并发的运行多个任务。

::: tip 小贴士
所谓原语，一般是指由若干条指令组成的程序段，用来实现某个特定功能，在执行过程中不可被中断。
:::

### 事件循环

`event_loop` 是 `asyncio` 模块的核心，它将异步函数注册到事件循环上。

一个函数如果在定义时增加了 `async` 关键字，那么就会返回一个协程对象，如果想要函数得到执行，需要将其放到事件循环 `event_loop` 中。

**因此在 Python3.7 之前使用异步函数是这么一个流程**：

* 首先，创建一个事件循环：`loop = asyncio.get_event_loop()`。
* 然后，由 `run_until_complete(协程对象)` 将协程注册到事件循环中，并启动事件循环。
* 最后，在结束的时候调用 `close` 方法关闭事件循环。

```python
import asyncio

async def func(x):
    print('异步函数')
    return 2 * x


if __name__ == '__main__':
    loop = asyncio.get_event_loop()  # 定义一个事件循环
    try:
        print("开始运行协程")
        coro = func(2)
        print("进入事件循环")
        loop.run_until_complete(coro)  # 运行协程
    finally:
        print("关闭事件循环")
        loop.close()   # 运行完关闭事件循环
```

**而在 Python3.7 之后**，直接使用 `asyncio.run()` 即可（看了下源码，其实是把之前的步骤封装进 run 方法了），该函数总是会创建一个新的事件循环并在结束时进行关闭。

比如官网文档中的一个案例：

```python
import asyncio


async def main():
    print('hello')
    await asyncio.sleep(1)
    print('world')


asyncio.run(main())
```

### 创建 task

由于协程对象不能直接运行，在注册到事件循环时，是 `run_until_complete` 方法将其包装成一个 task 对象。该对象是对 coroutine 对象的进一步封装，它比 coroutine 对象多了运行状态，例如 `pending`，`running`，`finished`，可以利用这些状态获取协程对象的执行情况。

下面显式地将 coroutine 对象封装成 task 对象，在上述代码基础上进行修改。

```python
import asyncio
import time


# 异步函数1
async def task1(x):
    print("任务1")
    await asyncio.sleep(2)
    print("恢复任务1")
    return x


# 异步函数2
async def task2(x):
    print("任务2")
    await asyncio.sleep(1)
    print("恢复任务2")
    return x


async def main():
    start_time = time.perf_counter()
    # 封装 task 对象
    coroutine1 = task1(1)
    task_1 = asyncio.create_task(coroutine1)
    coroutine2 = task2(2)
    task_2 = asyncio.create_task(coroutine2)
    ret_1, ret_2 = await asyncio.gather(task_1, task_2)

    print("任务1 返回的值是", ret_1)
    print("任务2 返回的值是", ret_2)
    print("运行时间", time.perf_counter() - start_time)


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

由于 task 对象是 future 对象的子类对象，所以上述代码也可以按照下述内容修改：

```python
# task_2 = asyncio.create_task(coroutine2)
task_2 = asyncio.ensure_future(coroutine2)
```

下面将 task 对象的各个状态进行打印输出：

```python
import asyncio
import time


# 异步函数1
async def task1(x):
    print("任务1")
    await asyncio.sleep(2)
    print("恢复任务1")
    return x


# 异步函数2
async def task2(x):
    print("任务2")
    await asyncio.sleep(1)
    print("恢复任务2")
    return x


async def main():
    start_time = time.perf_counter()
    # 封装 task 对象
    coroutine1 = task1(1)
    task_1 = asyncio.create_task(coroutine1)
    coroutine2 = task2(2)
    # task_2 = asyncio.create_task(coroutine2)
    task_2 = asyncio.ensure_future(coroutine2)
    # 进入 pending 状态
    print(task_1)
    print(task_2)

    # 获取任务的完成状态
    print(task_1.done(), task_2.done())
    # 执行任务
    await task_1
    await task_2
    # 再次获取完成状态
    print(task_1.done(), task_2.done())

    # 获取返回结果
    print(task_1.result())
    print(task_2.result())

    print("运行时间", time.perf_counter() - start_time)


if __name__ == '__main__':
    # 执行协程对象
    asyncio.run(main())
```

`await task_1` 表示的是执行该协程，执行结束之后，`task.done()` 返回 `True`，`task.result()` 获取返回值。

### 回调返回值

当协程执行完毕，需要获取其返回值，上面提到的使用 `task.result()` 方法获取是一种办法，但是该方法仅当协程运行完毕时，才能获取结果，如果协程没有运行完毕，`result()` 方法会返回 `asyncio.InvalidStateError`（无效状态错误）。

一般都采用第二种方案，通过 `add_done_callback()` 方法绑定回调：

```python
import asyncio
import requests


async def request_html():
    url = 'https://www.baidu.com'
    res = requests.get(
        url,
        verify=False,
        proxies={"http": None, "https": None}  # 本地开有代理，不加这个会一堆报错
    )
    return res.status_code


def callback(task):
    print('回调：', task.result())


if __name__ == '__main__':
    # 定义一个事件循环
    loop = asyncio.get_event_loop()

    coroutine = request_html()
    task = loop.create_task(coroutine)
    # 绑定回调
    task.add_done_callback(callback)
    print(task)
    print("*" * 100)

    # 运行协程
    loop.run_until_complete(task)
    print(task)
    
    # 关闭事件循环
    loop.close()
```

上述代码当 coroutine 执行完毕时，会调用 callback 函数。

如果回调函数需要多个参数，就要使用 `functools` 模块中的偏函数（`partial`）方法

### 循环事件关闭

如果是用的 `loop = asyncio.get_event_loop()` 和 `loop.run_until_complete(协程对象)` 来启动的事件循环，那么建议每次编码结束之后，都调用循环事件对象 `close()` 方法，彻底清理 loop 对象。

## 协程的主要使用场景

协程的主要应用场景是 IO 密集型任务，总结几个常见的使用场景：

* 网络请求，比如爬虫，大量使用 aiohttp
* 文件读取，aiofile
* web 框架，aiohttp，fastapi
* 数据库查询，asyncpg，databases

## 协程相对于多线程的优点

多线程编程是比较困难的，因为调度程序任何时候都能中断线程，必须记住保留锁，去保护程序中重要部分，防止多线程在执行的过程中断。

而协程默认会做好全方位保护，以防止中断。我们必须显示产出才能让程序的余下部分运行。对协程来说，无需保留锁，而在多个线程之间同步操作，协程自身就会同步，因为在任意时刻，只有一个协程运行。总结下大概下面几点：

* 无需系统内核的上下文切换，减小开销。
* 无需原子操作锁定及同步的开销，不用担心资源共享的问题。
* 单线程即可实现高并发，单核 CPU 即便支持上万的协程都不是问题，所以很适合用于高并发处理，尤其是在应用在网络爬虫中。

## 协程的缺点

* **无法使用 CPU 的多核**。协程的本质是个单线程，它不能同时用上单个 CPU 的多个核，协程需要和进程配合才能运行在多 CPU 上。当然我们日常所编写的绝大部分应用都没有这个必要，就比如网络爬虫来说，限制爬虫的速度还有其他的因素，比如网站并发量、网速等问题都会是爬虫速度限制的因素。除非做一些密集型应用，这个时候才可能会用到多进程和协程。
* **处处都要使用非阻塞代码**。写协程就意味着你要一直写一些非阻塞的代码，使用各种异步版本的库，比如 aiohttp 就是一个异步版本的 requests 库。不过这些缺点并不能影响到使用协程的优势。

## 参考文档

* [协程与任务](https://docs.python.org/zh-cn/3/library/asyncio-task.html)

（完）
