# 声明函数的六种方式

## 前言

在 JavaScript 中，函数由许多组件组成并受它们影响：

* 函数体的代码
* 参数列表
* 可以从词法作用域访问的变量
* 返回值
* 调用该函数时的上下文 `this`
* 命名函数或匿名函数
* 保存函数对象的变量
* arguments 对象（在箭头函数中没有）

本文介绍六种声明 JavaScript 函数的方式，分别介绍他们的声明语法、示例和常见的陷阱。并总结在特定的情况下何时使用特定的函数类型。

## 函数声明

### 基本语法

函数声明由 `function` 关键字、必需的函数名、一对括号中的参数列表 `(param1, …, paramN)` 和一对包裹着主体代码的花括号 `{ … }` 组成。

示例：

```javascript
function name(param1, …, paramN) {
  statements
}
```

* **name**：函数名，必须有。
* **param**：要传递给函数的参数的名称。不同引擎中的最大参数数量不同。
* **statements**：包含函数体的语句。

### 变量提升

函数声明会在当前作用域内创建一个变量，它的标识符就是函数名，它的值就是函数对象。

我们都知道变量提升，对于函数而言，它会被提升到当前作用域的顶层，因此在编写代码时，可以在函数声明前就进行调用。

函数声明的一个重要特性是它的变量提升机制，也就是同一作用域内允许在声明之前被调用。

变量提升在某些场景下是很有用的。例如，你想在一个 JavaScript 脚本的开头就知道某个函数是如何被调用的，并不关心这个函数的具体实现。那么就可以把函数具体实现放在文件的下面，这样在阅读时不用滚到底部查看。

此时创建的函数是一个具名函数，函数对象的 `name` 属性值就是它的名称。当你需要查看堆栈信息进行调试和查错时，该属性会非常有用。

可以通过下面的例子来理解：

```javascript
// 变量提升
console.log(hello('Aliens')); // "Hello Aliens!"
// 命名的函数
console.log(hello.name);      // "hello"
// 变量保存了函数对象
console.log(typeof hello);    // "function"

function hello(name) {
  return `Hello ${name}!`;
}
```

### 适用场景

函数声明适用于常规函数：即某个函数你只需声明一次，并在多个地方调用它。

示例：

```javascript
function sum(a, b) {
  return a + b;
}

sum(5, 6);           // 11
([3, 7]).reduce(sum) // 10
```

由于函数声明在当前作用域中创建了一个变量，同时还是一个常规函数调用，所以它对于递归或分发事件监听器非常有用。与函数表达式或箭头函数相反，它不通过函数变量的名称创建绑定。

例如，要递归计算阶乘，就必须访问的函数：

```javascript
function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}
factorial(4); // 24
```

在 `factorial()` 函数内部通过再次使用函数变量名 `factorial(n - 1)` 实现递归调用。

上述需求也可以通过把一个函数表达式赋值给一个常规变量实现，例如：

```javascript
const factorial = function(n) { … }
```

但是函数声明 `function factorial(n)` 更简洁，因为不需要写 `const` 和 `=`。

### 和函数表达式的区别

函数声明和函数表达式很容易混淆。它们看起来非常相似，但产生的函数具有不同的属性。

一个容易记住的规则：函数声明总是以关键字 `function` 开头，否则它就是一个函数表达式。

下面的示例是一个函数声明，它的语句以 `function` 关键字开头：

```javascript
// 函数声明: 以 "function" 开始
function isNil(value) {
  return value == null;
}
```

在使用函数表达式的情况下，JavaScript 语句不以 `function` 关键字开头（它出现在语句代码的中间）：

```javascript
// 函数表达式: 以"const"开头
const isTruthy = function(value) {
  return !!value;
};
// 函数表达式作为.filter()的参数
const numbers = ([1, false, 5]).filter(function(item) {
  return typeof item === 'number';
});
// 函数表达式(IIFE): 以 "("开头
(function messageFunction(message) {
  return message + ' World!';
})('Hello');
```

### 条件语句中的函数声明

一些 JavaScript 环境在调用一个出现在 `{ … }` 的 `if`、`for` 或 `while` 语句中的声明时会抛出异常。

让我们启用严格模式，看看当一个函数声明在条件语句中：

```javascript
(function() {
  'use strict';
  if (true) {
    function ok() {
      return 'true ok';
    }
  } else {
    function ok() {
      return 'false ok';
    }
  }
  console.log(typeof ok === 'undefined'); // => true
  console.log(ok()); // Throws "ReferenceError: ok is not defined"
})();
```

当调用 `ok()` 时，JavaScript 抛出 `ReferenceError: ok is not defined`，因为函数声明在一个条件块中。

条件语句中的函数声明在非严格模式下是允许的，但这使得代码很混乱。

