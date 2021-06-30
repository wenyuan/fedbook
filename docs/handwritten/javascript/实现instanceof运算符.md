# 实现 instanceof 运算符

## 功能描述

`instanceof` 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。

## 实现思路

`instanceof` 左侧必须是对象，才能找到它的原型链；  
`instanceof` 右侧必须是函数，函数才会有 `prototype` 属性。  
通过迭代，左侧对象的原型不等于右侧的 `prototype` 时，沿着原型链重新赋值左侧。

具体步骤如下：

* 步骤 1：先取得当前类的原型，当前实例对象的原型链
* 步骤 2：一直循环（执行原型链的查找机制）
  * 取得当前实例对象原型链的原型链（`proto = proto.__proto__`，沿着原型链一直向上查找）；
  * 如果当前实例的原型链 `__proto__` 上找到了当前类的原型 `prototype`，则返回 `true`；
  * 如果一直找到 `Object.prototype.__proto__ == null`，`Object` 的基类（`null`）上面都没找到，则返回 `false`。

## 手写实现

```javascript
function myInstanceof(instanceObject, classFunc) {
  classFunc = classFunc.prototype; // 取得当前类的原型对象
  let proto = Object.getPrototypeOf(instanceObject); // 取得当前实例对象的原型对象
  
  while(true) {
    // 找到了 Object 的基类 Object.prototype.__proto__
    if(proto === null) return false;

    // 在当前实例对象的原型链上，找到了当前类
    if(proto === classFunc) return true;

    // 沿着原型链 __proto__ 一层一层向上查
    proto = Object.getPrototypeof(proto);
  }
}
```

## 测试用例

```javascript
myInstanceof([1,2,3], Array)
```

（完）
