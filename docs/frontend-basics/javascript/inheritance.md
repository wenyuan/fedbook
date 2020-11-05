# 继承

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

在 JavaScript 中，继承的方式有很多种，外界对此也没有准确的认定到底有多少种方式，褒贬不一，主流通常有 7 种方式：

* 原型链继承
* 借用构造函数继承
* 组合模式继承
* 共享原型继承
* 原型式继承
* 寄生式继承
* 寄生式组合继承
* （题外）ES6 中 class 的继承

## 1. 原型链继承

通过实例化一个新的函数，子类的原型指向了父类的实例，子类就可以调用其父类原型对象上的私有属性和公有方法。

代码示例：

```javascript
function Foo(){
  this.name = 'seven';
}
Foo.prototype.getName = function() { 
  return this.name
}

var foo = new Foo();
foo.getName() // 'seven'


function Parent() {
  this.name = '父类';
}
 
Parent.prototype.getName = function() {
  return this.name;
};

function Children() {
  this.subproperty = false;
}
 
SubType.prototype = new SuperType();

SubType.prototype.getSubValue = function() {
  return this.property
};

var instance = new SubType();
console.log(instance.getSuperValue()); // true

```



## 1. 原型继承

原型链是实现原型继承的主要方法，基本思想就是利用原型让一个引用类型继承另一个引用类型的属性和方法。

### 1.1 基本模式

```javascript
function SuperType() {
  this.property = true;
}
 
SuperType.prototype.getSuperValue = function() {
  return this.property;
};

function SubType() {
  this.subproperty = false;
}
 
SubType.prototype = new SuperType();

SubType.prototype.getSubValue = function() {
  return this.property
};

var instance = new SubType();
console.log(instance.getSuperValue()); // true
```

例子中的实例及构造函数和原型之间的关系图：

<div style="text-align: center; width: 650px;">
  <img src="./assets/prototypal-inheritance.png" alt="原型继承：实例-构造函数-原型的关系图">
  <p style="text-align: center; color: #888">（原型继承：实例-构造函数-原型的关系图）</p>
</div>

在例子代码中，定义了两个对象，SuperType 和 SubType。

> 两个对象之间实现了继承，而这种继承方式是通过创建 SuperType 的实例并将该实例赋给 SubType.prototype 实现的。实现的本质就是重写了原型对象。

这样 SubType.prototype 中就会存在一个指针指向 SuperType 的原型对象。也就是说，存在 SuperType 的实例中的属性和方法现在都存在于 SubType.prototype 中了。这样继承了之后，又可以为 SubType 添加新的方法和属性。

JavaScript 的对象中几乎都会有一个 `__proto__` 属性，指向它的父对象，可以实现让该对象访问到父对象中相关属性。

> PS：`[[prototype]]` 和 `__proto__` 意义相同，均表示对象的内部属性，其值指向对象原型。前者在一些书籍、规范中表示一个对象的原型属性，默认情况下是不可以再被外部访问的，估计是会被一些内部方法使用的，例如用 for...in 来遍历原型链上可以被枚举的属性的时候，就需要通过这个指针找到当前对象所继承的对象；后者则是在浏览器实现中支持的一个属性，用于指向对象原型。

### 1.2 需要注意的问题

#### 别忘记默认的类型

我们知道，所有的引用类型都继承了 Object，而这个继承也是通过原型链实现的。所以所有的对象都拥有 Object 具有的一些默认的方法。如：`hasOwnProperty()`、`propertyIsEnumerable()`、`toLocaleString()`、`toString()` 和 `valueOf()`。

#### 确定原型和实例的关系

可以通过两种方式来确定原型和实例之间的关系。

① 使用 `instanceof` 操作符，只要用这个操作符来测试实例与原型链中出现过的构造函数，结果就会返回 `true`。

② 第二种方式是使用 `isPrototypeOf()` 方法。同样，只要是原型链中出现过的原型，都可以说是该原型链所派生的实例的原型，因此 `isPrototypeOf()` 方法也会返回 `true`。

例：

::: details 代码示例
```javascript
alert(instance instanceof Object); //true
alert(instance instanceof SuperType); //true
alert(instance instanceof SubType); //true

alert(Object.prototype.isPrototypeOf(instance)); //true
alert(SuperType.prototype.isPrototypeOf(instance)); //true
alert(SubType.prototype.isPrototypeOf(instance)); //true
```
:::

#### 子类要在继承后定义新方法

因为，原型继承实质上是重写原型对象。所以，如果在继承前就在子类的 prototype 上定义了一些方法和属性，那么继承后，子类的这些属性和方法将会被覆盖。

#### 不能使用对象字面量创建原型方法

这个的原理跟上一条的实际上是一样的。当你使用对象字面量创建原型方法重写原型的时候，实质上相当于重写了原型链，所以原来的原型链就被切断了。

