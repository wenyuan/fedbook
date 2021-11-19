# 选择器与样式优先级

## 选择器写法

### 一般选择符

* 类型选择符（通过元素名指定）
* ID 选择符（由井号 `#` 开头）
* 类选择符（由句点 `.` 开头）

可以将类型选择符和类选择符结合使用，以指定特定的 HTML 元素下特定 class 的样式。  

实例：  
```css
p.date-postd {
  color: #ccc;
}
```

### 组合选择符

* 后代选择符（以空格分隔）
* 子选择符（以大于号分隔）
* 相邻同辈选择符（以加号分隔）
* 一般同辈选择符（以波浪号分隔）

#### 后代选择符

后代选择符的写法是在两个选择符之间添加空格，用于选取某个或某组元素的所有后代元素。  

实例：  
```css
/* 只有作为块引用后代的段落元素会被选中，从而缩进，其他段落都不会缩进 */
blockquote p {
  padding-left: 2em;
}
```

#### 子选择符

子选择符的写法是在两个选择符之间添加大于号，与后代选择符不同，它只选择一个元素的直接后代，也就是子元素。  

实例：  
```css
/* 选择了 div 元素中所有直接子元素 p */
div > p {
  background-color: yellow;
}
```

#### 相邻同辈选择符

相邻同辈选择符的写法是在两个选择符之间使用加号，它可以选择**紧接在**某个元素后面，并与该元素拥有共同父元素的元素。  

实例：
```css
/* 选择了 div 元素后的第一个 p 元素 */
div + p {
  background-color: yellow;
}
```
这样选择 div  元素后的第一个段落是可行的，但更简单、更容易维护的方式，还是为这一段增加一个类名。

#### 一般同辈选择符

一般同辈选择符的写法是在两个选择符之间使用波浪号，它可以选择**所有**指定元素之后的相邻兄弟元素。  

实例：
```css
/* 选择了 div 元素后的所有 p 元素 */
div ~ p {
  background-color: yellow;
}
```

注：相邻同辈选择符和一般同辈选择符都不会选择前面的同辈元素，这是因为浏览器会按照元素在页面中出现的先后次序给它们应用样式。

### 通用选择符

通用选择符可以匹配任何元素，使用星号表示。  

实例：
```css
* {
  padding: 0;
  margin:0;
}
```
但这样写可能带来很多意想不到的后果，特别是会影响 button、select 等表单元素。如果想重设样式，最好还是像下面这样明确指定元素：  
```css
h1, h2, h3, h4, h5, h6,
ul, ol, li, dl, p {
  padding: 0;
  margin: 0;
}
```

### 属性选择符

属性选择符基于元素是否有某个属性或者属性是否有某个值来选择元素。

#### 根据是否有某个属性

实例：  
当鼠标指针悬停在某个带有 `title` 属性的元素上时，多数浏览器都会显示一个提示条。利用这种行为，可以借助 `<abbr>` 元素对某些缩写词给出详尽的解释：
```html
<p>I'm reading a book called you don't know <abbr title="JavaScript">js</abbr>.</p>
```
可是，如果不把鼠标放在这个元素上，谁也不知道它还会显示缩写词的解释。为此，可以使用属性选择符给带有 `title` 属性的 `abbr` 元素添加不同的样式，比如在缩写词下面加一条点划线，然后把悬停状态的鼠标指针改成问好。
```css
abbr[title] {
  border-bottom: 1px dotted #999;
}

abbr[title]:hover {
  cursor: help;
}
```

#### 根据属性是否有某个值

除了可以根据是否存在某个属性来选择元素，还可以根据特定的属性值来应用样式。  

实例：  
下面这个例子可以用来修正一个问题，即鼠标悬停在提交按钮上时，不同浏览器显示的光标不一致。有了这条规则，所有 `type` 属性值为 `submit` 的 `input` 元素在鼠标指针悬停时，都会显示一个手状光标。

```css
input[type="submit"] {
  cursor: pointer;
}
```

有时候我们关心的是属性值是否匹配某个模式，而非某个特定值。这时候，通过给属性选择符中的等号前面加上特殊字符，就可以表达出想要匹配的值的形式了。  

在属性选择符中常用的特殊字符如下表所示：

