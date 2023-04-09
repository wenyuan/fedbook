# 实现深拷贝（deepClone）

## 功能描述

深克隆（deepClone），层层拷贝对象或数组的每一层内容。

注意：对于引用值时，深克隆之后**不会**出现你改我也改的情况。

## 手写实现（简易版）

```javascript
let newObj = JSON.parse(JSON.stringify(oldObj));
```

局限性：

* 对象有循环引用，会报错。
  ```javascript
  const obj = { name: "张三" };
  obj.details = obj;
  
  let newObj = JSON.parse(JSON.stringify(obj));
  // Uncaught TypeError: Converting circular structure to JSON
  ```
* 会抛弃对象的 `constructor`，所有的构造函数会指向 `Object`。
* 无法拷贝一些特殊的对象，诸如 RegExp，Date，Set，Map 等。
* 无法拷贝函数(划重点)。

## 手写实现（面试版）

解决上面提到的前两个问题：

* 解决拷贝循环引用问题
* 解决拷贝对应原型问题

```javascript
/**
 * @param {*} target 需要被拷贝的对象
 * @param {*} hash   性能考虑不用 Map，使用弱引用的 WeakMap 更轻量一点
 * @returns
 */
function deepClone(target, hash = new WeakMap) {
  // null 和 undefiend 是不需要拷贝的
  if (target == null) { return target; }
  // RegExp 和 Date 这两种特殊值暂不考虑
  if (target instanceof RegExp) { return new RegExp(target) }
  if (target instanceof Date) { return new Date(target) }
  // 函数也暂不考虑
  if (typeof target != 'object') return target;
  // 针对 [] {} 两种类型，基于它们的构造函数来实例化一个新的对象实例，这样 obj 也将具备 target 自身的一些属性或方法
  let clonedTarget = new target.constructor();
  // 说明是一个对象类型，那么直接返回即可，防止循环引用
  if (hash.get(target)) {
    return hash.get(target)
  }
  hash.set(target, clonedTarget);
  // 遍历对象的 key，in 会遍历当前对象上的属性 和 __proto__ 指向的属性
  for (let key in target) {
    // 如果 key 是对象自有的属性
    if (target.hasOwnProperty(key)) {
      // 如果值依然是对象，就继续递归拷贝
      clonedTarget[key] = deepClone(target[key], hash);
    }
  }
  return clonedTarget
}
```

## 手写实现（完整版）

在上面的基础上，进一步实现：

* 能够拷贝特殊对象
* 能够拷贝函数

TODO...

（完）
