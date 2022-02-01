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
// 1643617301510 Promise {<pending>}
// 1643617301510 Promise {<pending>}
// 1643617301510 Promise {<pending>}
// 100
// 2000
// 3000
```

这里写了几个小任务，分别是 2000ms 、100ms、3000ms 后任务结束。在上述遍历的过程中可以看到三个任务是同步启动的，但是输出上并不是按任务的执行顺序输出的，这显然不太符合我们的要求。
