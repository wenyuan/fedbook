# HTML 问题

> 本章节会持续收录 HTML 相关的问题，由笔者凭主观理解作答，答案仅供参考，如有存疑，欢迎提出 PR 进行建议和指正！

[[toc]]

### 1. doctype 的意义是什么

* 让浏览器以标准模式渲染
  * 针对 IE，设置 `width: 200px; padding: 10px;` 时，标准模式下盒子宽度会解析为 `220px`。
  * 让浏览器知道元素的合法性。
  
### 2. HTML XHTML HTML5 的关系

* HTML 属于 SGML
* XHTML 属于 XML，是 HTML 进行 XML 严格化的结果
* HTML5 不属于 SGML 或 XML，比 XHTML 宽松

### 3. HTML5 有什么变化

* 新的语义化元素
* 表单增强
* 新的 API（离线、音视频、图形、实时通信、本地存储、设备能力）
* 分类和嵌套变更

### 4. em 和 i 有什么区别

* em 是语义化的标签，表示强调
* i 是纯样式的标签，表示斜体
* HTML5 中 i 不推荐使用，一般用作图标

### 5. 语义化的意义是什么

* 开发者容易理解
* 机器容易理解结构（搜索、读屏软件）
* 有助于 SEO
* semantic microdata 规范

### 6. 哪些元素可以自闭合

* 表单元素 input
* 图片 img
* 换行 br，水平线 hr
* 元信息 meta link

### 7. HTML 和 DOM 的关系

* HTML 没有结构，仅是字符串
* DOM 由 HTML 解析而来，它是浏览器内存中的树结构
* JavaScript 可以维护 DOM

### 8. property 和 attribute 的区别

* property 是通过 `.value` 直接获取/设置的值，直观显示在输入框中
* property 是通过 `.getAttribute('value')` 和 `.setAttribute('value', 'xxx')` 获取/设置的值，显示在 dom 元素的属性中
* 两者互不影响

### 9. form 的作用有哪些

* 直接提交表单
* 使用 submit/reset 按钮
* 便于浏览器保存表单
* 第三方库可以整体提取值
* 第三方库可以进行表单验证（HTML5 官方的表单验证不需要有 form，但 Angular 这类库需要）
