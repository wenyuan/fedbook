# String 扩展

在 ES8 中 String 新增了两个实例函数 `String.prototype.padStart()` 和 `String.prototype.padEnd()`，允许将空字符串或其他字符串添加到原始字符串的开头或结尾。

## String.prototype.padStart()

把指定字符串填充到字符串头部（如果需要的话则重复填充），返回新字符串。

**语法**

> str.padStart(targetLength [, padString])

**解释**

| 参数          | 含义                                                       | 必选 |
| ------------ | ---------------------------------------------------------- | ---- |
| targetLength | 目标字符要保持的长度值。如果小于当前字符串的长度，则返回当前字符串本身。 | Y   |
| padString    | 用于填充的字符串，默认为空。如果这个字符串太长，在达到目标长度后会被截断。| N   |

**示例**

```javascript
const str = 'hello'
console.log(str.padStart(8, '.'))     // ...hello
console.log(str.padStart(8))          //    hello
console.log(str.padStart(8, 'world')) // worhello
```

**场景1：日期格式化**

希望把当前日期格式化成：yyyy-mm-dd 的格式：

```javascript
const now = new Date()
const year = now.getFullYear()
const month = (now.getMonth() + 1).toString().padStart(2, '0')
const day = (now.getDate()).toString().padStart(2, '0')
console.log(year, month, day)
console.log(`${year}-${month}-${day}`)
```

**场景2：数字替换**

```javascript
// 数字替换, 比如手机号、身份证号
const tel = '13012345678'
const newTel = tel.slice(-4).padStart(tel.length, '*')
console.log(newTel) // *******5678
```

## String.prototype.padEnd()

把指定字符串填充到字符串尾部（如果需要的话则重复填充），返回新字符串。

**语法**

> str.padEnd(targetLength [, padString])

**解释**

| 参数          | 含义                                                       | 必选 |
| ------------ | ---------------------------------------------------------- | ---- |
| targetLength | 目标字符要保持的长度值。如果小于当前字符串的长度，则返回当前字符串本身。 | Y   |
| padString    | 用于填充的字符串，默认为空。如果这个字符串太长，在达到目标长度后会被截断。| N   |

**示例**

```javascript
const str = 'hello'
console.log(str.padEnd(8, '.'))       // hello...
console.log(str.padEnd(8))            // hello   (前面有三个空格)
console.log(str.padEnd(8, 'world'))   // hellowor
```

**场景：时间戳统一长度**

在前端处理时间戳的时候单位都是 ms（毫秒），但是后端返回的时间戳则不一定是毫秒，可能只有 10 位（以 s 秒为单位）。所以在前端处理这个时间戳的时候，保险起见，要先做一个 13 位的补全，保证单位是毫秒。

```javascript
console.log(new Date().getTime()) // 13 位的时间戳
// 补全
timestamp = 1643467755
timestamp = +String(timestamp).padEnd(13, '0') // 1643467755000
```

## 参考资料

* [String.prototype.padStart()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)
* [String.prototype.padEnd()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd)

（完）
