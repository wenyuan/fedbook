# Proxy

::: danger 缺乏实战
Proxy 在学习的时候深感很强大、很强大。但是实际用的时候，很多时候觉得发挥不出它的精华，所以没有找到一用就如虎添翼的感觉。  
后续有待从开源项目（以知名框架为主）中学习它的应用场景。
:::

在 ES6 标准中新增的一个非常强大的功能是 Proxy，它可以用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种「元编程」（meta programming），即对编程语言进行编程。

Proxy 可以理解成，在目标对象之前架设一层「拦截」，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。

Proxy 这个词的原意是代理，用在这里表示由它来「代理」某些操作，可以译为「代理器」。

## 基本语法

**语法**

```javascript
let p = new Proxy(target, handler)
```

**解释**

我们可以看下表来对照一下。

| 参数     | 含义                                                                          | 必选 |
| -------- | ---------------------------------------------------------------------------- | ---- |
| target   | 用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）  | Y    |
| handler  | 一个对象，其属性是当执行一个操作时定义代理的行为的函数                             | Y    |

MDN 给出的解释偏官方，通俗的讲第一个参数 `target` 就是用来代理的「对象」，被代理之后它是不能直接被访问的，而 `handler` 就是实现代理的过程。

## 拦截操作场景

### 读操作场景

我们通常这样读取一个对象的 key-value：

```javascript
let o = { 
  name: 'zhangsan',
  age: 13
}

console.log(o.name)   // zhangsan
console.log(o.age)    // 13
console.log(o.gender) // undefined
```

读取 `gender` 的时候返回的是 `undefined`，因为该对象中没有这个 key-value。

实际业务中，为了避免读取不存在的属性时返回 `undefined`，我们会做这样的保护：

```javascript
console.log(o.gender || '')
```

如果我们对所有代码都是这种写法，那阅读性和观赏性就降低了。ES6 的 Proxy 就可以解决这一问题：

```javascript
let o = { 
  name: 'zhangsan',
  age: 13
}

let handler = {
  get(obj, key) {
    return Reflect.has(obj, key) ? obj[key] : ''
  }
}

let p = new Proxy(o, handler)

console.log(p.gender)
```

这个代码的意思是如果 `o` 对象有这个 key-value 则直接返回，如果没有一律返回 `''`。这里是自定义的处理逻辑，实际业务中可以根据自己的需要来写适合自己的规则。

### 写操作场景 1

从服务端获取的数据希望是只读，不允许在任何一个环节被修改。

在 ES5 中只能通过遍历把所有的属性设置为只读：

```javascript
// response.data 是 JSON 格式的数据，来自服务端的响应
for (let [key] of Object.entries(response.data)) {
  Object.defineProperty(response.data, key, {
    writable: false
  })
}
```

在 ES5 中使用 Proxy 就简单很多了：

```javascript
let data = new Proxy(response.data, {
  set(obj, key, value) {
    return false
  }
})
```

### 写操作场景 2

对于数据交互而言，校验是不可或缺的一个环境，传统的做法是将校验写在了业务逻辑里，导致代码耦合度较高。

如果使用 Proxy 就可以将代码设计的非常灵活：

```javascript
// validator.js
export default (obj, key, value) => {
  if (Reflect.has(key) && value > 20) {
    obj[key] = value
  }
}

// other js file
import Validator from './validator'
let data = new Proxy(response.data, {
  set: Validator
})
```

### 写操作场景 3

`set` 方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和 Proxy 实例本身，其中最后一个参数可选。

假定 `person` 对象有一个 `age` 属性，那么可以使用 Proxy 保证 `age` 的属性值符合要求。

```javascript
let validator = {
  set(target, key, value) {
    if (key === 'age') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new TypeError('Age must be a number')
      }
      if (value <= 0) {
        throw new TypeError('Age must be a positive number')
      }
    }

    // 对于满足条件的 age 属性以及其他属性，直接保存
    target[key] = value
    return true
  }
}

const person = {
  age: 27
}
const proxy = new Proxy(person, validator)

proxy.age = 'foo' // 报错
proxy.age = NaN   // 报错
proxy.age = 0     // 报错
proxy.age = 28
console.log(person.age) // 28
```

## 常用拦截操作

### get

拦截对象属性的读取，比如 `proxy.foo` 和 `proxy['foo']`。

`get` 方法可以接受三个参数：

