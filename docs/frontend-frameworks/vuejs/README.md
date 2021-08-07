# Vue.js

Vue.js 是一款渐进式 JavaScript 框架。

虽然没有完全遵循 MVVM 模型，但是 Vue 的设计也受到了它的启发。因此经常会使用 vm（ViewModel 的缩写）这个变量名表示 Vue 实例。

```javascript
var vm = new Vue({
  // 选项
})
```

<hr>

对 MVVM 的理解：

<div style="text-align: center;">
  <img src="./assets/mvvm.png" alt="MVVM 图示">
  <p style="text-align:center; color: #888;">（MVVM 图示，图来源于官网文档）</p>
</div>

MVVM 分为 Model、View、ViewModel 三者。

* Model：代表数据模型，数据和业务逻辑都在 Model 层中定义；
* View：代表 UI 视图，负责数据的展示；
* ViewModel：就是与界面（View）对应的 Model。因为数据库结构往往是不能直接跟界面控件一一对应上的，所以需要再定义一个数据对象专门对应 View 上的控件。而 ViewModel 的职责就是把 Model 对象封装成可以显示和接受输入的界面数据对象。

比如 UI 中有一个 li 列表，它是怎么与我们的数据对应的，就是通过 ViewModel。

Model 和 View 并无直接关联，而是通过 ViewModel 来进行联系的，Model 和 ViewModel 之间有着双向数据绑定的联系。因此当 Model 中的数据改变时会触发 View 层的刷新，View 中由于用户交互操作而改变的数据也会在 Model 中同步。

<div style="text-align: center;">
  <img src="./assets/mvvm-demo.png" alt="MVVM 例子">
  <p style="text-align:center; color: #888;">（MVVM 例子）</p>
</div>

<hr>

关于 Vue.js 的知识点，主要参考： 

* 官方文档

<div style="text-align: right">
  <svg t="1599208046527" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1194" width="64" height="64"><path d="M627.85285817 77.66360895h185.07382266L512 598.88964363 211.07331917 77.66360895H10.45553197L512 946.33639105l501.54446803-868.78460919z" fill="#41B883" p-id="1195"></path><path d="M812.92668083 77.66360895H627.85285817L512 278.28139617 396.14714183 77.66360895H211.07331917L512 598.88964363z" fill="#34495E" p-id="1196"></path></svg>
</div>
