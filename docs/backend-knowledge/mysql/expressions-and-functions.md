# 表达式和函数

## 表达式

表达式由操作数和操作符组成，比如 `1 + 1` 就是一个 `表达式`，其中数字称为 `操作数`，运算符称为 `操作符`。

### 操作数

MySQL 中操作数可以是以下这几种类型：

* **常数**  
  常数很好理解，我们平时用到的数字、字符串、时间值等都可以被称为常数，它是一个确定的值。
* **列名**  
  针对某个具体的表，它的列名可以被当作表达式的一部分。
* **函数调用**  
  MySQL 中有函数的概念，比如获取当前时间的函数 `NOW`，而在函数后边加个小括号就算是一个函数调用，比如 `NOW()`。
* **标量子查询或者行子查询**  
  关于子查询的知识点后面会单独整理。
* **其他表达式**  
  一个表达式本身也可以作为一个操作数，然后与另一个操作数结合形成一个更复杂的表达式，比方说（假设 `col` 是一个列名）：
  * `(col - 5) / 3`
  * `(1 + 1) * 2 + col * 3`

::: tip 小贴士
以上只是常用操作数，实际上 MySQL 中可以作为操作数的还有很多，如有更高级的需求可以到官方文档中查看更多的操作数类型。
:::

### 操作符

比较常用的有三种操作符（高级的以后再说）：

#### 1）算术操作符

就是加减乘除法那一套。

| 操作符   | 示例        | 描述         |
|:------|:----------|:-----------|
| `+`   | `a + b`   | 加法         |
| `-`   | `a - b`   | 减法         |
| `*`   | `a * b`   | 乘法         |
| `/`   | `a / b`   | 除法         |
| `DIV` | `a DIV b` | 除法，取商的整数部分 |
| `%`   | `a % b`   | 取余         |
| `-`   | `-a`      | 负号         |

#### 2）比较操作符

就是在 `搜索条件` 中使用的比较操作符，下面整理一些常用的：

| 操作符            | 示例                       | 描述                              |
|:---------------|:-------------------------|:--------------------------------|
| `=`            | `a = b`                  | a 等于 b                          |
| `<>` 或者 `!=`   | `a <> b`                 | a 不等于 b                         |
| `<`            | `a < b`                  | a 小于 b                          |
| `<=`           | `a <= b`                 | a 小于或等于 b                       |
| `>`            | `a > b`                  | a 大于 b                          |
| `>=`           | `a >= b`                 | a 大于或等于 b                       |
| `BETWEEN`      | `a BETWEEN b AND c`      | 满足 b <= a <= c                  |
| `NOT BETWEEN`  | `a NOT BETWEEN b AND c`  | 不满足 b <= a <= c                 |
| `IN`           | `a IN (b1, b2, ...)`     | a 是 b1, b2, ... 中的某一个           |
| `NOT IN`       | `a NOT IN (b1, b2, ...)` | a 不是 b1, b2, ... 中的任意一个         |
| `IS NULL`      | `a IS NULL`              | a 的值是 `NULL`                    |
| `IS NOT NULL`  | `a IS NOT NULL`          | a 的值不是 `NULL`                   |
| `LIKE`         | `a LIKE b`               | a 匹配 b                          |
| `NOT LIKE`     | `a NOT LIKE b`           | a 不匹配 b                         |

由比较操作符连接而成的表达式也称为布尔表达式，表示 `TRUE` 或者 `FALSE`。

#### 3）逻辑操作符

逻辑操作符用来将多个布尔表达式连接起来，主要有这几个逻辑操作符：

| 操作符   | 示例        | 描述                      |
|:------|:----------|:------------------------|
| `AND` | `a AND b` | 只有 a 和 b 同时为真，表达式才为真    |
| `OR`  | `a OR b`  | 只要 a 或 b 有任意一个为真，表达式就为真 |
| `XOR` | `a XOR b` | a 和 b 有且只有一个为真，表达式为真    |

### 表达式的使用

把操作数和操作符相互组合起来就可以组成一个表达式，表达式主要有下面这两种使用方式：

#### 1）放在查询列表中

查询列表中既可以直接放列名，也可以放任意一个表达式。比如下面的查询语句，就是在查询 `student_score` 表时把 `score` 字段的数据都加 `100`：

```sql
SELECT number, subject, score + 100 FROM student_score;
```

其中的 `number`、`subject`、`score + 100` 都是表达式，结果集中的列的名称也将默认使用这些表达式的名称，所以如果你觉得原名称不好，可以使用别名。

