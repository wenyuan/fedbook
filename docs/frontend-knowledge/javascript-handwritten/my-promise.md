# 实现符合 Promises/A+ 规范的 Promise

## Promises/A+ 规范

在手写实现前，肯定要先阅读 Promises/A+ 规范的原文：[Promises/A+](https://promisesaplus.com/)。

原文是英文版的，但是没有很多专业术语，所以如果有一些 Promise 的使用基础，阅读起来不会很困难。

这里对 Promises/A+ 规范做一个简单的翻译（非 1:1 翻译，开头引言去掉了，中间有些地方没有直译，为了理解起来不绕采用了意译），因为接下来手写实现时要以规范作为目标，并且变量名也要和规范中用到的保持一致。详细的规范还是建议看一下原文。

### 1. 术语

1.1. "promise" 是一个对象或者函数，并且拥有符合本规范的 `then` 方法。  
1.2. "thenable" 是定义 `then` 方法的对象或者函数。  
1.3. "value" 是任意合法的 JavaScript 值（包括 `undefined`，thenable，promise）。  
1.4. "exception" 是使用 `throw` 语句抛出的值。  
1.5. "reason" 表示一个 promise 被拒绝的原因。

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
  * 2.2.7.1. 如果 `onFulfilled` 或者 `onRejected` 返回一个值 `x`，就进入 Promise 的解决过程 `[[Resolve]](promise2, x)`。
  * 2.2.7.2. 如果 `onFulfilled` 或者 `onRejected` 抛出一个异常 `e`，则 `promise2` 必须过渡到 rejected 状态，并以 `e` 为 reason 参数。
  * 2.2.7.3. 如果 `onFulfilled` 不是一个函数，并且 `promise1` 已过渡到 fulfilled 状态，那么 `promise2` 必须也过渡到 fulfilled 状态并返回和 `promise1` 相同的 value。
  * 2.2.7.4. 如果 `onRejected` 不是一个函数，并且 `promise1` 已过渡到 rejected 状态，那么 `promise2` 必须也过渡到 rejected 状态并返回和 `promise1` 相同的原因 reason。

#### 2.3. Promise 的解决过程

> 译者注：
> * Resolution Procedure：这个词不知道怎么翻译比较贴切，就直译为「解决过程」了。
> * 这段逻辑很复杂，理解起来有点绕，不过可以搭配后面手写时的注释来理解。

Promise 的解决过程是一个抽象的操作，它需要输入一个 promise 和一个 value，可以表示为 `[[Resolve]](promise, x)`。如果 `x` 有 `then` 方法且看上去像一个 Promise 的实例，解决过程中就会让 `promise` 接受这个 `x` 的状态；否则就用 `x` 的值来执行 `promise`。

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

3.6. 实现不应该对 thenable 链的深度设限，并假定超出本限制的递归就是无限循环。只有真正的循环递归才应能导致 `TypeError` 异常；如果一条无限长的链上 thenable 均不相同，那么递归下去永远是正确的行为。

## 完成一个基本的 Promise

### 定义一个 MyPromise

首先看一下原生 Promise 的基础用法：

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

```javascript {7-12}
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
  ```javascript {9,11-12}
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
  ```javascript {7-8,10}
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

```javascript {11-29}
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

```javascript {28-37}
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

这个错误是在执行器（`executor`）执行以后抛出来的，那么只要用 `try...catch` 捕获它就可以了：

```javascript {25-30}
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

至此，一个最基本的 Promise 就写好了。但还有很多问题需要解决，比如多个 `promise.then` 的处理，所以还得继续往下。

## 处理 Promise 中的异步与多次调用的问题

如果在原本的代码里，加入异步的逻辑（比如 setTimeout），执行代码会发现什么也没有打印出来：

```javascript {4-6}
const MyPromise = require('./MyPromise');

let promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 2000);
})

promise.then((value) => {
  console.log('Resolved:', value);
}, (reason) => {
  console.log('Rejected:', reason);
});
``` 

因为 setTimeout 是一段异步代码，在 `new MyPromise()` 执行完以后，状态没有马上改变（依旧是 pending），所以在 `promise.then` 里面 onFulfilled 和 onRejected 两个地方都不会执行。

为了跟原生 Promise 一样支持异步逻辑，我们在前面编写的 then 函数里，除了处理 fulfilled 和 rejected 两种状态，现在还需要加入 pending 状态的处理。

多次调用的意思就是多次调用 then 方法，就像这样：

```javascript
const MyPromise = require('./MyPromise');

let promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 2000);
})

// 此处调用两次 promise.then
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

我们这里在解决异步问题的时候，可以顺便把多次调用 then 这个功能也一起实现了。

根据 Promises/A+ 规范的 [2.2.6](https://promisesaplus.com/#point-36) 所述：在有多个 `promise.then` 的情况下，原生 Promise 会依次去执行 onFulfilled 或依次去执行 onRejected。换个说法：因为状态的变化是不可逆的，一旦从 pending 变成 fulfilled（或 rejected），就会调用 `resolve()`（或 `reject()`），接下里只会依次执行每个 then 里面的成功回调（或失败回调），而不会成功回调与失败回调穿插执行。

为了实现这样的功能，我们需要用到发布订阅的设计模式，把 `promise.then` 里面的成功回调（或失败回调）都收集起来放到数组中，等到 `resolve()`（或 `reject()`） 执行的时候，再依次去执行数组里放的成功回调（或失败回调）。

```javascript {11-14,20-22,30-32,53-66}
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
        // 发布
        // 处理异步里的 resolve()
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    }
    
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 发布
        // 处理异步里的 reject()
        this.onRejectedCallbacks.forEach(fn => fn());
      }
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

