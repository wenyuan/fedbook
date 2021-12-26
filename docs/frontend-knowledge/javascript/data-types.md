# 数据类型

## 前言

最新的 ECMAScript 标准定义了 8 种数据类型:

* 7 种基本数据类型：
  * Undefined
  * Null
  * Boolean
  * Number
  * BigInt（ECMAScript 2020）
  * String
  * Symbol（ECMAScript 2015）
* 1 种复杂数据类型（又称引用数据类型）：
  * Object

基本数据类型保存在**栈内存**，引用类型保存在**堆内存**中。根本原因在于保存在栈内存的必须是大小固定的数据，引用类型的大小不固定，只能保存在堆内存中，但是可以把它的地址写在栈内存中以供我们访问。

如果是基本数据类型，则按值访问，操作的就是变量保存的值；如果是引用类型的值，我们只是通过保存在变量中的引用类型的地址来操作实际对象。

## 使用 typeof 操作符判断数据类型

`typeof` 用于检测给定变量的数据类型，对一个值使用 `typeof` 操作符会返回一个表示操作数的类型的字符串。但 `typeof` 的运算结果，与运行时类型的规定有很多不一致的地方。

我们可以看下表来对照一下。

| 示例表达式         | typeof 结果   | 运行时类型行为     |
| ----------------- | ------------- | ---------------- |
| void(0)           | `undefined`   | Undefined        |
| null              | `object`      | Null             |
| true              | `boolean`     | Boolean          |
| 3                 | `number`      | Number           |
| 9007199254740992n | `bigint`      | BigInt           |
| "ok"              | `string`      | String           |
| Symbol("a")       | `symbol`      | Symbol           |
| (function(){})    | `function`    | Function object  |
| {}                | `object`      | Any other object |

在表格中，多数项是对应的，但是请注意 `object —— Null` 和 `function —— Object` 是特例，我们理解类型的时候需要特别注意这个区别。

此外，由于 `typeof` 是一个操作符而不是函数，后面可加括号也可省略。

## 8 种数据类型介绍

### Undefined 类型

Undefined 类型只有一个值，即特殊的 `undefined`。  
在使用 `var` 声明变量但未对其加以初始化时，这个变量的值就是 `undefined`；

对未初始化和未声明的变量执行 `typeof` 操作符都会返回 `undefined` 值。

**显示地初始化变量是明智的选择**，这样当 `typeof` 操作符返回 `"undefined"` 值时，我们就知道被检测地变量还没有被声明，而不是尚未初始化。（—— 出自红宝书）

### Null 类型

Null 类型也只有一个值，即特殊的 `null`。  
从逻辑角度来看，`null` 值表示一个**空对象指针**，所以使用 `typeof` 操作符检测 `null` 值时会返回 `"object"`。

如果定义的变量准备在将来**用于保存对象**，那么最好将该变量初始化为 `null` 而不是其他值。这样一来，只要直接检查相应的变量是否等于 `null` 值就可以知道它是否已经保存了一个对象的引用。（—— 出自红宝书）

实际上，`undefined` 值是派生自 `null` 值的，因此 `null == undefined` 会返回 `true`，但 `null === undefined` 则返回 `false` 了。

### Boolean 类型

Boolean 类型只有两个字面值：`true` 和 `false`。

### Number 类型

