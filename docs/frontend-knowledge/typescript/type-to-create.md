# 类型创建

所谓类型创建，就是基于前面介绍的已有类型，创建出新的类型，包括类型别名、交叉类型、索引类型与映射类型。

## 类型别名

类型别名的作用主要是对一组类型或一个特定类型结构进行封装，以便于在其它地方进行复用。

语法是使用 `type` 关键字，例如：

```typescript
type StatusCode = 200 | 301 | 400 | 500 | 502;

const status: StatusCode = 502;
```

## 联合类型与交叉类型

联合类型的符号是 `|`，它代表了「或」，即只需要符合其中的一个类型，就可以认为实现了这个联合类型，例如：

```typescript
let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
myFavoriteNumber = 7;
```

交叉类型的符号是 `&`，它代表了「与」，即需要符合这里的所有类型，才可以说实现了这个交叉类型，例如：

```typescript
interface NameStruct {
  name: string;
}

interface AgeStruct {
  age: number;
}

type ProfileStruct = NameStruct & AgeStruct;

const profile: ProfileStruct = {
  name: "张三",
  age: 13
}
```

上面是对于对象类型的合并，如果是对原始类型进行合并，就会变成 `never`，因为会造出一个根本不存在的类型：

```typescript
// 世界上不存在既是 string 又是 number 的类型，所以是 never
type StrAndNum = string & number;
```

## 索引类型

索引类型指的不是某一个特定的类型工具，它包含三个部分：索引签名类型、索引类型查询与索引类型访问。这三者都是独立的类型工具，唯一共同点是它们都通过索引的形式来进行类型操作。但索引签名类型是声明，后两者则是读取。

### 索引签名类型

索引签名类型，主要指的是在接口或类型别名中，通过以下语法来**快速声明一个键值类型一致的类型结构**：

```typescript
// 用在接口中
interface AllStringTypes {
  [key: string]: string;
}

// 用在类型别名中
type AllStringTypes = {
  [key: string]: string;
}
```

这时即使还没声明具体的属性，也意味着在实现这个类型结构的变量中**只能声明字符串类型的键**：

```typescript
interface AllStringTypes {
  [key: string]: string;
}

const foo: AllStringTypes = {
  "name": "张三"
}
```

### 索引类型查询

索引类型查询，可以通过 `keyof` 操作符，将对象中的所有键转换为对应字面量类型，然后再组合成联合类型。

```typescript
interface Foo {
  name: string,
  age: number,
  123: 13
}

type FooKeys = keyof Foo; // "name" | "age" | 123

const tmp: FooKeys = 123  // tmp 的值只能是 "name"、"age"、123 中的一个
```

`keyof` 的产物必定是一个联合类型，而 `keyof any` 产生的联合类型，是由所有可用作对象键值的类型组成的，即 `string | number | symbol`。

### 索引类型访问

在 JavaScript 中我们可以通过 `obj[expression]` 的方式来动态访问一个对象属性，其中 expression 表达式会先被执行，然后使用返回值来访问属性。

在 TypeScript 中也可以通过类似的方式，只不过这里的 expression 要换成类型：

```typescript
interface Foo {
    propA: number;
    propB: boolean;
}

type PropAType = Foo['propA']; // number
type PropBType = Foo['propB']; // boolean
```

要注意其访问方式与返回值均是类型。上面代码中的 `'propA'` 和 `'propB'` 都是字符串字面量类型，而不是一个 JavaScript 字符串值。

索引类型查询的本质其实就是，通过键的字面量类型（`'propA'`）访问这个键对应的键值类型（`number`）。

## 映射类型

映射类型的主要作用是基于键名，映射到键值类型。概念不好理解，直接看例子：
