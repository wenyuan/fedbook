# 内置类型和类型断言

> 之前的基础类型标注、字面量类型与枚举、函数与 Class 等概念，在 JavaScript 中或多或少会有相关联的成分。但本文开始涉及到的知识点就是 TypeScript 独有的了。

## any

TypeScript 中提供了一个内置类型 `any` 表示「任意类型」：

```typescript
// 显式 any
let anyVar: any;

// 隐式地推导 any
let foo;

// foo、bar 均为 any
function func(foo, bar){}
```

`any` 能兼容所有类型，也能够被所有类型兼容。但是滥用它的话就把 TypeScript 写成了大家调侃的 AnyScript 了。

为了避免这一情况，有以下使用小 tips：

* 如果是类型不兼容报错导致你使用 `any`，考虑用类型断言替代，文本后面会讲类型断言的作用。
* 如果是类型太复杂导致你不想全部声明而使用 `any`，考虑将这一处的类型去断言为你需要的最简类型。如你需要调用 `foo.bar.baz()`，就可以先将 foo 断言为一个具有 bar 方法的类型。
* 如果你是想表达一个未知类型，更合理的方式是使用 `unknown`。

## unknown

`unknown` 类型和 `any` 类型有些类似，一个 `unknown` 类型的变量可以再次赋值为任意其它类型，但只能赋值给 `any` 与 `unknown` 类型的变量：

```typescript
let unknownVar: unknown = "张三";

unknownVar = false;
unknownVar = "张三";
unknownVar = {
  name: "张三"
};

unknownVar = () => { }

const val1: string = unknownVar;    // Error
const val2: number = unknownVar;    // Error
const val3: () => {} = unknownVar;  // Error
const val4: {} = unknownVar;        // Error

const val5: any = unknownVar;
const val6: unknown = unknownVar;
```

`unknown` 和 `any` 的一个主要差异是 `any` 放弃了所有的类型检查，而 `unknown` 并没有。比如在对 `unknown` 类型的变量进行属性访问时：

```typescript
let unknownVar: unknown;
unknownVar.foo(); // 报错：对象类型为 unknown
```

要对 `unknown` 类型进行属性访问，需要进行类型断言，即「虽然这是一个未知的类型，但我跟你保证它在这里就是这个类型」：

```typescript
let unknownVar: unknown;

(unknownVar as { foo: () => {} }).foo();
```

在类型未知的情况下，更推荐使用 `unknown` 标注。

## never

如果说 `void` 是一个空类型，那么 `never` 就更夸张了，它是真正的「什么都没有」类型。

和 `null`、`undefined` 一样，它是所有类型的子类型，但只有 `never` 类型的变量能够赋值给另一个 `never` 类型变量。

通常不会显式地声明一个 `never` 类型，但在某些情况下使用 `never` 确实是符合逻辑的，比如一个只负责抛出错误的函数：

```typescript
function justThrow(): never {
  throw new Error()
}
```

在类型流的分析中，一旦一个返回值类型为 `never` 的函数被调用，那么下方的代码都会被视为无效的代码（即无法执行到）：

```typescript
function justThrow(): never {
  throw new Error()
}

function foo (input:number){
  if(input > 1){
    justThrow();
    // 等同于 return 语句后的代码，即 Dead Code
    const name = "张三";
  }
}
```

## 类型断言：警告编译器不准报错

类型断言能够显式告知类型检查程序当前这个变量的类型，其基本语法是 `as NewType`。

比如将 `any` / `unknown` 类型断言到一个具体的类型：

```typescript
let unknownVar: unknown;

(unknownVar as { foo: () => {} }).foo();
```

类型断言的正确使用方式是，在 TypeScript 类型分析不正确或不符合预期时，将其断言为此处的正确类型。

需要注意的是，类型断言应当是在迫不得己的情况下使用的。虽然说我们可以用类型断言纠正不正确的类型分析，但类型分析在大部分场景下还是可以智能地满足我们需求的。

### 双重断言

如果在使用类型断言时，原类型与断言类型之间差异过大，TypeScript 会给你一个类型报错：

```typescript
const str: string = "apple";

// 从 X 类型 到 Y 类型的断言可能是错误的...
(str as { handler: () => {} }).handler()
```

此时编译器会提醒你先断言到 `unknown` 类型，再断言到预期类型，就像这样：

```typescript
const str: string = "apple";

(str as unknown as { handler: () => {} }).handler();
```

这是因为你的断言类型和原类型的差异太大，需要先断言到一个通用的类，即 `any` / `unknown`。这一通用类型包含了所有可能的类型，因此断言到它和从它断言到另一个类型差异不大。

### 非空断言

还有一种非空断言，即在值（变量、属性）的后边添加 `!` 断言操作符，它可以用来排除值为 `null`、`undefined` 的情况：

```typescript
let mayNullOrUndefinedOrString: null | undefined | string;
mayNullOrUndefinedOrString!.toString(); // ok
mayNullOrUndefinedOrString.toString();  // 报错
```

但应该尽量少用，因为无法保证之前一定非空的值，且这种错误只会在运行环境中抛出，静态类型检测是发现不了的。非空断言的替代方案是类型守卫（后面会讲）。

（完）
