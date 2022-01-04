# Map

ES6 提供了 Map 数据结构。它类似于对象，也是键值对的集合，但是「键」的范围不限于字符串，各种类型的值（包括对象）都可以当作键。也就是说，Object 结构提供了「字符串—值」的对应，Map 结构提供了「值—值」的对应，是一种更完善的 Hash 结构实现。如果你需要「键值对」的数据结构，Map 比 Object 更合适。

## 基本语法

### 实例化

```javascript
let map = new Map([iterable])
```

Iterable 可以是一个数组或者其他 iterable 对象，其元素为键值对(两个元素的数组，例如: `[[ 1, 'one' ], [ 2, 'two' ]]`)。 每个键值对都会添加到新的 Map。`null` 会被当做 `undefined`。

### 添加数据

```javascript
let map = new Map()
let keyObj = {}
let keyFunc = function() {}
let keyString = 'a string'

// 添加键
map.set(keyString, "和键'a string'关联的值")
map.set(keyObj, '和键keyObj关联的值')
map.set(keyFunc, '和键keyFunc关联的值')

console.log(map)
```

### 删除数据

```javascript
// 删除指定的数据
map.delete(keyObj)

// 删除所有数据
map.clear()
```

### 统计数据

```javascript
// 统计所有 key-value 的总数
console.log(map.size)        // 2

// 判断是否有 key-value
console.log(map.has(keyObj)) // true
```

### 查询数据

`get()` 方法返回某个 Map 对象中的一个指定元素。

```javascript
console.log(map.get(keyObj)) // 和键 keyObj 关联的值
```

## 遍历方式

* `keys()` 返回一个新的 Iterator 对象。它包含按照顺序插入 Map 对象中每个元素的 key 值
* `values()` 方法返回一个新的 Iterator 对象。它包含按顺序插入Map对象中每个元素的 value 值
* `entries()` 方法返回一个新的包含 `[key, value]` 对的 Iterator 对象，返回的迭代器的迭代顺序与 Map 对象的插入顺序相同
* `forEach()` 方法将会以插入顺序对 Map 对象中的每一个键值对执行一次参数中提供的回调函数
* `for...of` 可以直接遍历每个成员

```javascript
let map = new Map([['name', 'zhangsan'], ['age', 13]])

map.forEach((value, key) => console.log(value, key)) // zhangsan name  // 13 'age'

for (let [key, value] of map) {
  console.log(key, value)                            // name zhangsan  // age 13
}

for (let key of map.keys()) {
  console.log(key)                                   // name  // age
}

for (let value of map.values()) {
  console.log(value)                                 // zhangsan  // 13
}

for (let [key, value] of map.entries()) {
  console.log(key, value)                            // name zhangsan  // age 13
}
```

Object 也是按键值对存储和读取的，它们两者之间除了之前说的以外，还有其他一些区别。

* **键的类型**

  一个 Object 的键只能是字符串或者 Symbol，但一个 Map 的键可以是任意值，包括函数、对象、基本类型。

* **键的顺序**

  Map 中的键值是有序的，而添加到对象中的键则不是。因此，当对它进行遍历时，Map 对象是按插入的顺序返回键值。

* **键值对的统计**

  可以通过 `size` 属性直接获取一个 Map 的键值对个数，而 Object 的键值对个数只能手动计算。
  
* **键值对的遍历**

  Map 可直接进行迭代，而 Object 的迭代需要先获取它的键数组，然后再进行迭代。

* **性能**

  Map 在涉及频繁增删键值对的场景下会[有些性能优势](https://blog.csdn.net/weixin_43398820/article/details/118056553)。

## WeekMap

WeakMap 结构与 Map 结构类似，也是用于生成键值对的集合。

```javascript
// WeakMap 可以使用 set 方法添加成员
const wm1 = new WeakMap()
const key = {
  foo: 1
}
wm1.set(key, 2)
wm1.get(key) // 2

// WeakMap 也可以接受一个数组，
// 作为构造函数的参数
const k1 = [1, 2, 3]
const k2 = [4, 5, 6]
const wm2 = new WeakMap([
  [k1, 'foo'],
  [k2, 'bar']
])
wm2.get(k2) // 'bar'
```

WeakMap 与 Map 的区别有两点：

* WeakMap 只接受对象作为键名（`null` 除外），不接受其他类型的值作为键名。

```javascript
const map = new WeakMap()
map.set(1, 2)
// TypeError: 1 is not an object!
map.set(Symbol(), 2)
// TypeError: Invalid value used as weak map key
map.set(null, 2)
// TypeError: Invalid value used as weak map key
```

* WeakMap 的键名所指向的对象，不计入垃圾回收机制（该特性同 WeakSet）。

## 参考资料

* [Set 和 Map 数据结构](https://es6.ruanyifeng.com/#docs/set-map)
* [Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)
* [Map和Object的性能对比](https://blog.csdn.net/weixin_43398820/article/details/118056553)

（完）
