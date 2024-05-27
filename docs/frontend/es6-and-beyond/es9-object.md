# Object 扩展

ES6 支持了 Function 的 Rest 参数和扩展运算符和 ，而 ES9 给 Object 也赋予了这两个特性。

## Rest 参数

当对象 key-value 不确定的时候，把必选的 key 赋值给一个变量，用另一个变量收敛其他可选的 key 数据，这在之前是做不到的。

```javascript
const input = {
  a: 1,
  b: 2,
  c: 3
}

let { a, ...rest } = input

console.log(a, rest) // 1 {b: 2, c: 3}
```

## 扩展运算符

可以把 `input` 对象的数据都拓展到 `output` 对象，这个功能很实用。

```javascript
const input = {
  a: 1,
  b: 2
}

const output = {
  ...input,
  c: 3
}

console.log(output) // {a: 1, b: 2, c: 3}
```

（完）
