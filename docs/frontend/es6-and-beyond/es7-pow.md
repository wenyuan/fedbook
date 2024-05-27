# 幂运算符

## ES7 以前求幂运算

* 自己封装函数

```javascript
function pow(x, y) {
  let res = 1
  for (let i = 0; i < y; i++) {
    res *= x
  }
  return res
}

pow(2, 10)
// 1024
```

* 使用 `Math.pow()`

> Math.pow() 函数返回基数（base）的指数（exponent）次幂。

```javascript
console.log(Math.pow(2, 10)) // 1024
```

## ES7 新方法

求幂运算符（`**`）返回将第一个操作数加到第二个操作数的幂的结果。它等效于 `Math.pow()`，不同之处在于它也接受 BigInt 作为操作数。

```javascript
console.log(2 ** 10) // 1024
```

（完）
