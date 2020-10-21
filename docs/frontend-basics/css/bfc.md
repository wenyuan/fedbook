# BFC

## 1. 定义

BFC：Block Formatting Context（块级格式化上下文）

在解释什么什么是 BFC 之前，需要先介绍 Box、Formatting Context 的概念。

### 1.1 Box：CSS 布局的基本单位

Box 是 CSS 布局的对象和基本单位，直观来说，一个页面有很多个 Box 组成的。元素的类型和 display 属性，决定了这个 Box 的类型。不同的 Box，会参与不同的 Formatting Context（一个决定如何渲染文档的容器），因此 Box 内的元素会以不同的方式渲染。

常见盒子：

* block-level box：`display` 属性为 `block`、`list-item`、`table` 的元素，会生成 block-level box
* inline-level box：`display` 属性为 `inline`、`inline-block`、`inline-table` 的元素，会生成 inline-level box
* run-in box：CSS3 特有

PS：这里的 Box 即指盒模型，关于盒模型的具体内容可以查看[盒模型](/frontend-basics/css/box-model/ "盒模型")章节

### 1.2 Formatting Context

Formatting Context 是 W3C CSS2.1 规范中的一个概念。他是页面的一块渲染区域，并且有一套渲染规则，它决定了其子元素如何定位，以及和其他元素的关系和相互作用。

最常见的 Formatting Context 有 Block formatting context 和 Inline formatting context。

* 块级格式化上下文（Block Formatting Context）（BFC）
* 行内格式化上下文（Inline Formatting Context）（IFC）
* 自适应格式化上下文（Flex Formatting Context）（FFC）（CSS3 新增）
* 网格布局格式化上下文（GridLayout Formatting Context）（GFC）（CSS3 新增）

## 2. BFC 布局规则

* 属于同一个 BFC 的两个相邻 Box 在垂直方向排列时，垂直方向的外边距会发生重叠，它们在垂直方向的距离由 margin 决定，取最大值。（如果想要避免外边距的重叠，可以将其放在不同的 BFC 容器中）
* BFC 的区域不会与浮动盒子重叠（清除浮动原理）。
* 计算 BFC 的高度时，浮动元素也参与计算。

## 3. 哪些元素会生成 BFC

只要元素满足下面任一条件即可触发 BFC 特性：

* body 根元素
* 浮动元素（float 属性不为 none）
* 绝对定位元素（position 属性为 absolute 或 fixed）
* 内联块（display 属性为 inline-block）
* 表格单元格（display 属性为 table-cell，HTML 表格单元格默认属性）
* 表格标题（display 属性为 table-caption，HTML 表格单元格默认属性）
* 具有 overflow 且值不是 visible 的块元素
* 弹性盒子（display 属性为 flex 或 inline-flex）
* display: flow-root（CSS 新增的属性，专门用来触发BFC，但浏览器兼容性差）
* column-span: all（原本的作用是让元素横跨所有列。该属性总是会创建一个新的格式化上下文，即便具有 column-span: all 的元素并不被包裹在一个多列容器中）
