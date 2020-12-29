# 代码风格

团队关于代码风格必须遵循两个基本原则：少数服从多数、用工具统一风格。

<hr>

Tips：

* 在一个项目中，永远遵循同一套编码规范。
* 这里整理的代码风格我在个人项目中遵循的，具体需要根据所在团队和项目的变化而调整。
* 参与和维护其他人的项目时，秉承入乡随俗的原则，尊重别人代码的风格习惯。

<hr>

在制定代码风格指南时，主要借鉴了一些大厂和开源组织的前端代码规范： 

* [腾讯](https://tgideas.qq.com/doc/index.html "TGideas 文档库")
* [京东](https://guide.aotu.io/index.html "凹凸实验室")（比较齐全）
* [百度](https://github.com/ecomfe/spec "spec")
* [网易](http://nec.netease.com/standard "NEC")
* [Airbnb](https://github.com/airbnb/javascript "Airbnb")
* [JavaScript Standard Style](https://github.com/standard/standard "JavaScript Standard Style")
* [Vue.js 风格指南](https://cn.vuejs.org/v2/style-guide/ "Vue.js 风格指南")
* [Bootstrap 编码规范](https://codeguide.bootcss.com/ "Bootstrap 编码规范")
* [ES6 编程风格](https://es6.ruanyifeng.com/#docs/style "Prettier")

<hr>

用工具统一风格是一个很好的选择：

* [ESLint](https://cn.eslint.org/ "ESLint 中文网")
* [Prettier](https://prettier.io/ "Prettier")

ESLint 和 Prettier 区别：

* ESLint（包括其他一些 Lint 工具）主要解决的是**代码质量问题**。
* Prettier 主要解决的是**代码风格问题**。

代码质量出问题意味着程序有潜在 Bug（未使用变量、三等号、全局变量声明等），而风格问题充其量也只是看着不爽（单行代码长度、tab 长度、空格、逗号表达式等）。

一般可以使用 Prettier + ESLint 来同时解决两个问题，但需要通过 `eslint-config-prettier` 插件来解决两个规则同时使用时的冲突问题。

<div style="text-align: right">
  <svg t="1607526012170" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10484" width="64" height="64"><path d="M737.6 356.608a8.96 8.96 0 0 1 12.096-1.472l235.712 175.36a18.688 18.688 0 0 1 2.88 2.688v0.064a15.808 15.808 0 0 1-2.88 23.04l-235.712 175.36c0 2.56-1.28 4.928-3.328 6.464a8.96 8.96 0 0 1-12.096-1.472 7.936 7.936 0 0 1 1.536-11.456v-83.2c0-2.56 1.28-4.928 3.328-6.464l123.776-92.16-123.776-92.096a7.808 7.808 0 0 1-3.328-6.4V361.6c0-1.792 0.64-3.584 1.792-4.992z m-458.112-3.2c4.736-0.064 8.64 3.584 8.64 8.128v83.2c0 2.56-1.28 4.864-3.328 6.4L161.024 543.36l123.776 92.16c2.112 1.472 3.328 3.84 3.328 6.272v83.328c0 1.792-0.64 3.584-1.792 4.992a8.96 8.96 0 0 1-12.096 1.472L38.528 556.16a15.872 15.872 0 0 1 0-25.792l235.712-175.296a8.704 8.704 0 0 1 5.248-1.728z" fill="#101A33" p-id="10485"></path><path d="M672.576 192H599.936a8.704 8.704 0 0 0-8.192 5.44v0.064L342.72 885.184a8.128 8.128 0 0 0 5.312 10.368c0.96 0.32 1.92 0.448 2.88 0.448h72.96a8.704 8.704 0 0 0 8.192-5.44v-0.064l0.768-2.176 248.064-685.44a8.192 8.192 0 0 0-5.504-10.432A9.28 9.28 0 0 0 672.64 192z" fill="#107CEE" p-id="10486"></path></svg>
</div>
