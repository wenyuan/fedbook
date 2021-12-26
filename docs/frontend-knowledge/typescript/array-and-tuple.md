# 数组和元组

## 数组类型 array

在 TypeScript 中，数组类型有多种定义方式，比较灵活。

### 「类型 + 方括号」表示法

最简单的方法是使用「类型 + 方括号」来表示数组：

```typescript
let fibonacci: number[] = [1, 1, 2, 3, 5];
```

上述方法定义的数组中只能存放数字类型的元素，下面两种写法都会报错：

```typescript
let fibonacci: number[] = [1, '1', 2, 3, 5];

// error: Type 'string' is not assignable to type 'number'.
```

```typescript
let fibonacci: number[] = [1, 1, 2, 3, 5];
fibonacci.push('8');

// error: Argument of type '"8"' is not assignable to parameter of type 'number'.
```

### 数组泛型

我们也可以使用数组泛型（Array Generic） `Array<elemType>` 来表示数组：

```typescript
let fibonacci: Array<number> = [1, 1, 2, 3, 5];
```

关于泛型，后面的章节会专门介绍，这里了解一下即可。

### 声明时不指定类型

如果声明 Array 时不指定类型，那么会根据声明时使用的元素来初始化类型：

```typescript
let arr1 = [1, 2, 3, 4]; // 数组只支持数值类型的元素

let arr2 = [1, "a"];     // 数组只支持数值和字符串类型的元素
```

### any 指定任意类型

用 any 可以表示数组中允许出现任意类型的元素：

```typescript
let list: any[] = [1, 'a', true, { 'name': 'zhangsan' }];
```

## 元组类型 tuple

数组合并了相同类型的对象，而元组（tuple）合并了不同类型的对象。

定义一对值分别为 `string` 和 `number` 的元组：

```typescript
let person: [string, number] = ['zhangsan', 13];
```

当赋值或访问一个已知索引的元素时，会得到正确的类型：

```typescript
let person: [string, number];
person[0] = 'zhangsan';
person[1] = 13;

person[0].slice(1);
person[1].toFixed(2);
```

也可以只赋值其中一项：

```typescript
let person: [string, number];
person[0] = 'zhangsan';
```

但是当直接对元组类型的变量进行初始化或者赋值的时候，需要提供所有元组类型中指定的项。

```typescript
let person: [string, number];
person = ['zhangsan', 13];
```

```typescript
let person: [string, number];
person = ['zhangsan'];

// error: Property '1' is missing in type '[string]' but required in type '[string, number]'.
```

当添加越界的元素时，它的类型会被限制为元组中每个类型的联合类型（联合类型会在下一章介绍）：

```typescript
let person: [string, number];
person = ['zhangsan', 13];
person.push('male');
person.push(true);

// error: Argument of type 'true' is not assignable to parameter of type 'string | number'.
```

（完）