作为这些情况的一般规则，当函数应该在某些条件下才创建时，我们可以使用函数表达式。让我们看看如何处理：

```javascript
(function() {
  'use strict';
  let ok;
  if (true) {
    ok = function() {
      return 'true ok';
    };
  } else {
    ok = function() {
      return 'false ok';
    };
  }
  console.log(typeof ok === 'function'); // true
  console.log(ok()); // "true ok"
})();
```

因为函数是一个常规对象，所以根据条件将它赋给一个变量。调用 `ok()` 工作正常，没有错误。

## 函数表达式

### 基本语法

函数表达式由 `function` 关键字、可选的函数名、一对括号中的参数列表 `(param1, …, paramN)` 和一对包裹着主体代码的花括号 `{ … }` 组成。

示例：

```javascript
let function_expression = function [name](param1, …, paramN]) {
   statements
}
```

* **function_expression**：被赋值的变量名。
* **name**：函数名称，可被省略，此种情况下的函数是匿名函数（anonymous）。函数名称只是函数体中的一个本地变量。
* **statements**：包含函数体的语句。

### 变量提升

::: danger 注意
没有变量提升
:::

JavaScript 中的函数表达式没有提升，不像函数声明，你在定义函数表达式之前不能使用函数表达式。

示例：

```javascript
notHoisted(); // TypeError: notHoisted is not a function

var notHoisted = function() {
  console.log('bar');
};
```

### 适用场景

函数表达式创建了一个可以在不同情况下使用的函数对象：

* 作为对象赋值给变量 `count = function(…){…}`
* 在对象上创建一个方法 `sum: function(){…}`
* 使用函数作为回调 `reduce(function(…){…})`
* 在函数体内部引用当前函数（递归调用），此时一定要是一个命名函数表达式

```javascript
// 作为对象赋值给变量 
const count = function(array) {
  return array.length;
};

const methods = {
  numbers: [1, 5, 8],
  sum: function() { // 在对象上创建一个方法
    return this.numbers.reduce(function(acc, num) { // 使用函数作为回调
      return acc + num;
    });
  }
};

var math = {
  'factorial': function factorial(n) {
    if (n <= 1)
      return 1;
    return n * factorial(n - 1); // 在函数体内部引用当前函数
  }
};

count([5, 7, 8]); // 3
methods.sum();    // 14
math.factorial(3); // 6
```

函数表达式是 JavaScript 中最常用的部分，通常情况下，如果你喜欢简短的语法和词法上下文，就能经常看到函数表达式和箭头函数。

### 匿名函数表达式

函数表达式中，当它没有函数名称的时侯，则称为匿名函数（平时所说的匿名函数就属于函数表达式），此时 `name` 属性是一个空字符 `''`。

示例：

```javascript
(
  function(variable) {return typeof variable; }
).name; // ''
```

被函数表达式赋值的那个变量会有一个 `name` 属性，如果你把这个变量赋值给另一个变量的话，这个 `name` 属性的值也不会改变。

如果函数是一个匿名函数，那 `name` 属性的值就是被赋值的变量的名称（隐式命名）。如果函数不是匿名的话，那 `name` 属性的值就是这个函数的名称（显式命名）。这对于箭头函数也同样适用（箭头函数没有名字，所以 `name` 属性的值就是被赋值的变量的名称）。

示例：

```javascript
var foo = function() {}
foo.name // "foo"

var bar = foo
bar.name // "foo"

console.log(foo === bar); //true
```

### 命名函数表达式

当表达式指定了名称时，就是命名函数表达式。与简单的函数表达式相比，它有一些额外的特点：

* `name` 属性就是函数名。
* 在函数体内部，与函数同名的变量指向函数对象。
* 在命名函数表达式中，函数名称可以在函数作用域内访问，但不能在外部访问。

```javascript
var bar = function foo() {}

console.log(typeof foo) // "undefined"
console.log(foo.name) // ReferenceError: foo is not defined

console.log(typeof bar) // "function"
console.log(bar.name) // "foo"
```

推荐命名函数和避免匿名函数可以获得以下好处：

* 显式指定函数名时，错误消息和调用堆栈显示更详细的信息。
* 通过减少匿名堆栈名称的数量，使调试更加舒适。
* 从函数名可以看出函数的作用。
* 可以在函数的作用域内访问函数，以进行递归调用或分发事件侦听器。

## 方法的定义

从 ECMAScript 2015 开始，在对象初始化中引入了一种更简短定义方法的语法，这是一种把方法名直接赋给函数的简写方式，可用于对象常量和 ES2015 类的方法声明。

### 基本语法

你可以使用函数名来定义它们，后面跟着一对括号中的参数列表 `(param1, …, paramN)` 和一对包裹着主体代码的花括号 `{ … }`。

