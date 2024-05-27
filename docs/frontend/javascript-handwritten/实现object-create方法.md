# 实现 Object.create 方法

## 功能描述

`Object.create()` 方法创建一个新对象，使用现有的对象来提供新创建的对象的 `__proto__`（新对象的 `__proto__` 属性会指向原对象）。

## 手写实现

```javascript
function objectCreate(obj) {
  // 排除传入的是非 object 的情况
  if (typeof obj !== 'object') {
    throw new TypeError(`Object prototype may only be an Object or null: ${obj}`);
  }
  // 让空对象的 __proto__ 指向传进来的对象（prototype）
  // 目标 {}.__proto__ = prototype
  function F() {}
  F.prototype = obj;
  return new F();
}
```

## 测试用例

```javascript
let obj = { 
  name: 'test',
  colors: ['red', 'green', 'blue']
};
// 对比两个输出结果
console.log('Object.create()', Object.create(obj))
console.log('objectCreate()', objectCreate(obj))
```

## 注意事项

原生的 `Object.create(proto，[propertiesObject])` 方法支持两个参数：

* `proto`：必须，表示新建对象的原型对象。
* `propertiesObject`：可选，需要传入一个对象。如果该参数被指定且不为 `undefined`，该传入对象的自有可枚举属性（即其自身定义的属性，而不是其原型链上的枚举属性）将添加到新创建对象。

**此处我们手写实现的函数省略了对第二个参数的支持**。

（完）
