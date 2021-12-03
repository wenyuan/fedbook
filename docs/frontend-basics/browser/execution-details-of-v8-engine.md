# V8 引擎的执行细节

## V8 引擎解析图

下面这张图来自于 [V8 官方文档](https://v8.dev/blog/scanner)，它描述了 V8 执行的细节 —— JavaScript 源码是如何被解析（Parse 过程）的：

<div style="text-align: center;">
  <img src="./assets/v8-overview.svg" alt="V8 引擎的解析图" style="width: 550px;">
  <p style="text-align: center; color: #888;">（V8 引擎的解析图，图片来源于官方文档）</p>
</div>

* Blink 将源码交给 V8 引擎，Stream 获取到源码并且进行编码转换。
* Scanner 会进行词法分析（lexical analysis），词法分析会将代码转换成 tokens。
* 接下来 tokens 会被转换成 AST 树，经过 Parser 和 PreParser：
  * Parser 就是直接将 tokens 转成 AST 树架构。
  * PreParser 称之为预解析，为什么需要预解析呢？
    * 这是因为并不是所有的 JavaScript 代码，在一开始时就会被执行。那么对所有的 JavaScript 代码进行解析，必然会影响网页的运行效率；
    * 所以 V8 引擎就实现了 **Lazy Parsing（延迟解析）**的方案，它的作用是**将不必要的函数进行预解析**，也就是只解析暂时需要的内容（比如知道内部函数的函数名叫 `inner`），而对**函数的全量解析**是在**函数被调用时**才会进行；
    * 比如我们在一个函数 `outer` 内部定义了另外一个函数 `inner`，那么 `inner` 函数就会进行预解析。
* 生成 AST 树后，会被 Ignition 转成字节码（ByteCode），之后的过程就是[代码的执行过程](#代码的执行过程)。

::: tip 小工具
通过 [AST Explorer](https://astexplorer.net/) 在线小工具，可以观察 JS 语法经过转换后的 AST 是长什么样的。
:::

## 代码的执行过程

简单分析一下 JavaScript 代码的执行过程，更详细的内容我在 [JavaScript 系列](/frontend-basics/javascript/)中有专门的梳理。

TODO...
