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

关于 `yield` 表达式，要熟记几个知识点：

* `yield` 表达式的返回值是 `undefined`，但是遍历器对象的 `next()` 方法可以修改这个默认值。

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

* `yield*` 表达式用于将值的生成过程委托给另一个生成器或可遍历对象。

```javascript {11}
// 如果在 Generator 函数内部, 调用另一个 Generator 函数
// 需要在前者的函数体内部, 自己手动完成遍历
function* g1() {
  yield 2
  yield 3
  yield 4
}

function* g2() {
  yield 1
  yield g1()
  yield 5
}

const iterator = g2()

console.log(iterator.next()) // {value: 1, done: false}
console.log(iterator.next()) // {value: g1, done: false}
console.log(iterator.next()) // {value: 5, done: false}
console.log(iterator.next()) // {value: undefined, done: true}
```

```javascript {11}
// 使用 yield* 表达式
// g1() yield 出去的每个值都会在 g2() 的 next() 方法中返回, 就像那些 yield 语句是写在 g2() 里一样
function* g1() {
  yield 2
  yield 3
  yield 4
}

function* g2() {
  yield 1
  yield* g1()
  yield 5
}

const iterator = g2()

console.log(iterator.next()) // {value: 1, done: false}
console.log(iterator.next()) // {value: 2, done: false}
console.log(iterator.next()) // {value: 3, done: false}
console.log(iterator.next()) // {value: 4, done: false}
console.log(iterator.next()) // {value: 5, done: false}
console.log(iterator.next()) // {value: undefined, done: true}
```

* Generator 对象的 `next()` 方法，遇到 `yield` 就暂停，并返回一个对象，这个对象包括两个属性：`value` 和 `done`。

### 方法

Generator 对象有几个方法，`next`、`return`、`throw`。

* next([value])
  * `next()` 方法可以获取每一次遍历的结果，返回的对象包含两个属性：`value`（当前程序的运行结果） 和 `done`（遍历是否结束）。
  * `next()` 方法可以接受参数，这个参数用于在 Generator 外部给内部传递数据，而这个参数就是作为 `yield` 的返回值。

```javascript
function* gen() {
  let val = 100
  while (true) {
    console.log( `before ${val}` )
    val = yield val
    console.log( `return ${val}` )
  }
}

let g = gen()
console.log(g.next(20).value)
// before 100
// 100
console.log(g.next(30).value)
// return 30
// before 30
// 30
console.log(g.next(40).value)
// return 40
// before 40
// 40
```

* return()

`return()` 方法可以让 Generator 遍历终止，有点类似 for 循环的 break。

```javascript
function* gen() {
  yield 1
  yield 2
  yield 3
}

let g = gen()

console.log(g.next())   // {value: 1, done: false}
console.log(g.return()) // {value: undefined, done: true}
console.log(g.next())   // {value: undefined, done: true}
```

`return()` 也可以传入参数，作为返回的 `value` 值。

```javascript
function* gen() {
  yield 1
  yield 2
  yield 3
}

let g = gen()

console.log(g.next())      // {value: 1, done: false}
console.log(g.return(100)) // {value: 100, done: true}
console.log(g.next())      // {value: undefined, done: true}
```

* throw()

可以通过 throw 方法在 Generator 外部控制内部执行的「终断」。

```javascript
function* gen() {
  while (true) {
    try {
      yield 42
    } catch (e) {
      console.log(e.message)
    }
  }
}

let g = gen()
console.log(g.next()) // { value: 42, done: false }
console.log(g.next()) // { value: 42, done: false }
console.log(g.next()) // { value: 42, done: false }
// 中断操作
g.throw(new Error('break'))

console.log(g.next()) // {value: undefined, done: true}
```

::: tip
如果想退出遍历 `catch` 之后可以配合 `return false` 使用，能起到 「break」 的作用
:::

## 应用场景

### 场景 1

使用 Generator，按顺序读取 a.json、b.json、c.json。

```javascript
function request(url) {
  ajax(url, res => {
    getData.next(res)
  })
}

function* gen() {
  let res1 = yield request('static/a.json')
  console.log(res1)
  let res2 = yield request('static/b.json')
  console.log(res2)
  let res3 = yield request('static/c.json')
  console.log(res3)
}

let getData = gen()
getData.next()
```

### 场景 2

酒桌小游戏敲7，无限循环转圈去数数，遇到 7 和 7 的倍数就敲桌子。只要调用 `n.next` 我们就可以知道下一个需要敲桌子的数字是什么了。

```javascript
function* count(x = 1) {
  while (true) {
    if (x % 7 === 0) {
      yield x
    }
    x++
  }
}
// ES5 中就是个死循环 因为 ES5 的循环需要有个终止值，当前这个需求没有终止，一直在数数
let n = count()
console.log(n.next().value)
console.log(n.next().value)
console.log(n.next().value)
console.log(n.next().value)
console.log(n.next().value)
console.log(n.next().value)
```

## 参考资料

* [Generator 函数的语法](https://es6.ruanyifeng.com/#docs/generator)
* [Generator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)
* [yield*](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/yield*)

（完）
