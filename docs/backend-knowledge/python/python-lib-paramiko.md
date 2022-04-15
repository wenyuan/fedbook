# 使用 Paramiko 执行 SSH

## 关于 SSH

SSH 是一种网络协议，用于远程访问，并管理一个或多个设备。SSH 使用公钥加密来实现安全性。Telnet 和 SSH 之间的重要区别在于 SSH 使用加密，这意味着通过网络传输的所有 SSH 数据都可以防止未经授权的实施拦截。

SSH 基于 TCP，默认端口号为 22。在终端运行 ssh 命令以连接远程服务器命令如下：

```bash
ssh host_name@host_ip_address
```

## 关于 Paramiko

Paramiko 是一个基于 Python 编写的、使用 SSH 协议的模块，跟 Xshell 和 Xftp 功能类似，支持加密与认证，可以上传下载和访问服务器的文件。

可以利用 Paramiko 模块写服务器脚本，在本地执行，比如持续更新代码，查看日志，批量配置集群等。

Paramiko 主要包含 SSHClient 和 SFTPClient 两个组件，分别用来执行命令和实现远程文件操作。

由于 Paramiko 是 Python 的一个第三方库，首先需要安装它：

```bash
sudo pip install paramiko
```

## 用法示例

下面是一个使用 Paramiko 连接远程设备的示例程序（[`paramiko_example.py`](https://github.com/wenyuan/practice-in-python/blob/main/devops-case/paramiko_example.py)）：

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用第三方库：paramiko
"""

import time
import paramiko
from paramiko.ssh_exception import NoValidConnectionsError
from paramiko.ssh_exception import AuthenticationException


def do_ssh(host, username, password, commands):
    client = paramiko.SSHClient()
    # 如果是之前没有连接过的 ip，会出现选择 yes 或者 no 的操作
    # 自动选择 yes
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname=host, port=22, username=username, password=password)
    except NoValidConnectionsError:
        print('{host} 无法连接'.format(host=host))
    except AuthenticationException:
        print('{host} 密码错误'.format(host=host))
    except Exception as e:
        print(repr(e))
    else:
        # 执行操作
        for command in commands:
            stdin, stdout, stderr = client.exec_command(command)
            # 获取命令执行的结果
            for line in stdout:
                print(line.strip('\n'))
        """ 使用 send 方式
        # 在 SSH server 端创建一个交互式的 shell
        shell = client.invoke_shell()
        time.sleep(0.2)
        for command in commands:
            # 利用 send 函数发送 cmd 到SSH server，添加 '\n' 做回车来执行 shell 命令
            # 注意不同的情况，如果执行完 telnet 命令后，telnet 的换行符是 '\r\n'
            command += '\n'
            # 利用 send 函数发送 command 到 SSH server
            shell.send(command)
            time.sleep(0.2)
            if shell.recv_ready():
                # .recv(bufsize) 通过 recv 函数获取回显
                stdout = ssh.recv(1024)
                print(stdout.decode('utf-8'))
        """
    finally:
        # 关闭连接
        client.close()


if __name__ == "__main__":
    host = '192.168.10.x'
    username = 'admin'
    password = '******'
    commands = ['hostname', 'ls']
    do_ssh(host, username, password, commands)
```

Paramiko 模块里上面代码中用到的方法介绍：

* `set_missing_host_key_policy(policy)`：设置连接的远程主机没有本地主机密钥时的策略。目前支持三种：RejectPolicy（the default），AutoAddPolicy，WarningPolicy
* `exec_command()`：该函数是将服务器执行完的结果一次性返回给你。
* `invoke_shell()`：也可以使用该函数来执行命令，它类似 shell 终端，可以将执行结果分批次返回，看到任务的执行情况，不会因为执行一个很长的脚本而不知道是否执行成功。

## 非交互式与交互式场景

**exec_command** 用于非交互式的场景，每次调用该方法就相当于重新开启了一个 command 窗口结束后就关闭了该窗口。

它的问题是无法连续进行操作，比如用该方法远程无法操作类似 `python` 或者 `mysql` 这样的 shell 窗口，一旦在 `exec_command()` 中输入类似 `python` 的指令，实际上会进入一个新的上下文环境以供输入 Python 特有的语法，但这个方法做不到这一点。

```python
import time
import paramiko

hostname = '192.168.10.x'
port = 22
username = 'admin'
password = '******'
timeout = 10
commands = ['pwd', 'ls -l']
 
if __name__ == "__main__":
    # 实例化 SSHClient
    client = paramiko.SSHClient()
    # 自动添加策略，保存服务器的主机名和密钥信息
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        # 连接 SSH 服务器，以用户名和密码进行认证
        client.connect(hostname=hostname, port=port, username=username, password=password, timeout=timeout)
    except Exception as e:
        print(e)
        exit(1)
    for command in commands:
        # 执行命令
        stdin, stdout, stderr = client.exec_command(command)
        # 打印结果
        result = stdout.read().decode('utf-8'))
        err = stderr.read().decode('utf-8')
        if len(err) != 0:
            print(err)
        else:
            print(result)
    # 关闭 SSHClient
    client.close()
```


**invoke_shell** 用于交互式场景，它类似 shell 终端，可以跟使用 SSH 终端客户端登录一样并使用终端仿真功能。如果想实现真正的交互式，就要使用 `invoke_shell()` 的方式。

```python
import time
import paramiko

hostname = '192.168.10.x'
port = 22
username = 'admin'
password = '******'
timeout = 10
commands = ['pwd', 'ls -l']
 
if __name__ == "__main__":
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname=hostname, port=port, username=username, password=password, timeout=timeout)
    except Exception as e:
        print(e)
        exit(1)
    # 创建一个交互式的 shell
    shell = client.invoke_shell()
    for command in commands:
        # 添加 '\n' 做回车来执行 shell 命令
        # 注意不同的情况，如果执行完 telnet 命令后，telnet 的换行符是 '\r\n'
        command += '\n'
        # 利用 send 函数发送 command 到 SSH server
        shell.send(command)
        time.sleep(0.2)
        # 检查通道的数据是否准备好读取，即数据是否被缓冲
        if shell.recv_ready():
            # .recv(bufsize) 通过 recv 函数获取回显
            stdout = shell.recv(1024)
            print(stdout.decode('utf-8'))
    # 关闭 SSHClient
    client.close()
```

## 总结

上面的示例程序我们通过 paramiko 模块连接了一台远程服务器，执行命令后打印了输出结果。

其中，`invoke_shell` 使用的是 shell channel，目的是实现交互式 shell 会话，就像使用 SSH 终端客户端登录一样并使用终端仿真功能；而 `exec_command` 的目的是使命令执行自动化，将命令作为「参数」，通过用户的默认 shell 程序，而不是作为「登录」shell 程序，这是主要的不同。

实际环境中在建立 SSH 连接后，我们可以在远程设备上执行所需的任何配置或操作。

## 参考资料

* [Paramiko](http://www.paramiko.org/)
* [Paramiko Demos](https://github.com/paramiko/paramiko/tree/master/demos)

（完）