::: tip 小贴士
放在查询列表的表达式也可以不涉及列名，这种查询列表中不涉及列名的情况下，甚至可以省略掉 `FROM` 子句后边的表名。

比如写个常数相加：

```sql
mysql> SELECT 1+1;
+-----+
| 1+1 |
+-----+
|   2 |
+-----+
1 row in set (0.00 sec)

mysql>
```

这么写似乎没有什么实际用处。emm…或许可以当作计算器使用~
:::

#### 2）作为搜索条件

前面介绍**条件查询语法**时，介绍的都是带有列名的表达式，搜索条件也可以不带列名，比如这样：

```sql
SELECT number, name, id_number, major FROM student_info WHERE 2 > 1;
```

不过这么写没什么实际意义，所以通常情况下搜索条件中都会包含列名的。

## 函数

MySQL 提供了一些函数可以帮助我们很方便的应对一些需求，比如：

* `UPPER` 函数是用来把给定的文本中的小写字母转换成大写字母。
* `MONTH` 函数是用来把某个日期数据中的月份值提取出来。
* `NOW` 函数用来获取当前的日期和时间。

如果想使用这些函数，可以在函数名后加一个小括号 `()`，表示调用一下这个函数。

下面是一些常用的 MySQL 内置函数：

### 文本处理函数

| 名称          | 调用示例                          | 示例结果        | 描述                  |
|:------------|:------------------------------|:------------|:--------------------|
| `LEFT`      | `LEFT('abc123', 3)`           | `abc`       | 给定字符串从左边取指定长度的子串    |
| `RIGHT`     | `RIGHT('abc123', 3)`          | `123`       | 给定字符串从右边取指定长度的子串    |
| `LENGTH`    | `LENGTH('abc')`               | `3`         | 给定字符串的长度            |
| `LOWER`     | `LOWER('ABC')`                | `abc`       | 给定字符串的小写格式          |
| `UPPER`     | `UPPER('abc')`                | `ABC`       | 给定字符串的大写格式          |
| `LTRIM`     | `LTRIM(' abc')`               | `abc`       | 给定字符串左边空格去除后的格式     |
| `RTRIM`     | `RTRIM('abc ')`               | `abc`       | 给定字符串右边空格去除后的格式     |
| `SUBSTRING` | `SUBSTRING('abc123', 2, 3)`   | `bc1`       | 给定字符串从指定位置截取指定长度的子串 |
| `CONCAT`    | `CONCAT('abc', '123', 'xyz')` | `abc123xyz` | 将给定的各个字符串拼接成一个新字符串  |

用法示例：

```sql
mysql> SELECT CONCAT('学号为', number, '的学生在《', subject, '》课程的成绩是：', score) AS 成绩描述 FROM student_score;
+-------------------------------------------------------------------------+
| 成绩描述                                                                |
+-------------------------------------------------------------------------+
| 学号为20220101的学生在《大学英语》课程的成绩是：88                      |
| 学号为20220101的学生在《高等数学》课程的成绩是：78                      |
| 学号为20220102的学生在《大学英语》课程的成绩是：98                      |
| 学号为20220102的学生在《高等数学》课程的成绩是：100                     |
| 学号为20220103的学生在《大学英语》课程的成绩是：61                      |
| 学号为20220103的学生在《高等数学》课程的成绩是：59                      |
| 学号为20220104的学生在《大学英语》课程的成绩是：46                      |
| 学号为20220104的学生在《高等数学》课程的成绩是：55                      |
+-------------------------------------------------------------------------+
8 rows in set (0.00 sec)

mysql>
```

**有一个注意点**：

文本处理函数 `SUBSTRING` 里的第 2 个参数是索引，是从 `1` 开始的，不是从 `0` 开始的。这与数据表里的记录索引不同，索引是从 `0` 开始的，具体体现在 `limit` 的使用中。如下实例：

```sql
mysql> SELECT SUBSTRING('abcdef', 2, 3);
+---------------------------+
| SUBSTRING('abcdef', 2, 3) |
+---------------------------+
| bcd                       |
+---------------------------+
1 row in set (0.00 sec)

mysql>
```

### 日期和时间处理函数

下边有些函数会用到当前日期，在实际调用这些函数时以你的当前时间为准。

