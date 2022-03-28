# 原型模式

## 介绍

原型模式（Prototype Pattern）不是指的 JS 的原型，它是 clone 自己，生成一个新对象的操作。因为 new 一个新对象的时候开销会比较大，或者由于其他原因不合适，所以采用这种方式创建一个一模一样的对象。

Java 默认有 clone 接口，不用自己实现。JS 中有一个比较像的实现就是 `Object.create` 方法。

## 原型模式的通用实现

```javascript
// 一个对象（作为原型）
const prototype = {
  getName: function() {
    return this.first + '' + this.last;
  },
  say: function() {
    console.log('hello world');
  }
}

// 基于原型创建 x
let x = Object.create(prototype);
x.first = 'A';
x.last = 'B';
console.log(x.getName());
x.say();

// 基于原型创建 y
let y = Object.create(prototype);
y.first = 'C';
y.last = 'D';
console.log(y.getName());
y.say();
```

## 对比 JS 中的原型（prototype）

* JS 中的 prototype 可以理解为 ES6 class 的一种底层原理
  * 上面用到的 `Object.create` 方法也是基于原型 prototype 的
* 而 class 是实现面向对象的基础，并不是服务于某个模式
* 若干年后 ES6 全面普及，大家可能会忽略掉 prototype，但是 `Object.create` 却会长久存在

（完）
