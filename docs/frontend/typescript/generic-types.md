# 泛型

TypeScript 中常说的类型编程，其实就是对类型进行编程。而泛型就是这门语言里的（函数）参数。

## 类型别名中的泛型

### 基本用法

类型别名如果声明了泛型坑位，那其实就等价于一个接受参数的函数：

```typescript
// 这个类型别名本质是一个函数，T 是它的变量，返回值是一个包含 T 的联合类型
type Factory<T> = T | number | string;
```

类型别名中的泛型大多是用来进行工具类型封装，比如下面两个：

```typescript
// 将一个对象类型的所有属性类型置为 string 
type Stringify<T> = {
  [K in keyof T]: string;
};

// 进行类型的完全复制
type Clone<T> = {
  [K in keyof T]: T[K];
};
```

### 泛型约束与默认值

像函数参数一样，给泛型设置**默认值**以后，在调用时就可以不带任何参数了：

```typescript
type Factory<T = boolean> = T | number | string;

const foo: Factory = false;
```

此外泛型还有比函数参数更强大的功能：**泛型约束**。即可以要求传入这个工具类型的泛型必须符合某些条件，否则就拒绝进行后面的逻辑。

下面这个例子要求根据传入的请求码判断请求是否成功，通过 `extends number` 来表明其类型约束，如果传入一个不合法的值，就会出现类型错误：

```typescript
type ResStatus<ResCode extends number> = ResCode extends 10000 | 10001 | 10002
    ? 'success'
    : 'failure';


type Res1 = ResStatus<10000>;   // "success"
type Res2 = ResStatus<20000>;   // "failure"

type Res3 = ResStatus<'10000'>; // 类型 "string" 不满足约束 "number"
```

### 多泛型关联

泛型中可以传入多个参数，并且后续的泛型参数中，可以使用前面的泛型参数作为约束或默认值：

```typescript
type ProcessInput<
  Input,
  SecondInput extends Input = Input,
  ThirdInput extends Input = SecondInput
> = number;
```

从这个类型别名中可以看到：

* 这个工具类型接受 1-3 个泛型参数。
* 第二、三个泛型参数的类型需要是**首个泛型参数的子类型**。
* 当只传入一个泛型参数时，其第二个泛型参数会被赋值为此参数，而第三个则会赋值为第二个泛型参数，相当于**均使用了这唯一传入的泛型参数**。
* 当传入两个泛型参数时，第三个泛型参数**会默认赋值为第二个泛型参数的值**。

## 对象类型中的泛型

### 基本用法

最常见的是响应类型结构的泛型处理：

* 用接口描述一个通用的响应类型结构，预留出实际响应数据的泛型坑位

```typescript
interface IRes<TData = unknown> {
  code: number;
  error?: string;
  data: TData;
}
```

* 然后在请求函数中就可以传入特定的响应类型了

```typescript
interface IUserProfileRes {
  name: string;
  homepage: string;
  avatar: string;
}
function fetchUserProfile(): Promise<IRes<IUserProfileRes>> {}

type StatusSucceed = boolean;
function handleOperation(): Promise<IRes<StatusSucceed>> {}
```

### 泛型嵌套

比如对存在分页结构的数据，可以将其分页的响应结构抽离出来：

```typescript
interface IPaginationRes<TItem = unknown> {
  data: TItem[];
  page: number;
  totalCount: number;
  hasNextPage: boolean;
}

function fetchUserProfileList(): Promise<IRes<IPaginationRes<IUserProfileRes>>> {}
```

这些对数据类型的封装，本质上就是简单的泛型参数填充，写起来就跟普通 JS 里的封装思想差不多。

## 函数中的泛型

### 基本用法

函数中使用泛型，目的是在约束入参类型的同时，将返回值的类型和入参关联起来。

一个简单的例子：

```typescript
function handle<T>(input: T): T {}
```

上面的代码：

* 首先为函数声明了一个泛型参数 `T`，
* 然后将参数的类型与返回值类型指向这个泛型参数。
* 在调用时，当这个函数接收到参数，`T` 会自动地被填充为这个参数的类型。
* 而返回值与参数类型关联的情况下，也可以通过泛型参数来进行运算。

