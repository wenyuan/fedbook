# 实现 apply 方法

## 功能描述

`apply()` 方法调用一个具有给定 `this` 值的函数，以及以一个数组（或类数组对象）的形式提供的参数。

`apply()` 该方法的语法和作用与 `call()` 方法类似，只有一个区别，就是 `apply()` 方法接受的是一个包含多个参数的数组，而 `call()` 方法接受的是一个参数列表。

基本用法如下：

```javascript
// apply() 
// 该方法能接收两个参数
// obj: 这个对象将代替 func 里 this 对象
// args: 这是一个数组，它将作为参数传给 func（args --> arguments）
func.apply(obj, args)
```

## 实现思路

实现 `apply()` 的思路 和 实现 `call()` 是一样的，只要把入参中的 `...args` 换成 `args` 即可。

## 手写实现

```javascript
/**
 * context: 函数中的 this 将改变为指向这个参数
 * args：传递给函数的实参信息
 * this：在未改变指向时，指向要处理的函数 func
 */
Function.prototype.myApply = function(context, args) {
  // null、undefined 和不传时，context为 window（注意是双等号不是三等号）
  context = context == null ? window : context;

  // 必须保证 context 是一个对象类型
  let contextType = typeof context;
  if (!/^(object|function)$/i.test(contextType)) {
   context = Object(context);
 }
  
  let result;
  let key = Symbol('key') // 成员名唯一，防止修改原始对象的值
  context[key] = this; // 把函数作为对象的某个成员值（这里的这个 this 是待处理函数 func）
  result = context[key](...args); // 此时的函数是对象中的属性，基于对象[成员]的方式执行函数，函数中的 this 指向就是对象
  delete context[key]; // 设置的成员属性用完后要删除掉
  return result;
}
```

## 测试用例

```javascript
// 目标：调用方法时打印出 "张三 性别:男 年龄:13"
window.name = 'window';
let obj = { name: '张三' };
let func = function(sex, age){
  console.log(this.name + ' 性别:' + sex + ' 年龄:' + age);
}

// 对比两个输出结果
func.apply(obj, ['男', 13]);
func.myApply(obj, ['男', 13]);
```

（完）
