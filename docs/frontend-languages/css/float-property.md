# 浮动（float）

## float 属性的取值

* left：元素向左浮动
* right：元素向右浮动
* none：默认值，元素不会浮动，并会显示在其文本中出现的位置

## 特性

* 浮动元素会从常规文档流中脱离。如果其兄弟元素为块级元素，该元素会忽视浮动元素并占据它的位置，但内部的文字和其他行内元素都会环绕浮动元素；如果兄弟元素为内联元素，则元素会环绕浮动元素排列。
* 不管一个元素是行内元素还是块级元素，只要被设置了浮动，那浮动元素就会形成一个块级框，可以设置它的宽度和高度，同时它的 margin 值也可以设置 top 和 bottom 了。

## 浮动元素的展示规则

### 规则

* 浮动元素在浮动的时候，其 margin 不会超过包含块的 padding  
  （PS：如果想要元素超出，可以设置 margin 属性）
* 如果两个元素一个向左浮动，一个向右浮动，左浮动元素的 margin-right 不会和右浮动元素的 margin-left 相邻
* 如果有多个浮动元素，浮动元素会按顺序排下来而不会发生重叠
* 如果有多个浮动元素，后面的元素高度不会超过前面的元素，并且不会超过包含块
* 如果有非浮动元素和浮动元素同时存在，并且非浮动元素在前，则浮动元素不会高于非浮动元素
* 浮动元素会尽可能地向顶端对齐、向左或向右对齐

### 详解

#### 1）浮动元素在浮动的时候，其 margin 不会超过包含块的 padding

这句话的意思是，浮动元素的浮动位置不能超过包含块的内边界，它的活动范围是父级的 content 区域。如下例所示，橙色方块设置 `margin: 0;`，但由于它的父级元素设置了 `padding: 10px;`，故橙色方块始终与左边有 10px 的间距。

如果想要元素超出，可以设置 margin 属性。即如果给橙色方块设置 `margin: -10px;` 与父级元素的内边距属性对冲，那么橙色方块就可以与左边界贴边显示。

示例如下：

<iframe height="278" style="width: 100%;" scrolling="no" title="XWKMRZG" src="https://codepen.io/winyuan/embed/XWKMRZG?height=278&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/XWKMRZG'>XWKMRZG</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

#### 2）如果两个元素一个向左浮动，一个向右浮动，左浮动元素的 margin-right 不会和右浮动元素的 margin-left 相邻

这句话的意思是，两个浮动方向相反的元素是怎样都不会接触在一起的，但根据包含块的宽度大小，会有两种情况的表现。

情况一：当包含块的宽度大于两个浮动元素的宽度总和，此时两个元素一个向左浮动，一个向右浮动。

示例如下：

<iframe height="274" style="width: 100%;" scrolling="no" title="css-float-demo-2" src="https://codepen.io/winyuan/embed/LYZWyMp?height=274&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/LYZWyMp'>css-float-demo-2</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

情况二：当包含块的宽度小于两个浮动元素的宽度总和，此时后面的浮动元素将会向下浮动，其顶端是前面浮动元素的底端。

示例所示：

<iframe height="274" style="width: 100%;" scrolling="no" title="css-float-demo-3" src="https://codepen.io/winyuan/embed/wvWJdNy?height=274&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/wvWJdNy'>css-float-demo-3</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

#### 3）如果有多个浮动元素，浮动元素会按顺序排下来而不会发生重叠

这句话的意思是，下一个浮动元素会紧贴着上一个浮动元素的 右 / 左边界，如果同时向左浮动，那下一个浮动元素就会紧贴上一个浮动元素的右外边界，反之亦然。

如果下一个浮动元素被挤到了下一行，那它的 左 / 右外边界就会紧贴父元素的 左 / 右 内边距。

示例如下：

<iframe height="271" style="width: 100%;" scrolling="no" title="css-float-demo-4" src="https://codepen.io/winyuan/embed/mdEWmom?height=271&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/mdEWmom'>css-float-demo-4</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

#### 4）如果有多个浮动元素，后面的元素高度不会超过前面的元素，并且不会超过包含块

