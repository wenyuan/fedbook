# 类型守卫

类型守卫是一种机制，在参数、值的类型是联合类型或枚举类型的时候，它通过触发类型缩小，来确保本次传入的参数、值在允许类型的范围内，并且根据具体的类型进行不同的业务处理。

## 如何区分联合类型

使用类型守卫来区分联合类型的不同成员时，常用的类型守卫包括 `switch`、字面量恒等、`typeof`、`instanceof`、`in` 和自定义类型守卫这几种。

### switch

通过 `switch` 类型守卫来处理联合类型中成员或者成员属性可枚举的场景，即字面量值的集合，如下所示：

```typescript
const convert = (c: 'a' | 1) => {
  switch (c) {
    case 1:
      return c.toFixed(); // c is 1
    case 'a':
      return c.toLowerCase(); // c is 'a'
  }
}
```

### 字面量恒等

`switch` 适用的场景往往也可以直接使用字面量恒等比较进行替换，如下所示：

```typescript
const convert = (c: 'a' | 1) => {
  if (c === 1) {
    return c.toFixed(); // c is 1
  } else if (c === 'a') {
    return c.toLowerCase(); // c is 'a'
  }
}
```

建议：一般来说，如果可枚举的值和条件分支越多，那么使用 `switch` 就会让代码逻辑更简洁、更清晰；反之，则推荐使用字面量恒等进行判断。

### typeof

当联合类型的成员不可枚举，比如说是字符串、数字等原子类型组成的集合，这个时候就需要使用 `typeof`。

```typescript
const convert = (c: 'a' | 1) => {
  if (typeof c === 'number') {
    return c.toFixed(); // c is 1
  } else if (typeof c === 'string') {
    return c.toLowerCase(); // c is 'a'
  }
}
```

`typeof` 类型保护只支持两种形式：typeof x === typename 和 typeof v !== typename，其中 typename 必须是 `"number"`，`"string"`，`"boolean"` 或 `"symbol"`。

但是 TypeScript 并不会阻止你与其它字符串比较，语言不会把那些表达式识别为类型保护。

### instanceof

联合类型的成员还可以是类，此时就需要使用 `instanceof` 来判断具体属于哪个类，如下所示：

```typescript
class Dog {
  wang = 'wangwang';
}
class Cat {
  miao = 'miaomiao';
}
const getName = (animal: Dog | Cat) => {
  if (animal instanceof Dog) {
    return animal.wang;
  } else if (animal instanceof Cat) {
    return animal.miao;
  }
}
```

### in

当联合类型的成员包含接口类型（对象），并且接口之间的属性不同，我们就不能直接通过 `.` 操作符获取属性来判断：

```typescript
interface Dog {
  wang: string;
}
interface Cat {
  miao: string;
}
const getName = (animal: Dog | Cat) => {
  if (typeof animal.wang == 'string') { // ts(2339)
   return animal.wang; // ts(2339)
  } else if (animal.miao) { // ts(2339)
   return animal.miao; // ts(2339)
  }
}
```

而是需要使用 `in` 操作符：

```typescript
interface Dog {
  wang: string;
}
interface Cat {
  miao: string;
}
const getName = (animal: Dog | Cat) => {
  if ('wang' in animal) { // ok
    return animal.wang; // ok
  } else if ('miao' in animal) { // ok
    return animal.miao; // ok
  }
}
```

### 自定义类型守卫

自定义类型守卫，确切地讲是自定义函数，需要用到类型谓词 `is`。

比如封装一个 `isDog` 函数来区分 `Dog` 和 `Cat`，如下代码所示：

```typescript
const isDog = function (animal: Dog | Cat): animal is Dog {
  return 'wang' in animal;
}
const getName = (animal: Dog | Cat) => {
  if (isDog(animal)) {
    return animal.wang;
  }
}
```

`isDog` 将 `animal` 的类型缩小为 `Dog`，这样就可以直接获取 `wang` 属性，而不会提示一个 ts(2339) 的错误了。

## 如何区分枚举类型

首先枚举类型有以下特性：

* 特性 1：枚举和其他任何枚举、类型都不可比较，除了数字枚举可以与数字类型比较之外。
* 特性 2：数字枚举极其不稳定（枚举默认的值自递增，给部分数字类型的枚举成员显式指定数值，容易出现逻辑错误）。

这就可以得出一个结论：最佳实践时，我们永远不要拿枚举和除了自身之外的任何枚举、类型进行比较。

```typescript
enum A {
  one,
  two
}
enum B {
  one,
  two
}
const cpWithNumber = (param: A) => {
  if (param === 1) { // bad
    return param;
  }
}
const cpWithOtherEnum = (param: A) => {
  if (param === B.two as unknown as A) { // ALERT bad
    return param;
  }
}
const cpWithSelf = (param: A) => {
  if (param === A.two) { // good
    return param;
  }
}
```

上述代码中：

* `cpWithNumber` 函数里将类型是枚举 `A` 的入参 `param` 和数字字面量 `1` 进行比较，因为数字枚举不稳定，默认情况下 `A.two` 为真，但如果给枚举 `A` 的成员 `one` 指定初始值 `1`，结果就又不一样了。
* `cpWithOtherEnum` 函数里使用了双重类型断言将枚举类型 `B` 转换为 `A`，主要是为了避免出现一个 ts(2367) 错误。但一旦 `A` 和 `B` 的结构出现了任何差异（比如给成员指定了不同的初始值、改变了成员的顺序或者个数），都会导致这一行的条件判断逻辑真假不固定。
* `cpWithSelf` 函数中是最安全的区分枚举成员的判断方式。

> 通常情况下，A 不能直接断言成 B，就需要用到双重断言。

## 失效的类型守卫

失效的类型守卫指的是某些类型守卫应用在泛型函数中时不能缩小类型，即失效了。比如我们改造了一个可以接受泛型入参的 `getName` 函数，如下代码所示：

```typescript
const getName = <T extends Dog | Cat>(animal: T) => {
  if ('wang' in animal) {
    return animal.wang; // ts(2339)
  }
  return animal.miao; // ts(2339)
};
```

上面的代码中虽然使用了 `in` 类型守卫，但是它并没有让 `animal` 的类型如预期那样缩小为 `Dog` 的子类型，所以无法准确判断出 `T` 类型上没有 `wang` 属性，提示了一个 ts(2339) 的错误。后来的判断也就会跟着出错，从而也会提示一个 ts(2339) 的错误。

可一旦我们把 `in` 操作换成自定义类型守卫 `isDog` 或者使用 `instanceOf`，`animal` 的类型就会缩小成了 `Dog` 的子类型（T & Dog），就不会出错了。由此可见，`in` 和 `instanceOf`、类型谓词在泛型类型缩小上是有区别的。

需要注意，TypeScript 4.3.2 版本以前的 `else` 分支无法把 `animal` 的类型缩小成 `Cat` 的子类型，所以这个分支依旧会报错，需要使用类型断言来把 `animal` 的类型断言为 `Cat`，并获取了它的 `miao` 属性，最终代码如下所示：

```typescript
const getName = <T extends Dog | Cat>(animal: T) => {
  if (isDog(animal)) { // instanceOf 亦可
    return animal.wang; // ok
  }
  return (animal as Cat).miao; // 类型断言
};
```

（完）
