# 组件渲染与更新

> Vue 原理的三大模块分别为响应式、vdom 和模板编译，前面已经分别学习过，现在通过总结渲染过程来将它们串起来回顾。

## 初次渲染过程

* Step1：解析模板为 render 函数（这步操作或在开发中通过 vue-loader 已完成）
* Step2：触发响应式，监听 data 属性 getter 和 setter（下一步执行 render 函数可能会用到 getter）
* Step3：执行 render 函数，生成 vnode，渲染节点 patch(elem, vnode)

## 更新过程

* Step1：修改 data，触发 setter（前提是该 data 此前在 getter 中已被监听，即模板中被引用的 data）
* Step2：重新执行 render 函数，生成 newVnode
* Step3：更新节点 patch(vnode, newVnode)

其中 vnode 和 newVnode 的最小差异由 patch 的 diff 算法计算。

## 完整流程图

组件渲染与更新的完整流程图如下所示：

* 黄色方框为 render 函数（此时模板已经编译完），它会生成 vnode（绿色 Virtual DOM Tree）。
* 黄色方框在执行 render 时，会触发（Touch）紫色圆圈（Data）里面的 getter。
* 紫色圆圈（Data）里的 getter 触发时，会收集依赖，模板里哪个变量的 getter 被触发了，就会将相应变量观察起来（蓝色圆圈 Watcher）
* 一旦修改了 Data，就会通知 Watcher，如果修改的 data 是之前作为依赖被观察的，则重新触发渲染（re-render）。

<div style="text-align: center;">
  <img src="./assets/component-render-and-update.png" alt="组件渲染与更新">
  <p style="text-align: center; color: #888;">（组件渲染与更新，图来源于官网文档）</p>
</div>

（完）
