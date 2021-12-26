# 闭包

## 闭包的定义

> * 红宝书（第3版）：闭包是指有权访问另一个函数作用域中的变量的函数。（P178）
> * 小黄书（上）：当函数可以记住并访问所在的词法作用域时，就产生了闭包。（P44）
> * MDN：闭包可以让你从内部函数访问外部函数作用域。（[原链接](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures "闭包- JavaScript | MDN")）
> * 大部分文章：当函数嵌套时，内层函数引用了外层函数作用域下的变量，并且内层函数在全局作用域下可访问时，就形成了闭包。

**概括一下：**

在 JavaScript 中，根据词法作用域的规则，内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使该外部函数已经执行结束了，但是内部函数引用外部函数的变量依然保存在内存中，我们就把这些变量的集合称为（该外部函数的）闭包。

## 闭包的表现形式

* 返回一个函数
* 作为函数参数传递
* 回调函数
* 非典型闭包`IIFE`（立即执行函数表达式）

### 返回一个函数

这种形式的闭包在 JavaScript 中非常常见。

```javascript
var a = 1;
function foo() {
  var a = 2;
  // 这就是闭包
  return function() {
    console.log(a);
  }
}

var bar = foo();
bar(); // 输出2，而不是1
```

### 作为函数参数传递

无论通过何种手段将内部函数传递到它所在词法作用域之外，它都会持有对原始作用域的引用，无论在何处执行这个函数，都会产生闭包。

```javascript
var a = 1;
function foo() {
  var a = 2;
  function baz() {
    console.log(a);
  }
  bar(baz);
}
function bar(fn) {
  // 这就是闭包
  fn();
}

foo(); // 输出2，而不是1
```

### 回调函数

在定时器、事件监听、Ajax 请求、跨窗口通信、Web Workers 或者任何异步中，只要使用了回调函数，实际上就是在使用闭包

```javascript
// 定时器
setTimeout(function timeHandler() {
  console.log('timer');
}, 100);

// 事件监听
$('#container').click(function() {
  console.log('DOM Listener');
});
```

### IIFE（立即执行函数表达式）

IIFE（立即执行函数表达式）并不是一个典型的闭包，但它确实创建了一个闭包。

```javascript
var a = 2;
(function IIFE() {
  console.log(a); // 输出2
})()
```

## 闭包的作用

* 模块化（利用闭包的原理，将一个大的系统放在一个自调用函数中）
* 防止变量被破坏（封装私有变量，保护函数内的变量安全）

如下代码所示，在开发一些组件的时候，要实现模块化就可以使用闭包：

```javascript
var common = (function() {
  return {
    isStr:function() {
      ……
    },
    isNumber:function() {
      ……
    }
  }
})()
```

## 闭包内存释放

如果闭包使用不正确，会很容易造成内存泄漏，因此关注闭包是如何回收的能让你正确地使用闭包。

* **如果引用闭包的函数是一个全局变量**，那么闭包会一直存在直到页面关闭；但如果这个闭包以后不再使用的话，就会造成内存泄漏。
* **如果引用闭包的函数是一个局部变量**，等函数销毁后，在下次 JavaScript 引擎执行垃圾回收时，判断闭包这块内容如果已经不再被使用了，那么 JavaScript 引擎的垃圾回收器就会回收这块内存。

所以在使用闭包的时候，要尽量注意一个原则：**如果该闭包会一直使用，那么它可以作为全局变量而存在；但如果使用频率不高，而且占用内存又比较大的话，那就尽量让它成为一个局部变量。**

当然了，如果想释放以全局变量形式存在的闭包，也可以用下面这种方式：

```javascript
function foo() {
  var a = 5;
  return function() {
    a++;
    console.log(a);
  }
}
var bar = foo();

// 要想释放 bar 里面保存的 a，只能通过释放 bar
bar = null; // 或者 bar = undefined
```

（完）
