# 原型与原型链

ES6 出来之后，原型在平时工作中用得就比较少了。但原型是 JavaScript 中的基础，很多流行框架诸如 Vue 和 React 中就多次用到 `prototype` 。平时在写代码时，也会不知不觉就应用上了原型的某个基础知识点。

本篇主要介绍以下两个知识点：

* 原型
* 原型链

## 1. 原型

任何一个函数，都拥有一个 `prototype` 属性，它指向这个函数的原型对象，如：

```javascript
function Foo () {}
console.log(Foo.prototype) // { constructor: f Foo(), __proto__: Object }
```

画图表示如下：

<div style="text-align: center; width: 650px;">
  <img :src="$withBase('/img/foo-prototype.png')" alt="Foo 的原型">
  <p style="text-align: center; color: #888">（Foo 的原型）</p>
</div>

上图左边代表 `Foo` 函数，它有一个 `prototype` 属性，指向右侧这个原型对象，每声明一个函数，都会有这样的一个原型对象，原型对象有一个 `constructor` 属性，指向 `Foo` 函数本身，也有个 `__proto__` 属性，这里我们暂且不讲。

---------------------------------------

我们来看 `Foo` 函数的实例化：

```javascript
const foo = new Foo()
```

这里我们通过 `new` 操作符实例化了一个 `foo` 对象，来看此时的图解：

<div style="text-align: center; width: 650px;">
  <img :src="$withBase('/img/new-foo.png')" alt="new Foo">
  <p style="text-align: center; color: #888">（new Foo）</p>
</div>

`foo` 默认会有个 `__proto__` 属性，它也指向构造函数 `Foo` 的原型，这就是 `__proto__` 的作用，即**指向构造函数的原型**。

---------------------------------------

那让我们回到 `Foo.prototype.__proto__`，来看看他的指向吧：

<div style="text-align: center; width: 650px;">
  <img :src="$withBase('/img/foo-prototype-__proto__.png')" alt="Foo 原型的 __proto__">
  <p style="text-align: center; color: #888">（Foo 原型的 __proto__）</p>
</div>

上图的 `Foo.prototype.__proto__` 指向 `Object.prototype`，也就是说：**每个函数的原型，都是 Object 的实例**。就好像每个函数的原型，是由 `new Object()` 产生一样。

以上就是关于原型的阐述，如果看到这里似懂非懂，建议反复看几遍，注意文字与图片对应，线条的指向，看懂了再接着往下看。

## 2. 原型链

原型链是 JavaScript 作者为了继承而设计的。由上边的分析，`const foo = new Foo()` 语句，其实是产生了一个链条的，如下:

<div style="text-align: center; width: 650px;">
  <img :src="$withBase('/img/prototype-chain.png')" alt="原型链">
  <p style="text-align: center; color: #888">（原型链）</p>
</div>

我们在 new 出 `foo` 对象后，并没有给 `foo` 对象添加任何方法，但我们依然能从 `foo` 对象中调用 `toString()`、 `hasOwnProperty()` 等方法。这是为什么呢？

```javascript
console.log(typeof foo.toString) // function
console.log(typeof foo.hasOwnProperty) // function
```

原因是：JavaScript 在设计之初，`__proto__` 就是用来查找属性和方法的。

从上图的链条来看，我们在 `foo` 这个对象中，查找 toString 方法，没找到，就循着 `foo.__proto__` 查找，`foo.__proto__` 里也没有找到，就循着 `foo.__proto__.__proto__` 找，这个时候找到了，则调用；如果还找不到，就再往上找，即 `foo.__proto__._proto__._proto__`，这个时候值为 `null`，查找结束。

这就是原型链，我们也可以说，`Foo` 继承了 `Object`，所以 `foo` 中能访问到 Object 的原型属性。
