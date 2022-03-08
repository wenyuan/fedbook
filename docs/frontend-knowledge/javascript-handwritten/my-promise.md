# 实现符合 Promises/A+ 规范的 Promise

## Promises/A+ 规范

在手写实现前，肯定要先阅读 Promises/A+ 规范的原文：[Promises/A+](https://promisesaplus.com/)。

原文是英文版的，但是没有很多专业术语，所以如果有一些 Promise 的使用基础，阅读起来不会很困难。

这里对 Promises/A+ 规范做一个简单的翻译（非 1:1 翻译），因为接下来手写实现时要以规范作为目标，并且变量名也要和规范中用到的保持一致。详细的规范还是建议看一下原文。

### 1. 术语

1.1. "promise" 是一个对象或者函数，并且拥有符合本规范的 `then` 方法。
1.2. "thenable" 是定义 `then` 方法的对象或者函数。
1.3. "value" 是任意合法的 JavaScript 值（包括 `undefined`，thenable，promise）。
1.4 "exception" 是使用 `throw` 语句抛出的值。
1.5 "reason" 表示一个 promise 被拒绝的原因。

### Promise 实例状态

> 下面假定 promise 为 Promise 构造函数的实例。

Promise 实例有三种状态：等待中（pending），完成了（fulfilled），拒绝了（rejected）

* 当一个 promise 是 pending 状态时
  * 可以改变到 fulfilled 状态或者 rejected 状态
* 当一个 promise 是 fulfilled 状态时
  * 不能改变到其他状态
  * 必须有一个 value，并且不能改变
* 当一个 promise 是 rejected 状态
  * 不能改变到其他状态
  * 必须有一个 reason，并且不能改变

状态转变是这样的（一旦从等待状态变成为其他状态就永远不能更改状态了）：

* pending -> resolve(value) 变成 fulfilled
* pending -> reject(reason) 变成 rejected

### then 方法

一个 promise 必须提供一个 `then` 方法来接收它当前的完成值（value）或拒绝原因（reason）。

`then` 方法接收两个参数：

```javascript
promise.then(onFulfilled, onRejected)
```

#### 1）参数的要求

这两个参数都必须是函数，如果是其他类型，就会被忽略。

* 如果 `onFulfilled` 是一个函数
  * 必须在 promise 过渡到 fulfilled 状态后调用，其第一个参数为 promise 的 value
  * 不能在过渡到 fulfilled 状态之前调用
  * 最多只能被调用一次
* 如果 `onRejected` 是一个函数
  * 必须在 promise 过渡到 rejected 状态后调用，其第一个参数为 promise 的 reason
  * 不能在过渡到 rejected 状态之前调用
  * 最多只能被调用一次

* 参数调用时机：`onFulfilled` 和 `onRejected` 只有在执行上下文栈仅包含平台代码时才可以被调用。这个平台代码指引擎、环境以及 promise 的实现代码。
* 参数调用形式：`onFulfilled` 和 `onRejected` 只能[以函数的形式被调用](/frontend-knowledge/javascript/function-invocation/#作为函数调用)（严格模式中 `this` 值为 `undefined`，非严格模式中为全局对象）。

#### 2）then 方法的要求

`then` 方法可以被一个 promise 多次调用：

* 当 promise 过渡到 fulfilled 状态时，所有的 onFulfilled 必须按照它们各自归属的 then 方法的顺序来依次执行
* 当 promise 过渡到 rejected 状态时，所有的 onRejected 必须按照它们各自归属的 then 方法的顺序来依次执行

`then` 方法必须返回一个 promise：

```javascript
promise2 = promise1.then(onFulfilled, onRejected);
```

* 如果 `onFulfilled` 或者 `onRejected` 返回一个值 `x`，就进入 Promise 的解析过程 `[[Resolve]](promise2, x)`。
* 如果 `onFulfilled` 或者 `onRejected` 抛出一个异常 `e`，则 promise2 必须过渡到 rejected 状态，并以 `e` 为 reason 参数。
* 如果 `onFulfilled` 不是一个函数，并且 promise1 已过渡到 fulfilled 状态，那么 promise2 必须也过渡到 fulfilled 状态并返回和 promise1 相同的 value。
* 如果 `onRejected` 不是一个函数，并且 peomise1 已过渡到 rejected 状态，那么 promise2 必须也过渡到 rejected 状态并返回和 promise1 相同的原因 reason。

### Promise 的解析过程

> 对应原文的 **The Promise Resolution Procedure** 那段，看起来有点绕，不过可以搭配后面手写时的注释来理解。

Promise 的解析过程是一个抽象的操作，它需要输入一个 promise 和一个 value，可以表示为 `[[Resolve]](promise, x)`。如果 `x` 有 `then` 方法且看上去像一个 Promise 实例 ，解析过程中就会让 `promise` 接受这个 `x` 的状态；否则就用 `x` 的值来执行 `promise` 。

这种 thenable 的特性使得 promise 的实现更具有通用性：只要它暴露出一个符合 Promises/A+ 规范的 `then` 方法即可。这使得那些符合 Promises/A+ 规范的实现可以与不符合规范但可用的实现能良好的共存。

运行 `[[Resolve]](promise, x)` 时主要执行了以下步骤：

* 如果 `promise` 和 `x` 指向同一个对象，以 `TypeError` 为 reason 拒绝执行 `promise`。
* 如果 `x` 是 `promise`，则使 `promise` 接受 `x` 的状态：
  * 如果 `x` 处于 pending 状态，`promise` 需保持为等待状态直至 `x` 被执行或拒绝。
  * 如果 `x` 处于 fulfilled 状态，用相同的 value 执行 `promise`。
  * 如果 `x` 处于 rejected 状态，用相同的 reason 执行 `promise`。
* 如果 `x` 是对象或者函数：
  * 把 `x.then` 赋值给 `then`。
  * 如果取 `x.then` 的值时抛出错误 `e` ，拒绝执行这个 `promise` 并以 `e` 作为 reason
  * 如果 `then` 是函数，将 `x` 作为函数的作用域 `this` 调用 `then`。传递两个回调函数作为参数，第一个参数叫 `resolvePromise`，第二个参数叫 `rejectPromise`：
    * 如果 `resolvePromise` 以 `y` 为 value 被调用，执行 `[[Resolve]](promise, y)`。
    * 如果 `rejectPromise` 以 `r` 为 reason 被调用， 拒绝 `promise` 并以 `r` 为 reason。
    * 如果 `resolvePromise` 和 `rejectPromise` 都被调用，或者被同样的参数调用了多次，则优先采用首次调用，并忽略其他的调用。
    * 如果调用 `then` 方法抛出了异常 `e`：
      * 如果 `resolvePromise` 或者 `rejectPromise` 已经被调用，忽略异常。
      * 如果没有被调用，拒绝执行 `promise` 并以 `e` 为 reason。
  * 如果 `then` 不是一个函数，成功执行 `promise` 并以 `x` 为 value。
* 如果 `x` 不是一个对象或者函数，成功执行 `promise` 并以 `x` 为 value。

如果一个 promise 是用一个循环 thenable 链中的 thenable 来解析的，那么 `[[Resolve]](promise，thenable)` 的递归性质最终会导致 `[[Resolve]](promise，thenable)` 被再次调用，根据上述的算法将会陷入无限递归之中。我们鼓励大家去实现但不是必须去实现这样的一个算法：去检测这样的递归，如果检测到，则以一个可识别的 `TypeError` 为 reason 来拒绝执行 `promise`。

## 完成一个基本的 Promise

### 定义一个 MyPromise

首先我们看一下原生 Promise 的基础用法：

```javascript
let promise = new Promise((resolve, reject) => {
  resolve('success');
})

promise.then((value) => {
  console.log('Resolved:' + value);
}, (reason) => {
  console.log('Rejected:' + reason);
})
```

Promise 是个构造函数（ES5），在使用前需要实例化。实例化的时候传入了一个参数：

```javascript
let promise = new Promise(() => {})
```

并且这个参数是一个函数，它相当于一个执行器，当 `new Promise()` 的时候就会自动执行。

基于这样的要求，我们先将自己写的 Promise 命名为 MyPromise，它是一个类（或者 ES5 的构造函数），在类的构造函数 constructor 里面添加一个参数，这里就用 executor 来做形参，且执行一下这个参数（记住了它是一个函数类型）。用 ES6 的方式来写如下：

```javascript
class MyPromise {
  constructor (executor) {
    executor(resolve, reject);
  }
}

// 我是在 Node 环境下测试的
// 所以遵循 CommonJS 的规范进行模块导出
module.exports = MyPromise;
```

### 初始化状态

因为我们需要根据状态进行下一步的操作，所以先要声明三种状态：pending、fulfilled、rejected：

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
```

然后设置初始化状态：

* 初始状态为 pending
* resolve 和 reject 都是函数，它们都有参数，分别是 value 和 reason，也需要初始化

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor (executor) {
    // 初始状态为 pending
    this.status = PENDING;
    // resolve 的参数
    this.value = undefined;
    // reject 的参数
    this.reason = undefined;
    
    executor(resolve, reject);
  }
}

module.exports = MyPromise;
```

### 编写 resolve 和 reject 方法

现在开始编写 resolve 和 reject 方法。

这里有一个注意点，在哪里定义这两个函数：

* 方案一：定义在 constructor 外面，用类方法的形式来创建这两个函数。本质上是定义到了 Promise 的 prototype 上面，每一个 Promise 的实例会继承同一个 resolve 和 reject。  
  这种方案需注意，在 constructor 中调用 resolve 和 reject 时，要使用 bind 来绑定 this，从而解决 this 指向问题。
  ```javascript {9}
  class MyPromise {
    constructor(executor) {
      this.status = PENDING;
      this.value = undefined;
      this.reason = undefined;

      // 对于 resolve 来说, 这里就是将实例的 resolve 方法内的 this 指向当前实例对象
      // 对于 reject 来说, 这里就是将实例的 reject 方法内的 this 指向当前实例对象
      execute(this.resolve.bind(this), this.reject.bind(this));
    }
    resolve(value) {}
    reject(reason) {}
  }
  ```

* 方案二：定义在 constructor 里面，每一次实例化的时候，都会在构造函数里重新声明 resolve 和 reject 函数。
  ```javascript
  class MyPromise {
    constructor(executor) {
      this.status = PENDING;
      this.value = undefined;
      this.reason = undefined;

      const resolve = (value) => {}  
      const reject  = (reason) => {}  
  
      executor(resolve, reject);
    }
  }
  ```

两种方案都可以继续往下做，这里我们选择第二种定义方式。下面是定义 resolve 和 reject 方法后的完整代码：

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor (executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    // 每次实例化时重新声明 resolve
    const resolve = (value) => {
      // 只有 pending 状态才能变成 fulfilled
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
      }
    }
    
    // 每次实例化时重新声明 reject
    const reject = (reason) => {
      // 只有 pending 状态才能变成 rejected
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }
    }

    executor(resolve, reject);
  }
}

