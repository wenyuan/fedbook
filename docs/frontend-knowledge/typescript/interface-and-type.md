# 接口类型与类型别名

前面的 TypeScript 基础类型、函数类型和类类型，在 JavaScript 中都有对应的语法。而接口类型与类型别名是 TS 新增的特性，它们能用于描述较为复杂的数据结构，就像代码的文档和注释一样。

## Interface 接口类型

### 介绍

在面向对象语言中，接口（Interface）是一个很重要的概念，它是对行为的抽象，而具体如何行动需要由类（class）去实现（implement）。

TypeScript 中的接口是一个非常灵活的概念，除了可用于对类的一部分行为进行抽象以外，也常用于对「对象的形状（Shape）」进行描述。

### 简单的例子

```typescript
interface Person {
  name: string;
  age: number;
}

let p1: Person = {
  name: 'p1',
  age: 13
};
```

上面的例子中，我们定义了一个接口 `Person`，接着定义了一个变量 `p1`，它的类型是 `Person`。这样，我们就约束了 `p1` 的形状必须和接口 `Person` 一致。

接口一般首字母大写。有的编程语言中会建议接口的名称加上 `I` 前缀。

定义的变量比接口少了一些属性是不允许的：

```typescript
interface Person {
  name: string;
  age: number;
}
  
let p1: Person = {
  name: 'p1'
};

// error: Property 'age' is missing in type '{ name: string; }' but required in type 'Person'.
```

多一些属性也是不允许的：

```typescript
interface Person {
  name: string;
  age: number;
}
  
let p1: Person = {
  name: 'p1',
  age: 13,
  gender: 'male'
};

// error: Type '{ name: string; age: number; gender: string; }' is not assignable to type 'Person'.
//   Object literal may only specify known properties, and 'gender' does not exist in type 'Person'.
```

可见，**赋值的时候，变量的形状必须和接口的形状保持一致**。

### 可选属性

有时我们希望不要完全匹配一个形状，那么可以用可选属性：

```typescript
interface Person {
  name: string;
  age?: number;
}

let p1: Person = {
  name: 'p1'
};
```

```typescript
interface Person {
  name: string;
  age?: number;
}

let p1: Person = {
  name: 'p1',
  age: 13
};
```

可选属性的含义是该属性可以不存在。

这时**仍然不允许添加未定义的属性**：

```typescript
interface Person {
  name: string;
  age?: number;
}

let p1: Person = {
  name: 'p1',
  age: 13,
  gender: 'male'
};

// error: Type '{ name: string; age: number; gender: string; }' is not assignable to type 'Person'.
//   Object literal may only specify known properties, and 'gender' does not exist in type 'Person'.
```

### 任意属性

有时候我们希望一个接口允许有任意的属性，可以使用如下方式：

```typescript
interface Person {
  name: string;
  age?: number;
  [propName: string]: any;
}

let p1: Person = {
  name: 'p1',
  gender: 'male'
};
```

使用 `[propName: string]` 定义了任意属性取 `string` 类型的值。

需要注意的是，**一旦定义了任意属性，那么确定属性和可选属性的类型都必须是它的类型的子集**：

```typescript
interface Person {
  name: string;
  age?: number;
  [propName: string]: string;
}

let p1: Person = {
  name: 'p1',
  age: 13,
  gender: 'male'
};

// error: Property 'age' of type 'number' is not assignable to string index type 'string'.
// error: Type '{ name: string; age: number; gender: string; }' is not assignable to type 'Person'.
//   Property 'age' is incompatible with index signature.
//     Type 'number' is not assignable to type 'string'.
```

上例中，任意属性的值允许是 `string`，但是可选属性 `age` 的值却是 `number`，`number` 不是 `string` 的子属性，所以报错了。

一个接口中只能定义一个任意属性。如果接口中有多个类型的属性，则可以在任意属性中使用联合类型：

```typescript
interface Person {
  name: string;
  age?: number;
  [propName: string]: string | number;
}

let p1: Person = {
  name: 'p1',
  age: 13,
  gender: 'male'
};
```

用联合类型改写后，现在代码就不报错了。

### 只读属性

有时候我们希望对象中的一些字段只能在创建的时候被赋值，那么可以用 `readonly` 定义只读属性：

```typescript
interface Person {
  readonly id: number;
  name: string;
  age?: number;
  [propName: string]: any;
}

let p1: Person = {
  id: 1,
  name: 'p1',
  gender: 'male'
};

p1.id = 2;

// error: Cannot assign to 'id' because it is a read-only property.
```

上例中，使用 `readonly` 定义的属性 `id` 初始化后，又被赋值了，所以报错了。

注意，**只读的约束存在于第一次给对象赋值的时候，而不是第一次给只读属性赋值的时候**：

```typescript
interface Person {
  readonly id: number;
  name: string;
  age?: number;
  [propName: string]: any;
}

let p1: Person = {
  name: 'p1',
  gender: 'male'
};

p1.id = 2;

// error: Property 'id' is missing in type '{ name: string; gender: string; }' but required in type 'Person'.
// error: Cannot assign to 'id' because it is a read-only property.
```

上例中，报错信息有两处，第一处是在对 `p1` 进行赋值的时候，没有给 `id` 赋值。

第二处是在给 `p1.id` 赋值的时候，由于它是只读属性，所以报错了。

## Type 类型别名

接口类型的一个作用是将内联类型抽离出来，从而实现类型可复用。其实，我们也可以使用类型别名接收抽离出来的内联类型实现复用。

此时，我们可以通过如下所示「`type` 别名名字 = 类型定义」的格式来定义类型别名。

```typescript
/* 类型别名 */
type LanguageType = {
  /* 以下是接口属性 */
  /* 姓名 */
  name: string; 
  /* 年龄 */
  age: () => number;
}
```

此外，针对接口类型无法覆盖的场景，比如组合类型、交叉类型，我们只能使用类型别名来接收，如下代码所示：

```typescript
/* 联合 */
type MixedType = string | number;
/* 交叉 */
type IntersectionType = { id: number; name: string; }
  & { age: number; name: string };
/* 提取接口属性类型 */
type AgeType = ProgramLanguage['age'];  
```

在上述代码中，我们定义了一个 IntersectionType 类型别名，表示两个匿名接口类型交叉出的类型；同时定义了一个 AgeType 类型别名，表示抽取的 ProgramLanguage age 属性的类型。

::: warning
类型别名，诚如其名，即我们仅仅是给类型取了一个新的名字，并不是创建了一个新的类型。
:::

## Interface 与 Type 的区别

在大多数的情况下使用接口类型和类型别名的效果等价，但是在某些特定的场景下这两者还是存在很大区别。比如，重复定义的接口类型，它的属性会叠加，这个特性使得我们可以极其方便地对全局变量、第三方库的类型做扩展，如下代码所示：

```typescript
interface Language {
  id: number;
}

interface Language {
  name: string;
}
let lang: Language = {
  id: 1, // ok
  name: 'name' // ok
}
```

在上述代码中，先后定义的两个 Language 接口属性被叠加在了一起，此时我们可以赋值给 lang 变量一个同时包含 id 和 name 属性的对象。

不过，如果我们重复定义类型别名，如下代码所示，则会提示一个 ts(2300) 错误。

```typescript
/* ts(2300) 重复的标志 */
type Language = {
  id: number;
}

/* ts(2300) 重复的标志 */
type Language = {
  name: string;
}
let lang: Language = {
  id: 1,
  name: 'name'
}
```

在上述代码中，我们重复定义了一个类型别名 Language ，此时就提示了一个错误。

（完）
