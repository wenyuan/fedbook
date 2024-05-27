# Redis 的安装与卸载

## Ubuntu 20.04 下安装

> 通过 `apt show redis-server` 命令可知，当前 Ubuntu 20.04 的官方软件仓库中提供的 Redis 版本为 5.0.7。  
> 因此选择从官方网站下载源码并编译安装的方式来安装 Redis 7。
> 以下所有命令使用 root 用户运行，如果没有 root 权限，则使用 sudo 命令以 root 权限运行。

### 准备依赖环境

```bash
apt update
gcc -v                   # 如果不存在，就安装 apt install gcc
dpkg -s build-essential  # 如果不存在，就安装 apt install build-essential
```

### 下载、编译、安装

```bash
# 我一般喜欢把这些中间件暂时下载到这里
cd /opt

# 下载
wget --no-check-certificate https://download.redis.io/releases/redis-7.0.0.tar.gz

# 解压
tar -zxvf redis-7.0.0.tar.gz
rm redis-7.0.0.tar.gz

# 进入安装文件目录
cd redis-7.0.0

# 编译
make

# 手动指定安装到 /usr/local/redis 目录
# 否则默认是 /usr/local/bin 目录
make install PREFIX=/usr/local/redis

# 由于修改了默认安装目录，所以要创建个软链接方便后面执行命令
ln -s /usr/local/redis/bin/redis-server /usr/local/bin/redis-server
ln -s /usr/local/redis/bin/redis-cli /usr/local/bin/redis-cli
```

### Redis 服务配置

先在 redis 目录下面创建 conf 文件夹和 data 文件夹：

```bash
cd /usr/local/redis
mkdir conf
mkdir data
```

然后从安装包复制一份 redis.conf 到 conf 文件夹下面：

```bash
cp /opt/redis-7.0.0/redis.conf /usr/local/redis/conf/redis-6379.conf
```

修改配置文件，并设置启动模式为后台模式，绑定 ip 修改为 0.0.0.0（生产环境禁止！！！），支持远程登录：

```bash
# 默认绑定
# bind 127.0.0.1 -::1
bind 0.0.0.0 -::1

# 监听端口号
port 6379

# 设置密码，去掉 # 注释，并把后面的密码设置成需要的密码
requirepass your_password

# 是否守护进程，默认是 no，改成 yes 以后会以后台运行模式启动
daemonize yes

# 日志文件名称
logfile "redis-6379.log"

# 指定 data 存放路径
dir /usr/local/redis/data
```

配置文件以后查看 Redis 的运行状态，OK，运行成功了。

```bash
cd /usr/local/redis

redis-server conf/redis-6379.conf
```

前台启动运行测试一下：

```bash
# 查看服务
ps -ef|grep redis

root@ubuntu-20:/usr/local/redis# ps -ef|grep redis
root     10990     0  0 15:24 ?        00:00:00 redis-server 127.0.0.1:6379
root     10998  1654  0 15:24 pts/1    00:00:00 grep --color=auto redis

root@ubuntu-20:/usr/local/redis# redis-cli -p 6379
127.0.0.1:6379> ping
(error) NOAUTH Authentication required.
127.0.0.1:6379> auth <password>
OK
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> 
```

测试结束，停止 Redis 服务：

> 这里要注意，由于我们对 Redis 设置了密码，因此不能用 `redis-cli shutdown` 命令来停止 Redis 服务。  
> 因为即使你通过参数 `redis-cli -a <password> shutdown` 来执行命令，也会报错：`Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.`  
> 这个特性导致接下来在 `/etc/init.d/redis` 脚本中的 `stop` 和 `restart` 命令实际上也是无法有效执行的。

```bash
# 登录 Redis 客户端后执行关闭服务的操作
127.0.0.1:6379> shutdown
not connected>
```

### 设置开机启动

从 redis 解压目录中，拷贝启动脚本到 `/etc/init.d` 文件夹：

```bash
cp /opt/redis-7.0.0/utils/redis_init_script /etc/init.d/redis
```

修改 Redis 启动脚本，主要修改 `EXEC` 和 `CLIEXEC` 执行启动命令的脚本目录和 `CONF` 配置文件目录。截取脚本中部分相关的内容，如下：