即：浮动元素的顶端不能比自前所有浮动元素或块级元素的顶端更高，如果多个元素浮动同一个方向，他们的顶部都是对齐的。

示例见上一条。

#### 5）如果有非浮动元素和浮动元素同时存在，并且非浮动元素在前，则浮动元素不会高于非浮动元素

这条规则是显而易见的，示例如下：

<iframe height="270" style="width: 100%;" scrolling="no" title="css-float-demo-5" src="https://codepen.io/winyuan/embed/yLJMbrG?height=270&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/winyuan/pen/yLJMbrG'>css-float-demo-5</a> by wenyuan
  (<a href='https://codepen.io/winyuan'>@winyuan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

#### 6）浮动元素会尽可能地向顶端对齐、向左或向右对齐

这条规则是显而易见的。

## 重叠问题

重叠问题是指两个元素在同一个位置，会出现上下重叠的问题。将浮动元素的 margin 属性设置为负数就会发生重叠。

* 行内元素与浮动元素发生重叠，其边框，背景和内容都会显示在浮动元素之上。
* 块级元素与浮动元素发生重叠时，边框和背景会显示在浮动元素之下，内容则会显示在浮动元素之上。

## 父元素高度塌陷问题

一个块级元素如果没有设置 height 属性，其高度是由子元素撑开的。如果对子元素设置了浮动，那么子元素就会脱离文档流，也就是说父级元素中没有内容可以撑开其高度，这样父级元素的高度就会被忽略，这就是所谓的高度塌陷。

解决父元素高度塌陷问题就需要清除浮动。

## 清除浮动的方法

### 方法一：给父元素定义高度

* 优点：操作简单
* 缺点：高度被固定死，只适合内容固定不变的模块

原理：给父级元素定义固定高度（height），能解决父级元素无法获取高度的问题。 

### 方法二：使用空元素结合 clear 属性

* 优点：浏览器支持好
* 缺点：页面中会凭空多出很多无用的空节点

原理：在父元素的末尾添加一个空元素（作为最后一个子元素），例如 `<div class="clearfix"></div> (.clearfix { clear: both; })`，利用 CSS 的 `clear:both` 属性清除浮动，让父级元素能够获取高度。

### 方法三：让父元素也一起浮动

* 缺点：无法解决实际问题

### 方法四：父元素设置为 display: table

* 缺点：会产生新的未知问题

原理：将父元素属性强制变成表格。

### 方法五：父元素设置 overflow: hidden 或 auto

* 优点：代码简洁，不存在结构和语义化问题
* 缺点：无法显示溢出的元素

原理：这个方法的关键在于触发了 BFC。在 IE6、IE7、IE8 浏览器中还需要触发 hasLayout（{ overflow: auto; zoom: 1;}）

### 方法六：父元素伪元素清除浮动

* 优点：没有额外标签，代码量也适中，可重复利用率（建议定义公共类）
* 缺点：稍显复杂，但是理解其原理后也挺简单的

原理：IE8 以上和非 IE 浏览器才支持 `:after`，原理和方法二有点类似，`zoom`（IE 专有属性）可解决 IE6、IE7 浮动问题。 

将 clearfix 类名加到浮动元素父级盒子上：

```css
.clearfix::after{
  content: ""; /* 伪元素没有这个属性则无法生效 */
  display: block; /* 只有块级元素才能清除浮动影响 */
  height: 0;
  clear: both;
  visibility: hidden;
}
.clearfix { *zoom: 1; }
```

### 方法七：父元素双伪元素清除浮动

* 优点：代码更简洁
* 缺点：由于 IE6、IE7 不支持 `::after`，使用 `zoom: 1` 触发 hasLayout。

原理：同上。

```css
.clearfix::before,
.clearfix::after { 
  content: ""; /* 伪元素没有这个属性则无法生效 */
  display: block; /* 只有块级元素才能清除浮动影响 */
}
.clearfix::after {
  clear: both;
}
.clearfix {
  *zoom: 1;
}
```

## 浮动的应用

* 文字环绕效果
* 横向菜单排列
* 布局（三栏两列等等）

（完）
