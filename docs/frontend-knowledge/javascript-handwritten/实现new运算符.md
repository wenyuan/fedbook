# 实现 new 运算符

## 功能描述

`new` 运算符用于创建一个自定义对象的实例，或具有构造函数的内置对象的实例。

## 实现思路

* 步骤 1：创建构造函数的实例对象，这个对象的 `__proto__` 要指向构造函数的 `prototype`
* 步骤 2：把构造函数当作普通函数执行，并改变 `this` 指向
* 步骤 3：分析构造函数的返回值
  * 返回值为 `object` 或 `function` 类型则作为 `new` 方法的返回值返回；
  * 否则返回构造函数的实例对象。

## 手写实现

```javascript
/**
  * Func：要操作的构造函数（最后要创建这个构造函数的实例）
  * args：存储未来传递给构造函数 Func 的实参
  */
function myNew(Func, ...args) {
  // 创建一个 Func 的实例对象（实例.__proto__ = 构造函数.prototype）
  let instance = Object.create(Func.prototype);
  // 把 Func 当做普通函数执行，并将其 this 指向 instance
  let result = Func.apply(instance, args);
  // 分析构造函数的返回值
  if (result !== null && /^(object|function)$/.test(typeof result)) {
    return result;
  }
  return instance;
}
```

## 测试用例

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 对比两个输出结果
const p1 = new Person('zhangsan', 13);
console.log('new:', p1);

const p2 = myNew(Person, 'zhangsan', 13);
console.log('myNew:', p2)
```

（完）
