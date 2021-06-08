# 高级配置

基本配置主要确保项目能够在 demo 环境运行，而用于线上环境时往往需要进行一些高级配置。

webpack 的高级配置主要分为 6 个方面，根据需要进行选择：

* 多入口
* 抽离压缩 CSS 文件

## 1. 多入口

通过基本配置，我们在打包编译后产生的页面只是一个文件 `index.html`。如果在一个项目中想产生两个页面 `index.html` 和 `other.html`（或多个页面），就需要进行多入口配置。

首先在 `webpack.common.js` 中建入口（`entry`）的时候就需要建立两个（或多个），其次在插件（`plugins`）中针对每一个入口都要 `new` 一个 `HtmlWebpackPlugin` 的实例。配置代码如下：

```javascript {7,8,16-28}
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { srcPath, distPath } = require('./paths')

module.exports = {
  entry: {
    index: path.join(srcPath, 'index.js'),
    other: path.join(srcPath, 'other.js')
  },
  module: {
    rules: [
      // 此处省略处理 js、css、less 的配置
    ]
  },
  plugins: [
    // 多入口 - 生成 index.html
    new HtmlWebpackPlugin({
      template: path.join(srcPath, 'index.html'), // 对应到 index.html 这个模板文件
      filename: 'index.html', // 生成的文件，名字随便取
      // chunks 表示该页面要引入哪些 JS 文件（即 entry 中配置的 JS 文件），默认全部引用
      chunks: ['index']  // 只引用 index.js
    }),
    // 多入口 - 生成 other.html
    new HtmlWebpackPlugin({
      template: path.join(srcPath, 'other.html'), // 对应到 other.html 这个模板文件
      filename: 'other.html', // 生成的文件，名字随便取
      chunks: ['other']  // 只引用 other.js
    })
  ]
}
```

其次修改 prod（生产环境配置）中的 `output`，将 `webpack.prod.js` 中 `output.filename` 的固定值 `bundle` 修改为变量 `[name]`。配置代码如下：

```javascript {11,12}
const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpackCommonConf = require('./webpack.common.js')
const { merge } = require('webpack-merge')
const { srcPath, distPath } = require('./paths')

module.exports = merge(webpackCommonConf, {
  mode: 'production',
  output: {
    // filename: 'bundle.[contenthash:8].js',  // 打包代码时，加上 hash 戳
    filename: '[name].[contenthash:8].js', // name 即多入口时 entry 的 key
    path: distPath,
  },
  module: {
    rules: [
      // 此处省略处理图片的配置
    ]
  },
  plugins: [
    new CleanWebpackPlugin(), // 会默认清空 output.path 文件夹
    new webpack.DefinePlugin({
      // window.ENV = 'production'
      ENV: JSON.stringify('production')
    })
  ]
})
```

## 2. 抽离压缩 CSS 文件

在基础配置中，是把所有 CSS 文件全部写到页面的 style 标签里，这种方式在开发模式中问题不大，但在生产环境中显然不科学，因此我们需要把 CSS 文件抽离压缩。

首先在 `webpack.common.js` 中删除对 CSS 和 Less 的处理，只保留对 JS 文件的处理：

```javascript {10-17}
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { srcPath, distPath } = require('./paths')

module.exports = {
  entry: {
    index: path.join(srcPath, 'index.js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: srcPath,
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(srcPath, 'index.html'),
      filename: 'index.html'
    })
  ]
}
```

其次将原来 CSS 和 Less 的处理逻辑放到开发环境下，即 `webpack.dev.js` 中：

```javascript {16-25}
const path = require('path')
const webpack = require('webpack')
const webpackCommonConf = require('./webpack.common.js')
const { merge } = require('webpack-merge')
const { srcPath, distPath } = require('./paths')

module.exports = merge(webpackCommonConf, {
  mode: 'development',
  module: {
    rules: [
      // 直接引入图片 url
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: 'file-loader'
      },
      {
        test: /\.css$/,
        // loader 的执行顺序是：从后往前
        use: ['style-loader', 'css-loader', 'postcss-loader'] // 加了 postcss
      },
      {
        test: /\.less$/,
        // 增加 'less-loader' ，注意顺序
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // window.ENV = 'development'
      ENV: JSON.stringify('development')
    })
  ],
  devServer: {
    // 此处省略 devServer 的配置
  }
})
```

然后才是在 `webpack.prod.js` 中进行配置，这里对 CSS 和 Less 的处理逻辑与在开发环境中很不一样。需要安装三个插件 —— 用于抽离的 `mini-css-extract-plugin`，用于压缩的 `terser-webpack-plugin` 和 `optimize-css-assets-webpack-plugin`。配置代码如下：

```javascript {5-7,37-55,65-68,71-74}
const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const webpackCommonConf = require('./webpack.common.js')
const { srcPath, distPath } = require('./paths')

module.exports = merge(webpackCommonConf, {
  mode: 'production',
  output: {
    filename: '[name].[contenthash:8].js', // name 即多入口时 entry 的 key
    path: distPath,
  },
  module: {
    rules: [
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
      },
      // 抽离 css
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // 注意，这里不再用 style-loader
          'css-loader',
          'postcss-loader'
        ]
      },
      // 抽离 less
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader, // 注意，这里不再用 style-loader
          'css-loader',
          'less-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(), // 会默认清空 output.path 文件夹
    new webpack.DefinePlugin({
      // window.ENV = 'production'
      ENV: JSON.stringify('production')
    }),

    // 抽离 css 文件，命名为 main + hash值
    new MiniCssExtractPlugin({
      filename: 'css/main.[contenthash:8].css'
    })
  ],

  optimization: {
    // 压缩 css
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  }
})
```

## 3. 抽离公共代码
