# 新的逻辑操作符

新特性结合了逻辑运算符（`&&`，`||`，`??`）和赋值表达式：

## 逻辑与赋值

逻辑与赋值运算符（`x &&= y`）仅在 `x` 为[真值](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy)（在 Boolean 上下文中认定为 `true` 的值）时赋值。

```javascript
x &&= y
//等价于
x = x && (x = y)
```

## 逻辑或赋值

逻辑或赋值运算符（`x ||= y`）仅在 `x` 为[虚值](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)（在 Boolean 上下文中认定为 `false` 的值）时赋值。

```javascript
x ||= y
//等价于
x = x || (x = y)
```

## 逻辑空赋值

逻辑空赋值运算符（`x ??= y`）仅在 `x` 是 nullish（`null` 或 `undefined`）时对其赋值。

```javascript
x ??= y
//等价于
x = x ?? (x = y)
```

## 参考资料

* [逻辑与赋值（`&&=`）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_AND_assignment)
* [逻辑或赋值（`||=`）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment)
* [逻辑空赋值（`??=`）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment)

（完）
