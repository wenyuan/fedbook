# 联合和字面量

## 联合类型 union

联合类型（Union Types）表示取值可以为多种类型中的一种。

### 简单的例子

```typescript
let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
myFavoriteNumber = 7;
```

```typescript
let myFavoriteNumber: string | number;
myFavoriteNumber = true;

// error: Type 'boolean' is not assignable to type 'string | number'.
```

联合类型使用 `|` 分隔每个类型。

这里的 `let myFavoriteNumber: string | number` 的含义是，允许 `myFavoriteNumber` 的类型是 `string` 或者 `number`，但是不能是其他类型。

### 访问联合类型的属性或方法

当 TypeScript 不确定一个联合类型的变量到底是哪个类型的时候，我们**只能访问此联合类型的所有类型里共有的属性或方法**：

```typescript
function getLength(something: string | number): number {
    return something.length;
}

// error: Property 'length' does not exist on type 'string | number'.
//   Property 'length' does not exist on type 'number'.
```

上例中，`length` 不是 `string` 和 `number` 的共有属性，所以会报错。

访问 `string` 和 `number` 的共有属性是没问题的：

```typescript
function getString(something: string | number): string {
    return something.toString();
}
```

联合类型的变量在被赋值的时候，会根据**类型推论**的规则推断出一个类型：

```typescript
let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
console.log(myFavoriteNumber.length); // 5
myFavoriteNumber = 7;
console.log(myFavoriteNumber.length); // 编译时报错

// error: Property 'length' does not exist on type 'number'.
```

上例中，第二行的 `myFavoriteNumber` 被推断成了 `string`，访问它的 `length` 属性不会报错。

而第四行的 `myFavoriteNumber` 被推断成了 `number`，访问它的 `length` 属性时就报错了。

> 类型推论：如果没有明确的指定类型，那么 TypeScript 会依照类型推论（Type Inference）的规则推断出一个类型。
> * TypeScript 会在没有明确的指定类型的时候，根据定义时的赋值，推测出一个类型，这就是类型推论。
> * 如果定义的时候没有赋值，不管之后有没有赋值，都会被推断成 any 类型而完全不被类型检查。

## 字面量类型 literal 

字面量类型（Literal Types）表示特定数据就是变量的类型。

### 简单的例子

```typescript
const number3 = 3;
```

上述声明的变量 `number3`，它的类型并不是 `number`，而是数字 `3`。

### 混合使用不同类型

```typescript
let literal : 1 | '2' | true | [1,2,3,4]
```

上述声明把字面量类型和联合类型混合使用，`literal` 的值只能是这四个值之一。

### 联合类型与字面量类型混用实例

```typescript
function merge(
  num1: number | string,
  num2: number | string,
  resultType: 'as-number' | 'as-string'
) {
  if (resultType === 'as-string') {
    return num1.toString() + num2.toString();
  }
  if (typeof num1 === 'string' || typeof num2 === 'string') {
    return num1.toString() + num2.toString();
  } else {
    return num1 + num2;
  }
}

let mergeNumer1 = merge(2, 5, 'as-number');
let mergeNumer2 = merge(2, 5, 'as-string');
let mergeString = merge('hello', 'world', 'as-string');

console.log(mergeNumer1); // 7
console.log(mergeNumer2); // '25'
console.log(mergeString); // 'helloworld'
```

上述代码中，`merge` 函数的第三个参数 `resultType` 是一个字面量类型，它定义为两个字符串值。根据 `resultType` 两种特殊的取值将输出两种不同的结果。

（完）
