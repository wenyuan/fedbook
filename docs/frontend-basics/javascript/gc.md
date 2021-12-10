# 垃圾回收

## 前置概念

**内存管理**

内存管理指申请内存空间、使用内存空间和释放内存空间的这一系列步骤。

JavaScript 不能像 C 或 C++ 那样由开发者主动调用 API 来完成内存管理，而是使用垃圾回收机制来自动管理内存，其好处是可以大幅简化程序的内存管理代码，降低程序员的负担，减少因长时间运转而带来的内存泄露问题。

**何为垃圾**

在 JavaScript 中以下两种对象数据被定义为垃圾：

* 对象不再被引用时就是垃圾。
* 对象不能**从根上访问到**时就是垃圾（对象不是可达对象 === 垃圾）。

**可达对象**

在谈到 JavaScript 的垃圾回收时，「可达对象」这个名词会经常提及，那么什么是可达对象呢？

* 可以访问到的对象就是可达对象（通过引用、作用域链可以查找到）。
* 可达的标准就是从根出发是否能够被找到。
* JavaScript 中的根可以理解为是全局变量对象（全局执行上下文）。

在清楚上述这些前置概念后，就可以进入正文了。

## GC 算法

### GC 里的垃圾

GC（Garbage Collection）是垃圾回收机制的简写，它可以查找内存中的垃圾、释放空间和回收空间。在 GC 中，有两种判定为垃圾的标准（当作垃圾 ≠ 被回收）：

* 程序中不再需要使用的对象

```javascript
function func() {
  // 没有声明变量的关键字，name 被挂载在当前的 window 对象下
  name = 'peter';
  return `${name} is a dog.`;
}

func();
```

* 程序中不能再访问到的对象

```javascript
function func() {
  // 增加声明变量的关键字，当函数调用结束后，在外部空间就不能访问到 name 了
  const name = 'peter';
  return `${name} is a dog.`;
}

func();
```

在垃圾回收器进行工作的时候，如何查找垃圾、怎样释放空间、回收空间时如何进行分配，这一系列过程中遵循的规则，就是 GC 算法。

常见的 GC 算法有：

* 引用计数：通过一个数字判断当前对象是不是垃圾。
* 标记清除：在 GC 工作时给活动对象添加一个标记，来判断它是否是一个垃圾。
* 标记整理：同标记清除，但在后续回收过程中可以做一些不同的事情。
* 分代回收：V8 中的回收机制。

下面分别讲一下这几种常见算法的实现原理。

### 引用计数算法实现原理

核心思想：在内部通过一个引用计数器，维护当前对象的引用数。在引用关系改变时修改引用计数器的数字。当这个数值为 0 的时候，GC 开始工作，将其所在的对象空间进行回收和释放。

引用计数算法优点：

* 可以即时回收垃圾对象
* 最大限度减少程序卡顿时间（能尽可能保证内存不会有占满的时候）

引用计数算法缺点：

* 无法回收循环引用的对象
```javascript
function fn() {
  const obj1 = {};
  const obj2 = {};
  obj1.name = obj2;
  obj2.name = obj1;
  return 'peter is a dog.';
}

// 函数调用完后，虽然全局作用域内找不到 obj1 和 obj2
// 但由于他们两者之间有互相指引关系，所以引用计数器数值不为 0，因此空间无法回收
fn()
```
* 资源消耗较大（需要时刻监控当前对象的引用数值）

### 标记清除算法实现原理

核心思想：将整个垃圾回收操作分成「标记」和「清除」二个阶段完成。

第一个阶段会遍历所有对象，找出活动对象（可达对象）并标记。第二个阶段仍是遍历所有对象，清除没有标记的对象，同时消除在第一阶段设置的标记，便于 GC 下一次的正常工作。

经过两个阶段的遍历行为，可以回收相应的空间，交给空闲列表维护以供后续的程序代码使用。

标记清除算法优点：

