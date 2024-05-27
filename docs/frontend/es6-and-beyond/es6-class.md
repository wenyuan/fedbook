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

上面这两种写法跟传统的面向对象语言差异很大，很容易让新学习这门语言的程序员感到困惑。

在 ES6 中把类的声明专业化了，通过 class 语法来代替 function 的方式:

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  walk() {
    console.log('I am walking')
  }
}

let dog = new Animal('dog')
let monkey = new Animal('monkey')
```

这样就和其他编程语言（Java、Python）保持一致了，声明一个类时有构造函数、方法。

但 `class` 不是新的数据类型，它本质上还是一个 `function`，通过观察原型可以发现，`Animal.prototype` 对象上有两个方法，一个是构造函数（`constructor`）、一个是自定义的方法（`walk`），这和上面 ES5 的第二种写法是一样的。而且和 ES5 一样，都有个 API 用来判断对象的自有属性（`hasOwnProperty`）。

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  walk() {
    console.log('I am walking')
  }
}

console.log(Animal.prototype)
```

从上面代码可以看出：

* 类里面有一个 `constructor()` 方法，这就是构造方法。
* `this` 关键字指向实例对象。
* 给类增加自定义方法的时候，前面不需要加上 `function` 关键字，直接把函数定义放进去了就可以了。另外，方法与方法之间不需要逗号分隔，加了会报错。
* 类的所有方法（`constructor()` 和自定义方法）都定义在类的 `prototype` 属性上面，因此在类的实例上面调用方法，其实就是调用原型上的方法。

所以可以得出结论：`class` 的方式是 `function` 方式的语法糖，它诞生的目的是让对象原型的写法更加清晰、更像面向对象编程的语法。

## 构造函数 constructor

`constructor` 是一种用于创建和初始化 `class` 创建的对象的特殊方法。

它是类的默认方法，通过 `new` 命令生成对象实例时，自动调用该方法。一个类必须有 `constructor()` 方法，如果没有显式定义，一个空的 `constructor()` 方法会被默认添加。

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
}

let dog = new Animal('dog')
let monkey = new Animal('monkey')
```

`constructor()` 方法默认返回实例对象（即 `this`），但完全可以指定返回另外一个对象。

下面的代码中，`constructor()` 函数返回一个全新的对象，结果导致实例对象不是 `Foo` 类的实例。

```javascript
class Foo {
  constructor() {
    return Object.create(null);
  }
}

new Foo() instanceof Foo
// false
```

在一个构造方法中可以使用 `super` 关键字来调用一个父类的构造方法（super 这个知识点下面单独讲）。

## 类的实例化

class 的实例化必须通过 new 关键字，且类的所有实例共享一个原型对象。

```javascript
class Example {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    console.log('Example');
  }
  sum() {
    return this.a + this.b;
  }
}

let exam1 = new Example(2, 1);
let exam2 = new Example(3, 1);
console.log(exam1._proto_ == exam2._proto_); // true 

exam1._proto_.sub = function () {
  return this.a - this.b;
}
console.log(exam1.sub()); // 1 
console.log(exam2.sub()); // 2
```

上面代码中，`exam1` 和 `exam2` 都是 `Example` 的实例，它们的原型都是 `Example.prototype`，所以 `__proto__` 属性是相等的。

这也意味着，可以通过实例的 `__proto__` 属性为「类」添加方法。

> `__proto__` 并不是语言本身的特性，这是各大厂商具体实现时添加的私有属性，虽然目前很多现代浏览器的 JS 引擎中都提供了这个私有属性，但依旧不建议在生产中使用该属性，避免对环境产生依赖。生产环境中，我们可以使用 `Object.getPrototypeOf()` 方法来获取实例对象的原型，然后再来为原型添加方法/属性。

使用实例的 `__proto__` 属性改写原型，必须相当谨慎，不推荐使用，因为这会改变「类」的原始定义，影响到所有实例。

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

let dog = new Animal('dog')
console.log(dog.addr)  // "北京动物园"
dog.addr = '上海动物园'
console.log(dog.addr)  // "北京动物园"
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
console.log(dog.addr)  // "北京动物园"
dog.addr = '上海动物园' // "can not set addr: 上海动物园"
```

