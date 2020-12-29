# CSS 规范

## 声明顺序

相关的属性声明应当归为一组，并按照下面的顺序排列：

* Positioning（元素定位）
* Box model（盒模型）
* Typographic（字体排版）
* Visual（颜色视觉）
* Misc（其它杂项）

解释：

由于定位（positioning）可以从正常的文档流中移除元素，并且还能覆盖盒模型（box model）相关的样式，因此排在首位。盒模型排在第二位，因为它决定了组件的尺寸和位置。

其他属性只是影响组件的 内部 或者是不影响前两组属性，因此排在后面。

示例：

```css
.declaration-order {
  /* Positioning */
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;

  /* Box-model */
  display: block;
  float: right;
  width: 100px;
  height: 100px;

  /* Typography */
  font: normal 13px "Helvetica Neue", sans-serif;
  line-height: 1.5;
  color: #333;
  text-align: center;

  /* Visual */
  background-color: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 3px;

  /* Misc */
  opacity: 1;
}
```

完整的属性列表及其排列顺序请参考 [Bootstrap property order for Stylelint](https://github.com/twbs/stylelint-config-twbs-bootstrap/blob/master/css/index.js)。

## 媒体查询的位置

将媒体查询放在尽可能相关规则的附近。不要将他们打包放在一个单一样式文件中或者放在文档底部。如果你把他们分开了，将来只会被大家遗忘。

示例：

```css
.element { ... }
.element-avatar { ... }
.element-selected { ... }

@media (min-width: 480px) {
  .element { ...}
  .element-avatar { ... }
  .element-selected { ... }
}
```

## 注释规范

#### 单行注释

注释内容第一个字符和最后一个字符都是一个空格字符，单独占一行，行与行之间相隔一行。

推荐：

```css
/* Comment Text */
.jdc {}

/* Comment Text */
.jdc {}
```

#### 模块注释

注释内容第一个字符和最后一个字符都是一个空格字符，`/*` 与模块信息描述占一行，多个横线分隔符 `-` 与 `*/` 占一行，行与行之间相隔两行。

推荐：

```css
/* Module A
---------------------------------------------------------------- */
.mod-a {}


/* Module B
---------------------------------------------------------------- */
.mod-b {}
```

不推荐：

```css
/* Module A ---------------------------------------------------- */
.mod-a {}
/* Module B ---------------------------------------------------- */
.mod-b {}
```

#### 文件信息注释

在样式文件编码声明` @charset` 语句下面注明页面名称、作者、创建日期等信息。

推荐：

```css
@charset "UTF-8";
/**
 * @desc File Info
 * @author Author Name
 * @date 2020-12-29
 */
```
