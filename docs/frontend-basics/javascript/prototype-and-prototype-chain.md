# 原型与原型链

## 前言

网上有句话：JavaScript 中万物皆对象，对象皆出自构造函数（这里的万物主要指引用类型）。

比如下面代码：

```javascript
function Foo() {

}
var foo = new Foo();
foo.name = 'hello';
console.log(person.name) // hello
```

在这个例子中，`Foo` 就是一个构造函数，我们使用 `new` 创建了一个实例对象 `foo`。

## 函数对象和普通对象

在 ES6 以前没有 class 关键字，所以 JavaScript 用函数来模拟的类实现，也就是函数对象。因此 JavaScript 的对象分为函数对象和普通对象。

```javascript
// 函数对象: typeof 打印出来是 function
Object
Function
function fun1(){};
const fun2 = function(){};
const fun3 = new Function('name','console.log(name)');
```

```javascript
// 普通对象: typeof 打印出来是 object
const obj1 = {};
const obj2 = new Object();
const obj3 = new fun1();
const obj4 = new new Function();
```

## 三大属性

* 对象独有的属性：
  * `__proto__`
  * `constructor`

* 函数独有的属性（函数也是对象）：
  * `prototype`
  * `__proto__`
  * `constructor`

### `prototype`

又称显式原型，每个函数在创建之后都会拥有一个 `prototype` 属性，它指向函数的原型对象（又称：它指向以当前函数作为构造函数构造出来的对象的原型对象）。

<div style="text-align: center;">
  <svg id="SvgjsSvg1034" width="496" height="130.5" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1035"><marker id="SvgjsMarker1054" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1055" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1036" transform="translate(25,64.5)"><path id="SvgjsPath1037" d="M 0 0L 100 0L 100 41L 0 41Z" stroke="none" fill="none"></path><g id="SvgjsG1038"><text id="SvgjsText1039" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="100px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1.5" transform="rotate(0)"><tspan id="SvgjsTspan1040" dy="20" x="50"><tspan id="SvgjsTspan1041" style="text-decoration:;">Foo</tspan></tspan><tspan id="SvgjsTspan1042" dy="20" x="50"><tspan id="SvgjsTspan1043" style="text-decoration:;">（构造函数）</tspan></tspan></text></g></g><g id="SvgjsG1044" transform="translate(292,64.5)"><path id="SvgjsPath1045" d="M 0 0L 179 0L 179 41L 0 41Z" stroke="none" fill="none"></path><g id="SvgjsG1046"><text id="SvgjsText1047" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="179px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1.5" transform="rotate(0)"><tspan id="SvgjsTspan1048" dy="20" x="89.5"><tspan id="SvgjsTspan1049" style="text-decoration:;">Foo.prototype</tspan></tspan><tspan id="SvgjsTspan1050" dy="20" x="89.5"><tspan id="SvgjsTspan1051" style="text-decoration:;">（构造函数的原型对象）</tspan></tspan></text></g></g><g id="SvgjsG1052"><path id="SvgjsPath1053" d="M125.92247253012533 84.6139372704285C 192 56 222 55 288.6726069710271 83.6257890879699" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1054)"></path></g><g id="SvgjsG1056" transform="translate(147.5,25)"><path id="SvgjsPath1057" d="M 0 0L 120 0L 120 41L 0 41Z" stroke="none" fill="none"></path><g id="SvgjsG1058"><text id="SvgjsText1059" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="9.75" transform="rotate(0)"><tspan id="SvgjsTspan1060" dy="17" x="60"><tspan id="SvgjsTspan1061" style="text-decoration:;">prototype</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（prototype 指向函数的原型对象）</p>
</div>

作用：给其它对象提供共享属性，用来实现基于原型的继承与属性的共享。

ECMAScript 规范约定了访问和操作 `prototype` 属性的 API：

* [Object.getPrototypeOf(obj)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)：可以返回指定对象的 `prototype` 对象。
* [Object.setPrototypeOf(obj, anotherObj)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)：可以设置指定对象的 `prototype` 对象。

### `__proto__`

又称隐式原型，是每个对象（除了 `null`）都具有的属性，它指向该对象的原型。

