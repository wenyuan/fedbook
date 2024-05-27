# Symbol

ES6 引入了一种新的原始数据类型 `Symbol` ，表示独一无二的值。

Symbol 值通过 Symbol 函数生成。这就是说，对象的属性名现在可以有两种类型，一种是原来就有的字符串，另一种就是新增的 Symbol 类型。凡是属性名属于 Symbol 类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

## 声明方式

```javascript
let s1 = Symbol()
let s2 = Symbol()
console.log(s1)        // Symbol()
console.log(s2)        // Symbol()
console.log(s1 === s2) // false
```

Symbol 函数可以接受一个字符串作为参数，表示对 Symbol 实例的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分。

```javascript
let s1 = Symbol('foo')
let s2 = Symbol('foo')
console.log(s1)        // Symbol(foo)
console.log(s2)        // Symbol(foo)
console.log(s1 === s2) // false
```

## Symbol.for()

`Symbol.for()` 接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 Symbol 值。如果有，就返回这个 Symbol 值，否则就新建一个以该字符串为名称的 Symbol 值，并将其注册到全局。

```javascript
let s1 = Symbol.for('foo')
let s2 = Symbol.for('foo')
console.log(s1 === s2) // true
```

::: warning
Symbol.for() 与 Symbol() 这两种写法，都会生成新的 Symbol。它们的区别是，前者会被登记在全局环境中供搜索，后者不会。Symbol.for() 不会每次调用就返回一个新的 Symbol 类型的值，而是会先检查给定的 key 是否已经存在，如果不存在才会新建一个值。
:::

## Symbol.keyFor()

`Symbol.keyFor()` 方法返回一个已登记的 Symbol 类型值的 key。

> Symbol.keyFor() 方法使用全局符号注册表来查找符号的键。因此，它不适用于非全局符号。如果该符号不是全局符号，则将无法找到它并返回未定义。

```javascript
const s1 = Symbol('foo')
console.log(Symbol.keyFor(s1)) // undefined

const s2 = Symbol.for('foo')
console.log(Symbol.keyFor(s2)) // foo
```

## 作为属性名

由于每一个 Symbol 值都是不相等的，这意味着 Symbol 值可以作为标识符，用于对象的属性名，就能保证不会出现同名的属性。这对于一个对象由多个模块构成的情况非常有用，能防止某一个键被不小心改写或覆盖。

比如在一个班级中，可能会有同学名字相同的情况，这时候使用对象来描述学生信息的时候，如果直接使用学生姓名作为 key 会有问题。如果使用 Symbol，同名的学生信息就不会被覆盖。

```javascript
let stu1 = Symbol('李四')
let stu2 = Symbol('李四')
let stu3 = Symbol('李四')

// 第一种写法
let grade = {
  [stu1]: {
    address: 'xxx',
    tel: '111'
  }
}

// 第二种写法
grade[stu2] = {
  address: 'yyy',
  tel: '222'
}

// 第三种写法
Object.defineProperty(grade, stu3, {
  value: { address: 'zzz', tel: '333' },
  writable: true,
  configurable: true,
  enumerable: true
})

// 以上写法都能往学生信息中写入同名学生
console.log(grade)
console.log(grade[stu1])
console.log(grade[stu2])
console.log(grade[stu3])
```

## 属性遍历

Symbol 作为属性名，遍历对象的时候，常规的遍历方法（如下）是无法获取到该属性的：

* for...in、for...of 循环中
* Object.keys()
* Object.getOwnPropertyNames()
* JSON.stringify()

它有一个 `Object.getOwnPropertySymbols()` 方法，可以获取指定对象的所有 Symbol 属性名。该方法返回一个数组，成员是当前对象的所有用作属性名的 Symbol 值。

```javascript
let obj = {}
let a = Symbol('a')
let b = Symbol('b')

obj[a] = 'Hello'
obj[b] = 'World'

let objectSymbols = Object.getOwnPropertySymbols(obj)

console.log(objectSymbols) // [Symbol(a), Symbol(b)]
```

另外，在 ES6 中还有一个新的 API，`Reflect.ownKeys()` 方法可以返回所有类型的键名，包括常规键名和 Symbol 键名。

```javascript
let obj = {}
let a = Symbol('a')
let b = Symbol('b')

obj[a] = 'Hello'
obj[b] = 'World'

let objectSymbols = Reflect.ownKeys(obj)

console.log(objectSymbols) // [Symbol(a), Symbol(b)]
```

## 消除魔术字符串

魔术字符串指的是，在代码之中多次出现、与代码形成强耦合的某一个具体的字符串或者数值。风格良好的代码，应该尽量消除魔术字符串，改由含义清晰的变量代替。

```javascript
function getArea(shape) {
  let area = 0
  switch (shape) {
    case 'Triangle':
      area = 1
      break
    case 'Circle':
      area = 2
      break
  }
  return area
}
console.log(getArea('Triangle'))
```

上面代码中，字符串 `Triangle` 和 `Circle` 就是魔术字符串。它多次出现，与代码形成「强耦合」，不利于将来的修改和维护。

使用 Symbol 就可以很好的解决这个问题：

```javascript
const shapeType = {
  triangle: Symbol(),
  circle: Symbol()
}

function getArea(shape) {
  let area = 0
  switch (shape) {
    case shapeType.triangle:
      area = 1
      break
    case shapeType.circle:
      area = 2
      break
  }
  return area
}
console.log(getArea(shapeType.triangle))
```

## 参考资料

* [Symbol](https://es6.ruanyifeng.com/#docs/symbol)
* [Symbol](https://developer.mozilla.org/zh-CN/docs/Glossary/Symbol)
* [Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#添加多个属性和默认值)
