# 多线程、多进程

## 什么是进程

> 操作系统中执行的每一个程序都是一个进程，比如微信、QQ。

#### 概念：

* 进程是 CPU **资源分配的最小单位**
* 操作系统会给进程分配内存空间，每个进程都会有自己的地址空间、数据栈以及其他用于跟踪进程执行的辅助数据
* 操作系统管理所有进程的执行，为它们合理的分配资源

#### 特点：

* 进程可以通过 fork、spawn 的方式来创建新的进程来执行其他任务
* 不过新的进程有自己独立的内存空间、数据栈
* 因此不同进程间需要通过通信机制（IPC）来实现数据共享

#### 常见通信机制：

* 管道
* 信号
* 套接字
* 共享内存区

## 什么是线程

#### 概念：

* 线程是 CPU **调度的最小单位**
* 它被包含在进程之中，是进程中的实际运作单元
* 一个进程中可以并发多个线程，每条线程并行执行不同的任务

#### 特点：

* 进程有独立的地址空间，线程没有单独的地址空间（同一进程内的线程共享进程的地址空间）
* 相对于进程来说，线程间的信息共享和通信更加容易

#### 进程与线程区别：

* 同一个进程中的线程共享同一内存空间，但进程之间的内存空间是独立的。
* 同一个进程中的所有线程的数据是共享的，但进程之间的数据是独立的。
* 对主线程的修改可能会影响其他线程的行为，但是父进程的修改（除了删除以外）不会影响其他子进程。
* 线程是一个上下文的执行指令，而进程则是与运算相关的一簇资源。
* 同一个进程的线程之间可以直接通信，但是进程之间的交流需要借助中间代理来实现。
* 创建新的线程很容易，但是创建新的进程需要对父进程做一次复制。
* 一个线程可以操作同一进程的其他线程，但是进程只能操作其子进程。
* 线程启动速度快，进程启动速度慢（但是两者运行速度没有可比性）。

## 关于多线程

### 并发与并行

* **并发**：一个 CPU 核心**通过时间切换执行**多个线程
    * 一个应用程序（进程）如果可以开启多个线程，让多个线程**同时存在**，但是**交替执行**，则称之为**并发执行**。
* **并行**：多个 CPU 核心**同时执行**多个线程
    * 一个应用程序能并行执行，那么就一定是运行在多核处理器上。此时，程序中的每个线程都将分配到一个独立的处理器上核上，因此可以**并行执行**。

> CPU 最初发展的时候是一个 CPU 一个处理核心，然后一个核心一个线程。不过后来 Intel 发明了**超线程技术**，就是在一个强大的物理核心里面模拟出两个核心，可以达到 2 个核心的效果。所以有了现在常说的双核四线程，四核八线程。
>
> 单核就是一个物理核心，目前主流的已经没有单核的了，多核就是两个以上物理核心。
>
> 原则上只要线程数不多于 CPU 核心数，就会把各个线程都分配一个核心，不需分片，而当线程数多于 CPU 核心数时才会分片。
>
> 事实上目前的计算机系统正常情况下线程数都是远远多于 CPU 核心数的，所以一般都要分片，以允许所有线程**并发**运行。

**对于单核 CPU**：

* 只能并发，无法并行
* 并且单核 CPU 其实是一种假的多线程并发执行
* 因为它上面运行的多线程程序，同一时间只能有一个线程在跑
* 系统给每个线程分配时间片来执行，每个时间片大概 10ms 左右，看起来像是同时在跑多个线程，但实际是每个线程跑一点点就换到其他线程继续跑

**对于多核 CPU**：

* 是真正意义上的多线程，同一时间多个 CPU 同时跑其他的程序，效率很高。
* 在多核 CPU 中，并发和并行一般都会同时存在，它们都是提高 CPU 处理任务能力的重要手段。

### 多线程的好处与坏处

**好处**：

* 提升程序的性能和改善用户体验
* 今天日常使用的软件几乎都用到了多线程

**坏处**：

* 站在其他进程的角度，多线程的程序对其他程序并不友好，因为它占用了更多的 CPU 执行时间，导致其他程序无法获得足够的 CPU 执行时间
* 编写和调试多线程的程序对开发者要求较高

## Python 中的多进程

Python 通过 `multiprocess` 模块中的 `Process` 类实现进程相关的功能。但是它基于 fork 机制，因此不被 Windows 平台支持。想要在 Windows 中运行，必须使用 `if __name__ == '__main__':` 的方式，显然这只能用于调试和学习，不能用于实际环境。

::: warning
在 `multiprocess` 模块中有大写的 `Process` 和小写的 `process`，这两者是完全不同的东西，导入时要小心和注意。
:::

### 代码示例

#### 一般用法：

