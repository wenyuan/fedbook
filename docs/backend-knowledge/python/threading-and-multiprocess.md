# 多线程、多进程

## 什么是进程

> 操作系统中执行的每一个程序都是一个进程，比如微信、QQ。

**概念**：

* 进程是 CPU **资源分配的最小单位**
* 操作系统会给进程分配内存空间，每个进程都会有自己的地址空间、数据栈以及其他用于跟踪进程执行的辅助数据
* 操作系统管理所有进程的执行，为它们合理的分配资源

**特点**：

* 进程可以通过 fork、spawn 的方式来创建新的进程来执行其他任务
* 不过新的进程有自己独立的内存空间、数据栈
* 因此不同进程间需要通过通信机制（IPC）来实现数据共享

**常见通信机制**：

* 管道
* 信号
* 套接字
* 共享内存区

## 什么是线程

**概念**：

* 线程是 CPU **调度的最小单位**
* 它被包含在进程之中，是进程中的实际运作单元
* 一个进程中可以并发多个线程，每条线程并行执行不同的任务

**特点**：

* 进程有独立的地址空间，线程没有单独的地址空间（同一进程内的线程共享进程的地址空间）
* 相对于进程来说，线程间的信息共享和通信更加容易

**进程与线程区别**：

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

**一般用法**：

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

**多进程实战**：

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

**知识点**：

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



