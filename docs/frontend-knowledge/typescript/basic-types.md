# 基础类型

在 TypeScript 语法中，类型的标注主要通过类型后置语法来实现，即用 `:` 作为分割变量和类型的分隔符。而缺省类型注解的 TypeScript 与 JavaScript 完全一致，因此可以把 TypeScript 代码的编写看作是为 JavaScript 代码添加类型注解。

## 简单基础类型

### 数值（Number）

使用 `number` 类型表示 JavaScript 已经支持或者即将支持的十进制整数、浮点数，以及二进制数、八进制数、十六进制数：

```typescript
let a: number = 123;        // 十进制整数

let b: number = Number(42); // 十进制整数

let c: number = 3.14;       // 十进制浮点数

let d: number = 0b1010101;  // 二进制

let e: number = 0o75;       // 八进制

let f: number = 0xA12;      // 十六进制

let g: number = NaN;        // 非数字

let h: number = Infinity;   // 正无穷大的数值
```

如果需要大整数，那么可以使用 `bigint` 类型来表示：

```typescript
let big: bigint = 100n;
```

注意：虽然 `number` 和 `bigint` 都表示数字，但是这两个类型不兼容，如果混用会抛出一个类型不兼容的 ts(2322) 错误。

### 字符串（String）

使用 `string` 表示 JavaScript 中任意的字符串（包括模板字符串）：

```typescript
let firstname: string = 'Captain';    // 字符串字面量

let familyname: string = String('S'); // 显式类型转换

let fullname: string = `my name is ${firstname}.${familyname}`; // 模板字符串
```

### 布尔（Boolean）

使用 `boolean` 表示 True 或者 False：

```typescript
const flag1: boolean = true;

const flag2: boolean = false;
```

### Symbol

ES6 开始，TypeScript 也支持了新的 `Symbol` 原始类型，即我们可以通过 `Symbol` 构造函数，创建一个独一无二的标记。同时还可以使用 `symbol` 表示这个变量的类型：

```typescript
let sym1: symbol = Symbol();

let sym2: symbol = Symbol('42');
```

## 复杂基础类型

### 数组（Array）

在 TypeScript 中，array 一般指**所有元素类型相同**的值的集合。

可以直接使用 `[]` 的形式定义数组类型：

```typescript
let arrayOfNumber: number[] = [1, 2, 3];       // 子元素是数字类型的数组

let arrayOfString: string[] = ['x', 'y', 'z']; // 子元素是字符串类型的数组
```

也可以使用 Array 泛型定义数组类型：

```typescript
let arrayOfNumber: Array<number> = [1, 2, 3];       // 子元素是数字类型的数组

let arrayOfString: Array<string> = ['x', 'y', 'z']; // 子元素是字符串类型的数组
```

以上两种方式，更推荐使用 `[]` 这种形式来定义。**一方面可以避免与 JSX 的语法冲突，另一方面可以减少不少代码量**。

### 元祖（Tuple）

TypeScript 的数组和元组转译为 JavaScript 后都是数组，但元组最重要的特性是**数量固定，类型可以各异**。

在写法上，元祖类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同：

```typescript
const arr1: [number, string] = [100, 'hello'];
```

在 JavaScript 中并没有元组的概念，作为一门动态类型语言，它的优势是**天然支持多类型元素数组**。

## 特殊基础类型

### any

any 指的是一个任意类型，它是官方提供的一个选择性绕过静态类型检测的作弊方式。

我们可以对被注解为 `any` 类型的变量进行任何操作，包括获取事实上并不存在的属性、方法，并且 TypeScript 还无法检测其属性是否存在、类型是否正确。

比如可以把任何类型的值赋值给 any 类型的变量，也可以把 any 类型的值赋值给任意类型（除 never 以外）的变量：

```typescript
let val: any = {};

val.doAnything(); // 不会提示错误

val = 1;          // 不会提示错误

val = 'x';        // 不会提示错误

let num: number = val; // 不会提示错误

let str: string = val; // 不会提示错误
```

如果我们不想花费过高的成本为复杂的数据添加类型注解，或者已经引入了缺少类型注解的第三方组件库，这时就可以把这些值全部注解为 any 类型，并告诉 TypeScript 选择性地忽略静态类型检测。

尤其是在将一个基于 JavaScript 的应用改造成 TypeScript 的过程中，我们不得不借助 any 来选择性添加和忽略对某些 JavaScript 模块的静态类型检测，直至逐步替换掉所有的 JavaScript。

any 类型会在对象的调用链中进行传导，即所有 any 类型的任意属性的类型都是 any：

```typescript
let anything: any = {};

let z = anything.x.y.z; // z 类型是 any，不会提示错误

z(); // 不会提示错误
```

但是从长远来看，使用 any 绝对是一个坏习惯。如果一个 TypeScript 应用中充满了 any，此时静态类型检测基本起不到任何作用，也就是说与直接使用 JavaScript 没有任何区别。**因此，除非有充足的理由，否则我们应该尽量避免使用 any ，并且开启禁用隐式 any 的设置**。

### unknown

