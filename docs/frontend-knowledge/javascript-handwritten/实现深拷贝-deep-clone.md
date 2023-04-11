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

### 前置准备

首先对于特殊对象，要知道这个对象是不是可遍历的，因为这将决定采用不同的处理逻辑。

```javascript
// 对于特殊对象，使用这个方式来鉴别
Object.prototype.toString.call(obj);

// 可遍历对象的返回结果
'[object Map]'
'[object Set]'
'[object Array]'
'[object Object]'
'[object Arguments]'

// 不可遍历的对象的返回结果
'[object Boolean]'
'[object Number]'
'[object String]'
'[object Date]'
'[object Error]'
'[object RegExp]'
'[object Function]'
```

其次对于函数的拷贝：

* 虽然函数也是对象，但是它过于特殊，需要单独把它拿出来拆解。
* JS 有两种函数，一种是普通函数，另一种是箭头函数。
  * 每个普通函数都是 Function 的实例。
  * 箭头函数不是任何类的实例，每次调用都是不一样的引用。
  * 因此只需要处理普通函数的情况，箭头函数直接返回它本身就好了。
  * 利用原型来区分两者，因为箭头函数是不存在原型的。

### 完整代码

```javascript
// 获取对象类型
const getType = (obj) => Object.prototype.toString.call(obj);

// 判断是基本数据类型还是引用数据类型 
const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;

// 判断是否可遍历
const canTraverse = {
  '[object Map]': true,
  '[object Set]': true,
  '[object Array]': true,
  '[object Object]': true,
  '[object Arguments]': true,
};
const mapTag = '[object Map]';
const setTag = '[object Set]';
const boolTag = '[object Boolean]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

// 处理 RegExp 对象
// 返回一个新的 RegExp 对象，它继承了原始 RegExp 对象的属性和方法
// source：源字符串  flags：标志字符串 
const handleRegExp = (target) => {
  const { source, flags } = target;
  return new target.constructor(source, flags);
}

// 处理函数
const handleFunc = (func) => {
  // 箭头函数直接返回自身
  if (!func.prototype) return func;

  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString);
  const body = bodyReg.exec(funcString);
  if (!body) return null;
  if (param) {
    const paramArr = param[0].split(',');
    return new Function(...paramArr, body[0]);
  } else {
    return new Function(body[0]);
  }
}

// 处理不可遍历对象
const handleNotTraverse = (target, tag) => {
  // 获取目标对象的构造函数，用于创建新的对象
  const Ctor = target.constructor;
  switch (tag) {
    case boolTag:
      return new Object(Boolean.prototype.valueOf.call(target));
    case numberTag:
      return new Object(Number.prototype.valueOf.call(target));
    case stringTag:
      return new Object(String.prototype.valueOf.call(target));
    case symbolTag:
      return new Object(Symbol.prototype.valueOf.call(target));
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
}

/**
 * 在前面的深拷贝实现上，加入了对特殊对象和函数的支持
 * @param {*} target 需要被拷贝的对象
 * @param {*} hash   性能考虑不用 Map，使用弱引用的 WeakMap
 * @returns 
 */
const deepClone = (target, hash = new WeakMap()) => {
  if (!isObject(target))
    return target;
  let type = getType(target);
  let cloneTarget;
  if (!canTraverse[type]) {
    // 处理不能遍历的对象
    return handleNotTraverse(target, type);
  } else {
    // 这一步很关键，可以保证对象的原型不丢失
    let ctor = target.constructor;
    cloneTarget = new ctor();
  }

  if (hash.get(target))
    return target;
  hash.set(target, true);

  if (type === mapTag) {
    // 处理 Map
    target.forEach((item, key) => {
      cloneTarget.set(deepClone(key, hash), deepClone(item, hash));
    })
  }

  if (type === setTag) {
    // 处理 Set
    target.forEach(item => {
      cloneTarget.add(deepClone(item, hash));
    })
  }

  // 处理数组和对象
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
      cloneTarget[prop] = deepClone(target[prop], hash);
    }
  }
  return cloneTarget;
}
```

（完）