* 可以回收循环引用的对象（例如函数局部作用域内互相引用的变量，当函数调用结束之后，局部空间的变量失去了与全局空间在作用域上的连接，成为了不可达对象，在标记阶段就无法完成标记，在清除阶段会被清除）

标记清除算法缺点：

* 容易产生碎片化空间，浪费空间（由于当前所回收的垃圾对象在地址上本身是不连续的，在回收之后它们会分散在各个角落，后续使用的时候如果新的生成空间刚好大小匹配就可以直接用，如果多了或者少了就不太适合使用了）
* 不会立即回收垃圾对象

### 标记整理算法实现原理

核心思想：标记整理可以看作是标记清除的增强。标记阶段的操作和标记清除一致，清除阶段会先执行整理，移动对象位置（让它们在地址上产生连续）。

<div style="text-align: center;">
  <img src="./assets/gc-mark-compact.png" alt="标记整理算法图示" style="width: 600px;">
  <p style="text-align: center; color: #888">（标记整理算法图示）</p>
</div>

标记整理算法优点：

* 减少碎片化空间

标记整理算法缺点：

* 不会立即回收垃圾对象

## V8 垃圾回收

### V8 内存分配

V8 是一款主流的 JavaScript 执行引擎，日常使用的 Chrome 浏览器和目前的 Node.js 平台都采用这个引擎去执行 JavaScript 代码。因为 V8 采用即时编译，能将源代码直接翻译成可直接执行的机器码，所以速度非常快。

V8 对所能使用的总内存空间进行了上限约束：64 位操作系统为 1.5GB，32 位操作系统为 800MB。

::: tip 为什么是 1.5GB 这个数值？
V8 最初是作为浏览器的 JavaScript 引擎而设计，所以对网页应用来说不太可能遇到大量内存的场景。  
V8 内部实现的垃圾回收机制，也决定了这个数值设定比较合理（V8 在执行垃圾回收时会阻塞 JavaScript应用逻辑，经官方测试，当垃圾内存达到 1.5GB 时，采用增量标记算法进行垃圾回收需要消耗 50ms，采用非增量标记算法进行垃圾回收需要消耗 1s，这样浏览器将在 1s 内失去对用户的响应，造成假死现象）。
:::

V8 将内存（堆）空间一分为二，其中小空间用于存储新生代对象（64 位 - 32MB | 32 位 - 16MB），另一部分较大空间用于存储老生代对象（64 位 - 1.4GB | 32 位 - 700MB）。

::: tip 解释
新生代对象指的是存活时间较短的对象（例如局部作用域中的变量）。  
老生代对象指的是存活时间较长的对象（例如全局作用域下的变量、闭包中放置的变量）。
:::

<div style="text-align: center;">
  <img src="./assets/v8-memory-allocation.png" alt="V8 内存分配">
  <p style="text-align: center; color: #888">（V8 内存分配）</p>
</div>

### V8 垃圾回收策略

在 JavaScript 中的数据，分为基本数据类型和引用数据类型两种，其中基本数据类型由程序语言自身进行控制，V8 所进行的垃圾回收操作主要针对存在堆内存中的引用数据类型。

V8 采用分代回收的思想，将内存分为新生代、老生代。针对不同代的对象采用不同的 GC 算法进行回收。

V8 中常用的 GC 算法有：

* 分代回收
* 空间复制
* 标记清除
* 标记整理
* 增量标记

### V8 如何回收新生代对象

* 采用复制算法 + 标记整理算法。
* 新生代内存区分为两个大小相等的空间：使用空间为 From，空闲空间为 To。
* 每当有新生对象诞生，就会在 From 空间出现。
* 一旦 From 空间被占满，就触发 GC。
* 对 From 空间的活动对象进行标记整理，然后将它们整个拷贝至 To。
* 清空 From 空间 （这样就可以实现把不活跃的对象给回收掉）。
* From 与 To 交换空间，开始下一轮循环。

注意点：

