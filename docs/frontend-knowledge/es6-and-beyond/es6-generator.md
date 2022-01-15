# Generator

Generators 是可以用来控制迭代器的函数。它们可以暂停，然后在任何时候恢复。

常规循环：

```javascript
for (let i = 0; i < 5; i += 1) {
  console.log(i)
}
// 立即依次打印出: 0, 1, 2, 3, 4 
```

利用 Generator：

```javascript
function* generatorForLoop() {
  for (let i = 0; i < 5; i += 1) {
    yield console.log(i)
  }
}

const genForLoop = generatorForLoop()

console.log(genForLoop.next()) // 0
console.log(genForLoop.next()) // 1
console.log(genForLoop.next()) // 2
console.log(genForLoop.next()) // 3
console.log(genForLoop.next()) // 4
console.log(genForLoop.next()) // undefined
```

常规的循环只能一次遍历完所有值，Generator 可以通过调用 `next()` 方法拿到依次遍历的值，让遍历的执行变得「可控」。

## 基本语法

### 定义

```javascript
function* gen() {
  yield 1
  yield 2
  yield 3
  return 4
}

let g = gen()
g.next() // {value: 1, done: false}
g.next() // {value: 2, done: false}
g.next() // {value: 3, done: false}
g.next() // {value: 4, done: true}
g.next() // {value: undefined, done: true}
```

这个是 Generator 的定义方法，有几个点值得注意：

* 比普通函数多一个 `*`
* 函数内部用 `yield` 来控制程序的执行的「暂停」
* 函数的返回值通过调用 `next()` 来「恢复」程序执行

::: warning
Generator 函数的定义不能使用箭头函数，否则会触发 SyntaxError 错误
:::

```javascript
let generator = * () => {} // Uncaught SyntaxError: Unexpected token '*'
let generator = () * => {} // Uncaught SyntaxError: Unexpected token ')'
let generator = ( * ) => {} // Uncaught SyntaxError: Unexpected token '*'
```

### yield 表达式

> yield 关键字用来暂停和恢复一个生成器函数

关于 yield 表达式，要熟记几个知识点：

* yield 表达式的返回值是 `undefined`，但是遍历器对象的 `next()` 方法可以修改这个默认值。

```javascript
function* gen() {
  let val
  val = yield 1
  console.log( `1:${val}` ) // 1:undefined
  val = yield 2
  console.log( `2:${val}` ) // 2:undefined
  val = yield 3
  console.log( `3:${val}` ) // 3:undefined
}

let g = gen()

console.log(g.next()) // {value: 1, done: false}
console.log(g.next()) // {value: 2, done: false}
console.log(g.next()) // {value: 3, done: false}
console.log(g.next()) // {value: undefined, done: true}
```

* `yield*` 是委托给另一个遍历器对象或者可遍历对象