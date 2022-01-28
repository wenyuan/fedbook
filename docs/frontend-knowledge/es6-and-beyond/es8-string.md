# String 扩展

在 ES8 中 String 新增了两个实例函数 `String.prototype.padStart()` 和 `String.prototype.padEnd()`，允许将空字符串或其他字符串添加到原始字符串的开头或结尾。

## String.prototype.padStart()

把指定字符串填充到字符串头部，返回新字符串。

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
console.log(str.padStart(8, 'x'))     // xxxhello
console.log(str.padEnd(8, 'y'))       // helloyyy
console.log(str.padStart(8))          //    hello
console.log(str.padStart(8, 'world')) // worhello
console.log(str.padEnd(8, 'world'))   // hellowor
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
