# async / await

async 和 await 是一种更加优雅的异步编程解决方案，是 Promise 的拓展。

## 基本语法

前面添加了 `async` 的函数在执行后都会自动返回一个 Promise 对象：

```javascript
async function foo() {
  return 'hello'
}
console.log(foo()) // Promise
foo()
```

相当于：

```javascript
function foo() {
  return Promise.resolve('hello')
}
console.log(foo()) // Promise
foo()
```

`await` 后面需要跟异步操作，不然就没有意义，而且 `await` 后面的 Promise 对象不必写 `then`，因为 `await` 的作用之一就是获取后面 Promise 对象成功状态传递出来的参数。

```javascript
function timeout() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(1)
      resolve('success')
    }, 1000)
  })
}

// 不加 async 和 await 是 2、1, 加了是 1、2
async function foo() {
  let res = await timeout()
  console.log(2)
  console.log(res)
}
foo()
```

## 对于失败的处理

```javascript
function timeout() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('error')
    }, 1000)
  })
}
async function foo() {
  return await timeout()
}

foo().then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})
```

在 `async` 函数中使用 `await`，那么 `await` 这里的代码就会变成同步的了，意思就是说只有等 `await` 后面的 Promise 执行完成得到结果才会继续下去，`await` 就是等待。

## 应用

需要发送多个请求，后面请求的发送得依赖上一个请求返回的数据。对于这个问题，既可以用的 Promise 的链式调用来解决，也可以用 async/await 来解决，然而后者会更简洁些。

```javascript
// 把 ajax 封装成模块
import ajax from './ajax'

function request(url) {
  return new Promise(resolve => {
    ajax(url, res => {
      resolve(res)
    })
  })
}
async function getData() {
  let res1 = await request('static/a.json')
  console.log(res1)
  let res2 = await request('static/b.json')
  console.log(res2)
  let res3 = await request('static/c.json')
  console.log(res3)
}

getData()
```

::: warning
`await` 只能在 `async` 标记的函数内部使用，单独使用会触发 Syntax error。
:::

## 参考资料

* [async 函数](https://es6.ruanyifeng.com/#docs/async)
* [async函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
* [Async/await](https://zh.javascript.info/async-await)

（完）
