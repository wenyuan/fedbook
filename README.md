# 前端修炼小册

<p align="center">
  <img src="/docs/.vuepress/public/img/skills.png" alt="fedbook.cn" width="160" height="160">
</p>

<p align="center">
  <img alt="author" src="https://img.shields.io/badge/author-wenyuan-blue.svg?style=flat-square">
  <img alt="updated" src="https://img.shields.io/badge/update-2022.05-blue.svg?style=flat-square">
  <img alt="license" src="https://img.shields.io/badge/license-CC BY NC 4.0-blue.svg?style=flat-square">
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

近期正在学习：React（2022-04-15 ~ 现在）

## 目录

* [简介](#简介)
* [目录](#目录)
* [文章](#文章)
  * [技术规范](#技术规范)
  * [前端知识](#前端知识)
  * [工程化](#工程化)
  * [必知必会](#必知必会)
  * [深入学习](#深入学习)
  * [后端知识](#后端知识)
  * [项目相关](#项目相关)
* [计划](#计划)
* [支持](#支持)
* [版权信息](#版权信息)
* [鸣谢](#鸣谢)

## 文章

> **持续更新，学习不止**。

### 技术规范

* [版本控制](https://fedbook.cn/style-guide/version-control/)
  * [版本号定义规范](https://fedbook.cn/style-guide/version-control/version-number/)
  * [Git 工作流 — 分支策略](https://fedbook.cn/style-guide/version-control/git-workflow/)
  * [Git 提交信息规范](https://fedbook.cn/style-guide/version-control/git-commit-message/)
* [代码风格](https://fedbook.cn/style-guide/program/)
  * [HTML 规范](https://fedbook.cn/style-guide/program/html-spec/)
  * [CSS 规范](https://fedbook.cn/style-guide/program/css-spec/)
  * [JavaScript 规范](https://fedbook.cn/style-guide/program/javascript-spec/)
  * [Vue 项目规范](https://fedbook.cn/style-guide/program/vuejs-spec/)
  * [Code Review](https://fedbook.cn/style-guide/program/code-review/)
* [文档规范](https://fedbook.cn/style-guide/document/)
* [接口设计](https://fedbook.cn/style-guide/apis/)
* [文案指南](https://fedbook.cn/style-guide/product/)
  * [B 端产品文案指南](https://fedbook.cn/style-guide/version-control/tob/)

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 前端知识

* [HTML](https://fedbook.cn/frontend-knowledge/html/)
  * [HTML 基本结构](https://fedbook.cn/frontend-knowledge/html/html-basic-structure/)
  * [语义类标签](https://fedbook.cn/frontend-knowledge/html/semantic-elements/)
  * 其它知识点，待后续继续补充
* [CSS](https://fedbook.cn/frontend-knowledge/css/)
  * [CSS 引入方式](https://fedbook.cn/frontend-knowledge/css/ways-to-insert-css/)
  * [选择器与样式优先级](https://fedbook.cn/frontend-knowledge/css/selectors-and-selector-priority/)
  * [伪元素和伪类](https://fedbook.cn/frontend-knowledge/css/pseudo-elements-and-pseudo-classes/)
  * [长度和单位](https://fedbook.cn/frontend-knowledge/css/length-and-units/)
  * [盒模型](https://fedbook.cn/frontend-knowledge/css/box-model/)
  * [定位（position）](https://fedbook.cn/frontend-knowledge/css/position-property/)
  * [浮动（float）](https://fedbook.cn/frontend-knowledge/css/float-property/)
  * [BFC](https://fedbook.cn/frontend-knowledge/css/bfc/)
  * [经典布局](https://fedbook.cn/frontend-knowledge/css/layout/)
  * [Flexbox 布局](https://fedbook.cn/frontend-knowledge/css/flexbox/)
  * [Grid 布局](https://fedbook.cn/frontend-knowledge/css/grid/)
  * 其它知识点，待后续继续补充
* [JavaScript](https://fedbook.cn/frontend-knowledge/javascript/)
  * **JavaScript 核心**
  * [数据类型](https://fedbook.cn/frontend-knowledge/javascript/data-types/)
  * [栈空间和堆空间](https://fedbook.cn/frontend-knowledge/javascript/stack-and-heap/)
  * [执行上下文和调用栈](https://fedbook.cn/frontend-knowledge/javascript/execution-context/)
  * [作用域](https://fedbook.cn/frontend-knowledge/javascript/scope/)
  * [闭包](https://fedbook.cn/frontend-knowledge/javascript/closure/)
  * [this 指向](https://fedbook.cn/frontend-knowledge/javascript/this-keyword/)
  * [原型与原型链](https://fedbook.cn/frontend-knowledge/javascript/prototype-and-prototype-chain/)
  * [垃圾回收](https://fedbook.cn/frontend-knowledge/javascript/gc/)
  * [同步与异步](https://fedbook.cn/frontend-knowledge/javascript/sync-and-async/)
  * [事件循环机制](https://fedbook.cn/frontend-knowledge/javascript/event-loop/)
  * [浅克隆与深克隆](https://fedbook.cn/frontend-knowledge/javascript/shallow-clone-and-deep-clone/)
  * [高阶函数](https://fedbook.cn/frontend-knowledge/javascript/higher-order-function/)
  * **JavaScript 专题**
  * [数组遍历的几种方式](https://fedbook.cn/frontend-knowledge/javascript/array-iteration/)
  * [对象遍历的几种方式](https://fedbook.cn/frontend-knowledge/javascript/object-iteration/)
  * [继承的八种方式](https://fedbook.cn/frontend-knowledge/javascript/inheritance/)
  * [声明函数的六种方式](https://fedbook.cn/frontend-knowledge/javascript/function-declare/)
  * [调用函数的四种方式](https://fedbook.cn/frontend-knowledge/javascript/function-invocation/)
  * 其它知识点，待后续继续补充
* [ES6 - ES12 新特性](https://fedbook.cn/frontend-knowledge/es6-and-beyond/)
  * [ECMAScript2015(ES6)](https://fedbook.cn/frontend-knowledge/es6-and-beyond/es6-let-const/)
  * [ECMAScript2016(ES7)](https://fedbook.cn/frontend-knowledge/es6-and-beyond/es7-array/)
  * [ECMAScript2017(ES8)](https://fedbook.cn/frontend-knowledge/es6-and-beyond/es8-async-await/)
  * [ECMAScript2018(ES9)](https://fedbook.cn/frontend-knowledge/es6-and-beyond/es9-for-await-of/)
  * [ECMAScript2019(ES10)](https://fedbook.cn/frontend-knowledge/es6-and-beyond/es10-object/)
  * [ECMAScript2020(ES11)](https://fedbook.cn/frontend-knowledge/es6-and-beyond/es11-string/)
  * [ECMAScript2021(ES12)](https://fedbook.cn/frontend-knowledge/es6-and-beyond/es12-string/)
* [TypeScript](https://fedbook.cn/frontend-knowledge/typescript/)
  * **TypeScript 基础**
  * [基础类型](https://fedbook.cn/frontend-knowledge/typescript/basic-types/)
  * [字面量类型](https://fedbook.cn/frontend-knowledge/typescript/literal/)
  * [函数](https://fedbook.cn/frontend-knowledge/typescript/function/)
  * [类](https://fedbook.cn/frontend-knowledge/typescript/class/)
  * [接口类型与类型别名](https://fedbook.cn/frontend-knowledge/typescript/interface-and-type/)
  * [联合类型与交叉类型](https://fedbook.cn/frontend-knowledge/typescript/union-and-intersection/)
  * [枚举](https://fedbook.cn/frontend-knowledge/typescript/enum/)
  * [泛型](https://fedbook.cn/frontend-knowledge/typescript/generics/)
  * **TypeScript 进阶**
  * [类型守卫](https://fedbook.cn/frontend-knowledge/typescript/type-guard/)
* [浏览器相关](https://fedbook.cn/frontend-knowledge/browser/)
  * **浏览器工作原理**
  * [浏览器宏观认识](https://fedbook.cn/frontend-knowledge/browser/browser-macro-knowledge/)
  * [浏览器内核与 JavaScript 引擎](https://fedbook.cn/frontend-knowledge/browser/kernel-and-javascript-engine/)
  * [渲染引擎的工作原理](https://fedbook.cn/frontend-knowledge/browser/execution-details-of-rendering-process/)
  * [V8 引擎的工作原理](https://fedbook.cn/frontend-knowledge/browser/execution-details-of-v8-engine/)
  * **浏览器安全**
  * [同源策略](https://fedbook.cn/frontend-knowledge/browser/same-origin-policy/)
  * [跨站脚本攻击（XSS）](https://fedbook.cn/frontend-knowledge/browser/xss/)
  * [CSRF 攻击](https://fedbook.cn/frontend-knowledge/browser/csrf/)
  * [网络安全协议（HTTPS）](https://fedbook.cn/frontend-knowledge/browser/https/)
* [JS 手写](https://fedbook.cn/frontend-knowledge/javascript-handwritten/)
  * **简单手写：函数**
  * [实现防抖函数（debounce）](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现防抖函数-debounce/)
  * [实现节流函数（throttle）](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现节流函数-throttle/)
  * [实现浅克隆（shallowClone）](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现浅克隆-shallow-clone/)
  * [实现深克隆（deepClone）](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现深克隆-deep-clone/)
  * [实现 instanceof 运算符](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现instanceof运算符/)
  * [实现 Object.create 方法](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现object-create方法/)
  * [实现 new 运算符](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现new运算符/)
  * [实现 call 方法](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现call方法/)
  * [实现 apply 方法](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现apply方法/)
  * [实现 bind 方法](https://fedbook.cn/frontend-knowledge/javascript-handwritten/实现bind方法/)
  * 其它知识点，待后续继续补充
  * **复杂手写：类库**
  * [实现符合 Promises/A+ 规范的 Promise](https://fedbook.cn/frontend-knowledge/javascript-handwritten/my-promise/)
  * 其它知识点，待后续继续补充

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 工程化

* [Vue.js](https://fedbook.cn/frontend-engineering/vuejs/)
  * [基础用法要点](https://fedbook.cn/frontend-engineering/vuejs/basic-use/)
  * [高级用法特性](https://fedbook.cn/frontend-engineering/vuejs/advanced-use/)
  * [响应式原理](https://fedbook.cn/frontend-engineering/vuejs/reactive-data/)
  * [虚拟 DOM 与 diff 算法](https://fedbook.cn/frontend-engineering/vuejs/virtual-dom-and-diff/)
  * [模板编译](https://fedbook.cn/frontend-engineering/vuejs/template-compile/)
  * [组件渲染与更新](https://fedbook.cn/frontend-engineering/vuejs/component-render-and-update/)
  * [前端路由原理](https://fedbook.cn/frontend-engineering/vuejs/vue-router/)
* [React](https://fedbook.cn/frontend-engineering/react/)
  * **React 基础** 
  * [React JSX](https://fedbook.cn/frontend-engineering/react/react-jsx/)
  * [React Hooks（内置）](https://fedbook.cn/frontend-engineering/react/react-internal-hooks/)
  * [React Hooks（自定义）](https://fedbook.cn/frontend-engineering/react/react-custom-hooks/)
  * 近期在学习，每日更新
* [Webpack](https://fedbook.cn/frontend-engineering/webpack/)
  * [核心概念](https://fedbook.cn/frontend-engineering/webpack/core-concept/)
  * [基本配置](https://fedbook.cn/frontend-engineering/webpack/basic-config/)
  * [高级配置](https://fedbook.cn/frontend-engineering/webpack/advanced-config/)
  * [性能优化 - 构建速度](https://fedbook.cn/frontend-engineering/webpack/performance-optimization-in-build/)
  * [性能优化 - 产出代码](https://fedbook.cn/frontend-engineering/webpack/performance-optimization-in-output/)
  * [最佳实践 - 通用模板](https://fedbook.cn/frontend-engineering/webpack/generic-template/)

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 必知必会

* [Git](https://fedbook.cn/basic-skills/git/)
  * **Git 知识整理**
  * [常用命令清单](https://fedbook.cn/basic-skills/git/common-command-manual/)
  * [git rebase 的两种用法](https://fedbook.cn/basic-skills/git/git-rebase/)
  * [配置密钥实现免密操作](https://fedbook.cn/basic-skills/git/add-ssh-key/)
  * **Git 常见问题**
  * [clone 速度过慢影响效率](https://fedbook.cn/basic-skills/git/solution-to-clone-too-slow/)
  * [修改 commit 信息](https://fedbook.cn/basic-skills/git/solution-to-commit-info-mistake/)
  * [已 commit 未 push，想修改代码](https://fedbook.cn/basic-skills/git/solution-to-last-commit-code-mistake/)
  * [已 commit 未 push，漏提交文件](https://fedbook.cn/basic-skills/git/solution-to-missed-file-in-last-commit/)
  * [刚刚的 commit 有误，想要撤回](https://fedbook.cn/basic-skills/git/solution-to-withdraw-last-commit/)
  * [刚刚的 push 有误，想要撤回](https://fedbook.cn/basic-skills/git/solution-to-withdraw-last-push/)
  * [pull 时发现代码冲突，如何解决](https://fedbook.cn/basic-skills/git/solution-to-code-conflict/)
  * [如何修改历史 commits 中的用户名和邮箱](https://fedbook.cn/basic-skills/git/solution-to-change-name-and-email-in-history-commits/)
  * [如何迁移仓库并保留 commits 记录](https://fedbook.cn/basic-skills/git/solution-to-migrate-repository-without-losing-history-commits/)
  * [如何参与开源项目 - 提交 PR 与更新 Fork 分支](https://fedbook.cn/basic-skills/git/solution-to-participate-in-open-source-projects/)
  * [如何使用 GitFlow 工作流进行团队协作](https://fedbook.cn/basic-skills/git/solution-to-gitflow/)
* [Nginx](https://fedbook.cn/basic-skills/nginx/)
  * **Nginx 基础知识**
  * [正向代理与反向代理](https://fedbook.cn/basic-skills/nginx/forward-proxy-and-reverse-proxy/)
  * [负载均衡](https://fedbook.cn/basic-skills/nginx/load-balancing/)
  * **Nginx 用法整理**
  * [Nginx 的安装](https://fedbook.cn/basic-skills/nginx/installation-of-nginx/)
  * [Nginx 的卸载](https://fedbook.cn/basic-skills/nginx/uninstallation-of-nginx/)
  * [Nginx 常用命令](https://fedbook.cn/basic-skills/nginx/common-commands/)
  * [Nginx 设置开机自启](https://fedbook.cn/basic-skills/nginx/set-auto-start-after-server-reboot/)
  * [Nginx 配置文件详解](https://fedbook.cn/basic-skills/nginx/config-file-params-explanation/)
  * [Nginx 配置文件模板](https://fedbook.cn/basic-skills/nginx/config-file-generic-template/)
  * [Nginx 安全访问控制](https://fedbook.cn/basic-skills/nginx/ngx-http-access-module/)
  * [Nginx 文件列表功能](https://fedbook.cn/basic-skills/nginx/ngx-http-autoindex-module/)
  * [Nginx 页面安全认证](https://fedbook.cn/basic-skills/nginx/ngx-http-auth-basic-module/)
  * [Nginx 部署 Https 安全认证](https://fedbook.cn/basic-skills/nginx/deploy-https-security-auth/)
  * [Nginx 限流常用模块](https://fedbook.cn/basic-skills/nginx/traffic-limiting-modules/)
  * **Nginx 部署方案**
  * [Nginx 部署前后端分离项目](https://fedbook.cn/basic-skills/nginx/practice-in-front-end-separation-project/)
  * 其它知识点，待后续继续补充
* [Linux](https://fedbook.cn/basic-skills/linux/common-commands/)
  * **Linux 基础知识**
  * [常用命令](https://fedbook.cn/basic-skills/linux/common-commands/)
  * **Linux 常见问题**
  * [vim 中文乱码问题](https://fedbook.cn/basic-skills/linux/solution-to-vim-encoding/) 
* [MySQL](https://fedbook.cn/basic-skills/mysql/)
  * **MySQL 基础知识**
  * [MySQL 数据类型](https://fedbook.cn/basic-skills/mysql/data-types/)
  * [MySQL 主键和自增 ID](https://fedbook.cn/basic-skills/mysql/primary-key-and-increment-id/)
  * **MySQL 日常运维**
  * [MySQL 的安装与卸载](https://fedbook.cn/basic-skills/mysql/installation-of-mysql/)
  * [MySQL 常用命令](https://fedbook.cn/basic-skills/mysql/common-commands/)
  * [MySQL 数据库设计规范](https://fedbook.cn/basic-skills/mysql/db-design-spec/)
  * 其它知识点，待后续继续补充
* [Redis](https://fedbook.cn/basic-skills/redis/)
  * **Redis 基础知识**
  * [Redis 数据类型](https://fedbook.cn/basic-skills/redis/data-types/)
  * [Redis 缓存三大问题](https://fedbook.cn/basic-skills/redis/three-cache-problems/)

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 深入学习

* [数据结构与算法](https://fedbook.cn/in-depth-learning/algorithm/)
  * [复杂度分析](https://fedbook.cn/in-depth-learning/algorithm/complexity-analysis/)
  * [数据结构之数组](https://fedbook.cn/in-depth-learning/algorithm/array/)
  * [数据结构之链表](https://fedbook.cn/in-depth-learning/algorithm/linked-list/)
  * 学习计划调整，延后学习
* [设计模式](https://fedbook.cn/in-depth-learning/design-patterns/)
  * **前置知识**
  * [设计原则](https://fedbook.cn/in-depth-learning/design-patterns/5-principles/)
  * [设计模式简介](https://fedbook.cn/in-depth-learning/design-patterns/23-patterns/)
  * [UML 类图](https://fedbook.cn/in-depth-learning/design-patterns/uml-class-diagram/)
  * **创建型模式**
  * [工厂模式](https://fedbook.cn/in-depth-learning/design-patterns/factory-pattern/)
  * [抽象工厂模式](https://fedbook.cn/in-depth-learning/design-patterns/abstract-factory-pattern/)
  * [建造者模式](https://fedbook.cn/in-depth-learning/design-patterns/builder-pattern/)
  * [单例模式](https://fedbook.cn/in-depth-learning/design-patterns/singleton-pattern/)
  * [原型模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/prototype-pattern/)
  * **结构型模式**
  * [适配器模式](https://fedbook.cn/in-depth-learning/design-patterns/adapter-pattern/)
  * [装饰器模式](https://fedbook.cn/in-depth-learning/design-patterns/decorator-pattern/)
  * [代理模式](https://fedbook.cn/in-depth-learning/design-patterns/proxy-pattern/)
  * [外观模式](https://fedbook.cn/in-depth-learning/design-patterns/facade-pattern/)
  * [桥接模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/bridge-pattern/)
  * [组合模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/composite-pattern/)
  * [享元模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/flyweight-pattern/)
  * **行为型模式**
  * [观察者模式](https://fedbook.cn/in-depth-learning/design-patterns/observer-pattern/)
  * [迭代器模式](https://fedbook.cn/in-depth-learning/design-patterns/iterator-pattern/)
  * [状态模式](https://fedbook.cn/in-depth-learning/design-patterns/state-pattern/)
  * [策略模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/strategy-pattern/)
  * [模板方法模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/template-method-pattern/)
  * [职责链模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/chain-of-responsibility-pattern/)
  * [命令模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/command-pattern/)
  * [备忘录模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/memento-pattern/)
  * [中介者模式(前端不常用)](https://fedbook.cn/in-depth-learning/design-patterns/mediator-pattern/)
  * [访问者模式和解释器模式(不常用)](https://fedbook.cn/in-depth-learning/design-patterns/visitor-pattern-and-interpreter-pattern/)
* [源码阅读与学习](https://fedbook.cn/in-depth-learning/source-code/)
  * [Vue3 源码中的基础工具函数](https://fedbook.cn/in-depth-learning/source-code/vue3-utils/)
  * 抽空学习，不占用主学习进程

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 后端知识

* [Python](https://fedbook.cn/backend-knowledge/python/)
  * **Python 基础**
  * [编译器与解释器](https://fedbook.cn/backend-knowledge/python/compiler-and-interpreter/)
  * [语法规范](https://fedbook.cn/backend-knowledge/python/grammar/)
  * [变量与常量](https://fedbook.cn/backend-knowledge/python/variables-and-constants/)
  * [数据类型](https://fedbook.cn/backend-knowledge/python/data-types/)
  * [函数参数](https://fedbook.cn/backend-knowledge/python/function-params/)
  * [函数装饰器](https://fedbook.cn/backend-knowledge/python/function-decorators/)
  * [面向对象编程](https://fedbook.cn/backend-knowledge/python/oop/)
  * [类和实例](https://fedbook.cn/backend-knowledge/python/class-and-instance/)
  * [类的继承](https://fedbook.cn/backend-knowledge/python/class-inheritance/)
  * [类成员保护](https://fedbook.cn/backend-knowledge/python/class-access-modifiers/)
  * **Python 模块**
  * [使用 xlrd 处理旧版本 Excel](https://fedbook.cn/backend-knowledge/python/python-lib-xlrd/)
  * [使用 openpyxl 处理新版本 Excel](https://fedbook.cn/backend-knowledge/python/python-lib-openpyxl/)
  * [使用 smtplib 发送电子邮件](https://fedbook.cn/backend-knowledge/python/python-lib-smtplib/)
  * [使用 subprocess 执行 cmd](https://fedbook.cn/backend-knowledge/python/python-lib-subprocess/)
  * [使用 telnetlib 执行 Telnet](https://fedbook.cn/backend-knowledge/python/python-lib-telnetlib/)
  * [使用 Paramiko 执行 SSH](https://fedbook.cn/backend-knowledge/python/python-lib-paramiko/)
  * [使用 Fabric 执行 SSH](https://fedbook.cn/backend-knowledge/python/python-lib-fabric/)
  * 其它知识点，待后续继续补充

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>

### 项目相关

* [前端解决方案](https://fedbook.cn/project/solutions/)
  * [前端登录方案总结](https://fedbook.cn/project/solutions/login/)
  * [大文件分片上传和断点续传](https://fedbook.cn/project/solutions/file-upload/)

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

本书采用「保持署名—非商用」创意共享 4.0 许可证。

只要保持原作者署名和非商用，您可以自由地阅读、分享、修改本小册。

详细的法律条文请参见[创意共享](http://creativecommons.org/licenses/by-nc/4.0/)网站。

Copyright (c) 2020-present, WenYuan

## 鸣谢

感谢广大行业前辈、教育工作者和知识传播者，得益于你们的探索，我们能够站在巨人的肩膀上去学习。

本仓库内容也借鉴了不少业内的资料，我会在每篇文章后单独列出，仅在这里统一表达感激之情。

也感谢对象的支持和理解，平时忙于工作和学习，多少会疏于陪伴。

最后，既然选择了这一行业，那就不停地学习吧。生命不息，奋斗不止，感谢你正在访问本仓库，让我们一起加油吧！

<p align=right>
  <a href="#目录">⬆️ 返回顶部</a>
</p>
