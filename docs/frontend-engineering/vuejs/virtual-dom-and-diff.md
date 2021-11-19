# 虚拟 DOM 与 diff 算法

## 虚拟 DOM

虚拟 DOM（Virtual DOM）的简写为 vdom，它是实现 Vue 和 React 的重要基石。

在 jQuery 及更早的时代，我们需要手动调整 DOM，这是一个非常耗费性能的操作，因此需要自行控制 DOM 操作的时机来优化 jQuery 性能。

DOM 更新非常耗时，但 JS 执行速度很快，因此现代前端框架（如 Vue 和 React）都引入了 vdom 的概念：用 JS 模拟 DOM 结构（vnode），新旧 vnode 对比，得出最小的更新范围，最后更新 DOM。

在数据驱动视图的模式下，vdom 能有效控制 DOM 操作。

<div style="text-align: center;">
  <img src="./assets/dom-to-js.png" alt="用 JS 模拟 DOM 结构">
  <p style="text-align:center; color: #888;">（用 JS 模拟 DOM 结构）</p>
</div>

## diff 算法

diff 算法是 vdom 中最核心、最关键的部分。

为了将时间复杂度优化到 `O(n)`，大部分前端框架中实现 diff 算法的思路是：

* 只比较同一层级，不跨级比较。
* tag 不相同，则直接删掉重建，不再深度比较。
* tag 和 key 两者都相同，则认为是相同节点，不再深度比较。

## snabbdom

