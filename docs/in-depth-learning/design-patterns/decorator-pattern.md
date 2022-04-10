# 装饰器模式

## 介绍

装饰器模式（Decorator Pattern）又称装饰者模式，在不改变原对象的基础上，通过对其添加属性或方法来进行包装拓展，使得原有对象可以动态具有更多功能。

本质是功能**动态组合**，即动态地给一个对象添加额外的职责，就增加功能角度来看，使用装饰器模式比用继承更为灵活。好处是有效地把对象的核心职责和装饰功能区分开，并且通过动态增删装饰去除目标对象中重复的装饰逻辑。

## 通俗的示例

就像给手机套上手机壳，在不影响手机本来功能的同时，套上壳子可以起到保护手机、美观装饰等作用。

在类似场景中，这些例子有以下特点：

* 装饰不影响原有的功能，原有功能可以照常使用。
* 装饰可以增加多个，共同给目标对象添加额外功能。

## 装饰器模式的通用实现

还是由于是在 JS 中应用，所以实现装饰器模式的时候，大可不必走 Java 那一套面向对象花里胡哨的过程（子类实现接口，子类实现接口……）

结构如下：

<div style="text-align: center;">
  <img src="./assets/decorator-pattern.jpg" alt="装饰器模式结构图">
  <p style="text-align: center; color: #888;">（装饰器模式结构图）</p>
</div>

代码如下：

> 以下代码模拟实现了装修房子的例子，目标对象是个毛坯房，用两个装饰器（墙壁刷漆，搬入家具）去装饰它。

```javascript
/* 毛坯房 - 目标对象 */
class OriginHouse {
  getDesc() {
    console.log('毛坯房');
  }
}

/* 墙壁刷漆 - 装饰者 */
class Painting {
  constructor(house) {
    this.house = house;
  }
    
  getDesc() {
    this.house.getDesc();
    console.log('墙壁刷漆');
  }
}

/* 搬入家具 - 装饰者 */
class Furniture {
  constructor(house) {
    this.house = house;
  }
    
  getDesc() {
    this.house.getDesc();
    console.log('搬入家具');
  }
}

// 测试
let house = new OriginHouse();
house = new Furniture(house);
house = new Painting(house);

house.getDesc()
// 输出：毛坯房  墙壁刷漆  搬入家具
```

在装饰器模式中，一个对象被另一个对象包装起来，形成一条包装链，并增加了原先对象的功能。和适配器模式的区别在于，适配器模式是原有的接口不能用了，所以需要一个新的；而装饰器模式是原有的还要继续用，新增的是来完善和强化的。

::: tip 值得注意的是
EcmaScript 标准（ES7）中的 Decorator 提案仍然在 stage-2 且极其不稳定。过去一年内已经经历了两次彻底大改，且和 TS 现有的实现已经完全脱节。— 尤雨溪 2019.6.12
:::

因此本文不准备对 JavaScript 的装饰器 Decorator 进行相关介绍。

## 装饰器模式的实际应用

适配器模式在日常开发中还是比较常见的，可能你已经使用了，但因为没有学过设计模式，所以不知道这种实现方式有个叫「适配器模式」的名字。

### 给浏览器事件添加新功能

之前介绍的添加装饰器函数的方式，经常被用来给原有浏览器或 DOM 绑定事件上绑定新的功能，比如在 `onload` 上增加新的事件，或在原来的事件绑定函数上增加新的功能，或者在原本的操作上增加用户行为埋点：

```javascript
window.onload = function() {
  console.log('原先的 onload 事件');
}

/* 发送埋点信息 */
function sendUserOperation() {
  console.log('埋点：用户当前行为路径为 ...');
}

/* 将新的功能添加到 onload 事件上 */
window.onload = function() {
  let originOnload = window.onload;
  return function() {
    originOnload && originOnload();
    sendUserOperation();
  }
}()

// 输出：原先的 onload 事件
// 输出：埋点：用户当前行为路径为 ...
```

可以看到通过添加装饰函数，为 `onload` 事件回调增加新的方法，且并不影响原本的功能，我们可以把上面的方法提取出来作为一个工具方法：

```javascript
window.onload = function() {
  console.log('原先的 onload 事件');
}

/* 发送埋点信息 */
function sendUserOperation() {
  console.log('埋点：用户当前行为路径为 ...');
}

/* 给原生事件添加新的装饰方法 */
function originDecorateFn(originObj, originKey, fn) {
  originObj[originKey] = function() {
    let originFn = originObj[originKey];
    return function() {
      originFn && originFn();
      fn();
    }
  }()
}

// 添加装饰功能
originDecorateFn(window, 'onload', sendUserOperation);

// 输出：原先的 onload 事件
// 输出：埋点：用户当前行为路径为 ...
```