::: details 代码示例
```javascript {12-20}
function SuperType() {
  this.property = true;
}
SuperType.prototype.getSuperValue = function() {
  return this.property;
};
function SubType() {
  this.subproperty = false;
}
// 继承 SuperType
SubType.prototype = new SuperType();
// 使用对象字面量添加新方法，会导致上一行代码无效
SubType.prototype = {
  getSubValue: function() {
    return this.subproperty;
  },
  someOtherMethod: function() {
    return false;
  }
}

var instance = new SubType()
console.log(instance.getSuperValue)
// undefined
```
:::

#### 注意父类包含引用类型的情况

如下代码：

```javascript {10,11}
function SuperType() {
  this.colors = ["red", "blue", "green"];
  this.name = "wenyuan";
}
function SubType() {}
// 继承 SuperType
SubType.prototype = new SuperType();

var instance1 = new SubType();
instance1.colors.push("yellow");
instance1.name = "www.fedbook.cn";
console.log(instance1.colors);
console.log(instance1.name);

var instance2 = new SubType();
console.log(instance2.colors);
console.log(instance2.name);
```

最后输出结果：

::: details 查看结果
```javascript
["red", "blue", "green", "yellow"]
"www.fedbook.cn"
["red", "blue", "green", "yellow"]
"wenyuan"
```
:::

这个例子中的 `SuperType` 构造函数定义了一个 `colors` 属性，该属性包含一个数组（引用类型值）。`SuperType` 的每个实例都会有各自包含自己数组的 `colors` 属性。当 `SubType` 通过原型链继承了 `SuperType` 之后，`SubType.prototype` 就变成了 `SuperType` 的一个实例，因此它也拥有了一个它自己的 `colors` 属性 —— 就跟专门创建了一个 `SubType.prototype.colors` 属性一样。但结果是什么呢？结果是 `SubType` 的所有实例都会共享这一个 `colors` 属性。而我们对 `instance1.colors` 的修改能够通过 `instance2.colors` 反映出来。也就是说，这样的修改会影响各个实例。

### 1.3 原型继承的缺点

* 最明显的就是上面提到的，有引用类型的时候，各个实例对该引用的操作会影响其他实例。
* 没有办法在不影响所有对象实例的情况下，给超类型的构造函数传递参数。

鉴于这些缺点，实践中很少会单独使用原型继承。

## 2. 借用构造函数继承

在解决原型继承中包含引用类型值所带来问题的过程中，开发人员开始使用一种叫做借用构造函数（constructor stealing）的技术（有时候也叫做伪造对象或经典继承）。

这种技术的基本思想相当简单，即在子类型构造函数的内部调用超类型构造函数。

### 2.1 基本模式

```javascript {6}
function SuperType() {
  this.colors = ["red", "blue", "green"];
}
function SubType(){
  // 继承了 SuperType
  SuperType.call(this);
}

var instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); // ["red", "blue", "green", "black"]
var instance2 = new SubType();
console.log(instance2.colors); // ["red", "blue", "green"]
```

### 2.2 基本思想

借用构造函数的基本思想就是利用 `call` 或者 `apply` 把父类中通过 `this` 指定的属性和方法复制（借用）到子类创建的实例中。因为 `this` 对象是在运行时基于函数的执行环境绑定的。也就是说，在全局中，`this` 等于 `window`，而当函数被作为某个对象的方法调用时，`this` 等于那个对象。`call` 、`apply` 方法可以用来代替另一个对象调用一个方法。`call`、`apply` 方法可将一个函数的对象上下文从初始的上下文改变为由 thisObj 指定的新对象。 

所以，这个借用构造函数就是，`new` 对象的时候（注意，`new` 操作符与直接调用是不同的，以函数的方式直接调用的时候，`this` 指向 `window`，`new` 创建的时候，`this` 指向创建的这个实例），创建了一个新的实例对象，并且执行 `SubType` 里面的代码，而 `SubType` 里面用 `call` 调用了 `SuperType`，也就是说把 `this` 指向改成了指向新的实例，所以就会把 `SuperType` 里面的 `this` 相关属性和方法赋值到新的实例上，而不是赋值到 `SupType` 上面。所有实例中就拥有了父类定义的这些 `this` 的属性和方法。

### 2.3 优势

相对于原型链而言，借用构造函数有一个很大的优势，即可以在子类型构造函数中向超类型构造函数传递参数。因为属性是绑定到 `this` 上面的，所以调用的时候才赋到相应的实例中，各个实例的值就不会互相影响了。

例如：

```javascript
function SuperType(name) {
  this.name = name;
}
function SubType() {
    // 继承了SuperType，同时还传递了参数
    SuperType.call(this, "wenyuan");
    // 实例属性
    this.age = 29;
}
var instance = new SubType();
alert(instance.name);  // "wenyuan"
alert(instance.age);  // 29
```

### 2.4 劣势