```python
import os
import multiprocessing


def foo(i):
    # i 是参数
    ppid = os.getppid()  # 获取父进程id
    pid = os.getpid()    # 获取自己的进程id
    pname = multiprocessing.current_process().name  # 获取进程名
    print('这里是: {0}, 父进程 id: {1}, 当前子进程 id: {2}'.format(pname, ppid, pid))


if __name__ == '__main__':
    for i in range(5):
        p = multiprocessing.Process(target=foo, args=(i,))
        p.start()


# 执行结果
这里是: Process-1, 父进程 id: 6192, 当前子进程 id: 11404
这里是: Process-2, 父进程 id: 6192, 当前子进程 id: 17996
这里是: Process-3, 父进程 id: 6192, 当前子进程 id: 2640
这里是: Process-4, 父进程 id: 6192, 当前子进程 id: 6588
这里是: Process-5, 父进程 id: 6192, 当前子进程 id: 17808
```

#### 多进程实战：

```python
# 模拟下载文件，不使用多进程时，需要等第一个文件下载完才能下载第二个文件
from random import randint
from time import time, sleep


def download_task(filename):
    print('开始下载: %s...' % filename)
    time_to_download = randint(5, 10)
    sleep(time_to_download)
    print('%s 下载完成! 耗时%d秒' % (filename, time_to_download))

def main():
    start = time()
    download_task('Python入门教程.pdf')
    download_task('程序员养身之道.pdf')
    end = time()
    print('总共耗费了%.2f秒.' % (end - start))


if __name__ == '__main__':
    main()


# 执行结果
开始下载: Python入门教程.pdf...
Python入门教程.pdf 下载完成! 耗时6秒
开始下载: 程序员养身之道.pdf...
程序员养身之道.pdf 下载完成! 耗时9秒
总共耗费了15.01秒.
```

```python
# 模拟下载文件，使用多进程时，两个任务同时执行，总耗时不再是两个任务的时间总和
from random import randint
from time import time, sleep
from multiprocessing import Process


def download_task(filename):
    print('开始下载: %s...' % filename)
    time_to_download = randint(5, 10)
    sleep(time_to_download)
    print('%s 下载完成! 耗费了%d秒' % (filename, time_to_download))

def main():
    start = time()
    p1 = Process(target=download_task,args=("Python入门教程.pdf",))
    p1.start()
    p2 = Process(target=download_task, args=("程序员养身之道.pdf",))
    p2.start()
    p1.join()
    p2.join()
    end = time()
    print('总共耗费了%.2f秒.' % (end - start))


if __name__ == '__main__':
    main()


# 执行结果
开始下载: Python入门教程.pdf...
开始下载: 程序员养身之道.pdf...
程序员养身之道.pdf 下载完成! 耗费了5秒
Python入门教程.pdf 下载完成! 耗费了10秒
总共耗费了10.11秒.
```

#### 知识点：

* **Process**：通过 `Process` 类创建进程对象
* **target**：通过 `target` 参数传入一个**函数名**来表示进程启动后要执行的代码
* **args**：是一个元组，代表传递给函数的参数列表
* **start**：Process 的 `start()` 方法来启动进程
* **join**：Process 的 `join()` 方法表示等待进程执行结束，才会往下执行

### 进程间数据共享

在 Linux 中，每个子进程的数据都是由父进程提供的，每启动一个子进程就从父进程克隆一份数据。

创建一个进程需要非常大的开销，每个进程都有自己独立的数据空间，不同进程之间通常是不能共享数据的，也就是说，哪怕在代码中定义一个全局列表，也是无法实现进程间的数据共享的，如下：

```python
from multiprocessing import Process

lis = []


def foo(i):
    lis.append(i)
    print('lis is: {0}, id(lis) is: {1}'.format(lis, id(lis)))


if __name__ == '__main__':
    for i in range(5):
        p = Process(target=foo, args=(i,))
        p.start()
    print("The global list is:", lis)


# 执行结果
The global list is: []
lis is: [0], id(lis) is: 2179728817152
lis is: [1], id(lis) is: 1825975712768
lis is: [2], id(lis) is: 1984232504320
lis is: [3], id(lis) is: 2547591429120
lis is: [4], id(lis) is: 3166895815680
```

可以发现，全局列表 `lis` 没有起到任何作用，在主进程和子进程中，`lis` 指向内存中不同的列表。


想要在进程之间进行数据共享，一般通过中间件来实现。在 Python 中可以使用 `Queues`、`Array` 和 `Manager` 这三个 `multiprocess` 模块提供的类。

#### 1）使用 Array 共享数据

Array 类在实例化的时候必须指定数组的数据类型和数组的大小，类似 `temp = Array('i', 5)`。对于数据类型有下面的对应关系：

```python
'c': ctypes.c_char, 'u': ctypes.c_wchar,
'b': ctypes.c_byte, 'B': ctypes.c_ubyte,
'h': ctypes.c_short, 'H': ctypes.c_ushort,
'i': ctypes.c_int, 'I': ctypes.c_uint,
'l': ctypes.c_long, 'L': ctypes.c_ulong,
'f': ctypes.c_float, 'd': ctypes.c_double
```

代码示例：

