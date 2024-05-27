# 回流与重绘

## 概念介绍

通常对 DOM 的修改后，浏览器会执行这样的操作：

Render Tree 发生变化 ——> 回流 ——> 重绘

其中：

* 回流：当我们对 DOM 的修改引发了 DOM 几何尺寸的变化（比如修改元素的宽、高或隐藏元素等）时，浏览器需要重新计算元素的几何属性（其他元素的几何属性和位置也会因此受到影响），然后再将计算的结果绘制出来。这个过程就是回流（也叫重排）。
* 重绘：当我们对 DOM 的修改导致了样式的变化、却并未影响其几何属性（比如修改了颜色或背景色）时，浏览器不需重新计算元素的几何属性、直接为该元素绘制新的样式（跳过了回流环节）。这个过程叫做重绘。

由此可以看出，**重绘不一定导致回流，回流一定会导致重绘**。硬要比较的话，回流比重绘做的事情更多，带来的开销也更大。但这两个说到底都是吃性能的，因此我们在开发中，要从代码层面出发，尽可能把回流和重绘的次数最小化。

## 触发重绘的操作

重绘比较容易识别，只要是不触发回流，但又触发了样式改变的 DOM 操作，都会引起重绘。比如背景色、文字色、可见性（可见性这里特指形如 `visibility: hidden` 这样不改变元素位置和存在性的、单纯针对可见性的操作，注意与 `display: none` 进行区分）等。

## 触发回流的操作

### 改变 DOM 元素的几何属性

当一个 DOM 元素的几何属性发生变化时，所有和它相关的节点（比如父子节点、兄弟节点等）的几何属性都需要进行重新计算，它会带来巨大的计算量。

常见的几何属性有 width、height、padding、margin、left、top、border 等等。

这些属性没必要强记，一个属性是不是几何属性、会不会导致空间布局发生变化，在实际写样式的时候完全可以通过代码效果看出来。

### 改变 DOM 树的结构

主要指的是节点的增减、移动等操作。浏览器引擎布局的过程，顺序上是一个从上到下、从左到右的过程。通常在这个过程中，当前元素不会再影响其前面已经遍历过的元素。

### 获取一些特定属性的值

这是最容易被忽略的，也会触发回流的操作。

当用到：offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、clientTop、clientLeft、clientWidth、clientHeight 这样的属性时，由于他们都是需要通过**即时计算**得到，因此浏览器为了获取这些值，也会进行回流。

除此之外，当我们调用了 `getComputedStyle` 方法，或者 IE 里的 `currentStyle` 时，也会触发回流。原理是一样的，都是为了获取一个即时性和准确性的值。

## 如何规避回流与重绘

### 避免频繁获取会触发回流的属性，将它们缓存起来

例如下面代码：

```javascript
// 获取el元素
const el = document.getElementById('el');
// 用循环来模拟实际操作中，多次去获取元素布局位置的操作
for(let i=0; i<10; i++) {
  el.style.top  = el.offsetTop  + 10 + "px";
  el.style.left = el.offsetLeft + 10 + "px";
}
```

上述代码中，需要反复获取多次会触发回流的属性，是比较糟糕的。作为优化可以将其以 JS 变量的形式缓存起来，待计算完毕再提交给浏览器发出重计算请求：

```javascript
// 缓存 offsetLeft 与 offsetTop 的值
const el = document.getElementById('el');
let offLeft = el.offsetLeft, offTop = el.offsetTop;

// 在JS层面进行计算
for(let i=0; i<10; i++) {
  offLeft += 10
  offTop  += 10
}

// 一次性将计算结果应用到 DOM 上
el.style.left = offLeft + "px";
el.style.top = offTop  + "px";
```

### 避免逐条改变样式，使用类名去合并样式

比如可以把下面这段代码：

```javascript
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

优化成用 class 来赋予样式：

```css
.basic_style {
  width: 100px;
  height: 200px;
  border: 10px solid red;
  color: red;
}
```

```javascript
const container = document.getElementById('container')
container.classList.add('basic_style')
```

前者每次单独操作，都去触发一次渲染树更改，从而导致相应的回流与重绘过程。

合并之后，等于我们将所有的更改一次性发出，用一个 style 请求解决掉了。

### 将 DOM 离线

回流和重绘，都是在「该元素位于页面上」的前提下会发生的。只要给元素设置 `display: none`，将其从页面上「拿掉」，对它的后续操作就无法触发回流与重绘，这个操作就叫做 DOM 离线化。

比如要对一个元素做很多很多操作：

```javascript
const container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
// ...（省略了许多类似的后续操作）
```

离线化后就是这样：

```javascript
let container = document.getElementById('container')
container.style.display = 'none'
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
// ...（省略了许多类似的后续操作）
container.style.display = 'block'

```

因为拿掉一个元素再把它放回去，这本身也会触发一次回流。所以如果只需要进行很少的 DOM 操作，那么离线化的优点并不明显。而一旦操作很频繁，离线化的优点就体现出来了。

### Flush 队列：浏览器并没有那么简单

现代浏览器为了提升性能，缓存了一个 flush 队列，把我们触发的回流与重绘任务都塞进去，等到队列里的任务多起来、或者达到了一定的时间间隔，或者「不得已」的时候，再将这些任务一口气执行。

因此对于下面的代码，理论上进行了 4 次 DOM 更改（3 次回流和 1 次 重绘），也只触发了一次 Layout 和一次 Paint。

```javascript
let container = document.getElementById('container')
container.style.width = '100px'
container.style.height = '200px'
container.style.border = '10px solid red'
container.style.color = 'red'
```

> 「不得已」的时候，指访问那些具有很强「即时性」的属性时，因为这些操作需要获得此时此刻最精确的值，所以会促使浏览器提前将 flush 队列的任务拿出来执行。

虽然 Chrome 浏览器已经做了批处理优化，但是用户可能使用的是其它各种各样的浏览器。所以前面提到的手动优化方案还是必需的。养成良好的编程习惯、从根源上解决问题，仍然是最周全的方法。

（完）