在基于参数类型进行填充泛型时，其类型信息会被推断到尽可能精确的程度，如**会把常量推导到字面量类型而不是基础类型**。

```typescript
function handle<T>(input: T): T {}

const name = "张三"; // 使用 const 声明，被推导为 "张三"
let age = 13;       // 使用 let 声明，被推导为 number

handle(name); // 填充为字面量类型 "张三"
handle(age);  // 填充为基础类型 number
```

### 约束与默认值

函数中的泛型同样存在约束与默认值，比如只想处理数字元组的情况：

```typescript
function swap<T extends number, U extends number>([start, end]: [T, U]): [U, T] {
  return [end, start];
}
```

## Class 中的泛型

对比函数中的泛型：

* 函数中泛型参数的消费方是参数和返回值类型。
* Class 中的泛型消费方则是属性、方法、乃至装饰器等。

同时 Class 内的方法还可以再声明自己独有的泛型参数。一个完整的示例如下：

```typescript
class Queue<TElementType> {
  private _list: TElementType[];

  constructor(initial: TElementType[]) {
    this._list = initial;
  }

  // 入队一个队列泛型子类型的元素
  enqueue<TType extends TElementType>(ele: TType): TElementType[] {
    this._list.push(ele);
    return this._list;
  }

  // 入队一个任意类型元素（无需为队列泛型子类型）
  enqueueWithUnknownType<TType>(element: TType): (TElementType | TType)[] {
    return [...this._list, element];
  }

  // 出队
  dequeue(): TElementType[] {
    this._list.shift();
    return this._list;
  }
}
```

其中，`enqueue` 方法的入参类型 `TType` 被约束为队列类型的子类型，而 `enqueueWithUnknownType` 方法中的 `TType` 类型参数则不会受此约束，它会在其被调用时再对应地填充，同时也会在返回值类型中被使用。

## 内置方法中的泛型

TypeScript 中为非常多的内置对象都预留了泛型坑位。

### Promise 中的泛型

在填充 Promise 的泛型以后，其内部的 `resolve` 方法也自动填充了泛型：

```typescript
function p() {
  return new Promise<boolean>((resolve, reject) => {
    resolve(true);
  });
}
```

而在 TypeScript 内部的 Promise 类型声明中同样是通过泛型实现：

```typescript
interface PromiseConstructor {
  resolve<T>(value: T | PromiseLike<T>): Promise<T>;
}

declare var Promise: PromiseConstructor;
```

### 数组中的泛型

数组 `Array<T>` 当中，其泛型参数代表数组的元素类型，几乎贯穿所有的数组方法：

```typescript
const arr: Array<number> = [1, 2, 3];

// 报错：类型 "string" 的参数不能赋给类型 "number" 的参数。
arr.push('apple');

// 报错：类型 "string" 的参数不能赋给类型 "number" 的参数。
arr.includes('apple');

// number | undefined
arr.find(() => false);

// 第一种 reduce
arr.reduce((prev, curr, idx, arr) => {
  return prev;
}, 1);

// 第二种 reduce
// 报错：不能将 number 类型的值赋值给 never 类型
arr.reduce((prev, curr, idx, arr) => {
  return [...prev, curr]
}, []);
```

`reduce` 方法是相对特殊的一个，它的类型声明存在几种不同的重载：

* 当你不传入初始值时，泛型参数会从数组的元素类型中进行填充。
* 当你传入初始值时，如果初始值的类型与数组元素类型一致，则使用数组的元素类型进行填充。即这里第一个 `reduce` 调用。
* 当你传入一个数组类型的初始值，比如这里的第二个 `reduce` 调用，`reduce` 的泛型参数会默认从这个初始值推导出的类型进行填充，如这里是 `never[]`。

其中第三种情况也就意味着**信息不足，无法推导出正确的类型**，我们可以手动传入泛型参数来解决：

```typescript
arr.reduce<number[]>((prev, curr, idx, arr) => {
  return prev;
}, []);
```

### React 中的泛型

在 React 中，同样可以找到无处不在的泛型坑位：

```typescript
const [state, setState] = useState<number[]>([]);
// 不传入默认值，则类型为 number[] | undefined
const [state, setState] = useState<number[]>();

// 体现在 ref.current 上
const ref = useRef<number>();

const context =  createContext<ContextType>({});
```

（完）
