# 最佳实践 - 通用模板

> 通过最少量的代码，实际操作一下，总结一份 Webpack5 的通用配置文件模板。

## 初始化项目

::: tip
Webpack5 最小支持的 Node.js 版本已经为 8。
:::

```bash
mkdir webpack-template

cd webpack-template/

npm init -y
```

## 安装 Webpack

::: tip
当前（2021 年）执行安装命令时，默认安装的是 Webpack5。  
如果需要安装 Webpack4，就执行 `npm install webpack@4 --save-dev`
:::

```bash
# 包含 Webpack 核心内容
npm install webpack --save-dev

# 包含 Webpack 操作的常见命令
npm install webpack-cli --save-dev
```

## 创建入口文件

入口文件默认地址为 `webpack-template/src/index.js`，`src/` 下面存放项目源码。

## 执行打包（必须指定 mode）

下面的命令依次包含了入口文件、出口文件（通过 `--output-path` 指定）和模式。

```bash
webpack ./src/index.js --output-path ./dist --mode=development
```

在通用模板中，会使用配置文件来简化命令行选项。

## 通用模板

上面介绍的是从无到有创建一个 Webpack 最小工程的前置步骤。

在使用 Webpack 的过程，大部分就是跟配置文件打交道的过程。默认的配置文件名称是 `webpack.config.js`，根据需要可以进行拆分配置。

常用的配置项包括：

* mode（模式，不可省略）
* entry（入口，不可省略）
* output（出口，不可省略）
* module（模块的配置 - 不同类型文件的配置 - loader 配置）
* plugins（插件）
* devServer（开发服务器的配置）

默认配置文件 `webpack.config.js` 的基本构成如下：

```javascript
/**
* Webpack 的配置文件
*/
const { resolve } = require('path')

module.exports = {
  // 打包模式
  mode: 'production',

  // 入口文件
  entry: './src/index.js',

  // 出口配置
  output: {
    // 输出目录（输出目录必须是绝对路径）
    path: resolve(__dirname, 'dist'),
    // 输出文件名称
    filename: 'main.js'
  },

  // 模块配置
  module: {
    rules: [
      // 指定多个配置规则
    ]
  },

  // 开发服务器
  devServer: {
  
  },

  // 插件配置
  plugins: [
  
  ]
}
```

针对常见需求，我整理了一个 Webpack5 通用模板，包含了基本需求和优化。该通用模板的完整代码参见 GitHub 仓库 [webpack-template](https://github.com/wenyuan/webpack-template)，使用步骤见该仓库的 `README.md`。

（完）
