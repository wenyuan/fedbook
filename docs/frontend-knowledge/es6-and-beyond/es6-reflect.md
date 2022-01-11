# Reflect

Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新 API。

## 设计目的

#### 1）将 Object 属于语言内部的方法放到 Reflect 上

比如 `defineProperty` 方法，它本来是 Object 对象上的，但为了让代码更加规范，会逐步将这些方法转移到 Reflect 上。

在使用上还是一样的：

```javascript
let obj = {}
let newVal = ''
Reflect.defineProperty(obj, 'name', {
  get() {
    return newVal
  },
  set(val) {
    console.log('set')
    // this.name = val
    newVal = val
  }
})
obj.name = 'es'
console.log(obj.name)
```

#### 2）修改某些 Object 方法的返回结果，让其变得更合理

比如以前的 `Object.defineProperty` 没有返回值，如果当前有些属性无法定义，会抛出异常。而在 Reflect 中会返回布尔值。

```javascript
// 老写法
try {
  Object.defineProperty(target, property, attributes)
  // success
} catch (e) {
  // failure
}

// 新写法
if (Reflect.defineProperty(target, property, attributes)) {
  // success
} else {
  // failure
}
```

#### 3）让 Object 操作变成函数行为

函数式操作比命令式操作看上去可读性更好。

比如判断对象是否具有某个方法：

```javascript
// 老写法
'assign' in Object // true

// 新写法
Reflect.has(Object, 'assign') // true
```

#### 4）Reflect 对象的方法与 Proxy 对象的方法一一对应

只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。

比如用 Proxy 写的一个功能：对 user 对象进行代理，使得以下划线开头的属性作为私有属性被保护起来，不能被获取、设置、删除、遍历：

```javascript
let user = {
  name: 'zhangsan',
  age: 13,
  _password: '******'
}
user = new Proxy(user, {
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
  deleteProperty(target, prop) {
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
```

如果用 Reflect 进行改造：

```javascript {11,18,26,31}
let user = {
  name: 'zhangsan',
  age: 13,
  _password: '******'
}
user = new Proxy(user, {
  get(target, prop) {
    if (prop.startsWith('_')) {
      throw new Error('不可访问')
    } else {
      return Reflect.get(target, prop)
    }
  },
  set(target, prop, val) {
    if (prop.startsWith('_')) {
      throw new Error('不可访问')
    } else {
      Reflect.set(target, prop, val)
      return true
    }
  },
  deleteProperty(target, prop) {
    if (prop.startsWith('_')) {
      throw new Error('不可删除')
    } else {
      Reflect.deleteProperty(target, prop)
      return true
    }
  },
  ownKeys(target) {
    return Reflect.ownKeys(target).filter(key => !key.startsWith('_'))
  }
})
```

Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法，这些方法与处理器对象的方法相同。Reflect 不是一个函数对象，因此它是不可构造的。

::: tip
与大多数全局对象不同，Reflect 没有构造函数。你不能将其与一个 `new` 运算符一起使用，或者将 Reflect 对象作为一个函数来调用。Reflect 的所有属性和方法都是静态的（就像 Math 对象）
:::

## 常用方法

### Reflect.apply()

**语法**

> Reflect.apply(target, thisArgument, argumentsList)

**解释**

| 参数            | 含义                                                 | 必选 |
| -------------- | --------------------------------------------------- | ---- |
| target         | 目标函数                                              | Y    |
| thisArgument   | target 函数调用时绑定的 `this` 对象                     | N    |
| argumentsList  | target 函数调用时传入的实参列表，该参数应该是一个类数组的对象  | N    |

**示例**

```javascript
Reflect.apply(Math.floor, undefined, [1.75])
// 1

Reflect.apply(String.fromCharCode, undefined, [104, 101, 108, 108, 111])
// "hello"

Reflect.apply(RegExp.prototype.exec, /ab/, ['confabulation']).index
// 4

Reflect.apply(''.charAt, 'ponies', [3])
// "i"
```

**ES5 对比**

该方法与 ES5 中 `Function.prototype.apply()` 方法类似：调用一个方法并且显式地指定 `this` 变量和参数列表（`arguments`），参数列表可以是数组，或类似数组的对象。

```javascript
Function.prototype.apply.call(Math.floor, undefined, [1.75])
```

### Reflect.construct()

Reflect.construct() 方法的行为有点像 `new` 操作符 构造函数，相当于运行 `new target(...args)`。

**语法**

> Reflect.construct(target, argumentsList[, newTarget])

**解释**

| 参数            | 含义                                                                           | 必选 |
| -------------- | ----------------------------------------------------------------------------- | ---- |
| target         | 被运行的目标函数                                                                  | Y    |
| argumentsList  | 调用构造函数的数组或者伪数组                                                        | Y    |
| newTarget      | 该参数为构造函数， 参考 new.target 操作符，如果没有 newTarget 参数， 默认和 target 一样  | N    |

::: danger WARNING
如果 target 或者 newTarget 不是构造函数，抛出 TypeError
:::

Reflect.construct 允许你使用可变的参数来调用构造函数：

