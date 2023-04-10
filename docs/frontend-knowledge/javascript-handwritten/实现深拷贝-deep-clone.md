# 实现深拷贝（deepClone）

## 功能描述

深克隆（deepClone），层层拷贝对象或数组的每一层内容。

注意：对于引用值时，深克隆之后**不会**出现你改我也改的情况。

## 手写实现（简易版）

```javascript
let newObj = JSON.parse(JSON.stringify(oldObj));
```

局限性：

* 如果对象有循环引用，拷贝时会报错。
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
 * @param {*} hash   性能考虑不用 Map，使用弱引用的 WeakMap
 * @returns
 */
function deepClone(target, hash = new WeakMap) {
  // null 和 undefiend 是不需要拷贝的
  if (target == null) { return target; }
  // RegExp 和 Date 这两种特殊值暂不考虑
  if (target instanceof RegExp) { return new RegExp(target) }
  if (target instanceof Date) { return new Date(target) }
  // 基本数据类型直接返回即可，函数暂不考虑
  if (typeof target != 'object') return target;
  // 针对 [] {} 两种类型，基于它们的构造函数来实例化一个新的对象实例
  let clonedTarget = new target.constructor();
  // 说明是一个已经拷贝过的对象，那么直接返回即可，防止循环引用
  if (hash.get(target)) {
    return hash.get(target)
  }
  // 记录下已经拷贝过的对象
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

> 关于强引用与弱引用
> * 如果用的是 Map 来创建 map 对象，那么里面的 key 和 map 构成了强引用关系。对于强引用来说，只要这个强引用还在，那么对象就无法被回收。在上面的例子中，在程序结束之前，因为是用一个个对象来作为 map 的 key 的，所以这些对象所占的内存空间一直不会被释放。
> * 如果用的是 WeakMap 这一种特殊的 Map，那么其中的 key 和 map 构成了弱引用（其键必须是对象，而值可以是任意的），被弱引用的对象可以在任何时候被回收。
> * 同时，Map 类型在访问、插入、删除元素时，需要进行迭代器解引用操作，这也会导致性能下降；而 WeakMap 在进行这些操作时不需要进行解引用操作，因此可以提供更好的性能。
>
> 显然，使用 WeakMap（弱引用）来存储元素，可以避免强引用导致的内存泄漏问题，同时这种类型在查找特定元素时也可以更快地响应。

## 手写实现（完整版）

在上面的基础上，进一步实现：

* 能够拷贝特殊对象
* 能够拷贝函数

TODO...

（完）
