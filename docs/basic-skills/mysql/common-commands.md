# MySQL 常用命令

有时候不能使用可视化工具，就需要通过一些命令快速查看和操作数据库数据。

```bash
# 连接mysql（注：-h、-P、-u、-p后面可以不用加空格）
mysql -h主机地址 -P端口 -u用户名 -p用户密码

# 显示数据库
mysql> show databases;

# 使用某个数据库
mysql> use xxx;

# 查看该数据库中的表
mysql> show tables;

# 显示数据表的结构
mysql> describe 表名;

# 显示表中的记录（注意表名大小写）
mysql> select * from 表名;

# 创建数据库
mysql> create database 数据库名;

# 建表  
use 库名;
create table 表名 （跟上字段列表）;
# 例如：创建表user,表中有id（序号，自增），name（姓名）,gender（性别）,birthday（出身年月）四个字段  
mysql> use blog;  
mysql> create table user (id int(3) auto_increment not null primary key, name char(8),gender char(2),birthday date);
mysql> describe name;

# 往表中增加数据
# 例如：增加几条相关纪录。  
mysql> insert into user values('','张三','男','2019-01-01');  
mysql> insert into user values('','李四','女','2020-06-01');
mysql> select * from name;

# 修改表中数据
# 例如：将张三的出生年月改为2019-06-01
mysql> update user set birthday='2019-01-01' where name='张三';  

# 删除某表中的数据  
# 例如：删除名字是张三的数据。  
mysql> delete from user where name='张三';  

# 删库和删表  
mysql> drop database 库名;
mysql> drop table 表名;

# 退出mysql
mysql> exit (回车)
```

（完）