* 拷贝过程中可能出现晋升：将新生代对象移动至老生代存储区。
* 一轮 GC 结束还存活的新生代对象需要晋升。
* 拷贝时发现 To 空间的使用率超过 25%，则将本次拷贝对象直接移动至老生代存储区（25%：防止交换空间后，From 空间直接爆满，新的活动对象存不进去）。

### V8 如何回收老生代对象

* 主要采用标记清除、标记整理、增量标记算法
* 首先使用标记清除完成垃圾空间的回收（相对于空间碎片的问题，能够明显提升速度）
* 采用标记整理进行空间优化（新生代对象晋升时，如果老生代存储区空间不够，就触发标记整理）
* 采用增量标记进行效率优化

细节对比：

* 新生代区域垃圾回收使用空间换时间（复制算法导致每时每刻都会存在一个空闲空间）
* 老生代区域垃圾回收不适合复制算法（老生代存储空间较大，如果一分为二会浪费太多空间。且老生代存储空间会存储较多对象数据，如果进行复制操作会消耗过多时间。）

增量标记算法如何优化垃圾回收：

当垃圾回收开始工作的时候，会阻塞当前 JavaScript 程序的执行，于是就会产生「空档期」。增量标记算法能够将原本一整段的垃圾回收操作拆分成多个小步骤，从而替代原先一口气完成的垃圾回收操作，这样做可以让垃圾回收与程序执行交替工作。

如下图所示，当程序运行到某个时刻，触发垃圾回收机制。首先对老生代存储区的对象数据进行遍历，先找到第一层的可达对象，然后程序继续执行，接着对子元素（第二层可达对象）进行标记操作，接着程序继续执行，以此循环直到标记过程结束，最后完成垃圾回收操作后，程序继续执行。

<div style="text-align: center;">
  <img src="./assets/incremental-marking.png" alt="增量标记算法如何优化垃圾回收">
  <p style="text-align: center; color: #888">（增量标记算法如何优化垃圾回收）</p>
</div>

上述这个过程看似程序停顿了很多次，但整个 V8 最大的垃圾回收（达到 1.5GB）即使采用非增量标记的方式去回收也不会超过 1s。

### 不同类型变量的内存何时释放

浏览器中不同类型变量的内存都是何时释放的？

* 引用类型
  * 在没有引用之后，通过 V8 自动回收。
* 值类型
  * 如果处于闭包的情况下，要等闭包没有引用才会被 V8 回收。
  * 非闭包的情况下，等待 V8 新生代切换的时候回收。

## 内存问题

### 内存泄漏和内存溢出

#### 1）内存泄漏

内存泄漏是指程序执行时，一些变量没有及时释放，一直占用着内存，而这种占用内存的行为就叫做内存泄漏。

作为一般的用户，根本感觉不到内存泄漏的存在。真正有危害的是内存泄漏的堆积，这会最终消耗尽系统所有的内存。从这个角度来说，内存泄漏如果一直堆积，最终会导致内存溢出问题。

#### 2）内存溢出

执行程序时，程序会向系统申请一定大小的内存，当系统现在的实际内存少于需要的内存时，就会造成内存溢出。内存溢出造成的结果是先前保存的数据会被覆盖或者后来的数据会没地方存。

最简单的就是写一个千万级别的循环，然后用浏览器打开，浏览器会非常卡，甚至直接报错内存不足，崩溃了。不同浏览器会有不同的表现。

在 JavaScript 中，内存溢出一般是内存泄漏造成的，占用的内存不需要用到了但是没有及时释放，内存泄漏积累的多了轻的话影响系统性能，严重直接引起内存溢出系统崩溃。

在浏览器执行以下代码就会造成内存溢出（执行后需要等待一段时间）：

```javascript
console.log('begin')
var obj = {};
for (var i = 0; i < 100000; i++) {
  obj[i] = new Array(10000000);
}
console.log('end')
```

### 内存问题的体现

首先，如果界面出现延迟加载或者经常性的暂停，排除完网络环境的问题，这种情况一般都会判定内存存在问题，而且与频繁的垃圾回收操作有关，即代码中存在瞬间让内存爆炸的逻辑。

