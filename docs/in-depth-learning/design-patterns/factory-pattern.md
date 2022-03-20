# 工厂模式

> 此处介绍的工厂模式是基于前端场景下的设计模式应用，因此会与传统的设计模式有所区别，主要体现在过程会更简化。

## 介绍

工厂模式（Factory Pattern），根据不同的输入返回不同类的实例，一般用来创建同一类对象。工厂方式的主要思想是**将对象的创建与对象的实现分离**。

在 JS 中的应用：

* 将 `new` 操作单独封装
* 遇到 `new` 时，就要考虑是否该使用工厂模式

## 通俗的示例

* 我们去 KFC 购买汉堡，只需直接点餐、取餐，不用自己亲手做
* KFC 要「封装」做汉堡的工作，做好直接给购买者

在类似场景中，这些例子有以下特点：

* 访问者只需要知道产品名，就可以从工厂获得对应实例；
* 访问者不关心实例创建过程；

## UML 类图

传统的工厂模式 UML 类图比较复杂，因为像 Java 等语言中有「接口」的概念。但 JS 中没有接口，即使可以用再加一层父类的形式来代替接口，但「用不同的子类继承父类，从而实现不同子类」的场景比较少，所以简化后的 UML 类图如下：

* Creator 是工厂类
* Product 是产品类

<div style="text-align: center;">
  <svg id="SvgjsSvg1068" width="758" height="235" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1069"><marker id="SvgjsMarker1108" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1109" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1112" markerWidth="14" markerHeight="12" refX="16" refY="6" viewBox="0 0 14 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1113" d="M1,1 L14,6 L1,11L1,1" fill="#ffffff" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1116" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1117" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1070" transform="translate(25,110.5)"><path id="SvgjsPath1071" d="M 0 4Q 0 0 4 0L 226 0Q 230 0 230 4L 230 86Q 230 90 226 90L 4 90Q 0 90 0 86Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1072" d="M 0 30L 230 30M 0 62L 230 62" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"></path><path id="SvgjsPath1073" d="M 0 0L 230 0L 230 90L 0 90Z" stroke="none" fill="none"></path><g id="SvgjsG1074"><text id="SvgjsText1075" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="210px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="4.375" transform="rotate(0)"><tspan id="SvgjsTspan1076" dy="16" x="115"><tspan id="SvgjsTspan1077" style="text-decoration:;">Creator</tspan></tspan></text></g><g id="SvgjsG1078"><text id="SvgjsText1079" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.375" transform="rotate(0)"><tspan id="SvgjsTspan1080" dy="16" x="10"><tspan id="SvgjsTspan1081" style="text-decoration:;"> </tspan></tspan></text></g><g id="SvgjsG1082"><text id="SvgjsText1083" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="66.375" transform="rotate(0)"><tspan id="SvgjsTspan1084" dy="16" x="10"><tspan id="SvgjsTspan1085" style="text-decoration:;">+ create(name): Product</tspan></tspan></text></g></g><g id="SvgjsG1086" transform="translate(332,101)"><path id="SvgjsPath1087" d="M 0 4Q 0 0 4 0L 226 0Q 230 0 230 4L 230 105Q 230 109 226 109L 4 109Q 0 109 0 105Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1088" d="M 0 30L 230 30M 0 60L 230 60" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"></path><path id="SvgjsPath1089" d="M 0 0L 230 0L 230 109L 0 109Z" stroke="none" fill="none"></path><g id="SvgjsG1090"><text id="SvgjsText1091" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="210px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="4.375" transform="rotate(0)"><tspan id="SvgjsTspan1092" dy="16" x="115"><tspan id="SvgjsTspan1093" style="text-decoration:;">Product</tspan></tspan></text></g><g id="SvgjsG1094"><text id="SvgjsText1095" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.375" transform="rotate(0)"><tspan id="SvgjsTspan1096" dy="16" x="10"><tspan id="SvgjsTspan1097" style="text-decoration:;">+ name: String</tspan></tspan></text></g><g id="SvgjsG1098"><text id="SvgjsText1099" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="57.375" transform="rotate(0)"><tspan id="SvgjsTspan1100" dy="16" x="10"><tspan id="SvgjsTspan1101" style="text-decoration:;">+ init()</tspan></tspan><tspan id="SvgjsTspan1102" dy="16" x="10"><tspan id="SvgjsTspan1103" style="text-decoration:;">+ fn1()</tspan></tspan><tspan id="SvgjsTspan1104" dy="16" x="10"><tspan id="SvgjsTspan1105" style="text-decoration:;">+ fn2()</tspan></tspan></text></g></g><g id="SvgjsG1106"><path id="SvgjsPath1107" d="M256 155.5L293.5 155.5L293.5 155.5L328.4 155.5" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1108)"></path></g><g id="SvgjsG1110"><path id="SvgjsPath1111" d="M590 44L616.5 44L616.5 44L643 44" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1112)"></path></g><g id="SvgjsG1114"><path id="SvgjsPath1115" d="M590 75L615.5 75L615.5 75L641 75" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1116)"></path></g><g id="SvgjsG1118" transform="translate(613,25)"><path id="SvgjsPath1119" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1120"><text id="SvgjsText1121" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1122" dy="16" x="60"><tspan id="SvgjsTspan1123" style="text-decoration:;">继承自</tspan></tspan></text></g></g><g id="SvgjsG1124" transform="translate(613,55)"><path id="SvgjsPath1125" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1126"><text id="SvgjsText1127" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1128" dy="16" x="60"><tspan id="SvgjsTspan1129" style="text-decoration:;">引用了</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（简单工厂模式类图）</p>
