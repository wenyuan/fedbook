# 部署纯净的 Ubuntu 系统

有时候需要一个独立的服务器系统给自己用，又没有多余的物理机，就可以用 Docker 很快地来创建这样一台「虚拟机」。

## 部署系统

Docker 的官方仓库：[Docker Hub](https://hub.docker.com/)

```bash
# 拉取官方镜像，假定要拉取 Ubuntu 20.04
docker image pull ubuntu:20.04

# 查看本地 image 文件，确认拉取成功
docker image ls

# 运行该 image 文件
# --name：指定容器的名称，不指定的话会自动生成一个随机字符串
# --network host：容器将共享宿主机的 IP 和端口，而非虚拟出自己的网卡
# -c：对于这个基础的 Ubuntu 镜像，如果不加后面那串命令，它会启动并立即退出，因为该镜像本身没有提供一个前台进程来保持容器运行
docker container run -d --name [my_container_name] --network host ubuntu:20.04 /bin/bash -c "while true; do echo hello world; sleep 3600; done"

# 查看 container 有没有正常运行
docker container ps

# 修改容器名称（如果前面 run 的时候没有指定 --name）
# 因为第一个参数在匹配 NAME 后，也会再匹配 ID，所以为了防止改错，建议第一个参数就选择容器名称
docker container rename [old_container_name] [new_container_name]

# 进入容器
docker container exec -it [container_id] /bin/bash
```

## 容器维护

```bash
# 容器启停
docker container start|stop [container_id]

# 查看所有容器
docker container ps -a

# 查看正在运行的容器的日志
docker container logs [container_id]
```

## 安装常用环境组件

对于纯净的 Ubuntu 系统，很多系统命令是没有的。下列常用命令如果没有自带的话需要安装一下：

```bash
# 以下命令均使用 root 用户

# 先更新源
apt-get update

# 按需检查并安装常用命令
which rz          # 如果不存在，就安装 apt install lrzsz
which vim         # 如果不存在，就安装 apt install vim
which zip         # 如果不存在，就安装 apt install zip
which sudo        # 如果不存在，就安装 apt install sudo
which locate      # 如果不存在，就安装 apt install locate
which wget        # 如果不存在，就安装 apt install wget
which ping        # 如果不存在，就安装 apt install iputils-ping
which telnet      # 如果不存在，就安装 apt install telnet
which netstat     # 如果不存在，就安装 apt install net-tools
which gcc         # 如果不存在，就安装 apt install gcc
whick pkg-config  # 如果不存在，就安装 apt install pkg-config
which make        # 如果不存在，就安装 apt install make
which dialog      # 如果不存在，就安装 apt install dialog
which crontab     # 如果不存在，就安装 apt install cron
```

## 中文支持

### 系统中文字库

先测试一下能不能创建一个中文文件。如果发现在当前 Linux 环境中无法用中文字符创建文件，那是系统没有配置支持中文语言环境。

> 如果没有提前设置好语言环境，后续用编程语言创建带中文的文件，会在服务器上显示为形如 `''$'\350\360\220.xlsx'` 这样的乱码。

解决方法很简单，分为两个步骤：安装并设置字库、设置语言环境变量。

```bash
# 以下命令均使用 root 用户

# 首先看看系统有没有中文字库
locale -a | grep zh_CN

# 如果没有中文字库，需要先安装中文字库支持
apt install fonts-wqy-zenhei

# 激活中文字体
apt install locales

# 设置字库
dpkg-reconfigure locales
```

接下来就会进行语言选择，通过方向键浏览列表，使用空格来勾选，建议勾选下面两个（也可以直接全选，就是安装/激活时间会很长）：

* `en_US.UTF-8 UTF-8`
* `zh_CN.UTF-8 UTF-8`

之后回车，选择默认系统语言，还是推荐用英文（`en_US.UTF-8`），等安装完后单独到用户的环境变量里去设置中文支持，可以防止以后的一些坑（毕竟计算机系统中英文的兼容性更好）。

继续回车，系统开始自动配置。

现在到用户的环境变量里去设置中文支持：

```bash
# 首先查看当前 Shell
echo $SHELL

# 如果是 /bin/bash，就编辑以下文件（大部分情况）
vim ~/.bashrc

# 如果是 /bin/zsh，就编辑以下文件
vim ~/.zshrc
```

在文末追加：

```bash
# LANG
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
export LC_LANG=zh_CN.UTF-8
```

最后，保存并退出后，重载环境变量：

```bash
source ~/.bashrc
# 或者
source ~/.zshrc
```

现在就可以创建中文文件了，如果还是没有生效，可以重启 Linux。

### 文件字符编码

同样是中文问题，对于纯净的 Ubuntu 系统，如果发现 Windows 下中文字符显示正常、且是 utf-8 编码的文本，上传到 Linux 环境后用 vim 打开时中文字符都是乱码。

打开 vim 配置文件：`/etc/vim/vimrc`，末尾添加：

```bash
" Chinese language support
set fileencodings=utf-8,gb2312,gb18030,gbk,ucs-bom,cp936,latin1
set termencoding=utf-8
set fileformats=unix
set encoding=utf-8
set fileencoding=utf-8
```

## 容器系统启用 SSH

只需要简单步骤就可以在容器中启用 SSH，让外部可以直接连接入容器，使其更像是一台单独的 Linux 主机。

首先进入容器，默认会以 root 用户登入：

```bash
# 安装 OpenSSH 服务用以支持 SSH 远程连接
apt install openssh-server
```

修改 `/etc/ssh/sshd_config`，主要两处：

```bash
Port 10022            # 改端口，一定要改
PermitRootLogin yes   # 允许 root 直接登录
```

修改 root 密码：

```bash
# 执行命令以下然后按提示输入
passwd
```

重启 SSH 服务：

```bash
service ssh restart
```

此后就可以直接从本地直接连接这台机器的 `10022` 端口，就进入容器内部，此时容器表现得就像一台普通 Linux 主机。

## 通过 Container 制作 Image

官方的 Ubuntu 镜像太纯净了，如果想把上面定制化后的内容生成新的镜像，方便下次使用，可以按下面的操作进行。

核心是使用 `docker commit` 命令来完成，比起 `docker build` 来说步骤更少更快速。

```bash
# 将指定的容器（可以指定 ID 或者 NAME）打包为镜像
docker container commit -a "镜像作者" -m "说明文字" [old_container_id] [new_image_name]:[tag]
# 查看本地镜像
docker images
# 基于上述创建的新镜像创建新容器
docker container run -d --name [my_container_name] --network host [image_name]:[tag] /bin/bash -c "while true; do echo hello world; sleep 3600; done"
docker ps
```

（完）
