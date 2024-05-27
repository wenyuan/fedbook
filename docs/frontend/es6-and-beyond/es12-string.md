# String 扩展

## String.prototype.replaceAll()

`replaceAll()` 方法返回一个全新的字符串，所有符合匹配规则的字符都将被替换掉。

**语法**

> const newStr = str.replaceAll(regexp|substr, newSubstr|function)

第一个参数（匹配项）可以是一个字符串或者一个正则表达式，第二个参数（替换值）可以是一个字符串或者一个每次匹配都要调用的回调函数，这点和 [replace()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace) 方法是一样的。

**示例**

```javascript
const str = 'PHP is the best language, I love the PHP, are you interested in PHP?';
const newStr = str.replaceAll('PHP', 'JavaScript'); 
console.log(newStr);
// "JavaScript is the best language, I love the JavaScript, are you interested in JavaScript?"
```

## 参考资料

* [String.prototype.replaceAll()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll)

（完）