|选择器|描述|
|:--- |:--|
|`a[href^="http:"`]|要匹配以某些字符开头的属性值，在等号前面加上插入符（`^`）。|
|`img[src$=".jpg"`]|要匹配以某些字符结尾的属性值，在等号前面加上美元符号（`$`）。|
|`a[href*="/about/"]`|要匹配包含某些字符的属性值，在等号前面加上星号（`*`）。|
|`a[rel~=next]`|要匹配以空格分隔的字符串中属性值（比如 `rel` 属性的值），在等号前面加上波浪号（`~`）。|
|`a[lang|=en]`|要匹配开头是指定值或者指定值后连着一个短划线的情况，比如 `en` 和 `en-us`，在等号前面加上竖线（`|`）。这种方式不常用。|

更多：[CSS 选择器参考手册](https://www.w3school.com.cn/cssref/css_selectors.asp "CSS 选择器参考手册")

## 样式优先级

当声明冲突时，CSS 会根据三种条件来决定样式优先级：

* **样式表的来源**：

  行内样式 > 嵌入样式 > 外链样式

* **选择器优先级**：
  * 如果选择器的 ID 数量更多，则它会胜出（即它更明确）。
  * 如果 ID 数量一致，那么拥有最多类的选择器胜出。
  * 如果以上两次比较都一致，那么拥有最多标签名的选择器胜出。

* **源码顺序**：

  如果两个声明的来源和优先级相同，那么后出现的样式（在样式表中出现较晚，或者位于页面较晚引入的样式表中）会覆盖先出现的样式。<br>
  例如：`link（链接）`、`visited（访问）`、`hover（悬停）`、`active（激活）`，就得严格遵守这个顺序，否则会带来意想不到的结果。

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="815.0000305175781" height="253" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1074" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1075" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1078" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1079" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1082" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1083" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1086" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1087" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1090" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1091" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1094" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1095" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1098" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1099" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker></defs><g id="SvgjsG1008" transform="translate(25.000015258789062,52.00000762939453)"><path id="SvgjsPath1009" d="M 16.666666666666668 0L 83.33333333333333 0C 105.55555555555556 0 105.55555555555556 50 83.33333333333333 50L 16.666666666666668 50C -5.555555555555556 50 -5.555555555555556 0 16.666666666666668 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="80px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="15.05" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="16" x="50"><tspan id="SvgjsTspan1013" style="text-decoration:;">冲突的声明</tspan></tspan></text></g></g><g id="SvgjsG1014" transform="translate(168.00001525878906,25.00000762939453)"><path id="SvgjsPath1015" d="M 0 52L 61 0L 122 52L 61 104L 0 52Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="102px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.05" transform="rotate(0)"><tspan id="SvgjsTspan1018" dy="16" x="61"><tspan id="SvgjsTspan1019" style="text-decoration:;">不同的来源</tspan></tspan><tspan id="SvgjsTspan1020" dy="16" x="61"><tspan id="SvgjsTspan1021" style="text-decoration:;">或者重要性</tspan></tspan></text></g></g><g id="SvgjsG1022" transform="translate(332.00001525878906,25.00000762939453)"><path id="SvgjsPath1023" d="M 0 52L 61 0L 122 52L 61 104L 0 52Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1024"><text id="SvgjsText1025" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="102px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="26.05" transform="rotate(0)"><tspan id="SvgjsTspan1026" dy="16" x="61"><tspan id="SvgjsTspan1027" style="text-decoration:;">是不是</tspan></tspan><tspan id="SvgjsTspan1028" dy="16" x="61"><tspan id="SvgjsTspan1029" style="text-decoration:;">内联</tspan><tspan id="SvgjsTspan1030" style="text-decoration:;font-size: inherit;">样式</tspan></tspan><tspan id="SvgjsTspan1031" dy="16" x="61"><tspan id="SvgjsTspan1032" style="text-decoration:;">（作用域）</tspan></tspan></text></g></g><g id="SvgjsG1033" transform="translate(502.00001525878906,25.00000762939453)"><path id="SvgjsPath1034" d="M 0 52L 61 0L 122 52L 61 104L 0 52Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1035"><text id="SvgjsText1036" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="102px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.05" transform="rotate(0)"><tspan id="SvgjsTspan1037" dy="16" x="61"><tspan id="SvgjsTspan1038" style="text-decoration:;">选择器是否有</tspan></tspan><tspan id="SvgjsTspan1039" dy="16" x="61"><tspan id="SvgjsTspan1040" style="text-decoration:;">不同的优先级</tspan></tspan></text></g></g><g id="SvgjsG1041" transform="translate(670.0000152587891,52.00000762939453)"><path id="SvgjsPath1042" d="M 16.666666666666668 0L 103.33333333333333 0C 125.55555555555556 0 125.55555555555556 50 103.33333333333333 50L 16.666666666666668 50C -5.555555555555556 50 -5.555555555555556 0 16.666666666666668 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1043"><text id="SvgjsText1044" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="100px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="7.05" transform="rotate(0)"><tspan id="SvgjsTspan1045" dy="16" x="60"><tspan id="SvgjsTspan1046" style="text-decoration:;">使用源码顺序里</tspan></tspan><tspan id="SvgjsTspan1047" dy="16" x="60"><tspan id="SvgjsTspan1048" style="text-decoration:;">较晚出现的声明</tspan></tspan></text></g></g><g id="SvgjsG1049" transform="translate(172.00001525878906,176.00000762939453)"><path id="SvgjsPath1050" d="M 17.333333333333332 0L 96.66666666666667 0C 119.77777777777777 0 119.77777777777777 52 96.66666666666667 52L 17.333333333333332 52C -5.777777777777778 52 -5.777777777777778 0 17.333333333333332 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1051"><text id="SvgjsText1052" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1053" dy="16" x="57"><tspan id="SvgjsTspan1054" style="text-decoration:;">使用更高优先级</tspan></tspan><tspan id="SvgjsTspan1055" dy="16" x="57"><tspan id="SvgjsTspan1056" style="text-decoration:;">的来源里的声明</tspan></tspan></text></g></g><g id="SvgjsG1057" transform="translate(336.00001525878906,176.00000762939453)"><path id="SvgjsPath1058" d="M 17.333333333333332 0L 96.66666666666667 0C 119.77777777777777 0 119.77777777777777 52 96.66666666666667 52L 17.333333333333332 52C -5.777777777777778 52 -5.777777777777778 0 17.333333333333332 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1059"><text id="SvgjsText1060" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="16.05" transform="rotate(0)"><tspan id="SvgjsTspan1061" dy="16" x="57"><tspan id="SvgjsTspan1062" style="text-decoration:;">使用内联声明</tspan></tspan></text></g></g><g id="SvgjsG1063" transform="translate(506.00001525878906,176.00000762939453)"><path id="SvgjsPath1064" d="M 17.333333333333332 0L 96.66666666666667 0C 119.77777777777777 0 119.77777777777777 52 96.66666666666667 52L 17.333333333333332 52C -5.777777777777778 52 -5.777777777777778 0 17.333333333333332 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1065"><text id="SvgjsText1066" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1067" dy="16" x="57"><tspan id="SvgjsTspan1068" style="text-decoration:;">使用更高</tspan><tspan id="SvgjsTspan1069" style="text-decoration:;font-size: inherit;">优</tspan></tspan><tspan id="SvgjsTspan1070" dy="16" x="57"><tspan id="SvgjsTspan1071" style="text-decoration:;font-size: inherit;">先级的声明</tspan></tspan></text></g></g><g id="SvgjsG1072"><path id="SvgjsPath1073" d="M125.00001525878906 77.00000762939453L146.50001525878906 77.00000762939453L146.50001525878906 77.00000762939453L168.00001525878906 77.00000762939453" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1074)"></path></g><g id="SvgjsG1076"><path id="SvgjsPath1077" d="M290.00001525878906 77.00000762939453L311.00001525878906 77.00000762939453L311.00001525878906 77.00000762939453L332.00001525878906 77.00000762939453" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1078)"></path></g><g id="SvgjsG1080"><path id="SvgjsPath1081" d="M454.00001525878906 77.00000762939453L478.00001525878906 77.00000762939453L478.00001525878906 77.00000762939453L502.00001525878906 77.00000762939453" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1082)"></path></g><g id="SvgjsG1084"><path id="SvgjsPath1085" d="M624.0000152587891 77.00000762939453L647.0000152587891 77.00000762939453L647.0000152587891 77.00000762939453L670.0000152587891 77.00000762939453" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1086)"></path></g><g id="SvgjsG1088"><path id="SvgjsPath1089" d="M229.00001525878906 129.00000762939453L229.00001525878906 152.50000762939453L229.00001525878906 152.50000762939453L229.00001525878906 176.00000762939453" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1090)"></path></g><g id="SvgjsG1092"><path id="SvgjsPath1093" d="M393.00001525878906 129.00000762939453L393.00001525878906 152.50000762939453L393.00001525878906 152.50000762939453L393.00001525878906 176.00000762939453" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1094)"></path></g><g id="SvgjsG1096"><path id="SvgjsPath1097" d="M563.0000152587891 129.00000762939453L563.0000152587891 152.50000762939453L563.0000152587891 152.50000762939453L563.0000152587891 176.00000762939453" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1098)"></path></g><g id="SvgjsG1100" transform="translate(247.00001525878906,44.00000762939453)"><path id="SvgjsPath1101" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1102"><text id="SvgjsText1103" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="10.05" transform="rotate(0)"><tspan id="SvgjsTspan1104" dy="16" x="60"><tspan id="SvgjsTspan1105" style="text-decoration:;">否</tspan></tspan></text></g></g><g id="SvgjsG1106" transform="translate(412.00001525878906,44.00000762939453)"><path id="SvgjsPath1107" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1108"><text id="SvgjsText1109" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="10.05" transform="rotate(0)"><tspan id="SvgjsTspan1110" dy="16" x="60"><tspan id="SvgjsTspan1111" style="text-decoration:;">否</tspan></tspan></text></g></g><g id="SvgjsG1112" transform="translate(579.0000152587891,44.00000762939453)"><path id="SvgjsPath1113" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1114"><text id="SvgjsText1115" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="10.05" transform="rotate(0)"><tspan id="SvgjsTspan1116" dy="16" x="60"><tspan id="SvgjsTspan1117" style="text-decoration:;">否</tspan></tspan></text></g></g><g id="SvgjsG1118" transform="translate(183.00001525878906,129.00000762939453)"><path id="SvgjsPath1119" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1120"><text id="SvgjsText1121" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="10.05" transform="rotate(0)"><tspan id="SvgjsTspan1122" dy="16" x="60"><tspan id="SvgjsTspan1123" style="text-decoration:;">是</tspan></tspan></text></g></g><g id="SvgjsG1124" transform="translate(349.00001525878906,129.00000762939453)"><path id="SvgjsPath1125" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1126"><text id="SvgjsText1127" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="10.05" transform="rotate(0)"><tspan id="SvgjsTspan1128" dy="16" x="60"><tspan id="SvgjsTspan1129" style="text-decoration:;">是</tspan></tspan></text></g></g><g id="SvgjsG1130" transform="translate(516.0000152587891,129.00000762939453)"><path id="SvgjsPath1131" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1132"><text id="SvgjsText1133" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="10.05" transform="rotate(0)"><tspan id="SvgjsTspan1134" dy="16" x="60"><tspan id="SvgjsTspan1135" style="text-decoration:;">是</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（层叠的规则流程图，展示了声明的优先顺序）</p>
</div>

## 经验法则

在使用选择器时有一些通用的经验法则，如果遵守这些法则会很有用（特殊情况除外）。

* **最好让优先级尽可能低**<br>
  这样当需要覆盖一些样式时，才能有选择空间。

* **在选择器中不要使用 ID**<br>
  就算只用一个 ID 时也会大幅提升优先级，当需要覆盖这个选择器时，通常找不到另一个更有意义的 ID，于是就会复制原来的选择器，然后加上另一个类。

* **不要使用 !important**<br>
  它比 ID 更难覆盖，一旦引入一个 !important，想要覆盖原先的声明，就会带来更多的 !important，最终会让一切回到起点。

* **当创建一个用于分发的模块（例如 NPM 包）时，尽量不要使用行内样式**<br>
  否则开发人员要么全盘接受包里的样式，要么给每个想修改的属性加上 !important。<br>
  正确的做法是在包里包含一个样式表，这样用户就可以在使用这份样式表的同时，在不引入优先级竞赛的前提下，自定义其中的样式。

## 参考资料

* 《精通CSS 高级Web标准解决方案（第3版）》

（完）
