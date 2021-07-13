# 案例：Telnet 远程控制主机

## 关于 Telnet

Telnet 是一种允许用户与远程服务器通信的网络协议，它经常被网络管理员用来远程访问和管理设备。在终端中运行 Telnet 命令，并给出远程服务器的 IP 地址或主机名，即可访问远程设备。

Telnet 基于 TCP，默认端口号为 23。首先需要确保它已安装在我们的系统上，如果没有安装，运行以下命令进行安装：

```bash
sudo apt-get install telnetd
```

要使用简单的终端运行 Telnet，只需要输入以下命令：

```bash
telnet ip_address_your_remote_server
```

## Python 实现 Telnet 功能

首先需要用到 Python 的 telnetlib 模块，它是一个标准库，无需另外安装。

下面是一个使用 Telnet 连接远程设备的示例程序（[`telnet_example.py`](https://github.com/wenyuan/practice-in-python/blob/main/std-lib/telnet_example.py)）：

```bash
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import telnetlib
import time


def do_telnet(host, username, password, commands):
    try:
        tn = telnetlib.Telnet(host, port=23, timeout=10)
    except:
        print('{host} 网络连接失败'.format(host=host))
        return False

    # 输入登录用户名
    tn.read_until('Username:')
    tn.write(username + '\n')

    # 输入登录密码
    tn.read_until('Password:')
    tn.write(password + '\n')

    time.sleep(2)
    command_result = tn.read_very_eager()
    if 'Local authentication is rejected' in command_result:
        print('{host} 登录失败，用户名或密码错误'.format(host=host))
        return False

    # 登录完毕后执行命令
    for command in commands:
        tn.write(command + '\n')
        time.sleep(2)
        command_result = tn.read_very_eager()
        print(command_result)

    # 执行完毕后，终止 Telnet 连接（或输入exit退出）
    tn.close()


if __name__ == "__main__":
    host = '192.168.10.x'
    username = 'admin'
    password = 'password'
    commands = ['display version', 'display interface description Vlanif']
    do_telnet(host, username, password, commands)
```

telnetlib 模块里上面代码中用到的方法介绍：

* `write()`：使用该方法向服务端发送命令，注意每个命令后要跟上换行符（`\n`）
* `read_until()`：当结果中存在想要的信息时返回。
* `read_very_eager()`：返回缓冲区中所有可用的数据（上次获取之后本次获取之前的所有输入输出），这里要设置延时 `time.sleep(2)`，才能保证数据读取完毕。

telnetlib 采用缓冲的处理方式，因此数据并不是一下子就返回的，而是先放在了缓冲区中，许多的读取处理都是围绕着这个缓冲区来的。而缓冲区的信息何时到达是不固定的，也许很快，也许很慢，也许分别到达，也许一下子就收到了。因此，对于数据不一定到齐的这种情况，就采用了 `read_until()` 来判断缓冲区中的数据是否有想要的内容，如果没有就等待，除非到达了超时时间。

## 总结

上面的示例程序使用 telnetlib 模块访问了 Huawei 交换机。首先从用户那里获取用户名和密码，以初始化与远程设备的 Telnet 连接。建立连接后，在远程设备上进行了进一步配置。远程登陆后，用户将能够访问远程服务器或设备。

如果远程连接其它厂家的设备，在连接时可能会有二次验证，以及连接验证失败时给出的错误提示会不同，需要具体问题具体分析。

但是这个 Telnet 协议有一个非常严重的缺点，即所有数据，包括用户名和密码都是以明文方式通过网络发送的，这会有安全风险。因此，现在我们很少使用 Telnet，并且它被一个非常安全的协议 Secure Shell 所取代，简称 SSH。

## 参考资料

* [telnetlib](https://docs.python.org/zh-cn/3/library/telnetlib.html "telnetlib -- Telnet 客户端")

（完）
