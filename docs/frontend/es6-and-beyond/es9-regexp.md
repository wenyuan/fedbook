# RegExp 扩展

## dotAll 模式

正则表达式中，点（`.`）是一个特殊字符，代表任意的单个字符，但是有两个例外。一个是四个字节的 UTF-16 字符，这个可以用 `u` 修饰符解决；另一个是行终止符（line terminator character）。

行终止符：

* U+000A 换行符（\n）
* U+000D 回车符（\r）
* U+2028 行分隔符（line separator）
* U+2029 段分隔符（paragraph separator）

在 ES5 中，可以使用 `[\d\D]`、`[\w\W]`、`[\s\S]` 和 `[^]` 中任何的一个。

```javascript
console.log(/foo[\d\D]bar/.test('foo\nbar')) // true
// or
console.log(/foo[\w\W]bar/.test('foo\nbar')) // true
// or
console.log(/foo[\s\S]bar/.test('foo\nbar')) // true
// or
console.log(/foo[^]bar/.test('foo\nbar'))    // true
```

但这种解决方案不太符合直觉，于是有了 dotAll 模式（即点 - dot 代表一切字符）。只需要在最后面加 `s`，点号（`.`）匹配就可以包含换行符了。

```javascript
console.log(/foo.bar/.test('foo\nbar'))  // false
console.log(/foo.bar/s.test('foo\nbar')) // true
```

如何判断当前正则是否使用了 dotAll 模式呢？

```javascript
const re = /foo.bar/s
console.log(re.test('foo\nbar')) // true
console.log(re.dotAll)           // true
console.log(re.flags)            // 's'
```

## 具名组匹配

我们在写正则表达式的时候，可以把一部分用`()`包裹起来，被包裹起来的这部分称作「分组捕获」。

```javascript
console.log('2022-02-02'.match(/(\d{4})-(\d{2})-(\d{2})/))
// ['2022-02-02', '2022', '02', '02', index: 0, input: '2022-02-02', groups: undefined]
```

这个正则匹配很简单，按照 match 的语法，没有使用 `g` 标识符，所以返回值第一个数值是正则表达式的完整匹配，接下来的第二个值到第四个值是分组匹配（2022, 02, 02）。

此外 match 返回值还有几个属性，分别是：

* index：匹配到的结果的开始位置索引
* input：搜索的字符串
* groups：一个捕获组数组 或 `undefined`（如果没有定义命名捕获组）

可以通过数组来获取这些捕获：

```javascript
let t = '2022-02-07'.match(/(\d{4})-(\d{2})-(\d{2})/)
console.log(t[1]) // 2022
console.log(t[2]) // 02
console.log(t[3]) // 07
```

上面的 `groups` 打印出来是 `undefined`，原因是没有定义命名捕获分组。如果定义命名捕获分组后，返回值 `groups` 就是 Object 了：

```javascript
console.log('2022-02-07'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/))
// ['2022-02-07', '2022', '02', '07', index: 0, input: '2022-02-07', groups: {…}]
// 其中 groups = {year: '2022', month: '02', day: '07'}
```

这个 Object 的 key 就是正则表达式中定义的，也就是把捕获分组进行了命名。想获取这些捕获可以这样做：

```javascript
let t = '2022-02-07'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)
// ['2022-02-07', '2022', '02', '07', index: 0, input: '2022-02-07', groups: {…}]
console.log(t.groups.year)  // 2022
console.log(t.groups.month) // 02
console.log(t.groups.day)   // 07
```

## 后行断言

在 ES9 之前 JavaScript 正则只支持先行断言，不支持后行断言。

**所谓先行断言**（语法：`(?=reg)`），就是匹配的某段或某个字符串，它后面必须跟随指定的字符串，通俗的说就是「知道后面拿前面」。

例如下面这段代码，要匹配 **空白符 + `world`** 前面的一个或多个字符：

```javascript
let test = 'hello world'
console.log(test.match(/\w+(?=\sworld)/))
// ['hello', index: 0, input: 'hello world', groups: undefined]
```

**ES9 支持的后行断言**（语法：`(?<=reg)`），是匹配的某段或某个字符串，它前面必须有指定字符串，通俗的说就是「知道前面拿后面」。

例如下面这段代码，要匹配 **`hello` + 空白符** 后面的一个或多个字符：

```javascript
let test = 'hello world'
console.log(test.match(/(?<=hello\s)\w+/))
// ['world', index: 6, input: 'hello world', groups: undefined]
```

（完）
