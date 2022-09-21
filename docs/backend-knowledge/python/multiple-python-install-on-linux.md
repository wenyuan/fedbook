# Python 多版本虚拟环境共存

> Windows 中要做到环境隔离，在使用 PyCharm 新建项目时直接选择 `New environment using [Options]` 即可，本文主要针对 Linux 环境。
> 
> 注意一下，下面这些操作，最好在 `root` 用户下运行

在实际开发过程中，经常需要同时用到多个版本的 Python，并在各个版本之间来回切换。或者对相同的 Python 版本，在不同的项目中使用不同版本的软件包。

能够实现这种需求的工具有很多，这里选择一个比较流行的虚拟环境工具：virtualenv，它能够在系统中建立多个不同并且相互不干扰的 Python 运行环境。

## 安装 Python

如果你只是想基于系统默认的 Python 版本，对多个项目的依赖包环境进行隔离，则不需要另外安装其他版本的 Python。

如果你要想在多个 Python 版本之间进行切换，首先要确保你已经安装所需的 Python 版本（比如这里我需要 Python3.8）。

从 Python [官网下载](https://www.python.org/downloads/) python3 源码安装包：

```bash
cd /opt
wget https://www.python.org/ftp/python/3.8.9/Python-3.8.9.tgz
```

编译安装：

```bash
mkdir /usr/bin/python3.8  # 创建安装 python 的文件夹

cd /opt
tar -zxvf Python-3.8.9.tgz

# 进入到源码中
cd Python-3.8.9

# 重要，指定 python 的安装路径，可以自己设置
./configure --prefix=/usr/bin/python3.8

# 编译安装
make
make install

# 安装完，移除附带的文件
cd /opt
rm -rf Python-3.8.9.tgz Python-3.8.9
```

因为后面是要在虚拟环境中使用这些另外安装的 Python 版本，所以就不配置 Python 环境变量了。

::: tip 小贴士
为了防止引起一些可能的问题，一般不建议卸载系统自带的 Python。
:::

## 安装工具

通过 pip 安装 virtualenv：

```bash
pip3 install virtualenv  # 用 pip3 来安装不会有报错
```

测试安装结果：

```bash
virtualenv --version
```

## 创建虚拟环境

然后，假定我们要开发一个新的项目，需要一套独立的 Python 运行环境，可以这么做：

第一步，创建目录：

```bash
mkdir my_project
cd my_project/
```

第二步，创建一个基于系统版本 Python 的独立运行环境，命名为 `venv`（可以是任意的，若省略名字将会把文件均放在当前目录）：

```bash
virtualenv venv
```

可以选择指定的一个 Python 解释器（比如 `python3.8`）：

```bash
virtualenv -p /usr/bin/python3.8/bin/python3.8 venv
```

命令 `virtualenv` 就可以创建一个独立的 Python 运行环境，并且默认已经安装到系统 Python 环境中的所有第三方包都不会复制过来，这样，我们就得到了一个不带任何第三方包的「干净」的 Python 运行环境。

::: tip 小贴士
在很多旧文章里面，会要你在执行上述命令时加上 `--no-site-packages` 参数，表示不不复制系统 Python 环境中的所有第三方包。实际上在 virtualenv 版本 20 开始就默认这个参数了，加上反而会报错。
:::

## 进入虚拟环境

新建的 Python 环境被放到当前目录下的 `venv` 目录。有了 `venv` 这个 Python 环境，要开始使用它，可以用 `source` 进入该环境：

```bash
source venv/bin/activate
```

执行完命令后，可以观察到命令提示符变了，有个 `(venv)` 前缀，表示当前环境是一个名为 `venv` 的 Python 环境。

接下来就可以正常安装各种第三方包，并运行 Python 命令。

在 `venv` 环境下，用 pip 安装的包都被安装到 `venv` 这个环境下，系统 Python 环境不受任何影响。也就是说，`venv` 环境是专门针对 `my_project` 这个应用创建的。

::: tip 小贴士
在新建的 `venv` 目录中，一开始有这三个文件：

* bin：是启动相关的文件，包括启动脚本和解释器。启动脚本就是我们用来激活虚拟环境的脚本。
* lib：保存的是库相关的东西。
* pyvenv.cfg：该文件是这个虚拟环境的配置文件。
:::

## 退出虚拟环境

如果要退出当前的 `venv` 环境，使用 `deactivate` 命令：

```bash
deactivate
```

此时就回到了系统默认的 Python 解释器，包括已安装的库也会回到默认的。现在 `pip` 或 `python` 命令均是在系统 Python 环境下执行。

完全可以针对每个应用创建独立的 Python 运行环境，这样就可以对每个应用的 Python 环境进行隔离。

## 删除虚拟环境

要删除一个虚拟环境，只需删除它的文件夹。

```bash
rm -rf venv
```

## 原理

virtualenv 是如何创建「独立」的 Python 运行环境的呢？原理很简单，就是把系统 Python 复制一份到 virtualenv 的环境，用命令 `source venv/bin/activate` 进入一个 virtualenv 环境时，virtualenv 会修改相关环境变量，让命令 `python` 和 `pip` 均指向当前的 virtualenv 环境。

## 在 crontab 里运行虚拟环境中的脚本

很多时候我们需要设置一个 crontab 来运行 Python 脚本，而这个脚本又是在虚拟环境中的。这个时候需要在 crontab 语句中手动指定使用虚拟环境路径下的 `python` 解释器，例如：

```bash
*/1 * * * * /home/user/my_project/venv/bin/python3.8 /home/user/my_project/cron_script.py
```

## 参考文档

[Pipenv & 虚拟环境](https://pythonguidecn.readthedocs.io/zh/latest/dev/virtualenvs.html)

（完）
