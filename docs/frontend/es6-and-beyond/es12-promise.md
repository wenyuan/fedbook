# Promise.any() 和 AggregateError

Promise.any() 接收一个 Promise 可迭代对象，只要其中的一个 promise 提前成功，就直接返回那个已经成功的 promise。

如果可迭代对象中没有一个 promise 成功（即所有的 promise 都失败/拒绝），就返回一个失败的 promise 和 AggregateError 类型的实例（它是 Error 的一个子类，用于把单一的错误集合在一起）。

本质上，这个方法和 Promise.all() 是相反的。

## 举例演示

```javascript
const p1 = new Promise((resolve, reject) => {
  setTimeout(
    () => resolve("promise one"),
    Math.floor(Math.random() * 100)
  );
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(
    () => resolve("promise two"),
    Math.floor(Math.random() * 100)
  );
});
const p3 = new Promise((resolve, reject) => {
  setTimeout(
    () => resolve("promise three"),
    Math.floor(Math.random() * 100)
  );
});

(async function() {
  const result = await Promise.any([p1, p2, p3]);
  console.log(result); 
})();
```

上述代码可以随机输出 `promise one`，`promise two`，`promise three`。

如果将上述代码改成所有的都 reject，那么会抛出 AggregateError：

```javascript
const p1 = new Promise((resolve, reject) => {
  setTimeout(
    () => reject("promise one rejected"),
    Math.floor(Math.random() * 100)
  );
});
const p2 = new Promise((resolve, reject) => {
  setTimeout(
    () => reject("promise two rejected"),
    Math.floor(Math.random() * 100)
  );
});
const p3 = new Promise((resolve, reject) => {
  setTimeout(
    () => reject("promise three rejected"),
    Math.floor(Math.random() * 100)
  );
});

try{
(async function() {
  const result = await Promise.any([p1, p2, p3]);
  console.log(result); 
})();
} catch(error) {
  console.log(error.errors);
}
```

报的错如下：

```bash
Uncaught (in promise) AggregateError: All promises were rejected
```

注意，必须是所有的 promise 都被 reject 之后才会抛出 AggregateError，如果有部分成功，那么将会返回成功的结果。

## 参考资料

* [Promise.any()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
* [AggregateError](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)

（完）
