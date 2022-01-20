# 实现浅克隆（shallowClone）

## 功能描述

浅克隆（shallowClone），只拷贝对象或数组的第一层内容。

注意：对于引用值时，浅克隆之后会出现你改我也改的情况。

## 手写实现

```javascript
const shallowClone = (target) => {
  if (typeof target === 'object' && target !== null) {
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) { // 遍历对象自身可枚举属性（不考虑继承属性和原型对象）
        cloneTarget[prop] = target[prop];
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
}
```

## 测试用例

```javascript
let oldObj = {
  name: 'old',
  params: {
    a: 1,
    b: 2
  }
}
let newObj = shallowClone(oldObj);
```

（完）
