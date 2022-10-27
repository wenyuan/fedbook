# 函数与 class 类型

> 日常开发中，除了各种变量，函数和 class 也是必不可少的一部分。TypeScript 不光带来了函数与 class 的类型标注，还引入了其独有的概念比如重载与面向对象的编程等。

## 函数

> 函数部分，主要关注其参数类型、返回值类型以及重载的应用。 

### 函数的类型标注

如果说变量的类型是描述了这个变量的值类型，那么函数的类型就是描述了**函数入参类型与函数返回值类型**，它们同样使用 `:` 的语法进行类型标注。最简单的例子：

```typescript
// 函数声明
function foo(name: string): number {
  return name.length;
}
```

```typescript
// 函数表达式
const foo = function (name: string): number {
  return name.length
}
```

```typescript
// 箭头函数
const foo = (name: string): number => {
  return name.length
}
```

### void 类型

在 TypeScript 中，一个没有返回值（即没有调用 `return` 语句）的函数，其返回类型应当被标记为 `void` 而不是 `undefined`，即使它实际的值是 `undefined`：

```typescript
// 没有调用 return 语句
function foo(): void { }
```

因为 `void` 代表着空的、没有意义的类型值，就像 JavaScript 中的 `null` 一样。使用这个类型能更好地说明这个函数**没有进行返回操作**。

而如果调用了 `return` 语句，但没有返回值，那么使用 `undefined` 就是一个比较好的方式了：

```typescript
// 调用了 return 语句，但没有返回值
function bar(): undefined {
  return;
}
```

此时我们想表达的是，这个函数**进行了返回操作，但没有返回实际的值**。

### 可选参数与 rest 参数

* 在函数类型中使用 `?` 描述一个可选参数。
* 可选参数必须位于必选参数之后。

```typescript
// 在函数体里面给可选参数赋默认值
function foo1(name: string, age?: number): number {
  const inputAge = age || 18; // 或使用 age ?? 18
  return name.length + inputAge
}
```

也可以直接将可选参数与默认值合并，但此时就不能够使用 `?` 了，因为既然都有默认值，那肯定是可选参数了。

```typescript
// 直接为可选参数声明默认值
function foo2(name: string, age: number = 18): number {
  const inputAge = age;
  return name.length + inputAge
}
```

对于 rest 参数的类型标注也比较简单，由于它实际上是一个数组，所以应该使用数组类型或者元组类型进行标注：

```typescript
function foo1(arg1: string, ...rest: any[]) { }
foo1("张三", 13, true)

function foo2(arg1: string, ...rest: [number, boolean]) { }
foo2("张三", 13, true)
```

### 重载

在一些逻辑较复杂的情况下，函数可能有多组入参类型和返回值类型：

```typescript
function func(foo: number, bar?: boolean): string | number {
  if (bar) {
    return String(foo);
  } else {
    return foo * 599;
  }
}
```

在这个实例中，函数的返回类型基于其入参 `bar` 的值，如果是 `true` 返回值为 `string` 类型，否则为 `number` 类型。但是上面的类型标注写法，只知道它的返回值是这么个联合类型，并没有体现这么一个形如 if-else 的逻辑。

要想实现与入参关联的返回值类型，可以将上面的例子用重载改写：

```typescript
function func(foo: number, bar: true): string;
function func(foo: number, bar?: false): number;
function func(foo: number, bar?: boolean): string | number {
  if (bar) {
    return String(foo);
  } else {
    return foo * 599;
  }
}

const res1 = func(599);        // number
const res2 = func(599, true);  // string
const res3 = func(599, false); // number
```

这里的三个 `function func` 具有不同的意义：

* 第一个：传入 `bar` 的值为 `true` 时，函数返回值为 `string` 类型。
* 第二个：不传入 `bar`，或传入 `bar` 的值为 `false` 时，函数返回值为 `number` 类型。
* 第三个：函数的具体实现，会包含重载签名的所有可能情况。

基于重载签名，我们就实现了将入参类型和返回值类型的可能情况进行关联，获得了更精确的类型标注能力。

这里有一个需要注意的地方，拥有多个重载声明的函数在被调用时，是按照重载的声明顺序往下查找的。因此在第一个重载声明中，为了与逻辑中保持一致，即在 `bar` 为 `true` 时返回 `string` 类型，这里我们需要将第一个重载声明的 `bar` 声明为必选的字面量类型。

### 异步函数、Generator 函数等类型签名

对于异步函数、Generator 函数、异步 Generator 函数的类型签名，其参数签名基本一致，而返回值类型则稍微有些区别：

```typescript
async function asyncFunc(): Promise<void> {}

function* genFunc(): Iterable<void> {}

async function* asyncGenFunc(): AsyncIterable<void> {}
```

其中，Generator 函数与异步 Generator 函数现在已经基本不再使用，这里仅做了解即可。

而对于异步函数（即标记为 `async` 的函数），其返回值必定为一个 `Promise` 类型，而 Promise 内部包含的类型则通过泛型的形式书写，即 `Promise<T>`（泛型是个难啃的骨头，后面再单独学习）。

总的来说，TypeScript 中的函数实际上相比 JavaScript 也只是多在重载这一点上，所以主要关注函数的类型标注即可。但在 class 中，却引入了新的语法与面向对象的编程理念。

## class

> class 部分，除了类型以外，还要学习访问性修饰符、继承、抽象类等来自于面向对象理念的实际使用。

### 类与类成员的类型标注

在一个 class 中，属性的类型标注类似于变量，而构造函数、方法、存取器的类型编标注类似于函数：

