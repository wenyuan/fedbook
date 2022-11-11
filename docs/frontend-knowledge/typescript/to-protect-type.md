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