其次，如果界面出现持续性的糟糕性能表现，排除完网络环境的问题，这种情况一般会认为存在内存溢出。内存溢出是一种程序运行出现的错误，当程序运行需要的内存超过了剩余的内存时，就抛出内存溢出的错误。

最后，如果界面随着使用时间的增长表现出性能越来越差的现象，这个过程就伴随着内存泄露，因为在这种情况下刚开始的时候是没有问题的，由于某些代码的出现，随着时间的增长让内存空间越来越少。

### 监控内存的几种方式

在排查内存问题的时候，可以借助浏览器所提供的几个工具：

* 浏览器所带的任务管理器：可以直接以数值的方式将当前应用程序在执行过程中内存的变化体现出来。
* Timeline 时序图：可以直接把应用程序执行过程中所有内存的走势以时间点的方式呈现出来。
* 浏览器中的堆快照功能：可以很有针对性的查找界面对象中是否存在一些分离的 DOM，因为分离 DOM 的存在也就是一种内存上的泄露。

至于怎样判断界面是否存在着频繁的垃圾回收，这就需要借助于不同的工具来获取当前内存的走势图，然后进行一个时间段的分析，从而得出判断。

## 容易导致内存泄露的场景

### 意外的全局变量

全局变量的生命周期最长，直到页面关闭前，它都存活着，所以全局变量上的内存一直都不会被回收。当全局变量使用不当，没有及时回收（手动赋值 `null`），或者拼写错误等将某个变量挂载到全局变量时，也就发生内存泄漏了。

* 未声明变量

```javascript
function foo() {
  // 不小心没有 var 定义，这时候 name 变量是全局的
  name = 'global variable';
}
fn()
```

* 使用 `this` 创建的变量（this 的指向是 window）

```javascript
function foo() {
  // name 变量挂载到了全局
  this.name = 'global variable';
}
fn()
```

解决方法：

* 尽量避免创建全局变量。
* 使用严格模式，在 JavaScript 文件头部或者函数的顶部加上 `use strict`。

### 遗漏的 DOM 元素

DOM 元素的生命周期正常是取决于是否挂载在 DOM 树上，当从 DOM 树上移除时，也就可以被销毁回收了。

但如果某个 DOM 元素，在 JavaScript 代码中也持有它的引用，那么它的生命周期就由 JS 代码和是否在 DOM 树上两者决定了，在移除时，两个地方都需要去清理才能正常回收它。

如下代码：虽然别的地方删除了，但是对象中还存在对 dom 的引用。

```javascript
// 在对象中引用 DOM
var elements = {
  btn: document.getElementById('btn'),
}
function doSomeThing() {
  elements.btn.click();
}

function removeBtn() {
  // 将 body 中的 btn 移除, 也就是移除 DOM 树中的 btn
  document.body.removeChild(document.getElementById('btn'));
  // 但是此时全局变量 elements 还是保留了对 btn 的引用, btn 还是存在于内存中, 不能被 GC 回收
}
```

解决方法：

* 手动设置空指针移除：`elements.btn = null`

### 被遗忘的计时器或回调函数

::: tip 结论
现代浏览器更先进的垃圾回收算法已经可以正确的检测及处理了。
:::

`setTimeout` 和 `setInterval` 是由浏览器专门线程来维护它的生命周期，所以当在某个页面使用了计时器，即使该页面销毁时，没有手动去释放清理这些计时器的话，那么这些计时器还是存活着的。

也就是说，计时器的生命周期并不挂靠在页面上，所以当在当前页面的 JavaScript 代码里通过计时器注册了某个回调函数，而该回调函数内又持有当前页面某个变量或某些 DOM 元素时，就会导致即使页面销毁了，由于计时器持有该页面部分引用而造成页面无法正常被回收，从而导致内存泄漏了。