<div style="text-align: center;">
  <svg id="SvgjsSvg1114" width="497.5" height="235" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1115"><marker id="SvgjsMarker1136" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1137" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1154" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1155" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1164" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1165" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1116" transform="translate(25,67)"><path id="SvgjsPath1117" d="M 0 0L 100 0L 100 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1118"><text id="SvgjsText1119" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="100px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1" transform="rotate(0)"><tspan id="SvgjsTspan1120" dy="20" x="50"><tspan id="SvgjsTspan1121" style="text-decoration:;">Foo</tspan></tspan><tspan id="SvgjsTspan1122" dy="20" x="50"><tspan id="SvgjsTspan1123" style="text-decoration:;">（构造函数）</tspan></tspan></text></g></g><g id="SvgjsG1124" transform="translate(294.5,55)"><path id="SvgjsPath1125" d="M 0 0L 178.5 0L 178.5 66L 0 66Z" stroke="none" fill="none"></path><g id="SvgjsG1126"><text id="SvgjsText1127" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="179px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1" transform="rotate(0)"><tspan id="SvgjsTspan1128" dy="20" x="89.5"><tspan id="SvgjsTspan1129" style="text-decoration:;">Foo.prototype</tspan></tspan><tspan id="SvgjsTspan1130" dy="20" x="89.5"><tspan id="SvgjsTspan1131" style="text-decoration:;">（构造函数的原型对象、</tspan></tspan><tspan id="SvgjsTspan1132" dy="20" x="89.5"><tspan id="SvgjsTspan1133" style="text-decoration:;font-size: inherit;">实例的原型）</tspan></tspan></text></g></g><g id="SvgjsG1134"><path id="SvgjsPath1135" d="M125.90840661856316 87.58191219181779C 187 58 232 56 291.2580309350393 86.43486850972903" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1136)"></path></g><g id="SvgjsG1138" transform="translate(149.75,25)"><path id="SvgjsPath1139" d="M 0 0L 120 0L 120 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1140"><text id="SvgjsText1141" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="10.25" transform="rotate(0)"><tspan id="SvgjsTspan1142" dy="17" x="60"><tspan id="SvgjsTspan1143" style="text-decoration:;">prototype</tspan></tspan></text></g></g><g id="SvgjsG1144" transform="translate(25,168)"><path id="SvgjsPath1145" d="M 0 0L 100 0L 100 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1146"><text id="SvgjsText1147" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="100px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1" transform="rotate(0)"><tspan id="SvgjsTspan1148" dy="20" x="50"><tspan id="SvgjsTspan1149" style="text-decoration:;">foo</tspan></tspan><tspan id="SvgjsTspan1150" dy="20" x="50"><tspan id="SvgjsTspan1151" style="text-decoration:;">（实例对象）</tspan></tspan></text></g></g><g id="SvgjsG1152"><path id="SvgjsPath1153" d="M75 110L75 164.39999999999998" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1154)"></path></g><g id="SvgjsG1156" transform="translate(149.75,153)"><path id="SvgjsPath1157" d="M 0 0L 120 0L 120 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1158"><text id="SvgjsText1159" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="10.25" transform="rotate(0)"><tspan id="SvgjsTspan1160" dy="17" x="60"><tspan id="SvgjsTspan1161" style="text-decoration:;">__proto__</tspan></tspan></text></g></g><g id="SvgjsG1162"><path id="SvgjsPath1163" d="M125.9999922331748 189.00394126757556C 232.01443827820617 189 363 200 382.5873258109997 124.40707920809487" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1164)"></path></g></svg>
  <p style="text-align: center; color: #888;">（__proto__ 指向对象的原型）</p>
</div>

```javascript
// 实例对象的 __proto__  = 实例对象的构造函数的 prototype
foo.__proto__ === Foo.prototype // true

// 构造函数(也是个对象)的 __proto__ = Function 的 prototype
Foo.__proto__ === Function.prototype // true
```

为什么叫隐式原型呢？因为这个 `__proto__` 是一个隐藏的属性，它只是开发者工具方便开发者查看原型而故意渲染出来的一个虚拟节点，实则并不存在于该对象上。这其实是一个历史问题，当时一些浏览器私自实现了` __proto__` 这个属性（后被 ES5 纳入规范），使得可以通过 `obj.__proto__` 来访问对象的原型。