示例：

```javascript
const obj = {
  foo() {
    return 'bar';
  }
};

console.log(obj.foo()); // "bar"
```

### 适用场景

**封装对象方法**：

```javascript
const collection = {
  items: [],
  add(...items) {
    this.items.push(...items);
  },
  get(index) {
    return this.items[index];
  }
};
collection.add('C', 'Java', 'PHP');
collection.get(1) // "Java"
```

`collection` 对象中的 `add()` 和 `get()` 方法是使用简短的方法定义进行定义的。这些方法像常规方法这样调用：`collection.add(…)` 和 `collection.get(…)`。

与传统的属性定义方法相比，使用名称、冒号和函数表达式 `add: function(…){…}` 这种简短方法定义的方法有以下几个优点:

* 更短的语法更容易理解
* 与函数表达式相反，简写方法定义创建一个指定的函数，这对调试很有用。

**类方法的声明**：

```javascript
class Star {
  constructor(name) {
    this.name = name;
  }
  getMessage(message) {
    return this.name + message;
  }
}
const sun = new Star('Sun');
sun.getMessage(' is shining') // "Sun is shining"
```

### 计算得到的属性名和方法

ECMAScript 2015 增加了一个很好的特性：在对象字面量和类中计算属性名。

计算属性使用稍微不同的语法 `[methodName](){…}`，则方法定义如下:

```javascript
const addMethod = 'add',
  getMethod = 'get';
const collection = {
  items: [],
  [addMethod](...items) {
    this.items.push(...items);
  },
  [getMethod](index) {
    return this.items[index];
  }
};
collection[addMethod]('C', 'Java', 'PHP');
collection[getMethod](1) // "Java"
```

`[addMethod] (…) {…}` 和 `[getMethod](…){…}` 是具有计算属性名的简写方法声明。

## 箭头函数

### 基本语法

箭头函数表达式的语法比函数表达式更简洁，它是用一对括号定义的，其中包含参数列表 `(param1, param2, ……, paramN)`，然后是一个胖箭头 `=>` 和一对包裹着主体代码的花括号 `{ … }`。

并且没有自己的 `this`，`arguments`，`super` 或 `new.target`。箭头函数表达式更适用于那些本来需要匿名函数的地方，并且它不能用作构造函数。

当箭头函数只有一个参数时，可以省略括号。当它包含一个语句时，花括号也可以省略。

示例：

```javascript
const absValue = (number) => {
  if (number < 0) {
    return -number;
  }
  return number;
};
absValue(-10); // 10
absValue(5);   // 5
```

`absValue` 是一个计算数字绝对值的箭头函数。

### 上下文透明性

`this` 关键字是 JavaScript 的一个令人困惑的方面。因为函数创建自己的执行上下文，所以通常很难判断 `this` 的值。

ECMAScript 2015 通过引入箭头函数改进了 `this` 的用法，该函数按词法获取上下文（或者直接使用外部域的 `this`）。这种方式很好，因为当函数需要获取它的封闭上下文的 `this` 时，不必使用 `.bind(this)` 或存储上下文 `var self = this`。

让我们看看如何从外部函数继承 `this`：

```javascript
class Numbers {
  constructor(array) {
    this.array = array;
  }
  addNumber(number) {
    if (number !== undefined) {
       this.array.push(number);
    } 
    return (number) => { 
      console.log(this === numbersObject); // true
      this.array.push(number);
    };
  }
}
const numbersObject = new Numbers([]);
const addMethod = numbersObject.addNumber();

addMethod(1);
addMethod(5);
console.log(numbersObject.array); // [1, 5]
```

`Numbers` 类有一个数字数组，并提供 `addNumber()` 方法来插入新数值。

当在不提供参数的情况下调用 `addNumber()` 时，返回一个允许插入数字的闭包。这个闭包是一个 `this` 等于 `numbersObject` 实例的箭头函数，因为上下文是从 `addNumbers()` 方法按词法获取的。

如果没有箭头函数，就必须手动指定上下文，使用像 `.bind()` 这样的方式进行变通：

```javascript
//...
    return function(number) { 
      console.log(this === numbersObject); // true
      this.array.push(number);
    }.bind(this);
//...
```

或将上下文存储到一个单独的变量 `var self = this`：

```javascript
//...
    const self = this;
    return function(number) { 
      console.log(self === numbersObject); // true
      self.array.push(number);
    };
//...
```

当我们希望从封闭上下文中获取 `this` 时，就可以利用箭头函数的这种上下文透明性。

### 特点

箭头函数具有以下特点：

