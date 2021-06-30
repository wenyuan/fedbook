# 实现防抖函数（debounce）

## 功能描述

延迟要执行的动作，若在延迟的这段时间内再次触发了，则取消之前的动作，重新计时。

举例：电脑或手机的休眠倒计时，一旦再次操作就重新计时。

## 手写实现

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

## 测试用例

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

## 常见应用场景

连续的事件，只需触发一次回调的场景有：

* 搜索框场景：搜索时等用户完整输入内容后再发送查询请求。
* 按钮提交场景：防止多次提交按钮，只执行最后一次提交。
* 其它。

（完）
