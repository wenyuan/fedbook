# 浮动（float）

## 1. float 属性的取值

* left：元素向左浮动
* right：元素向右浮动
* 默认值，元素不会浮动，并会显示在其文本中出现的位置

## 2. 特性

* 浮动元素会从普通文档流中脱离，但浮动元素影响的不仅是自己，它会影响周围的元素对其进行环绕；
* 不管一个元素是行内元素还是块级元素，只要被设置了浮动，那浮动元素就会形成一个块级框，可以设置它的宽度和高度。

## 3. 浮动元素的展示规则

### 3.1 规则

* 浮动元素在浮动的时候，其 margin 不会超过包含块的 padding  
  （PS：如果想要元素超出，可以设置 margin 属性）
* 如果两个元素一个向左浮动，一个向右浮动，左浮动元素的 margin-right 不会和右浮动元素的 margin-left 相邻
* 如果有多个浮动元素，浮动元素会按顺序排下来而不会发生重叠
* 如果有多个浮动元素，后面的元素高度不会超过前面的元素，并且不会超过包含块
* 如果有非浮动元素和浮动元素同时存在，并且非浮动元素在前，则浮动元素不会高于非浮动元素
* 浮动元素会尽可能地向顶端对齐、向左或向右对齐

### 3.2 详解

#### （1）浮动元素在浮动的时候，其 margin 不会超过包含块的 padding

这句话的意思是，浮动元素的浮动位置不能超过包含块的内边界，它的活动范围是父级的 content 区域。如下例所示，橙色方块设置 `margin: 0;`，但由于它的父级元素设置了 `padding: 10px;`，故橙色方块始终与左边有 10px 的间距。

如果想要元素超出，可以设置 margin 属性。即如果给橙色方块设置 `margin: -10px;` 与父级元素的内边距属性对冲，那么橙色方块就可以与左边界贴边显示。

::: demo [vanilla]
```html
<html>
  <div class="float-demo-1">
    <div class="box">
      <span class="rule1">浮动元素</span>
    </div>
  </div>
</html>

<style>
.float-demo-1 .box {
  background: #00ff90;
  padding: 10px;
  width: 500px;
  height: 150px;
}
.float-demo-1 .rule1 {
  float: left;
  margin: 0;
  padding: 10px;
  background: #ff6a00;
  width: 100px;
  text-align: center;
}
</style>
```
:::

#### （2）如果两个元素一个向左浮动，一个向右浮动，左浮动元素的 margin-right 不会和右浮动元素的 margin-left 相邻

情况一：当包含块的宽度大于两个浮动元素的宽度总和，此时两个元素一个向左浮动，一个向右浮动。如下所示：

::: demo [vanilla]
```html
<html>
  <div class="float-demo-2">
    <div class="box">
      <span class="rule1">浮动元素1</span>
      <span class="rule2">浮动元素2</span>
    </div>
  </div>
</html>

<style>
.float-demo-2 .box {
  background: #00ff90;
  padding: 10px;
  width: 500px;
  height: 150px;
}
.float-demo-2 .rule1 {
  float: left;
  margin: 0;
  padding: 10px;
  background: #ff6a00;
  width: 100px;
  text-align: center;
}
.float-demo-2 .rule2 {
  float: right;
  margin: 0;
  padding: 10px;
  background: #ff6a00;
  width: 100px;
  text-align: center;
}
</style>
```
:::

情况二：当包含块的宽度小于两个浮动元素的宽度总和，此时后面的浮动元素将会向下浮动，其顶端是前面浮动元素的底端。如下所示：

::: demo [vanilla]
```html
<html>
  <div class="float-demo-3">
    <div class="box">
      <span class="rule1">浮动元素1</span>
      <span class="rule2">浮动元素2</span>
    </div>
  </div>
</html>

<style>
.float-demo-3 .box {
  background: #00ff90;
  padding: 10px;
  width: 500px;
  height: 150px;
}
.float-demo-3 .rule1 {
  float: left;
  margin: 0;
  padding: 10px;
  background: #ff6a00;
  width: 300px;
  text-align: center;
}
.float-demo-3 .rule2 {
  float: right;
  margin: 0;
  padding: 10px;
  background: #ff6a00;
  width: 300px;
  text-align: center;
}
</style>
```
:::

#### （3）如果有多个浮动元素，浮动元素会按顺序排下来而不会发生重叠

这个很好理解，为了显示好看，给浮动元素设置 `margin: 10px;`，否则它们会紧挨着排布。如下所示：

::: demo [vanilla]
```html
<html>
  <div class="float-demo-4">
    <div class="box">
      <span class="rule1">浮动元素1</span>
      <span class="rule1">浮动元素2</span>
      <span class="rule1">浮动元素3</span>
    </div>
  </div>
</html>

<style>
.float-demo-4 .box {
  background: #00ff90;
  padding: 10px;
  width: 500px;
  height: 150px;
}
.float-demo-4 .rule1 {
  float: left;
  margin: 10px;
  padding: 10px;
  background: #ff6a00;
  width: 100px;
  text-align: center;
}
</style>
```
:::

#### （5）如果有非浮动元素和浮动元素同时存在，并且非浮动元素在前，则浮动元素不会高于非浮动元素