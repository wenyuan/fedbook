# BFC

## 1. 常见定位方案

在讲 BFC 之前，我们先来了解一下常见的定位方案，定位方案用于控制元素的布局，有三种常见方案：

* 普通流（normal flow）

> 在普通流中，元素按照其在 HTML 中的先后位置至上而下布局，在这个过程中，行内元素水平排列，直到当行被占满然后换行，块级元素则会被渲染为完整的一个新行，除非另外指定，否则所有元素默认都是普通流定位，也可以说，普通流中元素的位置由该元素在 HTML 文档中的位置决定。

* 浮动（float）

> 在浮动布局中，元素首先按照普通流的位置出现，然后根据浮动的方向尽可能的向左边或右边偏移，其效果与印刷排版中的文本环绕相似。

* 绝对定位（absolute positioning）

> 在绝对定位布局中，元素会整体脱离普通流，因此绝对定位元素不会对其兄弟元素造成影响，而元素具体的位置由绝对定位的坐标决定。

## 2. BFC 概念

BFC 即 Block Formatting Context（块级格式化上下文），属于前面定位方案中的普通流（normal flow）。

具有 BFC 特性的元素可以看作是一个隔离的独立容器，容器里面的元素不会在布局上影响到外面的元素，并且 BFC 具有普通容器所没有的一些特性。

下面我们再分别介绍下 Box 和 Formatting Context 的概念。

### 2.1 Box：CSS 布局的基本单位

Box 是 CSS 布局的对象和基本单位，直观来说，一个页面有很多个 Box 组成的。元素的类型和 display 属性，决定了这个 Box 的类型。不同的 Box，会参与不同的 Formatting Context（一个决定如何渲染文档的容器），因此 Box 内的元素会以不同的方式渲染。

常见盒子：

* block-level box：`display` 属性为 `block`、`list-item`、`table` 的元素，会生成 block-level box
* inline-level box：`display` 属性为 `inline`、`inline-block`、`inline-table` 的元素，会生成 inline-level box
* run-in box：CSS3 特有

PS：这里的 Box 即指盒模型，关于盒模型的具体内容可以查看[盒模型](/frontend-basics/css/box-model/ "盒模型")章节

### 2.2 Formatting Context

Formatting Context 是 W3C CSS2.1 规范中的一个概念。他是页面的一块渲染区域，并且有一套渲染规则，它决定了其子元素如何定位，以及和其他元素的关系和相互作用。

最常见的 Formatting Context 有 Block formatting context 和 Inline formatting context。

* 块级格式化上下文（Block Formatting Context）（BFC）
* 行内格式化上下文（Inline Formatting Context）（IFC）
* 自适应格式化上下文（Flex Formatting Context）（FFC）（CSS3 新增）
* 网格布局格式化上下文（GridLayout Formatting Context）（GFC）（CSS3 新增）

## 3. BFC 特性及示例

### 3.1 特性

* 同一个 BFC 下外边距会发生折叠
* 计算 BFC 的高度时，浮动元素也参与计算
* BFC 的区域不会与浮动盒子重叠（清除浮动原理）

### 3.2 示例

#### 1）同一个 BFC 下外边距会发生折叠

属于同一个 BFC 的两个相邻 Box 在垂直方向排列时，垂直方向的外边距会发生重叠，它们在垂直方向的距离由 margin 决定，取最大值。（如果想要避免外边距的重叠，可以将其放在不同的 BFC 容器中）

如下示例，因为两个 div 元素都处于同一个 BFC 容器下 (这里指 display: flow-root 的元素) ，所以第一个 div 的下边距和第二个 div 的上边距发生了重叠，两个盒子之间的距离是 10px 而非累加的 20px。

<iframe height="328" style="width: 100%;" scrolling="no" title="css-bfc-demo-1" src="https://codepen.io/winyuan/embed/zYBZwVO?height=328&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/zYBZwVO'>css-bfc-demo-1</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

#### 2）计算 BFC 的高度时，浮动元素也参与计算

由于容器内元素浮动，脱离了文档流，此时如果容器内没有其他非浮动元素撑开高度，就会产生高度塌陷的问题（容器高度为 0）。

如果使容器触发 BFC，那么容器将会包裹住浮动元素，在计算 BFC 的高度时，浮动元素也参与计算。

<iframe height="280" style="width: 100%;" scrolling="no" title="css-bfc-demo-2" src="https://codepen.io/winyuan/embed/yLJMbdZ?height=280&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/yLJMbdZ'>css-bfc-demo-2</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

#### 3）BFC 的区域不会与浮动盒子重叠（清除浮动原理）

先来看一个文字环绕效果：

<iframe height="310" style="width: 100%;" scrolling="no" title="css-bfc-demo-3" src="https://codepen.io/winyuan/embed/JjKWJPG?height=310&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/JjKWJPG'>css-bfc-demo-3</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

这时候其实第二个元素有部分被浮动元素所覆盖（但是文本信息不会被浮动元素所覆盖），如果想避免元素被覆盖，可触第二个元素的 BFC 特性，在第二个元素中加入 `overflow: hidden`，就会变成：

<iframe height="313" style="width: 100%;" scrolling="no" title="css-bfc-demo-4" src="https://codepen.io/winyuan/embed/xxOqrbw?height=313&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/xxOqrbw'>css-bfc-demo-4</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

这个方法可以用来实现两列自适应布局，这时候左边的宽度固定，右边的内容自适应宽度（不指定右边元素的 width 属性）。

## 4. 哪些元素会生成 BFC

只要元素满足下面任一条件即可触发 BFC 特性：

* 根元素（`<html>`）
* 浮动元素（float 属性不为 none）
* 绝对定位元素（position 属性为 absolute 或 fixed）
* 内联块（display 属性为 inline-block）
* 表格单元格（display 属性为 table-cell，HTML 表格单元格默认属性）
* 表格标题（display 属性为 table-caption，HTML 表格单元格默认属性）
* 具有 overflow 且值不是 visible 的块元素
* 弹性盒子（display 属性为 flex 或 inline-flex）
* display: flow-root（CSS 新增的属性，专门用来触发 BFC，但浏览器兼容性差）
* column-span: all（原本的作用是让元素横跨所有列。该属性总是会创建一个新的格式化上下文，即便具有 column-span: all 的元素并不被包裹在一个多列容器中）

## 5. BFC 的应用

* 利用 BFC 避免 margin 重叠
* 自适应两栏布局
* 清除浮动

## 参考资料

* [MDN：块格式化上下文](https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context "块格式化上下文")