```python
import multiprocessing
from multiprocessing import Process
from multiprocessing import Array


def func(i,temp):
    temp[0] += 100
    pname = multiprocessing.current_process().name  # 获取进程名
    print('这里是: {0}, 修改后的数组第一个元素: {1}'.format(pname, temp[0]))


if __name__ == '__main__':
    temp = Array('i', [1, 2, 3, 4])
    for i in range(5):
        p = Process(target=func, args=(i, temp))
        p.start()


# 执行结果
这里是: Process-1, 修改后的数组第一个元素: 101
这里是: Process-2, 修改后的数组第一个元素: 201
这里是: Process-3, 修改后的数组第一个元素: 301
这里是: Process-5, 修改后的数组第一个元素: 401
这里是: Process-4, 修改后的数组第一个元素: 501
```

#### 2）使用 Manager 共享数据

通过 Manager 类也可以实现进程间数据的共享。`Manager()` 返回的 manager 对象提供一个服务进程，使得其他进程可以通过代理的方式操作 Python 对象。

manager 对象支持 list，dict，Namespace，Lock，RLock，Semaphore，BoundedSemaphore，Condition，Event，Barrier，Queue，Value，Array 等多种格式。

代码示例：

```python
from multiprocessing import Process
from multiprocessing import Manager


def func(i, dic):
    dic["num"] = 100+i
    print(dic.items())


if __name__ == '__main__':
    dic = Manager().dict()
    for i in range(10):
        p = Process(target=func, args=(i, dic))
        p.start()
        p.join()


# 执行结果
[('num', 100)]
[('num', 101)]
[('num', 102)]
[('num', 103)]
[('num', 104)]
```

#### 3）使用 queues 的 Queue 类共享数据

multiprocessing 是一个包，它内部有一个 `queues` 模块，提供了一个 Queue 队列类，可以实现进程间的数据共享。

代码示例：

```python
import multiprocessing
from multiprocessing import Process
from multiprocessing import queues


def func(i, q):
    ret = q.get()
    print("进程 {0} 从队列里获取了一个 {1}，然后又向队列里放入了一个 {2}".format(i, ret, i))
    q.put(i)


if __name__ == "__main__":
    lis = queues.Queue(20, ctx=multiprocessing)
    lis.put(0)
    for i in range(5):
        p = Process(target=func, args=(i, lis,))
        p.start()


# 执行结果
进程 0 从队列里获取了一个 0，然后又向队列里放入了一个 0
进程 1 从队列里获取了一个 0，然后又向队列里放入了一个 1
进程 2 从队列里获取了一个 1，然后又向队列里放入了一个 2
进程 3 从队列里获取了一个 2，然后又向队列里放入了一个 3
进程 4 从队列里获取了一个 3，然后又向队列里放入了一个 4
```

关于 `queue` 和 `Queue`，在 Python 库中非常频繁的出现，很容易就搞混淆了。甚至是 `multiprocessing` 自己还有一个 `Queue` 类(大写的 Q)，一样能实现 `queues.Queue` 的功能，导入方式是 `from multiprocessing import Queue`。

### 进程锁

为了防止出现数据抢夺和脏数据的问题，需要设置进程锁。在 `multiprocessing` 里的锁类有 `RLock`，`Lock`，`Event`，`Condition` 和 `Semaphore`，和多线程的 `threading` 模块中的锁名和用法是一样的，这一点就比较友好了。

代码示例：

```python
from multiprocessing import Process
from multiprocessing import Array
from multiprocessing import RLock, Lock, Event, Condition, Semaphore
import time


def func(i,lis,lc):
    lc.acquire()
    lis[0] = lis[0] - 1
    time.sleep(1)
    print('say hi', lis[0])
    lc.release()


if __name__ == "__main__":
    array = Array('i', 1)
    array[0] = 10
    lock = RLock()
    for i in range(10):
        p = Process(target=func, args=(i, array, lock))
        p.start()


# 执行结果
say hi 9
say hi 8
say hi 7
say hi 6
say hi 5
```

### 进程池 Pool 类

进程启动的开销比较大，过多的创建新进程会消耗大量的内存空间。我们可以使用进程池控制内存开销。

比较幸运的是，Python 给我们内置了一个进程池，不需要像线程池那样要自己写，只需要简单的 `from multiprocessing import Pool` 导入就行。进程池内部维护了一个进程序列，需要时就去进程池中拿取一个进程，如果进程池序列中没有可供使用的进程，那么程序就会等待，直到进程池中有可用进程为止。

进程池中常用的方法：

* `apply()` 同步执行（串行）
* `apply_async()` 异步执行（并行）
* `terminate()` 立刻关闭进程池
* `join(`) 主进程等待所有子进程执行完毕。必须在 `close()` 或 `terminate()` 之后。
* `close()` 等待所有进程结束后，才关闭进程池。

代码示例：

```python
from multiprocessing import Pool
import time


def func(args):
    time.sleep(1)
    print("正在执行进程 ", args)


if __name__ == '__main__':
    p = Pool(5)         # 创建一个包含5个进程的进程池
    for i in range(30):
        p.apply_async(func=func, args=(i,))

    p.close()           # 等子进程执行完毕后关闭进程池
    # time.sleep(2)
    # p.terminate()     # 立刻关闭进程池
    p.join()
```

## Python 中的多线程

### 代码示例

在 Python3 中，通过 `threading` 模块提供线程的功能。

**第一种方法**，继承 `Thread` 类，并重写它的 `run()` 方法：

