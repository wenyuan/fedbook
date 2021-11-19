# CSS 引入方式

## 引入方式

css 引入页面的方式有四种：

* **内联样式**：即行内样式，通过标签的 style 属性，在标签上直接写样式。

```html
<div style="width:100px; height:100px; background:red "></div>
```

* **嵌入样式**：通过 style 标签，在网页上创建嵌入的样式表。

```html
<style type="text/css">
div { 
  width:100px; 
  height:100px; 
  background:red;
}
</style>
```

* **外链样式**：通过 link 标签，链接外部样式文件到页面中。

```html
<link rel="stylesheet" type="text/css" href="index.css">
```

* **导入样式**：通过 CSS 提供的 @import 语法，在样式表中链接其他样式表。

```css
/* 必须出现在样式表中其他的样式之前，否则 @import 引用的样式表不会生效 */
@import url("index.css")
```

## link 和 @import 的区别

* link 是 HTML 提供的标签；@import 是 CSS 提供的语法规则。
* 加载页面时，link 标签引入的 CSS 被同时加载；@import 引入的 CSS 将在页面加载完毕后被加载。
* 浏览器对 link 的兼容性更高，@import 只可以在 IE5+ 才能识别。

注意：网上常说的「link 引入的样式权重大于 @import 引入的样式权重」是不太合理的。

## @import 引入 CSS 的弊端

* **使用 @import 引入 CSS 会影响浏览器的并行下载**<br>
  使用 @import 引用的 CSS 文件只有在引用它的那个 css 文件被下载、解析之后，浏览器才会知道还有另外一个 css 需要下载，这时才去下载，然后下载后开始解析、构建 render tree 等一系列操作。这就导致了浏览器无法并行下载所需的样式文件。

* **多个 @import 会导致下载顺序紊乱**<br>
  在 IE 中，@import 会引发资源文件的下载顺序被打乱，即排列在 @import 后面的 js 文件先于 @import下 载，并且打乱甚至破坏 @import 自身的并行下载。

（完）
