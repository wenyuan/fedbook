# 使用 subprocess 执行 cmd

## 关于 subprocess

subprocess 这个模块可以用来产生子进程，并连接到子进程的标准输入/输出/错误中去，还可以得到子进程的返回值。

它是一个标准库，无需另外安装。

> subprocess 意在替代其他几个老的模块或者函数，将它们的功能集中到一起：
> * os.system
> * os.spawn*
> * os.popen* –废弃
> * popen2.* –废弃
> * commands.* –废弃，3.x中被移除

## subprocess.Popen()

Popen 类用于创建和管理进程，子程序将在新进程中被执行完成。在 UNIX/Linux 中执行子程序，该类会使用 `os.execvp()` 函数。而在 Windows 中执行子程序，该类将使用 `CreateProcess()` 函数。

首先看一下 `subprocess.Popen()` 的常用参数：

```python
class subprocess.Popen(args, bufsize=0, executable=None, stdin=None,
stdout=None, close_fds=False, shell=False, universal_newlines=False,
stderr=None, preexec_fn=None, cwd=None, env=None, startupinfo=None, creationflags=0)
```

* args：它可以是一系列程序参数或单个字符串。如果 args 是一个序列，则 args 中的第一项将作为程序被执行。如果 args 是一个字符串，则会将 args 作为序列传递。
* bufsize：如果 bufsize 为 0（默认值是 0），则表示无缓冲。如果 bufsize 为 1，则表示行缓冲。如果 bufsize 是任何其他正值，则使用给定大小的缓冲区。如果 bufsize 是任何其他负值，则表示完全缓冲。
* executable：指定替换程序。
* stdin、stdout 和 stderr：这些参数分别定义标准输入、标准输出和标准错误。
* close_fds：在 Linux 中，如果 close_fds 为 True，则程序在执行子进程之前将关闭除 0、1 和 2 之外的所有文件描述符。在 Windows 中，如果 close_fds 为 True，则子进程将不继承句柄。
* shell：它表示是否使用 Shell 执行程序，默认为 False。
  * 如果 shell 为 True，则会将 args 作为字符串传递。在 Linux 中，如果 shell 为 True，则 Shell 程序默认为 `/bin/sh`。如果 args 是一个字符串，则该字符串指定要通过 Shell 执行的命令。
  * 如果 shell 为 False，则需要将 args 作为数组传递，并将数组的第一个元素作为命令，剩下的全部作为该命令的参数。
* preexec_fn：设置可调用对象，将在执行子进程之前调用。
* env：如果值不是 None，则映射将为新进程定义环境变量。
* universal_newlines：如果值为 True，则 stdout 和 stderr 将以自动换行模式打开文本文件。

下面是几个[示例程序](https://github.com/wenyuan/practice-in-python/blob/main/devops-case/subprocess_example.py)。

### 执行命令，不等待子进程

```python
import subprocess

def exec_without_block():
    # 或者：child = subprocess.Popen(['ping', '-c', '4', 'www.baidu.com'])
    child = subprocess.Popen('ping -c 4 www.baidu.com', shell=True)
    print(child)
    print('hello world')
```

从执行结果可以看到 Python 并没有等到 child 子进程执行的 Popen 操作完成就执行了 print 操作。

### 执行命令，添加子进程等待

为了让主程序等待子进程完成后再继续往下执行，我们必须调用 Popen 对象的 `wait()` 或 `communicate()` 方法，这样父进程才会等待（也就是阻塞父进程）。

```python
import subprocess

def exec_with_block():
    child = subprocess.Popen('ping -c 4 www.baidu.com', shell=True)
    child.wait()
    print(child)
    print('hello world')
```

### 执行命令，获取返回结果

虽然 `wait()` 方法也可以阻塞父进程，直到子进程结束。但是当我们需要从子进程读取大量输出时，使用 `wait()` 方法可能会导致死锁，所以一般建议用 `communicate()` 方法稳妥一些。

如下例子，在 Popen() 建立子进程的时候改变标准输入、标准输出和标准错误，从而获取执行结果。

```python
import subprocess

# 获取命令执行结果
def get_exec_result():
    child = subprocess.Popen('cat /etc/issue',
                             shell=True,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE)
    stdout, stdrr = child.communicate()
    # 检查是否有错误输出
    if child.returncode != 0:
        print('Error: %s' % stdrr)
    else:
        print('Output: %s' % stdout)
```

## 参考资料

* [subprocess](https://docs.python.org/zh-cn/3/library/subprocess.html "subprocess -- 子进程管理")

（完）