[snabbdom](https://github.com/snabbdom/snabbdom) 是一个简洁强大的 vdom 库，源码简短，总体代码行数不超过 500 行。Vue 在实现 vdom 和 diff 时也或多或者参考了它，因此可以通过 snabbdom 学习 vdom。

::: warning
以下内容仅是学习大体思路，非细抠源代码。
:::

### Example 解读

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

### 生成 vnode 的源码

vnode 是由 `h` 函数生成的，该函数的源码位于 `src/h.ts`。

该文件内部主要定义了 `h` 函数可以接收的各种参数形式和参数类型，经过一系列处理后，最后返回了一个新的函数 `vnode` 函数，位于 `src/vnode.ts`。

在 `src/vnode.ts` 文件中，一开始也是一堆定义，主要看最后一段，如下（官方仓库的最新源码可能会实时变动）：

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

### patch 函数的源码

`patch` 函数位于 `src/init.ts` 中的最后（官方仓库的最新源码可能会实时变动）。

```typescript
// patch 函数的第一个参数可以是 vnode 或 element，第二个参数是 vnode
return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {
  let i: number, elm: Node, parent: Node;
  const insertedVnodeQueue: VNodeQueue = [];
  // cbs 即 callbacks，pre 是一个 hook（生命周期）
  for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

  // 第一个参数不是 vnode
  if (!isVnode(oldVnode)) {
    // 创建一个空的 vnode，关联到这个 DOM 元素
    oldVnode = emptyNodeAt(oldVnode);
  }

  // 相同的 vnode（key 和 sel 都相等视为相同的 vnode）
  // 都为 undefined 也是相同
  if (sameVnode(oldVnode, vnode)) {
    // 对比 vnode，渲染
    patchVnode(oldVnode, vnode, insertedVnodeQueue);

  // 不同的 vnode，直接删掉重建
  } else {
    elm = oldVnode.elm!;
    parent = api.parentNode(elm) as Node;

    // 重建
    createElm(vnode, insertedVnodeQueue);

    if (parent !== null) {
      api.insertBefore(parent, vnode.elm!, api.nextSibling(elm));
      removeVnodes(parent, [oldVnode], 0, 0);
    }
  }

  for (i = 0; i < insertedVnodeQueue.length; ++i) {
    insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i]);
  }
  for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
  return vnode;
};
```

### patchVnode 函数的源码

上述 `patch` 函数中调用了一个 `patchVnode` 来对比新旧 vnode，该方法也是位于 `src/init.ts` 中（官方仓库的最新源码可能会实时变动）。

```typescript
function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
  // 执行 prepatch hook
  const hook = vnode.data?.hook;
  hook?.prepatch?.(oldVnode, vnode);

  // 设置 vnode.elm：新的 vnode 也需要知道自己的 elm
  const elm = (vnode.elm = oldVnode.elm)!;

  // 旧 vnode 的 children（以下简称旧 children）
  const oldCh = oldVnode.children as VNode[];
  // 新 vnode 的 children（以下简称新 children）
  const ch = vnode.children as VNode[];

  if (oldVnode === vnode) return;

  // hook 相关，先不管
  if (vnode.data !== undefined) {
    for (let i = 0; i < cbs.update.length; ++i)
      cbs.update[i](oldVnode, vnode);
    vnode.data.hook?.update?.(oldVnode, vnode);
  }

  // vnode.text === undefined（即此时 vnode.children 有值）
  // 一般情况下，vnode 的子元素为 text 或 children，都为 undefined 的情况需要在下面做兼容处理
  if (isUndef(vnode.text)) {
    // 新旧都有 children
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
    // 新 children 有，旧 children 无（旧 text 有）
    } else if (isDef(ch)) {
      // 清空旧 text
      if (isDef(oldVnode.text)) api.setTextContent(elm, "");
      // 添加 children
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
    // 旧 children 有，新 children 无
    } else if (isDef(oldCh)) {
      // 移除旧 children
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    // 旧 text 有
    } else if (isDef(oldVnode.text)) {
      // 清空新 text
      api.setTextContent(elm, "");
    }

  // else：vnode.text !== undefined（即此时 vnode.children 无值）
  // 且新旧的 text 不一样
  } else if (oldVnode.text !== vnode.text) {
    // 移除旧 children
    if (isDef(oldCh)) {
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    }
    // 设置新 text
    api.setTextContent(elm, vnode.text!);
  }
  hook?.postpatch?.(oldVnode, vnode);
}
```

### updateChildren 函数的源码

上述 `patchVnode` 函数中，当新旧 vnode 都有 `children` 时，需要将两者的 `children` 进行对比，调用了 `updateChildren`，该方法也是位于 `src/init.ts` 中（官方仓库的最新源码可能会实时变动）。

snabbdom 中对比旧子节点数组（以下简称 oldCh）和新子节点数组（以下简称 newCh）的方式是，先将 oldCh 的第一个元素与 newCh 的第一个元素进行对比，如果不一样，就将两者最后一个元素进行对比，如果依然不一样，就将两者的首元素和末元素进行对比。如果上述四种情况的比对都不成功，就拿当前 newCh 中的这个节点去逐一比对 oldCh 中的每个节点。

值得注意的是，在 Vue 和 React 中不是使用的这种对比方法，这里只是一种实现思路。

```typescript
function updateChildren(
  parentElm: Node,
  oldCh: VNode[],
  newCh: VNode[],
  insertedVnodeQueue: VNodeQueue
) {
  // oldCh 和 newCh 是两个数组，这里的 start 和 end 表示数组的起始和结束
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx: KeyToIndexMap | undefined;
  let idxInOld: number;
  let elmToMove: VNode;
  let before: any;

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];

    // 起始 oldCh 和起始 newCh 对比
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
      // 每次对比完后，指针进行加减，直到 start 和 end 的 idx 相等
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];

    // 结束 oldCh 和结束 newCh 对比
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];

    // 开始 oldCh 和结束 newCh 对比
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
      api.insertBefore(
        parentElm,
        oldStartVnode.elm!,
        api.nextSibling(oldEndVnode.elm!)
      );
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];

    // 结束 oldCh 和开始 newCh 对比
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
      api.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];

    // 以上四个都未命中
    } else {
      if (oldKeyToIdx === undefined) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      // 拿当前新节点的 key，逐一对比 oldCh 中的每个元素，看能否对应上某个节点的 key
      idxInOld = oldKeyToIdx[newStartVnode.key as string];
      // 没对应上
      if (isUndef(idxInOld)) {
        // 当前 newCh 中的这个节点是个新节点，则直接创建
        api.insertBefore(
          parentElm,
          createElm(newStartVnode, insertedVnodeQueue),
          oldStartVnode.elm!
        );
      // 对应上了
      } else {
        // 对应上 key 的节点
        elmToMove = oldCh[idxInOld];
        // 判断 sel 是否相等（sameNode 的条件是 key 和 sel 都相等）
        if (elmToMove.sel !== newStartVnode.sel) {
          // 是个新节点，直接直接创建
          api.insertBefore(
            parentElm,
            createElm(newStartVnode, insertedVnodeQueue),
            oldStartVnode.elm!
          );
        // sel 相等，key 相等
        } else {
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
          oldCh[idxInOld] = undefined as any;
          api.insertBefore(parentElm, elmToMove.elm!, oldStartVnode.elm!);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
      addVnodes(
        parentElm,
        before,
        newCh,
        newStartIdx,
        newEndIdx,
        insertedVnodeQueue
      );
    } else {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }
}
```

（完）
