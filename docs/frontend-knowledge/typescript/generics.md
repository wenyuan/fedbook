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
const num = reflect<number>(1);        // num 类型 number
```

也可以使用泛型显式地注解返回值的类型，不过没必要，因为返回值的类型可以基于上下文推断出来。

比如调用如下所示的 `reflect` 时，我们可以通过尖括号 `<>` 语法给泛型参数 `P` 显式地传入一个明确的类型，相应地，返回值类型也被指定了。

```typescript
function reflect<P>(param: P):P {
  return param;
}
```

另外，如果调用泛型函数时受泛型约束的参数有传值，泛型参数的入参可以从参数的类型中进行推断，而无须再显式指定类型（可缺省）：

```typescript
// const str = reflect<string>('string'); 可以简写如下：
const str = reflect('string');

// const num = reflect<number>(1); 可以简写如下：
const num = reflect(1);
```

泛型不仅可以约束函数整个参数的类型，还可以约束参数属性、成员的类型，比如参数的类型可以是数组或对象，如下代码所示：

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

在 TypeScript 中，类型本身就可以被定义为拥有不明确的类型参数的泛型，并且可以接收明确类型作为入参，从而衍生出更具体的类型，比如使用 `Array<类型>` 的语法来定义数组（子元素）类型，这里的 `Array` 本身就是一种类型。

再如下代码所示，为变量 `reflectFn` 显式添加了泛型类型注解，并将 `reflect` 函数作为值赋给了它：

```typescript
const reflectFn: <P>(param: P) => P = reflect; // ok
```

也可以把 `reflectFn` 的类型注解提取为一个能被复用的类型别名或者接口，如下代码所示：

```typescript
type ReflectFuncton = <P>(param: P) => P; // 类型别名
interface IReflectFuncton {               // 接口
  <P>(param: P): P
}
const reflectFn2: ReflectFuncton = reflect;
const reflectFn3: IReflectFuncton = reflect;
```

将类型入参的定义移动到类型别名或接口名称后，此时定义的一个接收具体类型入参后返回一个新类型的类型就是泛型类型。

如下示例中，定义了两个可以接收入参 `P` 的泛型类型（`GenericReflectFunction` 和 `IGenericReflectFunction` ）。

```typescript
type GenericReflectFunction<P> = (param: P) => P;
interface IGenericReflectFunction<P> {
  (param: P): P;
}
const reflectFn4: GenericReflectFunction<string> = reflect;  // 具象化泛型
const reflectFn5: IGenericReflectFunction<number> = reflect; // 具象化泛型
const reflectFn3Return = reflectFn4('string'); // 入参和返回值都必须是 string 类型
const reflectFn4Return = reflectFn5(1); // 入参和返回值都必须是 number 类型
```

在泛型定义中，甚至可以使用一些类型操作符进行运算表达，使得泛型可以根据入参的类型衍生出各异的类型，如下代码所示：

```typescript
type StringOrNumberArray<E> = E extends string | number ? E[] : E;
type StringArray = StringOrNumberArray<string>; // 类型是 string[]
type NumberArray = StringOrNumberArray<number>; // 类型是 number[]
type NeverGot = StringOrNumberArray<boolean>;   // 类型是 boolean
```

这里使用三目表达式定义了一个泛型，如果入参是 `number | string` 就会生成一个数组类型，否则就生成入参类型。

## 泛型约束

泛型就像是类型的函数，它可以抽象、封装并接收（类型）入参，而泛型的入参也拥有类似函数入参的特性。因此，我们可以把泛型入参限定在一个相对更明确的集合内，以便对入参进行约束。

比如最前边提到的原封不动返回参数的 `reflect` 函数，如果希望把接收参数的类型限定在几种原始类型的集合中，此时就可以使用「泛型入参名 extends 类型」语法达到这个目的，如下代码所示：

```typescript
function reflectSpecified<P extends number | string | boolean>(param: P):P {
  return param;
}
reflectSpecified('string'); // ok
reflectSpecified(1);    // ok
reflectSpecified(true); // ok
reflectSpecified(null); // ts(2345) 'null' 不能赋予类型 'number | string | boolean'
```

在上述示例中，我们限定了泛型入参只能是 `number | string | boolean` 的子集。

同样，我们也可以把接口泛型入参约束在特定的范围内，如下代码所示：

```typescript
interface ReduxModelSpecified<State extends { id: number; name: string }> {
  state: State
}
type ComputedReduxModel1 = ReduxModelSpecified<{ id: number; name: string; }>; // ok
type ComputedReduxModel2 = ReduxModelSpecified<{ id: number; name: string; age: number; }>; // ok
type ComputedReduxModel3 = ReduxModelSpecified<{ id: string; name: number; }>; // ts(2344)
type ComputedReduxModel4 = ReduxModelSpecified<{ id: number;}>; // ts(2344)
```

在上述示例中，`ReduxModelSpecified` 泛型仅接收 `{ id: number; name: string }` 接口类型的子类型作为入参。

还可以在多个不同的泛型入参之间设置约束关系，如下代码所示：

```typescript
interface ObjSetter {
  <O extends {}, K extends keyof O, V extends O[K]>(obj: O, key: K, value: V): V; 
}
const setValueOfObj: ObjSetter = (obj, key, value) => (obj[key] = value);
setValueOfObj({ id: 1, name: 'name' }, 'id', 2);   // ok
setValueOfObj({ id: 1, name: 'name' }, 'name', 'new name'); // ok
setValueOfObj({ id: 1, name: 'name' }, 'age', 2);  // ts(2345)
setValueOfObj({ id: 1, name: 'name' }, 'id', '2'); // ts(2345)
```

在设置对象属性值的函数类型时，它拥有 3 个泛型入参：第 1 个是对象，第 2 个是第 1 个入参属性名集合的子集，第 3 个是指定属性类型的子类型（这里使用了 `keyof` 操作符）。

另外，泛型入参与函数入参还有一个相似的地方在于，它也可以给泛型入参指定默认值（默认类型），且语法和指定函数默认参数完全一致，如下代码所示：

```typescript
interface ReduxModelSpecified2<State = { id: number; name: string }> {
  state: State
}
type ComputedReduxModel5 = ReduxModelSpecified2; // ok
type ComputedReduxModel6 = ReduxModelSpecified2<{ id: number; name: string; }>; // ok
type ComputedReduxModel7 = ReduxModelSpecified;  // ts(2314) 缺少一个类型参数
```

在上述示例中，我们定义了入参有默认类型的泛型 `ReduxModelSpecified2`，因此使用 `ReduxModelSpecified2` 时类型入参可缺省。而 `ReduxModelSpecified` 的入参没有默认值，所以缺省入参时会提示一个类型错误。

泛型入参的约束与默认值还可以组合使用，如下代码所示：

```typescript
interface ReduxModelMixed<State extends {} = { id: number; name: string }> {
  state: State
}
```

这里我们限定了泛型 `ReduxModelMixed` 入参 `State` 必须是 `{}` 类型的子类型，同时也指定了入参缺省时的默认类型是接口类型 `{ id: number; name: string; }`。

（完）
