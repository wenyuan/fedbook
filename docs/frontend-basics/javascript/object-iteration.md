# 对象遍历的几种方式

## for...in...

要使用 `(const i in obj)` 而不是 `(i in obj)`，因为后者将会创建一个全局变量。

```javascript
// Object 原型链上扩展的方法也会被遍历出来
Object.prototype.fun = () => {};
const obj = { name: 'zhangsan', age: 13 };
for (const i in obj) {
  console.log(i, ':', obj[i]);
} 
// name : zhangsan
// age : 13
// fun : () => {}
```

使用 `for...in...` 循环时，返回的是所有能够通过对象访问的、可枚举的属性，既包括存在于实例中的属性，也包括存在于原型中的实例。如果只需要获取对象的实例属性，可以使用 `hasOwnProperty` 进行过滤。

```javascript
// 不属于自身的属性将被 hasOwnProperty 过滤
Object.prototype.fun = () => {};
const obj = { name: 'zhangsan', age: 13 };
for (const i in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, i)) {
    console.log(i, ':', obj[i]);    
  }
}
// name : zhangsan
// age : 13
```

`for...in...` 的循环顺序，参考《JavaScript 权威指南（第7版）》6.6.1。

* 先列出名字为非负整数的字符串属性，按照数值顺序从最小到最大。这条规则意味着数组和类数组对象的属性会按照顺序被枚举。
* 在列出类数组索引的所有属性之后，在列出所有剩下的字符串名字（包括看起来像整负数或浮点数的名字）的属性。这些属性按照它们添加到对象的先后顺序列出。对于在对象字面量中定义的属性，按照他们在字面量中出现的顺序列出。
* 最后，名字为符号对象的属性按照它们添加到对象的先后顺序列出。

## Object.keys

用于获取对象自身所有的可枚举的属性值，但不包括原型中的属性，然后返回一个由**属性名**组成的数组。

```javascript
Object.prototype.fun = () => {};

const str = 'helloworld';
console.log(Object.keys(str));
// ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const arr = ['a', 'b', 'c'];
console.log(Object.keys(arr));
// ["0", "1", "2"]

const obj = { name: 'zhangsan', age: 13 };
console.log(Object.keys(obj));
// ["name", "age"]
```

## Object.values

用于获取对象自身所有的可枚举的属性值，但不包括原型中的属性，然后返回一个由**属性值**组成的数组。

```javascript
Object.prototype.fun = () => {};

const str = 'helloworld';
console.log(Object.values(str));
// ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"]

const arr = ['a', 'b', 'c'];
console.log(Object.values(arr));
// ["a", "b", "c"]

const obj = { name: 'zhangsan', age: 13 };
console.log(Object.values(obj));
// ["zhangsan", 13]
```

## Object.entries

用于获取对象自身所有的可枚举的属性值，但不包括原型中的属性，然后返回二维数组。每一个子数组由对象的属性名、属性值组成。

是一种可以同时拿到属性名与属性值的方法。

```javascript
const str = 'hello';
for (const [key, value] of Object.entries(str)) {    
  console.log(`${key}: ${value}`);
}
// 0: h
// 1: e
// 2: l
// 3: l
// 4: o

const arr = ['a', 'b', 'c'];
for (const [key, value] of Object.entries(arr)) {    
  console.log(`${key}: ${value}`);
}
// 0: a
// 1: b
// 2: c

const obj = { name: 'zhangsan', age: 13 };
for (const [key, value] of Object.entries(obj)) {    
  console.log(`${key}: ${value}`);
}
// name: zhangsan
// age: 13
```

## Object.getOwnPropertyNames

用于获取对象自身所有的可枚举的属性值（不包括 Symbol 值作为名称的属性），但不包括原型中的属性，然后返回一个由**属性名**组成的数组。

```javascript
Object.prototype.fun = () => {};
Array.prototype.fun = () => {};

const str = 'hello'
console.log(Object.getOwnPropertyNames(str));
// ["0", "1", "2", "3", "4", "length"]

const arr = ['a', 'b', 'c'];
console.log(Object.getOwnPropertyNames(arr));
// ["0", "1", "2", "length"]

const obj = { name: 'zhangsan', age: 13 };
const symbol1 = Symbol('symbol1')
const symbol2 = Symbol('symbol2')
obj[symbol1] = 'hello'
obj[symbol2] = 'world'
console.log(Object.getOwnPropertyNames(obj));
// ["name", "age"]
```

## Object.getOwnPropertySymbols()

用于获取指定对象的所有 Symbol 属性名。该方法返回一个数组，成员是当前对象的所有用作属性名的 Symbol 值。

```javascript
const obj = { name: 'zhangsan', age: 13 };
const symbol1 = Symbol('symbol1')
const symbol2 = Symbol('symbol2')
obj[symbol1] = 'hello'
obj[symbol2] = 'world'
console.log(Object.getOwnPropertySymbols(obj));
// [Symbol(symbol1), Symbol(symbol2)]
```

## Reflect.ownKeys()

返回一个数组，包含对象自身的所有属性，不管是属性名是 Symbol 或字符串，也不管是否可枚举。

```javascript
const obj = { name: 'zhangsan', age: 13 };
const symbol1 = Symbol('symbol1')
const symbol2 = Symbol('symbol2')
obj[symbol1] = 'hello'
obj[symbol2] = 'world'
console.log(Reflect.ownKeys(obj));
// ["name", "age", Symbol(symbol1), Symbol(symbol2)]
```

（完）
