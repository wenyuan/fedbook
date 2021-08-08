# React JSX

## JSX 简介

JSX 的全称是 JavaScript XML，它是 React 定义的一种类似于 XML 的 JS 扩展语法。

JS + XML 本质是 `React.createElement(component, props, ...children)` 方法的语法糖。

JSX 作用：用来简化创建虚拟 DOM：

* 写法：`var ele = <h1>Hello,React</h1>`
* 注意 1：它不是字符串, 也不是 HTML/XML 标签
* 注意 2：它最终产生的就是一个 JavaScript 对象

我们不需要一定使用 JSX，但它有以下优点：

* JSX 执行更快，因为它在编译为 JavaScript 代码后进行了优化。
* 它是类型安全的，在编译过程中就能发现错误。
* 使用 JSX 编写模板更加简单快速。

## JSX 语法规则

JSX 可以总结出下列语法规则。

### 创建虚拟 DOM 时，不要写引号

创建虚拟 DOM 时，不要写引号。

```html {3}
<script type="text/babel" >
  // 1. 创建虚拟 DOM
  const VDOM = <h1>Hello,React</h1>
  // 2. 渲染虚拟 DOM 到页面
  ReactDOM.render(VDOM, document.getElementById('example'))
</script>
```

### 标签中混入 JS 表达式的写法

标签中要混入 JS 表达式，要用花括号 `{}`。

```html {5}
<script type="text/babel" >
  const data = 'Hello,React'

  // 1. 创建虚拟 DOM
  const VDOM = <h1>{data}</h1>
  // 2. 渲染虚拟 DOM 到页面
  ReactDOM.render(VDOM, document.getElementById('example'))
</script>
```

> 注意这里的花括号不是对象的意思，仅是分隔符。

### 标签中类名的写法

标签中样式的类名要用 `className` 指定而不是 `class`。

```html {5}
<script type="text/babel" >
  const data = 'Hello,React'

  // 1. 创建虚拟 DOM
  const VDOM = <h1 className="title">{data}</h1>
  // 2. 渲染虚拟 DOM 到页面
  ReactDOM.render(VDOM, document.getElementById('example'))
</script>
```

> 如果跟平时写 HTML 一样用 `class`，会报错：`Warning: Invalid DOM property 'class'. Did you mean 'className'?`

### 标签中内联样式的写法

标签中的内联样式要用双花括号 `{{}}` 包裹，并**注意属性名转为小驼峰**（`font-size` => `fontSize`）。

本质上，外层花括号表示它里面是 JS 表达式，内层花括号表示一个对象（因为 style 属性本身就是一个 `{key: value}` 组合），所以内层花括号里的属性值 value 需要转为字符串形式，否则它将作为 JS 变量去读取。

```html {5}
<script type="text/babel" >
  const data = 'Hello,React'

  // 1. 创建虚拟 DOM
  const VDOM = <h1 style={{color:'white',fontSize:'60px'}}>{data}</h1>
  // 2. 渲染虚拟 DOM 到页面
  ReactDOM.render(VDOM, document.getElementById('example'))
</script>
```

> 如果跟平时 HTML 中的一样写 `style="color:white;"`，会报错：`Uncaught Invariant Violation: The 'style' prop expects a mapping from style properties to values, not a string.`

### 多级结构使用小括号包裹

使用小括号 `()` 包裹后，代表一个整体，并且可以缩进结构，让代码像 HTML 模板一样美观可读。

```html {3-7}
<script type="text/babel" >
  // 1. 创建虚拟 DOM
  const VDOM = (
    <div>
      <h1>Hello,React</h1>
    </div>
  )
  // 2. 渲染虚拟 DOM 到页面
  ReactDOM.render(VDOM, document.getElementById('example'))
</script>
```

### 只能有一个根标签

只能有一个根标签，如果有多级并列结构，需要用一对 div 标签包裹。

```html {4-7}
<script type="text/babel" >
  // 1. 创建虚拟 DOM
  const VDOM = (
    <div>
      <h1>Hello,React</h1>
      <h2>2021-08-08</h2>
    </div>
  )
  // 2. 渲染虚拟 DOM 到页面
  ReactDOM.render(VDOM, document.getElementById('example'))
</script>
```

> 如果不用 div 标签包裹，会报错：`Uncaught SyntaxError: Inline Babel script: Adjacent JSX elements must be wrapped in an enclosing tag`（Babel 编译错误）

### 标签必须闭合

标签必须闭合，可以是自闭合（没有标签体内容的标签），也可以是一对开始标签和结束标签。

### 关于标签首字母

* 如果首字母小写，那么 React 就会去寻找与之同名的 HTML 标签：
  * 找到，直接转为 HTML 同名元素
  * 未找到，报错（`Warning: The tag xxx is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.`）
* 如果首字母大写，那么 React 就会去寻找与之同名的组件
  * 找到，就会用该组件
  * 未找到，报错（`Uncaught ReferenceError: xxx is not defined`）

> 因为在 HTML 的标签中，除了文档声明（`<!DOCTYPE html>`）其它都是小写，所以在 JSX 的逻辑中，一旦标签首字母大写，就不去 HTML 中找有没有同名标签了，而是直接找同名组件，没找到就报错了。

### 注释需要写在花括号中

本质是通过花括号 `{}` 包裹后，将那行标签变成了 JS 表达式，然后就可以采用 JS 的多行注释语法。

```html
<script type="text/babel" >
  // 1. 创建虚拟 DOM
  const VDOM = (
    <div>
      <h1>Hello,React</h1>
      {/* <p>这是一行注释</p> */}
    </div>
  )
  // 2. 渲染虚拟 DOM 到页面
  ReactDOM.render(VDOM, document.getElementById('example'))
</script>
```

（完）
