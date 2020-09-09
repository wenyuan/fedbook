# 函数声明

在 JavaScript 中，函数由许多组件组成并受它们影响：

* 函数体的代码
* 参数列表
* 可以从词法作用域访问的变量
* 返回值
* 调用该函数时的上下文 `this`
* 命名函数或匿名函数
* 保存函数对象的变量
* arguments 对象（在箭头函数中没有）

本文介绍六种声明 JavaScript 函数的方法，分别介绍他们的声明语法、示例和常见的陷阱。并总结在特定的情况下何时使用特定的函数类型。

## 1. 函数声明

函数声明由 `function` 关键字、必需的函数名、一对括号中的参数列表 `(para1, …, paramN)` 和一对包裹着主体代码的花括号 `{ … }` 组成。

基本模式：

```javascript
// 函数
function isEven(num) {
  return num % 2 === 0;
}
isEven(24); // => true
isEven(11); // => false
```

`function isEven (num) {…}` 是定义了 `isEven` 函数的函数声明，这个函数用于判断数字是否是偶数。

函数声明会在当前作用域内创建一个变量，它的标识符就是函数名，它的值就是函数对象。

我们都知道变量提升，对于函数而言，它会被提升到当前作用域的顶层，因此在编写代码时，可以在函数声明前就进行调用。

此时创建的函数是一个具名函数，这意味着函数对象的 `name` 属性值就是它的名称。当你需要查看堆栈信息进行调试和查错时，该属性会非常有用。

下面是一个例子，通过这个例子看下这些属性：

## 参考资料

* [6 Ways to Declare JavaScript Functions](https://dmitripavlutin.com/6-ways-to-declare-javascript-functions/ "6 Ways to Declare JavaScript Functions")（酌情翻译）