我们常常用到的 `new Promise().then().then()`，这就是链式调用，用来解决回调地狱。

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

### then 方法返回一个新的 Promise

前面提到，Promise 链式调用的原理是：在 then 中返回一个新的 Promise，这个 Promise 本身又提供了 then 方法。

并且当前 then 中的返回值可以传递到下一个 then 中，作为回调函数（onFulfilled 或 onRejected）的参数。

先修改 then 函数的代码如下（根据 Promises/A+ 规范的 [2.2.7](https://promisesaplus.com/#point-40) 所述，在 then 中返回一个 promise2）：

```javascript
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new MyPromise((resolve, reject) => {
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

### 新 Promise 对象的回调函数返回值 x

接下来按照 Promises/A+ 规范的顺序来继续改写代码。

规范的 [2.2.7.1](https://promisesaplus.com/#point-41) 规定：上面返回的这个新 Promise 对象，它的成功或失败的回调函数（onFulfilled 或 onRejected）执行完以后，都需要返回一个值 x。

这里先定义好 x，把 onFulfilled 或 onRejected 的返回结果赋值给它，后面要对 x 做处理。

```javascript {7,11,16,19}
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new MyPromise((resolve, reject) => {
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

### then 方法内部异常捕获

规范的 [2.2.7.2](https://promisesaplus.com/#point-42) 规定：如果 then 里面有异常抛出，需要进行捕获，然后 reject 出去，如果有下一个 then 就可以直接走失败的回调了。

代码增加 `try...catch` 进行捕获即可：

```javascript {7-11,15-19,24-28,31-35}
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new MyPromise((resolve, reject) => {
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

### x 值的处理

还是回到规范的 [2.2.7.1](https://promisesaplus.com/#point-41)：如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 的解决过程。

规范的 [2.3](https://promisesaplus.com/#the-promise-resolution-procedure) 详细描述了 Promise 解决过程，其中首先要对 x 值进行处理。

考虑到 x 有可能是普通值，也可能是一个 Promise 对象，就需要一个专门处理 x 的函数（根据规范，这个函数就命名为 resolvePromise）：

* 如果是普通值，通过 `Promise.resolve()` 方法将它转换成 Promise 对象后再 return 出去。
* 如果是 Promise 对象，可以直接 return 出去。

```javascript {9,18,28,36}
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new MyPromise((resolve, reject) => {
      // 将之前写的代码都放到 promise2 里面
      if (this.status === FULFILLED) {
        try {
          let x = onFulfilled(this.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }

      if (this.status === REJECTED) {
        try {
          let x = onRejected(this.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
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

resolvePromise() 各参数的意义：

```javascript
/**
 * Promise 解决过程, 即规范所说的 [[Resolve]](promise2, x)
 * 对 resolve()、reject() 中的返回值 x 进行处理
 * @param {promise} promise2: promise1.then 方法返回的新的 promise 对象
 * @param {[type]} x: promise1 中 onFulfilled 或 onRejected 的返回值
 * @param {[type]} resolve: promise2 的 resolve 方法
 * @param {[type]} reject: promise2 的 reject 方法
 */
function resolvePromise(promise2, x, resolve, reject) {}
```

这里的 resolvePromise 函数我们先当作黑盒子，暂时先不去编写它的具体实现。

### 用异步设置事件循环顺序

根据 Promises/A+ 规范 [3.1](https://promisesaplus.com/#point-67) 所述，onFulfilled 和 onRejected 必须是异步的，且以宏任务的方式执行，这里就用规范里给的 setTimeout 来包裹：

为什么要包裹成异步代码呢？有两个原因：

* 如果不包裹，`let promise2 = new Promise((resolve, reject) => {})` 函数体里面的代码以同步的方式执行，其中的 `resolvePromise()` 提前使用到了 `promise2` 这个变量。但此时 new Promise 的过程还没执行完，是拿不到 promise2 的，会报引用错误。
* `resolvePromise();` 函数必须等异步的 `let x = onFulfilled(this.value);` 函数运行完，才能执行。只有把这一大块包裹成异步代码才能实现这一点。

其实本质就是利用事件循环机制，把代码放在事件循环末尾去执行。而 `status === PENDING` 的分支不需要包裹，因为只有 resolve 或 reject 的时候才会进来。

::: tip
下面的代码里，虽然我们把 setTimeout 延时设置为 0，但实际延时 >= 4ms。详情参见：[实际延时比设定值更久的原因：最小延迟时间](https://developer.mozilla.org/zh-CN/docs/Web/API/setTimeout#实际延时比设定值更久的原因：最小延迟时间)
:::

```javascript {7,14,18,25}
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 定义一个 promise2
    let promise2 = new MyPromise((resolve, reject) => {
      // 将之前写的代码都放到 promise2 里面
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
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

### 实现 resolvePromise 方法

接下来实现 resolvePromise 方法，也就是规范的 [2.3. The Promise Resolution Procedure](https://promisesaplus.com/#the-promise-resolution-procedure) 这一部分。

* [2.3.1](https://promisesaplus.com/#point-48)：如果 promise 和 x 指向同一对象，以 TypeError 为拒因拒绝执行 promise。

```javascript
function resolvePromise(promise2, x, resolve, reject) {
  // 2.3.1 如果 promise 和 x 指向同一对象，以 TypeError 为拒因拒绝执行 promise
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'))
  }
}
```

因为如果从 onFulfilled 或 onRejected 中返回的 x 就是 promise2，会导致循环引用报错。

例如下面这种情况，使用原生 Promise 执行这个代码，会报类型错误：

```javascript
const promise = new Promise((resolve, reject) => {
  resolve(100)
})
const p1 = promise.then(value => {
  console.log(value)
  return p1
})
```

* [2.3.3](https://promisesaplus.com/#point-53)：如果 x 为对象或者函数。

```javascript
function resolvePromise(promise2, x, resolve, reject) {
  // 2.3.1 如果 promise 和 x 指向同一对象，以 TypeError 为拒因拒绝执行 promise
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'))
  }

  // 2.3.3 注意 null 也是 object, 需要排除
  if ((typeof x === 'object' && x !== null) || (typeof x === 'function')) {
    // 2.3.3.2 捕获错误异常
    try {
      // 2.3.3.1 如果 x 是 Promise 对象, 它一定有 then 方法
      let then = x.then;
      // 2.3.3.3 这样暂且就可以认定 x 是个 Promise 对象(但不能绝对排除人为给 x 设置了一个 then 方法的情况)
      if (typeof then === 'function') {
        then.call(x, (y) => {
          // 2.3.3.3.1 注意这里是一个新的 promise, 需要递归调用
          // 就是支持处理 resolve(new Promise(()=>{}) 这种在 resolve() 里无限嵌套 new Promise() 的场景
          resolvePromise(promise2, y, resolve, reject);
        }, (r) => {
          // 2.3.3.3.2
          reject(r);
        })
      } else {
        // 2.3.3.4 如果 x 不是个 Promise 对象
        resolve(x);
      }
    } catch (e) {
      // 2.3.3.2
      reject(e);
    }
  } else {
    // 2.3.4
    resolve(x);
  }
}
```

* 细节处理，[2.3.3.3.3](https://promisesaplus.com/#point-59)：如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用。

什么意思呢，就像下面这样，调用了 resolve() 后又调用了 reject()：

```javascript {7,8}
let promise1 = new Promise((resolve, reject) => {
  resolve('promise 1');
});

let promise2 = promise1.then(() => {
  return new Promise((resolve, reject) => {
    resolve();
    reject();
  });
}, (reason) => {
  return reason
});
```

这个时候可以增加一个表示 `called`，记录是否调用过：

```javascript {7-8,19-20,25-26,35-36}
function resolvePromise(promise2, x, resolve, reject) {
  // 2.3.1 如果 promise 和 x 指向同一对象，以 TypeError 为拒因拒绝执行 promise
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'))
  }

  // 2.3.3.3.3 避免多次调用
  let called = false;

  // 2.3.3 注意 null 也是 object, 需要排除
  if ((typeof x === 'object' && x !== null) || (typeof x === 'function')) {
    // 2.3.3.2 捕获错误异常
    try {
      // 2.3.3.1 如果 x 是 Promise 对象, 它一定有 then 方法
      let then = x.then;
      // 2.3.3.3 这样暂且就可以认定 x 是个 Promise 对象(但不能绝对排除人为给 x 设置了一个 then 方法的情况)
      if (typeof then === 'function') {
        then.call(x, (y) => {
          if (called) return;
          called = true;
          // 2.3.3.3.1 注意这里是一个新的 promise, 需要递归调用
          // 就是支持处理 resolve(new Promise(()=>{}) 这种在 resolve() 里无限嵌套 new Promise() 的场景
          resolvePromise(promise2, y, resolve, reject);
        }, (r) => {
          if (called) return;
          called = true;
          // 2.3.3.3.2
          reject(r);
        })
      } else {
        // 2.3.3.4 如果 x 不是个 Promise 对象
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      // 2.3.3.2
      reject(e);
    }
  } else {
    // 2.3.4
    resolve(x);
  }
}
```

### 修补 bug：支持 then 不带参数

前面写的代码有一个 bug，就是当 then 不带参数调用时，会报错：

```javascript
promise2.then().then().then((value) => {
  console.log(value)
}, (reason) => {
  console.log(reason)
})
```

根据规范 [2.2.1](https://promisesaplus.com/#point-23) 所述，onFulfilled 和 onRejected 应该是可选参数。因此要重新修改下 then 方法，增加回调函数的默认值：

```javascript {3-6}
  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // 设置默认值, 如果是函数就赋值给它本身, 如果不是就将成功的回调的参数 value 返给它
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    // 设置默认值, 如果是函数就赋值给它本身, 如果不是就将失败的回调的参数 reason 作为错误原因抛出去
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason};
    // 定义一个 promise2
    let promise2 = new MyPromise((resolve, reject) => {
      // 将之前写的代码都放到 promise2 里面
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
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

### 修补 bug：补充 catch 方法

目前完成的 MyPromise 还有一个小问题，执行以下代码：

```javascript {20-22}
const MyPromise = require('./MyPromise');

let promise1 = new MyPromise((resolve, reject) => {
  resolve('promise 1')
})

let promise2 = promise1.then(() => {
  return new MyPromise((resolve, reject) => {
    resolve('new Promise resolve');
  })
}, (reason) => {
  return reason;
})

promise2.then().then().then((value) => {
  throw Error('Error');
}, (reason) => {
  console.log(reason);
})
.catch((e) => {
  console.log(e);
})
```

会发现报错：`TypeError: promise2.then(...).then(...).then(...).catch is not a function`。

根据报错，就需要在我们的 MyPromise 类里定义一个 catch 方法：

* catch 方法和 then 方法比较相似
* 唯一的区别是 catch 方法的第一个参数是 null

```javascript {11-15}
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor (executor) {}

  // 定义 then 方法
  then (onFulfilled, onRejected) {}

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    return this.then(null, errorCallback);
  }

}
```

## Promises/A+ 测试

如何证明写的这个 MyPromise 就符合 Promises/A+ 规范呢？

跑一下 Promise A+ 测试就好啦。

### 安装官方测试工具

我们使用 Promises/A+ 官方的测试工具 promises-aplus-tests 来对我们的 MyPromise 进行测试。

```bash
# 安装 promises-aplus-tests
npm install promises-aplus-tests -D
```

### 使用 ES6 Module 对外暴露 MyPromise 类

```javascript
class MyPromise {
  // ...
}

function resolvePromise(promise2, x, resolve, reject) { 
  // ...
}

module.exports = MyPromise;
```

### 实现静态方法 deferred

要使用 promises-aplus-tests 这个工具测试，必须实现一个静态方法 `deferred()`，通过查看[官方](https://github.com/promises-aplus/promises-tests)对这个方法的定义可知：

我们要给自己手写的 MyPromise 上实现一个静态方法 `deferred()`，该方法要返回一个包含 `{ promise, resolve, reject }` 的对象：

* promise 是一个处于 pending 状态的 Promsie 对象。
* resolve(value) 用 value「解决」上面那个 promise。
* reject(reason) 用 reason「拒绝」上面那个 promise。

`deferred()` 的实现如下：

```javascript
class MyPromise {
  // ...
}

function resolvePromise(promise2, x, resolve, reject) { 
  // ...
}

MyPromise.deferred = function () {
  let result = {};
  result.promise = new MyPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}

module.exports = MyPromise;
```

### 配置 package.json

我们实现了 deferred 方法，也通过 ES6 Module 对外暴露了 MyPromise，最后配置一下 package.json 就可以跑测试了：

```javascript
// package.json
{
  "devDependencies": {
    "promises-aplus-tests": "^2.1.2"
  },
  "scripts": {
    "test": "promises-aplus-tests MyPromise"
  }
}
```

### 执行测试命令

```bash
npm run test
```

发现结果是：

```bash
866 passing (34s)
  6 failing
```

官方一共有 872 个测试用例，通过了 866 个，有 6 个没通过。

**不要慌**，哪几个没通过它给出了提示：

```bash
1) 2.2.2: If `onFulfilled` is a function, 2.2.2.2: it must not be called before `promise` is fulfilled fulfilled after a delay:

2) 2.2.3: If `onRejected` is a function, 2.2.3.2: it must not be called before `promise` is rejected rejected after a delay:

3) 2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only platform code. Clean-stack execution ordering tests (fulfillment case) when `on
Fulfilled` is added immediately before the promise is fulfilled:

4) 2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only platform code. Clean-stack execution ordering tests (fulfillment case) when the
 promise is fulfilled asynchronously:

5) 2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only platform code. Clean-stack execution ordering tests (rejection case) when `onRe
jected` is added immediately before the promise is rejected:

6) 2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only platform code. Clean-stack execution ordering tests (rejection case) when the p
romise is rejected asynchronously:
```

这个错误提示语很明确了，前面那么多代码写下来，自然而然就能想到跟事件循环有关，对着规范打一下补丁试试看。

### 修补最后一个 bug

```javascript {3,7,13,17}
    const resolve = (value) => {
      if (this.status === PENDING) {
        setTimeout(() => {
          this.status = FULFILLED;
          this.value = value;
          this.onFulfilledCallbacks.forEach(fn => fn());
        }, 0)
      }
    }

    const reject = (reason) => {
      if (this.status === PENDING) {
        setTimeout(() => {
          this.status = REJECTED;
          this.reason = reason;
          this.onRejectedCallbacks.forEach(fn => fn());
        }, 0)
      }
    }
```

为什么 resolve 和 reject 要加 setTimeout？

根据规范的 [2.2.4](https://promisesaplus.com/#point-34) 所述：onFulfilled 和 onRejected 只允许在 execution context 栈仅包含平台代码时运行。

* 这里的平台代码指的是引擎、环境以及 promise 的实施代码。实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。
* 这个事件队列可以采用宏任务（macro-task）机制，比如 setTimeout 或者 setImmediate；也可以采用微任务（micro-task）机制来实现，比如 MutationObserver 或者 process.nextTick。 

### 再次执行测试命令

```bash
npm run test
```

发现结果是：

```bash
872 passing (49s)
```

**Promises/A+ 官方测试总共 872 用例，我们手写的 MyPromise 现在完美通过了所有用例**，棒！撒花！！！

## Promise 其他扩展方法

在 ES6 的官方 Promise 还有很多 API，比如：

* Promise.resolve
* Promise.reject
* Promise.prototype.catch
* Promise.prototype.finally
* Promise.all
* Promise.allSettled
* Promise.any
* Promise.race

虽然这些都不在 Promises/A+ 规范里面，但是我们也来实现一下吧，加深理解。其实我们前面我们用了很大功夫实现了 Promises/A+，现在再来实现这些已经是小菜一碟了，因为这些 API 全部是前面的封装而已。

### 实现 Promise.resolve

方法介绍：[Promise.resolve()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)

这是一个静态方法，什么是静态方法呢？

类（class）通过 `static` 关键字定义静态方法。不能在类的实例上调用静态方法，而应该通过类本身调用。这些通常是实用程序方法，例如创建或克隆对象的功能。

类相当于实例的原型，所有在类中定义的方法，都会被实例继承。如果在一个方法前，加上 `static` 关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为「静态方法」。

手写实现：

```javascript
class MyPromise {
  constructor (executor) {
    // ...
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // ...
  }

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    // ...
  }

  /**
   * Promise.resolve()
   * @param {[type]} value 要解析为 Promise 对象的值 
  */
  static resolve(value) {
    // 如果这个值是一个 promise, 那么将返回这个 promise
    if (value instanceof MyPromise) {
      return value;
    } else if (value instanceof Object && 'then' in value) {
      // 如果这个值是 thenable(即带有 then 方法), 返回的 promise 会跟随这个 thenable 的对象, 采用它的最终状态
      return new MyPromise((resolve, reject) => {
        value.then(resolve, reject);
      })
    }

    // 否则返回的 promise 将以此值完成, 即以此值执行 resolve() 方法(状态为 fulfilled)
    return new MyPromise((resolve) => {
      resolve(value)
    })
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // ...
}

module.exports = MyPromise;
```

测试用例：

```javascript
const MyPromise = require('./MyPromise');

const promise1 = MyPromise.resolve(123);

promise1.then((value) => {
  console.log(value);
  // expected output: 123
});

// Resolve 一个 thenable 对象
let p1 = MyPromise.resolve({
  then: function (onFulfill) {
    onFulfill("Resolving");
  }
});
console.log(p1 instanceof MyPromise) // true, 这是一个 Promise 对象

setTimeout(() => {
  console.log('p1 :>> ', p1);
}, 1000);

p1.then(function (v) {
  console.log(v); // 输出"fulfilled!"
}, function (e) {
  // 不会被调用
});

// Thenable 在 callback 之前抛出异常
// MyPromise rejects
let thenable = {
  then: function (resolve) {
    throw new TypeError("Throwing");
    resolve("Resolving");
  }
};

let p2 = MyPromise.resolve(thenable);
p2.then(function (v) {
  // 不会被调用
}, function (e) {
  console.log(e); // TypeError: Throwing
});
```

输出结果：

```bash
true
123
Resolving
TypeError: Throwing
p1 :>> MyPromise {PromiseState: 'fulfilled', PromiseResult: 'Resolving', onFulfilledCallbacks: Array(1), onRejectedCallbacks: Array(1)}
```

### 实现 Promise.reject

方法介绍：[Promise.reject()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject)

手写实现：

```javascript
class MyPromise {
  constructor (executor) {
    // ...
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // ...
  }

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    // ...
  }

  /**
   * Promise.reject()
   * @param {*} reason 表示 Promise 被拒绝的原因
   * @returns 
  */
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    })
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // ...
}

module.exports = MyPromise;
```

测试用例：

```javascript
const MyPromise = require('./MyPromise');

MyPromise.reject(new Error('fail')).then(function () {
  // not called
}, function (error) {
  console.error(error); // Error: fail
});
```

输出结果：

```bash
Error: fail
```

### 实现 Promise.prototype.catch

方法介绍：[Promise.prototype.catch()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)

这个方法其实在前面已经实现过了。

事实上，我们显式使用 `obj.catch(onRejected)`，内部实际调用的是 `obj.then(undefined, onRejected)`。

`Promise.prototype.catch()` 方法是 `.then(null, rejection)` 或 `.then(undefined, rejection)` 的别名，用于指定发生错误时的回调函数。

测试用例：

```javascript
const MyPromise = require('./MyPromise');

let p1 = new MyPromise(function (resolve, reject) {
  resolve('Success');
});

p1.then(function (value) {
  console.log(value); // "Success!"
  throw 'oh, no!';
}).catch(function (e) {
  console.log(e); // "oh, no!"
}).then(function () {
  console.log('after a catch the chain is restored');
}, function () {
  console.log('Not fired due to the catch');
});

// 以下行为与上述相同
p1.then(function (value) {
  console.log(value); // "Success!"
  return Promise.reject('oh, no!');
}).catch(function (e) {
  console.log(e); // "oh, no!"
}).then(function () {
  console.log('after a catch the chain is restored');
}, function () {
  console.log('Not fired due to the catch');
});

// 捕获异常
const p2 = new MyPromise(function (resolve, reject) {
  throw new Error('test');
});
p2.catch(function (error) {
  console.log(error);
});
// Error: test
```

输出结果：

```bash
Success
Success
Error: test
oh, no!
oh, no!
after a catch the chain is restored
after a catch the chain is restored
```

### 实现 Promise.prototype.finally

方法介绍：[Promise.prototype.finally()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally)

该方法是 ES2018 引入标准的。

由于无法知道 promise 的最终状态，所以 finally 的回调函数中不接收任何参数，它仅用于无论最终结果如何都要执行的情况。

手写实现：

```javascript
class MyPromise {
  constructor (executor) {
    // ...
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // ...
  }

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    // ...
  }

  /**
   * finally
   * @param {*} callBack 无论结果是 fulfilled 或者是 rejected, 都会执行的回调函数
   * @returns 
  */
  finally(callBack) {
    return this.then(callBack, callBack)
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // ...
}

module.exports = MyPromise;
```

测试用例：

```javascript
const MyPromise = require('./MyPromise');

let p1 = new MyPromise(function (resolve, reject) {
  resolve(1)
}).then(function (value) {
  console.log(value);
}).catch(function (e) {
  console.log(e);
}).finally(function () {
  console.log('finally');
});
```

输出结果：

```bash
1
finally
```

### 实现 Promise.all

方法介绍：[Promise.all()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

手写实现：

```javascript
class MyPromise {
  constructor (executor) {
    // ...
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // ...
  }

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    // ...
  }

  /**
   * Promise.all()
   * @param {iterable} promises 一个 promise 的 iterable 类型(注: Array, Map, Set 都属于 ES6 的 iterable 类型)的输入
   * @returns
   */
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      // 参数校验
      if (Array.isArray(promises)) {
        let result = []; // 存储结果
        let count = 0; // 计数器

        // 如果传入的参数是一个空的可迭代对象，则返回一个已完成（already resolved）状态的 Promise
        if (promises.length === 0) {
          return resolve(promises);
        }

        promises.forEach((item, index) => {
          // MyPromise.resolve方法中已经判断了参数是否为promise与thenable对象，所以无需在该方法中再次判断
          MyPromise.resolve(item).then(
            value => {
              count++;
              // 每个promise执行的结果存储在result中
              result[index] = value;
              // Promise.all 等待所有都完成（或第一个失败）
              count === promises.length && resolve(result);
            },
            reason => {
              /**
               * 如果传入的 promise 中有一个失败(rejected),
               * Promise.all 异步地将失败的那个结果给失败状态的回调函数，而不管其它 promise 是否完成
               */
              reject(reason);
            }
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // ...
}

module.exports = MyPromise;
```

测试用例：

```javascript
const MyPromise = require('./MyPromise');

const promise1 = MyPromise.resolve(3);
const promise2 = 42;
const promise3 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

MyPromise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});
// expected output: Array [3, 42, "foo"]
```

输出结果：

```bash
(3) [3, 42, 'foo']
```

测试 Promise.all 的快速返回失败行为：

Promise.all 在任意一个传入的 promise 失败时返回失败。例如，如果你传入的 promise 中，有四个 promise 在一定的时间之后调用成功函数，有一个立即调用失败函数，那么 Promise.all 将立即变为失败。

```javascript
const MyPromise = require('./MyPromise');

let p1 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 1000, 'one');
});
let p2 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 2000, 'two');
});
let p3 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 3000, 'three');
});
let p4 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 4000, 'four');
});
let p5 = new MyPromise((resolve, reject) => {
  reject('reject');
});

MyPromise.all([p1, p2, p3, p4, p5]).then(values => {
  console.log(values);
}, reason => {
  console.log(reason)
});

//From console:
//"reject"
```

输出结果：

```bash
reject
```

### 实现 Promise.allSettled

方法介绍：[Promise.allSettled()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

手写实现：

```javascript
class MyPromise {
  constructor (executor) {
    // ...
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // ...
  }

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    // ...
  }

  /**
   * Promise.allSettled()
   * @param {iterable} promises 一个 promise 的 iterable 类型(注: Array, Map, Set 都属于 ES6 的 iterable 类型)的输入
   * @returns
   */
  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      // 参数校验
      if (Array.isArray(promises)) {
        let result = []; // 存储结果
        let count = 0;   // 计数器

        // 如果传入的是一个空数组, 那么就直接返回一个 resolved 的空数组 promise 对象
        if (promises.length === 0) return resolve(promises);

        promises.forEach((item, index) => {
          // 非 promise 值, 通过 Promise.resolve 转换为 promise 进行统一处理
          MyPromise.resolve(item).then(
            value => {
              count++;
              // 对于每个结果对象, 都有一个 status 字符串. 如果它的值为 fulfilled, 则结果对象上存在一个 value
              result[index] = {
                status: 'fulfilled',
                value
              }
              // 所有给定的 promise 都已经 fulfilled 或 rejected 后, 返回这个 promise
              count === promises.length && resolve(result);
            },
            reason => {
              count++;
              /**
               * 对于每个结果对象, 都有一个 status 字符串. 如果值为 rejected, 则存在一个 reason
               * value(或 reason)反映了每个 promise 决议(或拒绝)的值
               */
              result[index] = {
                status: 'rejected',
                reason
              }
              // 所有给定的promise都已经fulfilled或rejected后,返回这个promise
              count === promises.length && resolve(result);
            }
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // ...
}

module.exports = MyPromise;
```

测试用例：

```javascript
const MyPromise = require('./MyPromise');

const promise1 = MyPromise.resolve(3);
const promise2 = 1;
const promises = [promise1, promise2];

MyPromise.allSettled(promises).
then((results) => results.forEach((result) => console.log(result)));

setTimeout(() => {
  const p1 = MyPromise.resolve(3);
  const p2 = new MyPromise((resolve, reject) => setTimeout(reject, 100, 'foo'));
  const ps = [p1, p2];

  MyPromise.allSettled(ps).
  then((results) => results.forEach((result) => console.log(result)));
}, 1000);

MyPromise.allSettled([]).then((results) => console.log(results))
```

输出结果：

```bash
(0) []
{status: 'fulfilled', value: 3}
{status: 'fulfilled', value: 1}
{status: 'fulfilled', value: 3}
{status: 'rejected', reason: 'foo'}
```

### 实现 Promise.any

方法介绍：[Promise.any()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)

本质上，这个方法和 Promise.all() 是相反的。

> 注意：Promise.any() 方法依然是实验性的，尚未被所有的浏览器完全支持。它当前处于 TC39 第四阶段草案（Stage 4）。

手写实现：

```javascript
class MyPromise {
  constructor (executor) {
    // ...
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // ...
  }

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    // ...
  }

  /**
   * Promise.any()
   * @param {iterable} promises 一个 promise 的 iterable 类型(注: Array, Map, Set 都属于 ES6 的 iterable 类型)的输入
   * @returns
   */
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      // 参数校验
      if (Array.isArray(promises)) {
        let errors = []; // 
        let count = 0; // 计数器

        // 如果传入的参数是一个空的可迭代对象, 则返回一个已失败(already rejected)状态的 Promise
        if (promises.length === 0) return reject(new AggregateError([], 'All promises were rejected'));

        promises.forEach(item => {
          // 非 Promise 值, 通过 Promise.resolve 转换为 Promise
          MyPromise.resolve(item).then(
            value => {
              // 只要其中的一个 promise 成功, 就返回那个已经成功的 promise 
              resolve(value);
            },
            reason => {
              count++;
              errors.push(reason);
              /**
               * 如果可迭代对象中没有一个 promise 成功，就返回一个失败的 promise 和 AggregateError类型的实例,
               * AggregateError是 Error 的一个子类, 用于把单一的错误集合在一起
               */
              count === promises.length && reject(new AggregateError(errors, 'All promises were rejected'));
            }
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // ...
}

module.exports = MyPromise;
```

测试用例：

```javascript
const MyPromise = require('./MyPromise');

console.log(new AggregateError('All promises were rejected'));

MyPromise.any([]).catch(e => {
  console.log(e);
})
```

> 注意：和 Promise.any() 一样，这个 AggregateError 也是一个实验中的功能，处于 Stage 3 Draft（第三阶段草案）。
>
> 因此需要使用 `node v16.13.0` 及以上版本才能支持，否则会报错。

输出结果：

```bash
AggregateError
AggregateError
```

用其他用例测试一下该方法：

```javascript
const MyPromise = require('./MyPromise');

/**
 * 验证 Promise.any() 方法
 */

// console.log(new AggregateError('All promises were rejected'));

MyPromise.any([]).catch(e => {
  console.log(e);
});

const pErr = new MyPromise((resolve, reject) => {
  reject("总是失败");
});

const pSlow = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, "最终完成");
});

const pFast = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, "很快完成");
});

MyPromise.any([pErr, pSlow, pFast]).then((value) => {
  console.log(value);
  // 期望输出: "很快完成"
})


const pErr1 = new MyPromise((resolve, reject) => {
  reject("总是失败");
});

const pErr2 = new MyPromise((resolve, reject) => {
  reject("总是失败");
});

const pErr3 = new MyPromise((resolve, reject) => {
  reject("总是失败");
});

MyPromise.any([pErr1, pErr2, pErr3]).catch(e => {
  console.log(e);
})
```

输出结果：

```bash
AggregateError: All promises were rejected
AggregateError: All promises were rejected
很快完成
```

### 实现 Promise.race()

方法介绍：[Promise.race()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

手写实现：

```javascript
class MyPromise {
  constructor (executor) {
    // ...
  }

  // 定义 then 方法
  then (onFulfilled, onRejected) {
    // ...
  }

  // 用 then 模拟 catch
  // catch 本身是 then 的一个语法糖
  catch (errorCallback) {
    // ...
  }

  /**
   * Promise.race()
   * @param {iterable} promises 可迭代对象, 类似 Array. 详见 iterable
   * @returns
   */
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      // 参数校验
      if (Array.isArray(promises)) {
        // 如果传入的迭代 promises 是空的, 则返回的 promise 将永远等待
        if (promises.length > 0) {
          promises.forEach(item => {
            /**
             * 如果迭代包含一个或多个非承诺值和/或已解决/拒绝的承诺,
             * 则 Promise.race 将解析为迭代中找到的第一个值
             */
            MyPromise.resolve(item).then(resolve, reject);
          })
        }
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // ...
}

module.exports = MyPromise;
```

测试用例：

```javascript
const MyPromise = require('./MyPromise');

/**
 * 验证 Promise.race() 方法
 */

// 数组全是非 Promise 值, 测试通过
let p1 = MyPromise.race([1, 3, 4]);
setTimeout(() => {
  console.log('p1 :>> ', p1);
});

// 空数组, 测试通过
let p2 = MyPromise.race([]);
setTimeout(() => {
  console.log('p2 :>> ', p2);
});

const p11 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one');
});

const p22 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'two');
});

// // 数组里有非Promise值, 测试通过
MyPromise.race([p11, p22, 10]).then((value) => {
  console.log('p3 :>> ', value);
  // Both resolve, but p22 is faster
});
// expected output: 10

// 数组里有'已解决的Promise' 和 非Promise值 测试通过
let p12 = MyPromise.resolve('已解决的Promise')
setTimeout(() => {
  MyPromise.race([p12, p22, 10]).then((value) => {
    console.log('p4 :>> ', value);
  });
  // expected output:已解决的Promise
});

// Promise.race 的一般情况 测试通过
const p13 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one');
});

const p14 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'two');
});

MyPromise.race([p13, p14]).then((value) => {
  console.log('p5 :>> ', value);
  // Both resolve, but promise2 is faster
});
// expected output: "two"
```

输出结果：

```bash
p1 :>>  MyPromise {PromiseState: 'pending', PromiseResult: null, onFulfilledCallbacks: Array(0), onRejectedCallbacks: Array(0)}
p2 :>>  MyPromise {PromiseState: 'pending', PromiseResult: null, onFulfilledCallbacks: Array(0), onRejectedCallbacks: Array(0)}
p3 :>>  10
p4 :>>  已解决的Promise
p5 :>>  two
```

## 源码仓库

以上所有的代码，我都放在了仓库 [my-promise](https://github.com/wenyuan/my-promise) 中。

（完）
