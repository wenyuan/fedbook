# 实现深克隆（deepClone）

## 功能描述

深克隆（deepClone），层层拷贝对象或数组的每一层内容。

注意：对于引用值时，深克隆之后**不会**出现你改我也改的情况。

## 手写实现（简易版）

```javascript
let newObj = JSON.parse(JSON.stringify(oldObj));
```

局限性：

* 无法实现对函数、RegExp 等特殊对象的克隆；
* 会抛弃对象的 `constructor`，所有的构造函数会指向 `Object`；
* 对象有循环引用，会报错。

## 手写实现（面试版）

```javascript
function deepClone(target)  {
  if (target === null) return null;
  if (typeof target !== 'object') return target;

  const cloneTarget = Array.isArray(target) ? [] : {};
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
      cloneTarget[prop] = deepClone(target[prop]);
    }
  }
  return cloneTarget;
}
```

## 手写实现（完善版）

考虑日期、正则等特殊对象，解决循环引用情况。

```javascript
const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;

function deepClone (target, map = new Map()) {
  // 先判断该引用类型是否被拷贝过
  if (map.get(target)) {
    return target;
  }

  // 获取当前值的构造函数：获取它的类型
  let constructor = target.constructor;

  // 检测当前对象target是否与 正则、日期格式对象匹配
  if (/^(RegExp|Date)$/i.test(constructor.name)){
    return new constructor(target); // 创建一个新的特殊对象(正则类/日期类)的实例
  }

  if (isObject(target)) {
    map.set(target, true); // 为循环引用的对象做标记
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop], map);
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
}
```

（完）
