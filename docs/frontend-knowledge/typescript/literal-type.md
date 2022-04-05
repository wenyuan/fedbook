# 字面量类型

## 类型推断

在 TypeScript 中，类型标注声明是在变量之后（即类型后置），它不像 Java 语言一样，先声明变量的类型，再声明变量的名称。

```java
// Java 声明并初始化字符串 str
String str="Hello World";
```

使用类型标注后置的好处是编译器可以通过代码所在的上下文推导其对应的类型，无须再声明变量类型，示例如下：

```typescript
let x1 = 42;         // 推断出 x1 的类型是 number
let x2: number = x1; // ok
```

在上述代码中，`x1` 的类型被推断为 `number`，将变量赋值给 `number` 类型的变量 `x2` 后，不会出现任何错误。

在 TypeScript 中，具有初始化值的变量、有默认值的函数参数、函数返回的类型都可以根据上下文推断出来。比如我们能根据 `return` 语句推断函数返回的类型，如下代码所示：

```typescript
/** 根据参数的类型，推断出返回值的类型也是 number */
function add1(a: number, b: number) {
  return a + b;
}
const x1= add1(1, 1); // 推断出 x1 的类型也是 number

/** 推断参数 b 的类型是数字或者 undefined，返回值的类型也是数字 */
function add2(a: number, b = 1) {
  return a + b;
}
const x2 = add2(1);
const x3 = add2(1, '1'); // ts(2345) Argument of type '"1"' is not assignable to parameter of type 'number | undefined
```

## 上下文推断

变量的类型除了可以通过被赋值的值进行推断之外，在某些特定的情况下，也可以通过变量所在的上下文环境推断变量的类型，示例如下：

```typescript
type Adder = (a: number, b: number) => number;
const add: Adder = (a, b) => {
  return a + b;
}
const x1 = add(1, 1); // 推断出 x1 类型是 number
const x2 = add(1, '1');  // ts(2345) Argument of type '"1"' is not assignable to parameter of type 'number
```

这里先定义了一个实现加法功能的函数类型 `Adder`，然后声明了 `add` 变量的类型为 `Adder` 并赋值一个匿名箭头函数，箭头函数参数 `a` 和 `b` 的类型以及返回类型都没有显式声明。

TypeScript 通过 `add` 的类型 `Adder` 反向（通过变量类型推断出值的相关类型）推断出箭头函数参数及返回值的类型，也就是说函数参数 `a`、`b`，以及返回类型在这个变量的声明上下文中被确定了。

正是得益于 TypeScript 这种类型推导机制和能力，使得我们无须显式声明，即可直接通过上下文环境推断出变量的类型，也就是说此时类型可缺省。

## 字面量类型

> 字面量就是跟变量相对的，直接写在代码里的值，一般除去表达式，给变量赋值时，等号右边都可以认为是字面量。

### 介绍

在 TypeScript 中，字面量不仅可以表示值，还可以表示类型，即所谓的字面量类型。

目前，TypeScript 支持 3 种字面量类型：字符串字面量类型、数字字面量类型、布尔字面量类型，对应的字符串字面量、数字字面量、布尔字面量分别拥有**与其值一样的字面量类型**，具体示例如下：

```typescript
let specifiedStr: 'this is string' = 'this is string';
let specifiedNum: 1 = 1;
let specifiedBoolean: true = true;
```

### 应用

定义单个的字面量类型一般没有太大的用处，它真正的应用场景是可以把多个字面量类型组合成一个联合类型，用来描述拥有明确成员的实用的集合。

比如声明如下所示的一个类型 Config：

```typescript
interface Config {
  size: 'small' | 'big';
  isEnable:  true | false;
  margin: 0 | 2 | 4;
}
```

在上述代码中，我们限定了 `size` 属性为字符串字面量类型 `'small' | 'big'`，`isEnable` 属性为布尔字面量类型 `true | false`（布尔字面量只有这两个值，所以跟直接使用 `boolean` 没有区别），`margin` 属性为数字字面量类型 `0 | 2 | 4`。

### 字面量类型拓宽

字面量类型拓宽（Literal Widening）：所有通过 `let` 或 `var` 定义的变量、函数的形参、对象的非只读属性，如果满足指定了初始值且未显式添加类型注解的条件，那么它们推断出来的类型就是指定的初始值字面量类型拓宽后的类型。