* `target`：目标对象
* `propKey`：属性名
* proxy 实例本身（可选）：严格地说，是操作行为所针对的对象

下面是两个使用示例：

拦截前，可以正常获取数组元素，如果数组索引越界则返回 `undefined`。

```javascript
let arr = [7, 8, 9]

console.log(arr[1])  // 8
console.log(arr[10]) // undefined
```

拦截后，规定如果数组索引越界就返回 `error`。

```javascript
let arr = [7, 8, 9]
arr = new Proxy(arr, {
  get(target, prop) {
    // console.log(target, prop)
    return prop in target ? target[prop] : 'error'
  }
})

console.log(arr[1])  // 8
console.log(arr[10]) // error
```

拦截前，可以正常获取对象属性，如果属性不存在则返回 `undefined`。

```javascript
let dict = {
  'hello': '你好',
  'world': '世界'
}

console.log(dict['hello'])      // 你好
console.log(dict['javascript']) // undefined
```

拦截后，规定如果属性不存在就返回 key 的值。

```javascript
let dict = {
  'hello': '你好',
  'world': '世界'
}
dict = new Proxy(dict, {
  get(target, prop) {
    return prop in target ? target[prop] : prop
  }
})

console.log(dict['hello'])      // 你好
console.log(dict['javascript']) // javascript
```

### set

拦截对象属性的设置，比如 `proxy.foo = v` 或 `proxy['foo'] = v`，返回一个布尔值。

`set` 方法可以接受三个参数：

* `target`：目标对象
* `propKey`：属性名
* `propVal`：属性值
* proxy 实例本身（可选）：严格地说，是操作行为所针对的对象

下面是一个使用示例：

拦截前，可以给数组添加任意类型的元素。

```javascript
let arr = []

arr.push(5)
arr.push('a')
console.log(arr[0], arr[1], arr.length) // 5 'a' 2
```

拦截后，规定只能给数组添加数字类型的元素。

```javascript
let arr = []
arr = new Proxy(arr, {
  set(target, prop, val) {
    if (typeof val === 'number') {
      target[prop] = val
      return true
    } else {
      return false
    }
  }
})

arr.push(5)
arr.push('a')
console.log(arr[0], arr[1], arr.length) // 5 undefined 1
```

### has

拦截 `propKey in proxy` 的操作，返回一个布尔值。

`has` 方法可以接受两个参数：

* `target`：目标对象
* `propKey`：需查询的属性名

下面是一个使用示例：

定义了一个新方法，用来判断某个数字在不在自己指定的范围内。

```javascript
let range = {
  start: 1,
  end: 5
}

range = new Proxy(range, {
  has(target, prop) {
    return prop >= target.start && prop <= target.end
  }
})
console.log(2 in range)
console.log(9 in range)
```

### ownKeys

拦截以下操作（也就是拦截对象自身属性的读取操作），并返回一个数组：

* `Object.getOwnPropertyNames(proxy)`
* `Object.getOwnPropertySymbols(proxy)`
* `Object.keys(proxy)`
* `for...in` 循环

> 该方法返回目标对象所有自身的属性的属性名，而 `Object.keys()` 的返回结果仅包括目标对象自身的可遍历属性。

下面是一个使用示例：

拦截前，每种方法能正常打印出它能获取到的值。

```javascript
let userInfo = {
  username: 'zhangsan',
  age: 13,
  _password: '******',
  [Symbol('level')]: 'VIP1'
}

console.log(Object.getOwnPropertyNames(userInfo))   // ['username', 'age', '_password']
console.log(Object.getOwnPropertySymbols(userInfo)) // [Symbol(level)]
console.log(Object.keys(userInfo))                  // ['username', 'age', '_password']
for (let key in userInfo) {
  console.log(key)                                  // username  // age  // _password
}
```

拦截后，规定变量名前加下划线表示私有，只打印输出**目标对象自身的可遍历非私有属性**。

> 需要注意，使用 `Object.keys()` 方法时，有三类属性会被 `ownKeys()` 方法自动过滤，不会返回：
>
> * 目标对象上不存在的属性
> * 属性名为 Symbol 值
> * 不可遍历（`enumerable`）的属性