特点：

* `__proto__` 属性既不能被 `for in` 遍历出来，也不能被 `Object.keys(obj)` 查找出来。
* 访问对象的 `obj.__proto__` 属性，默认走的是 `Object.prototype` 对象上 `__proto__` 属性的 get/set 方法。

```javascript
Object.defineProperty(Object.prototype, '__proto__', {
  get(){
    console.log('get')
  }
});

({}).__proto__;
console.log((new Object()).__proto__);
```

作用：`__proto__` 的本质是一个对象指向另一个对象（可以理解为父类对象），有了它，当访问一个对象属性的时候，如果该对象内部不存在这个属性，那么就会去它的 `__proto__` 所指向的对象（父类对象）上查找，如此一层层往上查找，直到找到 `null`。所以可以说，`__proto__` 构成了**原型链**，同样用于实现基于原型的继承。

::: tip
有时候还会看到一个 `[[prototype]]`，它和 `__proto__` 意义相同，均表示对象的内部属性，其值指向对象原型。前者在一些书籍、规范中表示一个对象的原型属性，默认情况下是不可以再被外部访问的，估计是会被一些内部方法使用的，例如用 `for in` 来遍历原型链上可以被枚举的属性的时候，就需要通过这个指针找到当前对象所继承的对象；后者则是在浏览器实现中支持的一个属性，用于指向对象的原型。
:::

### `constructor`

每个原型对象都有一个 `constructor` 属性指向关联的构造函数。

<div style="text-align: center;">
  <svg id="SvgjsSvg1166" width="497.5" height="255" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1167"><marker id="SvgjsMarker1188" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1189" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1206" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1207" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1216" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1217" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1220" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1221" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1168" transform="translate(25,67)"><path id="SvgjsPath1169" d="M 0 0L 100 0L 100 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1170"><text id="SvgjsText1171" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="100px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1" transform="rotate(0)"><tspan id="SvgjsTspan1172" dy="20" x="50"><tspan id="SvgjsTspan1173" style="text-decoration:;">Foo</tspan></tspan><tspan id="SvgjsTspan1174" dy="20" x="50"><tspan id="SvgjsTspan1175" style="text-decoration:;">（构造函数）</tspan></tspan></text></g></g><g id="SvgjsG1176" transform="translate(294.5,55)"><path id="SvgjsPath1177" d="M 0 0L 178.5 0L 178.5 66L 0 66Z" stroke="none" fill="none"></path><g id="SvgjsG1178"><text id="SvgjsText1179" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="179px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="1" transform="rotate(0)"><tspan id="SvgjsTspan1180" dy="20" x="89.5"><tspan id="SvgjsTspan1181" style="text-decoration:;">Foo.prototype</tspan></tspan><tspan id="SvgjsTspan1182" dy="20" x="89.5"><tspan id="SvgjsTspan1183" style="text-decoration:;">（构造函数的原型对象、</tspan></tspan><tspan id="SvgjsTspan1184" dy="20" x="89.5"><tspan id="SvgjsTspan1185" style="text-decoration:;font-size: inherit;">实例的原型）</tspan></tspan></text></g></g><g id="SvgjsG1186"><path id="SvgjsPath1187" d="M125.90840661856316 87.58191219181779C 187 58 232 56 291.2580309350393 86.43486850972903" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1188)"></path></g><g id="SvgjsG1190" transform="translate(149.75,25)"><path id="SvgjsPath1191" d="M 0 0L 120 0L 120 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1192"><text id="SvgjsText1193" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="10.25" transform="rotate(0)"><tspan id="SvgjsTspan1194" dy="17" x="60"><tspan id="SvgjsTspan1195" style="text-decoration:;">prototype</tspan></tspan></text></g></g><g id="SvgjsG1196" transform="translate(25,188)"><path id="SvgjsPath1197" d="M 0 0L 100 0L 100 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1198"><text id="SvgjsText1199" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="100px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1" transform="rotate(0)"><tspan id="SvgjsTspan1200" dy="20" x="50"><tspan id="SvgjsTspan1201" style="text-decoration:;">foo</tspan></tspan><tspan id="SvgjsTspan1202" dy="20" x="50"><tspan id="SvgjsTspan1203" style="text-decoration:;">（实例对象）</tspan></tspan></text></g></g><g id="SvgjsG1204"><path id="SvgjsPath1205" d="M75 110L75 184.39999999999998" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1206)"></path></g><g id="SvgjsG1208" transform="translate(149.75,173)"><path id="SvgjsPath1209" d="M 0 0L 120 0L 120 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1210"><text id="SvgjsText1211" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="10.25" transform="rotate(0)"><tspan id="SvgjsTspan1212" dy="17" x="60"><tspan id="SvgjsTspan1213" style="text-decoration:;">__proto__</tspan></tspan></text></g></g><g id="SvgjsG1214"><path id="SvgjsPath1215" d="M125.99998846679 209.00480273745103C 234.32195570881447 209 375 223 383.2199569322993 124.56076597748046" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1216)"></path></g><g id="SvgjsG1218"><path id="SvgjsPath1219" d="M293 100C 242 126 177 128 126.28799558594005 101.5401283852448" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1220)"></path></g><g id="SvgjsG1222" transform="translate(149.75,117)"><path id="SvgjsPath1223" d="M 0 0L 120 0L 120 42L 0 42Z" stroke="none" fill="none"></path><g id="SvgjsG1224"><text id="SvgjsText1225" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="10.25" transform="rotate(0)"><tspan id="SvgjsTspan1226" dy="17" x="60"><tspan id="SvgjsTspan1227" style="text-decoration:;">constructor</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（原型对象的 constructor 指向构造函数）</p>
