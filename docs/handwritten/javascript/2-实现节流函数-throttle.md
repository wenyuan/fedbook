# 实现节流函数（throttle）

## 1. 功能描述

函数节流（throttle），规定在一个单位时间内，只执行一次函数。

## 2. 手写实现

```javascript
// func 是用户传入需要节流的函数
// wait 是等待时间
const throttle = (func, wait=500) => {
  // 上一次执行该函数的时间
  let lastTime = 0;
  // 使用闭包返回一个函数并且用到闭包函数外面的变量 lastTime
  return function(...args) {
    // 当前时间
    let now = +new Date();
    // 将当前时间和上一次执行函数时间对比
    // 如果差值大于设置的等待时间就执行函数
    if (now - lastTime > wait) {
      lastTime = now;
      func.apply(this, args);
    }
  }
}
```

## 3. 测试用例

```javascript
// 用 onmousemove 测试一下节流函数
function func(e) {
  console.log(e);
}
let throttleFunc = throttle(func, 1000)
document.onmousemove = (e) => {
  throttleFunc(e);
}
```

## 4. 常见应用场景

间隔一段时间执行一次回调的场景有：

* 滚动加载，加载更多或滚到底部监听；
* 元素拖拽：固定时间内只执行一次，防止超高频次触发位置变动；
* 高频点击提交，表单重复提交；
* 其它。

## 5. 防抖与节流的异同比较

相同点：

* 目的都是降低回调执行频率，节省计算资源。

不同点：

* 函数防抖，在一段连续操作**结束后，处理回调**，利用 `clearTimeout` 和 `setTimeout` 实现。
* 函数节流，在一段连续操作中，**每一段时间只执行一次**，频率较高的事件中使用来提高性能。

（完）
