# 函数类型

## 定义函数

在 JavaScript 中，有两种常见的定义函数的方式 —— 函数声明（Function Declaration）和函数表达式（Function Expression）：

```javascript
// 函数声明
function sum(x, y) {
  return x + y;
}

// 函数表达式
let mySum = function (x, y) {
  return x + y;
};
```

### 函数声明

在 TypeScript 中，函数声明的类型定义较简单：

```typescript
function sum(x: number, y: number): number {
  return x + y;
}
```

输入多余的（或者少于要求的）参数，是不被允许的：

```typescript
function sum(x: number, y: number): number {
  return x + y;
}
sum(1, 2, 3);

// error: Expected 2 arguments, but got 3.
```

```typescript
function sum(x: number, y: number): number {
  return x + y;
}
sum(1);

// error: Expected 2 arguments, but got 1.
// An argument for 'y' was not provided.
```

### 函数表达式

在 TypeScript 中，函数表达式的类型定义是这样的：

```typescript
let mySum = function (x: number, y: number): number {
  return x + y;
};
```

这是可以通过编译的，不过事实上，上面的代码只对等号右侧的匿名函数进行了类型定义，而等号左边的 `mySum`，是通过赋值操作进行类型推论而推断出来的。如果需要我们手动给 `mySum` 添加类型，则应该是这样：

```typescript
let mySum: (x: number, y: number) => number = function (x: number, y: number): number {
  return x + y;
};
```

注意不要混淆了 TypeScript 中的 `=>` 和 ES6 中的 `=>`：

