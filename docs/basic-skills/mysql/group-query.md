# 分组查询语法

分组就是：针对某个列，将该列的值相同的记录分到一个组中。

按照科目（`subject`）列分组的意思就是将 `subject` 列的值相同的记录划分到一个组中，分组后能更方便地统计每门学科的成绩等信息。

如果不分组，就要写 N 个条件查询语句，每个语句进行 `WHERE subject = '高等数学'` 这样的过滤。

## GROUP BY 子句

能实现分组功能的就是 `GROUP BY` 子句，语法如下：

```sql
SELECT 列名1, AVG(列名2) FROM 表名 GROUP BY 列名1;
```

用这个语法来查询看看：

```sql
mysql> SELECT subject, AVG(score) FROM student_score GROUP BY subject;
+-----------------------+------------+
| subject               | AVG(score) |
+-----------------------+------------+
| 线性代数              |    88.0000 |
| 高等数学              |    78.0000 |
| 复变函数与积分        |    87.0000 |
| 大学英语              |    95.0000 |
| 大学物理              |    75.0000 |
| 数据结构与算法        |    92.0000 |
| 体育选修课            |    56.0000 |
| 操作系统              |    72.0000 |
+-----------------------+------------+
8 rows in set (0.00 sec)

mysql>
```

这个查询的执行过程就是按照 `subject` 中的值将所有的记录分成 N 组（`subject` 列中有多少不重复的课程，那就会有多少个分组），然后分别对每个分组中记录的 `score` 列调用 `AVG` 函数进行数据统计。

注意：分组的存在仅仅是为了方便我们分别统计各个分组中的信息，所以在 `查询列表` 处一般只放置 `分组列` 和 `聚集函数`，就像上面的例子那样。

如果非分组列出现在查询列表中，是会报错的，比如下面这个查询（查询列表里多了 `number` 列）：

```sql
mysql> SELECT number, subject, AVG(score) FROM student_score GROUP BY subject;
ERROR 1055 (42000): Expression #1 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'school.student_score.number' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
mysql>
```

## 带有 WHERE 子句的分组查询

可以在分组前，借助 WHERE 子句先将某些记录过滤掉。

比如老师觉得各个科目的平均分太低了，所以想先把分数低于 60 分的记录去掉之后再统计平均分，就可以这么写：

```sql
SELECT subject, AVG(score) FROM student_score WHERE score >= 60 GROUP BY subject;
```

这个过程可以分成两个步骤理解：

* 先将记录进行过滤后分组。
* 再分别对各个分组进行数据统计。

## 作用于分组的过滤条件

有时候 `GROUP BY` 子句可能会产生非常多的分组，如果我们不想在结果集中得到这么多记录，只想把那些符合某些条件的分组加入到结果集，从而减少结果集中记录的条数，那就需要把**针对分组的条件**放到 `HAVING` 子句了。

比如老师想要查询平均分大于 80 分的课程，就可以这么写：

```sql
SELECT subject, AVG(score) FROM student_score GROUP BY subject HAVING AVG(score) > 80;
```

其实这里所谓的 `针对分组的条件` 一般是指下面这两种：

* **分组列**

  也就是说我们可以把用于分组的列放到 `HAVING` 子句的条件中，比如这样：

  ```sql
  SELECT subject, AVG(score) FROM student_score GROUP BY subject having subject = '高等数学'; 
  ```

* **作用于分组的聚集函数**

  这里并不是说 `HAVING` 子句中只能放置在查询列表出现的那些聚集函数，只要是针对这个分组进行统计的聚集函数都可以。比如老师想查询最高分大于 98 分的课程的平均分，可以这么写：

  ```sql
  SELECT subject, AVG(score) FROM student_score GROUP BY subject HAVING MAX(score) > 98; 
  ```

  其中的 `MAX(score)` 这个聚集函数并没有出现在查询列表中，但仍然可以作为 `HAVING` 子句中表达式的一部分。

## 分组和排序

如果想对各个分组查询出来的统计数据进行排序，需要为查询列表中有聚集函数的表达式添加别名。

比如想按照各个学科的平均分从大到小降序排序，可以这么写：

