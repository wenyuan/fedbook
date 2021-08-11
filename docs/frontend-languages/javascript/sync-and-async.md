# 同步与异步

> 在 ES5 中，异步编程的传统解决方案是通过回调函数或事件监听。  
> 在 ES6 中，Promise 成为了异步编程的一种更合理更强大的解决方案。  
> 在 ES7 中，async/await 优化了 ES6 异步编程的解决方案，比 Promise 更加优美。

## 同步与异步概念

### 代码举例

**同步**：同步就是后一个任务等待前一个任务执行完毕后，再执行，执行顺序和任务的排列顺序一致。  
**异步**：异步是非阻塞的，异步逻辑与主逻辑相互独立，主逻辑不需要等待异步逻辑完成，而是可以立刻继续下去。

举个例子：

```javascript
console.log('a');
console.log('b');
console.log('c');

setTimeout(() => {console.log('我是一段异步操作')}, 2000);

console.log('d');
console.log('e');
```

从以上代码的输出结果可以看出，异步函数的好处是**不会阻塞主任务**。

再举个例子：

```javascript
console.log('a');
console.log('b');
console.log('c');

setTimeout(() => {console.log('我是写在前面的异步操作')}, 2000);

setTimeout(() => {console.log('我是写在后面的异步操作')}, 500);

console.log('d');
console.log('e');
```

上述代码的执行结果表明：当有多个异步函数时，跟书写顺序无关，**谁先返回，就先执行谁的回调**。

### 过程分析

运行以下 JavaScript，猜想控制台会输出什么内容，并分析执行过程是怎样的：

```javascript
const foo = () => console.log("First");
const bar = () => setTimeout(() => console.log("Second"), 500);
const baz = () => console.log("Third");

bar()
foo()
baz()
```

分析执行过程（其中 4、5 两个步骤的先后顺序不绝对，主要看倒计时多久）：

* 调用 `bar` 函数，它进入调用栈；`bar` 返回一个 `setTimeout` 函数，也进入调用栈执行。
* `setTimeout` 开启定时器后，它的回调进入 Web API。于此同时，执行完成的 `setTimeout` 函数和 `bar` 从调用堆栈中弹出。
* 定时器开始倒计时，同时 `foo` 函数调用并打印出字符串 `"First"`，然后返回执行结果（`undefined`）。
* `baz` 函数被调用。
* 定时器倒计时结束，回调函数添加到消息队列中。
* `baz` 函数打印出字符串 `"Third"`，然后返回执行结果（`undefined`）。
* `baz` 指行完成后，事件循环看到调用栈为空，从消息队列中取出回调函数，将其添加到调用栈。
* 回调函数打印出字符串 `"Second"`。
* 全部执行完毕。

动图演示执行过程：

<div style="text-align: center;">
  <img src="./assets/event-loop-visualized.gif" alt="代码执行过程">
  <p style="text-align: center; color: #888;">（代码执行过程，图来源于网络 - 文末已附原文链接）</p>
</div>

在这个过程中，需要引入三个概念：**调用栈**，**事件循环**，**消息队列**。

* **调用栈**：每次执行任务时，任务（以同步模式执行的代码）进入调用栈并执行，执行完后任务弹出调用栈。
* **事件循环（Event Loop）**：它只做一件事：负责监听调用栈和消息队列，一旦调用栈中所有的任务都结束了，事件循环就从消息队列中取出第一个回调函数，将它压入调用栈；如果消息队列中暂时是空的，事件循环就会先暂停，等回函数调进消息队列（如果有）。
* **消息队列**：存放异步任务的回调，先进先出。

下面这张图可以很清晰的表达出同步任务和异步任务的执行顺序：

<div style="text-align: center;">
  <img src="./assets/sync-and-async-timeline.svg" height="480" alt="同步任务和异步任务的执行时间线">
  <p style="text-align: center; color: #888;">（同步任务和异步任务的执行时间线）</p>
