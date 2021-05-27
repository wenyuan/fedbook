# 前端路由原理

## 1. 两种路由模式

vue-router 有两种路由模式，分别是：

* hash
* H5 history

其中，H5 history 模式需要后端的支持。

## 2. hash 模式

### 2.1 网页 url 组成部分

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

### 2.2 hash 的特点

* hash 变化会触发网页跳转，即浏览器的前进、后退
* hash 变化不会刷新页面，这是 SPA 必需的特点
* hash 永远不会提交到 server 端（前端自生自灭）

### 2.3 hash 模式的实现原理

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

## 3. H5 history 模式


