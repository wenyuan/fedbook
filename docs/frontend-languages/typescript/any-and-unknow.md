# 任意类型与未知类型

## 任意类型 any

任意类型使用 `any` 关键字来定义，表示允许赋值为任意类型。

### 什么是任意值类型

如果是一个普通类型，在赋值过程中改变类型是不被允许的：

```typescript
let myFavoriteNumber: string = 'seven';
myFavoriteNumber = 7;

// error: Type 'number' is not assignable to type 'string'.
```

但如果是 `any` 类型，则允许被赋值为任意类型。

```typescript
let myFavoriteNumber: any = 'seven';
myFavoriteNumber = 7;
```

### 任意值的属性和方法

在任意值上访问任何属性都是允许的：

```typescript
let anyThing: any = 'hello';
console.log(anyThing.myName);
console.log(anyThing.myName.firstName);
```

也允许调用任何方法：

```typescript
let anyThing: any = 'Tom';
anyThing.setName('Jerry');
anyThing.setName('Jerry').sayHello();
anyThing.myName.setFirstName('Cat');
```

可以认为，**声明一个变量为任意值之后，对它的任何操作，返回的内容的类型都是任意值**。

### 未声明类型的变量

**变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型**：

```typescript
let something;
something = 'seven';
something = 7;

something.setName('Tom');
```

等价于

```typescript
let something: any;
something = 'seven';
something = 7;

something.setName('Tom');
```

## 未知类型 unknow

前面讲过，`any` 类型具有很大的灵活性，它可以让变量等于任何类型的值，甚至能以函数的形式调用它，或者调用它的属性和方法：

```typescript
let randomValue: any = 666;
randomValue = true;
randomValue = 'hello world';
randomValue = {};
randomValue();
randomValue.toUpperCase();
```

上述代码编译时不会报错，但在运行时会报错：`TypeError: randomValue is not a function`。

相反，`unknown` 类型虽然同样不保证类型，但可以保证类型安全。什么意思呢？在使用 `unknown` 变量的时候，需要做一定程度判断和类型转换，当确定变量类型后，才能正常使用。

将上述代码的 `any` 修改为 `known` 后，编辑器直接给出了错误反馈，此时编译也是不通过的：

```typescript
let randomValue: unknown = 666;
randomValue = true;
randomValue = 'hello world';
randomValue = {};
randomValue();
randomValue.toUpperCase();

// error: This expression is not callable.
//   Type '{}' has no call signatures.ts(2349)

// error: Property 'toUpperCase' does not exist on type 'unknown'.ts(2339)
```

此时应该修改代码如下：

```typescript
let randomValue: unknown = 666;
randomValue = true;
randomValue = 'hello world';
randomValue = {};

if (typeof randomValue === 'function') {
  randomValue();
}

if (typeof randomValue === 'string') {
  randomValue.toUpperCase();
}
```

## 总结

使用 ``any`` 适合代码的快速成型，但会遗留下安全隐患；使用 `unknown` 可以保证类型的安全。在实际使用中可以根据具体情况进行选择。

（完）
