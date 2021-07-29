# 使用 Fabric 执行 SSH

## 关于 Fabric

Fabric 是 Python 库中的一个模块，它是基于 Paramiko 的基础上做了一层更高的封装，操作起来更加方便。我们可以用它通过网络进行系统管理和应用程序部署，也可以通过 SSH 执行 Shell 命令。 

由于 Fabric 是 Python 的一个第三方库，首先需要安装它：

```bash
sudo pip install fabric
```

> 题外话：曾经有一段时间 Fabric 只支持到 Python2，所以有人 Fork 官方仓库后改写成了[支持 Python3 的版本](https://github.com/mathiasertl/fabric/)，也就是网上大部分教程通过 `pip install fabric3` 安装的包。  
> 后来 [fabric 官方](https://github.com/fabric/fabric/)对 Python3 做了支持，而后 Fabric3 的作者也在 README 中加了 deprecated 标识，意为不再维护。  
> 所以尽管 Fabric3 比较好用，大部分网上的教程和书籍也都是基于它在开发，但处于稳定性和持续维护性角度考虑，我在 Python3 中将继续沿用官方版本的 Fabric。  
> 关于三者的区别：[Clarify fabric vs fabric2 vs fabric3 differences](https://github.com/fabric/fabric/issues/1791)

## 一个简单的例子

下面是一个使用 Fabric 连接远程设备的示例程序（[`fabric_example.py`](https://github.com/wenyuan/practice-in-python/blob/main/devops-case/fabric_example.py)）：

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

from fabric import Connection
from paramiko import AuthenticationException


def do_ssh(host, username, password, commands):
    try:
        client = Connection(host=host, user=username, port=22, connect_kwargs={'password': password})
        # 执行操作
        for command in commands:
            res = client.run(command, hide=True)
            print(res.stdout)
        client.close()
    except AuthenticationException:
        print('{host} 密码错误'.format(host=host))
    except Exception as e:
        print(repr(e))


if __name__ == "__main__":
    host = '192.168.10.x'
    username = 'admin'
    password = '******'
    commands = ['pwd', 'ls']
    do_ssh(host, username, password, commands)
```

Fabric 模块里上面代码中用到的方法介绍：

* `Connection` 类：用于创建连接。
* `run()`：该方法可在连接的服务器上运行 Shell 命令。如果需要用管理员权限，则需替换成 `sudo()` 方法；如果要在本地执行 Shell 命令，则需替换成 `local()` 方法。
  * 参数 `warn`：默认为 `False`，默认情况下会因为 Shell 命令的错误输出而抛错, 也就是直接抛出 `stderr`。如果设为 `True`, 就会将 Shell 命令的错误输出写到 Result 对象的 `stderr` 内。
  * 参数 `hide`：默认为 `False`，默认情况下将远程的输出信息在当前命令行输出。为 `True` 时，则不会输出。但不论是什么, 都不会影响 Result 对象的 `stdout` 和 `stderr` 结果，还可以只隐藏 `stdout` 或 `stderr`。
  * 参数 `watchers`：传入的是一个包含诺干 Responder 实例的列表。当需要运行交互式的命令时，可以用 Responder 对象来匹配输出，并写入输入，做自动化部署时很实用。
  * 参数 `pty`：默认为 `True`，这个参数最好别动，不然输出内容可能会混乱。

关于 `run()` 的输出结果：

执行 Connection 类的 `run()` 方法后，直接输出的是一个 fabric.runners.Result 类，我们可以把其中的信息解析出来：

```python
print(result.stdout)  # /home/admin
print(result.exited)  # 0
print(result.ok)      # True
print(result.failed)  # False
print(result.command) # pwd
print(result.connection.host) # 192.xx.xx.xx
```

## 命令行用法

上例代码可写在任意的 .py 脚本中，然后运行该脚本，或者稍微封装下再导入到其它脚本中使用。

另外，Fabric 还是个命令行工具，可以通过 `fab` 命令来执行任务。如下代码示例：

```python
# 文件名：fabfile.py
from fabric import Connection
from fabric import task

host_ip = '192.168.10.xx'  # 服务器地址
user_name = 'root'         # 服务器用户名
password = '******'        # 服务器密码
cmd = 'date'               # Shell 命令，查询服务器上的时间

@task
def test(c):
    """
    Get date from remote host.
    """
    con = Connection(host_ip, user_name, connect_kwargs={'password': password})
    result = con.run(cmd, hide=True)
    print(result.stdout)  # 只打印时间
```

解释一下，需要注意的关键点有：

* `fabfile.py` 文件名：入口代码的脚本名必须用这个名字
* `@task` 装饰器：需要从 fabric 中引入这个装饰器，它是对 invoke 的 `@task` 装饰器的封装，实际用法跟 invoke 一样（注意：它也需要有上下文参数 `c`，但实际上它并没有在代码块中使用，而是用了 Connection 类的实例）

然后，在该脚本同级目录的命令行窗口中，可以查看和执行相应的任务：

```bash
>>> fab -l
Available tasks:
  test   Get date from remote host.

>>> fab test
Fri Feb 14 16:10:24 CST 2021
```

执行 `fab --help`，可以看到该命令支持的所有参数与解释：

* `--prompt-for-login-password`：令程序在命令行中输入 SSH 登录密码（上例在代码中指定了 connect_kwargs.password 参数，若用此选项，可要求在执行时再手工输入密码）
* `--prompt-for-passphrase`：令程序在命令行中输入 SSH 私钥加密文件的路径
* `-H` 或 `--hosts`：指定要连接的 host 名
* `-i` 或 `--identity`：指定 SSH 连接所用的私钥文件
* `-S` 或 `--ssh-config`：指定运行时要加载的 SSH 配置文件

关于 Fabric 的命令行接口，更多内容可[查看文档](https://docs.fabfile.org/en/2.5/cli.html)。

## 交互式操作

上面的示例程序我们通过 Fabric 模块连接了一台远程服务器，执行命令后打印了输出结果。

有时候远程服务器上若有交互式提示，要求输入密码或 yes 之类的信息，这就要求 Fabric 能够监听并作出回应。

以下是一个简单示例。引入 invoke 的 Responder，初始化内容是一个正则字符串和回应信息，最后赋值给 watchers 参数：

```python
from invoke import Responder
from fabric import Connection
c = Connection('host')
sudopass = Responder(
     pattern=r'\[sudo\] password:',
     response='mypassword\n')
c.run('sudo whoami', pty=True, watchers=[sudopass])
```

## 传输文件

本地与服务器间的文件传输是常见用法。Fabric 在这方面做了很好的封装，Connection 类中有以下两个方法可用：

* `get(*args, **kwargs)`：拉取远端文件到本地文件系统或类文件（file-like）对象
* `put(*args, **kwargs)`：推送本地文件或类文件对象到远端文件系统

在已建立连接的情况下，示例：

```python
# (略)
con.get('/opt/123.txt', '123.txt')
con.put('test.txt', '/opt/test.txt')
```

第一个参数指的是要传输的源文件，第二个参数是要传输的目的地，可以指定成文件名或者文件夹（为空或 `None` 时，使用默认路径）：

```python
# (略)
con.get('/opt/123.txt', '')  # 为空时，使用默认路径
con.put('test.txt', '/opt/') # 指定路径 /opt/
```

`get()` 方法的默认存储路径是 `os.getcwd()` ，而 `put()` 方法的默认存储路径是 `home` 目录。

## 服务器批量操作

对于服务器集群的批量操作，最简单的实现方法是用 for 循环，然后逐一建立 connection 和执行操作，类似这样：

```python
for host in ('server1', 'server2', 'server3'):
    result = Connection(host).run('uname -s')
```

但有时候，这样的方案会存在问题：

* 如果存在多组不同的服务器集群，需要执行不同操作，那么需要写很多 for 循环
* 如果想把每组操作的结果聚合起来（例如字典形式，key-主机，value-结果），还得在 for 循环之外添加额外的操作
* for 循环是顺序同步执行的，效率太低，而且缺乏异常处理机制（若中间出现异常，会导致跳出后续操作）

对于这些问题，Fabric 提出了 Group 的概念，可将一组主机定义成一个 Group，它的 API 方法跟 Connection 一样，即一个 Group 可简化地视为一个 Connection。

然后，开发者只需要简单地操作这个 Group，最后得到一个结果集即可，减少了自己在异常处理及执行顺序上的工作。

Fabric 提供了一个 fabric.group.Group 基类，并由其派生出两个子类，区别是：

* `SerialGroup(hosts, **kwargs)`：按串行方式执行操作
* `ThreadingGroup(hosts, **kwargs)`：按并发方式执行操作

Group 的类型决定了主机集群的操作方式，我们只需要做出选择即可。然后，它们的执行结果是一个 fabric.group.GroupResult 类，它是 dict 的子类，存储了每个主机 connection 及其执行结果的对应关系。

```python
from fabric import SerialGroup
results = SerialGroup('server1', 'server2', 'server3').run('uname -s')
print(results)

# 输出：
<GroupResult: {
    <Connection 'server1'>: <CommandResult 'uname -s'>,
    <Connection 'server2'>: <CommandResult 'uname -s'>,
    <Connection 'server3'>: <CommandResult 'uname -s'>,
}>
```

另外，GroupResult 还提供了 failed 与 succeeded 两个属性，可以取出失败/成功的子集。由此，也可以方便地批量进行二次操作。[官方文档](https://docs.fabfile.org/en/2.5/api/group.html)

## 身份认证

Fabric 使用 SSH 协议来建立远程会话，它是一种相对安全的基于应用层的加密传输协议。

基本来说，它有两种级别的安全认证方式：

* 基于口令的身份认证：使用账号与密码来登录远程主机，安全性较低，容易受到「中间人」攻击。
* 基于密钥的身份认证：使用密钥对方式（公钥放服务端，私钥放客户端），不会受到「中间人」攻击，但登录耗时较长。

前面在举例时，我们用了第一种方式，即通过指定 `connect_kwargs.password` 参数，使用口令来登录。

Fabric 当然也支持采用第二种方式，有三种方法来指定私钥文件的路径，优先级如下：

* 优先查找 `connect_kwargs.key_filename` 参数，找到则用作私钥；
* 其次查找命令行用法的 `--identify` 选项；
* 最后默认使用操作系统的 `ssh_config` 文件中的 `IdentityFile` 的值。

如果私钥文件本身还被加密过，则需要使用 `connect_kwargs.passphrase` 参数。

## 配置文件

Fabric 支持把一些参数项与业务代码分离，即通过配置文件来管理它们，例如前面提到的密码和私钥文件，可写在配置文件中，避免与代码耦合。

Fabric 基本沿用了 Invoke 的配置文件体系（官方文档中列出了 9 层），同时增加了一些跟 SSH 相关的配置项。支持的文件格式有 .yaml、.yml、.json 与 .py（按此次序排优先级），推荐使用 yaml 格式（后缀可简写成 yml）。

其中，比较常用的配置文件有：

* 系统级的配置文件：`/etc/fabric.yml`
* 用户级的配置文件：`~/.fabric.yml`（Windows 在 `C:\Users\xxx` 下）
* 项目级的配置文件：`/myproject/fabric.yml`

以上文件的优先级递减，由于我的本地开发机器是 Windows 系统，为了方便，我在用户目录建一个 `.fabric.yml` 文件，内容如下：

```bash
# filename:.fabric.yml

user: root
connect_kwargs:
  password: xxxx
# 若用密钥，则如下
#  key_filename:
#    - your_key_file
```

我们把用户名和密码抽离出来了，所以脚本中就可以删掉这些内容：

```python
# 文件名：fabfile.py
from fabric import Connection
from fabric import task

host_ip = '47.xx.xx.xx'  # 服务器地址
cmd = 'date'             # Shell 命令，查询服务器上的时间

@task
def test(c):
    """
    Get date from remote host.
    """
    con = Connection(host_ip)
    result = con.run(cmd, hide=True)
    print(result.stdout) 
```

然后，在命令行中执行：

```bash
>>> fab test
Tue Feb 18 10:33:38 CST 2021
```

配置文件中还可以设置很多参数，详细可[查看文档](https://docs.fabfile.org/en/2.5/concepts/configuration.html)。

## 网络网关

如果远程服务是网络隔离的，无法直接被访问到（处在不同局域网），这时候需要有网关/代理/隧道，这个中间层的机器通常被称为跳板机或堡垒机。

Fabric 中有两种网关解决方案，对应到 OpenSSH 客户端的两种选项：

* ProxyJump：简单，开销少，可嵌套
* ProxyCommand：开销大，不可嵌套，更灵活

在创建 Fabric 的 Connection 对象时，可通过指定 gateway 参数来应用这两种方案。

ProxyJump 方式就是在一个 Connection 中嵌套一个 Connection  作为前者的网关，后者使用 SSH 协议的 `direct-tcpip` 为前者打开与实际远程主机的连接，而且后者还可以继续嵌套使用自己的网关。

```python
from fabric import Connection

c = Connection('internalhost', gateway=Connection('gatewayhost'))
```

ProxyCommand 方式是客户端在本地用 ssh 命令（类似 `ssh -W %h:%p gatewayhost`），创建一个子进程，该子进程与服务端进行通信，同时它能读取标准输入和输出。

这部分的实现细节分别在 `paramiko.channel.Channel` 和 `paramiko.proxy.ProxyCommand`，除了在参数中指定，也可以在 Fabric 支持的配置文件中定义。更多细节，请[查阅文档](https://docs.fabfile.org/en/2.5/concepts/networking.html)。

## 总结

本文把 Fabric 常见的几种用法都整理了一下，原因是 Fabric 之前对 Python3 的不兼容，导致出现了不同的分支。而网上关于 Fabric 的文章，甚至是最近两年出版的书籍，都是基于 Fabric3（非官方版）的，显然已经过时了。本文针对最新的官方文档，梳理出了较为全面的知识点。更详细的用法，还是得仔细研读官方的英文文档。

## 参考资料

* [Fabric](https://www.fabfile.org/)
* 《Python自动化运维：技术与最佳实践》  

（完）
