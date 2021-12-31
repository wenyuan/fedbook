# ECMAScript2015(ES6)

## let 和 const

这两个关键字是 ES6 新增的声明变量方式，与 `var` 的区别：

* `var` 有变量提升，值可变。允许重复声明。
* `let` 不存在变量提升，值可变。不允许重复声明。
* `const` 不存在变量提升，值不可变，但如果是定义对象，则属性可变。不允许重复声明。

### let

#### 1）`let` 声明的全局变量不是全局对象 `window` 的属性

```javascript
var a = 5
console.log(window.a) // 5

let b = 5
console.log(window.b) // undefined
```

#### 2）`let` 声明的变量拥有**块级作用域**

* 场景一：防止内层变量覆盖外层变量。
* 场景二：防止用来计数的循环变量在循环结束后泄露为全局变量。

```javascript
for(var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  })
}
// 5 5 5 5 5


for(let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  })
}
// 0 1 2 3 4
```

#### 3）暂时性死区

* 对于 `let`，不存在变量提升，所以变量的调用不能先于声明。
* ES6 明确规定，如果区块中存在 `let` 和 `const` 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错（该区域不受外部影响，哪怕外部声明过同名变量）。

```javascript
var a = 5;
if (true) {
  a = 6;
  let a;
}
// ReferenceError: Cannot access 'a' before initialization
```

#### 4）隐蔽的暂时性死区

