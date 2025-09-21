# Node.js 环境配置

## 安装 Node.js

- 下载 `.msi` 安装包直接下一步下一步即可：[官方网站](https://nodejs.org/en/download)

## 配置镜像源（可选）

获取原本的镜像地址：

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

## 配置全局模块路径（可选）

npm 全局模块默认安装路径：`C:\Users\你的电脑名称\AppData\Roaming\npm`
cache 默认路径：`C:\Users\你的电脑名称\AppData\Roaming\npm-cache`

一般建议调整一下，并把上面的全局模块存放路径和 cache 路径放到同一个大目录下。

例如将以上两个文件夹放在 `D:\Code\nodejs\`。先在这个目录下新建两个文件夹：

- `node_global_modules`
- `node_cache`

启动 cmd，输入下面两行命令：

```bash
npm config set prefix "D:\Code\nodejs\node_global_modules"
npm config set cache "D:\Code\nodejs\node_cache"
```

输入以下命令，查看是否配置成功：（cache 和 prefix 项）

```bash
npm config ls
```

接下来需要修改环境变量，不然全局安装的模块会报错。

首先在环境变量中，新建一个系统变量, 变量名：`NODE_HOME`, 变量值：`D:\Code\nodejs`。

在 `Path` 变量名中，新建变量值：

+ `%NODE_HOME%`
+ `%NOED_HOME%\node_modules`
+ `%NODE_HOME%\node_global_modules\`

保存即可。

可以安装一个全局模块试试：

```bash
npm install -g pnpm
```
## npm常用命令

查看包信息：

```bash
npm info 包名
```

查看包的信息中的某个字段（例如查看该包在 npm 上提供了哪些版本可以下载）（常用）：

```bash
npm info 包名 versions
```

查看包的文档：

```bash
npm docs 包名
```

查看全局包的下载路径：

```bash
npm root -g
```

查看所有全局安装的模块，使用如下命令：

```bash
npm ls –g
```

查看全局模块的一级目录，使用如下命令：

```bash
npm ls -g --depth=0
```

卸载全局安装模块（卸载后可以使用 `npm ls -g` 查看之前安装过的全局模块是否还在）：

```bash
npm uninstall -g
```

查看全部 npm 默认设置：

```bash
npm config ls –l
```

（完）
