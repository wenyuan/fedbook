# HTML 基本结构

## 基本结构

现在绝大多数前端开发都是使用下面的结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>页面名称 - 产品中文全称 - 官方网站 - 前端修炼小册</title>
  <meta name="keywords" content="产品名,专题名,专题相关名词,之间用英文半角逗号隔开">
  <meta name="description" content="不超过150个字符，描述内容要和页面内容相关。">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="/css/index.css"/>
  <link rel="shortcut icon" href="/img/favicon.ico"/>
</head>
<body>
  页面源代码内容
</body>
<script src="/js/index.js"></script>
</html>
```

* `<!DOCTYPE html>` 是 HTML5 的文档声明，必须位于文档最前面位置。
* `<html lang="en">` 是一个 HTML 页面的根元素，lang 设置为 `en` ，页面也可以输出中文，只是浏览器会提示是否需要翻译此页，如果改成 `zh-CN` 就没有翻译的选项了。
* `<head>` 这个元素包含关于文档的元信息。
* `<meta>` 定义文档元数据，常用来描述当前页面的特性，比如文档字符集 `charset="utf-8"`。
  * [常用 meta 整理](https://segmentfault.com/a/1190000002407912 "常用 meta 整理")
* `<title>` 该元素指定该文档的标题。
* `<body>` 该元素包含可见页面的所有内容。

## 主流元素分类

* 根元素

  html
  
* 元数据元素

  head、base、meta、title、link、style

* 分区元素
  
  body、header、footer、aside、main、nav、section、article、h1~h6、hgroup、address

* 块文本元素
  
  div、p、ol、ul、li、dd、dl、dt、hr、blockquote、figcaption、figure

* 内联文本元素
  
  a、span、br、abbr、cite、code、small、time、bdi、bdo、data、dfn、kbd、mark、q、rb、rp、rt、rtc、ruby、samp、u、var、wbr

* 媒体元素
 
  audio、img、video、map、track、area

* 内嵌元素

  embed、iframe、object、param、picture、source

* 脚本元素

  canvas、script、noscript

* 编辑标识元素

  del、ins

* 表格元素
  
  table、caption、thead、tbody、tfoot、tr、th、td、colgroup、col

* 表单元素
  
  form、label、input、button、select、datalist、optgroup、option、textarea、fieldset、legend、meter、output、progress

* 交互元素
  
  details、dialog、menu、summary

* Web 组件
  
  template、slot

（完）
