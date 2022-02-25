# BigInt

## 介绍

在 ES11 增加了新的原始数据类型：BigInt，表示一个任意精度的整数，可以表示超长数据，可以超出 2 的 53 次方。

JS 中 Number 类型只能安全的表示 -(2^53-1) 至 2^53-1 范围的值

```javascript
console.log(2 ** 53)                 // es7 幂运算符
console.log(Number.MAX_SAFE_INTEGER) // 最大值 - 1
```

使用 BigInt 有两种方式：

### 方式一：数字后面增加 n

```javascript
const bigInt = 9007199254740993n
console.log(bigInt)
console.log(typeof bigInt) // bigint

console.log(1n == 1)  // true
console.log(1n === 1) // false
```

### 方式二：使用 BigInt 函数

```javascript
const bigIntNum = BigInt(9007199254740993n)
console.log(bigIntNum)
```

## 参考资料

* [BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

（完）