| 名称            | 调用示例                                              | 示例结果                  | 描述                             |
|:--------------|:--------------------------------------------------|:----------------------|:-------------------------------|
| `NOW`         | `NOW()`                                           | `2022-07-30 16:13:30` | 返回当前日期和时间                      |
| `CURDATE`     | `CURDATE()`                                       | `2022-07-30`          | 返回当前日期                         |
| `CURTIME`     | `CURTIME()`                                       | `16:13:30`            | 返回当前时间                         |
| `DATE`        | `SELECT DATE('2022-07-30 16:13:30')`              | `2022-07-30`          | 将给定日期和时间值的日期提取出来               |
| `DATE_ADD`    | `DATE_ADD('2022-07-30 16:13:30', INTERVAL 2 DAY)` | `2022-08-01 16:13:30` | 将给定的日期和时间值添加指定的时间间隔            |
| `DATE_SUB`    | `DATE_SUB('2022-07-30 16:13:30', INTERVAL 2 DAY)` | `2022-07-28 16:13:30` | 将给定的日期和时间值减去指定的时间间隔            |
| `DATEDIFF`    | `DATEDIFF('2022-07-30', '2022-10-01')`            | `-63`                 | 返回两个日期之间的天数（负数代表前一个参数代表的日期比较小） |
| `DATE_FORMAT` | `DATE_FORMAT(NOW(),'%m-%d-%Y')`                   | `07-30-2022`          | 用给定的格式显示日期和时间                  |

在使用这些函数时需要注意一些地方：

* 在使用 `DATE_ADD` 和 `DATE_SUB` 这两个函数时，增加或减去的时间间隔单位可以自己定义，下面是 MySQL 支持的一些时间单位：
  * `MICROSECOND`：毫秒
  * `SECOND`：秒
  * `MINUTE`：分钟
  * `HOUR`：小时
  * `DAY`：天
  * `WEEK`：星期
  * `MONTH`：月
  * `QUARTER`：季度
  * `YEAR`：年

* 在使用 `DATE_FORMAT` 函数时需要注意，我们可以通过一些格式符，自定义日期和时间的显示格式，下面是 MySQL 中常用的一些日期和时间的格式符以及它们对应的含义：
  * `%b`：简写的月份名称（Jan、Feb、...、Dec)
  * `%D`：带有英文后缀的月份中的日期（0th、1st、2nd、...、31st)）
  * `%d`：数字格式的月份中的日期(00、01、02、...、31)
  * `%f`：微秒（000000-999999）
  * `%H`：二十四小时制的小时 (00-23)
  * `%h`：十二小时制的小时 (01-12)
  * `%i`：数值格式的分钟(00-59)
  * `%M`：月份名（January、February、...、December）
  * `%m`：数值形式的月份(00-12)
  * `%p`：上午或下午（AM 代表上午、PM 代表下午）
  * `%S`：秒（00-59）
  * `%s`：秒（00-59）
  * `%W`：星期名（Sunday、Monday、...、Saturday）
  * `%w`：周内第几天 （0=星期日、1=星期一、6=星期六）
  * `%Y`：4 位数字形式的年（例如 2022）
  * `%y`：2 位数字形式的年（例如 22）

来举个实例：

```sql
mysql> SELECT DATE_FORMAT(NOW(),'%b %d %Y %h:%i %p');
+----------------------------------------+
| DATE_FORMAT(NOW(),'%b %d %Y %h:%i %p') |
+----------------------------------------+
| Jul 30 2022 04:29 PM                   |
+----------------------------------------+
1 row in set (0.00 sec)

mysql>
```

`'%b %d %Y %h:%i %p'` 就是一个用格式符描述的显示格式，意味着对应的日期和时间应该以下边描述的方式展示：

* 先输出简写的月份名称（格式符 `%b`），也就是示例中的 `Jul`，然后输出一个空格。
* 再输出用数字格式表示的的月份中的日期（格式符 `%d`），也就是示例中的 `30`，然后输出一个空格。
* 再输出 4 位数字形式的年（格式符 `%Y`），也就是示例中的 `2022`，然后输出一个空格。
* 再输出十二小时制的小时（格式符 `%h`），也就是示例中的 `04`，然后输出一个冒号`:`。
* 再输出数值格式的分钟（格式符 `%i`），也就是示例中的 `29`，然后输出一个空格。
* 最后输出上午或者下午（格式符 `%p`），也就是示例中的 `PM`。

### 数值处理函数

下面列举一些数学上常用到的函数，在遇到需要数学计算的业务时会很有用：

