# MySQL 常用命令

有时候不能使用可视化工具，就需要通过一些命令快速查看和操作数据库数据。

```sql
# 连接 mysql（注：-h、-P、-u、-p 后面可以不用加空格）
mysql -h主机地址 -P端口 -u用户名 -p用户密码

# 显示数据库
mysql> SHOW DATABASES;

# 使用某个数据库
mysql> USE xxx;

# 查看该数据库中的表
mysql> SHOW TABLES;

# 显示数据表的结构
mysql> DESCRIBE 表名;

# 显示表中的记录（注意表名大小写）
mysql> SELECT * FROM 表名;

# 创建数据库（一定要指定编码格式，否则后期会有莫名其妙的坑）
mysql> CREATE DATABASE 数据库名 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 建表  
USE 库名;
CREATE TABLE 表名 跟上字段列表;
# 例如：一个名为 user 的表，其中包含以下字段：
# id：一个最大长度为 3 的整数字段，它是自动递增的，不能为空，并且是主键。
# name：一个最大长度为 8 的字符字段。
# gender：一个最大长度为 2 的字符字段。
# birthday：一个日期字段。
mysql> USE blog;  
mysql> CREATE TABLE user (id INT(3) AUTO_INCREMENT NOT NULL PRIMARY KEY, name CHAR(8), gender CHAR(2),birthday DATE);
mysql> DESCRIBE name;

# 往表中增加数据
# 例如：增加几条相关纪录。  
mysql> INSERT INTO user VALUES('', '张三', '男', '2019-01-01');
mysql> INSERT INTO user VALUES('', '李四', '女', '2020-06-01');
mysql> SELECT * FROM name;

# 修改表中数据
# 例如：将张三的出生年月改为 2019-06-01
mysql> UPDATE user SET birthday='2019-01-01' WHERE name='张三';

# 删除某表中的数据  
# 例如：删除名字是张三的数据。  
mysql> DELETE FROM 表名 WHERE name='张三';

# 删除某表中的所有数据，并重置任何自动增量计数器。
# 会立即提交，不能在事务中使用，会锁定表，直到操作完成。
mysql> TRUNCATE TABLE 表名;

# 删除某表中的所有数据，不会重置自动增量计数器。
# 不会立即提交，能在事务中使用，不会锁定表。
mysql> DELETE FROM 表名;

# 删库和删表  
mysql> DROP DATABASE 库名;
mysql> DROP TABLE 表名;

# 查看日志信息
mysql> SHOW GLOBAL VARIABLES LIKE '%log%';

# 退出mysql
mysql> exit (回车)
```

（完）
