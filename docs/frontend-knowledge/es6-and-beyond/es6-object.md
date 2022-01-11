# Object 扩展

## 属性简洁表示法

在 ES6 之前 Object 的属性必须是 key-value 形式。

```javascript
let name = 'zhangsan'
let age = 13
let obj = {
  name: name,
  age: age,
  study: function() {
    console.log(this.name + '在自学前端')
  }
}
```

在 ES6 之后是可以用简写的形式来表达。

```javascript
let name = 'zhangsan'
let age = 13
let obj = {
  name,
  age,
  study() {
    console.log(this.name + '在自学前端')
  }
}
```

## 属性名表达式

在 ES6 可以直接用变量或者表达式来定义 Object 的 key。

```javascript
let s = 'school'
let obj = {
  name: 'zhangsan',
  [s]: 'mit'
}
```

## Object.is()

判断两个对象是否相等，与严格比较运算符（`===`）的行为基本一致。

```javascript
// new Object()
let obj1 = {
  name: 'zhangsan',
  age: 13
}

// new Object()
let obj2 = {
  name: 'zhangsan',
  age: 13
}
console.log(obj1 == obj2)          // false
console.log(Object.is(obj1, obj2)) // false

let obj3 = obj1
console.log(obj1 === obj3)         // true
console.log(Object.is(obj1, obj3)) // true
```

## Object.assign()

用于将所有可枚举属性的值从一个或多个源对象复制到目标对象，它将返回目标对象。

**语法**

> Object.assign(target, ...sources)

**解释**

| 参数     | 含义    | 必选  |
| ------- | ------ | ---- |
| target  | 目标对象 | Y    |
| sources | 源对象   | N    |

从语法上可以看出源对象的个数是不限制的（零个或多个），如果是零个直接返回目标对象，如果是多个，相同属性会被位于后边的源对象属相覆盖。

```javascript
let target = { a: 1 }

let source1 = { a: 2, b: 2 }
let source2 = { a: 3, c: 3 }

Object.assign(target, source1, source2)
console.log(target) // {a:3, b:2, c:3}
```

`Object.assign()` 对于引用数据类型属于浅拷贝，也就是说对于同名属性，后面的源对象会整个的覆盖位于前面的源对象。

如下，复制后 `age` 属性消失了，因为源对象中的 `desc` 里没有 `age`。

```javascript
let target = {
  desc: {
    name: 'zhangsan',
    age: '13'
  }
}
let source = {
  desc: {
    name: 'lisi'
  }
}

Object.assign(target, source)
console.log(target) // { desc: { name: 'lisi' } }
```

## 对象的遍历方式

### for...in

for...in 可以遍历出对象的 key，然后通过 key 获取值。

```javascript
let obj = {
  name: 'zhangsan',
  age: 13,
  school: 'mit'
}

for (let key in obj) {
  console.log(key, obj[key])
}
```

### Object.keys()

用于返回对象所有 key 组成的数组。

```javascript
let obj = {
  name: 'zhangsan',
  age: 13,
  school: 'mit'
}

Object.keys(obj).forEach(key => {
  console.log(key, obj[key])
})
```

### Object.getOwnPropertyNames()

用于返回对象所有 key 组成的数组。

```javascript
let obj = {
  name: 'zhangsan',
  age: 13,
  school: 'mit'
}

Object.getOwnPropertyNames(obj).forEach(key => {
  console.log(key, obj[key])
})
```

### Reflect.ownKeys()

用于返回对象所有 key 组成的数组。

```javascript
let obj = {
  name: 'zhangsan',
  age: 13,
  school: 'mit'
}

Reflect.ownKeys(obj).forEach(key => {
  console.log(key, obj[key])
})
```

## 参考资料

* [对象的新增方法](https://es6.ruanyifeng.com/#docs/object-methods)
* [Object.assign()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

（完）
