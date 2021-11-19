# 空值、未定义和不存在

## 空值 void

在 TypeScript 中，可以用 `void` 表示没有任何返回值的函数：

```typescript
function alertName(): void {
  alert('My name is Tom');
}
```

声明一个 `void` 类型的变量没有什么用，因为你只能将它赋值为 `undefined` 和 `null`（只在 `--strictNullChecks` 未指定时）：

```typescript
let unusable: void = undefined;
```

在 TypeScript 中，所有的 `void` 在编译为 JavaScript 后输出都为 `undefined`。

## 未定义 undefined

在 JavaScript 中，`undefined` 也是一个值，表示**未经初始化的值**，而 TypeScript 中的 `void` 表示不存在。

如果将上述代码函数的返回值类型由 `void` 改成 `undefined`，就会报错： `A function whose declared type is neither 'void' nor 'any' must return a value.`

此时应该加上一个 `return`，让函数最终会返回一个 `undefined`：

```typescript
function alertName(): undefined {
  alert('My name is Tom');
  return
}
```

除了含义上不同，在用法上也有区别。这次把 `null` 和 `undefined` 一起跟 `void` 作个比较：

`undefined` 和 `null` 是所有类型的子类型。也就是说 `undefined` 类型的变量，可以赋值给 `number` 类型的变量：

```typescript
// 这样不会报错
let num: number = undefined;
```

```typescript
// 这样也不会报错
let u: undefined;
let num: number = u;
```

而 `void` 类型的变量不能赋值给 `number` 类型的变量：

```typescript
let u: void;
let num: number = u;

// Type 'void' is not assignable to type 'number'.
```

## 不存在 never

`never` 表示永远不存在值，即一个函数不仅没有返回值（即返回值类型是 `void`），而且这个函数永远都不可能完整执行完成（执行到一半就异常结束或无限循环）。

一般用于错误处理函数：

```typescript
function throwError(message: string, errorCode: number): never {
  throw {
    message,
    errorCode
  }
}

throwError('not found', 404);
```

同样永远执行不完的函数还有 while，它也可以用 `never`：

```typescript
function whileLoop(): never {
  while (true) {
    console.log(new Date().toLocaleString());
  }
}
```

在实际项目开发过程中，`never` 类型可以用来控制逻辑流程，但这个类型其实并不常用。

（完）
