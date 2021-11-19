# 继承的八种方式

## 前言

在编写代码时，有些对象会有方法（函数），如果把这些方法都放在构造函数中声明就会导致内存的浪费。

如下，通过调用构造函数的方式来创建对象，`Person` 是 `p1`、`p2` 的构造函数。所有的 `Person` 对象都有 `say` 方法，并且功能相似，但是他们占据了不同的内存，会导致内存浪费（内存泄露）。

```javascript
function Person() {
  this.say = function() {
    console.log("你好");
  }
}

var p1 = new Person();
var p2 = new Person();
console.log(p1.say === p2.say); // false
```

于是，我们就需要用到**继承**。

> 通过某种方式让一个对象可以访问到另一个对象中的属性和方法，我们把这种方式称之为继承。

在 JavaScript 中，继承的方式有很多种，外界对此也没有准确的认定到底有多少种方式，褒贬不一，主流通常有 8 种方式：

* 原型链继承
* 借用构造函数继承
* 组合模式继承
* 共享原型继承
* 原型式继承
* 寄生式继承
* 寄生组合式继承
* ES6 中 class 的继承（新）

## 原型链继承

通过实例化一个新的函数，子类的原型指向了父类的实例，子类就可以调用其父类原型对象上的私有属性和公有方法。（本质就是重写了原型对象）

代码示例：

```javascript
function Parent() {
  this.parentName = '父类';
}
Parent.prototype.getParentName = function() {
  return this.parentName;
};

function Child() {
  this.childName = '子类';
}
Child.prototype = new Parent();
Child.prototype.getChildName = function() {
  return this.childName
};

var c = new Child();
console.log(c.getParentName()); // '父类'
```

### 需要注意的问题

#### 1）别忘记默认的类型

我们知道，所有的引用类型都继承了 Object，而这个继承也是通过原型链实现的。所以所有的对象都拥有 Object 具有的一些默认的方法。如：`hasOwnProperty()`、`propertyIsEnumerable()`、`toLocaleString()`、`toString()` 和 `valueOf()`。

#### 2）确定原型和实例的关系

可以通过两种方式来确定原型和实例之间的关系。

* 第一种：使用 `instanceof` 操作符，只要用这个操作符来测试实例与原型链中出现过的构造函数，结果就会返回 `true`。
* 第二种：使用 `isPrototypeOf()` 方法。同样，只要是原型链中出现过的原型，都可以说是该原型链所派生的实例的原型，因此 `isPrototypeOf()` 方法也会返回 `true`。

还是上面的代码，尝试打印一些比对关系：

```javascript
console.log(c instanceof Object); //true
console.log(c instanceof Parent); //true
console.log(c instanceof Child); //true

console.log(Object.prototype.isPrototypeOf(c)); //true
console.log(Parent.prototype.isPrototypeOf(c)); //true
console.log(Child.prototype.isPrototypeOf(c)); //true
```

#### 3）子类要在继承后定义新方法

因为，原型链继承实质上是重写原型对象。所以，如果在继承前就在子类的 prototype 上定义了一些方法和属性，那么继承后，子类的这些属性和方法将会被覆盖。

#### 4）不能使用对象字面量创建原型方法

这个的原理跟上一条的实际上是一样的。当你使用对象字面量创建原型方法重写原型的时候，实质上相当于重写了原型链，所以原来的原型链就被切断了。

代码示例：

```javascript {14-21}
function Parent() {
  this.parentName = '父类';
}
Parent.prototype.getParentName = function() {
  return this.parentName;
};

function Child() {
  this.childName = '子类';
}
// 继承 Parent
Child.prototype = new Parent();
// 使用对象字面量添加新方法，会导致上一行代码无效
Child.prototype = {
  getChildName: function() {
    return this.childName;
  },
  someOtherMethod: function() {
    return false;
  }
}

var c = new Child()
console.log(c.getParentName) // undefined
```