| 名称     | 调用示例          | 示例结果                 | 描述         |
|:-------|:--------------|:---------------------|:-----------|
| `ABS`  | `ABS(-1)`     | `1`                  | 取绝对值       |
| `Pi`   | `PI()`        | `3.141593`           | 返回圆周率      |
| `COS`  | `COS(PI())`   | `-1`                 | 返回一个角度的余弦  |
| `EXP`  | `EXP(1)`      | `2.718281828459045`  | 返回 e 的指定次方 |
| `MOD`  | `MOD(5,2)`    | `1`                  | 返回除法的余数    |
| `RAND` | `RAND()`      | `0.7537623539136372` | 返回一个随机数    |
| `SIN`  | `SIN(PI()/2)` | `1`                  | 返回一个角度的正弦  |
| `SQRT` | `SQRT(9)`     | `3`                  | 返回一个数的平方根  |
| `TAN`  | `TAN(0)`      | `0`                  | 返回一个角度的正切  |

### 聚集函数（统计函数）

如果将上面介绍的那些函数以函数调用的形式放在查询列表中，那么会为表中符合 `WHERE` 条件的每一条记录调用一次该函数。就像这样：

```sql
SELECT number, LEFT(name, 1) FROM student_info WHERE number < 20220106;
```

表中符合 `number < 20220106` 搜索条件的每一条记录的 `name` 字段会依次被当作 `LEFT` 函数的参数，结果就是把这些人的名字的首个字符给提取出来了。

但是有些函数是用来统计数据的，比如统计一下表中的行数，某一列数据的最大值是什么，我们把这种函数称之为聚集函数（这个翻译有点奇怪，其实叫统计函数好一些），下面是 MySQL 中常用的几种聚集函数：

| 函数名     | 描述       |
|:--------|:---------|
| `COUNT` | 返回某列的行数  |
| `MAX`   | 返回某列的最大值 |
| `MIN`   | 返回某列的最小值 |
| `SUM`   | 返回某列值之和  |
| `AVG`   | 返回某列的平均值 |

#### COUNT 函数

`COUNT` 函数是用来统计行数的，它有两种使用方式：

* `COUNT(*)`：对表中行的数目进行计数，不管列的值是不是 `NULL`。
* `COUNT(列名)`：对特定的列进行计数，会忽略掉该列为 `NULL` 的行。

两者的区别：**会不会忽略统计列的值为 `NULL` 的行**。

使用例子：

```sql
SELECT COUNT(*) FROM student_info;
```

#### MAX 函数

`MAX` 函数是用来查询某列中数据的最大值，以 `student_score` 表中的 `score` 列为例：

```sql
SELECT MAX(score) FROM student_score;
```

#### MIN 函数

`MIN` 函数是用来查询某列中数据的最小值，以 `student_score` 表中的 `score` 列为例：

```sql
SELECT MIN(score) FROM student_score;
```

#### SUM 函数

`SUM` 函数是用来计算某列数据的和，还是以 `student_score` 表中的 `score` 列为例：

```sql
SELECT SUM(score) FROM student_score;
```

#### AVG 函数

`AVG` 函数是用来计算某列数据的平均数，仍旧以 `student_score` 表中的 `score` 列为例：

```sql
SELECT AVG(score) FROM student_score;
```

#### 给定搜索条件下聚集函数的使用

聚集函数并不是一定要统计一个表中的所有记录，我们也可以指定搜索条件来限定这些聚集函数作用的范围。比如我们只想统计 `"高等数学"` 这门课程的平均分可以这么写：

```sql
SELECT AVG(score) FROM student_score WHERE subject = '高等数学';
```

换句话说就是：不在搜索条件中的那些记录是不参与统计的。

#### 聚集函数中 DISTINCT 的使用

默认情况下，聚集函数将计算指定列的所有非 `NULL` 数据，如果我们指定的列中有重复数据的话，可以选择使用 `DISTINCT` 来过滤掉这些重复数据。

比如我们想查看一下 `student_info` 表中存储了多少个专业的学生信息，就可以这么写：

```sql
SELECT COUNT(DISTINCT major) FROM student_info;
```

#### 组合聚集函数

聚集函数也可以集中在一个查询中使用，比如这样：

```sql
mysql> SELECT COUNT(*) AS 成绩记录总数, MAX(score) AS 最高成绩, MIN(score) AS 最低成绩, AVG(score) AS 平均成绩 FROM student_score;
+--------------------+--------------+--------------+--------------+
| 成绩记录总数       | 最高成绩     | 最低成绩     | 平均成绩     |
+--------------------+--------------+--------------+--------------+
|                  8 |          100 |           46 |      73.1250 |
+--------------------+--------------+--------------+--------------+
1 row in set (0.00 sec)

mysql>
```

