# 如何限制用户可使用的命令

> 使用 Restricted Shell 来实现。

## 什么是 Restricted Shell

它不是一个独立的 Shell（比如 Bash、zsh 等），它是相当于所使用的 Shell 的一种限制级模式。如果你想将你所使用的 Shell 切换为 rbash 模式，那么可以在 Shell 启动的时候加上 `-restricted`，或 `–r` 选项，这样处理之后它就会以 Restricted Shell 模式启动。

例如，你现在的是 Bash，那么你可以使用 `bash -r` 命令将 Bourne Shell 以 Restricted Shell 模式启动：

```bash
# Ubuntu
bash -r

# CentOS7 中，不支持直接使用，可以用建立软链接的方式
ln -s /bin/bash /bin/rbash
# 这样，新创建的用户 demouser 的 shell 环境就是 rbash 环境
useradd -s /bin/rbash demouser
```

当使用 Restricted Shell 时，大多数的命令将被限制，甚至连当前工作目录都无法更改。具体的限制如下：

* 不能使用 `cd` 更改目录。
* 不能修改 `$PATH`，`$ENV`，`$HOME` 或 `$SHELL` 等环境变量的值。
* 不能执行包含 `/` 字符的文件名。例如 `/usr/bin/uname` 或 `./uname` 命令或程序。但是依然可以运行 `uname` 命令。也就是说，当前目录以外的程序或命令是无法被执行的。
* 不能使用 `>` 、`>>`、`>|`、`<>`、`>&`、`&>` 来重定向输出。
* 不能在脚本中或以其它方式关闭 `Restricted Shell` 模式。
* 不允许使用 `set +r` 或 `set +o\` 来关闭 Restricted Shell 模式。

## 创建受限用户步骤

### 建立软链接（Ubuntu 略过）

首先，在 Bash 所在位置创建一个名为 rbash 的符号链接，命令如下。以下命令需以 root 用户身份运行。

```bash
ln -s /bin/bash /bin/rbash
```

### 创建一个新的受限用户

这个用户创建的同时，将它的默认 Shell 设置为 rbash 模式，具体步骤如下（以 root 用户身份运行）：

```bash
useradd guest -s /bin/rbash

passwd guest

mkdir -p /home/guest/bin
```

现在，我们把允许用户运行的命令放在上面创建的 bin 目录里。

比如，我们允许用户仅运行 ls、mkdir、和 ping 这三个命令。当然，你还可以添加其它你允许用户运行的命令。

添加命令，其实就是给这个命令创建一个软件链接：

```bash
ln -s /bin/ls /home/guest/bin/ls
ln -s /bin/mkdir /home/guest/bin/mkdir
ln -s /bin/ping /home/guest/bin/ping
```

这时除了 bin 目录里的命令之外，用户是无法运行其它任何命令的。

### 编辑环境变量

> `.bash_profile` 中常用于配置环境变量和用户一些自定义别名等。  
> 当用户登录后这个文件就会被加载，随后该文件会显式调用 `.bashrc`，其内容主要为设置环境变量。

编辑 `/home/guest/.bash_profile` 文件，将 bin 目录添加进去：

```bash
vim /home/guest/.bash_profile
```

修改 PATH 变量：

```
# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi

# User specific environment and startup programs

#PATH=$PATH:$HOME/.local/bin:$HOME/bin
PATH=$HOME/bin

export PATH
```

按 ESC 键，然后键入 `:wq` 保存并关闭文件。

接下来，让我们来保护 `.bash_profile` 文件，防止用户修改。

```bash
chown root /home/guest/.bash_profile
chmod 755 /home/guest/.bash_profile
```

现在，当受限用户登录时，默认 Shell 就是 Restricted Shell（rbash）模式，它在刚运行的时候就会读取 `.bash_profile` 文件，将系统 PATH 环境变量设置为文件中 `$HOME/bin`，这样用户只能运行上面指定的三个命令了。

在 Restricted Shell 模式下用户不允许更改 PATH 值，同时 `.bash_profile` 文件的权限也不允许修改，这样用户就不能通过更改环境来绕过限制。

### 后续继续添加允许使用的命令

如果还要再给这个受限用户添加一些允许使用的命令，只需要重新登录到 root 用户，再把新命令的软链接添加到 `/home/guest/bin/` 即可：

```bash
# 比如添加 rm 命令
ln -s /bin/rm /home/guest/bin/rm
```

> 查看一个命令原始位置在哪：`which <命令名字>`，比如 `which rm`。

## 限制现有用户步骤

可以使用 [`usermod`](https://www.runoob.com/linux/linux-comm-usermod.html) 命令的 `-s`（shell）选项来更改现有用户登入后所使用的 Shell。

以下命令均使用 root 用户执行：

```bash
usermod -s /bin/rbash demouser
```

然后可以查看用户默认的 Shell 设置：

> 本地所有用户信息存储在文件 /etc/passwd。文件中的每一行代表一个用户的登录信息。可以使用 cat 或 less 命令查看该文件。

```bash
less /etc/passwd
```

输出中可以看到，每行有七个用冒号分隔的字段，其中最后一列就是用户的登录 Shell，默认是 `/bin/bash`。

最后别忘了限制用户修改其 $PATH 环境变量，然后设置你希望它能够执行的命令。

## 总结

通过以上简单的几个步骤，就可以限制一个用户的操作，使其在自己的家目录下工作，也只允许执行指定命令，保证 Linux 系统数据的安全。当然，这种方式不是最万能的，最保险的方式还是要把重要数据拷备出来保存，这样就可以降低数据出意外的概率。

## 参考资料

* [How to Use Restricted Shell to Limit What a Linux User Can Do](https://www.howtogeek.com/718074/how-to-use-restricted-shell-to-limit-what-a-linux-user-can-do/)

（完）