* ES6 允许为函数参数设置默认值，即直接在形参后面通过 `=` 指定默认值。
* 按照[阮一峰老师书中的描述](https://es6.ruanyifeng.com/#docs/function#作用域)：一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域。等到初始化结束，这个作用域就会消失。
* 我的理解是在这个临时作用域里，参数具有跟 `let`、`const` 一样的特性（这条结论没能找到比较权威的出处）。

```javascript
var a =1;
function foo(b = a, a = 2) {
  console.log(a, b);
}
foo()
// ReferenceError: Cannot access 'a' before initialization
```

### const

和 `let` 一样，具有**块级作用域**，**不会变量提升**，有**暂时性死区**。

`const` 定义的是常量，**值不能被改变**：

* `const` 声明的变量必须进行初始化。
* `const` 实际上保证的并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。因此它定义的对象的属性可变。
* 让对象或者数组这种引用数据类型也不被改变，需要使用 `Object.freeze(obj)`（浅层冻结，将最近一层的对象进行冻结）。

## 解构赋值

### 数组解构赋值

#### 1）基本用法

```javascript
let [a, b, c] = ['a', 'b', 'c'] // ["a", "b", "c"]
```

#### 2）赋值元素可以是任意可遍历的对象

```javascript
let [a, b, c] = "abc"                       // ["a", "b", "c"]
let [one, two, three] = new Set([1, 2, 3])  // [1, 2, 3]
```

#### 3）循环体中使用，配合 [`Object.entries()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) 的场景

* 每次遍历得到一个数组，该数组的元素是给定对象自身可枚举属性的键和值
* 接下来的解构操作本质上就是解构的基本用法

```javascript
let user = {
  name: 'zhangsan',
  age: 13
}

for (let [key, value] of Object.entries(user)) {
  console.log(`${key}:${value}`)
}
// name:zhangsan
// age:13
```

#### 4）循环体中使用，配合 [Map 对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map) 的场景

```javascript
let user = new Map()
user.set('name', 'zhangsan')
user.set('age', 13)

for (let [key, value] of user.entries()) {
  console.log(`${key}:${value}`)
}
// name:zhangsan
// age:13
```

#### 5）可以跳过赋值元素

如果想忽略数组的某个元素对变量进行赋值，可以使用逗号来处理。

```javascript
let [mon, , wed] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

console.log(wed) // Wednesday
```

#### 6）rest 参数

可以使用 rest 参数（形式为 `...变量名`）来接受赋值数组的剩余元素，不过要确保这个 rest 参数是放在被赋值变量的最后一个位置上。

```javascript
let [mon, tues, ...rest] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

console.log(mon)         // Monday
console.log(tues)        // Tuesday

// rest 是个数组
console.log(rest[0])     // Wednesday
console.log(rest[1])     // Thursday
console.log(rest.length) // 5
```

#### 7）默认值

如果数组的内容少于变量的个数，没有分配到内容的变量会是 `undefined`。

```javascript
let [firstName, lastName] = []

console.log(firstName) // undefined
console.log(lastName)  // undefined
```

也可以给变量赋予默认值，防止 `undefined` 的情况出现。

```javascript
let [firstName = 'Guest', lastName = 'Anonymous'] = ['Kobe']

console.log(firstName) // Kobe
console.log(lastName)  // Anonymous
```

### 对象解构赋值

#### 1）基本用法

左侧的变量名要和右侧对象中存在的 key 名一致，但是顺序无需一致。

```javascript
let options = {
  title: 'Menu',
  width: 100,
  height: 200
}

let {title, width, height} = options

console.log(title)  // Menu
console.log(width)  // 100
console.log(height) // 200
```

提取出来的值也可以赋值给其它的变量名。

```javascript
let options = {
  title: 'Menu',
  width: 100,
  height: 200
}

let {title: t, width: w, height: h} = options

console.log(t) // Menu
console.log(w) // 100
console.log(h) // 200
```

#### 2）rest 运算符

可以像数组一样，只提取指定的属性，将其他可以暂存到一个变量下，这就要用到 rest 运算符（形式为 `...变量名`）了。

```javascript
let options = {
  title: 'Menu',
  height: 200,
  width: 100
}

let {title, ...rest} = options

console.log(rest.height) // 200
console.log(rest.width)  // 100
```

#### 3）默认值

赋值的过程中也可以指定默认值。

```javascript
let options = {
  title: 'Menu'
}

let {width = 100, height = 200, title} = options

console.log(title)  // Menu
console.log(width)  // 100
console.log(height) // 200
```

#### 4）嵌套对象

如果一个 Array 或者 Object 比较复杂，它嵌套了 Array 或者 Object，那只要被赋值的结构和右侧赋值的元素一致就好了。

就像这样：

<div style="text-align: center;">
  <img src="./assets/destructuring-complex.png" alt="嵌套对象的解构赋值" style="width: 550px;">
  <p style="text-align: center; color: #888;">（嵌套对象的解构赋值）</p>
</div>

```javascript
let options = {
  size: {
    width: 100,
    height: 200
  },
  items: ["Cake", "Donut"],
  extra: true    // 不提取这个值
}

let {
  size: {
    width,
    height
  },
  items: [item1, item2],
  title = 'Menu' // 默认参数
} = options

console.log(title)  // Menu
console.log(width)  // 100
console.log(height) // 200
console.log(item1)  // Cake
console.log(item2)  // Donut
```

### 字符串解构赋值

本质上就是把字符串当做是数组来解构。

```javascript
let str = 'hello'

let [a, b, c, d, e] = str

console.log(a, b, c, d, e)
```

## Array

### ES5 中数组遍历方式

#### 1）for 循环

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
}
```

#### 2）forEach()

没有返回值，只是针对每个元素调用 func。

优点是不需要通过索引来获取数组项，缺点是不支持 `break`、`continue`。

易混淆点：在 `forEach()` 的循环体里使用 `return` 起的作用是 `continue`（离开当前循环，进入下一次循环），而不是原本的结束遍历。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

arr.forEach(function(ele, idx, array) {
  if (arr[idx] == 'b') {
    return;
  }
  console.log(idx, ele)
})
```

#### 3）map()

返回新的数组，每个元素为调用 func 的结果。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

let result = arr.map(function(value) {
  value += value
  console.log(value)
  return value
})
console.log(arr, result)
```

#### 4）filter()

返回符合 func 条件的元素数组。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

let result = arr.filter(function(value) {
  console.log(value)
  return value == 'b'
})
console.log(arr, result)
```

#### 5）some()

返回 boolean，判断是否有元素符合 func 条件。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

let result = arr.some(function(value) {
  console.log(value)
  return value == 'c'
})
console.log(arr, result)
```

#### 6）every()

返回 boolean，判断是否每个元素都符合 func 条件。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

let result = arr.every(function(value) {
  console.log(value)
  return value == 'c'
})
console.log(arr, result)
```

#### 7）reduce()

为数组里的每个元素执行 func 函数，返回函数累计处理的结果。

```javascript
arr.reduce(callback(accumulator, currentValue, index, array), initialValue)

// 回调函数(callback)将执行数组中每个值，它包含 4 个参数:

// accumulator: 累计器, 也叫 previousValue, 它是上一次回调的返回值, 或者是提供的 initialValue。
// currentValue: 当前值, 数组中当前被处理的元素。
// index: 当前索引, 如果提供了 initialValue, index 值从 0 开始, 否则从 1 开始。
// array: 源数组, 即调用 reduce() 的数组。
```