如果此时再次打开同个页面，内存中其实是有双份页面数据的，如果多次关闭、打开，那么内存泄漏会越来越严重。

而且这种场景很容易出现，因为使用计时器的人很容易遗忘清除。

如下代码：计时器中有 DOM 元素的引用，即使在 DOM 树中将元素删除了，但是计时器还在，所以内存中还是有这个 DOM 元素。

```javascript
// 定时器
var serverData = loadData()
setInterval(function () {
  var renderer = document.getElementById('renderer');
  if (renderer) {
    renderer.innerHTML = JSON.stringify(serverData);
  }
}, 5000)

// 观察者模式
var btn = document.getElementById('btn');
function onClick(element) {
  element.innerHTMl = "I'm innerHTML";
}
btn.addEventListener('click', onClick);
```

解决方法（**除了现代新浏览器的垃圾回收算法可以移除，建议还是把它写上为好**）：

* 手动删除计时器和 DOM（如果有 DOM）：`clearInterval(id_of_setinterval)` 或 `clearTimeout(id_of_settimeout)`
* removeEventListener 移除事件监听：`btn.removeEventListener('click', onClick)`

### 闭包与内存泄漏

::: tip
为什么把这一条放到最后呢，那是因为闭包和内存泄漏之间的微妙关系在现代并不是网传的那样，继续往下看就是了。
:::

函数本身会持有它定义时所在的词法环境的引用，通常情况下，使用完函数后，该函数所申请的内存就会被回收了。

但当函数内再返回一个函数时，由于返回的函数持有其外部函数的词法环境，而返回的函数又被其他生命周期东西所持有，导致外部函数虽然执行完了，但内存却无法被回收。

所以，返回的函数，它的生命周期应尽量不宜过长，方便该闭包能够及时被回收。

解决办法：及时释放

```javascript
function fn1() {
  var arr = new Array[100000];
  function fn2() {
    console.log(arr.length);
  }
  return fn2;
}
var f = fn1();
f();
f();
f = null // 让内部函数成为垃圾对象, 释放闭包
```

::: danger 误解
闭包会造成内存泄漏。（:x:）  
闭包不会造成内存泄漏，程序写错了才会造成内存泄漏。（:heavy_check_mark:）
:::

网传的那句「闭包会造成内存泄漏」其实是基于旧版本 IE 的 bug 得出的结论。当时由于 IE9 之前的版本中，BOM 和 DOM 中的对象是使用 C++ 以 COM 对象的方式实现的，而 COM 对象的垃圾收集机制采用的是引用计数算法。在基于引用计数算法的垃圾回收机制中，如果两个对象之间形成了循环引用，那么这两个对象都无法被回收。具体来说，如果闭包的作用域链中保存着一个 HTML 元素，那么就意味着该元素将无法被销毁。（—— 引用自《JavaScript设计模式与开发实践》第 3 章。）

例如下面的代码，btn 元素本身存在于 DOM 中，是一个引用的存在；`foo` 函数内部的 `el` 也是对该节点的一个引用。如果未来某个时候该节点从 DOM 中被移除了，DOM 中的引用不存在了，但只要匿名函数存在，`el` 的引用数至少也是 1，因此它所占用的内存就永远不会被回收。但循环引用造成的内存泄露在本质上也不是闭包造成的。

```javascript
function foo() {
  var el = document.getElementById('btn');
  el.onclick = function() {
    console.log(el.id);
  }
}

foo()
```

解决的方法也很简单，只需要把循环引用中的变量设为 `null` 即可。这意味着切断变量与它此前引用的值之间的连接。当垃圾收集器下次运行时，就会删除这些值并回收它们占用的内存。

```javascript
function foo() {
  var el = document.getElementById('btn');
  el.onclick = function() {
    console.log(el.id);
  }

  el = null;
}

foo()
```

正常来说，闭包并不是内存泄漏，因为这种持有外部函数词法环境本就是闭包的特性，闭包就是为了让这块内存不被回收，从而方便我们在未来还能继续用到，但这无疑会造成内存的消耗，所以，不宜烂用就是了。