但是如果某个属性有存值操作，那这个属性的 getter 不可单独出现：

```javascript
class Animal {
  constructor(type) {
    this.type = type
  }
  get type() {
    return this.type
  }
}

let dog = new Animal('dog')
// Uncaught TypeError: Cannot set property type of #<Animal> which has only a getter
```

getter 与 setter 必须同级出现，否则会出现问题：

```javascript
class Father {
  constructor() {}
  get a() {
    return this._a;
  }
}
class Child extends Father {
  constructor() {
    super();
  }
  set a(a) {
    this._a = a;
  }
}
let child = new Child();
child.a = 2;
console.log(child.a); // undefined
```

正确写法：创建类的时候同时声明 get 和 set，或者把 get 和 set 都放在子类中：

```javascript
class Father {
  constructor() {}
  // 或者都放在子类中
  get a() {
    return this._a;
  }
  set a(a) {
    this._a = a;
  }
}
class Child extends Father {
  constructor() {
    super();
  }
}
let child = new Child();
child.a = 2;
console.log(child.a); // 2
```

## 静态方法 static

> JS 中静态方法通常是实用程序方法，例如创建或克隆对象的功能。

静态方法是面向对象最常用的功能，在 ES5 中利用 function 实现的类是这样实现一个静态方法的：

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

在 ES6 中使用 `static` 的标记是不是静态方法，这也和其他变成语言保持了一致：

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

Animal.eat() // "I am eating"
```

不能在类的实例上调用静态方法，而应该通过类本身调用，否则会抛出一个错误，表示不存在该方法：

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

let dog = new Animal('dog')
dog.eat()
// Uncaught TypeError: dog.eat is not a function
```

如果静态方法包含 `this` 关键字，这个 `this` 指的是类，而不是实例。

下面代码中，静态方法 `bar` 调用了 `this.baz`，这里的 `this` 指的是 `Foo` 类，而不是 `Foo` 的实例，等同于调用 `Foo.baz`。另外，从这个例子还可以看出，静态方法可以与非静态方法重名。

```javascript
class Foo {
  static bar() {
    this.baz();
  }
  static baz() {
    console.log('hello');
  }
  baz() {
    console.log('world');
  }
}

Foo.bar() // "hello"
```

父类的静态方法，可以被子类继承。

下面代码中，父类 `Foo` 有一个静态方法，子类 `Bar` 可以调用这个方法：

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
}

Bar.classMethod() // "hello"
```

静态方法也是可以从 `super` 对象上调用的：

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
  static classMethod() {
    return super.classMethod() + ', too';
  }
}

Bar.classMethod() // "hello, too"
```

## 关键字 super

super 关键字用于访问和调用一个对象的父对象上的函数。

* 关键字 `super` 作为函数时，`super()` 只能用在子类的构造函数之中，用在其他地方就会报错。并且必须在使用 `this` 关键字之前使用。
* 关键字 `super` 作为对象时，可以用来调用父对象上的函数。

调用父类的构造函数：

```javascript
class Polygon {
  constructor(height, width) {
    this.name = 'Rectangle';
    this.height = height;
    this.width = width;
  }
  sayName() {
    console.log('Hi, I am a ', this.name + '.');
  }
  get area() {
    return this.height * this.width;
  }
  set area(value) {
    this._area = value;
  }
}

class Square extends Polygon {
  constructor(length) {
    // this.height; // 这样直接 this.height 会报错：ReferenceError，因为 super 需要先被调用！

    // 这里 super 单独出现, 调用父类的构造函数
    // 参数作为父类 Polygon 的 height, width
    super(length, length);

    // 注意: 子类的 this 必须在调用 super() 之后使用
    this.name = 'Square';
  }
}
```

调用父类上的静态方法：

```javascript
class Rectangle {
  constructor() {}
  static logNbSides() {
    return 'I have 4 sides';
  }
}

class Square extends Rectangle {
  constructor() {
    super()
  }
  static logDescription() {
    return super.logNbSides() + ' which are all equal';
  }
}
Square.logDescription(); // "I have 4 sides which are all equal"
```

子类 constructor 方法中必须有 super ，且必须出现在 this 之前。

错误写法 1：