```javascript
var obj = new Foo(...args)
var obj = Reflect.construct(Foo, args)
```

**示例**

```javascript
var d = Reflect.construct(Date, [1776, 6, 4])
d instanceof Date // true
d.getFullYear()   // 1776
```

如果使用 newTarget 参数，则表示继承了 newTarget 这个超类：

```javascript
function someConstructor() {}
var result = Reflect.construct(Array, [], someConstructor)

Reflect.getPrototypeOf(result) // 输出：someConstructor.prototype
Array.isArray(result)          // true
```

### Reflect.defineProperty()

静态方法 Reflect.defineProperty() 基本等同于 Object.defineProperty() 方法，唯一不同是返回 Boolean 值。

**语法**

> Reflect.defineProperty(target, propertyKey, attributes)

**解释**

| 参数          | 含义                  | 必选 |
| ------------ | -------------------- | ---- |
| target       | 目标对象               | Y    |
| propertyKey  | 要定义或修改的属性的名称  | Y    |
| attributes   | 要定义或修改的属性的描述  | Y    |

**示例**

```javascript
const student = {}
Reflect.defineProperty(student, 'name', {
  value: 'zhangsan'
}) // true
student.name // "zhangsan"
```

### Reflect.deleteProperty()

Reflect.deleteProperty() 允许你删除一个对象上的属性。返回一个 Boolean 值表示该属性是否被成功删除。它几乎与非严格的 `delete` 操作符相同。

**语法**

> Reflect.deleteProperty(target, propertyKey)

**解释**

| 参数          | 含义                  | 必选 |
| ------------ | -------------------- | ---- |
| target       | 删除属性的目标对象      | Y    |
| propertyKey  | 将被删除的属性的名称	  | Y    |

**示例**

```javascript
var obj = {
  x: 1,
  y: 2
}
Reflect.deleteProperty(obj, "x") // true
obj // { y: 2 }

var arr = [1, 2, 3, 4, 5]
Reflect.deleteProperty(arr, "3") // true
arr // [1, 2, 3, , 5]

// 如果属性不存在，返回 true
Reflect.deleteProperty({}, "foo") // true

// 如果属性不可配置，返回 false
Reflect.deleteProperty(Object.freeze({
  foo: 1
}), "foo") // false
```

### Reflect.get()

Reflect.get() 方法的工作方式，就像从 Object (`target[propertyKey]`) 中获取属性，但它是作为一个函数执行的。

**语法**

> Reflect.get(target, propertyKey[, receiver])

**解释**

| 参数          | 含义                             | 必选 |
| ------------ | ------------------------------- | ---- |
| target       | 需要取值的目标对象                  | Y    |
| propertyKey  | 需要获取的值的键值	                 | Y    |
| receiver     | 如果遇到 getter，此值将提供给目标调用 | N    |

**示例**

```javascript
// Object
var obj = {
    x: 1,
    y: 2
}
Reflect.get(obj, 'x') // 1

// Array
Reflect.get(['zero', 'one'], 1) // "one"

// Proxy with a get handler
var x = {
    p: 1
}
var obj = new Proxy(x, {
    get(t, k, r) {
        return k + 'bar'
    }
})
Reflect.get(obj, 'foo') // "foobar"
```

### Reflect.getOwnPropertyDescriptor()

静态方法 Reflect.getOwnPropertyDescriptor() 与 Object.getOwnPropertyDescriptor() 方法相似。如果在对象中存在，则返回给定的属性的属性描述符，否则返回 `undefined`。

**语法**

> Reflect.getOwnPropertyDescriptor(target, propertyKey)

**解释**

| 参数          | 含义                       | 必选 |
| ------------ | ------------------------- | ---- |
| target       | 需要寻找属性的目标对象         | Y    |
| propertyKey  | 获取自己的属性描述符的属性的名称 | N    |

**示例**

```javascript
Reflect.getOwnPropertyDescriptor({
  x: 'hello'
}, 'x')
// {value: "hello", writable: true, enumerable: true, configurable: true}

Reflect.getOwnPropertyDescriptor({
  x: 'hello'
}, 'y')
// undefined

Reflect.getOwnPropertyDescriptor([], 'length')
// {value: 0, writable: true, enumerable: false, configurable: false}
```

**对比**

如果该方法的第一个参数不是一个对象（一个原始值），那么将造成 TypeError 错误。而对于 Object.getOwnPropertyDescriptor，非对象的第一个参数将被强制转换为一个对象处理。

```javascript
Reflect.getOwnPropertyDescriptor("foo", 0)
// TypeError: "foo" is not non-null object

Object.getOwnPropertyDescriptor("foo", 0)
// { value: "f", writable: false, enumerable: true, configurable: false }
```

### Reflect.getPrototypeOf()

静态方法 Reflect.getPrototypeOf() 与 Object.getPrototypeOf() 方法是一样的。都是返回指定对象的原型（即内部的 `[[Prototype]]` 属性的值）。

**语法**

> Reflect.getPrototypeOf(target)

**解释**

| 参数          | 含义             | 必选 |
| ------------ | --------------- | ---- |
| target       | 获取原型的目标对象  | Y    |