```javascript
let userInfo = {
  username: 'zhangsan',
  age: 13,
  _password: '******',
  [Symbol('level')]: 'VIP1'
}
userInfo = new Proxy(userInfo, {
  ownKeys(target) {
    return Object.keys(target).filter(key => !key.startsWith('_'))
  }
})

console.log(Object.getOwnPropertyNames(userInfo))   // ['username', 'age']
console.log(Object.getOwnPropertySymbols(userInfo)) // []
console.log(Object.keys(userInfo))                  // ['username', 'age']
for (let key in userInfo) {
  console.log(key)                                  // username  // age
}
```

### deleteProperty

拦截 `delete proxy[propKey]` 的操作，返回一个布尔值。

下面是一个使用示例：

拦截前，`delete` 操作符可以删除对象的指定属性。

```javascript
let userInfo = {
  username: 'zhangsan',
  age: 13,
  _password: '******'
}

console.log(userInfo.age)         // 13
console.log(userInfo._password)   // ******
userInfo.age = 18               
console.log(userInfo.age)         // 18
try {
  userInfo._password = '123456'
} catch (e) {
  console.log(e.message)
} finally {
  console.log(userInfo._password) // 123456
}

try {
  delete userInfo._password
} catch (e) {
  console.log(e.message)
} finally {
  console.log(userInfo._password) // undefined
}

for (let key in userInfo) {
  console.log(key)                // username  // age
}
```

拦截后，规定变量名前加下划线表示私有，`delete` 操作符无法删除对象的私有属性。

```javascript
let userInfo = {
  username: 'zhangsan',
  age: 13,
  _password: '******'
}
userInfo = new Proxy(userInfo, {
  get(target, prop) {
    if (prop.startsWith('_')) {
      throw new Error('不可访问')
    } else {
      return target[prop]
    }
  },
  set(target, prop, val) {
    if (prop.startsWith('_')) {
      throw new Error('不可访问')
    } else {
      target[prop] = val
      return true
    }
  },
  deleteProperty(target, prop) { // 拦截删除
    if (prop.startsWith('_')) {
      throw new Error('不可删除')
    } else {
      delete target[prop]
      return true
    }
  },
  ownKeys(target) {
    return Object.keys(target).filter(key => !key.startsWith('_'))
  }
})

console.log(userInfo.age)         // 13
console.log(userInfo._password)   // Uncaught Error: 不可访问
userInfo.age = 18               
console.log(userInfo.age)         // 18
try {
  userInfo._password = '123456'
} catch (e) {
  console.log(e.message)          // 不可访问
} finally {
  console.log(userInfo._password)
}

try {
  delete userInfo._password
} catch (e) {
  console.log(e.message)          // 不可删除
} finally {
  console.log(userInfo._password)
}

for (let key in userInfo) {
  console.log(key)                // username  // age
}
```

### apply

拦截 Proxy 实例作为函数调用的操作，比如 `proxy(...args)`、`proxy.call(object, ...args)`、`proxy.apply(...)`。

`apply` 方法可以接受三个参数：

* `target`：目标对象
* `ctx`：目标对象的上下文对象（`this`）
* `args`：目标对象的参数数组

下面是一个使用示例：

拦截前，函数可以正常调用、也可以通过 `call` 和 `apply` 调用：

```javascript
let sum = (...args) => {
  let num = 0
  args.forEach(item => {
    num += item
  })
  return num
}

console.log(sum(1, 2))                  // 3
console.log(sum.call(null, 1, 2, 3))    // 6
console.log(sum.apply(null, [1, 2, 3])) // 6
```

拦截后，修改了函数内部的处理逻辑：

```javascript
let sum = (...args) => {
  let num = 0
  args.forEach(item => {
    num += item
  })
  return num
}

sum = new Proxy(sum, {
  apply(target, ctx, args) {
    return target(...args) * 2
  }
})

console.log(sum(1, 2))                  // 6
console.log(sum.call(null, 1, 2, 3))    // 12
console.log(sum.apply(null, [1, 2, 3])) // 12
```

### construct

拦截 Proxy 实例作为构造函数调用的操作，比如 `new proxy(...args)`。

`construct` 方法可以接受三个参数：

* `target`：目标对象
* `args`：构造函数的参数数组
* `newTarget`：创造实例对象时，`new` 命令作用的构造函数（下面例子的 `User`）

::: warning TODO...
暂时没有想到什么好的示例，等以后看开源项目源码时再补充。
:::

## 参考资料

* [Proxy](https://es6.ruanyifeng.com/#docs/proxy)
* [ES6 Proxies in practice](https://habr.com/en/post/448214/)

（完）
