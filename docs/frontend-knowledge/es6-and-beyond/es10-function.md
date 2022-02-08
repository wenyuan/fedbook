# 修订 Function.prototype.toString()

函数是对象，并且每个对象都有一个 `.toString()` 方法，因为它最初存在于 Object.prototype.toString() 上。所有对象（包括函数）都是通过基于原型的类继承从它继承的。这意味着我们以前已经有 funcion.toString() 方法了。

Function.prototype.toString() 方法返回一个表示当前函数源代码的字符串。这意味着还将返回注释、空格和语法详细信息。

```javascript
function foo() {
  // ES10 新特性
  console.log('hello world')
}

console.log(foo.toString())

// 直接在方法名toString()
console.log(Number.parseInt.toString())
```

（完）