</div>

我们可以根据这张图归纳出一般的执行流程：

* JavaScript 线程依次执行每行代码。对于同步代码，将它放到调用栈中执行，执行完后然后弹出调用栈（例如 `console.log()`）。
* 某个时刻，JavaScript 线程发起了一个异步调用（例如 `setTimeout`）。
  * `setTimeout` 函数进入调用栈，开启倒计时器，然后 `setTimeout` 函数弹出调用栈。
  * JavaScript 线程继续往后执行。
* 异步线程（Web API）单独执行这个异步任务（倒计时器），执行完这个任务之后，将任务的回调放到消息队列。
* JavaScript 主线程完成所有的同步任务后，此时调用栈清空状态。
* 接下来，如果倒计时结束，回调函数就会被放入消息队列；否则事件循环继续保持等待状态。
* 事件循环依次从消息队列中取出任务，将它压入调用栈并执行，执行方式相当于开启了新一轮的执行，与上面相同。
* 最后，调用栈和消息队列中都没有需要执行的任务了，整体代码结束。

> * 众所周知，JavaScript 是单线程的，但浏览器不是单线程的，例如上面使用的倒计时器 `setTimeout`，浏览器内部就会有一个单独的线程去负责倒数，等时间到了就将回调放入消息队列。
> * 平时所说的 JavaScript 单线程，是指执行我们代码的是一个线程，而其它一些内部的 API（例如 `setTimeout`）会用单独的线程去执行。所以这里的同步与异步，指的是运行环境提供的 API 是以同步模式还是异步模式的方式去工作。

## 回调函数

所有异步编程方案的根基都是回调函数。

回调函数：由调用者定义，交给执行者执行的函数。回调函数一个很明显的特点是「由我们定义，我们不去调用，但最后执行了」。

```javascript
// callback 就是回调函数
// 就是把函数作为参数传递，缺点是不利于阅读，执行顺序混乱。
function foo(callback) {
  setTimeout(function() {
    callback()
  }, 3000)
}

foo(function() {
  console.log('这就是一个回调函数')
  console.log('调用者定义这个函数，执行者执行这个函数')
  console.log('其实就是调用者告诉执行者异步任务结束后应该做什么')
})
```

除了传递回调函数参数这种方式，还有其他的一些实现异步的方式，例如：事件机制和发布订阅。这些也都是基于回调函数基础之上的变体。

下面介绍几种使用回调方式来完成异步流程的方案。

## ajax（jQuery）

`$.ajax` 是 jQuery 中一个异步请求的方法，它的用法如下代码所示：

```javascript
console.log(1);

$.ajax({
  type: "get",
  url: "https://www.fedbook.cn/apis/articles/list/",
  success: function(res) {
    console.log(res)
  }
});

console.log(2);
```

上述代码是一种传统异步编程的解决方案：通过回调函数实现。但它有一个致命的缺点，就是容易写出**回调地狱**。

假设多个请求存在依赖性，你可能就会写出如下代码：

```javascript
ajax(url, () => {
  // 处理逻辑
  ajax(url1, () => {
    // 处理逻辑
    ajax(url2, () => {
      // 处理逻辑
    })
  })
})
```

## Promise

Promise 是 ES6 中异步编程的一种解决方案，比传统的解决方案（回调函数或事件监听）更合理且更强大。

它有三个状态：

* pending：初始状态
* fulfilled：操作成功
* rejected：操作失败

当 promise 状态发生改变，就会触发 `then()` 里的响应函数处理后续步骤。

状态改变，只有两种可能：

* 从 pending 变为 fulfilled  
* 从 pending 变为 rejected

### 基础用法

下述代码演示了 Promise 基础用法：

```javascript
const promise = new Promise(function(resolve, reject) {
  if (true) {
    resolve('success'); // 异步请求成功，将请求结果 resolve 出去
  } else {
    reject('fail');     // 异步请求失败，将错误信息 reject 出去
  }
});

promise.then(res => {
  console.log(res);   // 成功 resolve('success')
}).catch(error => {
  console.log(error); // 失败 reject('fail')
})
```

