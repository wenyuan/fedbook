# 浅克隆与深克隆

## 前言

**浅克隆**：浅克隆只是拷贝基本类型数据。对于引用类型数据，是将栈内存中的引用复制一份，赋给一个新的变量，本质上两个指向堆内存中的同一地址，内容也相同，其中一个变化另一个内容也会变化。

**深克隆**：就是创建一个新的空对象，开辟一块内存，然后将原对象中的数据全部复制过去，完全切断两个对象间的联系。新对象跟原对象不共享内存，修改新对象不会改到原对象。

**区别**：浅克隆和深克隆最大的区别就是对引用值的处理了，即浅克隆之后**你改我也改**，深克隆之后**你改我不改**。

**基本类型数据**：保存在栈（stack）内存。

**引用类型数据**：保存在堆（heap）内存。

## 浅克隆概念

在浅克隆中，原始值的克隆没问题，只是值的拷贝，不会出现你改我改的问题。但是引用值的克隆，就会出现你改我也改的问题，因为浅层克隆的是地址，即指向的是同一空间。

[手写实现浅克隆](/handwritten/javascript/实现浅克隆-shallow-clone/)

## 深克隆概念

进行深克隆之后，对于引用值的克隆问题就能解决了，因为在深克隆之后，值各自独立，互不影响。

[手写实现深克隆](/handwritten/javascript/实现深克隆-deep-clone/)

## 应用实例

### 浅克隆方法

* 直接赋值

* 手写（只拷贝对象或数组的第一层内容）

* 数组的 `Array.concat()`：

```javascript
let oldArr = ['one', 'two', 'three'];
let newArr = oldArr.concat();
newArr.push('four');

console.log(oldArr); // ["one", "two", "three"]
console.log(newArr); // ["one", "two", "three", "four"]
```

* 数组的 `Array.slice()`：

```javascript
let oldArr = ['one', 'two', 'three'];
let newArr = oldArr.slice();
newArr.push('four');

console.log(oldArr); // ["one", "two", "three"]
console.log(newArr); // ["one", "two", "three", "four"]
```

* 对象的 `Object.assign()`：

```javascript
let oldObj = {
  a: 'one',
  b: 'two',
  c: 'three'
};

let newObj = Object.assign({}, oldObj);
newObj.d = 'four';
console.log(oldObj); // {a: "one", b: "two", c: "three"}
console.log(newObj); // {a: "one", b: "two", c: "three", d: "four"}
```

* 数组和对象的解构赋值：

```javascript
let oldObj = {
  a: 'one',
  b: 'two',
  c: 'three'
};

let newObj = {...oldObj};
newObj.d = 'four';
console.log(oldObj); // {a: "one", b: "two", c: "three"}
console.log(newObj); // {a: "one", b: "two", c: "three", d: "four"}
```

### 深克隆方法

* 手写（层层拷贝对象或数组的每一层内容）

* 将数组和对象转成 JSON 字符串再转回来（`JSON.parse(JSON.stringify())`）：
  * `JSON.stringify() 的局限性`：对于 RegExp 类型和 Function 类型无法完全满足，而且不支持有循环引用的对象。([MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#描述))

```javascript
let oldObj = {
  a: 'one',
  b: { bb: { bbb: 'two' }},
  c: ['three']
};

let newObj = JSON.parse(JSON.stringify(oldObj));
console.log(oldObj.b.bb === newObj.b.bb); // false
```

* jQuery 有提供一个 `$.extend` 可以用来做深克隆：

```javascript
let $ = require('jquery');
let oldObj = {
  a: 'one',
  b: { bb: { bbb: 'two' }},
  c: ['three']
};

let newObj = $.extend(true, {}, oldObj);
console.log(oldObj.b.bb === newObj.b.bb); // false
```

* 函数库 Lodash，有提供 `_.cloneDeep` 用来做深克隆：

```javascript
let _ = require('lodash');
let oldObj = {
  a: 'one',
  b: { bb: { bbb: 'two' }},
  c: ['three']
};

let newObj = _.cloneDeep(oldObj);
console.log(oldObj.b.bb === newObj.b.bb); // false
```

（完）
