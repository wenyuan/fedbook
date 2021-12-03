# 浏览器内核与 JavaScript 引擎

## 浏览器内核

不同的浏览器有不同的内核组成：

* **Gecko**：早期被 Netscape 和 Mozilla Firefox 浏览器浏览器使用。
* **Trident**：微软开发，被 IE4 - IE11 浏览器使用，但是 Edge 浏览器已经转向 Blink。
* **Webkit**：苹果基于 KHTML 开发、开源的，用于 Safari，Google Chrome 之前也在使用。
* **Blink**：是 Webkit 的一个分支，Google 开发，目前应用于 Google Chrome、Edge、Opera 等。
* 等等…

我们经常说的浏览器内核指的是浏览器的排版引擎（layout engine），它负责处理 HTML 和 CSS，所以又被称为浏览器引擎（browser engine）、页面**渲染引擎**（rendering engine）或样版引擎。

## JavaScript 引擎

JavaScript 引擎帮助我们将 JavaScript 代码翻译成 CPU 指令来执行。

比较常见的 JavaScript 引擎有：

* SpiderMonkey：第一款 JavaScript 引擎，由 Brendan Eich 开发（也就是 JavaScript 作者）。
* Chakra：微软开发，用于 IE 浏览器。
* JavaScriptCore：WebKit 中的 JavaScript 引擎，Apple 公司开发。
* V8：Google 开发的强大 JavaScript 引擎，也帮助 Chrome 从众多浏览器中脱颖而出。
* 等等…

## 两者的关系

最初内核的概念包括渲染引擎与 JavaScript 引擎（简称 JS 引擎），目前习惯直接称渲染引擎为内核，JS 引擎独立。

最初：

<div style="text-align: center;">
  <img src="./assets/kernel-and-javascript-engine-before.svg" alt="浏览器内核与 JS 引擎最初的关系">
  <p style="text-align: center; color: #888;">（浏览器内核与 JS 引擎最初的关系）</p>
</div>

因此以前称：Chrome 浏览器使用 Chromium 内核，Blink 渲染引擎，V8 JS 引擎。

目前：

<div style="text-align: center;">
  <img src="./assets/kernel-and-javascript-engine-now.svg" alt="浏览器内核与 JS 引擎目前的关系">
  <p style="text-align: center; color: #888;">（浏览器内核与 JS 引擎目前的关系）</p>
</div>

因此现在称：Chrome 浏览器使用 Blink 内核，V8 JS 引擎。

* **渲染引擎**：Rendering Engine，一般习惯将之称为「浏览器内核」，主要功能是解析 HTML/CSS 进行渲染页面，渲染引擎决定了浏览器如何显示网页的内容以及页面的格式信息。
* **JS 引擎**：专门处理 JavaScript 脚本的虚拟机、解释器，用来解释执行 JS 代码。在早期内核也是包含 JS 引擎的，而现在 JS 引擎越来独立了，可以把它单独提出来。

（完）