```javascript
class Father {
  constructor() {}
}
class Child extends Father {
  constructor() {}
}
let test = new Child();
// Uncaught ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```

错误写法 2：

```javascript
class Father {
  constructor() {}
}
class Child extends Father {
  constructor(a) {
    this.a = a;
    super();
  }
}
let test = new Child();
// Uncaught ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```

关键字 `super` 作为函数时，`super()` 只能出现在子类的构造函数里用于调用父类构造函数，用在其他地方就会报错。

错误写法：

```javascript
class Father {
  test() {
    return 0;
  }
  static test1() {
    return 1;
  }
}
class Child1 extends Father {
  constructor() {
    super();
  }
}
class Child2 extends Father {
  test2() {
    super(); // Uncaught SyntaxError: 'super' keyword unexpected     
    // here
  }
}
```

关键字 `super` 作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。

```javascript
class Father {
  test() {
    return 0;
  }
  static test1() {
    return 1;
  }
}
class Child extends Father {
  constructor(){
    super();
    // 调用父类普通方法
    console.log(super.test()); // 0
  }
  static test3() {
    // 调用父类静态方法
    return super.test1() + 2;
  }
}

Child.test3(); // 3
```

## 继承 extends

面向对象之所以可以应对复杂的项目实现，很大程度上要归功于继承。在 ES5 中是这样实现继承的：

```javascript
// 定义父类
let Animal = function(type) {
  this.type = type
}
// 定义方法
Animal.prototype.walk = function() {
  console.log('I am walking')
}
// 定义静态方法
Animal.eat = function(food) {
  console.log('I am eating')
}
// 定义子类
let Dog = function() {
  // 初始化父类
  Animal.call(this, 'dog')
  this.woof = function() {
    console.log('Wang Wang')
  }
}
// 继承
Dog.prototype = Animal.prototype
```

从代码上看，很繁琐，而且阅读性也较差。ES6 的 Class 可以通过 `extends` 关键字实现继承，这要比之前清晰和方便很多：

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

class Dog extends Animal {
  constructor () {
    super('dog')
  }
  woof () {
    console.log('Wang Wang')
  }
}
```

上面代码中，需要注意的是**子类的构造函数必须执行一次 `super` 函数，否则 JavaScript 引擎会报错**。

注意点：

* 子类必须在 `constructor()` 方法中调用 `super()` 方法，这是因为子类自己的 `this` 对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法。如果不调用 `super()` 方法，子类就得不到 `this` 对象。

  > ES5 的继承，实质是先创造子类的实例对象 `this`，然后再将父类的方法添加到 `this` 上面（`Parent.apply(this)`）。ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到 `this` 上面（所以必须先调用 `super()` 方法），然后再用子类的构造函数修改 `this`。

* 另一个需要注意的地方是，在子类的构造函数中，只有调用 `super()` 之后，才可以使用 `this` 关键字，否则会报错。这是因为子类实例的构建，基于父类实例，只有 `super()` 方法才能调用父类实例。

## 不存在变量提升

类不存在变量提升（hoist），这一点与 ES5 完全不同。

```javascript
new Foo(); // ReferenceError
class Foo {}
```

上面代码中，`Foo` 类使用在前，定义在后，这样会报错，因为 ES6 不会把类的声明提升到代码头部。这种规定的原因与继承有关，必须保证子类在父类之后定义。

```javascript
{
  let Foo = class {};
  class Bar extends Foo {
  }
}
```

上面的代码不会报错，因为 `Bar` 继承 `Foo` 的时候，`Foo` 已经有定义了。但是，如果存在 `class` 的提升，上面代码就会报错，因为 `class` 会被提升到代码头部，而 `let` 命令是不提升的，所以导致 `Bar` 继承 `Foo` 的时候，`Foo` 还没有定义。

## 总结

虽然 ES6 在类的定义上仅是 ES5 定义类的语法糖，但是从开发者的角度而言，开发更有效率了，代码可阅读性大大提升。

## 参考资料

* [Class 的基本语法](https://es6.ruanyifeng.com/#docs/class)
* [Class 的继承](https://es6.ruanyifeng.com/#docs/class-extends)
* [类](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)
* [ES6 class](https://www.kancloud.cn/kancloud/you-dont-know-js-this-object-prototypes/516675)

（完）
