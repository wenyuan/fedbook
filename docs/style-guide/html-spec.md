# HTML 规范

## 属性顺序

HTML 属性应当按照以下给出的顺序依次排列，确保代码的易读性。

* `class`
* `id`，`name`
* `data-*`
* `src`，`for`，`type`，`href`，`value`
* `title`，`alt`
* `role`，`aria-*`

class 用于标识高度可复用组件，因此应该排在首位。

id 用于标识具体组件，应当谨慎使用（例如，页面内的书签），因此排在第二位。

## class 命名

* `class` 必须单词全字母小写，单词间以 `-` 分隔。
* `class` 必须代表相应模块或部件的内容或功能，不得以样式信息进行命名。
* 避免过度任意的简写。`.btn` 代表 `button`，但是 `.s` 不能表达任何意思。
* 基于最近的父 class 或基本（base） class 作为新 class 的前缀。

## id 命名

* 元素 `id` 必须保证页面唯一。
* `id` 建议单词全字母小写，单词间以 `-` 分隔。同项目必须保持风格一致。
*  `id`、`class` 命名，在避免冲突并描述清楚的前提下尽可能短。

## name 命名

* 同一页面，应避免使用相同的 `name` 与 `id`。
* `name` 一般与后端 model 中的字段名命名规则保持一致。
  * 例如 Java 使用小驼峰命名法（camelCase），Python使用下划线 `_` 连接两个小写单词。

解释：

IE 浏览器会混淆元素的 `id` 和 `name` 属性， `document.getElementById` 可能获得不期望的元素。所以在对元素的 `id` 与 `name` 属性的命名需要非常小心。

一个比较好的实践是，为 `id` 和 `name` 使用不同的命名法。

## 标签类型属性

不需要为 CSS、JS 指定类型属性，HTML5 中默认已包含。

推荐：

```html
<link rel="stylesheet" href="" >
<script src=""></script>
```

不推荐：

```html
<link rel="stylesheet" type="text/css" href="" >
<script type="text/javascript" src="" ></script>
```