从上面的代码可以看出，Promise 本质上也是使用回调函数去定义异步任务结束后所需要执行的任务。这里的回调函数是通过 then 方法传递的，且 Promise 将回调分成了两种，分别是成功后的回调和失败后的回调。

### Promise 使用案例

下面演示一个用 Promise 封装 Ajax 请求的例子：

```javascript
/**
 * Ajax Demo
 * @param {string} get 请求的 url
 * @return {Promise}
 */
function ajax(url) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function() {
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    xhr.send();
  })
};

ajax('/api/users.json').then(function(res) {
  console.log(res);
}, function(error) {
  console.log(error);
});
```

上面代码中，ajax 是对 XMLHttpRequest 对象的封装，用于发出一个针对 JSON 数据的 HTTP GET 请求，并且返回一个 Promise 对象。需要注意的是，在 ajax 内部，resolve 函数和 reject 函数调用时，都带有参数。

### Promise 链式调用

* Promise 对象的 then 方法会返回一个全新的 Promise 对象。
* 后面的 then 方法就是在为上一个 then 返回的 Promise 注册回调。
* 前面 then 方法中回调函数的返回值会作为后面 then 方法回调的参数，如果没有返回值，默认返回 undefined。
* 如果回调中返回的是 Promise，那后面 then 方法的回调会等待它的结束（也就是后面这个 then 方法在为我们返回的 Promise 注册回调）。

```javascript
ajax('/api/users.json')
  .then(function(value) {
    console.log(1)
    return ajax('/api/urls.json')
  })
  .then(function(value) {
    console.log(2)
    console.log(value)
  })
  .then(function(value) {
    console.log(3)
  })
  .then(function(value) {
    console.log(4)
    return 'hello'
  })
  .then(function(value) {
    console.log(5)
    console.log(value)
  })

// 输出结果
1
2
[{name: '前端修炼小册', url: "www.fedbook.cn"}, {name: '百度', url: "www.baidu.com"}]
3
4
5
"hello"
```

### Promise 异常处理

#### 1）应该总是使用 catch 方法来捕获 Promise 异常。

我们知道，有两种方法可以捕获 Promise 对象抛出的异常：

* `then()` 方法的第二个参数指定 `rejected` 状态的回调函数
* `catch` 方法指定发生错误时的回调函数

一般来说，应该总是使用 catch 方法来捕获 Promise 异常。

```javascript
// bad
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });

// good
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
```

原因是 catch 方法可以捕获前面 then 方法执行中的错误，也更接近同步的写法（try/catch），而通过 then 方法的第二个参数只能捕获当前 Promsie 对象的异常（每个 then 方法返回的都是一个全新的 Promise 对象）。

这个特性在链式调用的异常捕获中尤为重要：

```javascript
ajax('/api/users.json')
  .then(function(value) {
    console.log(1)
  })
  .then(function(value) {
    console.log(2)
  })
  .then(function(value) {
    console.log(3)
  })
  .catch(function(error) {
    console.log('error:', error)
  })
```

原因是 Promise 对象的错误具有「冒泡」性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个 catch 语句捕获。

但这种写法也有个问题，就是链路中间但凡有一个方法中 catch 了，那么这个链路下面的 catch 都不会捕捉到。

所以 catch 要控制好，必要的话可以在链路中间单独 catch（一个 Promise 异常会被就近的 catch 捕捉）。

```javascript
ajax('/api/users.json')
  .then(function(value) {
    console.log(1)
  })
  .catch(function(error) {
    // 捕获第一个 Promise 对象抛出的错误
    console.log('error:', error)
  })
  .then(function(value) {
    console.log(2)
  })
  .then(function(value) {
    console.log(3)
  })
  .catch(function(error) {
    // 最后的 catch 捕获其它 Promise 对象抛出的错误
    console.log('error:', error)
  })
```

