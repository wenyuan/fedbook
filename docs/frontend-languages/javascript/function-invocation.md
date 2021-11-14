# 调用函数的四种方式

## 前言

函数定义从 `function` 关键字开始，构成函数主体的 JavaScript 代码在定义之时并不会执行，只有调用该函数时，它们才会执行。

> 关于变量提升：var 只有变量声明提前，变量的初始化代码仍然在原来的位置；然而 function 则会使函数名称和函数体均提前。

函数调用方式共有四种：

* 作为函数调用
* 作为方法调用
* 作为构造函数调用（`new` 调用）
* 上下文调用（`call`、`apply`、`bind`）

在 ECMAScript 2015（ES6）之前，函数内部的 `this` 指向是由该函数的调用方式决定的。

## 作为函数调用

对于普通的函数调用，如果该函数没有指定返回值，返回值就是 `undefined`；如果该函数指定了返回值（有 `return`），返回值就是 `return` 之后的表达式的值；如果 `return` 语句没有值，则返回 `undefined`。

如果函数是声明在 window 对象中全局函数，非严格模式下的调用上下文（`this` 的值）是全局对象，严格模式 `this` 为 `undefined`。

基本模式：

```javascript
function foo() {
  return this;
}
foo(); // 返回 window 对象
```

## 作为方法调用

方法指该 JavaScript 函数是一个对象的属性。函数本身就是一个属性访问表达式，这意味着该函数被当做一个方法，而不是一个普通函数来调用。其返回值的处理方式，和普通函数调用完全一致。

调用上下文为当前对象，即 `this` 指向当前对象。

基本模式：

```javascript
var calculator = {
  value1: 1,
  value2: 1,
  add: function() {
    // this 指代当前对象
    this.result = this.value1 + this.value2;
  }
};

calculator.add(); // 调用 add 方法结算结果
calculator.result; // => 2

// 方括号（属性访问表达式）进行属性访问操作
calculator["add"]();
```

和变量不同，关键字 `this` 没有作用域的限制，嵌套的函数不会从调用它的函数中继承 `this`。如果嵌套函数作为方法调用，其 `this` 的值指向调用它的对象。如果嵌套函数作为函数调用，其 `this` 值不是全局对象（非严格模式下）就是 `undefined`（严格模式下）。

因此若想访问外部函数的 `this` 值，那么就需要将 `this` 保存在变量中（变量具有作用域）。

示例：

```javascript
var o = {
  m: function() {
    let self = this;            // 将this 的值进行保存
    console.log(this === o);    // true
    f();                        // 调用嵌套函数f()
        
    function f() {
      console.log(this === o);  // false：this 的值为全局对象或 undefined
      console.log(self === o);  // true：self 指向外部函数 this 的值
    }
  }
}
```

## 作为构造函数调用

如果函数或者方法调用之前带有关键字 `new`，它就构成构造函数调用。

基本模式：

```javascript
let person = new People();
```

构造函数调用会创建一个新的空对象，并初始化这个新创建的对象，将这个对象用作其调用上下文。因此构造函数中 `this` 关键字指向这个新创建的对象。

如下示例代码，尽管构造函数看起来像一个方法调用，但它依然会使用 `new` 出来的新对象作为调用上下文。也就是说，在表达式 `new o.m()` 中，调用上下文并不是 `o`。

```javascript
let o = {
  m: function() {
    return 1;
  }
};
console.log(new o.m() === 1); // false
```

构造函数通常不使用 `return` 关键字，它们通常初始化新对象，当构造函数的函数体执行完毕时，它会显式返回。在这种情况下，构造函数调用表达式的计算结果就是这个新对象的值。然而如果构造函数显式地使用 `return` 语句返回一个对象，那么调用表达式的值就是这个对象。如果构造函数使用 `return` 语句但是没有指定返回值，或者返回一个原始值，那么这时将忽略返回值，同时使用这个新对象作为返回结果。

::: tip
特别提醒一下，**`new` 调用时的返回值，如果没有显式返回对象或者函数**（包含 `Functoin`，`Array`，`Date`，`RegExg`，`Error`），**才是返回生成的新对象**。
虽然实际使用时不会显示返回，但面试官可能会问到。
:::

## 上下文调用

上下文调用方式有三种，`call`、`apply`、`bind`，这是一种很强大的调用方式。

### call 和 apply

JavaScript 中的函数也是对象，函数对象也可以包含方法。其中 `call()` 和 `apply()` 就是预定义的函数方法。

这两个方法可用于间接地调用函数，它们都允许显式指定调用所需的 `this` 值。也就是说，任何函数都可以作为任何对象的方法来调用，使得关键字 `this` 指向该对象，哪怕这个函数不是该对象的方法。

两个方法的第一个参数是要调用函数的母对象，它是调用上下文。

基本模式：

```javascript
// call()
// obj: 这个对象将代替 func 里 this 对象
// param1 ~ paramN: 这是一个参数列表
func.call(obj, 'param1', 'param2')
```

```javascript
// apply() 
// 该方法能接收两个参数
// obj: 这个对象将代替 func 里 this 对象
// args: 这是一个数组，它将作为参数传给 func（args --> arguments）
func.apply(obj, ['param1', 'param2'])
```

注意：

* `call` 和 `apply` 区别在于第二个参数：`apply` 传入的是一个参数数组，也就是将多个参数组合成为一个数组传入，而 `call` 从第二个参数开始都是参数。
* 在严格模式下，在调用函数时第一个参数会成为 `this` 的值，即使该参数不是一个对象。
* 在非严格模下，如果第一个参数的值是 `null` 或 `undefined`，它将使用全局对象替代。

### bind

`bind` 方式一般人用的比较少，但有的时候具有一些举足轻重的作用。

不同的是，`call`、`apply` 是立刻执行了这个函数，并且执行过程中绑定了 `this` 的值；`bind` 并没有立刻执行这个函数，而是创建了一个新的函数，新函数绑定了 `this` 的值，如果要执行还得在后面加个 `()`。

基本模式：

```javascript
// bind() 
// 该方法能接收两个参数
// obj: 这个对象将代替 func 里 this 对象
// param1 ~ paramN: 这是一个参数列表
func.bind(obj, 'param1', 'param2')()
```

bind 函数在对象中：

```javascript
let obj = {
  name: "西瓜",
  drink: (function () {
    console.log(this.name);
    console.log(obj.name);
  }).bind({name: "橙汁"})
}
obj.drink();

// "橙汁"
// "西瓜"
```

bind 函数在定时器中：

```javascript
let obj = {
  name: "西瓜",
  drink: function () {
    setTimeout((function () {
      console.log(this.name);
    }).bind(this), 100)
  }
};
obj.drink();

// "西瓜"
```

### call、apply、bind 小结

通过 `call`、`apply`、`bind` 方法把对象绑定到 `this` 上，叫做显式绑定。对于被调用的函数来说，叫做间接调用。

* `call`、`apply`、`bind` 三者的第一个参数都是 `this` 要指向的对象。
* `bind` 只是返回函数，还未调用，所以如果要执行还得在后面加个 `()`；`call`、`apply` 是立即执行函数。
* 三者后面都可以带参数
  * `call` 后面的参数用逗号隔开：`func.call(obj, value1, value2);`
  * `apply` 后面的参数以数组的形式传入：`func.apply(obj, [value1, value2]);`
  * `bind` 可以在指定对象的时候传参（同 `call`），以逗号隔开；也可以在执行的时候传参，写到后面的括号中：`func.bind(obj,value1,value2)();`  或 `func.bind(obj)(value1,value2);`

## 参考资料

[MDN - 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions "函数")

（完）