* 箭头函数不会创建它的执行上下文，而是按词法处理它（与函数表达式或函数声明相反，它们根据调用创建自己的 `this`）。
* 箭头函数是匿名的。但是，可以从保存函数的变量推断出它的名称。
* `arguments` 对象在箭头函数中不可用（与提供 `arguments` 对象的其他声明类型相反）。但是，您可以自由地使用 `rest` 参数 `(param1, param2, ...rest) => { statements }`。

### 短语法

在创建箭头函数时，对于单个参数和单个主体语句，括号对和花括号是可选的。这有助于创建非常简洁的回调函数。

让我们创建一个函数找出包含 0 的数组：

```javascript
const numbers = [1, 5, 10, 0];
numbers.some(item => item === 0); // true
```

但要注意，嵌套的短箭头函数很难理解，推荐的短语法使用场景是单个回调（不嵌套）。

## 生成器函数

JavaScript 中的生成器函数返回生成器对象。它的语法类似于函数表达式、函数声明或方法声明，只是它需要一个星号 `*`。

这里简单介绍一下，更推荐阅读阮一峰老师编写的《ES6标准入门（第3版）》中 [Generator](https://es6.ruanyifeng.com/#docs/generator "Generator - ECMAScript 6入门") 相关的两个章节。

生成器函数的声明形式如下：

* a. 函数声明形式 `function* <name>()`

```javascript
function* indexGenerator(){
  var index = 0;
  while(true) {
    yield index++;
  }
}
const g = indexGenerator();
console.log(g.next().value); // 0
console.log(g.next().value); // 1
```

* b. 函数表达式形式 `function* ()`

```javascript
const indexGenerator = function* () {
  let index = 0;
  while(true) {
    yield index++;
  }
};
const g = indexGenerator();
console.log(g.next().value); // 0
console.log(g.next().value); // 1
```

* c. 简写方法定义形式 `*<name>()`

```javascript
const obj = {
  *indexGenerator() {
    var index = 0;
    while(true) {
      yield index++;
    }
  }
};
const g = obj.indexGenerator();
console.log(g.next().value); // 0
console.log(g.next().value); // 1
```

三种生成器函数都返回生成器对象 `g`，之后 `g` 用于生成一系列自增数字。

## 构造函数

### 基本语法

```javascript
new Function (param1, …, paramN,  functionBody)
```

* **param1, …, paramN**：被函数使用的参数的名称，形式是一个有效的 JavaScript 标识符的字符串，或者一个用逗号分隔的有效字符串的列表。
* **functionBody**：一个含有包括函数定义的 JavaScript 语句的字符串。

### 实例用法

上面介绍的五种声明方法，本质上创建了相同的函数对象类型。我们来看一个例子：

```javascript
function sum1(a, b) {
  return a + b;
}
const sum2 = function(a, b) {
  return a + b;
};
const sum3 = (a, b) => a + b;
console.log(typeof sum1 === 'function'); // true
console.log(typeof sum2 === 'function'); // true
console.log(typeof sum3 === 'function'); // true
```

函数对象类型有一个构造函数：`Function`。

当 `Function` 被作为构造函数调用时，`new Function(param1, param2, …, paramN, bodyString)`，将创建一个新函数。参数 `param1, param2, …, paramN` 传递给构造函数成为新函数的参数名，最后一个参数 `bodyString` 用作函数体代码。

让我们创建一个函数，两个数字的和：

```javascript
const numberA = 'numberA', numberB = 'numberB';
const sumFunction = new Function(numberA, numberB, 
   'return numberA + numberB'
);
sumFunction(10, 15) // 25
```

使用 `Function` 构造函数调用创建的 `sumFunction` 具有参数 `numberA` 和 `numberB`，并且主体返回 `numberA + numberB`。

以这种方式创建的函数不能访问当前作用域，因此无法创建闭包，因此它们总是在全局域内创建。

在浏览器或 Node.js 脚本中访问全局对象的更好方式是 `new Function` 的应用：

```javascript
(function() {
  'use strict';
  const global = new Function('return this')();
  console.log(global === window); // true
  console.log(this === window);   // false
})();
```

请记住，几乎不应该使用 `new Function()` 来声明函数。因为函数体是在运行时执行的，所以这种方法继承了许多 `eval()` 使用问题：安全风险、更难调试、无法应用引擎优化、没有编辑器自动补全。

## 参考资料

* [MDN - Function declaration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function "function declaration")
* [MDN - Function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function "Function expression")
* [MDN - Method definitions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions "Method definitions")
* [MDN - Arrow function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions "Arrow function")
* [MDN - Generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction "Generator function")
* [MDN - Function constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function constructor")
* [6 Ways to Declare JavaScript Functions](https://dmitripavlutin.com/6-ways-to-declare-javascript-functions/ "6 Ways to Declare JavaScript Functions")（酌情翻译）

（完）
