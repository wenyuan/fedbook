# 实现防抖函数（debounce）

## 1. 功能描述

函数防抖（debounce），就是指触发事件后，在 n 秒内函数只能执行一次，如果触发事件后在 n 秒内又触发了事件，则会重新计算函数延迟执行时间。

## 2. 手写实现

```javascript
// func 是用户传入需要防抖的函数
// wait 是等待时间
const debounce = (func, wait = 500) => {
  // 缓存一个定时器 id
  let timer = 0
  // 这里返回的函数是每次用户实际调用的防抖函数
  // 如果已经设定过定时器了就清空上一次的定时器
  // 开始一个新的定时器，延迟执行用户传入的方法
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
```

## 3. 适用场景

* 搜索框 input 事件；
* 鼠标移动 mousemove 事件；
* 视窗大小变化 resize 事件；
* 其它。
