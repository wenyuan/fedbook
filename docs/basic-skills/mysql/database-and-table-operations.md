# MySQL 库和表的基本操作

> 以下用到的 SQL 语句中，大小写其实不作强制规定。但为了方便区分，关键词会用大写字母，自定义的表名、字段名、函数名等等会用小写字母。

## 数据库操作

### 展示数据库

```sql
mysql> SHOW DATABASES;
```

### 创建数据库

语法：

```sql
CREATE DATABASE 数据库名;
```

例如：

```sql
mysql> CREATE DATABASE school;
Query OK, 1 row affected (0.02 sec)

mysql>
```

如果创建一个已经存在的数据库会报错 `ERROR`。这个时候可以使用 `IF NOT EXISTS` 语句，这样不影响语句的执行，只是结果中有 1 个 `warning`：

```sql
mysql> CREATE DATABASE IF NOT EXISTS school;
Query OK, 1 row affected, 1 warning (0.00 sec)

mysql>
```

### 切换数据库

语法：

```sql
USE 数据库名称;
```

例如：

```sql
mysql> USE school;
Database changed
mysql>
```

### 删除数据库

如果觉得某个数据库没用了，可以把它删掉。

语法：

```sql
DROP DATABASE 数据库名;
```

在真实的工作环境里，在删除数据库之前一定要反复找上级核实，就算要删最好不要自己删，「删库」这个责任很大。

不过这里演示的是学习环境，就无所谓了。删除刚才创建的 `school` 库：

```sql
mysql> DROP DATABASE school;
Query OK, 0 rows affected (0.02 sec)

mysql>
```

如果某个数据库并不存在，我们仍旧调用 `DROP DATABASE` 语句去删除它，不过会报错的。如果想避免这种报错，可以使用 `IF EXISTS` 语句来删除数据库：

```sql
mysql> DROP DATABASE IF EXISTS school;
Query OK, 0 rows affected, 1 warning (0.00 sec)

mysql>
```

## 表的操作

> 以下用到的 SQL 语句，需要先进入到一个新的数据库，就拿前面举例的 `school` 库好了。

### 展示当前数据库中的表

这条语句用于展示当前数据库中有哪些表：

```sql
mysql> SHOW TABLES;
Empty set (0.00 sec)

mysql>
```

因为是新创建的数据库，所以里面是空的，得到的结果就是 `Empty set`。

### 创建表

#### 基本语法

MySQL 中创建表的基本语法就是这样的：

```sql
CREATE TABLE 表名 (
    列名1    数据类型    [列的属性],
    列名2    数据类型    [列的属性],
    ...
    列名n    数据类型    [列的属性]
);
```

也就是说创建一个表时至少需要完成下列事情：

* 给表起个名。
* 然后在小括号 `()` 中定义上这个表的各个列的信息，包括列的名称、列的数据类型、列的属性（列的属性非必须，用中括号 `[]` 引起来）。
* 列名、数据类型、列的属性之间用空白字符分开就好，然后各个列的信息之间用逗号 `,` 分隔开。

最后，将建表语句放到客户端执行，输出 `Query OK, 0 rows affected (0.07 sec)` 意味着创建成功了，这里的 0.07 表示耗时，实际耗时不一定就是这个数字。

::: tip 小贴士
这个创建表的语句可以放在单行中完成，我把它分成多行并且加上缩进仅仅是为了美观而已。
:::

#### 为建表语句添加注释

可以在创建表时将该表的用处以注释的形式添加到语句中，只要在建表语句最后加上 `COMMENT` 语句就好，如下：

```sql
CREATE TABLE 表名 (
    各个列的信息 ...
) COMMENT '表的注释信息';
```

为了我们和他人的方便，最好写个注释。不过注释没必要太长，言简意赅即可，毕竟是给人看的，让人看明白是什么意思就好了。

#### 创建两个实际的表

先创建一个学生基本信息表（`student_info`）：

```sql
CREATE TABLE student_info (
    number INT,
    name VARCHAR(5),
    sex ENUM('男', '女'),
    id_number CHAR(18),
    department VARCHAR(30),
    major VARCHAR(30),
    enrollment_time DATE
) COMMENT '学生基本信息表';
```

这张表有如下字段：

* 学号（`number`）：整数类型
* 姓名（`name`）：变长字符串类型，最多 5 个字符
* 性别（`sex`）：枚举类型，只能填 `男` 或 `女`
* 身份证号（`id_number`）：固定长度字符串类型，因为身份证是固定的 18 位
* 学院（`department`）：变长字符串类型，最多 30 个字符
* 专业（`major`）：变长字符串类型，最多 30 个字符
* 入学时间（`enrollment_time`）：日期类型

再创建一个学生成绩表（`student_score`）：

```sql
CREATE TABLE student_score (
    number INT,
    subject VARCHAR(30),
    score TINYINT
) COMMENT '学生成绩表';
```

这张表有如下字段：

* 学号（`number`）：整数类型
* 科目（`subject`）：变长字符串类型，最多 30 个字符
* 成绩（`score`）：小整数类型，成绩够用了

