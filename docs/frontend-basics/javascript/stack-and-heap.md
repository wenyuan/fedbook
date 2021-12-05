# 栈空间和堆空间

## 数据类型

目前 JavaScript 中的数据类型一共有 8 种，它们分别是：

| 类型      | 描述                              |
| --------- | -------------------------------- |
| Boolean   | 只有 `true` 和 `false` 两个值。   |
| Null      | 只有一个值 `null`。               |
| Undefined | 一个没有被赋值的变量会有个默认值 `undefined`，变量提升时的默认值也是 `undefined`。     |
| Number    | 根据 ECMAScript 标准，JavaScript 中只有一种数字类型。      |
| BigInt    | ES11 引入的一种新的数字类型，可以用任意精度表示整数。使用 BigInt，即使超出 Number 的安全整数范围限制，也可以安全地存储和操作。    |
| String    | 用于表示文本数据。不同于类 C 语言，JavaScript 的字符串是不可更改的。      |
| Symbol    | ES6 引入的一种新的类型，表示唯一的并且是不可修改的，通常用来作为 Object 的 key。    |
| Object    | 在 JavaScript 里，对象可以被看作是一组属性的集合。      |

有三个注意点：

* 使用 `typeof` 检测 Null 类型时，返回的是 `object`。这是当初 JavaScript 语言的一个 Bug，一直保留至今，之所以一直没修改过来，主要是为了兼容老的代码。
  > 在 Javascript 中二进制前三位都为 `0` 的话会被判断为 Object 类型，`null` 的二进制表示全 `0`，因此执行 `typeof null` 时返回 `object` —— 《你不知道的JavaScript（上）》
* Object 是由 key-value 组成的，其中的 value 可以是任何类型，包括函数，这也就意味着你可以通过 Object 来存储函数，Object 中的函数又称为方法。
* 前面的 7 种数据类型称为**原始类型**，最后一个对象类型称为**引用类型**，这两种不同的类型在内存中存放的位置不一样。

## 内存空间

在 JavaScript 的执行过程中，主要有三种类型内存空间，分别是**代码空间**、**栈空间**和**堆空间**。

其中的代码空间主要是存储可执行代码的，这里主要分析栈空间和堆空间。

### 栈空间

栈空间就是经常说的调用栈，用来存储执行上下文。

原始类型的数据值都是直接保存在栈空间中的。

### 堆空间

对象类型是存放在堆空间的，在栈空间中只是保留了对象的引用地址，当 JavaScript 需要访问该数据的时候，是通过栈中的引用地址来访问的。

## 为什么分两种空间

**栈空间**主要用来存放一些原始类型的小数据，通常都不会设置太大，因为 JavaScript 引擎需要用栈来维护程序执行期间上下文的状态，如果栈空间大了话，所有的数据都存放在栈空间里面，那么会影响到上下文切换的效率，进而又影响到整个程序的执行效率。

::: details 执行上下文的切换
例如 foo 函数执行结束了，JavaScript 引擎需要离开当前的执行上下文，只需要将指针下移到上个执行上下文的地址就可以了，foo 函数执行上下文栈区空间全部回收，如下图所示：

<div style="text-align: center;">
  <img src="./assets/switch-execution-context-state-in-the-call-stack.png" alt="调用栈中切换执行上下文状态">
  <p style="text-align: center; color: #888;">（调用栈中切换执行上下文状态，图片来源于网络）</p>
</div>
:::

**堆空间**主要用来存放引用类型的数据，这类数据占用的空间都比较大，所以堆空间很大，能存放很多大的数据，不过缺点是分配内存和回收内存都会占用一定的时间。

## 不同数据类型赋值操作的区别

在 JavaScript 中，原始类型的赋值会完整复制变量值，而引用类型的赋值是复制引用地址。

例如下面代码：

```javascript
function foo(){
  var a = "极客时间"
  var b = a
  var c = {name:"极客时间"}
  var d = c
}
foo()
```

在该代码的执行过程中，变量 a 和变量 b 的值都是存放在栈中的，变量 c 和变量 d 都指向了同一个堆中的对象（因此会有一个变另一个跟着变的现象）。

其内存示意图如下图所示：

<div style="text-align: center;">
  <img src="./assets/memory-allocation.png" alt="内存示意图" style="width: 600px;">
  <p style="text-align: center; color: #888;">（内存示意图，图片来源于网络）</p>
</div>

（完）
