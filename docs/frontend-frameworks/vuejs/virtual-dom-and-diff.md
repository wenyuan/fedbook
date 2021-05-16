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

为了将时间复杂度优化到 `O(n)`，大部分前端框架中实现 diff 算法的思路是：

* 只比较同一层级，不跨级比较。
* tag 不相同，则直接删掉重建，不再深度比较。
* tag 和 key 两者都相同，则认为是相同节点，不再深度比较。

## 3. snabbdom

[snabbdom](https://github.com/snabbdom/snabbdom) 是一个简洁强大的 vdom 库，源码简短，总体代码行数不超过 500 行。Vue 在实现 vdom 和 diff 时也或多或者参考了它，因此可以通过 snabbdom 学习 vdom。

### 3.1 Example 解读

参考 snabbdom 官方仓库中 README 里的 Example，下面列出几个比较关键的代码块，并附上注释：

```javascript
// 引用和初始化一些列包
import { 
  // 省略模块名
} from "snabbdom";
const patch = init([
  // 省略模块名
]);

// 空节点/DOM 元素，作为容器
const container = document.getElementById("container");

// h 函数会返回一个 vdom，它是一个用 JS 模拟 DOM 元素
const vnode = h(参数1, 参数2, 参数3);
// 初次渲染：将 vnode 渲染到空元素中
patch(container, vnode);

const newVnode = h(参数1, 参数2, 参数3);
// DOM 更新：更新已有的元素
patch(vnode, newVnode);
```

关键的三要素：

* `h` 函数：由 snabbdom 提供，有 3 个参数（标签，data，子元素）
* vnode 数据结构：由 h 函数返回，是一个用 JS 模拟 DOM 元素
* `patch` 函数：由 snabbdom 提供，用于将 vdom（第二个参数） 渲染到容器（第一个参数）上

### 3.2 生成 vnode 的源码

vnode 是由 `h` 函数生成的，该函数的源码位于 `src/h.ts`。

该文件内部主要定义了 `h` 函数可以接收的各种参数形式和参数类型，经过一系列处理后，最后返回了一个新的函数 `vnode` 函数，位于 `src/vnode.ts`。

在 `src/vnode.ts` 文件中，一开始也是一堆定义，主要看最后一段，如下：

```typescript
export function vnode(
  sel: string | undefined,
  data: any | undefined,
  children: Array<VNode | string> | undefined,
  text: string | undefined,
  elm: Element | Text | undefined
): VNode {
  const key = data === undefined ? undefined : data.key;
  return { sel, data, children, text, elm, key };
}
```

该函数最终返回的是一个对象 `{ sel, data, children, text, elm, key }`：

* `sel`，`data`，`children`，`text` 就是前面提到的，其中 `children`，`text` 不能共存（一个标签元素下要么是文本字符串，要么是子元素）。
* `elm` 是 vnode 对应的 DOM 元素，即 `patch` 函数需要渲染的目标元素。
* `key` 类似于 `v-for` 的 `key`。
