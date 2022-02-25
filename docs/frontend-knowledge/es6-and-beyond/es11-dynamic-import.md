# 动态引入

动态 import 提案几年前就已提出，如今已经进入 ES 正式规范。这里理解成「按需」更为贴切。

现代前端打包资源越来越大，打包成几 M 的 JS 资源已成常态，而往往前端应用初始化时根本不需要全量加载逻辑资源，为了首屏渲染速度更快，很多时候都是按需加载，比如懒加载图片等。而这些按需执行逻辑资源都体现在某一个事件回调中去加载。

## 案例

页面上有一个按钮，点击按钮才去加载 ajax 模块。

```javascript
const oBtn = document.querySelector('#btn')
oBtn.addEventListener('click', () => {
  import('./ajax').then(mod => {
    // console.log(mod)
    mod.default('static/a.json', res => {
      console.log(res)
    })
  })
})
```

Webpack 目前已很好的支持了该特性。Vue 中也已使用 Dynamic Import 实现组件的动态导入。

（完）
