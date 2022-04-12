# 类类型

ES6 引入 `class` 关键字后，TypeScript 作为 JavaScript 的超集，也支持了 class 的全部特性，并且还可以对类的属性、方法等进行静态类型检测。

## 类

如果使用传统的 JavaScript 代码定义类，我们需要使用函数+原型链的形式进行模拟，如下代码所示：

```typescript
function Dog(name: string) {
  this.name = name; // ts(2683) 'this' implicitly has type 'any' because it does not have a type annotation.
}
Dog.prototype.bark = function () {
  console.log('Woof! Woof!');
};

const dog = new Dog('Q'); // ts(7009) 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
dog.bark(); // => 'Woof! Woof!'
```

在第 1～ 3 行，我们定义了 `Dog` 类的构造函数，并在构造函数内部定义了 `name` 属性，再在第 4 行通过 `Dog` 的原型链添加 `bark` 方法。

如果使用 `class` 方式定义类，会很方便：

```typescript
class Dog {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  bark() {
    console.log('Woof! Woof!');
  }
}

const dog = new Dog('Q');
dog.bark(); // => 'Woof! Woof!'
```

## 继承

### extend 关键字

在 TypeScript 中，使用 `extends` 关键字就能很方便地定义类继承的抽象模式，如下代码所示：

```typescript
class Animal {
  type = 'Animal';
  say(name: string) {
    console.log(`I'm ${name}!`);
  }
}

class Dog extends Animal {
  bark() {
    console.log('Woof! Woof!');
  }
}

const dog = new Dog();
dog.bark();   // => 'Woof! Woof!'
dog.say('Q'); // => I'm Q!
dog.type;     // => Animal
```

### super() 方法

TypeScript 规定，如果子类包含一个构造函数，则必须在构造函数中调用 `super()` 方法，否则会抛出  ts(2377) 的错误。

```typescript {11}
class Animal {
  type = 'Animal';
  say(name: string) {
    console.log(`I'm ${name}!`);
  }
}

class Dog extends Animal {
  name: string;
  constructor(name: string) {
    super(); // 添加 super 方法
    this.name = name;
  }

  bark() {
    console.log('Woof! Woof!');
  }
}
```

super 函数实际上就是调用父类的构造函数，因此如果父类的构造函数要求必须传入参数，那么子类构造函数的 `super()` 方法也必须传入对应个数和类型的参数，否则也会抛出错误提示：

```typescript {4,15}
class Animal {
  weight: number;
  type = 'Animal';
  constructor(weight: number) {
    this.weight = weight;
  }
  say(name: string) {
    console.log(`I'm ${name}!`);
  }
}

class Dog extends Animal {
  name: string;
  constructor(name: string) {
    super(20);
    this.name = name;
  }

  bark() {
    console.log('Woof! Woof!');
  }
}
```

## 公共、私有与受保护的修饰符

类属性和方法除了可以通过 `extends` 被继承之外，还可以通过修饰符控制可访问性。

在 TypeScript 中就支持 3 种访问修饰符，分别是 `public`、`private`、`protected`。

* public 修饰的是在任何地方可见、公有的属性或方法。
* private 修饰的是仅在同一类中可见、私有的属性或方法。
* protected 修饰的是仅在类自身及子类中可见、受保护的属性或方法。

### private 修饰符

如果类的属性和方法没有添加访问修饰符，默认都是 `public`。如果想让有些属性对外不可见，那么可以使用 `private` 进行设置，如下所示：

```typescript
class Son {
  public firstName: string;
  private lastName: string = 'Stark';
  constructor(firstName: string) {
    this.firstName = firstName;
    this.lastName; // ok
  }
}

