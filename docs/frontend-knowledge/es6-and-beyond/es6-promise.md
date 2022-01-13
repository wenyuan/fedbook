# Promise

## 基本语法

创建 Promise 实例：

```javascript
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if ( /* 异步操作成功 */ ) {
    resolve(value)
  } else {
    reject(error)
  }
})
```

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是 `resolve` 和 `reject`，它们是两个函数，由 JavaScript 引擎提供，不用自己部署。

* 处理结果正常的话，调用 `resolve`（处理结果值），将 Promise 对象的状态从「未完成」变为「成功」（即从 pending 变为 resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去。
* 处理结果错误的话，调用 `reject`（Error 对象），将 Promise 对象的状态从「未完成」变为「失败」（即从 pending 变为 rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

Promise 实例生成以后，可以用 `then` 方法分别指定 resolved 状态和 rejected 状态的回调函数：

```javascript
promise.then(function(value) {
  // success
}, function(error) {
  // failure
})
```

Promise 内部的状态（pending、fulfilled、rejected）走向如下图所示：

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="631" height="258" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1050" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1051" d="M0,0 L14,5 L0,10 L0,0" fill="#e57373" stroke="#e57373" stroke-width="1"></path></marker><marker id="SvgjsMarker1054" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1055" d="M0,0 L14,5 L0,10 L0,0" fill="#e57373" stroke="#e57373" stroke-width="1"></path></marker><marker id="SvgjsMarker1058" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1059" d="M0,0 L14,5 L0,10 L0,0" fill="#e57373" stroke="#e57373" stroke-width="1"></path></marker><marker id="SvgjsMarker1062" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1063" d="M0,0 L14,5 L0,10 L0,0" fill="#e57373" stroke="#e57373" stroke-width="1"></path></marker></defs><g id="SvgjsG1008" transform="translate(25,108)"><path id="SvgjsPath1009" d="M 0 0L 149 0L 149 42L 0 42Z" stroke="rgba(229,115,115,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="129px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="9" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="20" x="74.5"><tspan id="SvgjsTspan1013" style="text-decoration:;">state: 'pending'</tspan></tspan></text></g></g><g id="SvgjsG1014" transform="translate(41,69)"><path id="SvgjsPath1015" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="8" transform="rotate(0)"><tspan id="SvgjsTspan1018" dy="20" x="60"><tspan id="SvgjsTspan1019" style="text-decoration:;">new Promise</tspan></tspan></text></g></g><g id="SvgjsG1020" transform="translate(260,43)"><path id="SvgjsPath1021" d="M 0 0L 149 0L 149 42L 0 42Z" stroke="rgba(229,115,115,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1022"><text id="SvgjsText1023" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="129px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="9" transform="rotate(0)"><tspan id="SvgjsTspan1024" dy="20" x="74.5"><tspan id="SvgjsTspan1025" style="text-decoration:;">resolve(res)</tspan></tspan></text></g></g><g id="SvgjsG1026" transform="translate(260,174)"><path id="SvgjsPath1027" d="M 0 0L 149 0L 149 42L 0 42Z" stroke="rgba(229,115,115,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1028"><text id="SvgjsText1029" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="129px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="9" transform="rotate(0)"><tspan id="SvgjsTspan1030" dy="20" x="74.5"><tspan id="SvgjsTspan1031" style="text-decoration:;">reject(err)</tspan></tspan></text></g></g><g id="SvgjsG1032" transform="translate(457,43)"><path id="SvgjsPath1033" d="M 0 0L 149 0L 149 42L 0 42Z" stroke="rgba(229,115,115,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1034"><text id="SvgjsText1035" font-family="微软雅黑" text-anchor="start" font-size="16px" width="129px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1" transform="rotate(0)"><tspan id="SvgjsTspan1036" dy="20" x="10"><tspan id="SvgjsTspan1037" style="text-decoration:;">state: 'fulfilled'</tspan></tspan><tspan id="SvgjsTspan1038" dy="20" x="10"><tspan id="SvgjsTspan1039" style="text-decoration:;">result: res</tspan></tspan></text></g></g><g id="SvgjsG1040" transform="translate(457,174)"><path id="SvgjsPath1041" d="M 0 0L 149 0L 149 42L 0 42Z" stroke="rgba(229,115,115,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1042"><text id="SvgjsText1043" font-family="微软雅黑" text-anchor="start" font-size="16px" width="129px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="-1" transform="rotate(0)"><tspan id="SvgjsTspan1044" dy="20" x="10"><tspan id="SvgjsTspan1045" style="text-decoration:;">state: 'rejected'</tspan></tspan><tspan id="SvgjsTspan1046" dy="20" x="10"><tspan id="SvgjsTspan1047" style="text-decoration:;">result: err</tspan></tspan></text></g></g><g id="SvgjsG1048"><path id="SvgjsPath1049" d="M410 64L433 64L433 64L453.4 64" stroke="#e57373" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1050)"></path></g><g id="SvgjsG1052"><path id="SvgjsPath1053" d="M410 195L433 195L433 195L453.4 195" stroke="#e57373" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1054)"></path></g><g id="SvgjsG1056"><path id="SvgjsPath1057" d="M175 129L193 129L193 64L256.4 64" stroke="#e57373" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1058)"></path></g><g id="SvgjsG1060"><path id="SvgjsPath1061" d="M175 129L193 129L193 195L256.4 195" stroke="#e57373" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1062)"></path></g><g id="SvgjsG1064" transform="translate(161,25)"><path id="SvgjsPath1065" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1066"><text id="SvgjsText1067" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="8" transform="rotate(0)"><tspan id="SvgjsTspan1068" dy="20" x="60"><tspan id="SvgjsTspan1069" style="text-decoration:;">成功</tspan></tspan></text></g></g><g id="SvgjsG1070" transform="translate(161,193)"><path id="SvgjsPath1071" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1072"><text id="SvgjsText1073" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="8" transform="rotate(0)"><tspan id="SvgjsTspan1074" dy="20" x="60"><tspan id="SvgjsTspan1075" style="text-decoration:;">失败</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（Promise 状态的走向）</p>
</div>