```python
from threading import Thread
from random import randint
from time import time, sleep


class DownLoadTask(Thread):
    def __init__(self, filename):
        # 注意：一定要显式的调用父类的初始化函数。
        super().__init__()
        self.filename = filename

    def run(self):
        print('开始下载: %s...' % self.filename)
        time_to_download = randint(5, 10)
        sleep(time_to_download)
        print('%s 下载完成! 耗费了%d秒' % (self.filename, time_to_download))


def main():
    start = time()
    p1 = DownLoadTask("Python入门教程.pdf")
    p2 = DownLoadTask("程序员养生之道.pdf")
    p1.start()
    p2.start()
    p1.join()
    p2.join()
    end = time()
    print('总共耗费了%.2f秒.' % (end - start))


if __name__ == '__main__':    
    main()


# 执行结果
开始下载: Python入门教程.pdf...
开始下载: 程序员养生之道.pdf...
程序员养生之道.pdf 下载完成! 耗费了8秒
Python入门教程.pdf 下载完成! 耗费了10秒
总共耗费了10.00秒.
```

**第二种方法**，在实例化 `threading.Thread` 对象的时候，将线程要执行的任务函数作为参数传入线程：

```python
from threading import Thread
from random import randint
from time import time, sleep


def download_task(filename):
    print('开始下载: %s...' % filename)
    time_to_download = randint(5, 10)
    sleep(time_to_download)
    print('%s 下载完成! 耗费了%d秒' % (filename, time_to_download))


def main():
    start = time()
    p1 = Thread(target=download_task,args=("Python入门教程.pdf",))
    p1.start()
    p2 = Thread(target=download_task, args=("程序员养身之道.pdf",))
    p2.start()
    p1.join()
    p2.join()
    end = time()
    print('总共耗费了%.2f秒.' % (end - start))


if __name__ == '__main__':
    main()


# 执行结果
开始下载: Python入门教程.pdf...
开始下载: 程序员养身之道.pdf...
Python入门教程.pdf 下载完成! 耗费了5秒
程序员养身之道.pdf 下载完成! 耗费了9秒
总共耗费了9.00秒.
```

start 和 run 方法的区别：

| 比较点  | start                         | run                |
|:------|:-------------------------------|:-------------------|
| 作用   | 启动线程，获取 CPU 时间片          | 运行线程指定的代码块         |
| 线程状态 | 可运行状态                      | 运行状态               |
| 调用次数 | 一个线程只能调用一次              | 可以重复调用             |
| 运行线程 | 创建了一个子线程，线程名是自己命名的 | 在主线程中调用了一个普通函数     |
| 注意点  | 想用多线程，必须调用 start()      | 想用多线程，必须调用 start() |


### 关于 Thread 类

对于 `Thread` 类，它的定义如下：

```python
threading.Thread(self, group=None, target=None, name=None,
     args=(), kwargs=None, *, daemon=None)
```

参数说明：

* **group**：预留的，用于将来扩展。
* **target**：是一个可调用对象，在线程启动后执行。
* **name**：线程的名字。默认值为 `Thread-N`，N 是一个数字。
* **args** 和 **kwargs**：分别表示调用 `target` 时的参数列表和关键字参数。

`Thread` 类定义了以下常用方法与属性：

| 方法与属性                            | 说明                                                                                                                                     |
|:---------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------|
| `start()`                        | 启动线程，等待 CPU 调度                                                                                                                         |
| `run()`                          | 线程被 CPU 调度后自动执行的方法                                                                                                                     |
| `getName()`、`setName()` 和 `name` | 用于获取和设置线程的名称。                                                                                                                          |
| `setDaemon()`                    | 设置为后台线程或前台线程（默认是 `False`，前台线程）。如果是后台线程，主线程执行过程中，后台线程也在进行，主线程执行完毕后，后台线程不论成功与否，均停止。如果是前台线程，主线程执行过程中，前台线程也在进行，主线程执行完毕后，等待前台线程执行完成后，程序才停止。 |
| `ident`                          | 获取线程的标识符。线程标识符是一个非零整数，只有在调用了 `start()` 方法之后该属性才有效，否则它只返回 `None`。                                                                       |
| `is_alive()`                     | 判断线程是否是激活的（alive）。从调用 `start()` 方法启动线程，到 `run()` 方法执行完毕或遇到未处理异常而中断这段时间内，线程是激活的。                                                        |
| `isDaemon()` 方法和 `daemon` 属性     | 是否为守护线程                                                                                                                                |
| `join([timeout])`                | 调用该方法将会使主调线程堵塞，直到被调用线程运行结束或超时。参数 `timeout` 是一个数值类型，表示超时时间，如果未提供该参数，那么主调线程将一直堵塞到被调线程结束。                                                 |

### 让主线程等待子线程

在多线程执行过程中，每个线程各自执行自己的任务，不等待其它的线程，比如下面的例子：

```python
import time
import threading


def do_waiting():
    print('start waiting:', time.strftime('%H:%M:%S'))
    time.sleep(3)
    print('stop waiting', time.strftime('%H:%M:%S'))


if __name__ == '__main__':
    t = threading.Thread(target=do_waiting)
    t.start()
    # 确保线程t已经启动
    time.sleep(1)
    print('start job')
    print('end job')


# 执行结果
start waiting: 11:32:33
start job
end job
stop waiting 11:32:36
```

