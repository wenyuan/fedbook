# 空值合并运算符

空值合并运算符（`??`）是一个逻辑运算符。当左侧操作数为 `null` 或 `undefined` 时，其返回右侧的操作数。否则返回左侧的操作数。

当我们查询某个属性时，经常会遇到，如果没有该属性就会设置一个默认的值。

```javascript
const b = 0 // 或者 null undefined false
const a = b || 5
console.log(a)
```

空值合并运算符 `??` 我们仅在第一项为 `null` 或 `undefined` 时设置默认值。

```javascript
// false 0  无效
const a = b ?? 123
console.log(a)
```

## 参考资料

* [空值合并运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)

（完）
