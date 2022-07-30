# 表中列的基本属性

## 默认值

在插入数据的时候，可以只指定插入部分的列。那些没有被显式指定的列的值将被设置默认值。在 MySQL 中，如果没有手动指定，那么列的默认值是 `NULL`，表示这个列的值还没有被设置。

如果我们不想让默认值为 `NULL`，而是设置成某个有意义的值，可以在定义列的时候给该列增加一个 `DEFAULT` 属性，就像这样：

```sql
列名 列的类型 DEFAULT 默认值
```

在建表语句中就是这样：

```sql
CREATE TABLE first_table (
    first_column INT DEFAULT NULL,
    second_column VARCHAR(100) DEFAULT 'abc'
);
```

## NOT NULL 属性

如果要求表中的某些列中必须有值，不能存放 `NULL`，那么可以用这样的语法来定义这个列：

```sql
列名 列的类型 NOT NULL
```

例如：

```sql
CREATE TABLE first_table (
    first_column INT NOT NULL,
    second_column VARCHAR(100) DEFAULT 'abc'
);
```

这样一来，如果还往这个字段里插入 `NULL` 值，就会报错 `ERROR 1048 (23000): Column 'first_column' cannot be null`。

另外，一旦对某个列定义了 `NOT NULL` 属性，那这个列的默认值就不为 `NULL` 了。如果在定义列属性时没有指定默认值，在使用 `INSERT` 插入行时必须显式的指定这个列的值，而不能省略它，否则也会报错 `ERROR 1364 (HY000): Field 'first_column' doesn't have a default value`。

## 主键

一个表最多只能有一个主键，主键的值不能重复，通过主键可以找到唯一的一条记录。

可以选用下面这两种方式之一来指定主键：

* 如果主键只是单个列的话，可以直接在该列后声明 `PRIMARY KEY`，例如：

  ```sql {2}
  CREATE TABLE student_info (
      number INT PRIMARY KEY,
      name VARCHAR(5),
      sex ENUM('男', '女'),
      id_number CHAR(18),
      department VARCHAR(30),
      major VARCHAR(30),
      enrollment_time DATE
  );
  ```

* 也可以把主键的声明单独提取出来，用这样的形式声明：

  ```sql
  PRIMARY KEY (列名1, 列名2, ...)
  ```

  然后把这个主键声明放到列定义的后面，就像这样：

  ```sql {9}
  CREATE TABLE student_info (
      number INT,
      name VARCHAR(5),
      sex ENUM('男', '女'),
      id_number CHAR(18),
      department VARCHAR(30),
      major VARCHAR(30),
      enrollment_time DATE,
      PRIMARY KEY (number)
  );
  ```

  对于多个列的组合作为主键的情况，必须使用这种单独声明的形式。例如：

  ```sql {5}
  CREATE TABLE student_score (
      number INT,
      subject VARCHAR(30),
      score TINYINT,
      PRIMARY KEY (number, subject)
  );
  ```

另外，主键列默认是有 `NOT NULL` 属性，也就是必填的，如果填入 `NULL` 值会报错。

## UNIQUE 属性

表明该列或者列组合的值是不允许重复的。

声明方式有两种：

* 为单个列声明 `UNIQUE` 属性，可以直接在该列后填写 `UNIQUE` 或者 `UNIQUE KEY`，例如：

  ```sql {5}
  CREATE TABLE student_info (
      number INT PRIMARY KEY,
      name VARCHAR(5),
      sex ENUM('男', '女'),
      id_number CHAR(18) UNIQUE,
      department VARCHAR(30),
      major VARCHAR(30),
      enrollment_time DATE
  );
  ```

* 也可以把 `UNIQUE` 属性的声明单独提取出来，用这样的形式声明（中括号 `[]` 里的约束名称可以不写，它类似给这个 `UNIQUE` 属性起个别名，如果不写的话系统也会自动起一个）：

  ```sql
  UNIQUE [约束名称] (列名1, 列名2, ...)
  # 或者
  UNIQUE KEY [约束名称] (列名1, 列名2, ...)
  ```
  
  然后把这个 `UNIQUE` 属性的声明放到列定义的后面，就像这样：

  ```sql {9}
  CREATE TABLE student_info (
      number INT PRIMARY KEY,
      name VARCHAR(5),
      sex ENUM('男', '女'),
      id_number CHAR(18),
      department VARCHAR(30),
      major VARCHAR(30),
      enrollment_time DATE,
      UNIQUE KEY uk_id_number (id_number)
  );
  ```

  对于多个列的组合具有 `UNIQUE` 属性的情况，必须使用这种单独声明的形式。

如果表中为某个列或者列组合定义了 `UNIQUE` 属性的话，MySQL 就会对插入的记录做校验，如果新插入记录在该列或者列组合的值已经在表中存在了，那就会报错。

## 主键和 UNIQUE 约束的区别

* 一张表中只能定义一个主键，却可以定义多个 `UNIQUE` 约束。
* 规定：主键列不允许存放 `NULL`，而声明了 `UNIQUE` 属性的列可以存放 `NULL`，而且 `NULL` 可以重复地出现在多条记录中。

