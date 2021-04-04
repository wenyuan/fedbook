# 数组遍历的几种方式

## 方式一：原生的 for 循环

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

## 方式二：for...in...

这个循环用的人也很多，但是效率最低（输出的 `key` 是数组索引）。

```javascript
let arr = ['我', '是', '谁', '我', '在', '哪'];
for(let key in arr) {
  console.log(key);
}
```

## 方式三：for...of...（ES6）

虽然性能要好于 `for...in...`，但仍然比不上普通的 for 循环（不能循环对象）。

```javascript
let arr = ['我', '是', '谁', '我', '在', '哪'];
for(let key of arr) {
  console.log(key);
}
```

## 方式四：forEach

执行时，数组里的元素个数有几个，该方法里的回调就会执行几次。其中第一个参数是数组里的元素，第二个参数为数组里元素的索引，第三个参数则是数组自己。

该方法是数组自带的遍历方法，虽然使用频率略高，但是性能仍然比普通循环略低。

```javascript
let arr = [1, 2, 3, 4, 5, 6];
arr.forEach(function (item, index, array) {
  console.log(item);
  console.log(array);
})
```

## 方式五：map

遍历每一个元素并且返回对应的元素（可以返回处理后的元素），返回的新数组和旧数组的长度是一样的

该方法使用比较广泛，但其性能还不如 forEach。

```javascript
let arr = [1, 2, 3, 4, 5, 6];
let newArr = arr.map(function (item, index) {
  return item * item;
})

console.log(newArr);
```

## 方式六：filter

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

## 方式七：some

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

## 方式八：every

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

## 方式九：find（ES6）

遍历数组，返回符合条件的第一个元素，如果没有符合条件的元素则返回 `undefined`。

```javascript
let arr = [1, 1, 2, 2, 3, 3, 4, 5, 6];

let num = arr.find(function (item, index) {
  return item === 3;
})

console.log(num);
```

## 方式十：findIndex（ES6）

遍历数组，返回符合条件的第一个元素的索引，如果没有符合条件的元素则返回 `-1`。

```javascript
let arr = [1, 1, 2, 2, 3, 3, 4, 5, 6];

let num = arr.findIndex(function (item) {
  return item === 3;
})

console.log(num);
```

## 参考资料

* [Is optimizing JavaScript for loops really necessary?](https://stackoverflow.com/questions/6973942/is-optimizing-javascript-for-loops-really-necessary "Is optimizing JavaScript for loops really necessary?")
* [JavaScript 有必要缓存 for 循环中的 Array.length 吗？](https://www.zhihu.com/question/29714976 "JavaScript 有必要缓存 for 循环中的 Array.length 吗？")

（完）
