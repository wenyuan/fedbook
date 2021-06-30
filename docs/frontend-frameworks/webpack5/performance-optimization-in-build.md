# 性能优化 - 构建速度

> Webpack 性能优化主要有两个方向：优化打包构建速度 - 提高开发体验和效率，优化产出代码 - 提升产品性能，本文主要介绍如何优化构建速度。

构建速度的优化措施有 8 点：

* 优化 babel-loader
* IgnorePlugin
* noParse
* happyPack
* ParallelUglifyPlugin
* 自动刷新
* 热更新
* DllPlugin

前 5 个可用于生产环境，后 3 个只用于开发环境。

## 优化 babel-loader

* 开启缓存：在原配置的基础上增加一个 `?cacheDirectory` 开启缓存，只要是 ES6 代码没有改动的部分，就不会重新编译。
* 明确范围：通过 `include` 或 `exclude` 明确打包范围，两者选一个即可。

```javascript
{
  test: /\.js$/,
  use: ['babel-loader?cacheDirectory'],    // 开启缓存 
  include: path.resolve(__dirname, 'src')  // 明确范围
  // 排除范围，include 和 exclude 两者选一个即可
  // exclude: path.resovle(__dirname, 'node_modules')
}
```

## IgnorePlugin 避免引入无用模块

例如我们在项目中引入了 Moment.js 这个日期处理类库 `import moment from 'moment'`，该库有多国语言支持，默认会引入所有语言的 JS 代码，导致体积庞大。

如果我们只想打包进中文语言的代码，就需要启用 IgnorePlugin 插件。

修改 `webpack.prod.js` 文件，在 `plugins` 中追加配置：

```javascript
module.exports = {
  plugins: [
    // 忽略 moment 下的 /locale 目录
    new webpack.IgnorePlugin(/\.\/locale/, /moment/),
  ]
}
```

通过上述配置后，在打包时 `moment` 库的 `locale` 这个文件夹就被跳过了。那么在使用时，为了能显示语言，就要动态引入：

```javascript {2}
import moment from 'moment'
import 'moment/locale/zh-cn' // 手动引入中文语言包
moment.locale('zh-cn')

console.log(moment().format('ll'))
```

## noParse 避免重复打包

代码中引入的第三方包，形如 `xxx.min.js`，往往已经采用模块化处理过了，我们不需要重新进行打包。这个时候就在 `module`

```javascript
module.exports = {
  module: {
    // 忽略对 react.min.js 文件的递归解析处理
    noParse: [/react\.min\.js$/]
  }
}
```

## happyPack 多进程打包

JS（Node.js/Webpack）是**单线程**的，因此如果开启**多进程**打包，可以提高构建速度（特别是多核 CPU）。

由于 happyPack 需要改变 babel-loader 的配置，所以需要先将原先 `webpack.common.js` 里关于 babel-loader 的配置删掉，并将这块配置移到 `webpack.dev.js` 中：

```javascript
// babel-loader
{
  test: /\.js$/,
  use: ['babel-loader?cacheDirectory'],
  include: srcPath,
  exclude: /node_modules/
}
```

接下来安装 happyPack：

```bash
npm install happypack --save-dev
```

然后在 `webpack.prod.js` 文件中引入并配置：

```javascript
const HappyPack = require('happypack')
const { srcPath, distPath } = require('./paths')

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        // 用 happypack/loader 替换原来的 babel-loader
        // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
        // id=babel 对应下面 plugins 中 new HappyPack 中的 id
        use: ['happypack/loader?id=babel'],
        include: srcPath,
      },

      // 省略其它配置……
    ]
  },
  plugins: [
    // 省略其它配置……

    // happyPack 开启多进程打包
    new HappyPack({
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      id: 'babel',
      // 如何处理 .js 文件，用法和 Loader 配置中一样
      loaders: ['babel-loader?cacheDirectory']
    })
  ]
}
```

## ParallelUglifyPlugin 多进程压缩 JS

Webpack 内置了 Uglify 工具压缩 JS，但它是单进程的。开启多进程压缩会更快，和 happyPack 同理。

首先需要安装 ParallelUglifyPlugin：

```bash
npm install webpack-parallel-uglify-plugin --save-dev
```

然后在 `webpack.prod.js` 文件中引入并配置：

