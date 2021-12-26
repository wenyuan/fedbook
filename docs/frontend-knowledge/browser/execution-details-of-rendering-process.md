# 渲染引擎的工作原理

这个系列的第一篇文章中对「[浏览器从输入 URL 到页面展示](/frontend-knowledge/browser/browser-macro-knowledge/#导航流程-输入-url-到页面展示)」的整个流程做了小结，但其实最后一步在获得到 HTML、CSS 和 JavaScript 文件后，对渲染进程做的工作只是简单概括了一下，这里单独写一篇作为细节扩充。

## HTML、CSS 和 JavaScript 是如何变成页面的

渲染引擎的工作过程相当复杂，所以渲染模块在执行过程中会被划分为很多子阶段，输入的 HTML 经过这些子阶段，最后输出像素。其大致流程如下图所示：

<div style="text-align: center;">
  <img src="./assets/simple-rendering-process.png" alt="简单的渲染流程示意图" style="width: 600px;">
  <p style="text-align: center; color: #888;">（简单的渲染流程示意图，图来源于网络）</p>
</div>

按照渲染的时间顺序，整个渲染流程可分为如下几个子阶段：构建 DOM 树、样式计算、布局、分层、图层绘制、栅格化、合成和显示。为了方便记忆，每个子阶段都应该重点关注其**输入的内容**，**处理过程**，**输出内容**。

### 流程小结

大体的渲染流程还是**复制之前一篇文章里归纳的 [8 个步骤](/frontend-knowledge/browser/browser-macro-knowledge/#输入-url-到页面展示)**，这里在每个步骤之下补充一些细节知识点：

* **构建 DOM 树**：通过 HTML 解析器将 HTML 转换成 DOM 树。
* **样式计算**：渲染引擎将 CSS 文本转换为 styleSheets，计算出 DOM 节点的样式。
  * 转成 styleSheets 后，会先进行属性值的标准化操作，再根据 CSS 的继承规则和层叠规则计算每个节点的具体样式。
* **布局**：创建布局树（只包含可见元素的树），并计算元素的布局信息。
  * 布局是为了计算 DOM 树中可见元素的几何位置，因为前一步只是获得了元素样式，并不知道它应该放哪。
  * 布局树会忽略不可见节点，比如 `head` 标签，和使用了 `display:none` 属性的元素等。
  * 目前的布局操作中，布局树既是输入内容也是输出内容，Chrome 团队为了分离输入和输出，正在重构布局代码，下一代布局系统叫 LayoutNG。
* **分层**：对布局树进行分层，并生成分层树。
  * 分层是为了实现页面中一些复杂的效果：3D 变换、页面滚动，或者使用 z-indexing 做 z 轴排序等。
  * 如果一个节点没有对应的层，那么这个节点就从属于父节点的图层。
  * 拥有层叠上下文属性的元素（比如定位属性元素、透明属性元素、CSS 滤镜属性元素）提升为单独的一层，需要裁剪（clip）的地方也会被创建为图层。
* **图层绘制**：为每个图层生成绘制列表，并将其提交到合成线程。
  * 把一个图层的绘制拆分成很多小的绘制指令，然后再把这些指令按照顺序组成一个待绘制列表。（就跟绘画一样，先画什么，再画什么……）
* **栅格化**：合成线程将图层分成图块，通过栅格化把图块转换为位图。
  * 为了提高性能，即不绘制视口（viewport）以外的图层，合成线程会将图层划分为图块。
  * 图块是栅格化执行的最小单位，合成线程会按照视口附近的图块来优先生成位图。
  * 通常栅格化过程都会使用 GPU 来加速生成，这是一种跨进程操作（GPU 操作是运行在 GPU 进程中）。
* **合成**：所有图块都被光栅化后，渲染引擎中的合成线程发送一个绘制图块的命令「DrawQuad」给浏览器进程。
* **显示**：浏览器进程根据接收到的「DrawQuad」消息绘制页面，并显示到显示器上。

### 完整流程示意图

下图是一张李兵老师梳理的「完整的渲染流水线示意图」：

<div style="text-align: center;">
  <img src="./assets/complete-rendering-process.png" alt="完整的渲染流水线示意图">
  <p style="text-align: center; color: #888;">（完整的渲染流水线示意图，图来源于网络）</p>
</div>

## 重排、重绘、和合成

这是三个和渲染流水线相关的概念 —— 「重排」、「重绘」和「合成」，这三个概念与 Web 的性能优化有关。

### 重排：更新了元素的几何属性

* 如果修改了元素的几何属性（元素的位置和尺寸大小），就会触发重新布局、解析之后的一系列子阶段。
* 重排需要更新完整的渲染流水线，所以开销也是最大的。
* 常见的引起重排的操作：
  * 添加或者删除可见的 DOM 元素。
  * 元素尺寸改变 —— 边距、填充、边框、宽度和高度。
  * 内容变化，比如用户在 `input` 框中输入文字。
  * 浏览器窗口尺寸改变 —— `resize` 事件发生时。
  * 计算 `offsetWidth` 和 `offsetHeight` 属性。
  * 设置 `style` 属性的值。
  
常见的引起重排的属性和方法：

|                         |                          |                    |            |
|:----------------------- |:-------------------------|:-------------------|:-----------|
| width                   | height                   | margin             | padding    |
| display                 | border                   | position           | overflow   |
| clientWidth             | clientHeight             | clientTop          | clientLeft |
| offsetWidth             | offsetHeight             | offsetTop          | offsetLeft |
| scrollWidth             | scrollHeight             | scrollTop          | scrollLeft |
| scrollIntoView()        | scrollTo()               | getComputedStyle() |            |
| getBoundingClientRect() | scrollIntoViewIfNeeded() | 	                  |            |

### 重绘：更新元素的绘制属性

* 如果修改了元素的外观属性（颜色、背景、边框等），就会直接进入了绘制阶段，然后执行之后的一系列子阶段。
* 因为几何位置没有变换，所以布局阶段不会被执行，省去了布局和分层阶段，所以执行效率会比重排操作要高一些。

常见的引起重绘的属性：

|                 |                  |                     |                   |
|:--------------- |:-----------------|:--------------------|:------------------|
| color           | border-style     | visibility          | background        |
| text-decoration | background-image | background-position | background-repeat |
| outline-color   | outline          | outline-style       | border-radius     |
| outline-width   | box-shadow       | background-size     |                   |

### 合成：直接合成阶段

* 如果更改的是一个既不要布局也不要绘制的属性，渲染引擎将跳过布局和绘制，只执行后续的合成操作。
* 例如：使用 CSS3 的 `transform` 来实现动画效果，比使用 JS 修改 style 高效。

## 优化策略：减少重排和重绘

### 1.对 dom 属性的读写操作要分离

```javascript
// 这段代码会触发 4 次重排 + 重绘
// 因为在 console 中用到的这几个属性虽然跟操作修改的值没关联, 
// 但浏览器为了给我们最精确的值, 会立即重排 + 重绘.
// 
// 这种会强制刷新渲染队列并触发立即重排的属性还有:
// offsetTop, offsetLeft, offsetWidth, offsetHeight
// scrollTop, scrollLeft, scrollWidth, scrollHeight
// clientTop, clientLeft, clientWidth, clientHeight
// getComputedStyle(), 或者 IE 的 currentStyle
div.style.left = '10px';
console.log(div.offsetLeft);
div.style.top = '10px';
console.log(div.offsetTop);
div.style.width = '20px';
console.log(div.offsetWidth);
div.style.height = '20px';
console.log(div.offsetHeight);

// 这段代码只会触发 1 次重排 + 重绘
// 因为操作值的时候, 只有等到渲染队列中到了一定大小, 或一定时间间隔后, 浏览器才会批量执行这些操作;
// 而读取值的时候, 因为渲染队列本来就是空的, 所以并没有触发重排, 仅仅拿值而已.
div.style.left = '10px';
div.style.top = '10px';
div.style.width = '20px';
div.style.height = '20px';
console.log(div.offsetLeft);
console.log(div.offsetTop);
console.log(div.offsetWidth);
console.log(div.offsetHeight);
```

### 2.使用 class 操作样式，而不是频繁操作 style

虽然现在大部分浏览器有渲染队列优化，不排除有些浏览器以及老版本的浏览器效率仍然低下，所以建议通过改变 `class` 或者 `cssText` 属性集中改变样式。

```javascript
// bad
var left = 10;
var top = 10;
el.style.left = left + "px";
el.style.top  = top  + "px";

// good 
el.className += " theclassname";
// good
el.style.cssText += "; left: " + left + "px; top: " + top + "px;";
```

### 3.缓存布局信息

```javascript
// bad 强制刷新, 触发两次重排
div.style.left = div.offsetLeft + 1 + 'px';
div.style.top = div.offsetTop + 1 + 'px';

// good 缓存布局信息, 相当于读写分离
var curLeft = div.offsetLeft;
var curTop = div.offsetTop;
div.style.left = curLeft + 1 + 'px';
div.style.top = curTop + 1 + 'px';
```

### 4.离线改变 DOM

* 隐藏要操作的 DOM  
  在要操作 DOM  之前，通过 `display` 隐藏 DOM ，当操作完成之后（比如修改 100 次后），才将元素的 display 属性设置为可见，因为不可见的元素不会触发重排和重绘。
  ```javascript
  dom.display = 'none'
  // 修改 DOM 样式
  dom.display = 'block'
  ```
* 通过使用 [DocumentFragment](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment) 创建一个 DOM 碎片，在它上面批量操作 DOM，操作完成之后，再添加到文档中，这样只会触发一次重排。
* 复制节点，在副本上工作，然后替换它。
* 使用现代化框架，例如 Vue、React。

### 5.position 属性为 absolute 或 fixed

position 属性为 absolute 或 fixed 的元素，重排开销比较小，不用考虑它对其他元素的影响。

### 6.优化动画

* 可以把动画效果应用到 position 属性为 absolute 或 fixed 的元素上，这样对其他元素影响较小。
  * 动画效果还应牺牲一些平滑，来换取速度，这中间的度自己衡量：比如实现一个动画，以 1 个像素为单位移动这样最平滑，但是 reflow 就会过于频繁，大量消耗 CPU 资源，如果以 3 个像素为单位移动则会好很多。
* 启用 GPU 硬件加速
  * GPU 硬件加速是指应用 GPU 的图形性能对浏览器中的一些图形操作交给 GPU 来完成，因为 GPU 是专门为处理图形而设计，所以它在速度和能耗上更有效率。
  * GPU 加速通常包括以下几个部分：Canvas2D，布局合成，CSS3转换（transitions），CSS3 3D 变换（transforms），WebGL 和视频（video）。
  ```css
  /*
   * 根据上面的结论
   * 将 2d transform 换成 3d
   * 就可以强制开启 GPU 加速
   * 提高动画性能
   */
  div {
    transform: translate(10px, 10px);
  }
  div {
    transform: translate3d(10px, 10px, 0);
  }
  ```

### 7.对 window resize 事件做防抖处理

这个延迟时间视场合而定。

### 8.不要使用 table 布局

因为 table 中某个元素一旦触发了重排，那么整个 table 的元素都会触发重排。在不得已使用 table 的场合，可以设置 `table-layout: auto;` 或者是 `table-layout:fixed` 这样可以让 table 一行一行的渲染，这种做法也是为了限制重排的影响范围。

### 9.尽可能不要修改影响范围比较大的 DOM

尽可能限制重排的影响范围，尽可能在低层级的 DOM 节点上作修改。比如要改变 p 标签的样式，class 就不要加在它上层的 div 标签上，通过父元素去影响子元素不好。

### 10.慎用 CSS 表达式

如果 CSS 里面有计算表达式，每次都会重新计算一遍，都会触发一次重排。

（完）
