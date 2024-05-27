# 模板编译

## 前置知识点：with 语法

首先复习一个 JS 的冷门知识点：`with` 语法。

常规作用域查找变量方式：

```javascript
const obj = {a: 100, b: 200}

console.log(obj.a)
console.log(obj.b)
console.log(obj.c) // undefined
```

使用 `with` 后，能改变 `{}` 内自由变量的查找方式：将 `{}` 内自由变量当作 `obj` 的属性来查找：

```javascript
with(obj) {
  console.log(obj.a)
  console.log(obj.b)
  console.log(obj.c) // 会报错
}
```

在平时开发中，一般慎用 `with` 语法，这是因为它打破了作用域规则，使代码易读性变差了。但这里把它作为前置知识点是因为模板编译中用到了。

## Vue 模板被编译成什么

* Vue 的模板不是 html，因为它有指令、插值、JS 表达式，能实现判断、循环；
* html 是标签语言，只有 JS 才能实现判断、循环。

因此，模板一定是转换为某种 JS 代码，即编译模板。

## Vue 模板编译过程

* 模板编译为 render 函数，执行 render 函数返回 vnode；
* 基于 vnode 再执行 patch 和 diff；
* 使用 Webpack 时，vue-loader 会在开发环境下编译模板（目前业内主流）；否则会在浏览器运行时中编译（单独在页面中引入 vue.js 使用）。

用代码来解释编译过程：

```javascript
// Step1: 一个 template，使用了插值语法
const template = `<p>{{message}}</p>`

// Step2: 上述 template 被编译后，得到 JS 代码如下
// with 语法，后面的自由变量的查找都会变成 this 的查找
// this 指向 vm 实例: vm = new vue({...})
with(this){return createElement('p',[createTextVNode(toString(message))])}

// Step3: 执行上述函数后，返回 vnode
// 类似 snabbdom 的 h 函数: h('p', {}, [...]) => vnode

// Step4: 渲染和更新
```

## vue 组件中使用 render 代替 template

通过 `template` 来定义 Vue 组件：

```javascript
Vue.component('heading', {
  template: `<h3><a name="headerId" href="#headerId">this is a tag</a></h3>`
})
```

通过 `render` 属性来定义 Vue 组件，需要定义一个函数，参数为 `createElement`。

`createElement` 类似于前面介绍的编译后的函数体，它的第一个参数是标签，第二个参数是属性（可不写），第三个参数是子元素。

```javascript
Vue.component('heading', {
  render: function(createElement) {
    return createElement(
      'h' + this.level,
      [
        createElement('a', {
          attrs: {
            name: 'headerId',
            href: '#' + 'headerId'
          }
        }, 'this is a tag')
      ]
    )
  }
})
```

在有些复杂情况中，不能用 `template`，可以考虑用 `render`。

（完）
