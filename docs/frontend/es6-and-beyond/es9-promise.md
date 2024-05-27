# Promise.prototype.finally()

指定不管最后状态如何都会执行的回调函数。

Promise.prototype.finally() 方法返回一个 Promise，在 promise 执行结束时，无论结果是 fulfilled 或者是 rejected，在执行 `then()` 和 `catch()` 后，都会执行 `finally()` 指定的回调函数。

这为指定执行完 promise 后，无论结果是 fulfilled 还是 rejected 都需要执行的代码提供了一种方式，避免同样的语句需要在 `then()` 和 `catch ()` 中各写一次的情况。

**基本语法**

> p.finally(onFinally)

**示例**

```javascript
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
    // reject('fail')
  }, 1000)
}).then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
}).finally(() => {
  console.log('finally')
})
```

## 场景 1：loading 关闭

一般的界面设计中，每次发送请求都会有 loading 提示，请求发送完毕，就需要关闭 loading 提示框，不然界面就无法被点击。因为不管请求成功或是失败，这个 loading 都需要关闭掉，这时把关闭 loading 的代码写在 finally 里再合适不过了。

## 场景 2：数据库断开链接

```javascript
let connection
db.open()
  .then(conn => {
    connection = conn
    return connection.select({
      name: 'zhangsan'
    })
  })
  .then(result => {
    // Process result
    // Use `connection` to make more queries
  })···
  .catch(error => {
    // handle errors
  })
  .finally(() => {
    connection.close()
  })
```

## 参考资料

* [Promise.prototype.finally()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally)
* [Promise.prototype.finally()](https://2ality.com/2017/07/promise-prototype-finally.html)

（完）
