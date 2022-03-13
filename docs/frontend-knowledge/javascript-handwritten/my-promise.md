# 实现符合 Promises/A+ 规范的 Promise

## Promises/A+ 规范

在手写实现前，肯定要先阅读 Promises/A+ 规范的原文：[Promises/A+](https://promisesaplus.com/)。

原文是英文版的，但是没有很多专业术语，所以如果有一些 Promise 的使用基础，阅读起来不会很困难。

这里对 Promises/A+ 规范做一个简单的翻译（非 1:1 翻译，开头引言去掉了，中间有些地方没有直译，为了理解起来不绕采用了意译），因为接下来手写实现时要以规范作为目标，并且变量名也要和规范中用到的保持一致。详细的规范还是建议看一下原文。

### 1. 术语

1.1. "promise" 是一个对象或者函数，并且拥有符合本规范的 `then` 方法。  
1.2. "thenable" 是定义 `then` 方法的对象或者函数。  
1.3. "value" 是任意合法的 JavaScript 值（包括 `undefined`，thenable，promise）。  
1.4 "exception" 是使用 `throw` 语句抛出的值。  
1.5 "reason" 表示一个 promise 被拒绝的原因。

### 2. 要求

#### 2.1. Promise 状态（states）

> 译者注：下面假定 promise 为 Promise 构造函数的实例。

一个 promise 的状态必须为这三种状态之一：等待中（pending），完成了（fulfilled），拒绝了（rejected）

* 2.1.1. 当一个 promise 是 pending 状态时：
  * 2.1.1.1. 可以改变为 fulfilled 状态或者 rejected 状态。
* 2.1.2. 当一个 promise 是 fulfilled 状态时：
  * 2.1.2.1. 不能改变到其他状态。
  * 2.1.2.2. 必须有一个 value，并且不能改变。
* 2.1.3. 当一个 promise 是 rejected 状态：
  * 2.1.3.1. 不能改变到其他状态。
  * 2.1.3.2. 必须有一个 reason，并且不能改变。

这里的不可变只是意味着恒等（即可用 `===` 判断相等），而不是深层次的不可变。（比如 value 或者 reason 是一个对象时，只要求引用地址相等，其属性值可以被更改）

#### 2.2. then 方法

一个 promise 必须提供一个 `then` 方法来接收它当前的完成值（value）或拒绝原因（reason）。

每一个 promise 的 `then` 方法接收两个参数：

```javascript
promise.then(onFulfilled, onRejected)
```

* 2.2.1. `onFulfilled` 和 `onRejected` 都是可选参数：
  * 2.2.1.1. 如果 `onFulfilled` 不是函数，会被忽略。
  * 2.2.1.2. 如果 `onRejected` 不是函数，会被忽略。
* 2.2.2. 如果 `onFulfilled` 是一个函数：
  * 2.2.2.1. 该函数必须在 promise 过渡到 fulfilled 状态后调用，其第一个参数为 promise 的 value。
  * 2.2.2.2. 该函数不能在过渡到 fulfilled 状态之前调用。
  * 2.2.2.3. 该函数只能被调用一次。
* 2.2.3. 如果 `onRejected` 是一个函数：
  * 2.2.3.1. 该函数必须在 promise 过渡到 rejected 状态后调用，其第一个参数为 promise 的 reason。
  * 2.2.3.2. 该函数不能在过渡到 rejected 状态之前调用。
  * 2.2.3.3. 该函数只能被调用一次。
* 2.2.4. `onFulfilled` 和 `onRejected` 只有在执行上下文栈仅包含平台代码时才可以被调用。（平台代码：[注释 3.1](https://promisesaplus.com/#point-67)）
* 2.2.5. `onFulfilled` 和 `onRejected` 只能[以函数的形式被调用](/frontend-knowledge/javascript/function-invocation/#作为函数调用)（严格模式中 `this` 值为 `undefined`，非严格模式中为全局对象，[注释 3.2](https://promisesaplus.com/#point-69)）。
* 2.2.6. `then` 方法可以被一个 promise 多次调用：
  * 2.2.6.1. 当 promise 过渡到 fulfilled 状态时，所有相应的 onFulfilled 回调必须按照 then 的顺序依次执行。
  * 2.2.6.2. 当 promise 过渡到 rejected 状态时，所有相应的 onRejected 回调必须按照 then 的顺序依次执行。
* 2.2.7. `then` 方法必须返回一个 promise。（[注释 3.3](https://promisesaplus.com/#point-71)）
  ```javascript
  promise2 = promise1.then(onFulfilled, onRejected);
  ```
  * 2.2.7.1. 如果 `onFulfilled` 或者 `onRejected` 返回一个值 `x`，就进入 Promise 的解析过程 `[[Resolve]](promise2, x)`。
  * 2.2.7.2. 如果 `onFulfilled` 或者 `onRejected` 抛出一个异常 `e`，则 `promise2` 必须过渡到 rejected 状态，并以 `e` 为 reason 参数。
  * 2.2.7.3. 如果 `onFulfilled` 不是一个函数，并且 `promise1` 已过渡到 fulfilled 状态，那么 `promise2` 必须也过渡到 fulfilled 状态并返回和 `promise1` 相同的 value。
  * 2.2.7.4. 如果 `onRejected` 不是一个函数，并且 `promise1` 已过渡到 rejected 状态，那么 `promise2` 必须也过渡到 rejected 状态并返回和 `promise1` 相同的原因 reason。

#### 2.3. Promise 的解析过程

> 译者注：这段逻辑很复杂，理解起来有点绕，不过可以搭配后面手写时的注释来理解。

Promise 的解析过程是一个抽象的操作，它需要输入一个 promise 和一个 value，可以表示为 `[[Resolve]](promise, x)`。如果 `x` 有 `then` 方法且看上去像一个 Promise 的实例，解析过程中就会让 `promise` 接受这个 `x` 的状态；否则就用 `x` 的值来执行 `promise`。

这种 thenable 的特性使得 promise 的实现更具有通用性：只要它暴露出一个符合 Promises/A+ 规范的 `then` 方法即可。这使得那些符合 Promises/A+ 规范的实现可以与不符合规范但可用的实现能良好的共存。

运行 `[[Resolve]](promise, x)` 时主要执行了以下步骤：

* 2.3.1. 如果 `promise` 和 `x` 指向同一个对象，以 `TypeError` 为 reason 拒绝执行 `promise`。
* 2.3.2. 如果 `x` 是 `promise`，则使 `promise` 接受 `x` 的状态（[注释 3.4](https://promisesaplus.com/#point-73)）：
  * 2.3.2.1. 如果 `x` 处于 pending 状态，`promise` 需保持为等待状态直至 `x` 被执行或拒绝。
  * 2.3.2.2. 如果 `x` 处于 fulfilled 状态，用相同的 value 执行 `promise`。
  * 2.3.2.3. 如果 `x` 处于 rejected 状态，用相同的 reason 执行 `promise`。
* 2.3.3. 如果 `x` 是对象或者函数：
  * 2.3.3.1. 把 `x.then` 赋值给 `then`。（[注释 3.5](https://promisesaplus.com/#point-75)）
  * 2.3.3.2. 如果取 `x.then` 的值时抛出错误 `e` ，拒绝执行这个 `promise` 并以 `e` 作为 reason。
  * 2.3.3.3. 如果 `then` 是函数，将 `x` 作为函数的作用域 `this` 调用 `then`。传递两个回调函数作为参数，第一个参数叫 `resolvePromise`，第二个参数叫 `rejectPromise`：
    * 2.3.3.3.1. 如果 `resolvePromise` 以 `y` 为 value 被调用，执行 `[[Resolve]](promise, y)`。
    * 2.3.3.3.2. 如果 `rejectPromise` 以 `r` 为 reason 被调用， 拒绝 `promise` 并以 `r` 为 reason。
    * 2.3.3.3.3. 如果 `resolvePromise` 和 `rejectPromise` 都被调用，或者被同样的参数调用了多次，则优先采用首次调用，并忽略其他的调用。
    * 2.3.3.3.4. 如果调用 `then` 方法抛出了异常 `e`：
      * 2.3.3.3.4.1. 如果 `resolvePromise` 或者 `rejectPromise` 已经被调用，忽略异常。
      * 2.3.3.3.4.2. 如果没有被调用，拒绝执行 `promise` 并以 `e` 为 reason。
  * 2.3.3.4. 如果 `then` 不是一个函数，成功执行 `promise` 并以 `x` 为 value。
* 2.3.4. 如果 `x` 不是一个对象或者函数，成功执行 `promise` 并以 `x` 为 value。

如果一个 promise 是用一个循环 thenable 链中的 thenable 来解析的，那么 `[[Resolve]](promise，thenable)` 的递归性质最终会导致 `[[Resolve]](promise，thenable)` 被再次调用，根据上述的算法将会陷入无限递归之中。我们鼓励大家去实现但不是必须去实现这样的一个算法：去检测这样的递归，如果检测到，则以一个可识别的 `TypeError` 为 reason 来拒绝执行 `promise`。[注释 3.6](https://promisesaplus.com/#point-77))

### 3. 注释

3.1. 这里的「平台代码」指的是引擎、环境和 promise 实现代码。在实践中，该要求确保在调用 then 方法被调用的那一轮的事件循环之后，使用新堆栈异步执行 `onFulfilled` 和 `onRejected`。这可以通过「宏任务」机制（如 `setTimeout` 或 `setImmediate`）或「微任务」机制（如 `MutationObserver` 或 `process.nextTick`）实现。由于 promise 实现被认为是平台代码（注：即都是 JavaScript），因此它本身可能包含一个任务调度队列或调用处理程序的「trampoline」。

3.2. 也就是说在严格模式（strict）中，函数 `this` 的值为 `undefined`；在非严格模式中其为全局对象。

3.3. 代码实现在满足所有要求的情况下，可以允许 `promise2 === promise1`。每个实现都要文档说明其是否允许以及在何种条件下允许 `promise2 === promise1`。

3.4. 总体来说，如果 `x` 符合当前实现，我们才认为它是真正的 promise。本规则允许那些特例实现接受符合已知要求的 promises 状态。

3.5. 这步我们先是存储了一个指向 `x.then` 的引用，然后测试并调用该引用，以避免多次访问 `x.then` 属性。这种预防措施确保了该属性的一致性，因为其值可能在检索调用时被改变。

3.6 实现不应该对 thenable 链的深度设限，并假定超出本限制的递归就是无限循环。只有真正的循环递归才应能导致 `TypeError` 异常；如果一条无限长的链上 thenable 均不相同，那么递归下去永远是正确的行为。

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

## 实现 Promise 的链式调用功能

### 原生 Promise 链式调用的特性

这块比较复杂，对应 Promises/A+ 规范的 [The Promise Resolution Procedure](https://promisesaplus.com/#the-promise-resolution-procedure)。规范理解起来比较拗口，所以先总结下所有原生 Promise 链式调用的特点。

* 通过 return 可以直接将结果结果给下一个 then。

```javascript {6}
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

promise.then(value => {
  return value;
})
.then(value => {
  console.log(value); // 可以直接打印出 "First resolve"
})
```

* 通过新的 promise 去 resolve 结果

```javascript {9-11}
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

promise.then(value => {
  return value;
})
.then(value => {
  return new Promise((resolve, reject) => {
    resolve(value);
  })
})
.then(value => {
  console.log(value); // 可以打印出 "First resolve"
})
```

* 在 then 中只要 new 了新的 promise，哪怕有异步代码，也可以 resolve 结果给下一个 then 的 onFulfilled 回调。

```javascript {10-12}
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

promise.then(value => {
  return value;
})
.then(value => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, 2000)
  })
})
.then(value => {
  console.log(value); // 两秒后可以打印出 "First resolve"
})
```

* 通过新的 promise 去 reject 时, 可以 reject 结果给下一个 then 的 onRejected 回调。

```javascript {11}
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

promise.then(value => {
  return value;
})
.then(value => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Error');
    }, 2000)
  })
})
.then(value => {
  console.log(value);
}, reason => {
  console.log('Rejected: ' + reason); // 两秒后可以打印出 "Rejected: Error"
})
```

* then 走了失败的回调函数后，再走 then。
  * 默认会 `return undefined;` 给下一个 then 的 onFulfilled 回调。
  * 即：即便走了 onRejected 回调，如果下面继续 then，这条链会把失败的**返回结果**直接传给下一个 then 的 onFulfilled 回调中去。

```javascript {20-24}
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

promise.then(value => {
  return value;
})
.then(value => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Error');
    }, 2000)
  })
})
.then(value => {
  console.log(value);
}, reason => {
  console.log('Rejected: ' + reason); // 两秒后可以打印出 "Rejected: Error"
})
.then(value => {
  console.log('失败后, 下一个 then 的 onFulfilled: ' + value); // "失败后, 下一个 then 的 onFulfilled: undefined"
}, reason => {
  console.log('失败后, 下一个 then 的 onRejected: ' + reason);
})
```

* 在 then 中抛出异常时，如果下面还有 then，一定会走到失败的回调函数中去。

```javascript {21}
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

promise.then(value => {
  return value;
})
.then(value => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Error');
    }, 2000)
  })
})
.then(value => {
  console.log(value);
}, reason => {
  console.log('Rejected: ' + reason); // 两秒后可以打印出 "Rejected: Error"
})
.then(value => {
  throw new Error('Throw Error');
})
.then(value => {
  console.log('抛出异常后, 下一个 then 的 onFulfilled: ' + reason);
}, reason => {
  console.log('抛出异常后, 下一个 then 的 onRejected: ' + reason); // "抛出异常后, 下一个 then 的 onRejected: Error: Throw Error"
})
```

* 用 catch 捕获的情况：抛出异常后会找离它最近的失败回调函数。
  * 在 then 中抛出异常时，如果下面还有 then，且指定了失败的回调函数，那么会走这个失败的回调函数。
  * 在 then 中抛出异常时，如果下面还有 then，且没有指定失败的回调函数，那么会走 catch 捕获。

```javascript {26-28}
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

promise.then(value => {
  return value;
})
.then(value => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Error');
    }, 2000)
  })
})
.then(value => {
  console.log(value);
}, reason => {
  console.log('Rejected: ' + reason); // 两秒后可以打印出 "Rejected: Error"
})
.then(value => {
  throw new Error('Throw Error');
})
.then(value => {
  console.log('抛出异常后, 下一个 then 的 onFulfilled: ' + reason);
})
.catch(err => {
  console.log('Catch: ' + err);
})
```

* 如果在 catch 里面 return 一个值，后面继续 then，那么还能继续走成功的回调。
  * 因此 catch 在 Promise 的源码层面上就是一个 then，它也是遵循 then 的运行原则的。
  * 示例比较简单，基于上面的代码再拼接一个 then 就可以了，此处省略。

小节上面的特性：

* 走成功回调（onFulfilled）的条件：
  * 在上一个 then 里 return 一个普通值（value：对应 Promises/A+ 规范的 [1.3](https://promisesaplus.com/#point-8)）
  * 在上一个 then 里 return 一个新的 Promise，并且这个 Promise 里面是成功态的结果（即里面调用了 `resolve(value)` 方法）。
* 走失败回调（onRejected）的条件：
  * 在上一个 then 里 return 一个新的 Promise，并且这个 Promise 里面是失败态的原因（即里面调用了 `reject(reason)` 方法）。
  * 在上一个 then 里抛出了异常（`throw new Error()`）。
  
最后，**Promise 要实现链式调用，是因为每个 then 都需要返回一个新的 Promise 对象**。

::: details 明白了这一点，顺便也就可以区分这样一种情况了。
下面两个写法的 promise2 不一样：

* 第一个 promise2 是第二次 then 返回的新的 Promise 对象
* 第二个 promise2 是第一次 then 返回的新的 Promise 对象

```javascript
// 第一种 promise2
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

let promise2 = promise.then(() => {

}).then(() => {

})
```

```javascript
// 第二种 promise2
let promise = new Promise((resolve, reject) => {
  resolve('First resolve'); // 传递一个普通值
})

let promise2 = promise.then(() => {

})

promise2.then(() => {

})
```
::: 

接下来，在 MyPromise 中逐步实现以上提到的 Promise 链式调用特性。

### 每个 then 中返回新的 Promise 对象

前面提到，Promise 链式调用的原理是：在 then 中返回一个新的 Promise，这个 Promise 本身又提供了 then 方法。

并且当前 then 中的返回值可以传递到下一个 then 中，作为回调函数（onFulfilled 或 onRejected）的参数。

先修改 then 函数的代码如下（根据 Promises/A+ 规范的 [2.2.7](https://promisesaplus.com/#point-40) 所述，在 then 中返回一个 promise2）：

```javascript
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new Promise((resolve, reject) => {
      // 将之前写的代码都放到 promise2 里面
      if (this.status === FULFILLED) {
        onFulfilled(this.value);
      }
      
      if (this.status === REJECTED) {
        onRejected(this.reason);
      }
      
      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          onFulfilled(this.value);
        });
        this.onRejectedCallbacks.push(() => {
          onRejected(this.reason);
        });
      }
    });

    // 返回 promise2
    return promise2;
  }
```

### 新 Promise 对象的成功或失败回调需要返回一个值 x

接下来按照 Promises/A+ 规范的顺序来继续改写代码。规范的 [2.2.7.1](https://promisesaplus.com/#point-41) 规定：成功或失败的回调函数（onFulfilled 或 onRejected）执行完以后，都需要返回一个值 x。

这里先定义好 x，把 onFulfilled 或 onRejected 的返回结果赋值给它，后面要对 x 做处理。

```javascript {7,11,16,19}
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new Promise((resolve, reject) => {
      // 将之前写的代码都放到 promise2 里面
      if (this.status === FULFILLED) {
        let x = onFulfilled(this.value);
      }

      if (this.status === REJECTED) {
        let x = onRejected(this.reason);
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          let x = onFulfilled(this.value);
        });
        this.onRejectedCallbacks.push(() => {
          let x = onRejected(this.reason);
        });
      }
    });

    // 返回 promise2
    return promise2;
  }
```

另外，根据 Promises/A+ 规范 [2.2.7.2](https://promisesaplus.com/#point-42) 所述，如果 then 里面有异常抛出，需要进行捕获，然后 reject 出去，如果有下一个 then 就可以直接走失败的回调了。

代码增加 try...catch 机型捕获即可：

```javascript {7-11,15-19,24-28,31-35}
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new Promise((resolve, reject) => {
      // 将之前写的代码都放到 promise2 里面
      if (this.status === FULFILLED) {
        try {
          let x = onFulfilled(this.value);
        } catch (e) {
          reject(e);
        }
      }

      if (this.status === REJECTED) {
        try {
          let x = onRejected(this.reason);
        } catch (e) {
          reject(e);
        }
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
          } catch (e) {
            reject(e);
          }
        });
      }
    });

    // 返回 promise2
    return promise2;
  }
```

现在开始处理 x。考虑到 x 有可能是普通值，也可能是一个 Promise 对象，就需要一个专门处理 x 的函数（根据规范，这个函数就命名为 resolvePromise）：

* 如果是普通值，通过 `Promise.resolve()` 方法将它转换成 Promise 对象后再 return 出去。
* 如果是 Promise 对象，可以直接 return 出去。

```javascript
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new Promise((resolve, reject) => {
      // 将之前写的代码都放到 promise2 里面
      if (this.status === FULFILLED) {
        try {
          let x = onFulfilled(this.value);
        } catch (e) {
          reject(e);
        }
      }

      if (this.status === REJECTED) {
        try {
          let x = onRejected(this.reason);
        } catch (e) {
          reject(e);
        }
      }

      // 对 pending 状态的处理(异步时会进来)
      if (this.status === PENDING) {
        // 订阅过程
        // 为什么 push 的内容是 ()=>{onFulfilled(this.value);}
        // 而不是 onFulfilled 呢
        // 因为这样在后面发布时, 只需要遍历数组并直接执行每个元素就可以了
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
          } catch (e) {
            reject(e);
          }
        });
        // 同上
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
          } catch (e) {
            reject(e);
          }
        });
      }
    });

    // 返回 promise2
    return promise2;
  }
```