const son = new Son('Tony');
console.log(son.firstName); //  => "Tony"
son.firstName = 'Jack';
console.log(son.firstName); //  => "Jack"
console.log(son.lastName); // ts(2341) Property 'lastName' is private and only accessible within class 'Son'.
```

对于 `private` 修饰的私有属性，只可以在类的内部可见，即使是类的实例也不能访问。

::: warning
TypeScript 中定义类的私有属性仅仅代表静态类型检测层面的私有。如果我们强制忽略 TypeScript 类型的检查错误，转译且运行 JavaScript 时依旧可以获取到 lastName 属性，这是因为 JavaScript 并不支持真正意义上的私有属性。
:::

目前，JavaScript 类支持 `private` 修饰符的提案已经到 stage 3 了。或许在不久的将来，私有属性在类型检测和运行阶段都可以被限制为仅在类的内部可见 —— [proposal-private-methods](https://github.com/tc39/proposal-private-methods?fileGuid=KLALBzHdpAQfyj7n)

### protected 修饰符

`private` 是只有类自己内部可见，如果想让子类也可见，可以使用 `protected` 修饰符，如下所示：

```typescript
class Son {
  public firstName: string;
  protected lastName: string = 'Stark';
  constructor(firstName: string) {
    this.firstName = firstName;
    this.lastName; // ok
  }
}

class GrandSon extends Son {
  constructor(firstName: string) {
    super(firstName);
  }

  public getMyLastName() {
    return this.lastName;
  }
}

const grandSon = new GrandSon('Tony');
console.log(grandSon.getMyLastName()); // => "Stark"
grandSon.lastName; // ts(2445) Property 'lastName' is protected and only accessible within class 'Son' and its subclasses.
```

我们不能通过子类的实例直接访问父类中 `protected` 修饰的属性和方法，但是可以通过子类的实例方法进行访问。

## 只读修饰符

`public` 修饰的属性既公开可见，又可以更改值，如果我们不希望类的属性被更改，则可以使用 `readonly` 只读修饰符声明类的属性，如下代码所示：

```typescript
class Son {
  public readonly firstName: string;
  constructor(firstName: string) {
    this.firstName = firstName;
  }
}
const son = new Son('Tony');
son.firstName = 'Jack'; // ts(2540) Cannot assign to 'firstName' because it is a read-only property.
```

注意：如果只读修饰符和可见性修饰符同时出现，我们需要将只读修饰符写在可见修饰符后面。

## 存取器

除了上边提到的修饰符之外，在 TypeScript 中还可以通过 `getter`、`setter` 截取对类成员的读写访问。

通过对类属性访问的截取，我们可以实现一些特定的访问控制逻辑。如下代码所示：

```typescript {12-21}
class Son {
  public firstName: string;
  protected lastName: string = 'Stark';
  constructor(firstName: string) {
    this.firstName = firstName;
  }
}
class GrandSon extends Son {
  constructor(firstName: string) {
    super(firstName);
  }
  get myLastName() {
    return this.lastName;
  }
  set myLastName(name: string) {
    if (this.firstName === 'Tony') {
      this.lastName = name; // 只有 firstName 为 tony 时才能修改 lastName
    } else {
      console.error('Unable to change myLastName');
    }
  }
}
const grandSon = new GrandSon('Tony');
console.log(grandSon.myLastName); // => "Stark"
grandSon.myLastName = 'Rogers';
console.log(grandSon.myLastName); // => "Rogers"
const grandSon1 = new GrandSon('Tony1');
grandSon1.myLastName = 'Rogers';  // => "Unable to change myLastName"
```

我们可以像访问类属性一样访问 `getter`，同时也可以像更改属性值一样给 `setter` 赋值，并执行一些自定义逻辑（`.` 语法）。

## 静态属性

以上介绍的关于类的所有属性和方法，只有类在实例化时才会被初始化。实际上，我们也可以给类定义静态属性和方法。

因为这些属性存在于类这个特殊的对象上，而不是类的实例上，所以我们可以直接通过类访问静态属性，如下代码所示：

```typescript {2,3}
class MyArray {
  static displayName = 'MyArray';
  static isArray(obj: unknown) {
    return Object.prototype.toString.call(obj).slice(8, -1) === 'Array';
  }
}
console.log(MyArray.displayName); // => "MyArray"
console.log(MyArray.isArray([])); // => true
console.log(MyArray.isArray({})); // => false
```

在第 2～3 行，通过 `static` 修饰符，我们给 `MyArray` 类分别定义了一个静态属性 `displayName` 和静态方法 `isArray`。之后，我们无须实例化 `MyArray` 就可以直接访问类上的静态属性和方法了。

基于静态属性的特性，我们往往会把与类相关的常量、不依赖实例 `this` 上下文的属性和方法定义为静态属性，从而避免数据冗余，进而提升运行性能。

::: warning
上边我们提到了不依赖实例 `this` 上下文的方法就可以定义成静态方法，这就意味着需要显式注解 `this` 类型才可以在静态方法中使用 `this`；非静态方法则不需要显式注解 `this` 类型，因为 `this` 的指向默认是类的实例。
:::

## 抽象类

抽象类是一种不能被实例化仅能被子类继承的特殊类，它使用 `abstract` 关键字修饰。

可以使用抽象类定义派生类需要实现的属性和方法，同时也可以定义其他被继承的默认属性和方法，如下代码所示：

```typescript
abstract class Adder {
  abstract x: number;
  abstract y: number;
  abstract add(): number;
  displayName = 'Adder';
  addTwice(): number {
    return (this.x + this.y) * 2;
  }
}
class NumAdder extends Adder {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
  add(): number {
    return this.x + this.y;
  }
}

