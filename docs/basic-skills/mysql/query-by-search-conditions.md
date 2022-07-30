# 带搜索条件的查询语句

主要用到 `WHERE` 关键字，后面跟上搜索条件。

## 简单搜索条件

把 `搜索条件` 放在 `WHERE` 子句中，搜索条件中可以使用如下几种比较操作符：

| 操作符           | 示例                      | 描述              |
|:--------------|:------------------------|:----------------|
| `=`           | `a = b`                 | a 等于 b          |
| `<>` 或者 `!=`  | `a <> b`                | a 不等于 b         |
| `<`           | `a < b`                 | a 小于 b          |
| `<=`          | `a <= b`                | a 小于或等于 b       |
| `>`           | `a > b`                 | a 大于 b          |
| `>=`          | `a >= b`                | a 大于或等于 b       |
| `BETWEEN`     | `a BETWEEN b AND c`     | 满足 b <= a <= c  |
| `NOT BETWEEN` | `a NOT BETWEEN b AND c` | 不满足 b <= a <= c |


比如想查询 `student_info` 表中名字是 `"张星星"` 的学生的一些信息，可以这么写：

```sql
SELECT number, name, id_number, major FROM student_info WHERE name = '张星星';
```

想查询学号不在 `20220102` ~ `20220104` 这个区间内的所有学生信息，可以这么写：

```sql
SELECT number, name, id_number, major FROM student_info WHERE number NOT BETWEEN 20220102 AND 20220104;
```

## 匹配列表中的元素

如果搜索条件中指定的匹配值并不是单个值，而是一个列表，只要匹配到列表中的某一项就算匹配成功，这种情况可以使用 `IN` 操作符：

| 操作符      | 示例                       | 描述                      |
|:---------|:-------------------------|:------------------------|
| `IN`     | `a IN (b1, b2, ...)`     | a 是 b1, b2, ... 中的某一个   |
| `NOT IN` | `a NOT IN (b1, b2, ...)` | a 不是 b1, b2, ... 中的任意一个 |

比如想查询软件工程和飞行器设计专业的学生信息，可以这么写：

```sql
SELECT number, name, id_number, major FROM student_info WHERE major IN ('软件工程', '飞行器设计');
```

## 匹配 NULL 值

`NULL` 代表没有值，在判断某一列是否为 `NULL` 的时候不能单纯的使用 `=` 操作符，而是需要专门判断值是否是 `NULL` 的操作符：

| 操作符           | 示例              | 描述            |
|:--------------|:----------------|:--------------|
| `IS NULL`     | `a IS NULL`     | a 的值是 `NULL`  |
| `IS NOT NULL` | `a IS NOT NULL` | a 的值不是 `NULL` |

比如想看一下 `student_info` 表的 `name` 列是 `NULL` 的学生记录有哪些，可以这么写：

```sql
SELECT number, name, id_number, major FROM student_info WHERE name IS NULL;
```

## 多个搜索条件的查询

上边都是指定单个搜索条件的查询，也可以在一个查询语句中指定多个搜索条件。

### AND 操作符

用于查询出符合所有搜索条件的结果集，例如：

```sql
SELECT * FROM student_score WHERE subject = '高等数学' AND score > 75;
```

### OR 操作符

用于查询出只要符合任意给定搜索条件的结果集，例如：

```sql
SELECT * FROM student_score WHERE score > 95 OR score < 55;
```

### 更复杂的搜索条件的组合

当搜索条件中要结合多个 AND 和 OR 操作符时，**AND 操作符的优先级高于 OR 操作符**。

为了避免错误，此时最好使用小括号 `()` 来显式的指定各个搜索条件的检测顺序，比如：

```sql
SELECT * FROM student_score WHERE (score > 95 OR score < 55) AND subject = '高等数学';
```

上面的语法如果不加小括号，那么查询出来的结果集和期望的（找出课程为 `"高等数学"`，并且成绩大于 `95` 分或者小于 `55` 分的记录）是有出入的。

## 通配符

就是模糊查询的场景，使用下面这两个操作符来支持模糊查询：

| 操作符        | 示例             | 描述      |
|:-----------|:---------------|:--------|
| `LIKE`     | `a LIKE b`     | a 匹配 b  |
| `NOT LIKE` | `a NOT LIKE b` | a 不匹配 b |

然后需要用某个符号（称为通配符）来替代这些模糊的信息。MySQL 中支持下边这两个通配符：

* `%`：代表任意一个字符串。

  ```sql
  SELECT number, name, id_number, major FROM student_info WHERE name LIKE '张%';
  ```

* `_`：代表任意一个字符（用于精确知道字符串长度的情况）。

  ```sql
  SELECT number, name, id_number, major FROM student_info WHERE name LIKE '_星_';
  ```

::: tip 小贴士
`LIKE` 或者 `NOT LIKE` 操作符只用于**字符串**匹配。另外，通配符不能代表 `NULL`，如果需要匹配 `NULL` 的话，需要使用 `IS NULL` 或者 `IS NOT NULL`。
:::

## 转义通配符

如果待匹配的字符串中本身就包含普通字符 `'%'` 或者 `'_'`，就需要在它们前边加一个反斜杠 `\` 来和通配符区分开，也就是说：

* `'\%'` 代表普通字符 `'%'`
* `'\_'` 代表普通字符 `'_'`

例如查询名字叫 `张_` 的学生：

```sql
SELECT number, name, id_number, major FROM student_info WHERE name LIKE '张\_';
```

（完）
