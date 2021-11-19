# 对象类型：接口

在 TypeScript 中，我们使用接口（Interface）来定义对象的类型。

## 什么是接口

在面向对象语言中，接口（Interface）是一个很重要的概念，它是对行为的抽象，而具体如何行动需要由类（class）去实现（implement）。

TypeScript 中的接口是一个非常灵活的概念，除了可用于对类的一部分行为进行抽象以外，也常用于对「对象的形状（Shape）」进行描述。

## 简单的例子

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

## 可选属性

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

## 任意属性

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

## 只读属性

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

（完）
