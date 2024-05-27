# String 扩展

## Unicode 表示法

ES6 加强了对 Unicode 的支持，允许采用 `\uxxxx` 形式表示一个字符，其中 `xxxx` 表示字符的 Unicode 码点。

```javascript
"\u0061" // 'a'
```

但是，这种表示法只限于码点在 `\u0000` ~ `\uFFFF` 之间的字符。超出这个范围的字符，必须用两个双字节的形式表示。

```javascript
"\uD842\uDFB7" // "𠮷"

"\u20BB7"      // " 7"
```

上面代码表示，如果直接在 `\u` 后面跟上超过 `0xFFFF` 的数值（比如 `\u20BB7`），JavaScript 会理解成 `\u20BB+7`。由于 `\u20BB` 是一个不可打印字符，所以只会显示一个空格，后面跟着一个 `7`。

ES6 对这一点做出了改进，只要将码点放入大括号，就能正确解读该字符。

```javascript
"\u{20BB7}" // "𠮷"
```

有了这种表示法之后，JavaScript 共有 6 种方法可以表示一个字符。

```javascript
'\z' === 'z'      // true
'\172' === 'z'    // true
'\x7A' === 'z'    // true
'\u007A' === 'z'  // true
'\u{7A}' === 'z'  // true
```

## 遍历器接口

ES6 为字符串添加了遍历器接口，使得字符串可以被 for...of 循环遍历。

```javascript
for (let item of 'HelloWorld') {
  console.log(item)
}
```

## 模板字符串

在 ES6 之前使用字符串时有很多痛点：

* 字符串很长要手动换行
* 字符串中有变量或者表达式，需要不断拼接
* 字符串中有逻辑运算，需要使用逻辑判断 + 字符串拼接

而在 ES6 的模板字符串很好的解决了这些问题：

* **模板字符串是增强版的字符串，用反引号标识**

```javascript
`string text`
```

* **模板字符串可以解析换行操作**

```javascript
`string text line 1
 string text line 2`
```

* **模板字符串表示多行字符串时，所有的空格和缩进都会被保留在输出之中**

```javascript
`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`

// 上述代码中，<ul> 标签前面会有一个换行也被保留下来
// 如果不想要这个换行，可以使用 trim 方法消除它
`
<ul>
  <li>first</li>
  <li>second</li>
</ul>
`.trim()
```

* **模板字符串中可以使用 `${}` 包裹变量或表达式**

```javascript
let name = 'zhangsan', age = 13
`My name is ${name}, I am ${age} years old.`

// 大括号内部可以放入任意的 JavaScript 表达式, 包括运算、引用对象属性等
let x = 1, y = 2
`${x} + ${y} = ${x + y}`

let obj = { x: 1, y: 2}
`${obj.x + obj.y}`
```

## 扩展方法

### String.prototype.fromCodePoint()

用于从 Unicode 码点返回对应字符，并且可以识别大于 `0xFFFF` 的字符。

```javascript
// ES5
console.log(String.fromCharCode(0x20BB7))

// ES6
console.log(String.fromCodePoint(0x20BB7))
```

### String.prototype.includes()

ES5 中可以使用 indexOf 方法来判断一个字符串是否包含在另一个字符串中，indexOf 返回出现的下标位置，如果不存在则返回 `-1`。

```javascript
const str = 'HelloWorld'

console.log(str.indexOf('or'))
```

ES6 提供了 includes 方法来判断一个字符串是否包含在另一个字符串中，返回 boolean 类型的值。

```javascript
const str = 'HelloWorld'

console.log(str.includes('or'))
```

### String.prototype.startsWith()

判断参数字符串是否在原字符串的头部，返回 boolean 类型的值。

```javascript
const str = 'HelloWorld'

console.log(str.startsWith('el'))
```

### String.prototype.endsWith()

判断参数字符串是否在原字符串的尾部，返回 boolean 类型的值。

```javascript
const str = 'HelloWorld'

console.log(str.endsWith('orld'))
```

### String.prototype.repeat()

repeat 方法返回一个新字符串，表示将原字符串重复 n 次。

```javascript
const str = 'Hello'

const newStr = str.repeat(10)

console.log(newStr)
```

## 参考资料

* [字符串的扩展](https://es6.ruanyifeng.com/#docs/string)
* [模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals)

（完）
