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