unknown 是 TypeScript 3.0 中添加的一个类型，它主要用来描述类型并不确定的变量。

比如在多个 if else 条件分支场景下，它可以用来接收不同条件下类型各异的返回值的临时变量：

```typescript
let result: unknown;
if (x) {
  result = x();
} else if (y) {
  result = y();
} ...
```

与 any 不同的是，unknown 在类型上更安全。比如我们可以将任意类型的值赋值给 unknown，但 unknown 类型的值只能赋值给 unknown 或 any，否则会抛出一个 ts(2322) 错误：

```typescript
let result: unknown;
let num: number = result;   // 提示 ts(2322)
let anything: any = result; // 不会提示错误
```

使用 unknown 后，TypeScript 会对它做类型检测。但是，如果不缩小类型（Type Narrowing），我们对 unknown 执行的任何操作都会出现如下所示错误：

```typescript
let result: unknown;
result.toFixed(); // 提示 ts(2571)
```

**而所有的类型缩小手段对 unknown 都有效**，例如：

```typescript
let result: unknown;
if (typeof result === 'number') {
  result.toFixed(); // 此处 hover result 提示类型是 number，不会提示错误
}
```

### 空值（void）

void 类型在某种程度上来说像是与 any 类型相反，它表示没有任何类型。仅适用于表示没有返回值的函数。即如果该函数没有返回值，那它的类型就是 void。

声明一个 void 类型的变量几乎没有任何实际用处，因为我们不能把 void 类型的变量值再赋值给除了 any 和 unknown 之外的任何类型变量，且它只能被赋值为 `undefined`。

```typescript
function foo():void {
  console.log('hello word');
}

const result: void = undefined;
```

### undefined 和 null

这两个是 TypeScript 值与类型关键字同名的唯二例外：

```typescript
let undeclared: undefined = undefined; // undefined 类型只能赋值为 undefined
let nullable: null = null;             // null 类型只能赋值为 null
```

单纯声明 undefined 或者 null 类型的变量是比较鸡肋的。

undefined 的最大价值主要体现在接口类型（后面会单独整理这个知识点）上，它表示一个可缺省、未定义的属性。

在 TS 中有个比较费解的设计：**我们可以把 undefined 值或类型是 undefined 的变量赋值给 void 类型变量，反过来，类型是 void 但值是 undefined 的变量不能赋值给 undefined 类型**。

```typescript
const userInfo: {
  id?: number;
} = {};
let undeclared: undefined = undefined;
let unusable: void = undefined;
unusable = undeclared; // ok
undeclared = unusable; // ts(2322)
```

而 null 的价值主要体现在接口制定上，它表明对象或属性可能是空值。尤其是在前后端交互的接口，比如 Java Restful、Graphql，任何涉及查询的属性、对象都可能是 null 空对象，如下代码所示：

```typescript
const userInfo: {
  name: null | string
} = { name: null };
```

除此之外，undefined 和 null 类型还具备警示意义，它们可以提醒我们针对可能操作这两种（类型）值的情况做容错处理。

我们需要类型守卫（后面会单独整理这个知识点）在操作之前判断值的类型是否支持当前的操作。类型守卫既能通过类型缩小影响 TypeScript 的类型检测，也能保障 JavaScript 运行时的安全性，如下代码所示：

```typescript
const userInfo: {
  id?: number;
  name?: null | string
} = { id: 1, name: 'Captain' };
if (userInfo.id !== undefined) { // Type Guard
  userInfo.id.toFixed(); // id 的类型缩小成 number
}
```

不建议随意使用非空断言（参见类型断言中的内容）来排除值可能为 null 或 undefined 的情况，因为这样很不安全。

```typescript
userInfo.id!.toFixed(); // ok，但不建议
userInfo.name!.toLowerCase() // ok，但不建议
```

比非空断言更安全、类型守卫更方便的做法是使用单问号（Optional Chain）、双问号（空值合并），我们可以使用它们来保障代码的安全性，如下代码所示：

```typescript
userInfo.id?.toFixed(); // Optional Chain
const myName = userInfo.name?? `my name is ${info.name}`; // 空值合并
```

### never

never 类型表示的是那些永不存在的值的类型。例如，never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型。变量也可能是 never 类型，当他们被用不为真的类型保护所约束时。

例如，定义一个统一抛出错误的函数，代码示例如下（圆括号后 `:` + 类型注解，表示函数返回值的类型）：

```typescript
function ThrowError(msg: string): never {
  throw Error(msg);
}
```

以上函数因为永远不会有返回值，所以它的返回值类型就是 `never`。

同样，如果函数代码中是一个死循环，那么这个函数的返回值类型也是 never，如下代码所示：

```typescript
function InfiniteLoop(): never {
  while (true) {}
}
```

never 是所有类型的子类型，它可以给所有类型赋值，如下代码所示：

```typescript
let Unreachable: never = 1;      // ts(2322)
Unreachable = 'string';          // ts(2322)
Unreachable = true;              // ts(2322)
let num: number = Unreachable;   // ok
let str: string = Unreachable;   // ok
let bool: boolean = Unreachable; // ok
```

