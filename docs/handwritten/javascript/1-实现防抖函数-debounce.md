# 实现防抖函数（debounce）

## 1. 功能描述

函数防抖（debounce），就是指在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时。

举个例子：坐公交，司机需要等最后一个人进入才能关门（关门就是回调函数）。每次进入一个人（事件被触发），司机就会多等待几秒再关门。

## 2. 手写实现

```javascript
// func 是用户传入需要防抖的函数
// wait 是等待时间
const debounce = (func, wait=500) => {
  // 缓存一个定时器 id
  let timer = 0;
  // 这里返回的函数是每次用户实际调用的防抖函数
  // 如果已经设定过定时器了就清空上一次的定时器
  // 开始一个新的定时器，延迟执行用户传入的方法
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, wait)
  }
}
```

## 3. 测试用例

```javascript
// 用 onmousemove 测试一下防抖函数
function func(e) {
  console.log(e);
}
let debounceFunc = debounce(func, 1000);
document.onmousemove = (e) => {
  debounceFunc(e);
}
```

## 4. 常见应用场景

连续的事件，只需触发一次回调的场景有：

* 搜索框 input 事件，用户输入完最后一个字符再执行相应函数；
* 鼠标移动 mousemove 事件；
* 视窗大小变化 resize 事件，窗口调整完后再计算窗口大小，防止重复渲染；
* 其它。

（完）
