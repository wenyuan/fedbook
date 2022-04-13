# 性能优化 - 产出代码

> Webpack 性能优化主要有两个方向：优化打包构建速度 - 提高开发体验和效率，优化产出代码 - 提升产品性能，本文主要介绍如何优化产出代码。

优化产出代码后可以带来的效果：

* 体积更小，加载更快
* 合理分包，不重复加载
* 速度更快，内存使用更少

产出代码的优化措施有 8 点：

* 小图片 base64 编码
* bundle 加 hash
* 懒加载
* 提取公共代码
* IgnorePlugin
* 使用 CDN 加速
* 使用 production
* 使用 Scope Hosting

前 5 个其实在前面两章中已经介绍过了。

## 小图片 base64 编码

在生产环境下（`webpack.prod.js`），将小于某个大小的图片（例如 5kb）转成 base64 格式产出，减少一个网络请求。如下代码所示：

```javascript
// 图片 - 考虑 base64 编码的情况
{
  test: /\.(png|jpg|jpeg|gif)$/,
  use: {
    loader: 'url-loader',
    options: {
      // 小于 5kb 的图片用 base64 格式产出
      // 否则，依然延用 file-loader 的形式，产出 url 格式
      limit: 5 * 1024,

      // 打包到 img 目录下
      outputPath: '/img/',

      // 设置图片的 cdn 地址（也可以统一在外面的 output 中设置，那将作用于所有静态资源）
      // publicPath: 'http://cdn.abc.com'
    }
  }
}
```

## bundle 加 hash

在生产环境下（`webpack.prod.js`），对于出口文件，根据文件的内容计算出一个 hash 值（下述示例为 8 位 hash），如果文件内容更新后，缓存会失效，重新请求新的文件；如果代码没有变化，hash 值不变，就会使用缓存，从而提高加载效率。如下代码所示：

```javascript {8,9}
const { merge } = require('webpack-merge')
const webpackCommonConf = require('./webpack.common.js')
const { srcPath, distPath } = require('./paths')

module.exports = merge(webpackCommonConf, {
  mode: 'production',
  output: {
    // filename: 'bundle.[contenthash:8].js',  // 打包代码时，加上 hash 戳
    filename: '[name].[contenthash:8].js',     // name 即多入口时 entry 的 key
    path: distPath,
  }
})
```

## 懒加载

通过 `import` 语法，先加载重要的文件，然后异步加载大的文件。这个逻辑与 Vue 和 React 中组件的异步加载类似，如下代码所示：

```javascript
setTimeout(() => {
  // 定义 chunk
  import('./dynamic-data.js').then(res => {
    console.log(res.default.message)
  })
}, 1500)
```

## 提取公共代码

在生产环境下（`webpack.prod.js`），将第三方模块和公用引用的代码单独拆分出去。

参考 [高级配置-抽离公共代码](/frontend-engineering/webpack5/advanced-config/#_3-抽离公共代码) 这一章的内容。

## IgnorePlugin

参考 [IgnorePlugin 避免引入无用模块](/frontend-engineering/webpack5/performance-optimization-in-build/#_2-ignoreplugin-避免引入无用模块) 这一章的内容。

## 使用 CDN 加速

在生产环境下（`webpack.prod.js`），设置 `output.publicPath` 后，打包出来的 html 里都会引用 CDN 的静态资源文件。

需要注意，在打包完后，需要将结果文件（`dist` 目录）都上传到 CDN 服务器，保证这些静态资源都是可访问的。

```javascript {11}
const { merge } = require('webpack-merge')
const webpackCommonConf = require('./webpack.common.js')
const { srcPath, distPath } = require('./paths')

module.exports = merge(webpackCommonConf, {
  mode: 'production',
  output: {
    // filename: 'bundle.[contenthash:8].js', // 打包代码时，加上 hash 戳
    filename: '[name].[contenthash:8].js',    // name 即多入口时 entry 的 key
    path: distPath,
    publicPath: 'http://cdn.abc.com'          // 修改所有静态文件 url 的前缀（如 cdn 域名）
  }
})
```

同理，图片也可以设置 CDN 地址，如下代码所示：

```javascript {15}
// 图片 - 考虑 base64 编码的情况
{
  test: /\.(png|jpg|jpeg|gif)$/,
  use: {
    loader: 'url-loader',
    options: {
      // 小于 5kb 的图片用 base64 格式产出
      // 否则，依然延用 file-loader 的形式，产出 url 格式
      limit: 5 * 1024,

      // 打包到 img 目录下
      outputPath: '/img/',

      // 设置图片的 cdn 地址（也可以统一在外面的 output 中设置，那将作用于所有静态资源）
      publicPath: 'http://cdn.abc.com'
    }
  }
}
```

## 使用 production

前面说过，一般会将 Webpack 配置文件拆分成三份：

* webpack.common.js
* webpack.dev.js
* webpack.prod.js

使用 production 就是指的使用 `mode: 'production'` 的方式（即使用 `webpack.prod.js` 这份配置文件）去打包生产环境的代码。

它具有如下好处：

* 无需配置，production 默认自动开启代码压缩（webpack4.x 后的功能）
* Vue、React 等会自动删掉调试代码（如开发环境的 warning）
* 会自动启动 Tree-Shaking

::: tip Tree-Shaking
在 production 模式下，打包时会自动删除没有被调用的函数，从而减小打包后的代码体积。  
只有 ES6 Module（静态引入，编译时引入）才能实现 Tree-Shaking，CommonJS（动态引入，执行时引入）不能够静态分析，无法实现 Tree-Shaking。
:::

## 使用 Scope Hosting

默认的 Webpack 打包结果中，多个 JS 文件会被打包生成多个函数。我们知道，每个函数都会产生一个作用域，那么打包前的文件越多打包后的函数就会越多，这对整个 JS 代码的执行及内存消耗很不友好。

我们希望将文件合并在一个函数里执行，就能减少作用域数量，提高代码执行效率，这就需要开启 Scope Hosting。

开启方式：

```javascript
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin')

module.exports = {
  resolve: {
    // 针对 NPM 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件
    mainFields: ['jsnext:main', 'browser', 'main']
  },
  plugins: [
    // 开启 Scope Hosting
    new ModuleConcatenationPlugin()
  ]
}
```

使用 Scope Hosting 的好处：

* 代码体积更小
* 创造函数作用域更少
* 代码可读性更好

（完）
