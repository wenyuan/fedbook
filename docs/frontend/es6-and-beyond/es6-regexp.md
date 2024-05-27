# RegExp 扩展

## y 修饰符

ES6 为正则表达式添加了 y 修饰符，叫做「粘连」（sticky）修饰符。

y 修饰符的作用与 g 修饰符类似，也是全局匹配，后一次匹配都从上一次匹配成功的下一个位置开始。

不同之处在于，g 修饰符只要剩余位置中存在匹配就可，而 y 修饰符确保匹配必须从剩余的第一个位置开始，这也就是「粘连」的涵义。

```javascript
const str = 'aaa_aa_a'
const regex1 = /a+/g
const regex2 = /a+/y

regex1.exec(str) // [ 'aaa', index: 0, input: 'aaa_aa_a', groups: undefined ]
regex1.exec(str) // [ 'aa', index: 4, input: 'aaa_aa_a', groups: undefined ]

regex2.exec(str) // [ 'aaa', index: 0, input: 'aaa_aa_a', groups: undefined ]
regex2.exec(str) // null
```

上面代码有两个正则表达式，都表示从字符串中从头开始匹配 `a` 字符，遇到其它字符后停止匹配。连续执行表示依次往后匹配，如果没有找到 `a`，就代表匹配失败，返回 `null`。匹配失败后如果再执行的话，就是重新从头开始。

此时 g 修饰符和 y 修饰符的区别就体现出来了：

* 这两个正则表达式各执行了两次。
* 第一次执行，两者行为相同，剩余字符串都是 `_aa_a`。
* 第二次执行，g 修饰能从 `_aa` 中找到 `aa`；而 y 修饰符需要直接遇到 `a`，但先遇到的是 `_`，所以返回 `null`。

进一步说，y 修饰符号隐含了头部匹配的标志 `^`。

## u 修饰符

ES6 为正则表达式添加了 u 修饰符，含义为「Unicode 模式」，用来正确处理大于 `\uFFFF` 的 Unicode 字符。也就是说，会正确处理四个字节的 UTF-16 编码。

```javascript
// ES5
/^\uD83D/.test('\uD83D\uDC2A')  // true

// ES6, 引入 u 修饰符
/^\uD83D/u.test('\uD83D\uDC2A') // false
```

上面代码中， `\uD83D\uDC2A` 是一个四个字节的 UTF-16 编码，代表一个字符 `🐪`。但是，ES5 不支持四个字节的 UTF-16 编码，会将其识别为两个字符，导致正则匹配结果为 `true`。加了 u 修饰符以后，ES6 就会识别其为一个字符，所以正则匹配结果为 `false`。

一旦加上 u 修饰符号，就会修改下面这些正则表达式的行为。

### 点字符

点（`.`）字符在正则表达式中，含义是除了换行符以外的任意单个字符。对于码点大于 0xFFFF 的 `Unicode` 字符，点字符不能识别，必须加上 u 修饰符。

```javascript
let s = '𠮷'

/^.$/.test(s) // false

/^.$/u.test(s) // true
```

::: tip
'𠮷'这个字读 jí，是'吉'字的异形体，Unicode 码点 [U+20BB7](https://www.fileformat.info/info/unicode/char/20bb7/index.htm)
:::

### Unicode 字符表示法

ES6 新增了使用大括号表示 Unicode 字符，这种表示法在正则表达式中必须加上 u 修饰符，才能识别。

```javascript
/\u{61}/.test('a')      // false

/\u{61}/u.test('a')     // true

/\u{20BB7}/u.test('𠮷') // true
```

上面代码表示，如果不加 u 修饰符，正则表达式无法识别 `\u{61}` 这种表示法，只会认为这匹配 61 个连续的 u。

### 量词

使用 u 修饰符后，所有量词都会正确识别码点大于 `0xFFFF` 的 Unicode 字符。

```javascript
/a{2}/.test('aa')   // true

/a{2}/u.test('aa')  // true

/𠮷{2}/.test('𠮷𠮷') // false

/𠮷{2}/u.test('𠮷𠮷') // true
```

另外，只有在使用 u 修饰符的情况下，Unicode 表达式当中的大括号才会被正确解读，否则会被解读为量词。

```javascript
/^\u{3}$/.test('uuu') // true
```

上面代码中，由于正则表达式没有 u 修饰符，所以大括号被解读为量词。加上 u 修饰符，就会被解读为 Unicode 表达式。

```javascript
/\u{20BB7}{2}/u.test('𠮷𠮷') // true
```

使用 u 修饰符之后 Unicode 表达式+量词也是可以的。

### 预定义模式

u 修饰符也影响到预定义模式，能否正确识别码点大于 `0xFFFF` 的 Unicode 字符。

```javascript
/^\S$/.test('𠮷')  // false

/^\S$/u.test('𠮷') // true
```

上面代码的 `\S` 是预定义模式，匹配所有不是空格的字符。只有加了 u 修饰符，它才能正确匹配码点大于 `0xFFFF` 的 Unicode 字符。

利用这一点，可以写出一个正确返回字符串长度的函数。

```javascript
function codePointLength(text) {
    const result = text.match(/[\s\S]/gu)
    return result ? result.length : 0
}

const s = '𠮷𠮷'

// 不准确的结果
console.log(s.length)           // 4
// 准确的结果
console.log(codePointLength(s)) // 2
```

### i 修饰符

有些 Unicode 字符的编码不同，但是字型很相近，比如，`\u004B`与 `\u212A` 都是大写的 `K`。

```javascript
/[a-z]/i.test('\u212A')  // false

/[a-z]/iu.test('\u212A') // true
```

上面代码中，不加 i 修饰符，就无法识别非规范的 K 字符。

## 参考资料

* [Unicode与JavaScript详解](http://www.ruanyifeng.com/blog/2014/12/unicode.html)
* [正则的扩展](https://es6.ruanyifeng.com/#docs/regex)
* 《[JavaScript 正则表达式迷你书](https://github.com/qdlaoyao/js-regex-mini-book)》

（完）
