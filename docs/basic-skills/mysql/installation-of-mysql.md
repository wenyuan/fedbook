# MySQL 的安装与卸载

## Windows 下安装

> Windows 下的 MySQL 不能用于生产，一般用于开发目的或者尝鲜体验。

### 安装 MySQL

我比较喜欢免安装版本的，轻便干净，删起来方便。

到官网的开发者专区下载 MySQL（Community版）免安装软件包：

* [下载地址](https://dev.mysql.com/downloads/mysql/)。
* 安装包名字：mysql-8.0.28-winx64.zip

> 当前最新版本是 8.0，如果需要下载其它版本，可以点击页面中的 **Looking for previous GA versions?**（网站可能会更新，未来入口也许会变化）

### 解压压缩包

将下载的软件包解压并重命名到 `D:\mysql-8.0` 目录下。

```bash
├── mysql-8.0
    │── bin
    │── docs
    │── include
    │── lib
    │── share
    │── LICENSE
    └── README
```

### 进入命令行终端

以 Window10 为例，有两种方法能以管理员身份运行 CMD 命令提示符：

* 在**开始菜单**上，单击**鼠标右键**，在出现的菜单中，选择**命令提示符（管理员）**点击打开这样即可。
* 点击开始菜单，在 **Windows 系统**中找到**命令提示符**，然后这时候在命令提示符上单击鼠标右键，选择**以管理员身份打开命令提示符**。

进入终端后，在终端中依次输入如下指令：

```bash
d:
cd D:\mysql-8.0\bin
```

### 初始化 MySQL

初始化可以选择带有随机密码或无密码，建议采用无密码初始化（可以设置密码），以免随机密码丢失。

```bash
# 随机密码
.\mysqld --initialize

# 无密码
.\mysqld --initialize-insecure
```

执行完初始化命令后，可以发现解压路径下多了一个 `data` 的文件夹，在里面找到 `计算机名.err` 的文件，并打开。如果你设置了随机密码，在里面就能找到初始密码：`root@localhost: (这个位置的字符串就是临时密码)`。

### 安装 mysqld

继续在当前路径下执行下列命令，安装 Windows 服务：

```bash
.\mysqld -install
```

PS：`mysql` 用于执行 SQL 命令，`mysqld` 用于执行数据库命令：

### 启动 MySQL 服务

安装提示 success 后，可以准备启动数据库并连接了。

```bash
# 启动数据库
net start mysql

# 使用 root 连接数据库, 没有密码的话直接回车即可
.\mysql -u root -p

# 关闭数据库
net stop mysql
```

### 添加/修改 root 账号登录密码

启动数据库并登录 MySQL：

```bash
net start mysql
.\mysql -u root -p
```

查询用户密码，可以看到，root 用户的密码是空的：

```bash
select host,user,authentication_string from mysql.user;
```

修改 root 用户的密码，执行命令：

```bash
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
```

这里的密码就随意填写，生产环境不建议使用过于简单的 `123456`、`root`、`admin` 之类的密码。该命令执行完毕会得到结果：`Query OK, 0 rows affected (0.01 sec)`。

接着需要继续执行命令：

```bash
flush privileges;
```

该命令作用是刷新 MySQL 的系统权限相关表，这样才能使刚刚的密码修改成功。

每次 MySQL 新设置用户或更改密码后都需要用 `flush privileges;` 来刷新 MySQL 的系统权限相关表，否则会出现拒绝访问。还有一种方法，就是重新启动 MySQL 服务，来使新设置生效。

退出登录，并重新登录，此时必须使用刚才添加的密码才能登录 MySQL：

```bash
# 退出登录
quit

# 重新登录
.\mysql -u root -p
```

### 卸载 MySQL

同样是以管理员身份运行命名提示符，先停止服务，然后执行卸载命令卸载：

```bash
net stop mysql
.\mysqld --remove mysql
```

## CentOS 7.6 下安装

### 安装对比

MySQL 有两种安装方式：

* yum 安装：安装过程人为无法干预，不能按需安装。rpm 包里面有什么就安装什么，安装的版本也比较低。
* 源码包安装：分为编译安装和免编译安装：可以设定参数，按照需求进行安装，并且安装的版本，可以自己选择，灵活性比较大。

这里我们采用源码包 - 免编译的方式安装 MySQL。

### 下载并解压安装包

MySQL 源码包下载地址：[https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)

CentOS 是基于红帽的，因此操作系统选择 Red Hat，OS 版本选择 Linux 7 (x86, 64-bit)。

选择 **Compressed TAR Archive** 点击 Download，获取到下载链接如下：

```text
https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.28-el7-x86_64.tar.gz
```

登录服务器，切换到 `/opt` 目录并新建一个 `mysql` 文件夹，下载 MySQL 安装包（如果下载慢的话，可以在本地下载后传到服务器）：

```bash
# 切换目录
cd /opt
# 新建一个文件夹用于放 mysql
mkdir mysql
# 切换目录
cd mysql/
# 下载安装包
wget https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.28-el7-x86_64.tar.gz
```

解压并重命名：

```bash
# 解压
tar -zxvf mysql-8.0.28-el7-x86_64.tar.gz
# 重命名, 原来的名字太长了
mv ./mysql-8.0.28-el7-x86_64 mysql-8.0
```

### 创建数据文件夹以及用户并赋予权限

以下步骤需要在 `/opt/mysql/` 目录下执行。

创建数据文件夹：

```bash
# 创建 data 目录(用于放置 mysql 数据文件)
mkdir data
```

创建用户组，并授权操作：

```bash
# 为 MySQL 创建一个不能 ssh 登陆的用户, 且不创建用户主目录
useradd mysql -s /sbin/nologin -M
# 修改文件所有者
chown -R mysql:mysql /opt/mysql/
```

> 在 useradd 命令后跟了两个参数，它们分别表示：
> * -s：表示指定用户所用的 shell，此处为 `/sbin/nologin`，表示不登录
> * -M：表示不创建用户主目录

### 初始化数据库

以下步骤需要在 `/opt/mysql/` 目录下执行。

初始化数据库：

```bash
/opt/mysql/mysql-8.0/bin/mysqld --initialize --user=mysql --basedir=/opt/mysql/mysql-8.0/ --datadir=/opt/mysql/data/ --lower_case_table_names=1
```

> MySQL 8.0 后，在 Linux 端，对于 lower_case_table_names 参数，只又在初始化的时候设置才有效，若初始化的时候没设置，后面修改配置文件后再启动服务就会报错了。

在这行命令的输出中，这里我们会看到初始密码（应该实在最后一行），记下来：

```bash
A temporary password is generated for root@localhost: (这个位置的字符串就是临时密码)
```

### 创建 MySQL 配置文件 my.cnf

通过阅读 `support-files/mysql.server` 这个脚本知道，如果我们的 MySQL 不是安装在默认的 `/usr/local/mysql` 里，就需要新建一个 `/etc/my.cnf` 文件，在 `[mysqld]` 段中设置 `basedir` 参数。

新建文本文档 `my.cnf`：

```bash
# 该配置文件必须建立在该目录下
vim /etc/my.cnf
```

将下面的内容添加到该配置文件中（此处是学习用的配置示例，生产环境需要根据实际情况定制，详细参数[见官网](https://dev.mysql.com/doc/refman/8.0/en/server-configuration-defaults.html)）：

```text
[mysqld]
# mysql 服务的唯一编号, 每个 mysql 服务 id 需唯一
server-id=1

# mysql 服务端口号, 默认3306
port=3306

# mysql 安装目录, 默认 /usr
basedir=/opt/mysql/mysql-8.0

# mysql 数据文件放置位置
datadir=/opt/mysql/data

# 记录的是当前 mysqld 进程的 pid
pid-file=/opt/mysql/mysql-8.0/mysql.pid

# 设置 socket 文件所在目录
socket=/opt/mysql/mysql-8.0/mysql.sock

# 设置用来保存临时文件的目录
tmpdir=/opt/mysql/mysql-8.0/tmp

# 用户
user=mysql

# 允许访问的 IP 网段(系统默认配置监听所有网卡, 即允许所有 IP 访问)
# 生产环境下建议设置为: 127.0.0.1(只允许本机访问) 或某个网卡的 IP
bind-address=0.0.0.0

# 数据库默认字符集为 utf8, 并支持一些特殊表情符号(占用 4 个字节)
character-set-server=utf8mb4

# 数据库字符集对应一些排序等规则, 注意要和 character-set-server 对应
collation-server=utf8mb4_general_ci

# 是否对 sql 语句大小写敏感, 1 表示不敏感
lower_case_table_names=1

# 允许最大连接进程数
max_connections=400

# 最大错误连接数, 这是为了防止有人从该主机试图攻击数据库系统
# 如果某个用户发起的连接 error 超过该数值, 则该用户的下次连接将被阻塞, 直到管理员执行 flush hosts
max_connect_errors=100

# TIMESTAMP 如果没有显示声明 NOT NULL, 允许 NULL 值
explicit_defaults_for_timestamp=true

# SQL 数据包发送的大小, 如果有 BLOB 对象建议修改成 1G
max_allowed_packet=128M

# MySQL连接闲置超过一定时间后(秒)将会被强行关闭
# MySQL 默认的 wait_timeout 值为 8 个小时, interactive_timeout 参数需要同时配置才能生效
interactive_timeout=1800
wait_timeout=1800

# 内部内存临时表的最大值, 设置成 128M
# 比如大数据量的 group by, order by 时可能用到临时表
# 超过了这个值将写入磁盘, 系统 IO 压力增大
tmp_table_size=128M
max_heap_table_size=128M

# 数据库错误日志文件
log-error=/opt/mysql/mysql-8.0/err/mysqld.err

# 数据库日志文件存放的位置(一般不会开启该功能, 因为 log 的量会非常庞大)
general_log_file=/opt/mysql/mysql-8.0/log/mysql.log
# 日志文件是否开启(0 是关闭、1 是开启)
general_log=0

[client]
# 默认路径是在 /tmp/mysql.sock
# 因为我们修改了默认的路径, 所以需要在 [client] 段再指定一下
# 如果不指定, 虽然数据库能正常启动, 但使用 mysql 命令时还是会报找不到 mysql.sock 错误
socket=/opt/mysql/mysql-8.0/mysql.sock
```

创建配置文件中所需的目录：

```bash
mkdir /opt/mysql/mysql-8.0/err /opt/mysql/mysql-8.0/tmp
echo "" > /opt/mysql/mysql-8.0/err/mysqld.err
# 新建了文件, 需要再次修改文件所有者
chown -R mysql:mysql /opt/mysql/
```

### 配置全局环境变量

MySQL 命令默认读取的是 `/usr/local/bin` 目录，由于我们修改了 MySQL 的默认安装路径。为了可直接使用 `mysql` 命令，而不用 `/opt/mysql/mysql-8.0/bin/mysql` 这样一大串，可以添加环境变量：

```bash
vim /etc/profile
```

在最下面添加这两行代码：

```text
# MySQL
export PATH=$PATH:/opt/mysql/mysql-8.0/bin
```

保存文件后，执行刷新操作：

```bash
source /etc/profile
```

### 启动 MySQL 服务并修改密码

```bash
# 启动 MySQL 服务
/opt/mysql/mysql-8.0/support-files/mysql.server start

# 登录 root 用户, 记得输入之前默认生成的密码
mysql -uroot -p
```

通过下面这句代码就可直接修改密码，不用像之前的老版本一样那么复杂：

```bash
# 两种改密方式二选一, 跟 5.7 版本的改密命令不同
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '新密码';

set password for root@localhost = '新密码';
```

接着需要继续执行命令：

```bash
// 刷新权限
flush privileges;
```

### 开机自启配置

下面的命令是将服务文件拷贝到 `/etc/init.d/` 下，并重命名为 `mysqld`：

```bash
cp /opt/mysql/mysql-8.0/support-files/mysql.server /etc/init.d/mysqld
```

赋予可执行权限：

```bash
chmod +x /etc/init.d/mysqld
```

添加服务：

```bash
chkconfig --add mysqld
```

显示服务列表：

```bash
chkconfig --list
```

注：如果看到 mysqld 的服务，并且 3，4，5 都是 `on` 的话则成功，如果是 `off`，则：

```bash
chkconfig --level 345 mysqld on
```

测试开机自启，重启电脑：

```bash
reboot
# 重启后查看 mysql 服务是否开机自启。
ps -ef | grep mysql
```

接下来可以通过一些命令操作 MySQL 服务：

* 启动 MySQL 服务：`service mysql start`
* 停止 MySQL 服务：`service mysql stop`
* 查看错误日志（如果上面两个命令执行后没效果）：`systemctl status mysqld`

### 开放远程连接

先通过 `mysql -uroot -p` 命令连接 MySQL，然后在 MySQL 窗口下执行如下命令：

```bash
# 选择 mysql 这个数据库
use mysql;
# 查看原来数据, 方便修改以后重置回来
select host, user, authentication_string, plugin from user;
# 修改值
update user set host='%' where user='root' limit 1;
# 刷新权限
flush privileges;
```

> * `root` 可以改为你自己定义的用户名。
> * `localhost` 指的是该用户开放的 IP，可以是 `localhost` 或 `127.0.0.1`（仅本机访问），可以是具体的某一 IP，也可以是 `%` （所有 IP 均可访问)。
> * `password` 是你想使用的验证密码。

如果使用 Navicat 连接时报 `2003 - Can't connect to MySQL server on ...` 错误，就要先看下服务器是不是开启了防火墙但又没开放端口（你可以选择不开防火墙，或者开完防火墙后记得开放 MySQL 监听的端口号）。

```bash
# 查看状态, 发现当前是 dead 状态, 即防火墙未开启
systemctl status firewalld

# 开启防火墙, 没有任何提示即开启成功
# 再次查看状态, 显示 running 即已开启了
systemctl start firewalld

# 开放默认端口号 3306, 提示 success, 表示设置成功
firewall-cmd --permanent --zone=public --add-port=3306/tcp

# 修改后需要重新加载配置才生效
firewall-cmd --reload;

# 查看已经开放的端口
firewall-cmd --permanent --list-port

# 关闭默认的端口号 3306(如果需要的话, 执行这个命令就行了)
firewall-cmd --permanent --zone=public --remove-port=3306/tcp

# 关闭防火墙(如果需要的话, 执行这个命令就行了)
systemctl stop firewalld
```

另外，如果使用的是阿里云等云厂家的服务器，无法连接的原因可能是需要去云管理平台进行一些设置。大致的入口是：

进入云服务管理控制平台 ——> 进入云服务器 ——> 选择实例 ——> 管理。

* 阿里云就找到：本实例安全组 --> 配置规则 --> 添加安全组规则，端口范围写 `3306/3306`，授权对象写 `0.0.0.0/0`。
* 腾讯云就找到：防火墙 --> 管理规则 --> 添加规则，应用类型下拉框选择 MySQL(3306) 就可以了。
* 如果改了 MySQL 的默认端口，或者想进行更多限制，或者是别的云服务商，稍微摸索下即可，这个没多少坑。

### 卸载 MySQL

首先输入命令 `ps -ef | grep mysql` 检查一下 MySQL 服务是否在运行，在卸载之前需要先停止服务：

```bash
service mysql stop
```

关闭并删除自启动脚本：

```bash
cd /etc/init.d
# 查看该服务进程状态
chkconfig --list mysqld
# 删除 chkconfig 管理的 MySQL 启动服务
chkconfig --del /etc/init.d/mysqld
# 删除自启动脚本
rm -rf /etc/init.d/mysqld
```

删除 MySQL 安装目录（如果是按照我上文的步骤安装， 删除安装目录的命令如下）：

```bash
rm -rf /opt/mysql/
```

删除 MySQL 配置文件：

```bash
rm /etc/my.cnf
```

删除环境变量：

```bash
vim /etc/profile
```

删掉之前添加的 MySQL 相关的代码后，保存文件后，执行刷新操作：

```bash
source /etc/profile
```

find 查找相关文件并删除：

```bash
# 查找相关文件
find / -name mysql

# 判断是否能删除后, 执行删除命令
...
```

删除 mysql 用户和用户组：

```bash
id mysql
userdel -rf mysql
groupdel mysql
```

> 注意：`-rf` 参数表示删除当前已登陆的用户，并删除与其相关的所有文件。
>
> 慎用 `-r` 选项，如果用户目录下有重要文件，删除前请备份。

## 参考资料

* [那些你不知道的MySQL配置文件的坑](https://blog.51cto.com/luecsc/1953842)

（完）
