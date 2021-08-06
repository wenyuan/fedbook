# CSS 规范

## 样式文件

样式文件必须写上 `@charset` 规则，并且一定要在样式文件的第一行首个字符位置开始写，编码名用 `"UTF-8"`。

推荐：

```css
@charset "UTF-8";
.jdc {}
```

不推荐：

```css
/* @charset 规则不在文件首行首个字符开始 */
@charset "UTF-8";
.jdc {}

/* @charset 规则没有用小写 */
@CHARSET "UTF-8";
.jdc {}

/* 无@charset规则 */
.jdc {}
```

## 代码格式化

样式书写一般有两种：一种是紧凑格式（Compact），一种是展开格式（Expanded）。

推荐：展开格式（Expanded）

```css
.jdc {
  display: block;
  width: 50px;
}
```

不推荐：紧凑格式（Compact）

```css
.jdc { display: block; width: 50px;}
```

## 代码大小写

样式选择器，属性名，属性值关键字全部使用小写字母书写，属性字符串允许使用大小写。

推荐：

```css
.jdc {
  display: block;
}
```

不推荐：

```css
.JDC {
  DISPLAY: BLOCK;
}
```

## 代码易读性

* 左括号与类名之间一个空格，冒号与属性值之间一个空格。

推荐：

```css
.jdc {
  width: 100%;
}
```

不推荐：

```css
.jdc{
  width:100%;
}
```

* 逗号分隔的取值，逗号之后一个空格。

推荐：

```css
.jdc {
  box-shadow: 1px 1px 1px #333, 2px 2px 2px #ccc;
}
```

不推荐：

```css
.jdc {
  box-shadow: 1px 1px 1px #333,2px 2px 2px #ccc;
}
```

* 为单个 CSS 选择器或新声明开启新行。

推荐：

```css
.jdc, .jdc_logo, .jdc_hd {
  color: #ff0;
}

.nav{
  color: #fff;
}
```

不推荐：

```css
.jdc, .jdc_logo, .jdc_hd {
  color: #ff0;
}.nav{
  color: #fff;
}
```

* 颜色值 `rgb()`、`rgba()`、`hsl()`、`hsla()`、`rect()` 中不需有空格，且取值不要带有不必要的 `0`。

推荐：

```css
.jdc {
  color: rgba(255,255,255,.5);
}
```

不推荐：

```css
.jdc {
  color: rgba( 255, 255, 255, 0.5 );
}
```

* 颜色属性值十六进制数值能用简写的尽量用简写。

推荐：

```css
.jdc {
  color: #fff;
}
```

不推荐：

```css
.jdc {
  color: #ffffff;
}
```

* 不要为 `0` 指明单位。

推荐：

```css
.jdc {
  margin: 0 10px;
}
```

不推荐：

```css
.jdc {
  margin: 0px 10px;
}
```

## 属性值引号

CSS 属性值需要用到引号时，统一使用单引号。

推荐：

```css
.jdc {
  font-family: 'Hiragino Sans GB';
}
```

不推荐：

```css
.jdc {
  font-family: "Hiragino Sans GB";
}
```

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

## CSS3 浏览器私有前缀

CSS3 浏览器私有前缀在前，标准前缀在后。

```css
.jdc {
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  -o-border-radius: 10px;
  -ms-border-radius: 10px;
  border-radius: 10px;
}
```

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

### 单行注释

注释内容第一个字符和最后一个字符都是一个空格字符，单独占一行，行与行之间相隔一行。

推荐：

```css
/* Comment Text */
.jdc {}

/* Comment Text */
.jdc {}
```

不推荐：

```css
/*Comment Text*/
.jdc {
  display: block;
}

.jdc {
  display: block;/*Comment Text*/
}
```

### 模块注释

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

### 文件注释

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

（完）
