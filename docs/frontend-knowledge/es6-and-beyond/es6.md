# ECMAScript2015(ES6)

## let 和 const

这两个关键字是 ES6 新增的声明变量方式，与 `var` 的区别：

* `var` 有变量提升，有初始化提升，值可变。允许重复声明。
* `let` 不存在变量提升，值可变。不允许重复声明。
* `const` 不存在变量提升，值不可变，但如果是定义对象，则属性可变。不允许重复声明。

### let

`let` 声明的变量拥有块级作用域：

```javascript
for(var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  })
}
// 5 5 5 5 5


for(let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  })
}
// 0 1 2 3 4
```

暂时性死区：

* 对于 `let`，变量的调用不能先于声明的。
* ES6 明确规定，如果区块中存在 `let` 和 `const` 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错（该区域不受外部影响，哪怕外部声明过同名变量）。

```javascript
var a = 5;
if (true) {
  a = 6;
  let a;
}
// ReferenceError: Cannot access 'a' before initialization
```

隐蔽的暂时性死区：

* ES6 允许为函数参数设置默认值，即直接在形参后面通过 `=` 指定默认值。
* 按照[阮一峰老师书中的描述](https://es6.ruanyifeng.com/#docs/function#作用域)：一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域。等到初始化结束，这个作用域就会消失。
* 所以我姑且认为在这个临时的作用域里，参数具有跟 `let`、`const` 一样的特性。

```javascript
var a =1;
function foo(b = a, a = 2) {
  console.log(a, b);
}
foo()
// ReferenceError: Cannot access 'a' before initialization
```