# 响应式原理

## 1. 定义

响应式指的是组件 data 的数据一旦变化，立刻触发视图的更新。它是实现数据驱动视图的第一步。

## 2. 监听 data 变化的核心 API

Vue 实现响应式的一个核心 API 是 `Object.defineProperty`。该方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

基本用法：

```javascript
const data = {}
const name = 'zhangsan'
Object.defineProperty(data, 'name', {
  get: function() { 
    console.log('get')
    return name
  },
  set: function(newVal) {
    console.log('set')
    name = newVal
  }
})


// 测试
console.log(data.name) // get zhangsan
data.name = 'lisi'     // set
```

利用 `Object.defineProperty` 重写 `get` 和 `set`，我们可以实现一个简单的双向绑定。

## 3. 如何监听 data 变化

共定义了三个函数：

* updateView：模拟 Vue 更新视图的入口函数。
* defineReactive：对数据进行监听的具体实现。
* observer：调用该函数后，可对目标对象进行监听，将目标对象编程响应式的。

执行逻辑为：  
定义一个对象 `data` => 调用 `observer(data)` 将对象变成响应式的 => 修改对象内的属性 => 更新视图

```javascript
// 触发更新视图
function updateView() {
  console.log('视图更新')
}

// 重新定义属性，监听起来
function defineReactive(target, key, value) {
  // 核心 API
  Object.defineProperty(target, key, {
    get() {
      return value
    },
    set(newValue) {
      if (newValue !== value) {
        // 设置新值
        // 注意，value 一直在闭包中，此处设置完之后，再 get 时也是会获取最新的值
        value = newValue

        // 触发更新视图
        updateView()
      }
    }
  })
}

// 监听对象属性
function observer(target) {
  if (typeof target !== 'object' || target === null) {
    // 监听的不是对象或数组时，直接返回
    return target
  }

  // 重新定义各个属性（for in 也可以遍历数组）
  for (let key in target) {
    defineReactive(target, key, target[key])
  }
}
```

测试一下，会打印出两个 `"视图更新"` 字符串。

```javascript
// 准备数据
const data = {
  name: 'zhangsan',
  age: 20
}

// 监听数据
observer(data)

// 测试
data.name = 'lisi'
data.age = 21
```

## 4. 如何深度监听 data 变化

对于有嵌套属性的数据，例如：

```javascript
// 准备数据
const data = {
  name: 'zhangsan',
  age: 20,
  info: {
    address: '北京' // 需要深度监听
  }
}
```

要想监听到 `info.address` 的变化，则需要深度监听，修改 defineReactive 方法即可：

* 在刚进入 `defineReactive` 函数的时候，先调用 `observer` 对传进来的值进行判断，由于 `info` 是个对象，所以会对 `info` 遍历后再执行 `defineReactive`；而其它基本类型的值在 `observer` 中被直接返回。
* 在设置新值时也要对新值进行深度监听，原因是新值也可能是个对象，需要监听到它里面的属性。

```javascript {3-4,13-14}
// 重新定义属性，监听起来
function defineReactive(target, key, value) {
  // 深度监听
  observer(value)

  // 核心 API
  Object.defineProperty(target, key, {
    get() {
      return value
    },
    set(newValue) {
      if (newValue !== value) {
        // 深度监听
        observer(newValue)

        // 设置新值
        // 注意，value 一直在闭包中，此处设置完之后，再 get 时也是会获取最新的值
        value = newValue

        // 触发更新视图
        updateView()
      }
    }
  })
}
```

## 5. Object.defineProperty 缺点

* 深度监听时，需要递归到底，一次性计算量大
* 无法监听新增属性/删除属性（所以开发中需要使用 Vue.set 和 Vue.delete 这两个 API 来增删 data 的属性）

## 6. 如何监听数组变化

[由于性能原因](https://segmentfault.com/a/1190000015783546)，Vue 不是通过 `Object.defineProperty` 来监听数组的。

对于数组，是通过重写数组方法来实现。

```javascript
// 触发更新视图
function updateView() {
  console.log('视图更新')
}

// 重新定义数组原型
const oldArrayProperty = Array.prototype
// 创建新对象，原型指向 oldArrayProperty ，再扩展新的方法不会影响原型
const arrProto = Object.create(oldArrayProperty);
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(methodName => {
    arrProto[methodName] = function () {
        updateView() // 触发视图更新
        oldArrayProperty[methodName].call(this, ...arguments)
        // Array.prototype.push.call(this, ...arguments)
    }
})

// 重新定义属性，监听起来
function defineReactive(target, key, value) {
  // 代码省略
}

// 监听对象属性
function observer(target) {
  if (typeof target !== 'object' || target === null) {
    // 不是对象或数组
    return target
  }

  // 污染全局的 Array 原型
  // Array.prototype.push = function () {
  //     updateView()
  //     ...
  // }

  if (Array.isArray(target)) {
    target.__proto__ = arrProto
  }

  // 重新定义各个属性（for in 也可以遍历数组）
  for (let key in target) {
    defineReactive(target, key, target[key])
  }
}
```

测试一下：

```javascript
// 准备数据
const data = {
  name: 'zhangsan',
  age: 20,
  info: {
    address: '北京' // 需要深度监听
  },
  nums: [10, 20, 30]
}

// 监听数据
observer(data)

// 测试
data.nums.push(4) // 监听数组
```
