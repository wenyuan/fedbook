# let 和 const

## 前言

这两个关键字是 ES6 新增的声明变量方式，与 `var` 的区别：

* `var` 有变量提升，值可变。允许重复声明。
* `let` 不存在变量提升，值可变。不允许重复声明。
* `const` 不存在变量提升，值不可变，但如果是定义对象，则属性可变。不允许重复声明。

## let

### 全局声明时不是全局对象的属性

`let` 声明的全局变量不是全局对象 `window` 的属性，不可以通过 `window.变量名` 的方式访问这些变量。

```javascript
var a = 5
console.log(window.a) // 5

let b = 5
console.log(window.b) // undefined
```

### 拥有块级作用域

`let` 声明的变量拥有**块级作用域**。

* 场景一：防止内层变量覆盖外层变量。
* 场景二：防止用来计数的循环变量在循环结束后泄露为全局变量。

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

### 暂时性死区

* 对于 `let`，不存在变量提升，所以变量的调用不能先于声明。
* ES6 明确规定，如果区块中存在 `let` 和 `const` 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错（该区域不受外部影响，哪怕外部声明过同名变量）。

```javascript
var a = 5;
if (true) {
  a = 6;
  let a;
}
// ReferenceError: Cannot access 'a' before initialization
```

### 隐蔽的暂时性死区

* ES6 允许为函数参数设置默认值，即直接在形参后面通过 `=` 指定默认值。
* 按照[阮一峰老师书中的描述](https://es6.ruanyifeng.com/#docs/function#作用域)：一旦设置了参数的默认值，函数进行声明初始化时，参数会形成一个单独的作用域。等到初始化结束，这个作用域就会消失。
* 我的理解是在这个临时作用域里，参数具有跟 `let`、`const` 一样的特性（这条结论没能找到比较权威的出处）。

```javascript
var a =1;
function foo(b = a, a = 2) {
  console.log(a, b);
}
foo()
// ReferenceError: Cannot access 'a' before initialization
```

## const

和 `let` 一样，具有**块级作用域**，**不会变量提升**，有**暂时性死区**。

`const` 定义的是常量，**值不能被改变**：

* `const` 声明的变量必须进行初始化。
* `const` 实际上保证的并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。因此它定义的对象的属性可变。
* 让对象或者数组这种引用数据类型也不被改变，需要使用 `Object.freeze(obj)`（浅层冻结，将最近一层的对象进行冻结）。

## 参考资料

* [let 和 const 命令](https://es6.ruanyifeng.com/#docs/let)

（完）
