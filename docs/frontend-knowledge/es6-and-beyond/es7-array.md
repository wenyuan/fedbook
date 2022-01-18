# Array.prototype.includes()

在 ES7 之前想判断数组中是否包含一个元素，一般这样写：

```javascript
console.log(arr.find(function(item) {
  return item === 2
}))
```

或者

```javascript
console.log(arr.filter(function(item) {
  return item === 2
}).length > 0)
```

ES7 引入的 `Array.prototype.includes()` 方法用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 `true`，否则返回 `false`。

## 基本用法

```javascript
const arr = ['es6', 'es7', 'es8']
console.log(arr.includes('es6')) // true
console.log(arr.includes('es9')) // false
```

## 接收两个参数

要搜索的值和搜索的开始索引。第二个参数可选。从该索引处开始查找。如果为负值，表示从末尾开始往前跳该赋值的绝对值个索引，然后继续往后搜寻。

```javascript
const arr = ['es6', 'es7', 'es8']
console.log(arr.includes('es7', 1))  // true
console.log(arr.includes('es7', 2))  // false
console.log(arr.includes('es7', -1)) // false
console.log(arr.includes('es7', -2)) // true
```

## 与 indexOf() 比较

```javascript
const arr = ['es6', 'es7', 'es8']
console.log(arr.includes('es6'))     // true
console.log(arr.indexOf('es6') > -1) // true
```

::: warning
只能判断简单类型的数据，对于复杂类型的数据，比如对象类型的数组，二维数组，这些是无法判断的。
:::

```javascript
const arr = [1, [2, 3], 4]
console.log(arr.includes([2, 3])) // false
console.log(arr.indexOf([2, 3]))  // -1
```

**优缺点比较**：

两者都是采用 `===` 的操作符来作比较的，不同之处在于：对于 `NaN` 的处理结果不同。在 js 中 `NaN === NaN` 的结果是 `false`，`indexOf()` 就是这样处理的，但是 `includes()` 不是这样的。

```javascript
const arr = [1, NaN, 2, 3]
console.log(arr.indexOf(NaN))  // -1
console.log(arr.includes(NaN)) // true
```

::: tip 总结
如果只想知道某个值是否在数组中存在，而并不关心它的索引位置，建议使用 `includes()`。如果想获取一个值在数组中的位置，那么只能使用 `indexOf()` 方法。
:::

## 参考资料

* [Array.prototype.includes()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)

（完）
