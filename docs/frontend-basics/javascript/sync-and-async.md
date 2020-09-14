# 同步与异步

> 在 ES5 中，异步编程的传统解决方案是通过回调函数或事件监听。  
> 在 ES6 中，Promise 成为了异步编程的一种更合理更强大的解决方案。  
> 在 ES7 中，async/await 优化了 ES6 异步编程的解决方案，比 Promise 更加优美。

## 1. 同步与异步概念

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

## 2. ajax（jQuery）

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

## 3. Promise

Promise 是 ES6 中异步编程的一种解决方案，比传统的解决方案（回调函数或事件监听）更合理且更强大。

它有三个状态：

* pending：初始状态
* fulfilled：操作成功
* rejected：操作失败

当 promise 状态发生改变，就会触发 `then()` 里的响应函数处理后续步骤。

状态改变，只有两种可能：

* 从 pending 变为 fulfilled  
* 从 pending 变为 rejected

### 3.1 基础用法

下述代码演示了 Promise 基础用法：

```javascript
var promise = new Promise(function(resolve, reject) {
  if (true) {
    resolve('success'); // 异步请求成功，将请求结果 resolve 出去
  } else {
    reject('fail'); // 异步请求失败，将错误信息 reject 出去
  }
});

promise.then(res => {
  console.log(res); // 成功 resolve('success')
}).catch(error => {
  console.log(error); // 失败 reject('fail')
})
```

### 3.2 Promise.all

`Promise.all` 可以将多个 Promise 实例包装成一个新的 Promise 实例。同时，成功和失败的返回值是不同的。

**成功**的时候返回的是**一个结果数组**，数组中值的顺序与传入 promise 的顺序相同；而**失败**的时候则返回**最先被reject失败状态的值**。

下述代码演示了 `Promise.all` 的用法：

```javascript
let p1 = new Promise((resolve, reject) => {
  resolve('success 1');
});
let p2 = new Promise((resolve, reject) => {
  resolve('success 2');
});
let p3 = new Promise((resolve, reject) => {
  reject('fail');
});

Promise.all([p1, p2]).then(result => {
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

### 3.3 Promise.race

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

## 4. async/await

async/await 是 ES7 的新标准，也是用来处理异步的，是目前异步的终极解决方案。它其实是 Generator 函数的改进，背后原理就是 Promise。

**async 意义**：  
1. 在函数前加上 async，函数的任何返回值都会被包装成 Promise  
2. 函数内部引入了 await，如果不用 async 会报错

**await 意义**：  
1. 求值关键字，计算返回的 Promise 中的值，或者表达式（`await 100*100`）  
2. 阻塞当前线程

### 4.1 基础用法

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

### 4.2 错误处理

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

## 5. 总结

本文简单介绍了 Promise 与 async/await 的用法，如果需要了解更多，可以阅读阮一峰老师编写的《ES6标准入门（第3版）》中 [Promise 对象](https://es6.ruanyifeng.com/#docs/promise "Promise 对象 - ECMAScript 6入门") 和 [async 函数](https://es6.ruanyifeng.com/#docs/async "async 函数 - ECMAScript 6入门") 两个章节。

## 参考资料

* 《ES6标准入门（第3版）》  
