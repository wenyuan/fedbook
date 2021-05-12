# 虚拟 DOM 与 diff 算法

## 1. 虚拟 DOM

虚拟 DOM（Virtual DOM）的简写为 vdom，它是实现 Vue 和 React 的重要基石。

在 jQuery 及更早的时代，我们需要手动调整 DOM，这是一个非常耗费性能的操作，因此需要自行控制 DOM 操作的时机来优化 jQuery 性能。

DOM 更新非常耗时，但 JS 执行速度很快，因此现代前端框架（如 Vue 和 React）都引入了 vdom 的概念：用 JS 模拟 DOM 结构（vnode），新旧 vnode 对比，得出最小的更新范围，最后更新 DOM。

在数据驱动视图的模式下，vdom 能有效控制 DOM 操作。

<div style="text-align: center;">
  <img src="./assets/dom-js.png" alt="用 JS 模拟 DOM 结构">
  <p style="text-align:center; color: #888;">（用 JS 模拟 DOM 结构）</p>
</div>

## 2. diff 算法

diff 算法是 vdom 中最核心、最关键的部分。

为了将时间复杂度优化到 O(n)，diff 算法的思路是：

* 只比较同一层级，不跨级比较。
* tag 不相同，则直接删掉重建，不再深度比较。
* tag 和 key 两者都相同，则认为是相同节点，不再深度比较。
