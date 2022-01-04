# Function 扩展

## 默认参数

在 ES5 中函数如果需要支持默认参数，需要这么写：

```javascript
function foo(x, y) {
  y = y || 'world'
  console.log(x, y)
}
foo('hello', 'javascript')
foo('hello', 0)
```

ES6 中改变了这种繁琐的写法，现在可以这么写：

```javascript
function foo(x, y = 'world') {
  console.log(x, y)
}
foo('hello', 0)
```

## Rest 参数

以求和运算为例，ES5 中处理不定参数是借助 `arguments` 来做的：

```javascript
function sum() {
  let num = 0
  Array.prototype.forEach.call(arguments, function(item) {
    num += item * 1
  })
  return num
}

console.log(sum(1, 2, 3, 4)) // 10
```

ES6 引入 Rest 参数（形式为 `...变量名`），用于获取函数的多余参数，这样就不需要使用 `arguments` 对象了。

```javascript
function sum(...nums) {
  let num = 0
  nums.forEach(function(item) {
    num += item * 1
  })
  return num
}

console.log(sum(1, 2, 3, 4)) // 10
```

Rest 参数的强大之处：

* Rest 参数可以将确定的参数在传值时分离出来（此时 Rest 参数必须排在参数最后），而如果使用 `arguments` 需在函数内部进行分离操作。
* `arguments` 不是数组，所以不能直接使用数组的原生 API 如 `forEach`，而 Rest 参数是数组，可以直接使用数组的原生 API。

## 扩展运算符

扩展运算符和 Rest 参数是形似（都用符号 `...` 来表示）但相反意义的操作符。

Rest 参数是将不定的参数「收敛」到数组中，而扩展运算符是将固定的数组内容「打散」到参数里去。

Rest 参数与扩展运算符可以理解为互为逆运算。

## length 属性

函数指定了默认值以后，函数的 `length` 属性，将返回第一个默认参数前面的参数个数。

```javascript
function foo(x, y = 2, z = 3) {
  console.log(x, y)
}
console.log(foo.length) // 1
```

## name 属性

函数的 `name` 属性，返回该函数的函数名。

```javascript
function foo() {}

console.log(foo.name) // "foo"
```

## 箭头函数

### 参数和括号

如果只有一个参数，可以省略括号；如果大于一个参数或没有参数，一定要带括号。

```javascript
// 只有一个参数
let hello1 = name => {
  console.log('say hello', name)
}

// 没有参数
let hello2 = () => {
  console.log('say hello')
}

// 多个参数
let hello3 = (name, age) => {
  console.log('say hello', name, age)
}
```

### 返回值

如果返回值是表达式，可以省略 `return` 和 `{}`。

```javascript
let pow = x => x * x
```

如果返回值是字面量对象，一定要用小括号包起来。

```javascript
let person = (name) => ({
  age: 20,
  addr: 'Beijing City'
})
```

其他情况就中规中矩即可。

### this 指向

箭头函数中 `this` 指向**函数定义时**所在的**外层作用域**的 `this`，即包裹箭头函数的函数。

如果包裹箭头函数的，依旧是个箭头函数，则继续往外层找，直到 `window`（浏览器环境下非严格模式）或 `undefined`（严格模式）。

### 注意点

* 箭头函数不可以当作构造函数
* 箭头函数不可以使用 `arguments` 对象

## 参考资料

* [函数的扩展](https://es6.ruanyifeng.com/#docs/function)
* [箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
* [默认参数值](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Default_parameters)

（完）
