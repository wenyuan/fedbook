# Object 扩展

## 以前遍历对象

以前是这样获取对象的每一个属性值的：

```javascript
const obj = {
  name: 'zhangsan',
  age: 13,
  gender: 'male'
}

console.log(Object.keys(obj))
// ['name', 'age', 'gender']

const res = Object.keys(obj).map(key => obj[key])
console.log(res)
// ['zhangsan', 13, 'male']
```

ES8 中对象扩展补充了两个静态方法，用于遍历对象：`Object.values()`，`Object.entries()`

## Object.values()

`Object.values()` 返回一个数组，其元素是在对象上找到的可枚举属性值。属性的顺序与通过手动循环对象的属性值（for...in）所给出的顺序相同（区别在于 for...in 还会遍历原型上的属性值）。

```javascript
const obj = {
  name: 'zhangsan',
  age: 13,
  gender: 'male'
}

console.log(Object.values(obj))
// ['zhangsan', 13, 'male']
```

::: tip
`Object.values()` 是在对象上找到可枚举的属性的值，所以只要这个对象是可枚举的就可以，不只是 `{}` 这种形式。
:::

## Object.entries()

`Object.entries()` 方法返回一个给定对象自身可枚举属性的键值对数组，其排列与使用 for...in 循环遍历该对象时返回的顺序一致（区别在于 for...in 循环也枚举原型链中的属性）。

```javascript
const obj = {
  name: 'zhangsan',
  age: 13,
  gender: 'male'
}

for (let [k, v] of Object.entries(obj)) {
  console.log(k, v)
  // name zhangsan
  // age 13
  // gender male
}
```

::: tip
`Object.entries()` 返回的是数组，因此上述代码还用到了数组的解构赋值。
:::

## Object.getOwnPropertyDescriptors()

### 属性描述符

```javascript
const obj = {
  name: 'zhangsan',
  age: 13,
  gender: 'male'
}
```

前面的几个例子中，都把这个对象的所有 key、value 遍历出来了，如果我们不想让 `gender` 这个属性和值被枚举怎么办？

```javascript
Object.defineProperty(obj, 'gender', {
  enumerable: false
})

Object.entries(obj).map(([key, value]) => {
  console.log( `key: ${key.padEnd(10)} value: ${value}` )
  // key: name       value: zhangsan
  // key: age        value: 13
})
```

defineProperty 的第三个参数就是属性描述符（descriptor）它包括几个属性：

* value：属性的值
* writable：属性的值是否可被改变
* enumerable：属性的值是否可被枚举
* configurable：描述符本身是否可被修改，属性是否可被删除

具体可参考 [Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)。

### 函数介绍

获取对象指定属性的描述符：

```javascript
console.log(Object.getOwnPropertyDescriptor(obj, 'gender'))
// {value: 'male', writable: true, enumerable: true, configurable: true}
```

获取对象所有属性的描述符：

```javascript
console.log(Object.getOwnPropertyDescriptors(obj))
// {name: {…}, age: {…}, gender: {…}}
```

## 参考文档

* [Object.values()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
* [Object.entries()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
* [Object.getOwnPropertyDescriptors()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors)

（完）