* 在 TypeScript 的类型定义中，`=>` 用来表示函数的定义，左边是函数的参数类型，需要用括号括起来，右边是函数的返回值类型。
* 在 ES6 中，`=>` 叫做[箭头函数](https://es6.ruanyifeng.com/#docs/function#箭头函数)，是函数的具体实现。

## 返回值类型

### 没有返回值

使用 `void` 类型来表示函数没有返回值的类型，即函数没有显式 `return`，此时函数的返回值应该是 `undefined`：

```typescript
function fn1(): void {
}
```

### 可缺省和可推断的返回值类型

函数返回值的类型可以在 TypeScript 中被推断出来，即可缺省。

示例如下：

```typescript
function computeTypes(one: string, two: number) {
  const nums = [two];
  const strs = [one]
  return {
    nums,
    strs
  } // 返回 { nums: number[]; strs: string[] } 的类型 
}
```

一般情况下，TypeScript 中的函数返回值类型是可以缺省和推断出来的，但是有些特例需要我们显式声明返回值类型，比如 Generator 函数的返回值。

### Generator 函数的返回值

ES6 中新增的 Generator 函数在 TypeScript 中也有对应的类型定义。

Generator 函数返回的是一个 Iterator 迭代器对象，我们可以使用 Generator 的同名接口泛型或者 Iterator 的同名接口泛型表示返回值的类型（Generator 类型继承了 Iterator 类型），示例如下：

```typescript
type AnyType = boolean;
type AnyReturnType = string;
type AnyNextType = number;
function *gen(): Generator<AnyType, AnyReturnType, AnyNextType> {
  const nextValue = yield true; // nextValue 类型是 number，yield 后必须是 boolean 类型
  return `${nextValue}`; // 必须返回 string 类型
}
```

## 参数类型

### 可选参数

前面提到，输入多余的（或者少于要求的）参数，是不允许的。那么如何定义可选的参数呢？

通过在类型标注的 `:` 前添加 `?` 表示该参数是可缺省的：

```typescript
function log(x?: string) {
  return x;
}

log(); // => undefined
log('hello world'); // => hello world
```

需要注意的是，**可选参数必须接在必需参数后面。换句话说，可选参数后面不允许再出现必需参数了**。

### 默认参数

TypeScript 会根据函数的默认参数的类型来推断函数参数的类型，示例如下：

```typescript
function log(x = 'hello') {
  console.log(x);
}

log(); // => 'hello'
log('hi'); // => 'hi'
log(1); // ts(2345) Argument of type '1' is not assignable to parameter of type 'string | undefined'
```

上述示例中，根据函数的默认参数 `'hello'` ，TypeScript 会推断出 `x` 的类型为 `string | undefined`。

TypeScript 也可以显式声明默认参数的类型：

```typescript
function log(x: string = 'hello') {
  console.log(x);
}
```

对于默认参数，需要注意的是 TypeScript 会将添加了默认值的参数识别为可选参数，但此时就不受「可选参数必须接在必需参数后面」的限制了：

```typescript
function log(x: string = 'hello', y: string) {
  console.log(x + ' ' + y);
}

log('hello', 'world');
log(undefined, 'world');
```

### 剩余参数

ES6 中，可以使用 `...rest` 的方式获取函数中的剩余参数（rest 参数）：

```typescript
function push(array, ...items) {
  items.forEach(function(item) {
    array.push(item);
  });
}

let a: any[] = [];
push(a, 1, 2, 3);
```

事实上，`items` 是一个数组。所以我们可以用数组的类型来定义它：

```typescript
function push(array: any[], ...items: any[]) {
  items.forEach(function(item) {
    array.push(item);
  });
}

let a = [];
push(a, 1, 2, 3);
```

注意，rest 参数只能是最后一个参数，关于 rest 参数，可以参考 [ES6 中的 rest 参数](https://es6.ruanyifeng.com/#docs/function#rest参数)。


## this

在 JavaScript 中，函数 this 的指向一直是一个令人头痛的问题。因为 this 的值需要等到函数被调用时才能被确定，而且还能通过一些方法来可以改变 this 的指向。也就是说 this 的类型不固定，它取决于执行时的上下文。

但是，使用了 TypeScript 后，我们就不用担心这个问题了。通过指定 this 的类型（严格模式下，必须显式指定 this 的类型），当我们错误使用了 this，TypeScript 就会提示我们，如下代码所示：

```typescript
function say() {
  console.log(this.name); // ts(2683) 'this' implicitly has type 'any' because it does not have a type annotation
}
say();
```

在上述代码中，如果我们直接调用 say 函数，this 应该指向全局 window 或 global（Node 中）。但是，在 strict 模式下的 TypeScript 中，它会提示 this 的类型是 any，此时就需要我们手动显式指定类型了。

那么，在 TypeScript 中，我们应该如何声明 this 的类型呢？

在 TypeScript 中，我们只需要在函数的第一个参数中声明 this 指代的对象（即函数被调用的方式）即可，比如最简单的作为对象的方法的 this 指向，如下代码所示：

```typescript
function say(this: Window, name: string) {
  console.log(this.name);
}
window.say = say;
window.say('hi');
const obj = {
  say
};
obj.say('hi'); // ts(2684) The 'this' context of type '{ say: (this: Window, name: string) => void; }' is not assignable to method's 'this' of type 'Window'.
```

在上述代码中，我们在 window 对象上增加 say 的属性为函数 say。那么调用 `window.say()` 时，this 指向即为 window 对象。

调用 `obj.say()` 后，此时 TypeScript 检测到 this 的指向不是 window，于是抛出了一个 ts(2684) 错误。

需要注意的是，如果我们直接调用 `say()`，this 实际上应该指向全局变量 window，但是因为 TypeScript 无法确定 say 函数被谁调用，所以将 this 的指向默认为 void，也就提示了一个 ts(2684) 错误。

```typescript
say('captain'); // ts(2684) The 'this' context of type 'void' is not assignable to method's 'this' of type 'Window'
```

此时，我们可以通过调用 `window.say()` 来避免这个错误，这也是一个安全的设计。因为在 JavaScript 的严格模式下，全局作用域函数中 this 的指向是 undefined。

同样，定义对象的函数属性时，只要实际调用中 this 的指向与指定的 this 指向不同，TypeScript 就能发现 this 指向的错误，示例代码如下：

```typescript
interface Person {
  name: string;
  say(this: Person): void;
}
const person: Person = {
  name: 'captain',
  say() {
    console.log(this.name);
  },
};
const fn = person.say;
fn(); // ts(2684) The 'this' context of type 'void' is not assignable to method's 'this' of type 'Person'
```

**注意：显式注解函数中的 this 类型，它表面上占据了第一个形参的位置，但并不意味着函数真的多了一个参数，因为 TypeScript 转译为 JavaScript 后，「伪形参」this 会被抹掉，这算是 TypeScript 为数不多的特有语法。**

同样，我们也可以显式限定类（class）函数属性中的 this 类型，TypeScript 也能检查出错误的使用方式，如下代码所示：

```typescript
class Component {
  onClick(this: Component) {}
}
const component = new Component();
interface UI {
  addClickListener(onClick: (this: void) => void): void;
}
const ui: UI = {
  addClickListener() {}
};
ui.addClickListener(new Component().onClick); // ts(2345)
```

上面示例中，我们定义的 Component 类的 onClick 函数属性（方法）显式指定了 this 类型是 Component，在第 6 行作为入参传递给 ui 的 addClickListener 方法中，它指定的 this 类型是 void，两个 this 类型不匹配，所以抛出了一个 ts(2345) 错误。

此外，在链式调用风格的库中，使用 this 也可以很方便地表达出其类型，如下代码所示：

```typescript
class Container {
  private val: number;
  constructor(val: number) {
    this.val = val;
  }
  map(cb: (x: number) => number): this {
    this.val = cb(this.val);
    return this;
  }
  log(): this {
    console.log(this.val);
    return this;
  }
}
const instance = new Container(1)
  .map((x) => x + 1)
  .log() // => 2
  .map((x) => x * 3)
  .log(); // => 6  
```

因为 Container 类中 map、log 等函数属性（方法）未显式指定 this 类型，默认类型是 Container，所以以上方法在被调用时返回的类型也是 Container，this 指向一直是类的实例，它可以一直无限地被链式调用。

## 函数重载

JavaScript 是一门动态语言，针对同一个函数，它可以有多种不同类型的参数与返回值，这就是函数的多态。

而在 TypeScript 中，也可以相应地表达不同类型的参数和返回值的函数，如下代码所示：

```typescript
function convert(x: string | number | null): string | number | -1 {
  if (typeof x === 'string') {
    return Number(x);
  }
  if (typeof x === 'number') {
    return String(x);
  }
  return -1;
}
const x1 = convert('1');  // => string | number
const x2 = convert(1);    // => string | number
const x3 = convert(null); // => string | number
```

在上述代码中，我们把 `convert` 函数的 `string` 类型的值转换为 `number` 类型，`number` 类型转换为 `string` 类型，而将 `null` 类型转换为数字 `-1`。此时，`x1`、`x2`、`x3` 的返回值类型都会被推断成 `string | number`。

那么，有没有一种办法可以更精确地描述参数与返回值类型约束关系的函数类型呢？有，这就是函数重载（Function Overload），如下示例中 1~3 行定义了三种各不相同的函数类型列表，并描述了不同的参数类型对应不同的返回值类型，而从第 4 行开始才是函数的实现。

```typescript
function convert(x: string): number;
function convert(x: number): string;
function convert(x: null): -1;
function convert(x: string | number | null): any {
  if (typeof x === 'string') {
    return Number(x);
  }
  if (typeof x === 'number') {
    return String(x);
  }
  return -1;
}
const x1 = convert('1');  // => number
const x2 = convert(1);    // => string
const x3 = convert(null); // -1
```

> 注意：函数重载列表的各个成员（即示例中的 1 ~ 3 行）必须是函数实现（即示例中的第 4 行）的子集

在 convert 函数被调用时，TypeScript 会从上到下查找函数重载列表中与入参类型匹配的类型，并优先使用第一个匹配的重载定义。因此，我们需要把最精确的函数重载放到前面。例如我们在第 13 行传入了字符串 `'1'`，查找到第 1 行即匹配，而第 14 行传入了数字 `1`，则查找到第 2 行匹配。

## 类型谓词（is）

在 TypeScript 中，函数还支持另外一种特殊的类型描述，如下示例 ：

```typescript
function isString(s): s is string { // 类型谓词
  return typeof s === 'string';
}
function isNumber(n: number) {
  return typeof n === 'number';
}
function operator(x: unknown) {
  if(isString(x)) {  // ok x 类型缩小为 string
  }
  if (isNumber(x)) { // ts(2345) unknown 不能赋值给 number
  }
}
```

在上述代码中，在添加返回值类型的地方，我们通过「参数名 + is + 类型」的格式明确表明了参数的类型，进而引起类型缩小，所以类型谓词函数的一个重要的应用场景是实现自定义类型守卫。

（完）