### Reflect.has()

Reflect.has() 用于检查一个对象是否拥有某个属性， 相当于 `in` 操作符。

**语法**

> Reflect.has(target, propertyKey)

**解释**

| 参数          | 含义                             | 必选 |
| ------------ | ------------------------------- | ---- |
| target       | 获取原型的目标对象                  | Y    |
| propertyKey  | 属性名，需要检查目标对象是否存在此属性  | Y    |

### Reflect.isExtensible()

Reflect.isExtensible 判断一个对象是否可扩展 （即是否能够添加新的属性），它与 Object.isExtensible() 方法一样。

**语法**

> Reflect.isExtensible(target)

**解释**

| 参数          | 含义             | 必选 |
| ------------ | --------------- | ---- |
| target       | 获取原型的目标对象  | Y    |

### Reflect.ownKeys()

Reflect.ownKeys() 方法返回一个由目标对象自身的属性键组成的数组。

它的返回值等同于 `Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))`。

**语法**

> Reflect.ownKeys(target)

**解释**

| 参数          | 含义             | 必选 |
| ------------ | --------------- | ---- |
| target       | 获取原型的目标对象  | Y    |

**示例**

```javascript
Reflect.ownKeys({
  z: 3,
  y: 2,
  x: 1
}) // [ "z", "y", "x" ]
Reflect.ownKeys([]) // ["length"]

var sym = Symbol.for("comet")
var sym2 = Symbol.for("meteor")
var obj = {
  [sym]: 0,
  "str": 0,
  "773": 0,
  "0": 0,
  [sym2]: 0,
  "-1": 0,
  "8": 0,
  "second str": 0
}
Reflect.ownKeys(obj)
// [ "0", "8", "773", "str", "-1", "second str", Symbol(comet), Symbol(meteor) ]
// Indexes in numeric order,
// strings in insertion order,
// symbols in insertion order
```

### Reflect.preventExtensions()

Reflect.preventExtensions() 方法阻止新属性添加到对象（例如：防止将来对对象的扩展被添加到对象中）。

该方法与 Object.preventExtensions() 方法一致。

**语法**

> Reflect.preventExtensions(target)

**解释**

| 参数          | 含义             | 必选 |
| ------------ | --------------- | ---- |
| target       | 获取原型的目标对象  | Y    |

**示例**

```javascript
// Objects are extensible by default.
var empty = {}
Reflect.isExtensible(empty) // === true

// ...but that can be changed.
Reflect.preventExtensions(empty)
Reflect.isExtensible(empty) // === false
```

```javascript
Reflect.preventExtensions(1)
// TypeError: 1 is not an object

Object.preventExtensions(1)
// 1
```

### Reflect.set()

Reflect.set 方法允许你在对象上设置属性。它的作用是给属性赋值并且就像[属性访问器](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Property_Accessors)语法一样，但是它是以函数的方式。

**语法**

> Reflect.set(target, propertyKey, value[, receiver])

**解释**

| 参数          | 含义                              | 必选 |
| ------------ | -------------------------------- | ---- |
| target       | 获取原型的目标对象                   | Y    |
| propertyKey  | 设置的属性的名称                     | Y    |
| value        | 设置的值                           | Y    |
| receiver     | 如果遇到 setter，this 将提供给目标调用 | N    |

**示例**

```javascript
// Object
var obj = {}
Reflect.set(obj, "prop", "value") // true
obj.prop // "value"

// Array
var arr = ["duck", "duck", "duck"]
Reflect.set(arr, 2, "goose") // true
arr[2] // "goose"

// It can truncate an array.
Reflect.set(arr, "length", 1) // true
arr // ["duck"]

// With just one argument, propertyKey and value are "undefined".
var obj = {}
Reflect.set(obj) // true
Reflect.getOwnPropertyDescriptor(obj, "undefined")
// { value: undefined, writable: true, enumerable: true, configurable: true }
```

### Reflect.setPrototypeOf()

Reflect.setPrototypeOf() 方法改变指定对象的原型（即内部的 `[[Prototype]]` 属性值）。

**语法**

> Reflect.setPrototypeOf(target, prototype)

**解释**

| 参数        | 含义                         | 必选 |
| ---------- | ---------------------------- | ---- |
| target     | 获取原型的目标对象              | Y    |
| prototype  | 对象的新原型（一个对象或 `null`） | Y    |

**示例**

```javascript
Reflect.setPrototypeOf({}, Object.prototype) // true

// It can change an object's [[Prototype]] to null.
Reflect.setPrototypeOf({}, null) // true

// Returns false if target is not extensible.
Reflect.setPrototypeOf(Object.freeze({}), null) // false

// Returns false if it cause a prototype chain cycle.
var target = {}
var proto = Object.create(target)
Reflect.setPrototypeOf(target, proto) // false
```

::: warning
对于以上所有 API 第一个参数是 Object 的，如果给定的不是 Object 则抛出一个 TypeError 异常
:::

## 参考资料

* [Reflect](https://es6.ruanyifeng.com/#docs/reflect)
* [Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

（完）
