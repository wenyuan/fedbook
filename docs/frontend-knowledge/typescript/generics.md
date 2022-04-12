# 泛型

泛型指的是类型参数化，即将原来某种具体的类型进行参数化。和定义函数参数一样，我们可以给泛型定义若干个类型参数，并在调用时给泛型传入明确的类型参数。

设计泛型的目的在于有效约束类型成员之间的关系，比如函数参数和返回值、类或者接口成员和方法之间的关系。

## 泛型类型参数

泛型最常用的场景是用来约束函数参数的类型，我们可以给函数定义若干个被调用时才会传入明确类型的参数。

比如以下定义的一个 `reflect` 函数，要求能接收一个任意类型的参数并原封不动地返回参数的值：

```typescript
function reflect(param: unknown) {
  return param;
}
const str = reflect('string'); // str 类型是 unknown
const num = reflect(1); // num 类型 unknown
```

但是这样写以后，无论入参是什么类型，返回值的类型一律都是 `unknown`。如果希望返回值类型与入参类型一一对应，就需要用到泛型。

首先用尖括号 `<>` 给函数定义一个泛型参数 `P`，然后指定 `param` 参数的类型为 `P`。

```typescript
function reflect<P>(param: P) {
  return param;
}
```

然后在调用函数时，通过 `<>` 语法指定入参类型，如下代码所示：

```typescript
const str = reflect<string>('string'); // str 类型是 string
const num = reflect<number>(1); // num 类型 number
```

也可以使用泛型显式地注解返回值的类型，比如调用如下所示的 `reflect` 时，我们可以通过尖括号 `<>` 语法给泛型参数 `P` 显式地传入一个明确的类型。

```typescript
function reflect<P>(param: P):P {
  return param;
}
```

另外，如果调用泛型函数时受泛型约束的参数有传值，泛型参数的入参可以从参数的类型中进行推断，而无须再显式指定类型（可缺省），既调用的代码可以写成这样：

```typescript
const str = reflect('string'); // str 类型是 string
const num = reflect(1); // num 类型 number
```

泛型不仅可以约束函数整个参数的类型，还可以约束参数属性、成员的类型，比如参数的类型可以是数组、对象，如下示例：

```typescript
function reflectArray<P>(param: P[]) {
  return param;
}
const arr = reflectArray([1, '1']); // arr 是 (string | number)[]
```

这里我们约束了 `param` 的类型是数组，数组的元素类型是泛型入参。

通过泛型，我们可以约束函数参数和返回值的类型关系。并且可以给函数定义任意个数的泛型入参，如下代码所示：

```typescript
function reflectExtraParams<P, Q>(p1: P, p2: Q): [P, Q] {
  return [p1, p2];
}
```

在上述代码中，我们定义了一个拥有两个泛型入参（`P` 和 `Q`）的函数 `reflectExtraParams`，并通过 `P` 和 `Q` 约束函数参数 `p1`、`p2` 和返回值的类型。

## 泛型类

在类的定义中，我们还可以使用泛型用来约束构造函数、属性、方法的类型，如下代码所示：

```typescript
class Memory<S> {
  store: S;
  constructor(store: S) {
    this.store = store;
  }
  set(store: S) {
    this.store = store;
  }
  get() {
    return this.store;
  }
}
const numMemory = new Memory<number>(1); // <number> 可缺省
const getNumMemory = numMemory.get();    // 类型是 number
numMemory.set(2); // 只能写入 number 类型

const strMemory = new Memory('');        // 缺省 <string>
const getStrMemory = strMemory.get();    // 类型是 string
strMemory.set('string'); // 只能写入 string 类型
```

首先，定义了一个支持读写的寄存器类 `Memory`，并使用泛型约束了 `Memory` 类的构造器函数、`set` 和 `get` 方法形参的类型，最后实例化了泛型入参分别是 `number` 和 `string` 类型的两种寄存器。

泛型类和泛型函数类似的地方在于，在创建类实例时，如果受泛型约束的参数传入了明确值，则泛型入参（确切地说是传入的类型）可缺省。

## 泛型类型