</div>

```javascript
// 原型对象的 constructor 指向关联的构造函数
Foo.prototype.constructor === Foo // true
// ES5 提供的 API
Object.getPrototypeOf(foo) === Foo.prototype
```

换言之：只有原型对象（prototype 对象）才有这个属性。但对于通过函数创建的实例对象，虽然没有这个属性，也能通过 `__proto__` 获取原型对象然后间接找到这个属性。

```javascript
// 通过 __proto__ 获取原型对象, 然后间接找到它的构造函数
foo.__proto__.constructor === Foo.prototype.constructor // true
```

所以任何对象最终都可以找到其对应的构造函数。

## 理清错综复杂的关系

### 区分：`__proto__` 和 `prototype`

* `__proto__` 指向的是当前对象（实例对象、函数对象）的原型对象。
* `prototype` 指向以当前函数作为构造函数构造出来的对象的原型对象。

::: tip 重要结论
**实例的 `__proto__` = 它的构造函数的 `prototype`**。
:::

基于这个结论，可以推到出几个公式：

* 如果前者作用在实例对象上，后者作用在该实例对象的构造函数上，那么它们是一个东西：

```javascript
foo.__proto__ === Foo.prototype // true
```

* 如果前者作用在构造函数上，那么：

```javascript
// JS 中所有函数都是 Function 的实例(因为函数也是对象), 此时又回归了上一条公式
Foo.__proto__ === Function.prototype // true

// 由此可以类推内置函数, 因为它们也是由 Function 构造出来的
Number.__proto__ === Function.prototype // true
Object.__proto__ === Function.prototype // true
```

* `Function` 是老祖宗，它是它自己的构造函数：

```javascript
Function.__proto__ === Function.prototype
```

### 区分：Object 和 Function

`Function` 和 `Object` 都是构造函数，构造函数都有 `prototype`。

它们的关系比较绕，但是只要记住几个最根本的结论，一切就清楚了：

* JS 中所有函数都是 `Function` 的实例，所以：

```javascript
// 实例的 __proto__ = 它的构造函数的 prototype (重要的结论 again)
Object.__proto__ === Function.prototype // true
Function.__proto__ === Function.prototype // true
```

* 万物皆对象，原型对象也是对象，对象的构造函数是 `Object`，所以：

```javascript
// 构造函数的原型对象 => 是个对象 => 是 Object 构造函数的实例对象
// 实例的 __proto__ = 它的构造函数的 prototype (重要的结论 again)
Foo.prototype.__proto__==Object.prototype // true
Function.prototype.__proto__==Object.prototype  // true

// Object.prototype 是所有对象的顶层
// 或者说 Object.prototype 没有原型，原型链的尽头是 null
Object.prototype.__proto__ === null
```