const numAdder = new NumAdder(1, 2);
console.log(numAdder.displayName); // => "Adder"
console.log(numAdder.add());       // => 3
console.log(numAdder.addTwice());  // => 6
```

抽象类本身使用 `abstract` 关键字修饰，而抽象类里面的抽象属性和抽象方法也使用 `abstract` 关键字修饰。一旦属性或方法被定义为抽象，它们就必须在子类中全部被实现，否则缺少任意一个都会抛出 ts(2515) 错误。

同时，在抽象类中也可以定义非抽象属性和非抽象方法，它们会被子类继承，并可以被子类的实例获取。

因为抽象类不能被实例化，并且子类必须实现继承自抽象类上的抽象属性和方法定义，所以抽象类的作用其实就是对基础逻辑的封装和抽象。

实际上，我们也可以定义一个描述对象结构的接口类型（后面会讲）抽象类的结构，并通过 `implements` 关键字约束类的实现。

使用接口与使用抽象类相比，区别在于接口只能定义类成员的类型，如下代码所示：

```typescript
interface IAdder {
  x: number;
  y: number;
  add: () => number;
}
class NumAdder implements IAdder {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  add() {
    return this.x + this.y;
  }
  addTwice() {
    return (this.x + this.y) * 2;
  }
}
```

上述代码中，子类中拥有接口约定的 `x`、`y` 属性和 `add` 方法，以及接口未约定的 `addTwice` 方法。

## 类的类型

类的类型和函数类似，即在声明类的时候，其实也同时声明了一个特殊的类型（确切地讲是一个接口类型），这个类型的名字就是类名，表示类实例的类型；在定义类的时候，我们声明的除构造函数外所有属性、方法的类型就是这个特殊类型的成员。如下代码所示：

```typescript
class A {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}
const a1: A = {}; // ts(2741) Property 'name' is missing in type '{}' but required in type 'A'.
const a2: A = { name: 'a2' }; // ok
```

上述代码中，定义类 `A` 的同时也相当于同时定义了一个包含字符串属性 `name` 的同名接口类型 `A`。因此，把一个空对象赋值给类型是 `A` 的变量 `a1` 时，就会因为缺少 `name` 属性而抛出一个 ts(2741) 的错误提示。

（完）