</div>

## 工厂模式的代码演示

```javascript
class Product {
  constructor(name) {
    this.name = name;
  }
  init() {
    console.log('init');
  }
  fun1() {
    console.log('fun1');
  }
  fun2() {
    console.log('fun2');
  }
}

class Creator {
  create(name) {
    return new Product(name);
  }
}

// 测试
let creator = new Creator();
let p = creator.create('p1');
p.init();
p.fun1();
```

这样就完成了一个工厂模式，但是这个实现有一个问题：工厂中会包含很多与创建产品相关的过程，如果产品种类很多的话，这个工厂中就会罗列很多产品的创建逻辑，每次新增或删除产品种类，不仅要增加产品类，还需要对应地去修改工厂中的方法，违反了开闭原则，也导致这个工厂类变得臃肿、高耦合。

严格上这种实现在面向对象语言中叫做**简单工厂模式**。适用于产品种类比较少，创建逻辑不复杂的时候使用。

工厂模式的本意是将实际创建对象的过程推迟到子类中，一般用抽象类来作为父类，创建过程由抽象类的子类来具体实现。JavaScript 中没有抽象类（或者 Java 中的接口），所以我们可以简单地将工厂模式看做是一个实例化对象的工厂类即可。

## 工厂模式的实际应用

### Vue/React 源码中的工厂模式

和原生的 `document.createElement` 类似，Vue 和 React 这种具有虚拟 DOM 树（Virtual Dom Tree）机制的框架在生成虚拟 DOM 的时候，都提供了 `createElement` 方法用来生成 VNode，用来作为真实 DOM 节点的映射：

```javascript
// Vue
createElement('h3', { class: 'main-title' }, [
  createElement('img', { class: 'avatar', attrs: { src: '../avatar.jpg' } }),
  createElement('p', { class: 'user-desc' }, '放弃不难，但坚持一定很酷')
])

// React
React.createElement('h3', { className: 'user-info' },
  React.createElement('img', { src: '../avatar.jpg', className: 'avatar' }),
  React.createElement('p', { className: 'user-desc' }, '放弃不难，但坚持一定很酷')
)
```

`createElement` 函数结构大概如下：

```javascript
class Vnode (tag, data, children) { ... }

function createElement(tag, data, children) {
  return new Vnode(tag, data, children)
}
```

可以看到 `createElement` 函数内会进行 VNode 的具体创建，创建的过程是很复杂的，而框架提供的 `createElement` 工厂方法封装了复杂的创建与验证过程，对于使用者来说就很方便了。

### vue-router 源码中的工厂模式

工厂模式在源码中应用频繁，以 vue-router 中的源码为例，代码位置：[vue-router/src/index.js](https://github.com/vuejs/vue-router/blob/v3.0.6/src/index.js)

```javascript
// src/index.js
export default class VueRouter {
  constructor(options) {
    this.mode = mode	// 路由模式
        
    switch (mode) {     // 简单工厂
      case 'history':   // history 方式
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':      // hash 方式
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':  // abstract 方式
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        // ... 初始化失败报错
    }
  }
}
```

稍微解释一下这里的源码。`mode` 是路由创建的模式，这里有三种 History、Hash、Abstract，前两种我们已经很熟悉了，History 是 H5 的路由方式，Hash 是路由中带 `#` 的路由方式，Abstract 代表非浏览器环境中路由方式，比如 Node、weex 等；`this.history` 用来保存路由实例，vue-router 中使用了工厂模式的思想来获得响应路由控制类的实例。

源码里没有把工厂方法的产品创建流程封装出来，而是直接将产品实例的创建流程暴露在 `VueRouter` 的构造函数中，在被 `new` 的时候创建对应产品实例，相当于 `VueRouter` 的构造函数就是一个工厂方法。

如果一个系统不是 SPA （Single Page Application，单页应用），而是是 MPA（Multi Page Application，多页应用），那么就需要创建多个 `VueRouter` 的实例，此时 `VueRouter` 的构造函数也就是工厂方法将会被多次执行，以分别获得不同实例。

## 设计原则验证

* 构造函数和创建者分离
* 符合开放封闭原则

## 工厂模式的优缺点

优点：

* 良好的封装，代码结构清晰，**访问者无需知道对象的创建流程**，特别是创建比较复杂的情况下。
* 扩展性优良，通过工厂方法隔离了用户和创建流程隔离，**符合开放封闭原则**。
* 解耦了高层逻辑和底层产品类，**符合最少知识原则**，不需要的就不要去交流。

缺点：

* 带来了**额外的系统复杂度**，增加了抽象性。

## 工厂模式的使用场景

那么什么时候使用工厂模式呢：

* 对象的创建比较复杂，而访问者无需知道创建的具体流程。
* 处理大量具有相同属性的小对象。

什么时候不该用工厂模式：滥用只是增加了不必要的系统复杂度，过犹不及。

（完）
