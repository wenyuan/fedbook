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
* 利用闭包实现结果缓存（备忘模式）

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

备忘模式就是应用闭包的特点的一个典型应用。比如有个函数：

```javascript
function add(a) {
  return a + 1;
}
```

多次运行 `add()` 时，每次得到的结果都是重新计算得到的，如果是开销很大的计算操作的话就比较消耗性能了，这里可以对已经计算过的输入做一个缓存。

所以这里可以利用闭包的特点来实现一个简单的缓存，在函数内部用一个对象存储输入的参数，如果下次再输入相同的参数，那就比较一下对象的属性，如果有缓存，就直接把值从这个对象里面取出来。

```javascript
/* 备忘函数 */
function memorize(fn) {
  var cache = {};
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var key = JSON.stringify(args);
    return cache[key] || (cache[key] = fn.apply(fn, args));
  }
}

/* 复杂计算函数 */
function add(a) {
  return a + 1;
}

var adder = memorize(add);

adder(1); // 输出: 2    当前: cache: { '[1]': 2 }
adder(1); // 输出: 2    当前: cache: { '[1]': 2 }
adder(2); // 输出: 3    当前: cache: { '[1]': 2, '[2]': 3 }
```

使用 ES6 的方式会更优雅一些：

```javascript
/* 备忘函数 */
function memorize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    return cache[key] || (cache[key] = fn.apply(fn, args));
  }
}

/* 复杂计算函数 */
function add(a) {
  return a + 1;
}

const adder = memorize(add);

adder(1); // 输出: 2    当前: cache: { '[1]': 2 }
adder(1); // 输出: 2    当前: cache: { '[1]': 2 }
adder(2); // 输出: 3    当前: cache: { '[1]': 2, '[2]': 3 }
```

稍微解释一下：

备忘函数中用 `JSON.stringify` 把传给 `adder` 函数的参数序列化成字符串，把它当做 `cache` 的索引，将 `add` 函数运行的结果当做索引的值传递给 `cache`，这样 `adder` 运行的时候如果传递的参数之前传递过，那么就返回缓存好的计算结果，不用再计算了，如果传递的参数没计算过，则计算并缓存 `fn.apply(fn, args)`，再返回计算的结果。

当然这里的实现如果要实际应用的话，还需要继续改进一下，比如：

* 缓存不可以永远扩张下去，这样太耗费内存资源，我们可以只缓存最新传入的 n 个。
* 在浏览器中使用的时候，我们可以借助浏览器的持久化手段，来进行缓存的持久化，比如 cookie、localStorage 等。

这里的复杂计算函数可以是过去的某个状态，比如对某个目标的操作，这样把过去的状态缓存起来，方便地进行状态回退。

复杂计算函数也可以是一个返回时间比较慢的异步操作，这样如果把结果缓存起来，下次就可以直接从本地获取，而不是重新进行异步请求。

::: warning
cache 不可以是 `Map`，因为 `Map` 的键是使用 `===` 比较的，因此当传入引用类型值作为键时，虽然它们看上去是相等的，但实际并不是，比如 `[1]!==[1]`，所以还是被存为不同的键。
:::

```javascript
//  X 错误示范
function memorize(fn) {
  const cache = new Map();
  return function(...args) {
    return cache.get(args) || cache.set(args, fn.apply(fn, args)).get(args);
  }
}

function add(a) {
  return a + 1;
}

const adder = memorize(add);

adder(1); // 2    cache: { [ 1 ] => 2 }
adder(1); // 2    cache: { [ 1 ] => 2, [ 1 ] => 2 }
adder(2); // 3    cache: { [ 1 ] => 2, [ 1 ] => 2, [ 2 ] => 3 }
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