和重复创建数据库一样，如果创建一个已经存在的表的话是会报错的，这个时候也可以使用 `IF NOT EXISTS` 来避免这种错误发生：

```sql
CREATE TABLE IF NOT EXISTS 表名(
    各个列的信息 ...
);
```

### 删除表

删除表的语法：

```sql
DROP TABLE 表1, 表2, ..., 表n;
```

在真实工作环境中删除表一定要慎重、谨慎。

同样，如果尝试删除某个不存在的表的话会报错，可以使用 `IF EXISTS` 来避免报错：

```sql
DROP TABLE IF EXISTS 表名;
```

### 查看表结构

下边这些语句都可以用来查看表的结构，它们的效果是一样的：

```sql
DESCRIBE 表名;
DESC 表名;
EXPLAIN 表名;
SHOW COLUMNS FROM 表名;
SHOW FIELDS FROM 表名;
```

还可以使用下边这个语句来查看表结构，而它显示其实跟平时创建表的语句是一样的，所以可以用来反查建表语句：

```sql
SHOW CREATE TABLE 表名\G
```

用 `\G` 来代替原来用于标记语句结束的分号 `;`，是为了让输出的结果显示效果更好一点。

### 显式指定表的数据库

有时候我们并没有使用 `USE` 语句来选择当前数据库，或者在一条语句中遇到的表分散在不同的数据库中，如果我们想在语句中使用这些表，那么就必须显式的指定这些表所属的数据库了。

比如不管当前数据库是不是 `school`，都可以调用这个语句来展示数据库 `school` 里边的表：

```sql
mysql> SHOW TABLES FROM school;
+------------------+
| Tables_in_school |
+------------------+
| student_info     |
| student_score    |
+------------------+
2 rows in set (0.01 sec)

mysql>
```

其他地方如果使用到表名的话，需要显式指定这个表所属的数据库，指明方式是 `数据库名.表名`。例如：

```sql
mysql> SHOW CREATE TABLE school.student_score\G
*************************** 1. row ***************************
       Table: student_score
Create Table: CREATE TABLE `student_score` (
  `number` int DEFAULT NULL,
  `subject` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `score` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='学生成绩表'
1 row in set (0.00 sec)

mysql>
```

### 修改表

#### 修改表名

* 方式一：

```sql
ALTER TABLE 旧表名 RENAME TO 新表名;
```

* 方式二（可以用一条语句修改多个表的名称）：

```sql
RENAME TABLE 旧表名1 TO 新表名1, 旧表名2 TO 新表名2, ... 旧表名n TO 新表名n;
```

如果在修改表名的时候指定了数据库名，还可以将该表转移到对应的数据库下，例如：

```sql
ALTER TABLE student_info RENAME TO company.student_info;
```

#### 增加列

可以使用下边的语句来增加表中的列：

```sql
ALTER TABLE 表名 ADD COLUMN 列名 数据类型 [列的属性];
```

#### 增加列到特定位置

默认的情况下列都是加到现有列的最后一列后面，我们也可以在添加列的时候指定它的位置，常用的方式如下：

* 添加到第一列：

```sql
ALTER TABLE 表名 ADD COLUMN 列名 列的类型 [列的属性] FIRST;
```

* 添加到指定列的后边：

```sql
ALTER TABLE 表名 ADD COLUMN 列名 列的类型 [列的属性] AFTER 指定列名;
```

#### 删除列

可以使用下边的语句来删除表中的列：

```sql
ALTER TABLE 表名 DROP COLUMN 列名;
```

#### 修改列信息

修改列的信息有下边这两种方式：

* 方式一：

```sql
ALTER TABLE 表名 MODIFY 列名 新数据类型 [新属性];
```

不过在修改列信息的时候需要注意：修改后的数据类型和属性一定要兼容表中现有的数据，否则就会报错。

* 方式二：

```sql
ALTER TABLE 表名 CHANGE 旧列名 新列名 新数据类型 [新属性];
```

这种修改方式需要我们填两个列名，也就是说在修改数据类型和属性的同时也可以修改列名。因此也可以用在不改变数据类型和属性，仅重命名列明的需求场景上。

#### 修改列排列位置

可以使用下面这几条语句修改列的顺序：

* 将列设为表的第一列：

```sql
ALTER TABLE 表名 MODIFY 列名 列的类型 列的属性 FIRST;
```

* 将列放到指定列的后边：

```sql
ALTER TABLE 表名 MODIFY 列名 列的类型 列的属性 AFTER 指定列名;
```

#### 一条语句中包含多个修改操作

如果对同一个表有多个修改操作的话，我们可以把它们放到一条语句中执行，就像这样：

```sql
ALTER TABLE 表名 操作1, 操作2, ..., 操作n;
```

比如连续删除三个列的语句，可以合并为一条：

```sql
# 合并前
ALTER TABLE test_table DROP COLUMN column_a;
ALTER TABLE test_table DROP COLUMN column_b;
ALTER TABLE test_table DROP COLUMN column_c;

# 合并后
ALTER TABLE test_table DROP COLUMN column_a, DROP COLUMN column_b, DROP COLUMN column_c;
```

这样敲的语句也少了，服务器也不用分多次执行从而效率也高了。

（完）
