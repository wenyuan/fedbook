# HTML 基本结构

现在绝大多数前端开发都是使用下面的结构：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>无标题文档</title>
</head>
<body>
  页面源代码内容
</body>
</html>
```

* `<!DOCTYPE html>` 是 HTML5 的文档声明，必须位于文档最前面位置。
* `<html lang="en">` 是一个 HTML 页面的根元素，lang 设置为 `en` ，页面也可以输出中文，只是浏览器会提示是否需要翻译此页，如果改成 `zh-CN` 就没有翻译的选项了。
* `<head>` 这个元素包含关于文档的元信息。
* `<meta>` 定义文档元数据，常用来描述当前页面的特性，比如文档字符集 `charset="utf-8"`。
  * [常用 meta]()
* `<title>` 该元素指定该文档的标题。
* `<body>` 该元素包含可见页面的所有内容。