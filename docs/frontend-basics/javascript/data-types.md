# 数据类型

JavaScript 中共有 5 种基本数据类型和 1 种复杂数据类型。

## 1. 6 种数据类型

* 5 种基本数据类型：Undefined、Null、Boolean、Number 和 String。
* 1 种复杂数据类型：Object。

## 2. typeof 操作符

`typeof` 用于检测给定变量的数据类型，对一个值使用 typeof 操作符可能返回下列某个字符串：

* `"undefined"` —— 如果这个值未定义；
* `"boolean"` —— 如果这个值是布尔值；
* `"string"` —— 如果这个值是字符串；
* `"number"` —— 如果这个值是数值；
* `"object"` —— 如果这个值是对象或 null；
* `"function"` —— 如果这个值是函数。

注：`typeof` 是一个操作符而不是函数，后面可加括号也可省略。

## 3. 数据类型详解

### 3.1 Undefined 类型

Undefined 类型只有一个值，即特殊的 `undefined`。  
在使用 `var` 声明变量但未对其加以初始化时，这个变量的值就是 `undefined`；

对未初始化和未声明的变量执行 `typeof` 操作符都会返回 `undefined` 值。

**显示地初始化变量是明智的选择**，这样当 `typeof` 操作符返回 `"undefined"` 值时，我们就知道被检测地变量还没有被声明，而不是尚未初始化。（—— 出自红宝书）

### 3.2 Null 类型

