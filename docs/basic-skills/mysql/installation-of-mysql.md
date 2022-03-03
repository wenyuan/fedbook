# MySQL 的安装

## Windows 下安装

> Windows 下的 MySQL 不能用于生产，一般用于开发目的或者尝鲜体验。

### 安装

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

# 使用 root 连接数据库，没有密码的话直接回车即可
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

### 卸载

同样是以管理员身份运行命名提示符，先停止服务，然后执行卸载命令卸载：

```bash
net stop mysql
.\mysqld --remove mysql
```

### 编写批处理脚本实现 MySQL 启停

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

```bash
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
# 重命名，原来的名字太长了
mv ./mysql-8.0.28-el7-x86_64 mysql-8
# 创建 data 目录
mkdir data
```

### 创建数据文件夹以及用户并赋予权限

以下步骤需要在 `/opt/mysql/` 目录下执行。

创建数据文件夹：

```bash
# 创建 data 目录
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
/opt/mysql/mysql-8/bin/mysqld --initialize --user=mysql --basedir=/opt/mysql/mysql-8/ --datadir=/opt/mysql/data/
```

在这行命令的输出中，这里我们会看到初始密码（应该实在最后一行），记下来：

```bash
A temporary password is generated for root@localhost: (这个位置的字符串就是临时密码)
```