## 实战中解决内存泄漏

### Vue 中容易出现内存泄露的几种情况

使用 Vue 开发单页应用（SPA）时，更要当心内存泄漏的问题。因为在 SPA 的设计中，用户使用它时是不需要刷新浏览器的，所以 JavaScript 应用需要自行清理组件来确保垃圾回收以预期的方式生效。因此开发过程中，你需要时刻警惕内存泄漏的问题。

#### 1）全局变量造成的内存泄露

声明的全局变量在切换页面的时候没有清空。

```vue
<template>
  <div id="home">这里是首页</div>
</template>

<script>
  export default {
    mounted() {
      window.test = {
        // 此处在全局 window 对象中引用了本页面的 dom 对象
        name: 'home',
        node: document.getElementById('home'),
      }
    },
  }
</script>
```

解决方案：在页面卸载的时候顺便处理掉该引用。

```vue
destroyed () {
  window.test = null // 页面卸载的时候解除引用
}
```

#### 2）监听在 window/body 等的事件没有解绑

特别注意 `window.addEventListener` 之类的时间监听。

```vue
<template>
  <div id="home">这里是首页</div>
</template>

<script>
  export default {
    mounted () {
      window.addEventListener('resize', this.func) // window对象引用了home页面的方法
    }
}
</script>
```

解决方法：在页面销毁的时候，顺便解除引用，释放内存。

```vue
mounted () {
  window.addEventListener('resize', this.func)
},
beforeDestroy () {
  window.removeEventListener('resize', this.func)
}
```

#### 3）绑在 EventBus 的事件没有解绑

举个例子：

```vue
<template>
  <div id="home">这里是首页</div>
</template>

<script>
export default {
  mounted () {
    this.$EventBus.$on('homeTask', res => this.func(res))
  }
}
</script>
```

解决方法：在页面卸载的时候也可以考虑解除引用。

```vue
mounted () {
  this.$EventBus.$on('homeTask', res => this.func(res))
},
destroyed () {
  this.$EventBus.$off()
}
```

#### 4）Echarts

每一个图例在没有数据的时候它会创建一个定时器去渲染气泡，页面切换后，Echarts 图例是销毁了，但是这个 Echarts 的实例还在内存当中，同时它的气泡渲染定时器还在运行。这就导致 Echarts 占用 CPU 高，导致浏览器卡顿，当数据量比较大时甚至浏览器崩溃。

解决方法：加一个 `beforeDestroy()` 方法释放该页面的 `chart` 资源，我也试过使用 `dispose()` 方法，但是 dispose 销毁这个图例，图例是不存在了，但图例的 `resize()` 方法会启动，则会报没有 resize 这个方法，而 `clear()` 方法则是清空图例数据，不影响图例的 resize，而且能够释放内存，切换的时候就很顺畅了。

```vue
beforeDestroy () {
  this.chart.clear()
}
```

#### 5）v-if 指令产生的内存泄露

`v-if` 绑定到 `false` 的值，但是实际上 Dom 元素在隐藏的时候没有被真实的释放掉。

比如下面的示例中，我们加载了一个带有非常多选项的选择框，然后我们用到了一个显示/隐藏按钮，通过一个 `v-if` 指令从虚拟 DOM 中添加或移除它。这个示例的问题在于这个 `v-if` 指令会从 DOM 中移除父级元素，但是我们并没有清除由 `Choices.js` 新添加的 DOM 片段，从而导致了内存泄漏。

