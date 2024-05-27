# 实现数组扁平化 flat 方法

## 功能描述

数组内置的 `flat()` 方法可以创建一个新的数组，并根据**指定深度**递归地将所有子数组元素拼接到新的数组中。默认是将二维元素拆分成一维的进行拼接，二维以上的原样保留。

基本用法如下：

```javascript
let arr = [
  [1, 2],
  [3, 4],
  [5, 6, [7, 8, [9, 10, [11]]]], 12
];

// 这两个相同，都是得到 [1, 2, 3, 4, 5, 6, Array(3), 12]
flat_array1 = arr.flat()
flat_array2 = arr.flat(1)

// 变成一维数组，得到 [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
flat_array3 = arr.flat(Infinity)
```

## 实现思路

下面手写实现这个方法的时候，就简单处理，只实现 `arr.flat(Infinity)` 这一种情况，即将多维数组扁平化成一维数组。

## 手写实现

### 递归处理

* 循环数组里的每一个元素
* 判断该元素是否为数组
  * 是数组的话，继续循环遍历这个元素
  * 不是数组的话，把元素添加到新的数组中

```javascript
const myFlat = (arr) => {
  let newArr = [];
  let cycleArray = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (Array.isArray(item)) {
        cycleArray(item);
        continue;
      } else {
        newArr.push(item);
      }
    }
  }
  cycleArray(arr);
  return newArr;
}
```

### 用 reduce 实现

```javascript
const myFlat = arr => {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? myFlat(cur) : cur);
  }, []);
};
```

## 测试用例

```javascript
let arr = [
  [1, 2], 
  [3, 4], 
  [5, 6, [7, 8, [9, 10, [11]]]], 12
];

console.log(myFlat(arr))
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
```

## 还有一种会改变原数组的实现

使用扩展运算符来实现：

```javascript
let arr = [
  [1, 2],
  [3, 4],
  [5, 6, [7, 8, [9, 10, [11]]]], 12
];

while (arr.some(Array.isArray)) {
  arr = [].concat(...arr);
}

console.log(arr)
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
```

（完）
