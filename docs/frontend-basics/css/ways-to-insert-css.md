# CSS 引入方式

## 1. 引入方式

css 引入页面的方式有三种：

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

* **导入样式**：通过 CSS 提供的 @import 语法导入样式表

```css
@import url("index.css")
```

## 2. link 和 import 的区别