如果仅仅是借用构造函数，那么也将无法避免构造函数模式存在的问题 —— 方法都在构造函数中定义，因此函数复用就无从谈起了。而且，在超类型的原型中定义的方法，对子类型而言也是不可见的，结果所有类型都只能使用构造函数模式。

考虑到这些问题，借用构造函数的技术也是很少单独使用的。

## 3. 组合继承

组合继承（combination inheritance），有时候也叫做伪经典继承。是将原型链和借用构造函数的技术组合到一块，从而发挥二者之长的一种继承模式。

### 3.1 基本思想

思路是使用原型链实现对原型属性和方法的继承，而通过借用构造函数来实现对实例属性的继承。这样，既通过在原型上定义方法实现了函数复用，又能够保证每个实例都有它自己的属性。

### 3.2 基本模型

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function() {
   console.log(this.name);
};
function SubType(name, age) {
  // 继承属性
  SuperType.call(this, name);
  this.age = age;
}
// 继承方法
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function() {
  console.log(this.age);
}

var instance1 = new SubType("wenyuan", 5);
instance1.colors.push("black");
console.log(instance1.colors); // ["red", "blue", "green", "black"]
instance1.sayName(); // "wenyuan"
instance1.sayAge(); // 5

var instance2 = new SubType("www.fedbook.cn", 3);
console.log(instance2.colors); // ["red", "blue", "green"]
instance2.sayName(); // "www.fedbook.cn"
instance2.sayAge(); // 3
```

### 3.3 优势

组合继承避免了原型链和借用构造函数的缺陷，融合了它们的优点，成为 JavaScript 中最常用的继承模式。

### 3.4 劣势

组合继承最大的问题就是无论什么情况下，都会调用两次超类型构造函数：一次是在创建子类型原型的时候，另一次是在子类型构造函数内部。虽然子类型最终会包含超类型对象的全部实例属性，但我们不得不在调用子类型构造函数时重写这些属性。

## 4. 寄生类继承

### 4.1 原型式继承

其原理就是借助原型，可以基于已有的对象创建新对象。节省了创建自定义类型这一步（虽然觉得这样没什么意义）。

#### 基本模型

```javascript
function object(o) {
  function W(){
  }
  W.prototype = o;
  return new W();
}
```

ES5 新增了 `Object.create()` 方法规范化了原型式继承。即调用方法为：`Object.create(o)`

#### 适用场景

```javascript
// 需要创建一个纯洁的对象：对象什么属性都没有
Object.create(null);

// 创建一个子对象，它继承自某个父对象
var o1 = { say:function(){} };
var o2 = Object.create(o1);
```

### 4.2 寄生式继承

寄生式继承是原型式继承的加强版。

#### 基本模型

```javascript
function createAnother(origin) {
  var clone = object(origin);
  clone.say = function() {
    alert('hi');
  };
  return clone;
}
```

即在产生了这个继承了父类的对象之后，为这个对象添加一些增强方法。

### 4.3 寄生组合式继承

实质上，寄生组合继承是寄生式继承的加强版。这也是为了避免组合继承中无可避免地要调用两次父类构造函数的最佳方案。

所以，开发人员普遍认为寄生组合式继承是引用类型最理想的继承范式。

#### 基本模式

```javascript
function inheritPrototype(SubType,SuperType) {
  var prototype = object(SuperType.prototype);
  prototype.constructor = SubType;
  SubType.prototype = prototype;
}
```

这个 object 是自定义的一个相当于 ES5 中 `Object.create()` 方法的函数。在兼容性方面可以两个都写。

#### 兼容写法

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

## 5. Class 继承

Class 可以通过 `extends` 关键字实现继承。子类必须在 `constructor` 方法中调用 `super` 方法，否则新建实例时会报错。这是因为子类自己的 `this` 对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法。如果不调用 `super` 方法，子类就得不到 `this` 对象。

注意 ：
* ES5 的继承，实质是先创造子类的实例对象 `this`，然后再将父类的方法添加到 `this` 上面（`Parent.apply(this)`）。
* ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到 `this` 上面（所以必须先调用 `super` 方法），然后再用子类的构造函数修改 `this`。

### 5.1 基本模式

```javascript
class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // 调用父类的 constructor(x, y)
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString(); // 调用父类的 toString()
  }
}
```

### 5.2 Class 的继承链

大多数浏览器的 ES5 实现之中，每一个对象都有 `__proto__` 属性，指向对应的构造函数的 `prototype` 属性。Class 作为构造函数的语法糖，同时有 `prototype` 属性和 `__proto__` 属性，因此同时存在两条继承链。

* 子类的 `__proto__` 属性，表示构造函数的继承，总是指向父类。
* 子类 `prototype` 属性的 `__proto__` 属性，表示方法的继承，总是指向父类的 `prototype` 属性。

```javascript
class A {
}

class B extends A {
}

B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true
```

上面代码中，子类 B 的 `__proto__` 属性指向父类 A，子类 B 的 `prototype` 属性的 `__proto__` 属性指向父类 A 的 `prototype` 属性。
