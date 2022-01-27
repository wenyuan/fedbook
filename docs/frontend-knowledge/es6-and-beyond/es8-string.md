# String 扩展

在 ES8 中 String 新增了两个实例函数 `String.prototype.padStart()` 和 `String.prototype.padEnd()`，允许将空字符串或其他字符串添加到原始字符串的开头或结尾。

## String.prototype.padStart()

把指定字符串填充到字符串头部，返回新字符串。

**语法**

> str.padStart(targetLength [, padString])

**解释**

| 参数          | 含义                                   | 必选 |
| ------------ | -------------------------------------- | ---- |
| targetLength | 目标字符要保持的长度值                     | Y   |
| padString    | 如果目标字符的长度不够需要的补白字符，默认为空  | N   |

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