```javascript
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

module.exports = {
  plugins: [
    // 省略其它配置……

    // 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码
    new ParallelUglifyPlugin({
      // 传递给 UglifyJS 的参数
      // （还是使用 UglifyJS 压缩，只不过帮助开启了多进程）
      uglifyJS: {
        output: {
          beautify: false, // 最紧凑的输出
          comments: false, // 删除所有的注释
        },
        compress: {
          // 删除所有的 `console` 语句，可以兼容 IE 浏览器
          drop_console: true,
          // 内嵌定义了但是只用到一次的变量
          collapse_vars: true,
          // 提取出出现多次但是没有定义成变量去引用的静态值
          reduce_vars: true,
        }
      }
    })
  ]
}
```

::: warning 关于开启多进程
* 如果项目较大，打包较慢，开启多进程能提高速度
* 如果项目较小，打包很快，开启多进程会较低速度（进程开销）
:::

## 自动刷新

每次代码修改保存之后，会自动进行重新构建并刷新页面，不用再次输入命令，用于开发环境。但一般我们在开发环境中都会使用 `webpack-dev-server`，该插件自带自动刷新功能，所以不用特地开启该功能。

下面代码演示怎么配置自动刷新的，**实际工作中不用**。

```javascript
module.export = {
  watch: true, // 开启监听，默认为 false
  
  // 监听配置
  watchOptions: {
    ignored: /node_modules/, // 忽略哪些
    // 监听到变化发生后会等 300ms 再去执行动作，防止文件更新太快导致重新编译频率太高
    aggregateTimeout: 300,   // 默认为 300ms
    // 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
    poll: 1000               // 默认每隔 1000ms 询问一次
  }
}
```

## 热更新

热更新替换（HMR - Hot Module Replacement）。

* 自动刷新：
  * 整个网页全部刷新，速度较慢
  * 整个网页全部刷新，状态会丢失
* 热更新：
  * 新代码生效，网页不刷新，状态不丢失

热更新插件是 Webpack 自带的，无需另外安装，在 `webpack.dev.js` 中配置如下：

```javascript {10-14,22,31}
const path = require('path')
const webpack = require('webpack')
const { srcPath, distPath } = require('./paths')
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')

module.exports = {
  mode: 'development',
  entry: {
    // index: path.join(srcPath, 'index.js'),
    index: [
      'webpack-dev-server/client?http://localhost:8080/',
      'webpack/hot/dev-server',
      path.join(srcPath, 'index.js')
    ]
  },
  module: {
   // 省略……
  },
  plugins: [
    // 省略其它……

    new HotModuleReplacementPlugin()
  ],
  devServer: {
    port: 8080,
    progress: true,  // 显示打包的进度条
    contentBase: distPath,  // 根目录
    open: true,  // 自动打开浏览器
    compress: true,  // 启动 gzip 压缩

    hot: true,

    // 设置代理
    proxy: {
     // 省略……
    }
  }
}
```


本质上要实现 HMR，都要写类似以下 `index.js` 中的代码（判断是否开启热更新，单独执行某代码块），否则不会热更新，还是走刷新的逻辑。

```javascript
import counter from './counter';
import number from './number';
counter();
number();

// 这里需要判断下是否开启了热更新，如果开启了，就只让number函数再执行一次，否则不会热更新
if(module.hot) {
  module.hot.accept('./number', () => {
    document.body.removeChild(document.getElementById('number'));
    number();
  })
}
```

`index.js` 中引入两个模块，如果不开启热更新，那么当一个模块里的数据变化了，就会导致页面刷新，使另一个模块内的数据也恢复到初始值，如果我们想一个模块里的 JS 代码的变化，不影响另一个模块代码变更过的数据，每改一个 JS 模块里的代码，只会更新当前模块的数据，不会影响其他 JS 模块的数据。以上需求可借助 HMR 来实现。

但在很多时候，我们开发过程中并没有去写这样的代码，是因为在相应的 loader 中，已经帮我们实现了热更新的代码。如：

* css-loader 中同样也配置了热更新，不需要自己额外添加代码
* 我们使用的 vue 框架里，vue-loader 里也已经配置了热更新，所以不需要额外添加代码

## DllPlugin 动态链接库插件

前端框架如 Vue.js 和 React 体积大，构建慢。但它们的版本较稳定，不常升级版本。那么同一个版本只构建一次即可，不用每次都重新构建。

Webpack 已内置 DllPlugin 支持，无需另外安装。它包含两个插件：

* DllPlugin：打包出 dll 文件
* DllReferencePlugin：使用 dll 文件

这个过程比较复杂，目前在开发环境中不怎么用，所以暂时先不整理，后续再补。

（完）
