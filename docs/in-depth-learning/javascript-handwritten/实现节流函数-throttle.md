# 实现节流函数（throttle）

## 功能描述

设定一个特定的时间，让函数在特定的时间内只执行一次，不会频繁执行。

举例：fps 游戏里面的狙击枪，即使一直按住开枪键不松手，也会有储蓄时间，子弹不会一直发射，弹孔不会连成一条线。

## 手写实现

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

## 测试用例

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

## 常见应用场景

间隔一段时间执行一次回调的场景有：

* 鼠标的移入移出，页面的滚动。
* 浏览器的拖拽，固定时间内只执行一次。
* 浏览器的缩放。
* 其它。

## 防抖与节流的异同比较

相同点：

* 目的都是降低回调执行频率，节省计算资源。

不同点：

* 函数防抖，即触发高频事件后 n 秒内函数只会执行一次，利用 `clearTimeout` 和 `setTimeout` 实现。
* 函数节流，即高频事件触发，但在 n 秒内只会执行一次，因此节流会稀释函数的执行频率。

（完）
