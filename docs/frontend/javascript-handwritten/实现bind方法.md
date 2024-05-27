# 实现 bind 方法

## 功能描述

`bind()` 方法创建一个新的函数，在 `bind()` 被调用时，这个新函数的 `this` 被指定为 `bind()` 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。

基本用法如下：

```javascript
let func = function(){
  console.log(this.name);
}

let funcBind = func.bind({ name: '张三' });
funcBind(); // "张三"
```

上述代码可以简化如下：

```javascript
(function func() {
  console.log(this.name);
}).bind({ name: '张三' })(); // "张三"
```

## 实现思路

* `bind()` 返回了一个函数，对于函数来说有两种方式调用，一种是直接调用，一种是通过 `new` 的方式
* **直接调用**：这里选择了 `apply` 的方式实现。但是对于参数需要注意以下情况：因为 `bind` 可以实现类似这样的代码 `func.bind(obj, 1)(2)`，所以我们需要将两边的参数拼接起来，于是就有了这样的实现 `args.concat(...arguments)`；
* **通过 new 方式调用**：首先要掌握如何判断 `this`，然后对于 `new` 的情况来说，不会被任何方式改变 `this`，所以对于这种情况我们需要忽略传入的 `this`。

## 手写实现

```javascript
/**
 * this: 要处理的函数 func
 * context: 要改变的函数中的 this 指向 (obj)
 * params：要处理的函数传递的实参 [10, 20]
 */
Function.prototype.myBind = function(context, ...params) {
  // this: 要处理的函数
  if (typeof this !== 'function') {
    throw new TypeError(this + ' must be a function')
  }
  // this：下面返回的函数 F 中的 this 是由当初绑定的位置触发决定的（总之不是要处理的函数 func）
  // 所以需要 myBind 函数刚进来时，保存要处理的函数 _this = this
  let self = this;

  // 返回一个函数
  return function F(...args) {
    // 因为返回了一个函数，我们可以 new F()，所以需要判断
    if (this instanceof F) {
      // args：可能传递的事件对象等信息 [MouseEvent]
      return new self(...params, ...args)
    }
    return self.apply(context, args.concat(...args))
  }
}
```

## 测试用例

直接调用：

```javascript
// 目标：调用方法时打印出 "张三 性别:男 年龄:13"
window.name = 'window';
let func = function(){
  console.log(this.name);
}

// 对比两个输出结果
let funcBind = func.bind({ name: '张三' });
funcBind(); // "张三"
let funcMyBind = func.myBind({ name: '张三' });
funcMyBind(); // "张三"
```

## 注意事项

这里只是做 `bind()` 方法的简易实现，之后会写个最终版实现。

（完）
