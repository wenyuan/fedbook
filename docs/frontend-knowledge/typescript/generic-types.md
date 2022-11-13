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