#### 5）注意父类包含引用类型的情况

代码示例：

```javascript
function Parent() {
  this.name = "父类";
  this.hobbies = ["sing", "dance", "rap"];
}
function Child() {}
// 继承 Parent
Child.prototype = new Parent();

var c1 = new Child();
c1.name = "c1";
c1.hobbies.push("coding");
console.log(c1.name);
console.log(c1.hobbies);

var c2 = new Child();
console.log(c2.name);
console.log(c2.hobbies);
```

上述代码执行后，输出结果为：

```bash
"c1"
["sing", "dance", "rap", "coding"]
"父类"
["sing", "dance", "rap", "coding"]
```

这个例子中的 Parent 构造函数定义了一个 hobbies 属性，该属性包含一个数组（引用类型值）。Parent 的每个实例都会有各自包含自己数组的 hobbies 属性。当 Child 通过原型链继承了 Parent 之后，Child.prototype 就变成了 Parent 的一个实例，因此它也拥有了一个它自己的 hobbies 属性 —— 就跟专门创建了一个 Child.prototype.hobbies 属性一样。但结果是什么呢？结果是 Child 的所有实例都会共享这一个 hobbies 属性。而我们对 c1.hobbies 的修改能够通过 c2.hobbies 反映出来。也就是说，这样的修改会影响各个实例。

### 原型链继承的优点

* 简单，易实现
* 父类新增原型方法/原型属性，子类都能访问

### 原型链继承的缺点

* 无法实现多继承
* 引用类型的值会被实例共享
* 子类型无法给超类型传递参数

鉴于这些缺点，实践中很少会单独使用原型链继承。

## 借用构造函数继承（对象冒充）

在解决原型链继承中包含引用类型值所带来问题的过程中，开发人员开始使用一种叫做借用构造函数（constructor stealing）的技术。

这种技术的基本思想相当简单，即在子类型构造函数的内部调用超类型构造函数。

```javascript
function Parent(name) {
  this.name = name;
  this.hobbies = ["sing", "dance", "rap"];
}

function Child(name) {
  Parent.call(this, name);
  this.age = 24
}

var c1 = new Child('c1');
var c2 = new Child('c2');
c1.hobbies.push('coding');

console.log(c1.hobbies)
console.log(c2.hobbies)
console.log(c1 instanceof Parent)
console.log(c1 instanceof Child)
```

上述代码执行后，输出结果为：

```bash
["sing", "dance", "rap", "coding"]
["sing", "dance", "rap"]
false
true
```

借用构造函数的基本思想就是利用 `call` 或者 `apply` 把父类中通过 `this` 指定的属性和方法复制（借用）到子类创建的实例中。

因为 `this` 对象是在运行时基于函数的执行环境绑定的。也就是说，在全局中，`this` 等于 `window`，而当函数被作为某个对象的方法调用时，`this` 等于那个对象。`call` 、`apply` 方法可以用来代替另一个对象调用一个方法。`call`、`apply` 方法可将一个函数的对象上下文从初始的上下文改变为由 thisObj 指定的新对象。

所以，这个借用构造函数就是，`new` 对象的时候（注意，`new` 操作符与直接调用是不同的，以函数的方式直接调用的时候，`this` 指向 `window`，`new` 创建的时候，`this` 指向创建的这个实例），创建了一个新的实例对象，并且执行 Child 里面的代码，而 Child 里面用 `call` 调用了 Parent，也就是说把 `this` 指向改成了指向新的实例，所以就会把 Parent 里面的 `this` 相关属性和方法赋值到新的实例上，而不是赋值到 Child 上面。所有实例中就拥有了父类定义的这些 `this` 的属性和方法。

### 借用构造函数的优点

* 解决了引用类型的值被实例共享的问题
* 可以向超类传递参数
* 可以实现多继承（call 若干个超类）

### 借用构造函数的缺点

