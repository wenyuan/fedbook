# 基础类型（始于 JS）

> TypeScript 可以通过为 JavaScript 代码添加类型与类型检查来确保健壮性。因此「类型」它是最核心的部分。

在 TypeScript 语法中，类型的标注主要通过类型后置语法来实现，即用 `:` 作为分割变量和类型的分隔符。而没有写类型标注的 TypeScript 与 JavaScript 完全一致，因此可以把 TypeScript 代码的编写看作是为 JavaScript 代码添加类型标注。

## 原始类型的类型标注

在 [JavaScript 的内置原始类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures#原始值_primitive_values)中，除了常见的 number / string / boolean / null / undefined，ES6 和 ES11 又分别引入了 2 个新的原始类型：symbol 与 bigint 。在 TypeScript 中它们都有对应的类型标注：

```typescript
const name: string = 'apple';
const age: number = 24;
const male: boolean = false;
const undef: undefined = undefined;
const nul: null = null;
const obj: object = { name, age, male };
const bigintVar1: bigint = 9007199254740991n;
const bigintVar2: bigint = BigInt(9007199254740991);
const symbolVar: symbol = Symbol('unique');
```

其中，除了 `null` 与 `undefined` 比较特殊之外，余下的类型基本上可以完全对应到 JavaScript 中的数据类型概念。

### null 与 undefined

在 JavaScript 中，`null` 与 `undefined` 分别表示「有值，但是个空值」和「没有值」。

而在 TypeScript 中，`null` 与 `undefined` 类型都是有具体意义的类型。也就是说，它们作为类型时，表示的是一个有意义的具体类型值。这两者在没有开启 `strictNullChecks` 检查的情况下，会被视作其他类型的子类型，比如 `string` 类型会被认为包含了 `null` 与 `undefined` 类型：

```typescript
// null 类型只能赋值为 null
const tmp1: null = null;
// undefined 类型只能赋值为 undefined
const tmp2: undefined = undefined;

// 仅在关闭 strictNullChecks 时成立，下面代码成立
const tmp3: string = null;
const tmp4: string = undefined;
```

### void

`void` 也是一个特殊的类型，它和 JavaScript 中的 `void` 同样不是一回事。

在 JavaScript 中，形如 `<a href="javascript:void(0)">清除缓存</a>` 的代码，void 操作符会执行后面跟着的表达式并返回一个 `undefined`。

而在 TypeScript 中，`void` 用于描述一个内部没有 return 语句，或者没有显式 return 一个值的函数的返回值，如：

```typescript
function func1() {}
function func2() {
  return;
}
function func3() {
  return undefined;
}
```

在这里，func1 与 func2 的返回值类型都会被隐式推导为 `void`，只有显式返回了 `undefined` 值的 func3 其返回值类型才被推导为了 `undefined`。但在实际的代码执行中，func1 与 func2 的返回值均是 `undefined`。

这里可以认为 `void` 表示一个空类型，而 `null` 与 `undefined` 都是一个具有意义的实际类型。因此`undefined` 能够被赋值给 `void` 类型的变量，就像这样：

```typescript
const voidVar1: void = undefined;

// null 也可以，但是需要关闭 strictNullChecks
const voidVar2: void = null;
```

## 数组的类型标注

### 数组

数组同样是最常用的类型之一，在 TypeScript 中有两种方式来声明一个数组类型：

```typescript
const arr1: string[] = [];

const arr2: Array<string> = [];
```

这两种方式是完全等价的，但其实更多是以前者为主。

### 元组

在某些情况下，使用元组（Tuple）来代替数组要更加妥当，比如一个数组中只存放固定长度的变量，但我们进行了超出长度的访问。如果是数组，会抛出错误；使用元素的话，能在越界访问时给出类型报错：

```typescript
// 使用数组，运行时报错
const arr3: string[] = ['apple', 'pear', 'banana'];
console.log(arr3[599]);

// 使用元组，在越界访问时会给出类型报错
const arr4: [string, string, string] = ['apple', 'pear', 'banana'];
console.log(arr4[599]);
```

在写法上，元祖类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同：

因为在 JavaScript 中并没有元组的概念，所以 TypeScript 的数组和元组在转译为 JavaScript 后都是数组，但元组最重要的特性是数量固定，类型可以各异。

同时，为了增加可读性，在 TypeScript 4.0 中，有了[具名元组](https://github.com/Microsoft/TypeScript/issues/28259)的支持，使得我们可以为元组中的元素打上类似 label 的标记：

```typescript
const arr7: [name: string, age: number, male: boolean] = ['张三', 13, true];
```

## 对象的类型标注

对象的类型标注是比较重要的部分，因为它在 JavaScript 中也是使用最频繁的数据结构。

在 TypeScript 中，用来描述对象类型的类型标注是 `interface`，可以理解为它代表了这个对象对外提供的接口结构（好吧，如果会后端语言，会觉得给「对象」被「接口」多少还是有点区别的，不过这是前端嘛）。

### 声明方式

首先使用 `interface` 声明一个结构，然后使用这个结构来作为一个对象的类型标注即可：

```typescript
// 声明一个接口
interface IDescription {
  name: string;
  age: number;
  male: boolean;
}

// 用上面声明的接口，给一个对象标注类型
const obj1: IDescription = {
  name: '张三',
  age: 13,
  male: true,
};
```

这里声明的接口表示：

* 对象每一个属性的值必须**一一对应**到接口的属性类型。
* 不能有多的属性，也不能有少的属性，包括直接在对象内部声明，或是 `obj1.other = 'xxx'` 这样属性访问赋值的形式。

除了声明属性以及属性的类型以外，我们还可以对属性进行修饰，常见的修饰包括**可选**（Optional）与**只读**（Readonly）这两种。

### 修饰接口属性

在接口结构可以通过 `?` 来标记一个属性为可选：

```typescript
interface IDescription {
  name: string;
  age: number;
  male?: boolean;
  func?: Function;
}

const obj2: IDescription = {
  name: '张三',
  age: 13,
  male: true,
  // 无需实现 func 也是合法的
};
```

在这种情况下，即使在 `obj2` 中定义了 `male` 属性，但当你访问 `obj2.male` 时，它的类型仍然会是 `boolean | undefined`。

同理，即使对上面的可选属性（`func` 函数）进行了赋值，然后调用（`obj2.func()`），TypeScript 仍然会**以接口的描述为准**进行类型检查，此时将会产生一个类型报错：「不能调用可能是未定义的方法」。但可选属性标记不会影响你对这个属性进行赋值和实际使用，要想解决这个类型验证的问题，可以使用类型断言、非空断言或可选链（后面再说）。

除了标记一个属性为可选以外，还可以标记这个属性为只读：`readonly`。它的作用是防止对象的属性被再次赋值。

```typescript
interface IDescription {
  readonly name: string;
  age: number;
}

const obj3: IDescription = {
  name: '张三',
  age: 13,
};

// 无法分配到 "name" ，因为它是只读属性
obj3.name = "张三";
```

其实在数组与元组层面也有着只读的修饰，但与对象类型有着两处不同：

* 只能将整个数组/元组标记为只读，而不能像对象那样标记某个属性为只读。
* 一旦被标记为只读，那这个只读数组/元组的类型上，将不再具有 `push`、`pop` 等方法（即会修改原数组的方法），因此报错信息也将是「类型 xxx 上不存在属性 "push"」这种。这一实现的本质是**只读数组与只读元组的类型实际上变成了 ReadonlyArray，而不再是 Array**。

### type 与 interface

在 TypeScript 中，type（类型别名）和 interface（接口）都可以用来描述对象，在大多数情况下效果等价。不过还是推荐：

* interface 用来描述对象、类的结构。
* type 用来将一个函数签名、一组联合类型、一个工具类型等等抽离成一个完整独立的类型。（这也更贴合「别名」这一称谓）

但大部分场景下接口都可以被类型别名所取代，因此，只要你觉得统一使用类型别名让你觉得更整齐，也没什么问题。

### object、Object 以及 {}

`object`、`Object` 以及 `{}`（一个空对象）这三者的使用也是挺让人困惑的，这里区分一下吧。

首先是 `Object` 的使用。在 JavaScript 原型链的知识中提到，原型链的顶端是 `Object` 以及 `Function`，这也就意味着所有的原始类型与对象类型最终都指向 `Object`，在 TypeScript 中就表现为 `Object` 包含了所有的类型：

```typescript
// 对于 undefined、null、void 0 ，需要关闭 strictNullChecks
const tmp1: Object = undefined;
const tmp2: Object = null;
const tmp3: Object = void 0;

const tmp4: Object = 'apple';
const tmp5: Object = 599;
const tmp6: Object = { name: '张三' };
const tmp7: Object = () => {};
const tmp8: Object = [];
```

和 `Object` 类似的还有 `Boolean`、`Number`、`String`、`Symbol`，这几个装箱类型（Boxed Types）同样包含了一些超出预期的类型。以 `String` 为例，它同样包括 `undefined`、`null`、`void`，以及代表的拆箱类型（Unboxed Types）`string`，但并不包括其他装箱类型对应的拆箱类型，如 `boolean` 与 基本对象类型，看以下的代码：

```typescript
const tmp9: String = undefined;
const tmp10: String = null;
const tmp11: String = void 0;
const tmp12: String = 'apple';

// 以下不成立，因为不是字符串类型的拆箱类型
const tmp13: String = 599; // 报错
const tmp14: String = { name: '张三' }; // 报错
const tmp15: String = () => {}; // 报错
const tmp16: String = []; // 报错
```

注意：**在任何情况下，都不应该使用这些装箱类型**。

`object` 的引入就是为了解决对 `Object` 类型的错误使用，它代表所有非原始类型的类型，即**数组、对象与函数类型**这些：

```typescript
const tmp17: object = undefined;
const tmp18: object = null;
const tmp19: object = void 0;

const tmp20: object = 'apple';  // 报错，值为原始类型
const tmp21: object = 599;        // 报错，值为原始类型

const tmp22: object = { name: '张三' };
const tmp23: object = () => {};
const tmp24: object = [];
```

最后是 `{}`，可以认为它就是一个对象字面量类型（字面量类型后面再讲）。即使用 `{}` 作为类型标注就是一个合法的，但内部无属性定义的空对象，它意味着任何非 `null` / `undefined` 的值：

虽然能够将其作为任意变量的类型，但实际上却**无法对这个变量进行任何赋值操作**：

```typescript
const tmp30: {} = { name: '张三' };

tmp30.age = 18; // 报错 类型 "{}" 上不存在属性 "age"
```

这是因为它就是纯洁的像一张白纸一样的空对象，上面没有任何的属性（除了 toString 这种与生俱来的）。

**结论**：

* 在任何时候都不要使用 `Object` 以及类似的装箱类型（少学一样会带来困扰的东西，心理负担会小很多）。
* 同样要避免使用 `{}`。它意味着任何非 `null` / `undefined` 的值，从这个层面上看，这和使用 `any` 一样恶劣。
* 当你不确定某个变量的具体类型，但能确定它不是原始类型，可以使用 `object`。但更推荐进一步区分，也就是使用 `Record<string, unknown>` 或 `Record<string, any>` 表示对象，`unknown[]` 或 `any[]` 表示数组，`(...args: any[]) => any` 表示函数这样。

## 总结

这一章是衔接 JS 和 TS 两者的过渡，可以认为是学完 JS，如何带着 JS 的基础来学 TS。其实可以分为两类：

* 与 JavaScript 概念基本一致的部分，如原始类型与数组类型需要重点掌握，但因为思维方式基本没有变化，所以可以认为就是在写更严格一些的 JavaScript。
* 一些全新的概念，比如元组与 readonly 修饰等，这一部分就是 JS 没有的东西了，需要稍微转换一下思维方式。

通过这一章的过渡，后面就完全进入 TS 独有的世界了。

（完）