## 隐式类型转换

只要某个值的类型与上下文要求的类型不符，MySQL 就会根据上下文环境中需要的类型对该值进行类型转换，由于这些类型转换都是 MySQL 自动完成的，所以也可以被称为隐式类型转换。

### 隐式类型转换的场景

#### 1）把操作数类型转换为适合操作符计算的相应类型

比如对于加法操作符 `+` 来说，它要求两个操作数都必须是数字才能进行计算，所以如果某个操作数不是数字的话，会将其隐式转换为数字：

```bash
1 + 2       →   3
'1' + 2     →   3
'1' + '2'   →   3
```

#### 2）将函数参数转换为该函数期望的类型

拿用于拼接字符串的 `CONCAT` 函数举例，这个函数以字符串类型的值作为参数，如果我们在调用这个函数的时候，传入了别的类型的值作为参数，MySQL 会自动把这些值的类型转换为字符串类型的：

```bash
CONCAT('1', '2')    →   '12'
CONCAT('1', 2)      →   '12'
CONCAT(1, 2)        →   '12'
```

#### 3）存储数据时，把某个值转换为某个列需要的类型

如果创建表时是这么定义的：

```sql
CREATE TABLE test (
    column_a TINYINT,
    column_b TINYINT,
    column_c VARCHAR(100)
);
```

接着在存储数据的时候填入的不是期望的类型，就像这样：

```sql
INSERT INTO t(i1, i2, s) VALUES('100', '100', 200);
```

可以发现虽然三个列的类型都不对，但也能插入成功，这是由于隐式类型转换的存在，在插入数据的时候它们被转换成了应有的类型。

### 类型转换的注意事项

#### 1）MySQL 会尽量把值转换为表达式中需要的类型，而不是产生错误

按理说 `'123abc'` 这个字符串无法转换为数字，但是 MySQL 规定只要字符串的开头部分包含数字，那么就把这个字符串转换为开头的数字，如果开头并没有包含数字，那么将被转换成 `0`，比如这样：

```bash
'123abc'         →   123
'2022-07-30'     →   2022
'17:02:56'       →   17
'asd'            →   0
```

看个例子：

```sql
mysql> SELECT '123abc' + 0, 'asd' + 0;
+--------------+-----------+
| '123abc' + 0 | 'asd' + 0 |
+--------------+-----------+
|          123 |         0 |
+--------------+-----------+
1 row in set, 2 warnings (0.00 sec)

mysql>
```

不过需要注意的是，这种强制转换不能用于存储数据中，否则会报错：

```sql
mysql> INSERT INTO test(column_a, column_b, column_c) VALUES('123abc', 'asd', 'up');
ERROR 1265 (01000): Data truncated for column 'column_a' at row 1
mysql>
```

#### 2）在运算时会自动提升操作数的类型

不同数据类型能表示的数值范围是不一样的，再小的数据类型经过算数计算后得出的结果可能大于该可以表示的范围。比如 `test` 表中有一条记录如下：

```sql
mysql> SELECT * FROM test;
+----------+----------+----------+
| column_a | column_b | column_c |
+----------+----------+----------+
|      100 |      100 | 200      |
+----------+----------+----------+
1 row in set (0.00 sec)

mysql>
```

其中的 `column_a` 列和 `column_b` 列的类型都是 `TINYINT`，而 `TINYINT` 能表示的最大正整数是 `127`。

如果我们把 `column_a` 列的值和 `column_b` 列的值相加：

```sql
mysql> SELECT column_a + column_b FROM test;
+---------------------+
| column_a + column_b |
+---------------------+
|                 200 |
+---------------------+
1 row in set (0.00 sec)

mysql>
```

结果超出了 `TINYINT` 类型的表示范围，但依旧能显示。这是因为在运算的过程中，MySQL 自动将整数类型的操作数提升到了 `BIGINT`，这样就不会产生运算结果太大超过 `TINYINT` 能表示的数值范围的尴尬情况了。

类似的，有浮点数的运算过程会把操作数自动转型为 `DOUBLE` 类型。

::: tip 小贴士
有隐式类型转换，自然也有显式类型转换。在 MySQL 中，可以使用 `CAST` 函数完成显式地类型转换，就是我们明确指定要将特定的数值转换为某种特定类型，需要用到的话可以到文档中查一下。
:::

（完）