```sql
mysql> SELECT subject, AVG(score) AS avg_score FROM student_score GROUP BY subject ORDER BY avg_score DESC;
+-----------------------+-----------+
| subject               | avg_score |
+-----------------------+-----------+
| 大学英语              |   95.0000 |
| 数据结构与算法        |   92.0000 |
| 线性代数              |   88.0000 |
| 复变函数与积分        |   87.0000 |
| 高等数学              |   78.0000 |
| 大学物理              |   75.0000 |
| 操作系统              |   72.0000 |
| 体育选修课            |   56.0000 |
+-----------------------+-----------+
8 rows in set (0.00 sec)

mysql>
```

## 嵌套分组

一个分组内可以被继续划分成更小的分组，只需要在 `GROUP BY` 子句中把各个分组列依次写上，用逗号 `,` 分隔开就好了。

比如对于 `student_info` 表，我们可以先按照学院（`department`）来进行分组，再按照专业（`major`）来继续分组：

```sql
mysql> SELECT department, major, COUNT(*) FROM student_info GROUP BY department, major;
+-----------------+--------------------------+----------+
| department      | major                    | COUNT(*) |
+-----------------+--------------------------+----------+
| 计算机学院      | 计算机科学与工程         |        2 |
| 计算机学院      | 软件工程                 |        2 |
| 航天学院        | 飞行器设计               |        1 |
| 航天学院        | 电子信息                 |        1 |
+-----------------+--------------------------+----------+
4 rows in set (0.00 sec)

mysql>
```

可以看到，在嵌套分组中，聚集函数将作用在最后一个分组列上，在这个例子中就是 `major` 列。

## 使用分组注意事项

使用分组来统计数据给我们带来了非常大的便利，但是要随时提防有坑的地方：

* 如果分组列中含有 `NULL` 值，那么 `NULL` 也会作为一个独立的分组存在。
* 如果存在多个分组列，也就是 `嵌套分组`，聚集函数将作用在最后的那个分组列上。
* 如果查询语句中存在 `WHERE` 子句和 `ORDER BY` 子句，那么 `GROUP BY` 子句必须出现在 `WHERE` 子句之后，`ORDER BY` 子句之前。
* `非分组列` 不能单独出现在检索列表中（可以被放到聚集函数中）。
* `GROUP BY` 子句后也可以跟随 `表达式`（但不能是聚集函数）。

  这个特性挺有意思，`GROUP BY` 后跟随的除了可以是表中的某个列或者某些列，其实一个表达式也可以，比如这样：

  ```sql
  mysql> SELECT concat('专业：', major), COUNT(*) FROM student_info GROUP BY concat('专业：', major);
  +-----------------------------------+----------+
  | concat('专业：', major)           | COUNT(*) |
  +-----------------------------------+----------+
  | 专业：计算机科学与工程            |        2 |
  | 专业：软件工程                    |        2 |
  | 专业：飞行器设计                  |        1 |
  | 专业：电子信息                    |        1 |
  +-----------------------------------+----------+
  4 rows in set (0.00 sec)
  
  mysql>
  ```

  MySQL 会根据这个表达式的值来对记录进行分组，使用表达式进行分组的时候需要特别注意，**查询列表中的表达式和 `GROUP BY` 子句中的表达式必须完全一样**。不过一般情况下我们也不会用表达式进行分组，所以目前基本没啥用。

* `WHERE` 子句和 `HAVING` 子句的区别：

  `WHERE` 子句在分组前进行过滤，作用于每一条记录，`WHERE` 子句过滤掉的记录将不包括在分组中。而 `HAVING` 子句在数据分组后进行过滤，作用于整个分组。

## 简单查询语句中各子句的顺序

在查询语句的各个子句中，除了 `SELECT` 之外，其他的子句全都是可以省略的。

但如果在一个查询语句中出现了多个子句，那么它们之间的顺序是不能乱放的，顺序如下所示：

```sql
SELECT [DISTINCT] 查询列表
[FROM 表名]
[WHERE 布尔表达式]
[GROUP BY 分组列表 ]
[HAVING 分组过滤条件]
[ORDER BY 排序列表]
[LIMIT 开始行, 限制条数]
```

其中中括号 `[]` 中的内容表示可以省略，我们在书写查询语句的时候各个子句必须严格遵守这个顺序，不然会报错的！

（完）
