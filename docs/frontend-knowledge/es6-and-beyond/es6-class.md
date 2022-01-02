# Class

对于面向对象编程而言，主要关注类的声明、属性、方法、静态方法、继承、多态、私有属性。

## 声明类

ES6 之前类是通过构造函数来实现的：

```javascript
let Animal = function(type) {
  this.type = type
  this.walk = function() {
    console.log('I am walking')
  }
}

let dog = new Animal('dog')
let monkey = new Animal('monkey')
```

或者可以这样写：

```javascript
let Animal = function(type) {
  this.type = type
}

Animal.prototype.walk = function() {
  console.log('I am walking')
}

let dog = new Animal('dog')
let monkey = new Animal('monkey')
```

在 ES6 中把类的声明专业化了，通过 class 语法来代替 function 的方式:

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  walk() {
    console.log( `I am walking` )
  }
}

let dog = new Animal('dog')
let monkey = new Animal('monkey')
```

这样就和其他编程语言（Java、Python）保持一致了：声明一个类时有构造函数、方法。

但 `class` 不是新的数据类型，它本质上还是一个 `function`，通过观察原型可以发现，`Animal.prototype` 对象上有两个方法，一个是构造函数（`constructor`）、一个是自定义的方法（`walk`），这和上面 ES5 的第二种写法是一样的。而且和 ES5 一样，都有个 API 用来判断对象的自有属性（`hasOwnProperty`）。

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  walk() {
    console.log( `I am walking` )
  }
}

console.log(Animal.prototype)
```

所以可以得出结论：`class` 的方式是 `function` 方式的语法糖。

## Setters & Getters

对于类中的属性，除了可以直接在 `constructor` 中通过 `this` 直接定义，还可以直接在类的顶层来定义：

```javascript
class Animal {
  constructor(type, age) {
    this.type = type
    this._age = age
  }
  get age() {
    return this._age
  }
  set age(val) {
    this._age = val
  }
}
```

乍一看没有什么实质性用途，不过 get/set 的真正用途要体现在只读属性/私有属性上：

* `addr` 是个只读属性

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  get addr() {
    return '北京动物园'
  }
}
```

* 对某个属性设置 `get` 和 `set`，拦截该属性的赋值和读取行为

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  get addr() {
    return '北京动物园'
  }
  set addr(value) {
    console.log(`can not set addr: ${value}`);
  }
}

let dog = new Animal('dog')
console.log(dog.addr)  // 北京动物园
dog.addr = '上海动物园' // can not set addr: 上海动物园
```

## 静态方法

静态方法是面向对象最常用的功能，在 ES5 中利用 function 实现的类是这样实现一个静态方法的。

```javascript
let Animal = function(type) {
  this.type = type
  this.walk = function() {
    console.log('I am walking')
  }
}

Animal.eat = function(food) {
  console.log('I am eating')
}
```

在 ES6 中使用 `static` 的标记是不是静态方法，这也和其他变成语言保持了一致。

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  walk() {
    console.log('I am walking')
  }
  static eat() {
    console.log('I am eating')
  }
}
```

## 继承

面向对象之所以可以应对复杂的项目实现，很大程度上要归功于继承。在 ES5 中是这样实现继承的：

```javascript
// 定义父类
let Animal = function(type) {
  this.type = type
}
// 定义方法
Animal.prototype.walk = function() {
  console.log( `I am walking` )
}
// 定义静态方法
Animal.eat = function(food) {
  console.log( `I am eating` )
}
// 定义子类
let Dog = function() {
  // 初始化父类
  Animal.call(this, 'dog')
  this.run = function() {
    console.log('I can run')
  }
}
// 继承
Dog.prototype = Animal.prototype
```

从代码上看，很繁琐，而且阅读性也较差。ES6 是这样解决这些问题的：

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  walk() {
    console.log( `I am walking` )
  }
  static eat() {
    console.log( `I am eating` )
  }
}

class Dog extends Animal {
  constructor () {
    super('dog')
  }
  run () {
    console.log('I can run')
  }
}
```

虽然 ES6 在类的定义上仅是 ES5 定义类的语法糖，但是从开发者的角度而言，开发更有效率了，代码可阅读性大大提升。

## 参考资料

* [Class 的基本语法](https://es6.ruanyifeng.com/#docs/class)
* [Class 的继承](https://es6.ruanyifeng.com/#docs/class-extends)
* [类](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
* [ES6 class](https://www.kancloud.cn/kancloud/you-dont-know-js-this-object-prototypes/516675)

（完）