```bash
# 指定运行的客户端
EXEC=/usr/local/redis/bin/redis-server
# 客户端
CLIEXEC=/usr/local/redis/bin/redis-cli
# 核心配置文件
CONF="/usr/local/redis/conf/redis-${REDISPORT}.conf"

# 脚本里面只有 start 和 stop 脚本，可以增加 status 和 restart 脚本（在 "*)" 上面写入）
    status)  
        if [ -f $PIDPROFILE ]  
        then  
            echo 'Redis is running'  
        else  
            echo "Redis is not running"  
        fi  
        ;;  
    restart)  
        $0 stop  
        $0 start  
        ;;

# 如果 Redis 设置了访问密码，stop) 脚本需要做以下修改，主要是执行 redis-cli 命令时加上密码
$CLIEXEC -a your_password -p $REDISPORT shutdown
```

修改脚本执行权限：

```bash
cd /etc/init.d/
chmod 777 redis
```

用启动脚本启动服务：

```bash
[root@ubuntu-20 ~]# /etc/init.d/redis start
Starting Redis server...
[root@ubuntu-20 ~]# ps -ef|grep redis
root     29683     1  0 12:56 ?        00:00:00 /usr/local/redis/bin/redis-server 127.0.0.1:6379
root     29729  2522  0 12:57 pts/1    00:00:00 grep --color=auto redis

# 登录 Redis 客户端后执行关闭服务的操作
root@ubuntu-20:/usr/local/redis# redis-cli -p 6379
127.0.0.1:6379> auth <password>
OK
127.0.0.1:6379> shutdown
not connected>
```

开机启动管理：

```bash
# 进入目录，该目录是 Linux 系统中专门放置系统服务启停脚本的
cd /etc/init.d/

# 将 redis 加入到开启自启动
update-rc.d redis defaults

# 启动 redis 服务
/etc/init.d/redis start
```

当然了，如果需要关闭开机启动的功能：

```bash
# 取消开机启动
update-rc.d -f redis remove
```

### 卸载 Redis

* 先停止 Redis 服务
* 关闭 Redis 开机启动，并将启动脚本从 `/etc/init.d` 目录中删除
* 删除 Redis 安装目录
* 如果还想更干净可以通过 `find / -name redis*` 命令，将查到的文件夹及目录都删除即可

## CentOS 7.6 下安装

### 准备依赖环境

Redis 是由 C 语言开发，因此安装之前需要确保服务器已经安装了 gcc，可以通过以下命令检查服务器是否安装：

```bash
gcc -v
```

如果没有安装则通过以下命令安装：

```bash
yum install -y gcc
```

### 下载、编译、安装