* 不能继承超类原型上的属性和方法
* 无法实现函数复用，由于 call 有多个父类实例的副本，性能损耗。
* 原型链丢失

## 组合模式继承

组合继承（combination inheritance），有时候也叫做伪经典继承。是将原型链继承和借用构造函数继承的技术组合到一块，从而发挥二者之长的一种继承模式。

```javascript
function Parent(name){
  this.name = name;
  this.hobbies = ["sing", "dance", "rap"];
}
Parent.prototype.getName = function(){
  return this.name
}
function Child(name){
  Parent.call(this, name);
  this.age = 24
}

Child.prototype = new Parent('父类')
var c1 = new Child('c1');
var c2 = new Child('c2');

console.log(c1.hasOwnProperty('name')); // true
console.log(c1.getName()); // "c1"

c1.hobbies.push('coding');
console.log(c1.hobbies); // ["sing", "dance", "rap", "coding"]
console.log(c2.hobbies); // ["sing", "dance", "rap"]
```

这种继承方式看起来似乎没有问题，但是它却调用了 2 次超类型构造函数：一次在子类构造函数内，另一次是将子类的原型指向父类构造的实例，导致生成了 2 次 name 和 hobbies，只不过实例屏蔽了原型上的（`console.log(c1)`）。虽然达成了目的，却不是我们最想要的。


<div style="text-align: center;">
  <img src="./assets/combination-inheritance_c1.png" alt="实例和原型上的属性值不一样" style="width: 450px;">
  <p style="text-align: center; color: #888;">（实例和原型上的属性值不一样）</p>
</div>

这个问题将在寄生组合式继承里得到解决。

## 共享原型继承

这种方式下子类和父类共享一个原型。

```javascript
function Parent(){}
Parent.prototype.hobbies = ["sing", "dance", "rap"];

function Child(name, age){
  this.name = name;
  this.age = age;
}
Child.prototype = Parent.prototype;

var c1 = new Child("c1", 20);
var c2 = new Child("c2", 24);

c1.hobbies.push("coding");
console.log(c1.hobbies); // ["sing", "dance", "rap", "coding"]
console.log(c2.hobbies); // ["sing", "dance", "rap", "coding"]
console.log(c1.name); // "c1"
console.log(c2.name); // "c2"
```

### 共享原型继承的优点

简单

### 共享原型继承的缺点

* 只能继承父类原型属性方法，不能继承构造函数属性方法
* 与原型链继承一样，存在引用类型问题

## 原型式继承

这种继承方式普遍用于基于当前已有对象创建新对象。

在 ES5 之前实现方法：

```javascript
function createAnother(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

var o1 = {
  name: '父对象',
  say: function() {}
}

var o2 = createAnother(o1);
console.log(o2.name); // "父对象"
```

ES5 新增了 `Object.create()` 方法规范化了原型式继承。调用方法为：`Object.create(o)`，如下代码所示：

```javascript
// 用法一：创建一个纯洁的对象：对象什么属性都没有
Object.create(null);

// 用法二：创建一个子对象，它继承自某个父对象
var o1 = {
  name: '父对象',
  say: function() {}
}
var o2 = Object.create(o1);
```

## 寄生式继承

寄生式继承是原型式继承的加强版，它结合原型式继承和工厂模式，创建一个仅用于封装继承过程的函数，该函数在内部以某种方式来增强对象，最后返回对象。

```javascript
function createAnother(origin) {
  var clone = Object.create(origin); // 通过调用函数创建一个新对象
  clone.sayHi = function() { // 以某种方式来增强这个对象
    alert("Hi");
  };
  return clone; // 返回这个对象
}

var o1 = {
  name: "父对象",
  hobbies: ["sing", "dance", "rap"]
};
var o2 = createAnother(o1);
o2.sayHi();
```

在上述例子中，createAnother 函数接收了一个参数，也就是将要被继承的对象。

