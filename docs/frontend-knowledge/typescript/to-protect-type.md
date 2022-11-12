# 类型保护

所谓类型保护，就是在编写 TS 代码时通过一些语法来进一步地提升类型安全性。其中需要用到的就是类型查询操作符 `typeof` 和类型守卫。

## 类型查询操作符

TypeScript 中的 `typeof` 操作符有两种不同的功能：

* JS 中，用于检查变量类型，返回：`"string"` / `"number"` / `"object"` / `"undefined"` 等值。
* TS 中，用于类型查询（且一般用在类型标注中），返回的是一个 TypeScript 类型：
  ```typescript
  const str = "apple";
  type Str = typeof str; // "apple"

  const aaa:Str = 'apple';  // √
  const bbb:Str = 'banana'; // error
  ```

绝大部分情况下，TS 中 `typeof` 返回的类型就是把鼠标悬浮在变量名上时出现的推导后的类型，并且是最窄的推导程度（即到字面量类型的级别）。

要区分这个操作符号到底表达了什么意思，只需记住：

* 在逻辑代码中使用的 `typeof` 一定会是 JavaScript 中的 `typeof`。
* 在类型代码（如类型标注、类型别名等）中的一定是类型查询的 `typeof`。
* 为了更好地避免混用的情况，也就是隔离类型层和逻辑层，类型查询操作符后是不允许使用表达式的：
  ```typescript
  const isInputValid = (input: string) => {
    return input.length > 10;
  }

  // 不允许表达式
  let isValid: typeof isInputValid("apple");
  ```

## 类型守卫

### 产生背景

TypeScript 做不到像别的语言那样「跨函数上下文来进行类型的信息收集，从而实现类型推导」。

举个现实的例子，下面左边代码是没问题的，但右边代码把 if 条件中的表达式提取出来后就报错了：

<div style="text-align: center;">
  <img src="./assets/ts-type-derived-across-context.png" alt="TS 无法跨函数上下文来类型推导">
  <p style="text-align: center; color: #888;">（TS 无法跨函数上下文来类型推导）</p>
</div>

将判断逻辑封装起来提取到函数外部进行复用非常常见，所以为了解决这个不足，TypeScript 引入了 `is` 关键字来显式地提供类型信息。

上面的代码这样改就可以了：

```typescript {1}
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function foo(value: string | number) {
  if (isString(value)) {
    value.replace("2021", "2022")
  }
  if (typeof value === 'number') {
    // ...
  }
}
```

关键在于第一行：`isString` 函数称为类型守卫，它的返回值不再使用 `boolean` 作为类型标注，而是使用 `value is string` 这么个东西。

其中：

* `value` 是函数的某个参数。
* `is string` 即 `is 关键字 + 预期类型`，如果这个函数成功返回为 `true`，那么 `is` 关键字前这个入参的类型，就会被调用这个类型守卫的函数后续逻辑收集到。

在类型守卫中，除了使用 `typeof` 操作符，还有一些类似的方式来进行类型保护，比如 `in` 和 `instanceof`。

### 类型断言守卫

除了使用 `is` 关键字的类型守卫以外，其实还存在使用 `asserts` 关键字（NodeJs 的 assert 模块）的类型断言守卫。

```javascript
import assert from 'assert';

let name: any = 'apple';

assert(typeof name === 'number');

// number 类型
name.toFixed();
```

上述代码中，如果 `assert` 接收到的表达式执行结果为 `false`，即**断言不成立**，那么代码在运行到这里时会抛出一个错误，而在断言下方的代码就执行不到了。

反之，如果断言通过了，不管你最开始是什么类型，断言后的代码中就一定是符合断言的类型，比如在这里就是 `number`。

**断言守卫和类型守卫最大的不同点在于，在判断条件不通过时，断言守卫需要抛出一个错误，类型守卫只需要剔除掉预期的类型**。 

TypeScript 3.7 版本专门引入了 `asserts` 关键字来进行断言场景下的类型守卫，比如前面 `assert` 方法的签名可以是这样的：

```typescript
function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
```

上述代码中的 `asserts condition`，其 `condition` 来自于实际逻辑。相当于在返回值类型中使用一个逻辑表达式进行了类型标注。

举例来说，对于 `assert(typeof name === 'number');` 这么一个断言，如果函数成功返回，就说明其后续的代码中 condition 均成立，也就是 `name` 神奇地变成了一个 `number` 类型。

这里的 condition 甚至还可以结合使用 `is` 关键字来提供进一步的类型守卫能力：

```typescript
let name: any = 'apple';

function assertIsNumber(val: any): asserts val is number {
  if (typeof val !== 'number') {
    throw new Error('Not a number!');
  }
}

assertIsNumber(name);

// number 类型！
name.toFixed();
```

在这种情况下，无需再为断言守卫传入一个表达式，而是可以将这个判断用的表达式放进断言守卫的内部，来获得更独立的代码逻辑。

（完）
