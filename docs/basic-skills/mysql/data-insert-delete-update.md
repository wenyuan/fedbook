# 数据的增删改

数据库的表里得先有数据之后查询才有意义，所以这里先整理各种对表中数据的操作，包括插入数据、删除数据和更新数据。

## 创建表

插入数据之前需要先创建表，假设要创建两个表。

创建学生信息表 `student_info`：

```sql
CREATE TABLE student_info (
    number INT PRIMARY KEY,
    name VARCHAR(5),
    sex ENUM('男', '女'),
    id_number CHAR(18),
    department VARCHAR(30),
    major VARCHAR(30),
    enrollment_time DATE,
    UNIQUE KEY (id_number)
);
```

创建学生成绩表 `student_score`：

```sql
CREATE TABLE student_score (
    number INT,
    subject VARCHAR(30),
    score TINYINT,
    PRIMARY KEY (number, subject),
    CONSTRAINT FOREIGN KEY(number) REFERENCES student_info(number)
);
```

## 插入数据

在关系型数据库中，数据一般都是以记录（或者说行）为单位被插入到表中的，有几种插入形式。

### 插入完整的记录

语法格式：

```sql
INSERT INTO 表名(列1, 列2, ...) VALUES (列1的值，列2的值, ...);
```

有时候为了方便，可以批量插入数据。只需要在原来的单条插入语句后边多写几条记录的内容，用逗号分隔开就好了。语法格式如下：

```sql
INSERT INTO 表名(列1,列2, ...) VAULES 
(列1的值，列2的值, ...), 
(列1的值，列2的值, ...), 
(列1的值，列2的值, ...), 
...;
```

示例如下：

* 给学生信息表插入一些数据：

  ```sql
  INSERT INTO student_info(number, name, sex, id_number, department, major, enrollment_time) VALUES 
  (20220101, '张星星', '男', '158177199901044792', '计算机学院', '计算机科学与工程', '2022-09-01'),
  (20220102, '王二狗', '女', '151008199801178529', '计算机学院', '计算机科学与工程', '2022-09-01'),
  (20220103, '陈珊珊', '男', '17156319980116959X', '计算机学院', '软件工程', '2022-09-01'),
  (20220104, '李思思', '女', '141992199701078600', '计算机学院', '软件工程', '2022-09-01'),
  (20220105, '孙小武', '男', '181048199308156368', '航天学院', '飞行器设计', '2022-09-01'),
  (20220106, '刘大彪', '男', '197995199501078445', '航天学院', '电子信息', '2022-09-01');
  ```

* 给学生成绩表插入一些数据：

  ```sql
  INSERT INTO student_score (number, subject, score) VALUES 
  (20220101, '高等数学', 78),
  (20220101, '线性代数', 88),
  (20220102, '复变函数与积分', 87),
  (20220102, '大学英语', 95),
  (20220103, '大学物理', 75),
  (20220103, '数据结构与算法', 92),
  (20220104, '操作系统', 72),
  (20220104, '体育选修课', 56);
  ```

::: tip 小贴士
`INSERT` 语句中指定的列顺序可以改变，但是一定要和 `VALUES` 列表中的值一一对应起来。
:::

### 插入记录的一部分

在插入数据的时候，也可以只指定部分的列以及对应的值，没有显式指定的列的值将被设置为 `NULL`。

但前提是省略的列必须满足下面两个条件之一：

* 该列允许存储 `NULL` 值
* 该列有 `DEFAULT` 属性，给出了默认值

### 将某个查询的结果集插入表中

除了手动显式地将记录的值放在 `VALUES` 后面，也可以将某个查询的结果集作为数据源插入到表中。

比如把 `first_table` 表中的一些数据插入到 `second_table` 表里面，可以这么写：

```sql
INSERT INTO second_table(column_a, column_b) SELECT first_column, second_column FROM first_table WHERE first_column < 5;
```

把这条 INSERT 语句分成两部分来理解就是：先执行查询语句，然后把查询语句得到的结果集插入到指定的表中。

