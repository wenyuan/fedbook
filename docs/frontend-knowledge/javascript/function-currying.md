# 函数柯里化

## 柯里化的定义

> 红宝书（第3版）：用于创建已经设置好了一个或多个参数的函数。基本方法是使用一个闭包返回一个函数。（P604）

> 维基百科：柯里化（英语：Currying），是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。（[原链接](https://zh.wikipedia.org/wiki/柯里化)）

官方解释看得有点懵，大白话概括一下：

柯里化技术，**主要体现在函数里面返回函数**。就是将多变量函数拆解为单变量（或部分变量）的多个函数并依次调用。

再直白一点：利用闭包，可以形成一个不销毁的私有作用域，把预先处理的内容都存在这个不销毁的作用域里面，并且返回一个函数，以后要执行的就是这个函数。

PS：如果还是不理解也没关系，跟闭包一样不用死扣定义，继续往下面看应用就行了。

## 柯里化的应用

柯里化有 3 个常见应用：

* 参数复用 – 当在多次调用同一个函数，并且传递的参数绝大多数是相同的，那么该函数可能是一个很好的柯里化候选
* 提前返回 – 多次调用多次内部判断，可以直接把第一次判断的结果返回外部接收
* 延迟计算/运行 – 避免重复的去执行程序，等真正需要结果的时候再执行

## 应用一：参数复用

如下名为 `uri` 的函数，接收 3 个参数，函数的作用是返回三个参数拼接的字符串。

```javascript
function uri(protocol, hostname, pathname) {
  return `${protocol}${hostname}${pathname}`;
}

// 测试一下
const uri1 = url('https://', 'www.fedbook.cn', '/function-curring/')
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

const uri1 = uri_https('www.fedbook.cn', '/frontend-knowledge/javascript/function-currying/');
const uri2 = uri_https('www.fedbook.cn', '/handwritten/javascript/10-实现bind方法/');
const uri3 = uri_https('www.wenyuanblog.com', '/');

console.log(uri1);
console.log(uri2);
console.log(uri3);
```

## 应用二：兼容性检测

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

## 应用三：实现一个 add 函数

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

（完）
