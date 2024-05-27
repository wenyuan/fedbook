# for await of

异步迭代器（for-await-of）：循环等待每个 Promise 对象变为 `resolved` 状态才进入下一步。

我们知道 for...of 是同步运行的，但有时候一些任务集合是异步的，那这种遍历的输出顺序就不一定了。

```javascript
function Gen(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(time)
    }, time)
  })
}

async function test() {
  let arr = [Gen(2000), Gen(100), Gen(3000)]
  for (let item of arr) {
    console.log(Date.now(), item.then(console.log))
  }
}

test()
// 1643787864547 Promise {<pending>}
// 1643787864547 Promise {<pending>}
// 1643787864547 Promise {<pending>}
// 100
// 2000
// 3000
```

这里写了几个小任务，分别是 2000ms 、100ms、3000ms 后任务结束。在上述遍历的过程中可以看到三个任务是同步启动的，但是输出上并不是按任务的执行顺序输出的，这显然不太符合我们的要求。

可以通过 `await` 来中断程序的执行，直到这个 Promise 对象的状态发生改变，这样代码的打印的结果就是期望的那样了（按照任务的先后顺序）：

```javascript {12}
function Gen(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(time)
    }, time)
  })
}

async function test() {
  let arr = [Gen(2000), Gen(100), Gen(3000)]
  for (let item of arr) {
    console.log(Date.now(), await item.then(console.log))
  }
}

test()
// 2000
// 1643787906179 undefined
// 100
// 1643787908189 undefined
// 3000
// 1643787908190 undefined
```

上面这种方式的原理是利用了 `await` 中断程序的功能，在 ES9 中也可以用 for...await...of 的语法来操作：

```javascript {11-13}
function Gen(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(time)
    }, time)
  })
}

async function test() {
  let arr = [Gen(2000), Gen(100), Gen(3000)]
  for await (let item of arr) {
    console.log(Date.now(), item)
  }
}

test()
// 1643788502772 2000
// 1643788502772 100
// 1643788503775 3000
```

这种写法和第二种写法的效果差不多，但是原理却完全不同：

* 第二种写法是代码块中有 `await` 导致等待 Promise 的状态而不再继续执行。
* 第三种写法是整个代码块都不执行，等待 `arr` 当前的值（Promise 状态）发生变化之后，才执行代码块的内容。

更多的知识点参考[for await...of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for-await...of)。

::: tip
上面代码中用到了一个语法糖 `item.then(console.log)`，  
它等价于 `item.then(value => console.log(value))`。（[参考这里](https://stackoverflow.com/questions/50836242/how-does-thenconsole-log-and-then-console-log-in-a-promise-chain)）
:::

（完）