可以发现上面例子中，主线程没有等待子线程 `t` 执行完毕，就开始继续执行主线程里的代码了（`print('start job')`）。而且主线程执行完毕后（`print('end job')`）也没有结束整个程序，而是等待子线程 `t` 执行完毕，整个程序才结束。

**Python 默认会等待最后一个线程执行完毕后才退出**。

如果希望主线程等待子线程执行完后再继续执行，可以使用 `join()` 方法。如下所示：

```python
import time
import threading


def do_waiting():
    print('start waiting:', time.strftime('%H:%M:%S'))
    time.sleep(3)
    print('stop waiting', time.strftime('%H:%M:%S'))


if __name__ == '__main__':
    t = threading.Thread(target=do_waiting)
    t.start()
    # 确保线程t已经启动
    time.sleep(1)
    print('start join')
    # 将一直堵塞，直到t运行结束。
    t.join()
    print('end join')


# 执行结果
start waiting: 14:16:20
start join
stop waiting 14:16:23
end join
```

还可以使用 `setDaemon(True)` 把所有的子线程都变成主线程的守护线程，当主线程结束后，守护子线程也会随之结束，整个程序也跟着退出。如下所示：

```python
import threading
import time


def run():
    print(threading.current_thread().getName(), "开始工作")
    time.sleep(2)       # 子线程停2s
    print("子线程工作完毕")


if __name__ == '__main__':
    for i in range(3):
        t = threading.Thread(target=run,)
        t.setDaemon(True)   # 把子线程设置为守护线程，必须在start()之前设置
        t.start()
    
    time.sleep(1)     # 主线程停1秒
    print("主线程结束了！")
    print(threading.active_count())  # 输出活跃的线程数


# 执行结果
Thread-1 开始工作
Thread-2 开始工作
Thread-3 开始工作
主线程结束了！
4
```

### 自定义线程类

对于 `threading` 模块中的 `Thread` 类，本质上是执行了它的 `run` 方法。因此可以自定义线程类，让它继承 `Thread` 类，然后重写 `run` 方法。

```python
import threading


class MyThreading(threading.Thread):

    def __init__(self, func, arg):
        super().__init__()
        self.func = func
        self.arg = arg

    def run(self):
        self.func(self.arg)

def my_func(args):
    """
    你可以把任何你想让线程做的事定义在这里
    """
    pass


if __name__ == '__main__':
    obj = MyThreading(my_func, 123)
    obj.start()
```

### 线程锁

由于线程之间的任务执行是 CPU 进行随机调度的，并且每个线程可能只执行了 n 条指令之后就被切换到别的线程了。

当多个线程同时操作一个对象，如果没有很好地保护该对象，会造成程序结果的不可预期，这被称为「线程不安全」。比如如下代码：

```python
import threading
import time

number = 0


def plus():
    global number             # global 声明此处的 number 是外面的全局变量 number
    for _ in range(1000000):  # 进行一个大数级别的循环加一运算（太小的数不容易复现问题）
        number += 1
    print("子线程%s运算结束后，number = %s" % (threading.current_thread().getName(), number))


if __name__ == '__main__':
    # 用 2 个子线程，就可以观察到脏数据
    t1 = threading.Thread(target=plus)
    t1.start()
    t2 = threading.Thread(target=plus)
    t2.start()

    # 确保 2 个子线程都已经结束运算
    t1.join()
    t2.join()
    print("主线程执行完毕后，number = %s" % number)


# 执行结果
子线程Thread-1运算结束后，number = 1095778
子线程Thread-2运算结束后，number = 1363125
主线程执行完毕后，number = 1363125
```

可以发现上面的代码执行下来，结果不等于 2000000（理论上应该是两个线程各执行了 1000000 次加一操作，累加就应该是 2000000）。而且多执行几次上述代码，会发现每次的结果都不一样。

这是因为两个线程在运行过程中，CPU 随机调度，你算一会我算一会，在没有对 `number` 变量进行保护的情况下，就发生了数据错误。如果想获得正确结果，可以使用 `join()` 方法对每个线程进行单独，让多线程变成顺序执行，如下修改代码片段：

```python
import threading
import time

number = 0


def plus():
    global number             # global 声明此处的 number 是外面的全局变量 number
    for _ in range(1000000):  # 进行一个大数级别的循环加一运算（太小的数不容易复现问题）
        number += 1
    print("子线程%s运算结束后，number = %s" % (threading.current_thread().getName(), number))


if __name__ == '__main__':
    # 用 2 个子线程，就可以观察到脏数据
    t1 = threading.Thread(target=plus)
    t1.start()
    # 添加这一行就让两个子线程变成了顺序执行
    t1.join()
    t2 = threading.Thread(target=plus)
    t2.start()
    t2.join()
    print("主线程执行完毕后，number = %s" % number)


# 执行结果
子线程Thread-1运算结束后，number = 1000000
子线程Thread-2运算结束后，number = 2000000
主线程执行完毕后，number = 2000000
```