o2 是基于 o1 创建的一个新对象，新对象不仅具有 o1 的所有属性和方法，还有自己的 sayHi() 方法。

简单而言，寄生式继承在产生了这个继承父类的对象之后，为这个对象添加了一些增强方法。

### 寄生式继承的优点

没啥优点

### 寄生式继承的缺点

原型式继承有的缺点它都有，只是外面装个壳，就演化成了另一种继承模式。

## 寄生组合式继承

顾名思义，寄生式 + 组合式。它是寄生式继承的加强版。这也是为了避免组合继承中无可避免地要调用两次父类构造函数的最佳方案。

**开发人员普遍认为寄生组合式继承是引用类型最理想的继承范式**。

基本写法：

```javascript
function inheritPrototype(SubType, SuperType) {
  var prototype = Object.create(SuperType.prototype);
  prototype.constructor = SubType;
  SubType.prototype = prototype;
}
```

兼容写法：

```javascript
function object(o) {
  function W() {
  }
  W.prototype = o;
  return new W;
}
function inheritPrototype(SubType, SuperType) {
  var prototype;
  if (typeof Object.create === 'function') {
    prototype = Object.create(SuperType.prototype);
  } else {
    prototype = object(SuperType.prototype);
  }         
  prototype.constructor = SubType;
  SubType.prototype = prototype;
}
```

本质是子类的原型继承自父类的原型，申明一个用于继承原型的 inheritPrototype 方法，通过这个方法我们能够将子类的原型指向超类的原型，从而避免超类二次实例化。

实例代码：

```javascript
function Parent(name) {
  this.name = name;
  this.hobbies = ["sing", "dance", "rap"];
}
Parent.prototype.getHobbies = function(){
  return this.hobbies
}
function Child(name) {
  Parent.call(this, name);
  this.age = 24
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 测试结果
var c1 = new Child('c1');
var c2 = new Child('c2');

console.log(c1 instanceof Child); // true
console.log(c1 instanceof Parent); // true
console.log(c1.constructor); // Child
console.log(Child.prototype.__proto__ === Parent.prototype); // true
console.log(Parent.prototype.__proto__ === Object.prototype); // true

c1.hobbies.push('coding');
console.log(c1.getHobbies()); // ["sing", "dance", "rap", "coding"]
console.log(c2.getHobbies()); // ["sing", "dance", "rap"]
```

这也是目前最完美的继承方案，它与 ES6 的 class 的实现方式最为接近。

### 寄生组合式继承的优点

堪称完美

### 寄生组合式继承的缺点

代码多

## class 继承

ES6 中，通过 `class` 关键字来定义类，子类可以通过 `extends` 继承父类。

代码示例：

```javascript
class Parent{
  constructor(name) {
    this.name = name;
    this.hobbies = ["sing", "dance", "rap"];
  }
  getHobbies() {
    return this.hobbies;
  }
  static getCurrent() {
    console.log(this);
  }
}

class Child extends Parent {
  constructor(name) {
    super(name);
  }
}

var c1 = new Child('c1');
var c2 = new Child('c2');

console.log(c1 instanceof Child); // true
console.log(c1 instanceof Parent); // true
```

要点：

* `constructor` 为构造函数，即使未定义也会自动创建。
* 在父类构造函数内 `this` 定义的都是实例属性和方法，其他方法包括 `constructor`、`getHobbies` 都是原型方法。
* `static` 关键字定义的静态方法都必须通过类名调用，其 `this` 指向调用者而并非实例。
* 通过 `extends` 可以继承父类的所有原型属性及 `static` 类方法，子类 `constructor` 调用 `super` 父类构造函数实现实例属性和方法的继承。

对比：

* ES5 的继承，实质是先创造子类的实例对象 `this`，然后再将父类的方法添加到 `this` 上面（`Parent.apply(this)`）。
* ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到 `this` 上面（所以必须先调用 `super` 方法），然后再用子类的构造函数修改 `this`。

（完）