module.exports = MyPromise;
```

### 编写 then 方法

then 作为 Promise 的一个方法，直接写在 MyPromise 里面就行了。

它包含了两个参数：

* onFulfilled（成功的回调）：当状态变成 fulfilled 时执行的代码
* onRejected（失败的回调）：当状态变成 rejected 时执行的代码

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor (executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
      }
    }
    
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }
    }

    executor(resolve, reject);
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }
    
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }
  }

}

module.exports = MyPromise;
```

测试代码：

```javascript
const MyPromise = require('./MyPromise');

let promise = new MyPromise((resolve, reject) => {
  resolve('success');
})

promise.then((value) => {
  console.log('Resolved:', value);
}, (reason) => {
  console.log('Rejected:', reason);
});
```

### 捕获错误

如果只是上面的代码，会发现无法捕获到 `throw` 出来的错误：

```javascript {4}
const MyPromise = require('./MyPromise');

let promise = new MyPromise((resolve, reject) => {
  throw new Error('Exception: Error');
})

promise.then((value) => {
  console.log('Resolved:', value);
}, (reason) => {
  console.log('Rejected:', reason);
});
``` 

这个错误是在执行器（`executor`）执行以后抛出来的，那么只要用 `try... catch` 捕获它就可以了：

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor (executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
      }
    }
    
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }
    }

    // 捕获 executor 里面抛出的异常
    try {
      executor(resolve, reject);
    } catch(e) {
      reject(e);
    }
    
  }

  then (onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }
    
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }
  }

}

