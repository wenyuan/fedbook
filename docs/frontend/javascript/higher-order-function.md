# 高阶函数

## 前言

「JavaScript 中，函数是一等公民」，在各种书籍和文章中我们总能看到这句话。

通俗地解释就是：JS 中的函数也是对象，可以有属性，可以赋值给一个变量，可以放在数组里作为元素，可以作为其他对象的属性，普通对象能做的它能做，普通对象不能做的它也能做。

而所谓的高阶函数（Higher-order function），就是输入参数里有函数，或者输出是函数的函数。

最常见的高阶函数有 `map()`、`reduce()`、`filter()`、`sort()`、`setTimeout`、`setInterval` 和 Ajax 请求，我们称之为回调函数，因为它将函数作为参数传递给另一个函数。

另一个经常看到的高阶函数的场景是在一个函数内部输出另一个函数，比如闭包，还有接下来要讲的柯里化、反柯里化和偏函数。

## 柯里化

### 定义

> * 红宝书（第3版）：用于创建已经设置好了一个或多个参数的函数。基本方法是使用一个闭包返回一个函数。（P604）
> * 维基百科：柯里化（英语：Currying），是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。（[原链接](https://zh.wikipedia.org/wiki/柯里化)）
> * 柯里化的原理就是利用闭包，可以形成一个不销毁的私有作用域，把预先处理的内容都存在这个不销毁的作用域里面，并且返回一个函数，以后要执行的就是这个函数。

官方解释看得有点懵，大白话概括一下：

**柯里化**（Currying）又称部分求值（Partial Evaluation），是把接受多个参数的原函数变换成接受一个单一参数（原函数的第一个参数）的函数，并且返回一个新函数，新函数能够接受余下的参数，最后返回同原函数一样的结果。

核心思想是把多参数传入的函数拆成单（或部分）参数函数，内部再返回调用下一个单（或部分）参数函数，依次处理剩余的参数。

### 应用

柯里化有 3 个常见应用：

* 参数复用 – 当在多次调用同一个函数，并且传递的参数绝大多数是相同的，那么该函数可能是一个很好的柯里化候选
* 提前返回 – 多次调用多次内部判断，可以直接把第一次判断的结果返回外部接收
* 延迟计算/运行 – 避免重复的去执行程序，等真正需要结果的时候再执行

### 通用实现

```javascript
// ES5 方式
function currying(fn) {
  var rest1 = Array.prototype.slice.call(arguments)
  rest1.shift()
  return function() {
    var rest2 = Array.prototype.slice.call(arguments)
    return fn.apply(null, rest1.concat(rest2))
  }
}

// ES6 方式
function currying(fn, ...rest1) {
  return function(...rest2) {
    return fn.apply(null, rest1.concat(rest2))
  }
}
```

用它将一个 `sayHello` 函数柯里化试试：

```javascript
// 接上面
function sayHello(name, age, fruit) {
  console.log(`我叫 ${name},我 ${age} 岁了, 我喜欢吃 ${fruit}`)
}

var curryingShowMsg1 = currying(sayHello, '小明')
curryingShowMsg1(22, '苹果')           // 输出: 我叫 小明,我 22 岁了, 我喜欢吃 苹果

var curryingShowMsg2 = currying(sayHello, '小衰', 20)
curryingShowMsg2('西瓜')               // 输出: 我叫 小衰,我 20 岁了, 我喜欢吃 西瓜
```

### 应用一：参数复用

如下名为 `uri` 的函数，接收 3 个参数，函数的作用是返回三个参数拼接的字符串。

```javascript
function uri(protocol, hostname, pathname) {
  return `${protocol}${hostname}${pathname}`;
}

// 测试一下
const uri1 = url('https://', 'wenyuan.github.io', '/function-curring/')
console.log(uri1)
```

上面这种写法的弊端是：当我们有很多网址时，会导致非常多重复的参数（比如 `https://` 就是重复的参数，我们在浏览器里面输入网址也不需要输入 http 或者 https）。

利用柯里化实现参数复用的思路：

* 原函数（称为函数 A）只设置一个参数（接收协议这个参数）；
* 在函数内部再创建一个函数（称为函数 B），函数 B 把刚才剩余的两个参数给补上，并返回字符串形式的 url；
* 函数 A 返回函数 B。

```javascript
function uri_curring(protocol) {
  return function(hostname, pathname) {
    return `${protocol}${hostname}${pathname}`; 
  }
}

// 测试一下
const uri_https = uri_curring('https://');

const uri1 = uri_https('wenyuan.github.io', '/frontend/javascript/function-currying/');
const uri2 = uri_https('wenyuan.github.io', '/handwritten/javascript/10-实现bind方法/');
const uri3 = uri_https('www.myblog.com', '/');

console.log(uri1);
console.log(uri2);
console.log(uri3);
```

### 应用二：兼容性检测

::: warning
以下代码为了编写方便，会使用 ES6 的语法。实际生产环境中如果要做兼容性检测功能，需要转换成 ES5 语法。
:::

因为浏览器的发展和各种原因，有些函数和方法是不被部分浏览器支持的，此时需要提前进行判断，从而确定用户的浏览器是否支持相应的方法。

以事件监听为例，IE（IE9 之前） 支持的是 [`attachEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener) 方法，其它主流浏览器支持的是 [`addEventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener) 方法，我们需要创建一个新的函数来进行两者的判断。

```javascript
const addEvent  = function(element, type, listener, useCapture) {
  if(window.addEventListener) {
    console.log('判断为其它浏览器')
    // 和原生 addEventListener 一样的函数
    // element: 需要添加事件监听的元素
    // type: 为元素添加什么类型的事件
    // listener: 执行的回调函数
    // useCapture: 要进行事件冒泡或者事件捕获的选择
    element.addEventListener(type, function(e) {
      // 为了规避 this 指向问题，用 call 进行 this 的绑定
      listener.call(element, e);
    }, useCapture);
  } else if(window.attachEvent) {
    console.log('判断为 IE9 以下浏览器')
    // 原生的 attachEvent 函数
    // 不需要第四个参数，因为 IE 支持的是事件冒泡
    // 多拼接一个 on，这样就可以使用统一书写形式的事件类型了
    element.attachEvent('on' + type, function(e) {
      listener.call(element, e);
    });
  }
}

// 测试一下
let div = document.querySelector('div');
let p = document.querySelector('p');
let span = document.querySelector('span');

addEvent(div, 'click', (e) => {console.log('点击了 div');}, true);
addEvent(p, 'click', (e) => {console.log('点击了 p');}, true);
addEvent(span, 'click', (e) => {console.log('点击了 span');}, true);
```

上面这种封装的弊端是：每次写监听事件的时候调用 `addEvent` 函数，都会进行 `if...else...` 的兼容性判断。事实上在代码中只需要执行一次兼容性判断就可以了，把根据一次判定之后的结果动态生成新的函数，以后就不必重新计算。

那么怎么用函数柯里化优化这个封装函数？

```javascript
// 使用立即执行函数，当我们把这个函数放在文件的头部，就可以先进行执行判断
const addEvent  = (function() {
  if(window.addEventListener) {
    console.log('判断为其它浏览器')
    return function(element, type, listener, useCapture) {
      element.addEventListener(type, function(e) {
        listener.call(element, e);
      }, useCapture);
    }
  } else if(window.attachEvent) {
    console.log('判断为 IE9 以下浏览器')
    return function(element, type, handler) {
      element.attachEvent('on'+type, function(e) {
        handler.call(element, e);
      });
    }
  }
}) ();

// 测试一下
let div = document.querySelector('div');
let p = document.querySelector('p');
let span = document.querySelector('span');

addEvent(div, 'click', (e) => {console.log('点击了 div');}, true);
addEvent(p, 'click', (e) => {console.log('点击了 p');}, true);
addEvent(span, 'click', (e) => {console.log('点击了 span');}, true);
```

上述封装因为立即执行函数的原因，触发多次事件也依旧只会触发一次 if 条件判断。

这里使用了函数柯里化的两个特点：提前返回和延迟执行。

### 应用三：实现一个 add 函数

这是一道经典面试题，要求我们实现一个 add 函数，可以实现以下计算结果：

```javascript
add(1)(2)(3) = 6;
add(1, 2, 3)(4) = 10;
add(1)(2)(3)(4)(5) = 15;
```

通过这道题正好可以解释柯里化的延迟执行，直接上代码：

```javascript
function add() {
  // 将传入的不定参数转为数组对象
  let args = Array.prototype.slice.call(arguments);

  // 递归：内部函数里面进行自己调用自己
  // 当 add 函数不断调用时，把第 N+1 个括号的参数加入到第 N 个括号的参数里面
  let inner = function() {
    args.push(...arguments);
    return inner;
  }
  
  inner.toString = function() {
    // args 里的值不断累加
    return args.reduce(function(prev, cur) {
      return prev + cur;  
    });
  };

  return inner;
}

// 测试一下
let result = add(1)(2)(3)(4);
console.log(result);
```

解释几个关键点：

**1）不定参数 `arguments` 需要转为数组对象：**

因为 `arguments` 并不是真正的数组，而是与数组类似对象，`Array.prototype.slice.call(arguments)` 能将具有 `length` 属性的对象转成数组。

**2）`toString` 隐形转换的特性：**

对于 `add(1)(2)(3)(4)`，执行每个括号的时候都返回 `inner` 函数，不断自己调用自己，每次内部函数返回的都是内部函数。

如果打印函数执行的最终返回结果，可以发现返回了一个字符串（原本的函数被转换为字符串返回了），这即是发生了隐式转换，而发生隐式转换是因为调用了内部的 `toString` 方法。

知道了这一点，我们就可以利用这个特性自定义返回的内容：重写 `inner` 函数的 `toString` 方法，在里面实现参数相加的执行代码。

值得一提的是，这种处理后能够返回正确的累加结果，但返回的结果是个函数类型（`function`），这是因为我们在用递归返回函数，内部函数在被隐式转换为字符串之前本来就是一个函数。

## 反柯里化

### 定义

柯里化是固定部分参数，返回一个接受剩余参数的函数，也称为部分计算函数，目的是为了缩小适用范围，创建一个针对性更强的函数。核心思想是把多参数传入的函数拆成单参数（或部分）函数，内部再返回调用下一个单参数（或部分）函数，依次处理剩余的参数。

而**反柯里化**，从字面讲，意义和用法跟函数柯里化相比正好相反，扩大适用范围，创建一个应用范围更广的函数。使本来只有特定对象才适用的方法，扩展到更多的对象。

### 通用实现

```javascript
// ES5 方式
Function.prototype.unCurrying = function() {
  var self = this
  return function() {
    var rest = Array.prototype.slice.call(arguments)
    return Function.prototype.call.apply(self, rest)
  }
}

// ES6 方式
Function.prototype.unCurrying = function() {
  const self = this
  return function(...rest) {
    return Function.prototype.call.apply(self, rest)
  }
}
```

如果觉得把函数放在 Function 的原型上不太好，也可以这样：

```javascript
// ES5 方式
function unCurrying(fn) {
  return function (tar) {
    var rest = Array.prototype.slice.call(arguments)
    rest.shift()
    return fn.apply(tar, rest)
  }
}

// ES6 方式
function unCurrying(fn) {
  return function(tar, ...argu) {
    return fn.apply(tar, argu)
  }
}
```

下面简单试用一下反柯里化通用实现，我们将 Array 上的 `push` 方法借出来给 arguments 这样的类数组增加一个元素：

```javascript
// 接上面
var push = unCurrying(Array.prototype.push)

function execPush() {
  push(arguments, 4)
  console.log(arguments)
}

execPush(1, 2, 3)    // 输出: [1, 2, 3, 4]
```

### 区别

简单说，函数柯里化就是对高阶函数的降阶处理，缩小适用范围，创建一个针对性更强的函数。

```javascript
function(arg1, arg2)              // => function(arg1)(arg2)
function(arg1, arg2, arg3)        // => function(arg1)(arg2)(arg3)
function(arg1, arg2, arg3, arg4)  // => function(arg1)(arg2)(arg3)(arg4)
function(arg1, arg2, ..., argn)   // => function(arg1)(arg2)…(argn)
```

而反柯里化就是反过来，增加适用范围，让方法使用场景更大。使用反柯里化，可以把原生方法借出来，让任何对象拥有原生对象的方法。

```javascript
obj.func(arg1, arg2)        // => func(obj, arg1, arg2)
```

可以这样理解柯里化和反柯里化的区别：

* 柯里化是在运算前提前传参，可以传递多个参数。
* 反柯里化是延迟传参，在运算时把原来已经固定的参数或者 this 上下文等当作参数延迟到未来传递。

## 偏函数

偏函数是创建一个调用另外一个部分（参数或变量已预制的函数）的函数，函数可以根据传入的参数来生成一个真正执行的函数。其本身不包括我们真正需要的逻辑代码，只是根据传入的参数返回其他的函数，返回的函数中才有真正的处理逻辑比如：

```javascript
var isType = function(type) {
  return function(obj) {
    return Object.prototype.toString.call(obj) === `[object ${type}]`
  }
}

var isString = isType('String')
var isFunction = isType('Function')
```

这样就用偏函数快速创建了一组判断对象类型的方法。

偏函数和柯里化的区别：

* **柯里化**是把一个接受 n 个参数的函数，由原本的一次性传递所有参数并执行变成了可以分多次接受参数再执行，例如：`add = (x, y, z) => x + y + z→curryAdd = x => y => z => x + y + z`。
* **偏函数**固定了函数的某个部分，通过传入的参数或者方法返回一个新的函数来接受剩余的参数，数量可能是一个也可能是多个

当一个柯里化函数只接受两次参数时，比如 `curry()()`，这时的柯里化函数和偏函数概念类似，可以认为偏函数是柯里化函数的退化版。

（完）