### TypeScript 中的装饰器

TypeScript 作为 JavaScript 的超集语言，它自带的装饰器和 Java 中的注解 Annotation、Python 中的装饰器 Decorator，有着很大的相似之处。

TypeScript 中的装饰器可以被附加到类声明、方法、访问符、属性和参数上，装饰器的类型有参数装饰器、方法装饰器、访问器或参数装饰器、参数装饰器。

TypeScript 中的装饰器使用 `@expression` 这种形式，`expression` 求值后为一个函数，它在运行时被调用，被装饰的声明信息会被做为参数传入。

多个装饰器应用使用在同一个声明上时：

* 由上至下依次对装饰器表达式求值。
* 求值的结果会被当成函数，**由下至上**依次调用。

那么使用官网的一个例子：

```typescript
function f() {
  console.log("f(): evaluated");
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("f(): called");
  }
}

function g() {
  console.log("g(): evaluated");
  return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("g(): called");
  }
}

// 测试
class C {
  @f()
  @g()
  method() {}
}

// f(): evaluated
// g(): evaluated
// g(): called
// f(): called
```

可以看到上面的代码中，高阶函数 `f` 与 `g` 返回了另一个函数（装饰器函数），所以 `f`、`g` 这里又被称为装饰器工厂，即帮助用户传递可供装饰器使用的参数的工厂。另外注意，演算的顺序是从下到上，执行的时候是从下到上的。

## 设计原则验证

* 将现有对象和装饰器进行分离，两者独立存在
* 符合开放封闭原则

## 装饰器模式的优缺点

优点：

* 我们经常使用继承的方式来实现功能的扩展，但这样会给系统中带来很多的子类和复杂的继承关系，装饰者模式允许用户在不引起子类数量暴增的前提下动态地修饰对象，添加功能，**装饰者和被装饰者之间松耦合**，可维护性好。
* 被装饰者可以使用装饰者**动态地增加和撤销功能**，可以在运行时选择不同的装饰器，实现不同的功能，灵活性好。
* 装饰者模式把一系列复杂的功能分散到每个装饰器当中，一般一个装饰器只实现一个功能，可以给一个对象增加多个同样的装饰器，也可以把一个装饰器用来装饰不同的对象，**有利于装饰器功能的复用**。
* 可以通过选择不同的装饰者的组合，**创造不同行为和功能的结合体**，原有对象的代码无须改变，就可以使得原有对象的功能变得更强大和更多样化，符合开闭原则。

缺点：

* 使用装饰者模式时会产生很多细粒度的装饰者对象，这些装饰者对象由于接口和功能的多样化导致系统复杂度增加，功能越复杂，需要的细粒度对象越多。
* 由于更大的灵活性，也就更容易出错，特别是对于多级装饰的场景，错误定位会更加繁琐。

## 装饰器模式的适用场景

* 如果不希望系统中增加很多子类，那么可以考虑使用装饰者模式。
* 需要通过对现有的一组基本功能进行排列组合而产生非常多的功能时，采用继承关系很难实现，这时采用装饰者模式可以很好实现。
* 当对象的功能要求可以动态地添加，也可以动态地撤销，可以考虑使用装饰者模式。

## 其他相关模式

### 装饰器模式与适配器模式

装饰者模式和适配器模式都是属于包装模式，然而他们的意图有些不一样：

* **装饰器模式**：扩展功能，原有功能还可以直接使用，一般可以给目标对象多次叠加使用多个装饰者。
* **适配器模式**：功能不变，但是转换了原有接口的访问格式，一般只给目标对象使用一次。

### 装饰器模式与组合模式

这两个模式有相似之处，都涉及到对象的递归调用，从某个角度来说，可以把装饰器模式看做是只有一个组件的组合模式。

* **装饰器模式**：动态地给对象增加功能。
* **组合模式**：管理组合对象和叶子对象，为它们提供一致的操作接口给客户端，方便客户端的使用。

### 装饰器模式与策略模式

装饰器模式和策略模式都包含有许多细粒度的功能模块，但是他们的使用思路不同：

* **装饰者模式**：可以递归调用，使用多个功能模式，功能之间可以叠加组合使用。
* **策略模式**：只有一层选择，选择某一个功能。

（完）
