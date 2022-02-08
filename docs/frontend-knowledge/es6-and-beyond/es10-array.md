# Array 扩展

## Array.prototype.flat()

flat() 方法会按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返回。

**语法**

> const newArray = arr.flat(depth)

**解释**

| 参数  | 含义                                  | 必选 |
| ----- | ------------------------------------ | ---- |
| depth | 指定要提取嵌套数组的结构深度，默认值为 1 | N   |

**示例**

```javascript
const numbers = [1, 2, [3, 4, [5, 6]]]
console.log(numbers.flat())
// [1, 2, 3, 4, [5, 6]]
```

::: warning
此时 flat 的参数没有设置，取默认值 `1`，也就是说只扁平化向下一级，遇到 `[3, 4, [5, 6]]` 这个数组会扁平会处理，不会再继续遍历内部的元素是否还有数组。
:::

当 flat 的参数大于等于 `2`，返回值就是 `[1, 2, 3, 4, 5, 6]` 了。

```javascript
const numbers = [1, 2, [3, 4, [5, 6]]]
console.log(numbers.flat(2))
// [1, 2, 3, 4, 5, 6]
```

## Array.prototype.flatMap()

flatMap() 方法首先使用映射函数映射每个元素，然后将结果压缩成一个新数组。从方法的名字上也可以看出来它包含两部分功能一个是 map，一个是 flat（深度为 1）。

**语法**

> const new_array = arr.flatMap(function callback(currentValue[, index[, array]]) {// 返回新数组的元素 }[, thisArg])

**解释**

| 参数     | 含义                                                                      | 必选 |
| -------- | ------------------------------------------------------------------------ | ---- |
| callback | 可以生成一个新数组中的元素的函数，可以传入三个参数：currentValue、index、array | Y   |
| thisArg  | 遍历函数 this 的指向                                                       | N   |

**示例**

```javascript
const numbers = [1, 2, 3]
numbers.map(x => [x * 2])     // [[2], [4], [6]]
numbers.flatMap(x => [x * 2]) // [2, 4, 6]
```

这个示例可以简单对比下 map 和 flatMap 的区别，或者下面的示例：

```javascript
let arr = ['今天天气不错', '', '早上好']
arr.map(s => s.split(''))
// [["今", "天", "天", "气", "不", "错"],[""],["早", "上", "好"]]
arr.flatMap(s => s.split(''))
// ["今", "天", "天", "气", "不", "错", "", "早", "上", "好"]
```

## 推荐阅读

* [Array.prototype.flat()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)
* [Array.prototype.flatMap()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)

（完）
