# Array 扩展

## ES5 中数组遍历方式

### for 循环

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
}
```

### forEach()

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

### map()

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

### filter()

返回符合 func 条件的元素数组。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

let result = arr.filter(function(value) {
  console.log(value)
  return value == 'b'
})
console.log(arr, result)
```

### some()

返回 boolean，判断是否有元素符合 func 条件。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

let result = arr.some(function(value) {
  console.log(value)
  return value == 'c'
})
console.log(arr, result)
```

### every()

返回 boolean，判断是否每个元素都符合 func 条件。

```javascript
let arr = ['a', 'b', 'c', 'b', 'd']

let result = arr.every(function(value) {
  console.log(value)
  return value == 'c'
})
console.log(arr, result)
```

### reduce()

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

## ES6 中数组遍历方式

### for...of

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

## 数组的新增方法

### Array.from()

用于将类数组的对象（array-like object）和可遍历的对象（包括 ES6 新增的数据结构 Set 和 Map），转为真正的数组。

转换后就可以对它们使用数组的原生 API 了。

**语法**

> Array.from(arrayLike[, mapFn[, thisArg]])

**解释**

| 参数       | 含义                                        | 必选 |
| --------- | ------------------------------------------ | ---- |
| arrayLike | 想要转换成数组的伪数组对象或可迭代对象             | Y   |
| mapFn     | 如果指定了该参数，新数组中的每个元素会执行该回调函数  | N   |
| thisArg   | 执行回调函数 `mapFn` 时 `this` 对象            | N   |

**示例**

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

拓展用法：利用该方法的第二个参数，初始化一个长度为 `5` 的数组，每个数组元素默认为 `1`：

```javascript
let arr = Array.from({
  length: 5
}, function() {
  return 1
})

console.log(arr)
```

### Array.of()

用于创建一个具有可变数量参数的新数组实例，而不考虑参数的数量或类型。

**语法**

> Array.of(element0[, element1[, ...[, elementN]]])

**解释**

| 参数      | 含义                              | 必选 |
| -------- | -------------------------------- | ---- |
| elementN | 任意个参数，将按顺序成为返回数组中的元素 | Y    |
| start    | 起始索引，默认值为 `0`               | N    |
| end      | 终止索引，默认值为 `this.length`     | N    |

**示例**

和 Array 构造函数之间的区别在于处理整数参数：

* `Array.of(7)` 创建一个具有单个元素 `7` 的数组。
* `Array(7)` 创建一个长度为 `7` 的空数组。

```javascript
Array.of(7);       // [7]
Array.of(1, 2, 3); // [1, 2, 3]

Array(7);          // [ , , , , , , ]
Array(1, 2, 3);    // [1, 2, 3]
```

### Array.prototype.fill()

用给定值填充一个数组中从起始索引到终止索引内的全部元素，不包括终止索引。

**语法**

> arr.fill(value[, start[, end]])

**解释**

| 参数    | 含义                          | 必选 |
| ------ | ---------------------------- | ---- |
| value  | 用来填充数组元素的值             | Y    |
| start  | 起始索引，默认值为 `0`           | N    |
| end    | 终止索引，默认值为 `this.length` | N    |

**示例**

```javascript
// 用数字 0 替换索引 1 到索引 2(不包含) 的元素
let array = [1, 2, 3, 4]
array.fill(0, 1, 2) // [1,0,3,4]

// 初始化一个长度固定, 元素为指定值的数组
Array(5).fill(1)    // [1,1,1,1,1]
```

### Array.prototype.find()

返回数组中满足 func 函数内条件的第一个元素，否则返回 `undefined`。

**语法**

> arr.find(callback[, thisArg])

**解释**

| 参数      | 含义                                                          | 必选 |
| -------- | ------------------------------------------------------------ | ---- |
| callback | 在数组每一项上执行的函数，接收 3 个参数，`element`、`index`、`array` | Y    |
| thisArg  | 执行回调时用作 `this` 的对象                                     | N    |

**示例**

```javascript
let array = [5, 12, 8, 130, 44];

let found = array.find(function(element) {
    return element > 10;
});

console.log(found); // 12
```

### Array.prototype.findIndex()

返回数组中满足 func 函数内条件的第一个元素的索引。否则返回 `-1`。

**语法**

> arr.findIndex(callback[, thisArg])

**解释**

| 参数      | 含义                                                          | 必选 |
| -------- | ------------------------------------------------------------- | ---- |
| callback | 在数组每一项上执行的函数，接收 3 个参数，`element`、`index`、`array`  | Y    |
| thisArg  | 执行回调时用作 `this` 的对象                                      | N    |

**示例**

```javascript
let array = [5, 12, 8, 130, 44];

let found = array.findIndex(function(element) {
    return element > 10;
});

console.log(found); // 1
```

### Array.prototype.copyWithin()

在当前数组内部，将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组。也就是说，使用这个方法，会修改当前数组。

**语法**

> arr.copyWithin(target, start = 0, end = this.length)

**解释**

| 参数    | 含义                                                      | 必选  |
| ------ | --------------------------------------------------------- | ---- |
| target | 从该位置开始替换数据。如果为负值，表示倒数                         | Y    |
| start  | 从该位置开始读取数据，默认为 `0`。如果为负值，表示从末尾开始计算       | N    |
| end    | 到该位置前停止读取数据，默认等于数组长度。如果为负值，表示从末尾开始计算 | N    |

**示例**

```javascript
let arr = [1, 2, 3, 4, 5]
console.log(arr.copyWithin(1, 3)) // [1, 4, 5, 4, 5]
```

## 参考资料

* [数组的扩展](https://es6.ruanyifeng.com/#docs/array)
* [Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)

（完）