但是这种方法让多线程变成了单线程，属于因噎废食的做法，正确的做法是使用线程锁。即同一时刻只允许一个线程操作该数据。线程锁用于锁定资源，可以同时使用多个锁，当你需要独占某一资源时，任何一个锁都可以锁这个资源。

Python 在 `threading` 模块中定义了几种线程锁类，分别是：

* Lock 互斥锁
* RLock 可重入锁
* Semaphore 信号
* Event 事件
* Condition 条件
* Barrier「阻碍」

#### 1）互斥锁 Lock

同一时刻只有一个线程可以访问共享的数据。使用很简单，初始化锁对象，然后将锁当做参数传递给任务函数，在任务中加锁，使用后释放锁。

```python
import threading
import time

number = 0
lock = threading.Lock()


def plus(lk):
    global number       # global 声明此处的 number 是外面的全局变量 number
    lk.acquire()        # 开始加锁
    for _ in range(1000000):    # 进行一个大数级别的循环加一运算
        number += 1
    print("子线程%s运算结束后，number = %s" % (threading.current_thread().getName(), number))
    lk.release()        # 释放锁，让别的线程也可以访问number


if __name__ == '__main__':
    for i in range(2):      # 用 2 个子线程，就可以观察到脏数据
        t = threading.Thread(target=plus, args=(lock,))  # 需要把锁当做参数传递给 plus 函数
        t.start()
    time.sleep(2)       # 等待 2 秒，确保 2 个子线程都已经结束运算。
    print("主线程执行完毕后，number = ", number)


# 执行结果
子线程Thread-1运算结束后，number = 1000000
子线程Thread-2运算结束后，number = 2000000
主线程执行完毕后，number =  2000000
```

RLock 的使用方法和 Lock 一模一样，只不过它支持重入锁。该锁对象内部维护着一个 Lock 和一个 counter 对象。counter 对象记录了 acquire 的次数，使得资源可以被多次 require。最后，当所有 RLock 被 release 后，其他线程才能获取资源。在同一个线程中，`RLock.acquire()` 可以被多次调用，利用该特性，可以解决部分死锁问题。

#### 2）信号 Semaphore

类名：BoundedSemaphore

这种锁允许一定数量的线程同时更改数据，它不是互斥锁。比如地铁安检，排队人很多，工作人员只允许一定数量的人进入安检区，其它的人继续排队。

```python
import time
import threading


def run(n, se):
    se.acquire()
    print("run the thread: %s" % n)
    time.sleep(1)
    se.release()


if __name__ == '__main__':
    # 设置允许5个线程同时运行
    semaphore = threading.BoundedSemaphore(5)
    for i in range(20):
        t = threading.Thread(target=run, args=(i, semaphore))
        t.start()
```

运行后，可以看到 5 个一批的线程被放行。

#### 3）事件 Event

类名：Event

事件线程锁的运行机制：全局定义了一个 `Flag`，如果 `Flag` 的值为 `False`，那么当程序执行 `wait()` 方法时就会阻塞；如果 `Flag` 值为 `True`，线程不再阻塞。

这种锁，类似交通红绿灯（默认是红灯），它属于在红灯的时候一次性阻挡所有线程，在绿灯的时候，**一次性放行所有**排队中的线程。

事件主要提供了四个方法 `set()`、`wait()`、`clear()` 和 `is_set()`。

* 调用 `clear()` 方法会将事件的 `Flag` 设置为 `False`。
* 调用 `set()` 方法会将事件的 `Flag` 设置为 `True`。
* 调用 `wait()` 方法将等待「红绿灯」信号。
* `is_set()`：判断当前是否「绿灯放行」状态。

下面是一个模拟红绿灯，然后汽车通行的例子：

```python
# 利用 Event 类模拟红绿灯
import threading
import time

event = threading.Event()


def lighter():
    green_time = 5       # 绿灯时间
    red_time = 5         # 红灯时间
    event.set()          # 初始设为绿灯
    while True:
        print("\33[32;0m 绿灯亮...\033[0m")
        time.sleep(green_time)
        event.clear()
        print("\33[31;0m 红灯亮...\033[0m")
        time.sleep(red_time)
        event.set()

def run(name):
    while True:
        if event.is_set():      # 判断当前是否"放行"状态
            print("一辆[%s] 呼啸开过..." % name)
            time.sleep(1)
        else:
            print("一辆[%s]开来，看到红灯，无奈的停下了..." % name)
            event.wait()
            print("[%s] 看到绿灯亮了，瞬间飞起....." % name)


if __name__ == '__main__':
    light = threading.Thread(target=lighter,)
    light.start()

    for name in ['奔驰', '宝马', '奥迪']:
        car = threading.Thread(target=run, args=(name,))
        car.start()
```

#### 4）条件 Condition

类名：Condition

Condition 称作条件锁，依然是通过 `acquire()`/`release()` 加锁解锁。

`wait([timeout])` 方法将使线程进入 Condition 的等待池等待通知，并释放锁。使用前线程必须已获得锁定，否则将抛出异常。

