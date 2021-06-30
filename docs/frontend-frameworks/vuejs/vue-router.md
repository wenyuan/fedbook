# 前端路由原理

## 两种路由模式

vue-router 有两种路由模式，分别是：

* hash
* H5 history

其中，H5 history 模式需要后端的支持。

## hash 模式

### 网页 url 组成部分

首先需要知道网页 url 组成部分，以及如何通过 JS 去获取各部分。

```javascript
// http://127.0.0.1:7777/vue-router.html?a=100&b=20#/aaa/bbb
location.protocol  // 'http:'
location.hostname  // '127.0.0.1'
location.host      // '127.0.0.1:7777'
location.port      // '7777'
location.pathname  // '/vue-router.html'
location.search    // '?a=100&b=20'
location.hash      // '#/aaa/bbb'
```

### hash 模式的特点

* hash 变化会触发网页跳转，即浏览器的前进、后退
* hash 变化不会刷新页面，这是 SPA 必需的特点
* hash 永远不会提交到 server 端（前端自生自灭）

### hash 模式的核心方法

* [window.onhashchange](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowEventHandlers/onhashchange)

### hash 模式的实现原理

通过 hash 的变化触发路由的变化，从而触发视图的渲染。

下面演示的代码核心是三部分：

* 监听 hash 变化
* 页面初次加载，获取当前 hash
* 点击按钮，通过 JS 修改 url 的 hash

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>hash 模式</title>
</head>
<body>
  <p>hash 模式</p>
  <button id="btn-hash">修改 hash</button>
</body>

<script>
  // 监听 hash 变化，有三种情况会触发：
  // a. JS 修改 url
  // b. 手动修改 url 的 hash（如果修改 url 的其它部分，可能会触发页面刷新）
  // c. 浏览器前进、后退
  window.onhashchange = (event) => {
    console.log('old url', event.oldURL)
    console.log('new url', event.newURL)

    console.log('hash:', location.hash)
  }

  // 页面初次加载，获取当前 hash
  document.addEventListener('DOMContentLoaded', () => {
    console.log('hash:', location.hash)
  })

  // 点击按钮，通过 JS 修改 url 的 hash
  document.getElementById('btn-hash').addEventListener('click', () => {
    location.href = '#/user'
  })
</script>
</html>
```

## H5 history 模式

### H5 history 模式的特点

H5 history 模式是用 url 规范的路由，但跳转时不刷新页面。

正常页面浏览：

* `https://github.com/xxx`         刷新页面
* `https://github.com/xxx/yyy`     刷新页面
* `https://github.com/xxx/yyy/zzz` 刷新页面

改造成 H5 history 模式：

* `https://github.com/xxx`         刷新页面
* `https://github.com/xxx/yyy`     前端跳转，不刷新页面
* `https://github.com/xxx/yyy/zzz` 前端跳转，不刷新页面

### H5 history 模式的核心方法

* [history.pushState](https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState)
* [window.onpopstate](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowEventHandlers/onpopstate)

### H5 history 模式的实现原理

下面演示的代码核心是三部分：

* 页面初次加载，获取当前 path
* 点击按钮，通过 `history.pushState` 修改 url 的 hash
  * 第一个参数：`state`，无论何时，当通过浏览器前进、后退到达第三个参数配置的路由时，对应的该值就会携带过来
  * 第二个参数：一般传递空字符串
  * 第三个参数：目标路由的 `path`
* 监听浏览器前进、后退

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>H5 history 模式</title>
</head>
<body>
  <p>H5 history 模式</p>
  <button id="btn-history">修改 url</button>
</body>

<script>
  // 页面初次加载，获取 path
  document.addEventListener('DOMContentLoaded', () => {
    console.log('load', location.pathname)
  })

  // 打开一个新的路由
  // 【注意】用 pushState 方式，浏览器不会刷新页面
  document.getElementById('btn-history').addEventListener('click', () => {
    const state = { name: 'page1' }
    console.log('切换路由到', 'page1')
    history.pushState(state, '', 'page1') // 重要！！
  })

  // 监听浏览器前进、后退
  window.onpopstate = (event) => { // 重要！！
    console.log('onpopstate', event.state, location.pathname)
  }
</script>
</html>
```

H5 history 模式需要 server 端配合，可参考[后端配置例子](https://router.vuejs.org/zh/guide/essentials/history-mode.html#后端配置例子)。无论访问哪个路由，都返回 `index.html` 页面，再由前端通过 `history.pushState` 的方式触发路由的切换。

（完）