Number 类型使用 [IEEE754](https://baike.baidu.com/item/IEEE%20754/3869922?fr=aladdin) 格式来表示整数和浮点数值。

#### 1）浮点数值的整数化

因为保存浮点数值需要得内存空间是保存整数值的两倍，所以凡是可以「整数化」的浮点数都会被转换为整数值，例如：`1.` 和 `1.0` 都会被解析为 `1`。

对于那些极大或极小的数值，可以用 e 表示法（即科学计数法）表示的浮点数值表示。（用 e 表示法表示的数值等于 e 前面的数值乘以 10 的指数次幂）

#### 2）数值范围限制

JavaScript 能够表示的**最小数值**为 `Number.MIN_VALUE`，在大多数浏览器中这个值是 `5e-324`；  
JavaScript 能够表示的**最大数值**为 `Number.MAX_VALUE`，在大多数浏览器中这个值是 `1.7976931348623157e+308`。

超出范围的正数会被转换成 `Infinity`（正无穷），超出范围的负数会被转换成 `-Infinity`（负无穷）。

可以使用 `isFinite()` 函数判断括号里的参数是否位于最小与最大数值之间。

#### 3）特殊的 NaN

`NaN`，即非数值（Not a Number）是一个特殊的数值。它有两个特点：一是任何涉及 `NaN` 的操作都会返回 `NaN`，二是 `NaN` 与任何值都不相等，包括 `NaN` 本身。

可以通过 `isNaN()` 函数来确认括号里的参数是否「不是数值」，需要注意的是，`isNaN()` 在接收到一个参数后，会尝试将这个值转换为数值，某些不是数值的值会直接转换为数值，例如字符串 `"10"` 或 `Boolean` 值。

#### 4）数值转换函数

有 3 个函数可以把非数值转换为数值：`Number()`、`parseInt()` 和 `parseFloat()`。

由于 `Number()` 函数在转换字符串时比较复杂而且不够合理，因此更常用过的是另外两个函数。（—— 出自红宝书）

`parseInt()` 在转换时可以拥有第二个参数：转换时使用的基数（即多少进制），建议无论在什么情况下都明确指定基数。（—— 出自红宝书）

`parseFloat()` 只解析十进制值，因此它没有用第二个参数指定基数的用法。另外如果字符串没有小数点，或者小数点后都是零，`parseFloat()` 会返回整数。

**转换规则**：这 3 个函数都会忽略字符串前面的空格，直至找到第一个非空格字符。如果第一个字符不是数字字符或负号，就会返回 `NaN`，直到解析完所有后续字符或者遇到了一个非数字字符。  
区别是 `parseInt()` 转换过程中，小数点不是有效的数字字符；而 `parseFloat()` 转换过程中，第一个小数点是有效的，后面的小数点是无效的，从第二个小数点开始的后面所有字符会被忽略。

### BigInt 类型（ECMAScript 2020）

BigInt 类型是在 ECMAScript 2020（ES11）引入的新特性。

JavaScript 中能够精确表达的最大数字是 `2^53 - 1`，即 `Number.MAX_SAFE_INTEGER`，如果超过了这个范围，运算结果就不再准确了。

```javascript
const max = Number.MAX_SAFE_INTEGER;
console.log(max); // 9007199254740991

console.log(max + 1); // 9007199254740992
console.log(max + 2); // 9007199254740992
console.log(max + 3); // 9007199254740994
console.log(Math.pow(2, 53) === Math.pow(2, 53) + 1); // true

```

而新的 BigInt 数据类型可以解决这个问题，它能够创建更大的数字。

通过在数字末尾加上字母 `n`，就可以将它转换成 BigInt。但要注意，我们无法将标准数字与 BigInt 数字混合在一起计算，否则将抛出 TypeError。

```javascript
const bigNum = 100000000000000000000000000000n;
console.log(bigNum + 1n); // 200000000000000000000000000000n
console.log(bigNum + 1); // TypeError: Cannot mix BigInt and other types, use explicit conversions
```

### String 类型

String 类型用于表示由零或多个 16 位 Unicode 字符组成的字符序列，即字符串。

**数值转换字符串**

要把一个值转换为一个字符串有两种方式：

第一种，几乎每个值都有的 `toString()` 方法（除了 `null` 和 `undefined`）。其中数值型字符串在调用该方法时，可以传递一个参数——输出数值的基数（默认是十进制）。

第二种，`String()` 函数，它在转换过程中，如果值有 `toString()` 方法，则调用该方法（没有参数）；如果值是 `null`，则返回 `"null"`；如果值是 `undefined`，则返回 `"undefined"`。

### Symbol 类型（ECMAScript 2015）

Symbol 类型是在 ECMAScript 2015（ES6）引入的新特性。

ES5 的对象属性名都是字符串，这容易造成属性名的冲突。因此 ES6 引入了一种新的基本数据类型 Symbol，表示独一无二的值。它是 JavaScript 语言的第七种数据类型，

关于 Symbol 的知识点可以参考阮一峰老师编写的《ES6标准入门（第3版）》中 [Symbol](https://es6.ruanyifeng.com/#docs/symbol "Symbol - ECMAScript 6入门") 章节。

### Object 类型

JavaScript 中的对象是一组数据和功能的集合。对象可以通过执行 `new` 操作符后跟要创建的对象类型的名称来创建。

简单说，对象就是一组“键值对”（key-value）的集合，是一种无序的复合数据集合。

## 判断数据类型

JavaScript 中判断数据类型主要有下列几种方式：

### typeof

`typeof` 只能区分基本类型：undefined、object、boolean、number、bigint，string，symbol，function，object，对于 null、array、object 来说，使用 typeof 都会统一返回 object 字符串。

```javascript
typeof {} // "object"
typeof [] // "object"
typeof null // "object"
```

### Object.prototype.toString.call()

`Object.prototype.toString.call()` 能用于判断原生引用类型数据，返回一个形如 `"[object XXX]"` 的字符串。

判断基本类型：

```javascript
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
Object.prototype.toString.call('abc'); // "[object String]"
Object.prototype.toString.call(123); // "[object Number]"
Object.prototype.toString.call(true); // "[object Boolean]"
```

判断原生引用类型：

```javascript
// 函数类型
function fn(){
  console.log('test');
}
Object.prototype.toString.call(fn); // "[object Function]"

// 日期类型
var date = new Date();
Object.prototype.toString.call(date); // "[object Date]"

// 数组类型
var arr = [1,2,3];
Object.prototype.toString.call(arr); // "[object Array]"

// 正则表达式
var reg = /[hbc]at/gi;
Object.prototype.toString.call(reg); // "[object RegExp]"
```

但是无法判断自定义类型：

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
var person = new Person("Rose", 18);
Object.prototype.toString.call(arr); // "[object Object]"
```

很明显这种方法不能准确判断 `person` 是 `Person` 类的实例。

### instanceof

`instanceof` 运算符用于测试构造函数的 `prototype` 属性是否出现在对象的原型链中的任何位置，

可以用来判断某个构造函数的 `prototype` 属性是否存在另外一个要检测对象的原型链上，即判断一个对象是否是某个构造函数或其子构造函数的实例。

它的用法类似于 `object instanceof class`

注意左侧必须是对象（object），如果不是，直接返回 false。

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
var person = new Person("Rose", 18);
console.log(person instanceof Person); // true
```

## 数据类型转换

参考 [JavaScript 类型转换](https://www.runoob.com/js/js-type-conversion.html "JavaScript 类型转换")。

## 参考资料

* 《JavaScript高级程序设计（第3版）》  
* 《ES6标准入门（第3版）》  
* [MDN：JavaScript 数据类型和数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures "JavaScript 数据类型和数据结构")

（完）