### Promise.all

`Promise.all` 可以将多个 Promise 实例（假定为 `p1`、`p2`、`p3`）包装成一个新的 Promise 实例（假定为 `p`）。

成功和失败分成两种情况。

* 全部成功：`p` 的状态变为成功，此时 `p1`、`p2`、`p3` 的返回值组成一个数组（数组中元素顺序就是就是 `p1`、`p2`、`p3` 传入时的顺序），传递给 `p` 的回调函数。
* 只要有一个失败：`p` 的状态就变为失败，此时第一个被 `reject` 的实例的返回值，会传递给 `p` 的回调函数。

下述代码演示了 `Promise.all` 的用法：

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('success 1');
});
const p2 = new Promise((resolve, reject) => {
  resolve('success 2');
});
const p3 = new Promise((resolve, reject) => {
  reject('fail');
});

const p = Promise.all([p1, p2]).then(result => {
  console.log(result);
}).catch(error => {
  console.log(error);
});
// ['success 1'. 'success 2']

Promise.all([p1, p2, p3]).then(result => {
  console.log(result);
}).catch(error => {
  console.log(error);
})
// 'fail'
```

### Promise.race

顾名思义，`Promise.race` 就是赛跑的意思，意思就是说，`Promise.race([p1, p2, p3])` 里面**哪个结果获得的快**，就返回那个结果，不管结果本身时成功状态还是失败状态。

下述代码演示了 `Promise.race` 的用法：

```javascript
let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 1000)
});
let p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('fail');
  }, 500)
});

Promise.race([p1, p2]).then(result => {
  console.log(result);
}).catch(error => {
  console.log(error);
});
// 'fail'
```

## async/await

async/await 是 ES7 的新标准，也是用来处理异步的，是目前异步的终极解决方案。它其实是 Generator 函数的改进，背后原理就是 Promise。

**async 意义**：  
1. 在函数前加上 async，函数的任何返回值都会被包装成 Promise  
2. 函数内部引入了 await，如果不用 async 会报错

**await 意义**：  
1. 求值关键字，计算返回的 Promise 中的值，或者表达式（`await 100*100`）  
2. 阻塞当前线程

### 基础用法

下述代码演示了 async/await 基础用法：

这段代码主要体现了：await 会阻塞后面的代码，等主程序执行完，再回来执行。

此外，await 后面既可以是一个 async 函数（返回 Promise 对象），也可以是一个正常函数。

```javascript
async function f1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {resolve('world')}, 2000);
  });
}

async function f2() {
  var result = await f1();
  // 阻塞
  console.log('hello');
  console.log(result);
}

f2();
// 等待两秒后，才依次打印出 'hello'，'world'
```

### 错误处理

async/await 中的错误处理需要通过 try/catch 来实现，否则一旦 `reject`，会直接抛出错误（`Uncaught (in promise) xxx`），后面的代码就都不会执行了。

async/await 结合 try/catch 的代码如下所示：

```javascript
async function f1() {
  return Promise.reject('fail');
  // 与下面代码等价
  // return new Promise((resolve, reject) => {reject('fail')})
}

async function f2() {
  try {
    let result = await f1();
  } catch (e) {
    console.log(e);
  }
}

f2();
// 'fail'
```

## 总结

本文简单介绍了 Promise 与 async/await 的用法，如果需要了解更多，可以阅读阮一峰老师编写的《ES6标准入门（第3版）》中 [Promise 对象](https://es6.ruanyifeng.com/#docs/promise "Promise 对象 - ECMAScript 6入门") 和 [async 函数](https://es6.ruanyifeng.com/#docs/async "async 函数 - ECMAScript 6入门") 两个章节。

## 参考资料

* 《ES6标准入门（第3版）》  
* 《[JavaScript Visualized: Event Loop](https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif)》（很赞）

（完）