## 原型链

原型链是 JavaScript 作者为了继承而设计的，简单理解就是从实例对象开始，通过 `__proto__` 链接子父类对象，一层层查找对象自身拥有或继承的属性和方法，直到找到 `null`。

整个查找的过程就像产生了一个链条，如下图所示:

<div style="text-align: center;">
  <p style="text-align: center; color: #888;">（原型链）</p>
</div>




## 原型

任何一个函数，都拥有一个 `prototype` 属性，它指向这个函数的原型对象，如：

```javascript
function Foo () {}
console.log(Foo.prototype); // { constructor: f Foo(), __proto__: Object }
```

画图表示如下：

<div style="text-align: center;">
  <img src="./assets/foo-prototype.png" alt="Foo 的原型" style="width: 650px;">
  <p style="text-align: center; color: #888">（Foo 的原型）</p>
</div>

上图左边代表 `Foo` 函数，它有一个 `prototype` 属性，指向右侧这个原型对象，每声明一个函数，都会有这样的一个原型对象，原型对象有一个 `constructor` 属性，指向 `Foo` 函数本身，也有个 `__proto__` 属性，这里我们暂且不讲。

---------------------------------------

我们来看 `Foo` 函数的实例化：

```javascript
const foo = new Foo();
```

这里我们通过 `new` 操作符实例化了一个 `foo` 对象，来看此时的图解：

<div style="text-align: center;">
  <img src="./assets/new-foo.png" alt="new Foo" style="width: 650px;">
  <p style="text-align: center; color: #888">（new Foo）</p>
</div>

`foo` 默认会有个 `__proto__` 属性，它也指向构造函数 `Foo` 的原型，这就是 `__proto__` 的作用，即**指向构造函数的原型**。

---------------------------------------

那让我们回到 `Foo.prototype.__proto__`，来看看他的指向吧：

<div style="text-align: center;">
  <img src="./assets/foo-prototype-__proto__.png" alt="Foo 原型的 __proto__" style="width: 650px;">
  <p style="text-align: center; color: #888">（Foo 原型的 __proto__）</p>
</div>

上图的 `Foo.prototype.__proto__` 指向 `Object.prototype`，也就是说：**每个函数的原型，都是 Object 的实例**。就好像每个函数的原型，是由 `new Object()` 产生一样。

以上就是关于原型的阐述，如果看到这里似懂非懂，建议反复看几遍，注意文字与图片对应，线条的指向，看懂了再接着往下看。

## 显式原型和隐式原型

* `prototype`：显式原型对象，每一个函数（除了 bind）在创建之后都会拥有一个名为 `prototype` 的内部属性，它指向函数的原型对象。用来实现基于原型的继承与属性的共享。
* `__proto__`：隐式原型对象，是每个对象都具有的属性，这个属性的值指向该对象的构造函数的原型对象。

**一个对象的隐式原型指向构造该对象的构造函数的显式原型对象**：

```javascript
foo.__proto__ === Foo.prototype // true
```

::: warning
`[[prototype]]` 和 `__proto__` 意义相同，均表示对象的内部属性，其值指向对象原型。前者在一些书籍、规范中表示一个对象的原型属性，默认情况下是不可以再被外部访问的，估计是会被一些内部方法使用的，例如用 for...in 来遍历原型链上可以被枚举的属性的时候，就需要通过这个指针找到当前对象所继承的对象；后者则是在浏览器实现中支持的一个属性，用于指向对象原型。
:::

## 原型方法

在 ES5 之前没有标准的方法访问 `[[prototype]]` 这个内置属性，但是大多数浏览器都支持通过 `__proto__` 访问。

如今，`__proto__` 被认为是过时且不推荐使用的（deprecated），这里的不推荐使用是指 JavaScript 规范中规定，`__proto__` 必须仅在浏览器环境下才能得到支持。

现代的方法有：

* [Object.create(proto, [propertiesObject])](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)：利用给定的 `proto` 作为 `[[Prototype]]` 和可选的属性描述来创建一个空对象。
* [Object.getPrototypeOf(obj)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)：返回对象 `obj` 的 `[[Prototype]]`。
* [Object.setPrototypeOf(obj, prototype)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)：将对象 `obj` 的 `[[Prototype]]` 设置为 `proto`。

