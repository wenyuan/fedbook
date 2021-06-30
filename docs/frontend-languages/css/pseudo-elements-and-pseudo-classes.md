# 伪元素和伪类

## 伪元素

### 伪元素写法

有时候我们想选择的页面区域不是通过元素来表示的（比如想选择一段话的第一个字），而我们也不想为此给页面添加额外的标记。CSS 为这种情况提供了一些特殊选择符，叫作伪元素。  

伪元素是一个附加至选择符末的关键词，允许你对被选择元素的特定部分修改样式。  

常用的伪元素如下表所示：  

|属性|描述|
|:-- |:--|
|::first-letter|选择一段文本的第一个字符添加特殊样式。|
|::first-line|选择一段文本的第一行添加特殊样式。|
|::before|在元素之前添加内容。|
|::after|在元素之后添加内容。|

### 伪元素应用

通过 `content` 属性，在文本前插入一个引号。  

```css
.chapter::before {
  content: '" ';
  font-size: 15em;
}
```

### 伪元素注意事项

* 为了与伪类区分开来，伪元素应该使用双冒号语法（尽管浏览器也兼容但冒号写法）。  

## 伪类

伪类选择符的语法是以有一个冒号开头，用于选择元素的特定状态或关系。  

### 状态伪类

有时候，我们想基于文档结构以外的情形来为页面添加样式，比如基于超链接或表单元素的状态。这时候就可以使用伪类选择符。  

一些最常见的用于超链接的伪类列举如下：

```css
/* 未访问过的链接为蓝色 */
a:link {
  color: blue;
}
/* 访问过的链接为绿色 */
a:visited {
  color: green;
}
/* 链接在鼠标悬停及获取键盘焦点时为红色 */
a:hover,
a:focus {
  color: red;
}
/* 活动状态时为紫色 */
a:active {
  color: purple;
}
```

以上伪类的先后次序很重要，应该始终满足正确的顺序：爱恨原则（lvha）—— 因爱（love）生恨（hate）。

> :link、:visited、:hover、:focus 和 :active

### 目标伪类

目标伪类 `:target`，它匹配的元素有一个 ID 属性，而且该属性的值出现在当前页面 URL 末尾的井号（#）后边。[最常见的应用](https://www.w3school.com.cn/tiy/t.asp?f=css_sel_target)就是页面锚点跳转后，给当前选中的元素增加样式。  

### 反选伪类

反选伪类 `:not()`，专门用于排除某些选择符，可以配合各种放到括号中的选择符使用，不过伪元素和它自身除外。 

实例：  
```css
/* 选择所有不是段落（p）的元素 */
:not(p) {
  color: blue;
}
```

### 结构化伪类

CSS3 新增了一大批与文档结构有关的新伪类。其中最常见的是 `nth-child` 选择符，可以用来交替地为表格行应用样式。  

考虑到现在手写表格的情况不多，就不展开描述了。[详情点击此处](https://www.w3school.com.cn/cssref/selector_nth-child.asp)。

### 表单伪类

还有很多伪类专门用于选择表单元素。这些伪类根据用户与表单控件交互的方式，来反映表单控件的某种状态。  

UI 库泛滥的今天，我们很少在实际业务中手动写这些样式，所以也不展开多讲。[详情点击此处](https://www.runoob.com/css/css-pseudo-classes.html)。

## 区别

* 伪元素创建一个文档树以外的元素，而伪类的操作对象是文档树中已有的元素。
* CSS3 规范中要求使用双冒号(`::`) 表示伪元素，单冒号(`:`) 表示伪类。

## 参考资料

* 《精通CSS 高级Web标准解决方案（第3版）》
* [MDN 伪元素](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements)
* [MDN 伪类](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes)
* [菜鸟教程伪类](https://www.runoob.com/css/css-pseudo-classes.html)

（完）
