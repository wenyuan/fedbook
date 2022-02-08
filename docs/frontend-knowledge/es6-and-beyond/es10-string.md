# String 扩展

## String.prototype.trimStart()

trimStart() 方法从字符串的开头删除空格，trimLeft() 是此方法的别名。

**语法**

> str.trimStart()

或

> str.trimLeft()

::: tip
虽然 trimLeft 是 trimStart 的别名，但是你会发现 String.prototype.trimLeft.name === 'trimStart'，一定要记住。
:::

**示例**

```javascript
let str = '   foo  '
console.log(str.length) // 8
str = str.trimStart()
console.log(str.length) // 5
```

## String.prototype.trimEnd()

trimEnd() 方法从一个字符串的右端移除空白字符，trimRight 是 trimEnd 的别名。

**语法**

> str.trimEnd()

或

> str.trimRight()

::: tip
虽然 trimRight 是 trimEnd 的别名，但是你会发现 String.prototype.trimRight.name === 'trimEnd'，一定要记住。
:::

**示例**

```javascript
let str = '   foo  '
console.log(str.length) // 8
str = str.trimEnd()
console.log(str.length) // 6
```

（完）
