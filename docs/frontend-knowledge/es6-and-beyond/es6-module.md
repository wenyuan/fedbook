# Module

## 模块化的发展

随着项目中引入的 js 文件越来越多，模块化解决的问题：

* 全局变量污染：各个文件的变量都是挂载到 `window` 对象上，污染全局变量。
* 变量重名：不同文件中的变量如果重名，后面的会覆盖前面的，造成程序运行错误。
* 文件依赖顺序：多个文件之间存在依赖关系，需要保证一定加载顺序问题严重。

在模块化思想中，每个 js 文件被看作是一个模块，每个模块通过固定的方式引入，并且通过固定的方式向外暴露指定的内容。一个个模块按照其依赖关系组合，最终插入到主程序中。

模块化的发展历史：

无模块化 --> CommonJS 规范 --> AMD 规范--> CMD 规范--> ES6 模块化

### CommonJS 规范

Commonjs 是 Node 中模块化规范，它的诞生给了 js 模块化发展重要的启发。但是局限性很明显：Commonjs 基于 Node 原生 api 在服务端可以实现模块同步加载，但是仅仅局限于服务端，客户端如果同步加载依赖的话时间消耗非常大，所以需要一个在客户端上基于 Commonjs 但是对于加载模块做改进的方案，于是 AMD 规范诞生了。

```javascript
// utils.js 文件
function add(a,b){
  return a + b
}
module.exports = { add }

// main.js
var nameModule = require('./utils.js') 
nameModule.add(1,2)
```

### AMD 规范

异步模块定义，允许指定回调函数。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到所有依赖加载完成之后（前置依赖），这个回调函数才会运行。

> [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) 是 RequireJS 在推广过程中对模块定义的规范化产出（使用 AMD 必须用到 RequireJS 库函数）。

```javascript
require([module], callback)
```

### CMD 规范

同样是受到 Commonjs 的启发，国内（阿里）诞生了一个 CMD（Common Module Definition）规范。该规范借鉴了 Commonjs 的规范与 AMD 规范，在两者基础上做了改进。

> [CMD](https://github.com/seajs/seajs/issues/242) 是 SeaJS 在推广过程中对模块定义的规范化产出。

AMD 和 CMD 区别：

* AMD 是依赖关系前置，在定义模块的时候就要声明其依赖的模块
* CMD 是按需加载依赖就近，只有在用到某个模块的时候再去 require

```javascript
// AMD 默认推荐的是
define(['./a', './b'], function(a, b) { // 依赖必须一开始就写好
  a.doSomething()
  // 此处略去 100 行
  b.doSomething()
  ...
}) 

// CMD
define(function(require, exports, module) {
  var a = require('./a')
  a.doSomething()
  // 此处略去 100 行
  var b = require('./b') // 依赖可以就近书写
  b.doSomething()
  // ... 
})
```

### ES6 规范

ES6 规范中，将模块化纳入 JavaScript 标准，从此 js 模块化被官方扶正。

在 ES6 中，使用 `import` 关键字引入模块，通过 `exprot` 关键字导出模块，功能较之于前几个方案更为强大。但是由于 ES6 目前无法在浏览器中执行，所以只能通过 babel 将不被支持的 `import` 编译为当前受到广泛支持的 `require`。

## export

模块功能主要由两个命令构成：`export` 和 `import`。`export` 命令用于规定模块的对外接口，`import` 命令用于输入其他模块提供的功能。

一个模块就是一个独立的文件。该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用 `export` 关键字输出该变量。

### 导出变量或者常量

```javascript
export const name = 'zhangsan'
export let addr = 'BeiJing City'
export var list = [1, 2, 3]
```

或者

```javascript
const name = 'zhangsan'
let addr = 'BeiJing City'
var list = [1, 2, 3]
export {
  name,
  addr,
  list
}
```

### 导出函数

```javascript
export function say(content) {
  console.log(content)
}
export function run() {
  console.log('run')
}
```

或者

```javascript
const say = (content) => {
  console.log(content)
}
let run = () => {
  console.log('run')
}
export {
  say,
  run
}
```

### 导出 Object

```javascript
export ({
  code: 0,
  message: 'success'
})
```

或者

```javascript
let data = {
  code: 0,
  message: 'success'
}
export {
  data
}
```

### 导出 Class

```javascript
class Test {
  constructor() {
    this.id = 2
  }
}
export {
  Test
}
```

或者

```javascript
export class Test {
  constructor() {
    this.id = 2
  }
}
```

## as

如果想为输入的变量重新取一个名字，`import` 命令要使用 `as` 关键字，将输入的变量重命名。

```javascript
const name = 'zhangsan'
let addr = 'BeiJing City'
var list = [1, 2, 3]
export {
  name as cname,
  addr as caddr,
  list
}
```

## export default

使用 `import` 命令的时候，用户需要知道所要加载的变量名或函数名，否则无法加载。但是，用户肯定希望快速上手，未必愿意阅读文档，去了解模块有哪些属性和方法。

为了给用户提供方便，让他们不用阅读文档就能加载模块，就要用到 `export default` 命令，为模块指定默认输出。

```javascript
const name = 'zhangsan'
let addr = 'BeiJing City'
var list = [1, 2, 3]
export {
  name as cname,
  addr as caddr
}
export default list
```

* 使用 `export default` 时，对应的 `import` 语句不需要使用大括号。
  * 一个模块只能有一个默认输出，该命令只能使用一次，因此 `import` 命令只可能唯一对应 `export default` 命令，后面才不用加大括号。
* 不使用 `export default` 时，对应的 `import` 语句需要使用大括号。

## import

使用 `export` 命令定义了模块的对外接口以后，其他 JS 文件就可以通过 `import` 命令加载这个模块。

### 直接导入

假设导出模块 A 是这样的：

```javascript
const name = 'zhangsan'
let addr = 'BeiJing City'
var list = [1, 2, 3]
export {
  name as cname,
  addr as caddr
}
export default list
```

则导入：

```javascript
import list, {
  cname,
  caddr
} from A
```

上面代码中：

* `list` 是使用 `export default` 导出的，对应的 `import` 语句不需要使用大括号。
* 其他的是使用 `export` 导出的，对应的 `import` 语句需要使用大括号。

### 修改导入名称

```javascript
import list, {
  cname as name,
  caddr
} from A
```

### 批量导入

```javascript
import list, * as mod from A
console.log(list)
console.log(mod.cname)
console.log(mod.caddr)
```

## 参考文档

* [Module 的语法](https://es6.ruanyifeng.com/#docs/module)
* [import, export, default cheatsheet](https://hackernoon.com/import-export-default-require-commandjs-javascript-nodejs-es6-vs-cheatsheet-different-tutorial-example-5a321738b50f)

（完）
