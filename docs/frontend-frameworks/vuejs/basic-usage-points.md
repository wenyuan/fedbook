# 基础用法要点

## 1. 循环列表渲染

`v-for` 支持遍历数组和对象，其中 `key` 很重要，但不能乱写（如 random 或者 index），尽量要写和业务有关联的信息（比如 id）。

`v-for` 和 `v-if` 不能一起使用，否则 ESLint 会报错（因为 `v-for` 的计算优先级更高，会生成一系列带有 `v-if` 属性的标签，产生重复判断）。

## 2. 事件参数 event

在 Vue 中，事件参数 `event` 就是原生的 event 对象，没有进行任何的装饰。`event.target` 是事件监听的对象，即挂载到哪个元素上的；`event.currentTarget` 是事件被触发的地方，

用法：

* 不传参数时，默认会传递一个 `event` 参数：

```vue
<template>
  <button @click="increment">按钮一</button>
</template>

<script>
export default {
  methods: {
    increment(event) {}
  }
}
</script>
```

* 传递自定义参数时，如果还需要获取 `event` 参数，则需要手动传递 `$event` 参数：

```vue
<template>
  <button @click="increment(1, $event)">按钮二</button>
</template>

<script>
export default {
  methods: {
    increment(val, event) {}
  }
}
</script>
```

## 3. 事件修饰符

```vue
<!-- 阻止单击事件继续传播 -->
<a v-on:click.stop="doThis"></a>
<!-- 提交事件不再重载页面 -->
<form v-on:submit.prevent="onsubmit"></form>
<!-- 修饰符可以串联 -->
<a v-on:click.stop.prevent="doThat"></a>
<!-- 只有修饰符 -->
<form v-on:submit.prevent></form>
<!-- 添加事件监听器时使用事件捕获模式 -->
<!-- 即内部元素触发的事件先在此处理，然后才交由内部元素进行处理 -->
<div v-on:click.capture="doThat">...</div>
<!-- 只当在 event.target 是当前元素自身时触发处理函数 -->
<!-- 即事件不是从内部元素触发的 -->
<div v-on:click.self="doThat">...</div>
```

## 4. 按键修饰符

```vue
<!-- 即使 Alt 或 Shift 被一同按下时也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button @click.ctrl.exact="onCtrlClick">B</button>

<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button @click.exact="onClick">C</button>
```

## 5. 表单绑定 v-model

### 5.1 作用范围

`v-model` 指令可以作用的元素为表单元素，它会元素创建了双向数据绑定：

* input(type='text', type='radio', type='checkbox')
* textarea
* select

`v-model` 还可以用在自定义组件上，具体说明见官方文档。

### 5.2 使用特例

在 Vue 中，多行文本区域插值要使用 `v-model` 来代替：

```vue
<!-- Vue 中应该使用 v-model 来插值 -->
<textarea v-model="desc"></textarea>

<!-- Vue 中这么用是不会生效的 -->
<textarea>{{desc}}</textarea>
```

### 5.3 修饰符 lazy number trim

```vue
<!-- 在 change 时而非 input 时更新 -->
<!-- 在默认情况下，v-model 在每次 input 事件触发后将输入框的值与数据进行同步 -->
<input type="text" v-model.lazy="name">

<!-- 自动过滤用户输入的首尾空白字符 -->
<input type="text" v-model.number="name">

<!-- 自动将用户的输入值转为数值类型 -->
<input type="number" v-model.trim="age">
```

## 6. 父子组件通信

### 6.1 通过 prop 实现父传子

子组件的 `props` 选项能够接收来自父组件数据，这是一种单向绑定，即只能父组件向子组件传递，不能反向。下面演示一个例子：

```vue
<!-- 父组件：Parent.vue -->
<template>
  <div>
    <h1>我是父组件</h1>
    <child :message="msg"></child>
  </div>
</template>

<script>
import Child from '../components/Child.vue'

export default {
  components: { Child },
  data() {
    return {
      msg: 'hello, child'
    }
  }
}
</script>
```

```vue
<!-- 子组件：Child.vue -->
<template>
  <div>
    <h1>我是子组件</h1>
    <p>父组件对我说：{{ msg }}</p>
  </div>
</template>

<script>
export default {
  // 子组件通过 props 属性，接收父组件传过来的值
  props: {
    msg: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
}
</script>
```

**注意事项（单向数据流）**：

* 每次父级组件发生变更时，子组件中所有的 prop 都将会刷新为最新的值。
* 不允许在子组件内部改变 prop，避免这个参数被多个子组件引用时，无法找到数据不正常的原因。
  * 如果子组件中 prop 是对象或数组，子组件对其修改后父组件相应的值也会修改（**但不允许这么做**）；如果是字符串等基本数据类型，则会报错。
  * 如果需要将父组件传递进来的值作为一个本地数据的初始值来使用，则推荐在子组件中额外定义一个**本地的 data property**，并将这个 prop 用作其初始值。
  * 如果这个 prop 以一种原始的值传入且需要进行转换（例如大小写、字符串拼接等），则最好使用这个 prop 的值来定义一个**计算属性**。

### 6.2 通过 $emit 实现子传父

### 6.3 通过 $ref 获取子组件实例