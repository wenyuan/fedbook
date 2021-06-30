# 前端修炼小册

<p align="center">
  <img src="/docs/.vuepress/public/img/skills.png" alt="fedbook.cn" width="160" height="160">
</p>

<p align="center">
  <img alt="author" src="https://img.shields.io/badge/author-wenyuan-blue.svg?style=flat-square">
  <img alt="updated" src="https://img.shields.io/badge/update-2021.06-blue.svg?style=flat-square">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square">
  <a href="https://www.wenyuanblog.com/gift.html" target="_blank">
    <img alt="sponsor" src="https://img.shields.io/badge/sponsor-❤-ff69b4.svg?style=flat-square">
  </a>
</p>

## 简介

[在线预览](https://www.fedbook.cn/) | [国内镜像](https://fedbook.gitee.io/)

建立小册的目的：用输出倒逼输入，写文档的过程，是对自己所学知识的沉淀，分享交流的过程是对知识的复盘，这些都能够加深对知识的理解。（[费曼学习法](https://36kr.com/p/1721599983617)）

编写小册的想法：高中时候有摘笔记的习惯，每天都会挤时间抄课堂讲义，但到高考结束都几乎没有翻完那一堆本子。后来发现这是一种比较愚蠢的课堂笔记 —— 什么都记还不如不记。经过一次次的尝试后，觉得根据文章理大纲也比较低效。目前来看，还是通过判断个人对知识点吸收的难易程度去记，更容易自己成长。把认为重要的、容易遗忘的、经常要查阅的记录下来，形成自己的学习小册，定期温故知新。未来需要用到的时候，还能节省时间成本，不用一一百度/Google。

小册与[博客](https://www.wenyuanblog.com/)的区别：

* 博客记录开发经验、读书笔记、生活随笔、理财心得等，涉及面比较广泛。撰写博客的目的是为了留下成长的足迹。
* 小册是个人文档库，系统梳理前端开发的知识脉络，记录学习时自己认为重要或易忘的知识点，更有利于定期回顾。

所以，在学习的过程中，我将筛选过的知识点记录在「前端修炼小册」，作为个人文档库，让每一天都在进步。我坚信：越努力，越幸运。

近期正在学习：前端框架 - webpack（2021-06 ~ 现在）

## 目录

* [简介](#简介)
* [目录](#目录)
* [文章](#文章)
  * [风格指南](#风格指南)
  * [前端语言](#前端语言)
  * [前端框架](#前端框架)
  * [后端语言](#后端语言)
  * [必知必会](#必知必会)
  * [编程进阶](#编程进阶)
  * [手写系列](#手写系列)
  * [面试相关](#面试相关)
* [计划](#计划)
* [支持](#支持)
* [版权信息](#版权信息)
* [鸣谢](#鸣谢)

## 文章

> **持续更新，学习不止**。

### 风格指南

* [文档规范](https://fedbook.cn/style-guide/document/)
* [代码风格](https://fedbook.cn/style-guide/program/)
  * [HTML 规范](https://fedbook.cn/style-guide/program/html-spec/)
  * [CSS 规范](https://fedbook.cn/style-guide/program/css-spec/)
  * [JavaScript 规范](https://fedbook.cn/style-guide/program/javascript-spec/)
  * [Vue 项目规范](https://fedbook.cn/style-guide/program/vuejs-spec/)

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 前端语言

* [HTML](https://fedbook.cn/frontend-languages/html/)
  * [HTML 基本结构](https://fedbook.cn/frontend-languages/html/html-basic-structure/)
  * [语义类标签](https://fedbook.cn/frontend-languages/html/semantic-elements/)
  * 未完结，待更新
* [CSS](https://fedbook.cn/frontend-languages/css/)
  * [CSS 引入方式](https://fedbook.cn/frontend-languages/css/ways-to-insert-css/)
  * [选择器与样式优先级](https://fedbook.cn/frontend-languages/css/selectors-and-selector-priority/)
  * [伪元素和伪类](https://fedbook.cn/frontend-languages/css/pseudo-elements-and-pseudo-classes/)
  * [长度和单位](https://fedbook.cn/frontend-languages/css/length-and-units/)
  * [盒模型](https://fedbook.cn/frontend-languages/css/box-model/)
  * [定位（position）](https://fedbook.cn/frontend-languages/css/position-property/)
  * [浮动（float）](https://fedbook.cn/frontend-languages/css/float-property/)
  * [BFC](https://fedbook.cn/frontend-languages/css/bfc/)
  * [经典布局](https://fedbook.cn/frontend-languages/css/layout/)
  * [Flexbox 布局](https://fedbook.cn/frontend-languages/css/flexbox/)
  * [Grid 布局](https://fedbook.cn/frontend-languages/css/grid/)
  * 未完结，待更新
* [JavaScript](https://fedbook.cn/frontend-languages/javascript/)
  * [数据类型](https://fedbook.cn/frontend-languages/javascript/data-types/)
  * [执行上下文](https://fedbook.cn/frontend-languages/javascript/execution-context/)
  * [作用域](https://fedbook.cn/frontend-languages/javascript/scope/)
  * [闭包](https://fedbook.cn/frontend-languages/javascript/closure/)
  * [this 指向](https://fedbook.cn/frontend-languages/javascript/this-keyword/)
  * [原型与原型链](https://fedbook.cn/frontend-languages/javascript/prototype-and-prototype-chain/)
  * [数组遍历的几种方式](https://fedbook.cn/frontend-languages/javascript/array-iteration/)
  * [对象遍历的几种方式](https://fedbook.cn/frontend-languages/javascript/object-iteration/)
  * [继承的八种方式](https://fedbook.cn/frontend-languages/javascript/inheritance/)
  * [声明函数的六种方式](https://fedbook.cn/frontend-languages/javascript/function-declare/)
  * [调用函数的四种方式](https://fedbook.cn/frontend-languages/javascript/function-invocation/)
  * [同步与异步](https://fedbook.cn/frontend-languages/javascript/sync-and-async/)
  * [事件循环机制，微任务和宏任务的关系](https://fedbook.cn/frontend-languages/javascript/event-loop/)
  * [浅克隆与深克隆](https://fedbook.cn/frontend-languages/javascript/shallow-clone-and-deep-clone/)
  * [函数柯里化](https://fedbook.cn/frontend-languages/javascript/function-currying/)
  * 未完结，待更新

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 前端框架

* [Vue.js](https://fedbook.cn/frontend-frameworks/vuejs/)
  * [基础用法要点](https://fedbook.cn/frontend-frameworks/vuejs/basic-use/)
  * [高级用法特性](https://fedbook.cn/frontend-frameworks/vuejs/advanced-use/)
  * [响应式原理](https://fedbook.cn/frontend-frameworks/vuejs/reactive-data/)
  * [虚拟 DOM 与 diff 算法](https://fedbook.cn/frontend-frameworks/vuejs/virtual-dom-and-diff/)
  * [模板编译](https://fedbook.cn/frontend-frameworks/vuejs/template-compile/)
  * [组件渲染与更新](https://fedbook.cn/frontend-frameworks/vuejs/component-render-and-update/)
  * [前端路由原理](https://fedbook.cn/frontend-frameworks/vuejs/vue-router/)
  * 近期在学习，每日更新
* [Webpack5](https://fedbook.cn/frontend-frameworks/webpack5/)
  * [核心概念](https://fedbook.cn/frontend-frameworks/webpack5/core-concept/)
  * [基本配置](https://fedbook.cn/frontend-frameworks/webpack5/basic-config/)
  * [高级配置](https://fedbook.cn/frontend-frameworks/webpack5/advanced-config/)
  * [性能优化 - 构建速度](https://fedbook.cn/frontend-frameworks/webpack5/performance-optimization-in-build/)
  * [性能优化 - 产出代码](https://fedbook.cn/frontend-frameworks/webpack5/performance-optimization-in-output/)
  * [最佳实践 - 通用模板](https://fedbook.cn/frontend-frameworks/webpack5/generic-template/)

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 后端语言

* [Python](https://fedbook.cn/backend-languages/python/)
  * [编译器与解释器](https://fedbook.cn/backend-languages/python/compiler-and-interpreter/)
  * [语法规范](https://fedbook.cn/backend-languages/python/grammar/)
  * [变量与常量](https://fedbook.cn/backend-languages/python/variables-and-constants/)
  * [数据类型](https://fedbook.cn/backend-languages/python/data-types/)
  * [函数参数](https://fedbook.cn/backend-languages/python/function-params/)
  * [函数装饰器](https://fedbook.cn/backend-languages/python/function-decorators/)
  * [面向对象编程](https://fedbook.cn/backend-languages/python/oop/)
  * [类和实例](https://fedbook.cn/backend-languages/python/class-and-instance/)
  * [类的继承](https://fedbook.cn/backend-languages/python/class-inheritance/)
  * [类成员保护](https://fedbook.cn/backend-languages/python/class-access-modifiers/)
  * 未完结，待更新

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 必知必会

* [Nginx](https://fedbook.cn/basic-skills/nginx/)
  * [正向代理与反向代理](https://fedbook.cn/basic-skills/nginx/forward-proxy-and-reverse-proxy/)
  * 未完结，待更新

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 编程进阶

* [数据结构与算法](https://fedbook.cn/advanced-programming/algorithm/)
  * [复杂度分析](https://fedbook.cn/advanced-programming/algorithm/complexity-analysis/)
  * [数据结构之数组](https://fedbook.cn/advanced-programming/algorithm/array/)
  * [数据结构之链表](https://fedbook.cn/advanced-programming/algorithm/linked-list/)
  * 学习计划调整，延后学习

### 手写系列

* [JavaScript 手写函数](https://fedbook.cn/handwritten/javascript/)
  * [实现防抖函数（debounce）](https://fedbook.cn/handwritten/javascript/实现防抖函数-debounce/)
  * [实现节流函数（throttle）](https://fedbook.cn/handwritten/javascript/实现节流函数-throttle/)
  * [实现浅克隆（shallowClone）](https://fedbook.cn/handwritten/javascript/实现浅克隆-shallow-clone/)
  * [实现深克隆（deepClone）](https://fedbook.cn/handwritten/javascript/实现深克隆-deep-clone/)
  * [实现 instanceof 运算符](https://fedbook.cn/handwritten/javascript/实现instanceof运算符/)
  * [实现 Object.create 方法](https://fedbook.cn/handwritten/javascript/实现object-create方法/)
  * [实现 new 运算符](https://fedbook.cn/handwritten/javascript/实现new运算符/)
  * [实现 call 方法](https://fedbook.cn/handwritten/javascript/实现call方法/)
  * [实现 apply 方法](https://fedbook.cn/handwritten/javascript/实现apply方法/)
  * [实现 bind 方法](https://fedbook.cn/handwritten/javascript/实现bind方法/)
  * 未完结，待更新

### 面试相关

TODO...

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

## 计划

这个仓库完全开源，它不是什么官方文档，仅仅是一份个人学习小册，用于知识点的梳理。

每块知识点是本人一边学习一边总结的，可能会存在错误，希望大家能够「**带着怀疑的态度**」去阅读，如果对内容有不同的看法，可以在 [留言板](https://github.com/wenyuan/fedbook/issues/new?title=【讨论】此处填写文章标题&body=-%20文章标题：%0A-%20文章链接：%0A-%20我的疑问/观点：%0A-%20推荐资料： "留言版") 提出，或者提交 PR，大家互相学习、共同进步。

我将持续更新这个仓库的内容。独学而无友，则孤陋而寡闻，期待你能和我一起交流。

## 支持

如果本仓库对你有帮助，可以通过以下几种方式支持我一下：

* 给我一个小星星 ⭐️
* 提交 Issues 或 PR
* [送我一本书](https://www.wenyuanblog.com/gift.html)

## 版权信息

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2020-present, WenYuan

## 鸣谢

感谢广大行业前辈、教育工作者和知识传播者，得益于你们的探索，我们能够站在巨人的肩膀上去学习。

本仓库内容也借鉴了不少业内的资料，我会在每篇文章后单独列出，仅在这里统一表达感激之情。

也感谢女友的支持和理解，平时忙于工作和学习，多少会疏于陪伴。

最后，既然选择了这一行业，那就不停地学习吧。生命不息，奋斗不止，感谢你正在访问本仓库，让我们一起加油吧！

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>
