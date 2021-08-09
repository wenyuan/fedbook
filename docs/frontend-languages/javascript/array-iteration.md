# 数组遍历的几种方式

## 原生的 for 循环

最简单的一种循环遍历方法，也是使用频率最高的一种。

```javascript
let arr = [1, 2, 3, 4, 5, 6];
for(let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
```

有一种说法是，通过使用临时变量，将长度缓存起来，避免重复获取数组长度，这样当数组较大时能产生比较明显的优化效果，如下代码所示：

```javascript
let arr = [1, 2, 3, 4, 5, 6];
for(let i = 0, len = arr.length; i < len; i++) {
  console.log(arr[i]);
}
```

但我查阅了很多资料，发现这已经是一种过时的优化方案了。随着浏览器解释器的不断改进，现在不再需要手动来优化，像 Chrome 的 V8 引擎就会把能确定不变的代码移到循环外。

## for...in...

这个循环用的人也很多，但是效率最低（输出的 `key` 是数组索引）。

```javascript
let arr = ['我', '是', '谁', '我', '在', '哪'];
for(let key in arr) {
  console.log(key);
}
```

## for...of...（ES6）

虽然性能要好于 `for...in...`，但仍然比不上普通的 for 循环（不能循环对象）。

```javascript
let arr = ['我', '是', '谁', '我', '在', '哪'];
for(let key of arr) {
  console.log(key);
}
```

## forEach

执行时，数组里的元素个数有几个，该方法里的回调就会执行几次。其中第一个参数是数组里的元素，第二个参数为数组里元素的索引，第三个参数则是数组自己。

该方法是数组自带的遍历方法，虽然使用频率略高，但是性能仍然比普通循环略低。

```javascript
let arr = [1, 2, 3, 4, 5, 6];
arr.forEach(function (item, index, array) {
  console.log(item);
  console.log(array);
})
```

## map

遍历每一个元素并且返回对应的元素（可以返回处理后的元素），返回的新数组和旧数组的长度是一样的

该方法使用比较广泛，但其性能还不如 forEach。

```javascript
let arr = [1, 2, 3, 4, 5, 6];
let newArr = arr.map(function (item, index) {
  return item * item;
})

console.log(newArr);
```

## filter

遍历数组，过滤出符合条件的元素并返回一个新数组。

```javascript
let arr = [
  { id: 1, name: '买笔', done: true },
  { id: 2, name: '买笔记本', done: true },
  { id: 3, name: '练字', done: false }
]
    
let newArr = arr.filter(function (item, index) {
  return item.done;
})

console.log(newArr);
```

## some

遍历数组，只要有一个以上的元素满足条件就返回 `true`，否则返回 `false`。

```javascript
let arr = [
  { id: 1, name: '买笔', done: true },
  { id: 2, name: '买笔记本', done: true },
  { id: 3, name: '练字', done: false }
]

let bool = arr.some(function (item, index) {
  return item.done;
})

console.log(bool);
```

## every

遍历数组，每一个元素都满足条件 则返回 `true`，否则返回 `false`

```javascript
let arr = [
  { id: 1, name: '买笔', done: true },
  { id: 2, name: '买笔记本', done: true },
  { id: 3, name: '练字', done: false }
]

let bool = arr.every(function (item, index) {
  return item.done;
})

console.log(bool);
```

## find（ES6）

遍历数组，返回符合条件的第一个元素，如果没有符合条件的元素则返回 `undefined`。

```javascript
let arr = [1, 1, 2, 2, 3, 3, 4, 5, 6];

let num = arr.find(function (item, index) {
  return item === 3;
})

console.log(num);
```

## findIndex（ES6）

遍历数组，返回符合条件的第一个元素的索引，如果没有符合条件的元素则返回 `-1`。

```javascript
let arr = [1, 1, 2, 2, 3, 3, 4, 5, 6];

let num = arr.findIndex(function (item) {
  return item === 3;
})

console.log(num);
```

## reduce、reduceRight

`reduce` 方法接收两个参数，第一个参数是回调函数（`callback`） ，第二个参数是初始值（`initialValue`）。

`reduceRight` 方法除了与 `reduce` 执行方向相反外（从右往左），其他完全与其一致。

回调函数接收四个参数：

* accumulator：MDN 上解释为累计器，但我觉得不恰当，按我的理解它应该是截至当前元素，之前所有的数组元素被回调函数处理累计的结果。
* current：当前被执行的数组元素。
* currentIndex：当前被执行的数组元素索引。
* sourceArray：原数组，也就是调用 `reduce` 方法的数组。