`notify()` 方法将从等待池挑选一个线程并通知，收到通知的线程将自动调用 `acquire()` 尝试获得锁定（进入锁定池），其他线程仍然在等待池中。调用这个方法不会释放锁定。使用前线程必须已获得锁定，否则将抛出异常。

`notifyAll()` 方法将通知等待池中所有的线程，这些线程都将进入锁定池尝试获得锁定。调用这个方法不会释放锁定。使用前线程必须已获得锁定，否则将抛出异常。

如下示例：

```python
import threading
import time

num = 0
con = threading.Condition()


class Foo(threading.Thread):

    def __init__(self, name, action):
        super(Foo, self).__init__()
        self.name = name
        self.action = action

    def run(self):
        global num
        con.acquire()
        print("%s开始执行..." % self.name)
        while True:
            if self.action == "add":
                num += 1
            elif self.action == 'reduce':
                num -= 1
            else:
                exit(1)
            print("num当前为：", num)
            time.sleep(1)
            if num == 5 or num == 0:
                print("暂停执行%s！" % self.name)
                con.notify()
                con.wait()
                print("%s开始执行..." % self.name)
        con.release()


if __name__ == '__main__':
    a = Foo("线程A", 'add')
    b = Foo("线程B", 'reduce')
    a.start()
    b.start()
```

如果不强制停止，程序会一直循环执行下去。

### 定时器 Timer

定时器 `Timer` 类是 `threading` 模块中的一个小工具，用于指定 n 秒后执行某操作。

```python
from threading import Timer


def hello():
    print("hello, world")

# 表示 1 秒后执行 hello 函数
t = Timer(1, hello)
t.start()
```

### 通过 with 语句使用线程锁

所有的线程锁都有一个加锁和释放锁的动作，非常类似文件的打开和关闭。在加锁后，如果线程执行过程中出现异常或者错误，没有正常的释放锁，那么其他的线程会造到致命性的影响。通过 `with` 上下文管理器，可以确保锁被正常释放。其格式如下：

```python
with some_lock:
    # 执行任务...
```

这相当于：

```python
some_lock.acquire()
try:
    # 执行任务..
finally:
    some_lock.release()
```

### 线程池

在使用多线程处理任务时也不是线程越多越好。因为在切换线程的时候，需要切换上下文环境，线程很多的时候，依然会造成 CPU 的大量开销。为解决这个问题，线程池的概念被提出来了。

预先创建好一个数量较为优化的线程组，在需要的时候立刻能够使用，就形成了线程池。在 Python 中，没有内置的较好的线程池模块，需要自己实现或使用第三方模块。

下面是一个简单的线程池：

```python
import queue
import time
import threading


class MyThreadPool:
    def __init__(self, maxsize=5):
        self.maxsize = maxsize
        self._pool = queue.Queue(maxsize)   # 使用queue队列，创建一个线程池
        for _ in range(maxsize):
            self._pool.put(threading.Thread)

    def get_thread(self):
        return self._pool.get()

    def add_thread(self):
        self._pool.put(threading.Thread)


def run(i, pool):
    print('执行任务', i)
    time.sleep(1)
    pool.add_thread()   # 执行完毕后，再向线程池中添加一个线程类


if __name__ == '__main__':

    pool = MyThreadPool(5)  # 设定线程池中最多只能有5个线程类

    for i in range(20):
        t = pool.get_thread()   # 每个t都是一个线程类
        obj = t(target=run, args=(i, pool)) # 这里的obj才是正真的线程对象
        obj.start()

    print("活动的子线程数：", threading.active_count()-1)
```

分析一下上面的代码：

* 实例化一个 `MyThreadPool` 的对象，在其内部建立了一个最多包含 5 个元素的阻塞队列，并一次性将 5 个 Thread 类型添加进去。
* 循环 100 次，每次从 pool 中获取一个 `thread` 类，利用该类，传递参数，实例化线程对象。
* 在 run() 方法中，每当任务完成后，又为 pool 添加一个 thread 类，保持队列中始终有 5 个 thread 类。
* 一定要分清楚，代码里各个变量表示的内容。`t` 表示的是一个线程类，也就是 `threading.Thread`，而 `obj` 才是正真的线程对象。

上面的例子是把线程类当做元素添加到队列内，从而实现的线程池。这种方法比较糙，每个线程使用后就被抛弃，并且一开始就将线程开到满，因此性能较差。下面是一个相对好一点的例子，在这个例子中，队列里存放的不再是线程类，而是任务，线程池也不是一开始就直接开辟所有线程，而是根据需要，逐步建立，直至池满。

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-

"""
一个基于thread和queue的线程池，以任务为队列元素，动态创建线程，重复利用线程，
通过close和terminate方法关闭线程池。
"""
import queue
import threading
import contextlib
import time

# 创建空对象,用于停止线程
StopEvent = object()


def callback(status, result):
    """
    根据需要进行的回调函数，默认不执行。
    :param status: action函数的执行状态
    :param result: action函数的返回值
    :return:
    """
    pass


def action(thread_name, arg):
    """
    真实的任务定义在这个函数里
    :param thread_name: 执行该方法的线程名
    :param arg: 该函数需要的参数
    :return:
    """
    # 模拟该函数执行了0.1秒
    time.sleep(0.1)
    print("第%s个任务调用了线程 %s，并打印了这条信息！" % (arg+1, thread_name))