## Promise.prototype.then()

**基本语法**

> promise.then(onFulfilled, onRejected)

**示例**

```javascript
var promise = new Promise(function(resolve, reject) {
  resolve('传递给then的值')
})
promise.then(function(value) {
  console.log(value)
}, function(error) {
  console.error(error)
})
```

这段代码创建一个 Promise 对象，定义了处理 onFulfilled 和 onRejected 的函数（handler），然后返回这个 Promise 对象。

这个 Promise 对象会在变为 resolve 或者 reject 的时候分别调用相应注册的回调函数。

* 当 handler 返回一个正常值的时候，这个值会传递给 Promise 对象的 onFulfilled 方法。
* 定义的 handler 中产生异常的时候，这个值则会传递给 Promise 对象的 onRejected 方法。

## Promise.prototype.catch()

捕获异常是程序质量保障最基本的要求，可以使用 Promise 对象的 `catch` 方法来捕获异步操作过程中出现的任何异常。

**基本语法**

> p.catch(onRejected)

> p.catch(function(reason) { // rejection })

**示例**

```javascript
function test() {
  return new Promise((resolve, reject) => {
    reject(new Error('es'))
  })
}

test().catch((e) => {
  console.log(e.message) // es
})
```

这个代码展示了如何使用 `catch` 捕获 Promise 对象中的异常，那么 `catch` 捕获的是 Promise 内部的 Error 还是 Reject 呢？

```javascript
function test() {
  return new Promise((resolve, reject) => {
    throw new Error('wrong')
  })
}

test().catch((e) => {
  console.log(e.message) // wrong
})
```

这个代码对比着上个代码就能明显感受出来的，`throw Error` 和 `reject` 都触发了 `catch` 的捕获，而第一个用法中虽然也有 Error 但是它不是 throw，只是 reject 的参数是 Error 对象，换句话说 `new Error` 不会触发 `catch`，而是 `reject`。

::: warning
不建议在 Promise 内部使用 `throw` 来触发异常，而是使用 `reject(new Error())` 的方式来做，因为 `throw` 的方式并没有改变 Promise 的状态。
:::