> 如果不传入初始值，reduce 方法会从索引 1 开始执行回调函数，如果传入初始值，将从索引 0 开始、并从初始值的基础上累计执行回调。

### 计算对象数组某一属性的总和

```javascript
const list  = [
  { name: 'left', width: 20 },
  { name: 'center', width: 70 },
  { name: 'right', width: 10 },
];
const total = list.reduce((currentTotal, item) => {
  return currentTotal + item.width;
}, 0);
// total: 100
```

### 对象数组的去重，并统计每一项重复次数

```javascript
const list  = [
  { name: 'left', width: 20 },
  { name: 'right', width: 10 },
  { name: 'center', width: 70 },
  { name: 'right', width: 10 },
  { name: 'left', width: 20 },
  { name: 'right', width: 10 },
];
const repeatTime = {};
const result = list.reduce((array, item) => {
  if (repeatTime[item.name]) {
    repeatTime[item.name]++;
    return array;
  }
  repeatTime[item.name] = 1;
  return [...array, item];
}, []);
// repeatTime: { left: 2, right: 3, center: 1 }
// result: [
//   { name: 'left', width: 20 },
//   { name: 'right', width: 10 },
//   { name: 'center', width: 70 },
// ]
```

### 对象数组最大/最小值获取

```javascript
const list  = [
  { name: 'left', width: 20 },
  { name: 'right', width: 30 },
  { name: 'center', width: 70 },
  { name: 'top', width: 40 },
  { name: 'bottom', width: 20 },
];
const max = list.reduce((curItem, item) => {
  return curItem.width >= item.width ? curItem : item;
});
const min = list.reduce((curItem, item) => {
  return curItem.width <= item.width ? curItem : item;
});
// max: { name: "center", width: 70 }
// min: { name: "left", width: 20 }
```

`reduce` 很强大，更多奇技淫巧推荐查看这篇《[25个你不得不知道的数组reduce高级用法](https://juejin.cn/post/6844904063729926152)》

## 总结

### 性能对比

说了这么多，那这些遍历方法， 在性能上有什么差异呢？我们在 Chrome 浏览器中尝试。我采用每个循环执行 10 次，去除最大、最小值，取平均数，降低误差。

```javascript
var list = Array(100000).fill(1)

console.time('for');
for (let index = 0, len = list.length; index < len; index++) {
}
console.timeEnd('for');
// for: 2.427642822265625 ms

console.time('every');
list.every(() => { return true })
console.timeEnd('every')
// some: 2.751708984375 ms

console.time('some');
list.some(() => { return false })
console.timeEnd('some')
// some: 2.786590576171875 ms

console.time('foreach');
list.forEach(() => {})
console.timeEnd('foreach');
// foreach: 3.126708984375 ms

console.time('map');
list.map(() => {})
console.timeEnd('map');
// map: 3.743743896484375 ms

console.time('for...of...');
for (let index of list) {
}
console.timeEnd('for...of...')
// forof: 6.33380126953125 ms
```

从打印结果可以看出，原生 `for` 循环的速度最快，`for...of...` 循环最慢。

### 终止遍历的支持度、性能对比

|                   | 是否可终止     |                  |                  |                  |
| ----------------- | ------------- | ---------------- | ---------------- | ---------------- |
|                   | <b>break</b>  | <b>continue</b>  | <b>return</b>    | <b>性能（ms）</b> |
| for               | 终止 ✔️    | 跳出本次循环✔️ | ❌                | 2.42            |
| forEach           | ❌      ️    | ❌               | ❌                | 3.12            |
| map               | ❌      ️    | ❌               | ❌                | 3.74            |
| for...of...       | 终止 ✔️    | 跳出本次循环 ✔️| ❌                | 6.33            |
| some              | ❌️         | ❌               | return true ✔️ | 2.78            |
| every             | ❌️         | ❌               | return false ✔️| 2.75            |

注意：不同浏览器内核会有些差异，具体情况需另行测试。

## 参考资料

* [Is optimizing JavaScript for loops really necessary?](https://stackoverflow.com/questions/6973942/is-optimizing-javascript-for-loops-really-necessary "Is optimizing JavaScript for loops really necessary?")
* [JavaScript 有必要缓存 for 循环中的 Array.length 吗？](https://www.zhihu.com/question/29714976 "JavaScript 有必要缓存 for 循环中的 Array.length 吗？")

（完）
