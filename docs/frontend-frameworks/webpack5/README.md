# Webpack5

> 本系列主要针对 Webpack5 进行知识点梳理，该版本目前（2021 年）是最新稳定版。

::: danger TODO...
有些内容还是使用了废弃的特性，这个系列计划在有时间的时候重新整理撰写。  
由于接下来有其它学习安排，目前可以先参考 [webpack-template](https://github.com/wenyuan/webpack-template)，这个仓库是按照最新的官方文档搭建的 Webpack5 通用配置模板。
:::

**Webpack 是什么？**

简单的说，Webpack 用于编译 JavaScript 模块，它是一个模块打包工具。

打包工具帮你获得一些准备用于部署的 js 和 css 等，把它们转化为适合浏览器的可用的格式。

通过压缩、分离、懒加载等，来提升性能，提高开发效率。

<div style="text-align: center;">
  <img src="./assets/webpack.png" alt="Webpack">
  <p style="text-align: center; color: #888;">（Webpack，图来源于官网文档）</p>
</div>

<hr>

**Webpack 不是什么？**

Webpack 不是任务执行的工具，它不能自动化的处理一些常见的开发任务，例如代码检测、构建、测试。这些都是一些重复性比较强的事情，一般偏重于上层的问题。

任务执行工具：grunt、gulp。

**为什么要学习 Webpack？**

早期，在浏览器里运行 js，有二种方式：

1. 直接引用 js 脚本程序，有多少个 js，就引用多少个 .js 文件；
2. 直接一个大的 .js 文件，包含所有的 js 代码，但是文件大小体积就不可控。

后来，出现了使用立即执行函数表达式（IIFE）的方式，这种方式主要是用来解决大型项目的作用域的问题。针对这种做法，有一些工具 grunt、gulp，它们都是任务执行器，更多做的是项目文件的拼接。这类工具优化代码的能力比较弱，很难判断某个 js 方法是否被重复的引用，或是否未被引用。

Node.js 出来后，就出现了 JavaScript 的模块化开发。主要是引入了 require 机制，允许你在当前文件中加载和使用某个模块。

Webpack 最出色的功能，是它还可以引入任何其它类型的文件，包括非 js 类型的文件，可以用来引用应用程序中的所有的非 js 的内容，例如图片、css 等。Webpack 把这些都视为模块，这样每个模块都可以通过相互的引用（依赖）来表明它们之间的关系，就可以避免打包未使用的模块（资源）。

这就是 Webpack 存在的原因，也是学习 Webpack 的原因。

<hr>

**Webpack5 和 Webpack4 有什么区别?**

Webpack5 主要是内部效率的优化，对比 Webpack4，没有太多使用上的改动。

升级 Webpack5 以及周边插件后，代码需要做出的调整：

* package.json 的 dev-server 命令
  * 老版本：`"dev": "webpack-dev-server --config build/webpack.dev.js",`
  * 新版本：`"dev": "webpack serve --config build/webpack.dev.js"`
* 拆分配置文件后，引入 webpack-merge 的方法名
  * 老版本：`const { smart } = require('webpack-merge')`
  * 新版本：`const { merge } = require('webpack-merge')`
* `webpack.prod.js` 中 CleanWebpackPlugin 方法的引入方式
  * 老版本：`const CleanWebpackPlugin = require('clean-webpack-plugin')`
  * 新版本：`const { CleanWebpackPlugin } = require('clean-webpack-plugin')`
* `module.rules` 中 loader 的调用方式
  * 老版本：`loader: ['xxx-loader']`
  * 新版本：`use: ['xxx-loader']`
* `webpack.prod.js` 的 `output` 中 hash 的写法
  * 老版本：`filename: 'bundle.[contentHash:8].js'`
  * 新版本：`filename: 'bundle.[contenthash:8].js'` 其中 `h` 小写，不能大写

<hr>

关于 Webpack5 的知识点，主要参考： 

* [官方文档](https://webpack.js.org)

<div style="text-align: right">
  <svg t="1622560522153" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3671" width="64" height="64"><path d="M882.23288889 749.45422222L526.90488889 950.38577778V793.94133333l221.41155556-121.856 133.91644444 77.36888889z m24.34844444-22.07288889V307.08622222l-129.93422222 75.09333333v270.22222223l129.93422222 74.97955555z m-766.17955555 22.07288889l355.328 201.04533333V793.94133333L274.20444445 672.08533333l-133.80266667 77.36888889zM116.05333333 727.38133333V307.08622222l129.93422222 75.09333333v270.22222223L116.05333333 727.38133333z m15.24622222-447.60177778l364.43022223-206.16533333v151.32444445L262.144 353.39377778l-1.82044445 1.024c0 0.11377778-129.024-74.63822222-129.024-74.63822223z m760.03555556 0L526.90488889 73.728v151.32444445l233.472 128.34133333 1.82044444 1.024 129.13777778-74.63822223z" fill="#8ED6FB" p-id="3672"></path><path d="M495.72977778 758.21511111l-218.45333333-120.14933333V400.15644445l218.45333333 126.17955555v231.87911111z m31.17511111 0l218.45333333-120.03555556V400.15644445l-218.45333333 126.17955555v231.87911111zM291.95377778 372.62222222l219.24977777-120.49066667L730.45333333 372.62222222 511.31733333 499.25688889 291.95377778 372.62222222z" fill="#1C78C0" p-id="3673"></path></svg>
</div>