比如下面的例子：

```typescript
let str = 'this is string';                   // 类型是 string
let strFun = (str = 'this is string') => str; // 形参类型是 string
const specifiedStr = 'this is string';        // 类型是 'this is string'
let str2 = specifiedStr;                      // 类型是 string
let strFun2 = (str = specifiedStr) => str;    // 形参类型是 string
```

* 第 1~2 行满足了 let、形参且未显式声明类型注解的条件，所以变量、形参的类型拓宽为 `string`（形参类型确切地讲是 `string | undefined`）。
* 第 3 行的常量不可变更，类型没有拓宽，所以 specifiedStr 的类型是 `'this is string'` 字面量类型。
* 第 4~5 行，因为赋予的值 `specifiedStr` 的类型是字面量类型，且没有显式类型注解，所以变量、形参的类型也被拓宽了。

基于字面量类型拓宽的条件，我们可以通过添加显示类型注解来控制类型拓宽行为：

```typescript
const specifiedStr: 'this is string' = 'this is string'; // 类型是 '"this is string"'
let str2 = specifiedStr; // 即便使用 let 定义，类型是 'this is string'
```

### 其他类型拓宽

除了字面量类型拓宽之外，TypeScript 对某些特定类型值也有类似类型拓宽（Type Widening）的设计，比如对 `null` 和 `undefined` 的类型进行拓宽，通过 `let`、`var` 定义的变量如果满足未显式声明类型注解且被赋予了 `null` 或 `undefined` 值，则推断出这些变量的类型是 `any`：

```typescript
let x = null;      // 类型拓宽成 any
let y = undefined; // 类型拓宽成 any
/** -----分界线------- */
const z = null;    // 类型是 null
/** -----分界线------- */
let anyFun = (param = null) => param; // 形参类型是 null
let z2 = z; // 类型是 null
let x2 = x; // 类型是 null
let y2 = y; // 类型是 undefined
```

上面的第 6~9 行的类型推断行为是因为开启了 `strictNullChecks=true`（严格模式）。

### 类型缩小

类型缩小（Type Narrowing）：可以通过某些操作将变量的类型由一个较为宽泛的集合缩小到相对较小、较明确的集合。

比如可以使用类型守卫将函数参数的类型从 `any` 缩小到明确的类型，示例如下：

```typescript
let func = (anything: any) => {
  if (typeof anything === 'string') {
    return anything; // 类型是 string 
  } else if (typeof anything === 'number') {
    return anything; // 类型是 number
  }
  return null;
};
```

同样，也可以使用类型守卫将联合类型缩小到明确的子类型，示例如下：

```typescript
let func = (anything: string | number) => {
  if (typeof anything === 'string') {
    return anything; // 类型是 string 
  } else {
    return anything; // 类型是 number
  }
};
```

当然，也可以通过字面量类型等值判断（`===`）或其他控制流语句（包括但不限于 if、三目运算符、switch 分支）将联合类型收敛为更具体的类型，示例如下：

```typescript
type Goods = 'pen' | 'pencil' |'ruler';
const getPenCost = (item: 'pen') => 2;
const getPencilCost = (item: 'pencil') => 4;
const getRulerCost = (item: 'ruler') => 6;
const getCost = (item: Goods) =>  {
  if (item === 'pen') {
    return getPenCost(item);    // item => 'pen'
  } else if (item === 'pencil') {
    return getPencilCost(item); // item => 'pencil'
  } else {
    return getRulerCost(item);  // item => 'ruler'
  }
}
```

在上述 `getCost` 函数中，接受的参数类型是字面量类型的联合类型，函数内包含了 if 语句的 3 个流程分支，其中每个流程分支调用的函数的参数都是具体独立的字面量类型。

`getPenCost`、`getPencilCost` 和 `getRulerCost` 三个函数只接受单一特定字面量类型的参数，但在每个流程分支中，编译器可以知道流程分支中的 item 类型是什么（类型会被收缩为特定字面量类型）。

事实上，如果我们将上面的示例去掉中间的流程分支，编译器也可以推断出收敛后的类型，如下代码所示：

```typescript
type Goods = 'pen' | 'pencil' |'ruler';
const getCost = (item: Goods) =>  {
  if (item === 'pen') {
    item; // item => 'pen'
  } else {
    item; // => 'pencil' | 'ruler'
  }
}
```

（完）
