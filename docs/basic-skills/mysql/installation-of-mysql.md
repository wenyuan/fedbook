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

执行完初始化命令后，可以发现解压路径下多了一个 `data` 的文件夹，在里面找到 `计算机名.err` 的文件，并打开。如果你设置了随机密码，在里面就能找到初始密码：`root@localhost: (后面跟的字符串就是临时密码)`。

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

## Linux 下安装