::: tip 小贴士
`NULL` 其实并不是一个值，它代表不确定，我们平常说某个列的值为 `NULL`，意味着这一列的值尚未被填入。
:::

## 外键

定义外键的语法：

```sql
CONSTRAINT [外键名称] FOREIGN KEY(列1, 列2, ...) REFERENCES 父表名(父列1, 父列2, ...);
```

其中的外键名称是可选的，如果不自己命名的话，MySQL 会自动帮助我们命名。

如果 A 表中的某个列或者某些列依赖于 B 表中的某个列或者某些列，那么就称 A 表为子表，B 表为父表。子表和父表可以使用外键来关联起来。

比如学生成绩表中的学号（`number`）列，依赖于学生信息表中的学号（`number`）列，那么学生成绩表就是一个子表，可以在它的建表语句中定义一个外键：

```sql {6}
CREATE TABLE student_score (
    number INT,
    subject VARCHAR(30),
    score TINYINT,
    PRIMARY KEY (number, subject),
    CONSTRAINT FOREIGN KEY(number) REFERENCES student_info(number)
);
```

这样，在对 `student_score` 表插入数据的时候，MySQL 都会检查一下插入的学号是否能在 `student_info` 表中找到，如果找不到则会报错。

:::tip 小贴士
父表中被子表依赖的列或者列组合必须建立索引，如果该列或者列组合已经是主键或者有 `UNIQUE` 属性，那么它们也就被默认建立了索引。

至于什么是索引，这里先不展开讨论，总之用来建立外键的列一般都是主键或者有 `UNIQUE` 属性的就对了，这样就不容易遇到问题。
:::

## AUTO_INCREMENT 属性

`AUTO_INCREMENT` 就是自增的意思，用于设置给整数类型或者浮点数类型的列。

如果在插入新记录的时候不指定该列的值，或者将该列的值显式地指定为 `NULL` 或者 `0`，那么新插入的记录在该列上的值就是当前该列的最大值加 1 后的值。

定义这个属性的语法如下：

```sql
列名 列的类型 AUTO_INCREMENT
```

比如建表时有一个非负 `INT` 类型的 `id` 列，把它设置为主键而且具有 `AUTO_INCREMENT` 属性：

```sql {2}
CREATE TABLE first_table (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_column INT,
    second_column VARCHAR(100) DEFAULT 'abc'
);
```

接下来我们在插入新记录时可以忽略掉这个列，或者将列值显式地指定为 `NULL` 或 `0`，但是它的值是从 `1` 开始递增的。

注意事项：

* 一个表中最多有一个具有 `AUTO_INCREMENT` 属性的列。
* 具有 `AUTO_INCREMENT` 属性的列必须建立索引。主键和具有 `UNIQUE` 属性的列会自动建立索引。
* 拥有 `AUTO_INCREMENT` 属性的列就不能再通过指定DEFAULT属性来指定默认值。
* 一般拥有 `AUTO_INCREMENT` 属性的列都是作为主键的属性，来自动生成唯一标识一条记录的主键值。

## 列的注释

除了可以在建表语句的末尾添加 `COMMENT` 语句来给表添加注释，也可以在每一个列末尾添加 `COMMENT` 语句来为列来添加注释。

比如：

```sql
CREATE TABLE first_table (
    id int UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    first_column INT COMMENT '第一列',
    second_column VARCHAR(100) DEFAULT 'abc' COMMENT '第二列'
) COMMENT '第一个表';
```

## 影响展示外观的 ZEROFILL 属性

举个例子，正整数 `3` 可以有三种写法：

* 写法一：`3`
* 写法二：`003`
* 写法三：`000003`

`ZEROFILL` 属性就是做这样的事的：对于无符号整数类型的列，可以在查询数据的时候让数字左边补 0。

用法示例：

```sql
CREATE TABLE zerofill_table (
    i1 INT(5) UNSIGNED ZEROFILL,
    i2 INT UNSIGNED
);
```

上面定义的两个列都是无符号整数类型，而 `i1` 后面的 `(5)` 表示**显示宽度**。也就是如果声明了 `ZEROFILL` 属性的整数列的实际值的位数小于显示宽度时，会在实际值的左侧补 0，使补0的位数和实际值的位数相加正好等于显示宽度。

注意事项：

* 在展示查询结果时，某列数据自动补 0 的条件有这几个：
  * 该列必须是整数类型的。
  * 该列必须有 `UNSIGNED ZEROFILL` 的属性。
  * 该列的实际值的位数必须小于显示宽度时才会补 0。
  * 实际值的位数大于显示宽度时照原样输出。
* 在创建表的时候，如果声明了 `ZEROFILL` 属性的列没有声明 `UNSIGNED` 属性，那 MySQL 会为该列自动生成 `UNSIGNED` 属性。
  * 也就是说 MySQL 现在只支持对无符号整数进行自动补 0 的操作。
* 每个整数类型都会有默认的显示宽度。
  * `TINYINT` 的默认显示宽度是 `(4)`。
  * `INT` 的默认显示宽度是 `(11)`。
  * 如果加了 `UNSIGNED` 属性，则该类型的显示宽度减 1。
  * 可以使用 `SHOW CREATE TABLE 表名\G` 查看已经生成的表，其列的显示宽度。
