# 多线程、多进程

## 什么是进程

操作系统中执行的每一个程序都是一个进程，比如微信、QQ。

### 概念

* 进程是 CPU **资源分配的最小单位**
* 操作系统会给进程分配内存空间，每个进程都会有自己的地址空间、数据栈以及其他用于跟踪进程执行的辅助数据
* 操作系统管理所有进程的执行，为它们合理的分配资源

### 特点

* 进程可以通过 fork、spawn 的方式来创建新的进程来执行其他任务
* 不过新的进程有自己独立的内存空间、数据栈
* 因此不同进程间需要通过通信机制（IPC）来实现数据共享

### 常见通信机制

* 管道
* 信号
* 套接字
* 共享内存区

## 什么是线程

### 概念

* 线程是 CPU **调度的最小单位**
* 它被包含在进程之中，是进程中的实际运作单元
* 一个进程中可以并发多个线程，每条线程并行执行不同的任务

### 特点

* 进程有独立的地址空间，线程没有单独的地址空间（同一进程内的线程共享进程的地址空间）
* 相对于进程来说，线程间的信息共享和通信更加容易

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

### 多线程的好处

* 提升程序的性能和改善用户体验
* 今天日常使用的软件几乎都用到了多线程

### 多线程的坏处

* 站在其他进程的角度，多线程的程序对其他程序并不友好，因为它占用了更多的 CPU 执行时间，导致其他程序无法获得足够的 CPU 执行时间
* 编写和调试多线程的程序对开发者要求较高

## Python 中的多进程

Python 通过 `multiprocess` 模块中的 `Process` 类实现进程相关的功能。但是它基于 fork 机制，因此不被 Windows 平台支持。想要在 Windows 中运行，必须使用 `if __name__ == '__main__':` 的方式，显然这只能用于调试和学习，不能用于实际环境。

::: warning
在 `multiprocess` 模块中有大写的 `Process` 和小写的 `process`，这两者是完全不同的东西，导入时要小心和注意。
:::

### 代码示例

一般用法：

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


# 输出结果
这里是: Process-1, 父进程 id: 6192, 当前子进程 id: 11404
这里是: Process-2, 父进程 id: 6192, 当前子进程 id: 17996
这里是: Process-3, 父进程 id: 6192, 当前子进程 id: 2640
这里是: Process-4, 父进程 id: 6192, 当前子进程 id: 6588
这里是: Process-5, 父进程 id: 6192, 当前子进程 id: 17808
```

多进程实战：

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


# 输出结果
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


# 输出结果
开始下载: Python入门教程.pdf...
开始下载: 程序员养身之道.pdf...
程序员养身之道.pdf 下载完成! 耗费了5秒
Python入门教程.pdf 下载完成! 耗费了10秒
总共耗费了10.11秒.
```

知识点：

* **Process**：通过 `Process` 类创建进程对象
* **target**：通过 `target` 参数传入一个函数名来表示进程启动后要执行的代码
* **args**：是一个元组，代表传递给函数的参数列表
* **start**：Process 的 `start()` 方法来启动进程
* **join**：Process 的 `join()` 方法表示等待进程执行结束，才会往下执行

### 进程间数据共享

在Linux中，每个子进程的数据都是由父进程提供的，每启动一个子进程就从父进程克隆一份数据。

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


# 输出结果
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


# 输出结果
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


# 输出结果
[('num', 100)]
[('num', 101)]
[('num', 102)]
[('num', 103)]
[('num', 104)]
```

#### 3）使用 queues 的 Queue 类共享数据

multiprocessing 是一个包，它内部有一个 queues 模块，提供了一个 Queue 队列类，可以实现进程间的数据共享。

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


# 输出结果
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


# 输出结果
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

