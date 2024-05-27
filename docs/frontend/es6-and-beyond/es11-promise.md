# Promise.allSettled()

ES6 的新特性中，Promise.all() 具有并发执行异步任务的能力。但它的最大问题就是如果其中某个任务出现异常（reject），所有任务都会挂掉，Promise 直接进入 reject 状态。

场景：现在页面上有三个请求，分别请求不同的数据，如果一个接口服务异常，整个都是失败的，都无法渲染出数据。

```javascript
Promise.all([
  Promise.reject({
    code: 500,
    msg: '服务异常'
  }),
  Promise.resolve({
    code: 200,
    data: ['1', '2', '3']
  }),
  Promise.resolve({
    code: 200,
    data: ['4', '5', '6']
  })
]).then(res => {
  console.log(res)
  console.log('成功')
}).catch(err => {
  console.log(err)
  console.log('失败')
})
```

我们需要一种机制，如果并发任务中，无论一个任务正常或者异常，都会返回对应的的状态。

```javascript
Promise.allSettled([
  Promise.reject({
    code: 500,
    msg: '服务异常'
  }),
  Promise.resolve({
    code: 200,
    data: ['1', '2', '3']
  }),
  Promise.resolve({
    code: 200,
    data: ['4', '5', '6']
  })
]).then(res => {
  console.log(res)
  // console.log('成功')
  const data = res.filter(item => item.status === 'fulfilled')
  console.log(data)
}).catch(err => {
  console.log(err)
  console.log('失败')
})
```

## 参考资料

* [Promise.allSettled()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

（完）