* 显示宽度并不会影响该数据类型要求的存储空间以及该类型能存储的数据范围，仅在展示时有区别。
* 对于没有声明 `ZEROFILL` 属性的列，显示宽度没有任何用处。

## 一个列同时具有多个属性

每个列可以同时具有多个属性，属性声明的顺序无所谓，各个属性之间用空白隔开就好了。

::: tip 小贴士
有的属性是冲突的，一个列不能具有两个冲突的属性。

如一个列不能既声明为 `PRIMARY KEY`，又声明为 `UNIQUE KEY`；不能既声明为 `DEFAULT NULL`，又声明为 `NOT NULL`。需要注意这一点。
:::

## 查看表结构时的列属性

建表：

```sql {1,6,9-18}
mysql> use school;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> DROP TABLE student_info;
Query OK, 0 rows affected (0.04 sec)

mysql> CREATE TABLE student_info (
    ->     number INT PRIMARY KEY,
    ->     name VARCHAR(5),
    ->     sex ENUM('男', '女'),
    ->     id_number CHAR(18),
    ->     department VARCHAR(30),
    ->     major VARCHAR(30),
    ->     enrollment_time DATE,
    ->     UNIQUE KEY uk_id_number (id_number)
    -> );
Query OK, 0 rows affected (0.07 sec)

mysql>
```

查询：

```sql
mysql> DESC student_info;
+-----------------+-------------------+------+-----+---------+-------+
| Field           | Type              | Null | Key | Default | Extra |
+-----------------+-------------------+------+-----+---------+-------+
| number          | int               | NO   | PRI | NULL    |       |
| name            | varchar(5)        | YES  |     | NULL    |       |
| sex             | enum('男','女')   | YES  |     | NULL    |       |
| id_number       | char(18)          | YES  | UNI | NULL    |       |
| department      | varchar(30)       | YES  |     | NULL    |       |
| major           | varchar(30)       | YES  |     | NULL    |       |
| enrollment_time | date              | YES  |     | NULL    |       |
+-----------------+-------------------+------+-----+---------+-------+
7 rows in set (0.00 sec)

mysql>
```

* `NULL` 列代表该列是否可以存储 `NULL`，值为 `NO` 表示不允许存储 `NULL`，值为 `YES` 表示可以存储 `NULL`。
* `Key` 列存储关于键的信息，值为 `PRI` 是 `PRIMARY KEY` 的缩写，代表主键；`UNI` 是 `UNIQUE KEY` 的缩写，代表 `UNIQUE` 属性。
* `Default` 列代表该列的默认值。
* `Extra` 列展示一些额外的信息。例如，如果某个列具有 `AUTO_INCREMENT` 属性就会被展示在这个列里。

## 标识符的命名

像数据库名、表名、列名、约束名称或者我们之后会遇到的别的名称，这些名称统统被称为**标识符**。

虽然 MySQL 中对标识符的命名没多少限制，但是**最好杜绝**下面的这几种命名：

* 名称中全都是数字。

  因为在一些MySQL语句中也会使用到数字，如果你起的名称中全部都是数字，会让 MySQL 服务器分别不清哪个是名称，哪个是数字了。比如名称 `1234567` 就是非法的。

* 名称中有空白字符

  MySQL 命令是靠空白字符来分隔各个单词的，比如下边这两行命令是等价的：

  ```sql
  CREATE DATABASE school;
  CREATE   DATABASE   school;
  ```
  
  但是如果你定义的名称中有空白字符，这样会被当作两个词去处理，就会造成歧义。比如名称 `word1 word2 word3` 就是非法的。

* 名称使用了 MySQL 中的保留字

  比如 `CREATE`、`DATABASE`、`INT`、`DOUBLE`、`DROP`、`TABLE` 等等这些单词，这些单词都是供 MySQL 内部使用的，称之为保留字。如果你自己定义的名称用到了这些词也会导致歧义。比如名称 `create` 就是非法的。

如果你一根筋就是坚持要使用的话，也不是不行，你可以使用反引号将自定义的名称扩起来，这样 MySQL 的服务器就能检测到你提供的是一个名称而不是别的东西，比如说把上面几个非法的名称加上反引号就变成合法的名称了：

```bash
`1234567`
`word1 word2    word3`
`create`
```

虽然反引号比较强大，但还是建议不要起各种非主流的名称，也不要使用全数字、带有空白字符或者 MySQL 保留字的名称。

反引号更好的用途是可以把建表语句中的标识符给引起来，这样语义更清晰一点，看一下是不是表清晰了：

```sql
CREATE TABLE `first_table` (
    `id` int UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `first_column` INT,
    `second_column` VARCHAR(100) DEFAULT 'abc'
);
```


最后，由于 MySQL 是 C 语言实现的，所以在名称定义上还是尽量遵从 C 语言的规范吧：即**用小写字母、数字、下划线、美元符号等作为名称，如果有多个单词的话，各个单词之间用下划线连接起来**。

（完）