从[官网下载](https://redis.io/download/) Redis7.0（截至 2022.5.3 最新版）并解压、编译、安装，设置连接 ip 和访问密码。

```bash
# 我一般喜欢把这些中间件暂时下载到这里
cd /opt

# 下载
wget https://download.redis.io/releases/redis-7.0.0.tar.gz

# 解压
tar -zxvf redis-7.0.0.tar.gz
rm redis-7.0.0.tar.gz

# 进入安装文件目录
cd redis-7.0.0

# 编译
make

# 安装到 /usr/local/redis 目录里
make install PREFIX=/usr/local/redis
```

### Redis 服务配置

先在 redis 目录下面创建 conf 文件夹和 data 文件夹：

```bash
cd /usr/local/redis
mkdir conf
mkdir data
```

然后从安装包复制一份 redis.conf 到 conf 文件夹下面：

```bash
cp /opt/redis-7.0.0/redis.conf /usr/local/redis/conf/redis-6379.conf
```

修改配置文件，并设置启动模式为后台模式，绑定 ip 修改为 0.0.0.0（生产环境禁止！！！），支持远程登录：

```bash
# 默认绑定
bind 0.0.0.0 -::1

# 监听端口号
port 6379

# 设置密码，去掉 # 注释，并把后面的密码设置成需要的密码
requirepass your_password

# 是否守护进程，默认是 no，改成 yes 以后会以后台运行模式启动
daemonize yes

# 日志文件名称
logfile "redis-6379.log"

# 指定 data 存放路径
dir /usr/local/redis/data
```

配置文件以后查看 Redis 的运行状态，OK，运行成功了。

```bash
cd /usr/local/redis

redis-server conf/redis-6379.conf 
```

前台启动运行测试一下：

```bash
# 查看服务
ps -ef|grep redis

[root@VM-16-7-centos redis]# ps -ef|grep redis
root     18460  2522  0 11:57 pts/1    00:00:00 redis-server 127.0.0.1:6379
root     18480 17576  0 11:57 pts/2    00:00:00 grep --color=auto redis

[root@VM-16-7-centos redis]# redis-cli -p 6379
127.0.0.1:6379> ping
PONG
127.0.0.1:6379>
```

测试结束，停止 Redis 服务：

```bash
cd /usr/local/redis

redis-cli shutdown
```

### 设置开机启动

从 redis 解压目录中，拷贝启动脚本到 `/etc/init.d` 文件夹：

```bash
cp /opt/redis-7.0.0/utils/redis_init_script /etc/init.d/redis
```

修改 Redis 启动脚本，主要修改 `EXEC` 和 `CLIEXEC` 执行启动命令的脚本目录和 `CONF` 配置文件目录。截取脚本中部分相关的内容，如下：

```bash
# 指定运行的客户端
EXEC=/usr/local/redis/bin/redis-server
# 客户端
CLIEXEC=/usr/local/redis/bin/redis-cli
# 核心配置文件
CONF="/usr/local/redis/conf/redis-${REDISPORT}.conf"

# 脚本里面只有 start 和 stop 脚本，可以增加 status 和 restart 脚本（在 "*)" 上面写入）
    status)  
        if [ -f $PIDPROFILE ]  
        then  
            echo 'Redis is running'  
        else  
            echo "Redis is not running"  
        fi  
        ;;  
    restart)  
        $0 stop  
        $0 start  
        ;;

# 如果 Redis 设置了访问密码，stop) 脚本需要做以下修改，主要是执行 redis-cli 命令时加上密码
$CLIEXEC -a your_password -p $REDISPORT shutdown
```

修改脚本执行权限：

```bash
cd /etc/init.d/
chmod 777 redis
```

脚本执行检查：

```bash
[root@VM-16-7-centos ~]# /etc/init.d/redis start
Starting Redis server...
[root@VM-16-7-centos ~]# ps -ef|grep redis
root     29683     1  0 12:56 ?        00:00:00 /usr/local/redis/bin/redis-server 127.0.0.1:6379
root     29729  2522  0 12:57 pts/1    00:00:00 grep --color=auto redis
```

开机启动管理：

```bash
# 进入目录，该目录是 Linux 系统中专门放置系统服务启停脚本的
cd /etc/init.d/

# 查看目前已经加入开机自启的服务进程
chkconfig --list nginx

# 添加 Redis 启动脚本为 chkconfig 管理的一个服务
chkconfig --add redis

# 将 Redis 加入开机自启
chkconfig redis on

# 关闭 Redis 开机启动
chkconfig redis off

# 删除 chkconfig 管理的 Redis 启动服务（如果确实不需要了）
chkconfig --del redis 
```

重启 Linux 操作系统并进行测试：

```bash
# 重启操作系统
[root@VM-16-7-centos init.d]# shutdown -r now
Connection closing...Socket close.

Connection closed by foreign host.

Disconnected from remote host(学习机) at 14:30:09.

# 重启完成，SSH 重新连接，进行测试
[root@VM-16-7-centos ~]# ps -ef|grep redis
root      1244     1  0 14:30 ?        00:00:00 /usr/local/redis/bin/redis-server 127.0.0.1:6379
root      2522  2422  0 14:32 pts/0    00:00:00 grep --color=auto redis
[root@VM-16-7-centos ~]# redis-cli -p 6379
127.0.0.1:6379> ping
PONG
127.0.0.1:6379>
```

可以看到 Redis 服务已经启动成功，大功告成。

### 防火墙相关问题

如果 Redis 需要开放远程连接（生产环境不推荐），那么可能会遇到防火墙的问题。

首先，如果使用的是阿里云等云厂家的服务器，无法连接的原因可能是需要去云管理平台，在可视化界面操作来开放相应的端口。

其次，如果是自己内部的服务器，那可能是管理员添加了防火墙策略，如下查看并操作即可（非学习环境下，一定要跟运维人员确认，获取操作许可）：

```bash
# 检查防火墙状态，看到 active(running) 就意味着防火墙打开了
sudo systemctl status firewalld

# 关闭防火墙
sudo systemctl stop firewalld
# 开启防火墙
sudo systemctl start firewalld

# 上面的命令是临时的，重启后就失效了
# 彻底关闭防火墙
sudo systemctl disable firewalld
 
# 开放 Redis 端口
firewall-cmd --zone=public --add-port=6379/tcp --permanent
# 应用
firewall-cmd --reload
```

### 卸载 Redis

* 先停止 Redis 服务
* 关闭 Redis 开机启动，并将其从 chkconfig 托管中删除
* 删除 Redis 安装目录
* 如果还想更干净可以通过 `find / -name redis` 命令，将查到的文件夹及目录都删除即可

## 参考资料

* [官方文档](https://redis.io/docs/getting-started/installation/install-redis-from-source/)

（完）