class ThreadPool:

    def __init__(self, max_num, max_task_num=None):
        """
        初始化线程池
        :param max_num: 线程池最大线程数量
        :param max_task_num: 任务队列长度
        """
        # 如果提供了最大任务数的参数，则将队列的最大元素个数设置为这个值。
        if max_task_num:
            self.q = queue.Queue(max_task_num)
        # 默认队列可接受无限多个的任务
        else:
            self.q = queue.Queue()
        # 设置线程池最多可实例化的线程数
        self.max_num = max_num
        # 任务取消标识
        self.cancel = False
        # 任务中断标识
        self.terminal = False
        # 已实例化的线程列表
        self.generate_list = []
        # 处于空闲状态的线程列表
        self.free_list = []

    def put(self, func, args, callback=None):
        """
        往任务队列里放入一个任务
        :param func: 任务函数
        :param args: 任务函数所需参数
        :param callback: 任务执行失败或成功后执行的回调函数，回调函数有两个参数
        1、任务函数执行状态；2、任务函数返回值（默认为None，即：不执行回调函数）
        :return: 如果线程池已经终止，则返回True否则None
        """
        # 先判断标识，看看任务是否取消了
        if self.cancel:
            return
        # 如果没有空闲的线程，并且已创建的线程的数量小于预定义的最大线程数，则创建新线程。
        if len(self.free_list) == 0 and len(self.generate_list) < self.max_num:
            self.generate_thread()
        # 构造任务参数元组，分别是调用的函数，该函数的参数，回调函数。
        w = (func, args, callback,)
        # 将任务放入队列
        self.q.put(w)

    def generate_thread(self):
        """
        创建一个线程
        """
        # 每个线程都执行call方法
        t = threading.Thread(target=self.call)
        t.start()

    def call(self):
        """
        循环去获取任务函数并执行任务函数。在正常情况下，每个线程都保存生存状态，  直到获取线程终止的flag。
        """
        # 获取当前线程的名字
        current_thread = threading.currentThread().getName()
        # 将当前线程的名字加入已实例化的线程列表中
        self.generate_list.append(current_thread)
        # 从任务队列中获取一个任务
        event = self.q.get()
        # 让获取的任务不是终止线程的标识对象时
        while event != StopEvent:
            # 解析任务中封装的三个参数
            func, arguments, callback = event
            # 抓取异常，防止线程因为异常退出
            try:
                # 正常执行任务函数
                result = func(current_thread, *arguments)
                success = True
            except Exception as e:
                # 当任务执行过程中弹出异常
                result = None
                success = False
            # 如果有指定的回调函数
            if callback is not None:
                # 执行回调函数，并抓取异常
                try:
                    callback(success, result)
                except Exception as e:
                    pass
            # 当某个线程正常执行完一个任务时，先执行worker_state方法
            with self.worker_state(self.free_list, current_thread):
                # 如果强制关闭线程的flag开启，则传入一个StopEvent元素
                if self.terminal:
                    event = StopEvent
                # 否则获取一个正常的任务，并回调worker_state方法的yield语句
                else:
                    # 从这里开始又是一个正常的任务循环
                    event = self.q.get()
        else:
            # 一旦发现任务是个终止线程的标识元素，将线程从已创建线程列表中删除
            self.generate_list.remove(current_thread)


    def close(self):
        """
        执行完所有的任务后，让所有线程都停止的方法
        """
        # 设置flag
        self.cancel = True
        # 计算已创建线程列表中线程的个数，
        # 然后往任务队列里推送相同数量的终止线程的标识元素
        full_size = len(self.generate_list)
        while full_size:
            self.q.put(StopEvent)
            full_size -= 1


    def terminate(self):
        """
        在任务执行过程中，终止线程，提前退出。
        """
        self.terminal = True
        # 强制性的停止线程
        while self.generate_list:
            self.q.put(StopEvent)

# 该装饰器用于上下文管理
    @contextlib.contextmanager
    def worker_state(self, state_list, worker_thread):
        """
        用于记录空闲的线程，或从空闲列表中取出线程处理任务
        """
        # 将当前线程，添加到空闲线程列表中
        state_list.append(worker_thread)
        # 捕获异常
        try:
            # 在此等待
            yield
        finally:
            # 将线程从空闲列表中移除
            state_list.remove(worker_thread)

# 调用方式
if __name__ == '__main__':
    # 创建一个最多包含5个线程的线程池
    pool = ThreadPool(5)
    # 创建100个任务，让线程池进行处理
    for i in range(100):
        pool.put(action, (i,), callback)
    # 等待一定时间，让线程执行任务
    time.sleep(3)
    print("-" * 50)
    print("\033[32;0m任务停止之前线程池中有%s个线程，空闲的线程有%s个！\033[0m"
          % (len(pool.generate_list), len(pool.free_list)))
    # 正常关闭线程池
    pool.close()
    print("任务执行完毕，正常退出！")
    # 强制关闭线程池
    # pool.terminate()
    # print("强制停止任务！")
```

（完）