```vue
<div id="app">
  <button v-if="showChoices" @click="hide">Hide</button>
  <button v-if="!showChoices" @click="show">Show</button>
  <div v-if="showChoices">
    <select id="choices-single-default"></select>
  </div>
</div>

<script>
  export default {
    data() {
      return {
        showChoices: true,
      }
    },
    mounted: function () {
      this.initializeChoices()
    },
    methods: {
      initializeChoices: function () {
        let list = []
        // 我们来为选择框载入很多选项，这样的话它会占用大量的内存
        for (let i = 0; i < 1000; i++) {
          list.push({
            label: 'Item ' + i,
            value: i,
          })
        }
        new Choices('#choices-single-default', {
          searchEnabled: true,
          removeItemButton: true,
          choices: list,
        })
      },
      show: function () {
        this.showChoices = true
        this.$nextTick(() => {
          this.initializeChoices()
        })
      },
      hide: function () {
        this.showChoices = false
      },
    },
  }
</script>
```

在上述的示例中，我们可以用 `hide()` 方法在将选择框从 DOM 中移除之前做一些清理工作，来解决内存泄露问题。为了做到这一点，我们会在 Vue 实例的数据对象中保留一个属性，并会使用 Choices API 中的 `destroy()` 方法将其清除。

```vue
<div id="app">
  <button v-if="showChoices" @click="hide">Hide</button>
  <button v-if="!showChoices" @click="show">Show</button>
  <div v-if="showChoices">
    <select id="choices-single-default"></select>
  </div>
</div>

<script>
  export default {
    data() {
      return {
        showChoices: true,
        choicesSelect: null
      }
    },
    mounted: function () {
      this.initializeChoices()
    },
    methods: {
      initializeChoices: function () {
        let list = []
        for (let i = 0; i < 1000; i++) {
          list.push({
            label: 'Item ' + i,
            value: i,
          })
        }
         // 在我们的 Vue 实例的数据对象中设置一个 `choicesSelect` 的引用
        this.choicesSelect = new Choices("#choices-single-default", {
          searchEnabled: true,
          removeItemButton: true,
          choices: list,
        })
      },
      show: function () {
        this.showChoices = true
        this.$nextTick(() => {
          this.initializeChoices()
        })
      },
      hide: function () {
        // 现在我们可以让 Choices 使用这个引用，从 DOM 中移除这些元素之前进行清理工作
        this.choicesSelect.destroy()
        this.showChoices = false
      },
    },
  }
</script>
```

### ES6 防止内存泄漏

前面说过，及时清除引用非常重要。但是，你不可能记得那么多，有时候一疏忽就忘了，所以才有那么多内存泄漏。

ES6 考虑到这点，推出了两种新的数据结构：weakset 和 weakmap。他们对值的引用都是不计入垃圾回收机制的，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存。

```javascript
const wm = new WeakMap()
const element = document.getElementById('example')
vm.set(element, 'something')
vm.get(element)
```

上面代码中，先新建一个 Weakmap 实例。然后，将一个 DOM 节点作为键名存入该实例，并将一些附加信息作为键值，一起存放在 WeakMap 里面。这时，WeakMap 里面对 element 的引用就是弱引用，不会被计入垃圾回收机制。

注册监听事件的 listener 对象很适合用 WeakMap 来实现。

```javascript
// 代码 1
ele.addEventListener('click', handler, false)

// 代码 2
const listener = new WeakMap()
listener.set(ele, handler)
ele.addEventListener('click', listener.get(ele), false)
```

代码 2 比起代码 1 的好处是：由于监听函数是放在 WeakMap 里面，一旦 Dom 对象 ele 消失，与它绑定的监听函数 handler 也会自动消失。

## 参考资料

* 《[浅析Chrome V8引擎中的垃圾回收机制和内存泄露优化策略](https://blog.csdn.net/arv002/article/details/109818109)》（分代回收算法那块写的比我详细）
* 《[js 内存泄漏场景、如何监控以及分析](https://github.com/woshidasusu/Doc/blob/master/面试题/浏览器/内存泄漏.md)》（如何分析内存泄漏写的比较好）
* 《[彻底掌握js内存泄漏以及如何避免](https://juejin.cn/post/6844903917986267143)》（引用 MDN 上的例子演示了垃圾回收算法）
* 《JavaScript 设计模式与开发实践 》（讲了「闭包会造成内存泄漏」这一说法的历史背景）