但是反过来，除了 never 自身以外，其他类型（包括 any 在内的类型）都不能为 never 类型赋值。

在恒为 false 的类型守卫条件判断下，变量的类型将缩小为 never（never 是所有其他类型的子类型，所以是类型缩小为 never，而不是变成 never）。因此，条件判断中的相关操作始终会报无法更正的错误（我们可以把这理解为一种基于静态类型检测的 Dead Code 检测机制），如下代码所示：

```typescript
const str: string = 'string';
if (typeof str === 'number') {
  str.toLowerCase(); // Property 'toLowerCase' does not exist on type 'never'.ts(2339)
}
```

基于 never 的特性，我们还可以使用 never 实现一些有意思的功能。比如我们可以把 never 作为接口类型下的属性类型，用来禁止写接口下特定的属性，示例代码如下：

```typescript
const props: {
  id: number,
  name?: never
} = {
  id: 1
}
props.name = null;  // ts(2322))
props.name = 'str'; // ts(2322)
props.name = 1;     // ts(2322)
```

此时，无论我们给 `props.name` 赋什么类型的值，它都会提示类型错误，实际效果等同于 `name` 只读。

### object

object 类型表示非原始类型的类型，即非 number、string、boolean、bigint、symbol、null、undefined 的类型。然而，它也是个没有什么用武之地的类型，如下所示的一个应用场景是用来表示 `Object.create` 的类型。

```typescript
declare function create(o: object | null): any;
create({});         // ok
create(() => null); // ok
create(2);          // ts(2345)
create('string');   // ts(2345)
```

## 类型断言（Type Assertion）

### 是什么

类型断言，用于告诉 TypeScript 某个值你非常确定是你断言的类型，而不是 TS 推测出来的类型。

例如下面的场景：

```typescript
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = arrayNumber.find(num => num > 2); // 提示 ts(2322)
```

其中，greaterThan2 一定是一个数字（确切地讲是 3），因为 arrayNumber 中明显有大于 2 的元素，但静态类型对运行时的逻辑无能为力。

在 TypeScript 看来，greaterThan2 的类型既可能是数字，也可能是 undefined，所以上面的示例中提示了一个 ts(2322) 错误，此时我们不能把类型 undefined 分配给类型 number。

不过，我们可以使用一种笃定的方式 —— **类型断言**（类似仅作用在类型层面的强制类型转换）告诉 TypeScript 按照我们的方式做类型检查。

比如，我们可以使用 as 语法做类型断言，如下代码所示：

```typescript
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = arrayNumber.find(num => num > 2) as number;
```

又或者是使用尖括号 + 类型的格式做类型断言，如下代码所示：

```typescript
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = <number>arrayNumber.find(num => num > 2);
```

以上两种方式虽然没有任何区别，但是尖括号格式会与 JSX 产生语法冲突，因此更推荐使用 as 语法。

### 需要满足约束关系

类型断言的操作对象必须满足某些约束关系，否则我们将得到一个 ts(2352) 错误，即从类型「源类型」到类型「目标类型」的转换是错误的，因为这两种类型不能充分重叠。

通俗的说，这种约束关系就是我们不能「指鹿为马」。但可以「指白马为马」或「指马为白马」，这可以很贴切地体现类型断言的约束条件：父子、子父类型之间可以使用类型断言进行转换。

::: warning
这个结论完全适用于复杂类型。同时对于 number、string、boolean 原始类型来说，不仅父子类型可以相互断言，父类型相同的类型也可以相互断言，比如 `1 as 2`、`'a' as 'b'`、`true as false`，只不过这样的断言没有任何意义。
:::

另外，any 和 unknown 这两个特殊类型属于万金油，因为它们既可以被断言成任何类型，反过来任何类型也都可以被断言成 any 或 unknown。

除了可以把特定类型断言成符合约束添加的其他类型之外，还可以使用「字面量值 + as const」语法结构进行常量断言，如下所示：

```typescript
let str = 'str' as const; // str 类型是 '"str"'

const readOnlyArr = [0, 1] as const; // readOnlyArr 类型是 'readonly [0, 1]'
```

### 非空断言

还有一种非空断言，即在值（变量、属性）的后边添加 `!` 断言操作符，它可以用来排除值为 null、undefined 的情况：

```typescript
let mayNullOrUndefinedOrString: null | undefined | string;
mayNullOrUndefinedOrString!.toString(); // ok
mayNullOrUndefinedOrString.toString(); // ts(2531)
```

但应该尽量少用，因为无法保证之前一定非空的值，且这种错误只会在运行环境中抛出，静态类型检测是发现不了的。非空断言的替代方案是类型守卫（后面会讲）：

```typescript
let mayNullOrUndefinedOrString: null | undefined | string;
if (typeof mayNullOrUndefinedOrString === 'string') {
  mayNullOrUndefinedOrString.toString(); // ok
}
```

### 应用场景

比如在获取一个 DOM 元素时，推断出来的类型是 `xxElement | null`，但是你非常笃定元素一定存在，这个时候就可以使用类型断言，`as xxElement`。

（完）