有一个注意点：INSERT 语句指定的列要和查询语句中指定的列一一对应。

### INSERT IGNORE

对于一些是主键或者具有 `UNIQUE` 约束的列或者列组合来说，它们不允许重复值的出现。所以如果待插入记录的列值与已有的值重复的话就会报错。

如果不知道待插入数据中的列有没有和已存在记录中某些唯一值重复，但仍然想正常执行插入语句，只不过加一点保护：

* 如果不存在重复的值，就把待插入记录插到表中
* 否则忽略此次插入操作

就可以用到 `INSERT IGNORE` 语法：

```sql
INSERT IGNORE INTO first_table(first_column, second_column) VALUES (10001, '张星星') ;
```

对于批量插入的情况，`INSERT IGNORE` 同样适用，会将符合唯一性条件的数据全部插入，忽略不符合要求的数据。

### INSERT ON DUPLICATE KEY UPDATE

对于主键或者有唯一性约束的列或列组合来说，新插入的记录如果和表中已存在的记录重复的话，我们可以选择的策略不仅仅是忽略该条记录的插入，也可以选择更新这条重复的旧记录。

这时就要用到 `INSERT ... ON DUPLICATE KEY UPDATE ...` 的语法：

```sql
INSERT INTO first_table (first_column, second_column) VALUES (10001, '张星星') ON DUPLICATE KEY UPDATE second_column = '张星星';
```

这个语句的意思就是，对于要插入的数据 `(10001, '张星星')` 来说，如果表中已经存在 `first_column` 的列值为 `10001` 的记录（因为 `first_column` 列具有 `UNIQUE` 约束），那么就把该记录的 `second_column` 列更新为 `'张星星'`。

在批量插入大量记录的时候这条语句怎么写呢？我们可以使用 `VALUES(列名)` 的形式来引用待插入记录中对应列的值，如下所示：

```sql
INSERT INTO first_table (first_column, second_column) VALUES 
(10002, '王二狗'), 
(10003, '陈珊珊') ON DUPLICATE KEY UPDATE second_column = VALUES(second_column);
```

其中的 `VALUES(second_column)` 对应上了两条待插入数据的 `second_column`。实现的效果就是批量插入两条数据，如果遇到重复记录时把该重复记录的 `second_column` 列更新成待插入记录中 `second_column` 列的值。

## 删除数据

如果某些记录不想要了，可以使用下面的语句进行删除：

```sql
DELETE FROM 表名 [WHERE 表达式];
```

删除语句的 `WHERE` 子句是可选的，如果不加 `WHERE` 子句的话，意味着删除表中所有数据（非常危险！慎重使用！），如下：

```sql
DELETE FROM 表名;
```

另外，也可以使用 `LIMIT` 子句来限制想要删除掉的记录数量，使用 `ORDER BY` 子句来指定符合条件的记录的删除顺序，如下：

```sql
DELETE FROM first_table ORDER BY first_column DESC LIMIT 1;
```

上述语句就是想删除掉 `first_table` 表中 `first_column` 列值最大的那条记录。

## 更新数据

修改记录的语法如下：

```sql
UPDATE 表名 SET 列1=值1, 列2=值2, ...,  列n=值n [WHERE 布尔表达式];
```

* 把想更新的列的名称和该列更新后的值写到 `SET` 单词后边，如果想更新多个列的话，它们之间用逗号 `,` 分隔开。
* 如果不指定 `WHERE` 子句，那么表中所有的记录都会被更新，否则的话只有符合 `WHERE` 子句中的条件的记录才可以被更新。

注意：虽然更新语句的 `WHERE` 子句是可选的，但是如果不加 `WHERE` 子句的话将更新表中所有的记录，这是非常危险的！请慎重使用。

另外，也可以使用 `LIMIT` 子句来限制想要更新的记录数量，使用 `ORDER BY` 子句来指定符合条件的记录的更新顺序，如下：

```sql
UPDATE first_table SET second_column='张星星' ORDER BY first_column DESC LIMIT 1;
```

上述语句就是想更新 `first_column` 列值最大的那条记录。

（完）