应该使用这些方法来代替 `__proto__`。

例如：

```javascript {6,10,12}
let animal = {
  eats: true
};

// 创建一个以 animal 为原型的新对象
let rabbit = Object.create(animal);

console.log(rabbit.eats); // true

console.log(Object.getPrototypeOf(rabbit) === animal); // true

Object.setPrototypeOf(rabbit, {}); // 将 rabbit 的原型修改为 {}
```

`Object.create` 有一个可选的第二参数：属性描述器。我们可以在此处为新对象提供额外的属性，就像这样：

```javascript
let animal = {
  eats: true
};

let rabbit = Object.create(animal, {
  jumps: {
    value: true
  }
});

console.log(rabbit.jumps); // true
```

我们可以使用 `Object.create` 来实现比复制 `for..in` 循环中的属性更强大的对象克隆方式：

```javascript
let clone = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
```

此调用可以对 `obj` 进行真正准确地拷贝，包括所有的属性：可枚举和不可枚举的，数据属性和 setters/getters —— 包括所有内容，并带有正确的 `[[Prototype]]`。

## 原型的关系

所有原生构造函数的 `__proto__` 都指向 `Function.prototype`，

即：`原生构造函数.__proto__ === Function.prototype`

```javascript
Object.__proto__   === Function.prototype;   // true
Function.__proto__ === Function.prototype;   // true
Number.__proto__   === Function.prototype;   // true
Boolean.__proto__  === Function.prototype;   // true
String.__proto__   === Function.prototype;   // true
Object.__proto__   === Function.prototype;   // true
Array.__proto__    === Function.prototype;   // true
RegExp.__proto__   === Function.prototype;   // true
Error.__proto__    === Function.prototype;   // true
Date.__proto__     === Function.prototype;   // true
```

进而有了：

```javascript
String.__proto__ === Boolean.__proto__
RegExp.__proto__ === Error.__proto__
Date.__proto__ === Number.__proto__
```

同理，函数原型的隐式原型都是对象，所以构造函数是 `Object`，

即：`Function.prototype.__proto__ === Object.prototype`

```javascript
Object.__proto__.__proto__   === Object.prototype;   // true
Function.__proto__.__proto__ === Object.prototype;   // true
Number.__proto__.__proto__   === Object.prototype;   // true
Boolean.__proto__.__proto__  === Object.prototype;   // true
String.__proto__.__proto__   === Object.prototype;   // true
Object.__proto__.__proto__   === Object.prototype;   // true
Array.__proto__.__proto__    === Object.prototype;   // true
RegExp.__proto__.__proto__   === Object.prototype;   // true
Error.__proto__.__proto__    === Object.prototype;   // true
Date.__proto__.__proto__     === Object.prototype;   // true
```

## 原型链

原型链是 JavaScript 作者为了继承而设计的。由上边的分析，`const foo = new Foo()` 语句，其实是产生了一个链条的，如下:

<div style="text-align: center;">
  <img src="./assets/prototype-chain.png" alt="原型链" style="width: 650px;">
  <p style="text-align: center; color: #888">（原型链）</p>
</div>

我们在 new 出 `foo` 对象后，并没有给 `foo` 对象添加任何方法，但我们依然能从 `foo` 对象中调用 `toString()`、 `hasOwnProperty()` 等方法。这是为什么呢？

```javascript
console.log(typeof foo.toString); // function
console.log(typeof foo.hasOwnProperty); // function
```

原因是：JavaScript 在设计之初，`__proto__` 就是用来查找属性和方法的。

从上图的链条来看，我们在 `foo` 这个对象中，查找 toString 方法，没找到，就循着 `foo.__proto__` 查找，`foo.__proto__` 里也没有找到，就循着 `foo.__proto__.__proto__` 找，这个时候找到了，则调用；如果还找不到，就再往上找，即 `foo.__proto__._proto__._proto__`，这个时候值为 `null`，查找结束。

这就是原型链，我们也可以说，`Foo` 继承了 `Object`，所以 `foo` 中能访问到 Object 的原型属性。

（完）
