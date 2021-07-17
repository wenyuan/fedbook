# 布尔、数值与字符串

## 布尔类型 boolean

和 JavaScript 一样，使用 `boolean` 定义布尔值类型。

在 TypeScript 中，声明一个布尔类型变量的方法为：

```typescript
let isTrue: boolean = false;
```

## 数值类型 number

和 JavaScript 一样，使用 `number` 定义数值类型，它既能表示整数、也能表示浮点数，甚至可以表示正负数。

在 TypeScript 中，声明一个数值类型变量的方法为：

```typescript
let num: number = 6;
let notANum: number = NaN;
let infinityNum: number = Infinity;
```

## 字符串类型 string

和 JavaScript 一样，使用 `string` 定义字符串类型，可以使用双引号、单引号和反引号（ES6 引入的字符串模板）表示字符串。

在 TypeScript 中，声明一个字符串类型变量的方法为：

```typescript
let name: string = 'zhangsan';
let age: number = 13;

// 模板字符串
let desc: string = `Hello, my name is ${name}.
I'll be ${age + 1} years old next month.`;
```

（完）
