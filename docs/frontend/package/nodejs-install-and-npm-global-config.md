# Node.js 安装及 npm 全局设置

> Node.js 安装及 npm 镜像源、全局模块路径的设置。

## 安装

* Windows

到 [Node.js官网](https://nodejs.org/en/ "Node.js官网") 下载 `.msi` 文件，安装好以后在 cmd 命令中可以使用 node 命令进入 node 环境，可使用 js 语法。

`npm -v` 查看 npm 版本。

* Ubuntu

```bash
apt-get install nodejs
node -v
apt-get install npm
npm -v
```

## 设置镜像源

得到原本的镜像地址：
```bash
npm get registry
```
设成淘宝镜像源地址：
```bash
npm config set registry http://registry.npm.taobao.org/
```
换成原来的（官方地址）：
```bash
npm config set registry https://registry.npmjs.org/
```

## 设置 npm 全局模块路径

正常情况下，npm 全局模块安装的存放路径是在你电脑 `C:\Users\你的电脑名称\AppData\Roaming\npm` 下的，以及 cache 路径是在你电脑的 `C:\Users\你的电脑名称\AppData\Roaming\npm-cache` 下的。

如果不喜欢放在 C 盘，我们可以调整一下，并把上面的全局模块存放路径和 cache 路径放到同一个大目录下。例如我希望将以上两个文件夹放在 nodejs 内。我们在 `D:\Program Files\nodejs\` 目录下新建两个文件夹：

+ `node_global_modules`
+ `node_cache`。

① 启动 cmd，输入下面两行命令：

```bash
npm config set prefix "D:\Program Files\nodejs\node_global_modules"
npm config set cache "D:\Program Files\nodejs\node_cache"
```

② 输入以下命令，查看是否配置成功：（cache 和 prefix 项）

```bash
npm config ls
```

③ 接下来，我们需要修改环境变量，不然全局安装的模块会报错。

首先在环境变量中，新建一个系统变量, 变量名：`NODE_HOME`, 变量值：`D:\Program Files\nodejs`

在 `Path` 变量名中，新建变量值：

```bash
# 其实我不建议用 %NODE_HOME% 变量，因为发现有时候会不生效，可能需要重启计算机
# 我一般是直接写全路径，毕竟也不会天天重装修改 Node.js 版本
%NODE_HOME%
%NOED_HOME%\node_modules
%NODE_HOME%\node_global_modules\
```

保存。

④ 现在，安装一个全局模块试试：
```bash
npm install -g pnpm
```

## npm常用命令

```bash
# 查看包信息
npm info 包名

# 查看包的信息中的某个字段（例如查看该包在 npm 上提供了哪些版本可以下载）（常用）
npm info 包名 versions

# 查看包的文档
npm docs 包名

# 查看全局包的下载路径
npm root -g

# 查看所有全局安装的模块，使用如下命令：
npm ls –g

# 查看全局模块的一级目录，使用如下命令：
npm ls -g --depth=0

# 卸载全局安装模块：（卸载后可以使用 `npm ls -g` 查看之前安装过的全局模块是否还在）
npm uninstall -g

# 查看全部 npm 默认设置
npm config ls –l
```

（完）
