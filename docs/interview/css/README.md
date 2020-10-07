# CSS 问题

> 本章节会持续收录 CSS 相关的问题，由笔者凭主观理解作答，答案仅供参考，如有存疑，欢迎提出 PR 进行建议和指正！

[[toc]]

### 1. CSS 样式（选择器）的优先级

* 计算权重确定
* 带 `!important` 属性的优先级是最高的，唯一能覆盖它的是再加一个带 `!important` 属性的样式
* 内联样式（直接写在元素属性上的样式）优先级高
* 后写的优先级高

### 2. 什么是雪碧图

把网站上用到的一些图片整合到一张单独的图片中，在需要用到图片的时候，通过 CSS 属性` background-image` 组合 `background-repeat`，`background-position` 等来实现图片的显示。

最重要的是通过 `background-position` 调整背景图的位置，并通过容器的宽高共同作用，来选出所需的图片。

### 3. 雪碧图的作用

* 减少 HTTP 请求数，提高加载性能
* 有一些情况下可以减少图片大小（合并后的图片体积 < 每个图片加起来的体积）

### 4. 自定义字体的使用场景

* 宣传/品牌/banner 等固定文案
* 字体图标

### 5. base64 的使用

* 把图片变成文本的形式，用于减少 HTTP 请求
* 适用于小图片
* base64 的体积约为原图 4/3（会增大）

### 6. 伪类和伪元素的区别

* 伪类表示状态（`:link`、`:visited`、`:hover`、`:focus` 和 `:active` 等）
* 伪元素是真的有元素（`::before`、`::after` 等），在页面中可以显示内容
* 伪类使用单冒号，伪元素使用双冒号

### 7. 如何美化 checkbox

* `label` 的 `for` 属性绑定 `input` 的 `id`（这样点击 `label`，`checkbox` 的选中状态也会联动变化）

```html {3}
<div class="my-checkbox">
  <input type="checkbox" id="category">
  <label for="category">CSS</label>
</div>
```

* 隐藏 `input`
* 样式都写在 `label` 上

```css
.my-checkbox input {
  display: none;
}
.my-checkbox input:checked + label {
  background-image: url("./checkbox2.png");
}
.my-checkbox input + label {
  background: url("./checkbox1.png") left center no-repeat;
  background-size: 20px 20px;
  padding-left: 20px;
}
```

### 8. 实现两栏（三栏）布局的方法

* 表格布局（或 `display: table`）
* float + margin 布局
* inline-block 布局
* flexbox 布局

### 9. position: absolute / fixed 有什么区别

都是一种绝对定位的方式，主要区别是参照物不同。

* 前者相对最近的 absolute / relative 元素进行定位
* 后者相对屏幕（viewport）进行定位

### 10. display: inline-block 的间隙

原因：在 html 代码中存在字符间距，即换行或空格会占据一定的位置。

两种解决方案：

* 除去当前元素的空格或换行（将元素写在一行）
* 给父元素设置 `font-size: 0`，给子元素设置需要的 `font-size` 值

### 11. 为什么要清除浮动

浮动的元素不会占据父元素的布局空间，因此有可能浮动元素会超出父元素，从而对其它元素产生影响。

所以父元素要清除浮动。

### 12. 如何清除浮动

设置超出之后的行为：`overflow: hidden` 或 `overflow: auto`

或

在浮动元素后面加一个元素，让父元素包含浮动元素：`::after {clear: both}`

### 13. 如何适配移动端页面

* 必须添加 viewport，让页面宽度等于移动端宽度
* rem / viewport / media query
* 设计上：隐藏、折行、自适应