数组累加：

```javascript
let arr = [1, 2, 3, 5]

let sum = arr.reduce((acc, cur) => {
 return acc + cur 
}, 0)

console.log(sum)
```

### ES6 中数组遍历方式：for...of

for...of 可以遍历一切可遍历的元素（数组、对象、集合）。

```javascript
for (let item of arr) {
  console.log(item)
}

for (let item of arr.values()) {
  console.log(item)
}

for (let item of arr.keys()) {
  console.log(item)
}

for (let [index, item] of arr.entries()) {
  console.log(index, item)
}
```

### 数组的新增方法

#### 1）Array.from()

用于将类数组的对象（array-like object）和可遍历的对象（包括 ES6 新增的数据结构 Set 和 Map），转为真正的数组。

转换后就可以对它们使用数组的原生 API 了。

它接受三个参数：

* arrayLike（必需）：想要转换成数组的伪数组对象或可迭代对象。
* mapFn（可选）：如果指定了该参数，新数组中的每个元素会执行该回调函数。
* thisArg（可选）：可选参数，执行回调函数 `mapFn` 时 `this` 对象。

```javascript
// 转换类数组对象
let arrLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3
}

let arr = Array.from(arrLike)
console.log(arr)
```

拓展用法：利用该方法的第二个参数，初始化一个长度为 5 的数组，每个数组元素默认为 1：

```javascript
let arr = Array.from({
  length: 5
}, function() {
  return 1
})

console.log(arr)
```

#### 2）Array.of()

用于创建一个具有可变数量参数的新数组实例，而不考虑参数的数量或类型。

它有一个参数：

* elementN（必需）：任意个参数，将按顺序成为返回数组中的元素。
* start（可选）：起始索引，默认值为 `0`。
* end（可选）：终止索引，默认值为 `this.length`。

和 Array 构造函数之间的区别在于处理整数参数：

* `Array.of(7)` 创建一个具有单个元素 `7` 的数组。
* `Array(7)` 创建一个长度为 `7` 的空数组。

```javascript
Array.of(7);       // [7]
Array.of(1, 2, 3); // [1, 2, 3]

Array(7);          // [ , , , , , , ]
Array(1, 2, 3);    // [1, 2, 3]
```

#### 3）Array.prototype.fill()

用给定值填充一个数组中从起始索引到终止索引内的全部元素，不包括终止索引。

它接受三个参数：

* value（必需）：用来填充数组元素的值。
* start（可选）：起始索引，默认值为 `0`。
* end（可选）：终止索引，默认值为 `this.length`。

```javascript
// 用数字 0 替换索引 1 到索引 2(不包含) 的元素
let array = [1, 2, 3, 4]
array.fill(0, 1, 2) // [1,0,3,4]

// 初始化一个长度固定, 元素为指定值的数组
Array(5).fill(1)    // [1,1,1,1,1]
```

#### 4）Array.prototype.find()

返回数组中满足 func 函数内条件的第一个元素，否则返回 `undefined`。

它接受两个参数：

* callback（必需）：在数组每一项上执行的函数，接收 3 个参数，`element`、`index`、`array`。
* thisArg（可选）：执行回调时用作 `this` 的对象。

```javascript
let array = [5, 12, 8, 130, 44];

let found = array.find(function(element) {
    return element > 10;
});

console.log(found); // 12
```

#### 5）Array.prototype.findIndex()

返回数组中满足 func 函数内条件的第一个元素的索引。否则返回 `-1`。

它接受两个参数：

* callback（必需）：在数组每一项上执行的函数，接收 3 个参数，`element`、`index`、`array`。
* thisArg（可选）：执行回调时用作 `this` 的对象。

```javascript
let array = [5, 12, 8, 130, 44];

let found = array.findIndex(function(element) {
    return element > 10;
});

console.log(found); // 1
```

#### 6）Array.prototype.copyWithin()

在当前数组内部，将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组。也就是说，使用这个方法，会修改当前数组。

它接受三个参数：

* target（必需）：从该位置开始替换数据。如果为负值，表示倒数。
* start（可选）：从该位置开始读取数据，默认为 `0`。如果为负值，表示从末尾开始计算。
* end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示从末尾开始计算。

```javascript
let arr = [1, 2, 3, 4, 5]
console.log(arr.copyWithin(1, 3)) // [1, 4, 5, 4, 5]
```




