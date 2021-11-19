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

## Paramiko 用法示例

下面是一个使用 Paramiko 连接远程设备的示例程序（[`paramiko_example.py`](https://github.com/wenyuan/practice-in-python/blob/main/devops-case/paramiko_example.py)）：

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用第三方库：paramiko
"""

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

## 总结

上面的示例程序我们通过 paramiko 模块连接了一台远程服务器，执行命令后打印了输出结果。实际环境中在建立 SSH 连接后，我们可以在远程设备上执行所需的任何配置或操作。

## 参考资料

* [Paramiko](http://www.paramiko.org/)
* [Paramiko Demos](https://github.com/paramiko/paramiko/tree/master/demos)

（完）