module.exports = MyPromise;
```

至此，一个最基本的 Promise 就写好了。但还有很多问题需要解决，比如多个 promise.then 的处理，所以还得继续往下。

## 处理 Promise 中的异步与多次调用的问题

如果在原本的代码里，加入异步的逻辑（比如 setTimeout），执行代码会发现什么也没有打印出来：

```javascript
const MyPromise = require('./MyPromise');

let promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 2000);
})

// 解决异步问题的时候, 顺便把多次调用 then 的问题也一起解决了
// 所以此处调用两个 promise.then
promise.then((value) => {
  console.log('Resolved 1:', value);
}, (reason) => {
  console.log('Rejected 1:', reason);
});

promise.then((value) => {
  console.log('Resolved 2:', value);
}, (reason) => {
  console.log('Rejected 2:', reason);
});
``` 

因为 setTimeout 是一段异步代码，在 `new MyPromise()` 执行完以后，状态没有马上改变（依旧是 pending），所以在 `promise.then` 里面 onFulfilled 和 onRejected 两个地方都不会执行。

为了跟原生 Promise 一样支持异步逻辑，我们在前面编写的 then 函数里，除了处理 fulfilled 和 rejected 两种状态，现在还需要加入 pending 状态的处理。

同时，在有多个 `promise.then` 的情况下，原生 Promise 会依次去执行 onFulfilled 或依次去执行 onRejected（这条规则对应 Promises/A+ 规范的 [2.2.6](https://promisesaplus.com/#point-36)）。因为状态的变化是不可逆的，一旦从 pending 变成 fulfilled（或 rejected），就会调用 `resolve()`（或 `reject()`），接下里只会依次执行每个 then 里面的成功回调（或失败回调），而不会成功回调与失败回调穿插执行。

为了实现这样的功能，我们需要用到发布订阅的设计模式，把 `promise.then` 里面的成功回调（或失败回调）都收集起来放到数组中，等到 `resolve()`（或 `reject()`） 执行的时候，再依次去执行数组里放的成功回调（或失败回调）。

```javascript
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor (executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    // 收集所有成功的回调函数, 即 resolve(value) 后触发的 onFulfilled
    this.onFulfilledCallbacks = [];
    // 收集所有失败的回调函数
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
      }

      // 发布
      // 处理异步里的 resolve()
      this.onFulfilledCallbacks.forEach(fn => fn());
    }
    
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }

      // 发布
      // 处理异步里的 reject()
      this.onRejectedCallbacks.forEach(fn => fn());
    }

    try {
      executor(resolve, reject);
    } catch(e) {
      reject(e);
    }
    
  }

  then (onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }
    
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }

    // 对 pending 状态的处理(异步时会进来)
    if (this.status === PENDING) {
      // 订阅过程
      // 为什么 push 的内容是 ()=>{onFulfilled(this.value);}
      // 而不是 onFulfilled 呢
      // 因为这样在后面发布时, 只需要遍历数组并直接执行每个元素就可以了
      this.onFulfilledCallbacks.push(() => {
        onFulfilled(this.value);
      });
      // 同上
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }

}

module.exports = MyPromise;
```