```typescript
class Foo {
  prop: string;

  constructor(inputProp: string) {
    this.prop = inputProp;
  }

  print(addon: string): void {
    console.log(`${this.prop} and ${addon}`)
  }

  get propA(): string {
    return `${this.prop}+A`;
  }

  set propA(value: string) {
    this.prop = `${value}+A`
  }
}
```

唯一需要注意的是，**setter 方法不允许进行返回值的类型标注**，理由是 setter 的返回值并不会被消费，它是一个只关注过程的函数。

就像函数可以通过**函数声明**与**函数表达式**创建一样，类也可以通过**类声明**和**类表达式**的方式创建。很明显上面的写法即是类声明，而使用类表达式的语法则是这样的：

```typescript
const Foo = class {
  prop: string;

  constructor(inputProp: string) {
    this.prop = inputProp;
  }

  print(addon: string): void {
    console.log(`${this.prop} and ${addon}`)
  }
  
  // ...
}
```

### 修饰符

在 TypeScript 中我们能够为 Class 成员添加这些修饰符：`public` / `private` / `protected` / `readonly`。

这些修饰符用在成员命名前：

```typescript
class Foo {
  private prop: string;

  constructor(inputProp: string) {
    this.prop = inputProp;
  }

  protected print(addon: string): void {
    console.log(`${this.prop} and ${addon}`)
  }

  public get propA(): string {
    return `${this.prop}+A`;
  }

  public set propA(value: string) {
    this.propA = `${value}+A`
  }
}
```

它们的意义和后端编程语言一样：

* `public`：默认的修饰符，表示此类成员在**类、类的实例、子类**中都能被访问。
* `private`：此类成员仅能在**类的内部**被访问。
* `protected`：此类成员仅能在**类与子类**中被访问，类和类的实例是两种概念，即一旦实例化完毕，那就和类没关系了，即不允许再访问受保护的成员。

上面的例子也可以简写一下，即**在构造函数中对参数应用访问性修饰符**：

```typescript
class Foo {
  constructor(public arg1: string, private arg2: boolean) { }
}

new Foo("张三", true)
```

此时，参数会被直接作为类的成员（即实例的属性），免去后续的手动赋值。

### 静态成员

在 TypeScript 中，可以使用 `static` 关键字来标识一个成员为静态成员：

```typescript
class Foo {
  static staticHandler() { }

  public instanceHandler() { }
}
```

静态成员无法通过 `this` 来访问，需要通过 `Foo.staticHandler` 这种形式进行访问。

其原理是编译成 ES5 或更早的 JS 代码后，**静态成员直接被挂载在函数体上，而实例成员挂载在原型上**。因此**静态成员不会被实例继承，它始终只属于当前定义的这个类（以及其子类）**，而原型对象上的实例成员则会**沿着原型链进行传递**，也就是能够被继承。

至于静态成员的使用场合，一般是用于定义一些工具类里的方法或者一些公共类里的变量，这样就不用先实例化类了：

```typescript
class Utils {
  public static identifier = "张三";

  public static makeUHappy() {
    Utils.studyWithU();
    // ...
  }

  public static studyWithU() { }
}

Utils.makeUHappy();
```

### 继承、实现、抽象类

对于 class，与 JavaScript 一样，TypeScript 中也使用 `extends` 关键字来实现继承：

```typescript
class Base { }

class Derived extends Base { }
```

子类中可以访问到使用 `public` 或 `protected` 修饰符修饰的父类成员。除了访问以外，父类中的方法也可以在子类中被覆盖，但仍然可以通过 `super` 访问到父类中的方法：

```typescript
class Base {
  print() { }
}

class Derived extends Base {
  print() {
    super.print()
    // ...
  }
}
```

在子类中覆盖父类方法时，我们并不能确保父类中一定存在这个方法。所以，TypeScript 4.3 新增了 `override` 关键字：

```typescript
class Base {
  printWithLove() { }
}

class Derived extends Base {
  override print() {
    // ...
  }
}
```

尝试覆盖的方法并未在父类中声明，TS 将会给出错误提示。

还有一个比较重要的概念：**抽象类**。抽象类是对类结构与方法的抽象，简单来说，一个抽象类描述了一个类中应当有哪些成员（属性、方法等），一个抽象方法描述了这一方法在实际实现中的结构（入参类型与返回值类型）。

抽象类使用 `abstract` 关键字声明，同时抽象类中的成员也需要使用 `abstract` 关键字才能被视为抽象类成员：

```typescript
// 定义抽象类
abstract class AbsFoo {
  abstract absProp: string;
  abstract get absGetter(): string;
  abstract absMethod(name: string): string
}

// 实现抽象类
// 必须完全实现这个抽象类的每一个抽象成员
class Foo implements AbsFoo {
    absProp: string = "张三"

    get absGetter() {
        return "张三"
    }

    absMethod(name: string) {
        return name
    }
}
```

需要注意的是，在 TypeScript 中**无法声明静态的抽象成员**。

对于抽象类，它的本质就是描述类的结构。这点和 interface 一样，interface 不仅可以声明函数结构，也可以声明类的结构：

```typescript
interface FooStruct {
  absProp: string;
  get absGetter(): string;
  absMethod(input: string): string
}

class Foo implements FooStruct {
  absProp: string = "张三"

  get absGetter() {
    return "张三"
  }

  absMethod(name: string) {
    return name
  }
}
```

抽象类和接口的区别：

* 抽象类会存在于运行时，接口不会。
* 在描述类的结构上，抽象类更专业，可以使用抽象方法这样的方式来描述结构，或者也可以提供有具体实现的方法。而接口不行。

（完）
