# 实现 call 方法

## 功能描述
   
`call()` 方法使用一个指定的 `this` 值和单独给出的一个或多个参数来调用一个函数。

基本用法如下：

```javascript
// call()
// obj: 这个对象将代替 func 里 this 对象
// param1 ~ paramN: 这是一个参数列表
func.call(obj, param1, …, paramN)
```

## 实现思路

* 如果不传入 context 参数，默认指向为 window
* 将函数设为对象的属性
* 指定函数中的 this 为对象，并传入给定实参，执行函数
* 删除对象中我们添加的属性

## 手写实现

```javascript
/**
 * context: 函数中的 this 将改变为指向这个参数
 * args：传递给函数的实参信息
 * this：在未改变指向时，指向要处理的函数 func
 */
Function.prototype.myCall  = function(context, ...args) {
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
// 目标：调用方法时打印出 "张三"
window.name = 'window';
let obj = { name: '张三' };
let func = function(){
  console.log(this.name);
}

// 对比两个输出结果
func.call(obj);
func.myCall(obj);
```

（完）
