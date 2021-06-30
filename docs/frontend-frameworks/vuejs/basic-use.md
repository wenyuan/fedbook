# 基础用法要点

## 循环列表渲染

`v-for` 支持遍历数组和对象，其中 `key` 很重要，但不能乱写（如 random 或者 index），尽量要写和业务有关联的信息（比如 id）。

`v-for` 和 `v-if` 不能一起使用，否则 ESLint 会报错（因为 `v-for` 的计算优先级更高，会生成一系列带有 `v-if` 属性的标签，产生重复判断）。

## 事件参数 event

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

## 事件修饰符

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

## 按键修饰符

```vue
<!-- 即使 Alt 或 Shift 被一同按下时也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button @click.ctrl.exact="onCtrlClick">B</button>

<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button @click.exact="onClick">C</button>
```

## 表单绑定 v-model

### 作用范围

`v-model` 指令可以作用的元素为表单元素，它会元素创建了双向数据绑定：

* input(type='text', type='radio', type='checkbox')
* textarea
* select

`v-model` 还可以用在自定义组件上，具体说明见官方文档。

### 使用特例

在 Vue 中，多行文本区域插值要使用 `v-model` 来代替：

```vue
<!-- Vue 中应该使用 v-model 来插值 -->
<textarea v-model="desc"></textarea>

<!-- Vue 中这么用是不会生效的 -->
<textarea>{{ desc }}</textarea>
```

### 修饰符 lazy number trim

```vue
<!-- 在 change 时而非 input 时更新 -->
<!-- 在默认情况下，v-model 在每次 input 事件触发后将输入框的值与数据进行同步 -->
<input type="text" v-model.lazy="name">

<!-- 自动过滤用户输入的首尾空白字符 -->
<input type="text" v-model.number="name">

<!-- 自动将用户的输入值转为数值类型 -->
<input type="number" v-model.trim="age">
```

## 父子组件通信

### 通过 prop 实现父传子

子组件的 `props` 选项能够接收来自父组件数据，这是一种单向绑定，即只能父组件向子组件传递，不能反向。示例如下：

父组件 `Parent.vue`：

```vue
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

子组件 `Child.vue`：

```vue
<template>
  <div>
    <h1>我是子组件</h1>
    <p>父组件对我说：{{ message }}</p>
  </div>
</template>

<script>
export default {
  // 子组件通过 props 属性，接收父组件传过来的值
  props: {
    message: {
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

### 通过 $emit 实现子传父

子组件通过 `$emit` 触发事件给父组件发送消息，父组件通过 `v-on`（简写为 `@`） 监听子组件提交的事件。示例如下：

父组件 `Parent.vue`：

```vue
<template>
  <div>
    <h1>我是父组件</h1>
    <child @get-message="showMsg"></child>
  </div>
</template>

<script>
import Child from '../components/Child.vue'

export default {
  components: { Child },
  methods: {
    // 参数就是子组件传递出来的数据
    showMsg(msg) {
      console.log(msg)
    }
  }
}
</script>
```

子组件 `Child.vue`：

```vue
<template>
  <div>
    <h1>我是子组件</h1>
    <button @click="sendMsg">发送</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      childSay: 'hello, parent'
    }
  },
  methods: {
    // 子组件通过 emit 方法触发父组件中定义好的函数，从而将子组件中的数据传递给父组件
    sendMsg() {
      this.$emit('get-message', this.childSay)
    }
  }
}
</script>
```

### 通过 $ref 获取子组件实例

对于 `ref`：

* 如果 `ref` 用在子组件上，指向的是组件实例，可以理解为对子组件的索引，通过 `$ref` 可以获取到在子组件里定义的属性和方法。
* 如果 `ref` 在普通的 DOM 元素上使用，引用指向的就是 DOM 元素，通过 `$ref` 可能获取到该 DOM 的属性集合，轻松访问到 DOM 元素，作用与 jQuery 选择器类似。

那么就好理解了，可以在父组件中通过 `$ref` 来直接获取子组件中的属性和方法。示例如下：

父组件 `Parent.vue`：

```vue
<template>
  <div>
    <h1>我是父组件</h1>
    <child ref="child"></child>
  </div>
</template>

<script>
import Child from '../components/Child.vue'

export default {
  components: { Child },
  mounted() {
    console.log(this.$refs.child)
    this.$refs.child.getMessage('hello')
  }
}
</script>
```

子组件 `Child.vue`：

```vue
<template>
  <div>
    <h1>我是子组件</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: ''
    }
  },
  methods: {
    // 由父组件通过 $ref 引用来调用子组件的该方法
    getMessage(msg) {
      this.message = msg
    }
  }
}
</script>
```

**对比（`prop` 和 `$ref` 之间的区别）**：

* `prop` 着重于数据的传递，它并不能调用子组件里的属性和方法。像创建文章组件时，自定义标题和内容这样的使用场景，最适合使用 `prop`。
* `$ref` 着重于索引，主要用来调用子组件里的属性和方法，其实并不擅长数据传递。而且 `ref` 用在 DOM 元素的时候，能使到选择器的作用，这个功能比作为索引更常有用到。

## 兄弟组件通信

项目中，我们经常会遇到兄弟组件（或隔了很多层的组件、甚至是两个不相关的组件）之间通信的情况。在大型项目中我们可以通过引入 Vuex 轻松管理各组件之间通信问题，但在一些小型的项目中，可以通过自定义事件来实现，大体思路如下：

1. 创建一个 Vue 的实例作为媒介，让各个兄弟组件共用同一个事件机制。
2. 数据传递方，通过一个 EventBus 事件触发 `bus.$emit(方法名, 传递的数据)`。
3. 数据接收方，在 `mounted` 中绑定监听事件，在 `beforeDestroy` 中解绑监听事件。

下面演示一个例子：

首先编写一个 `event-bus.js`，它的作用就是返回一个 Vue 的实例。

```javascript
// event-bus.js
import Vue from 'vue'

export default new Vue()
```

组件 A 和组件 B 里面分别引入 `event-bus.js` 返回的 Vue 实例（此处命名为 `bus`）。`bus` 本质上就是 Vue 的实例，而 Vue 的实例本身已经实现了 `$emit`、`$on`、`$off` 这些自定义事件的能力。

在组件 A 中传递数据（触发自定义事件）。

```vue
<!-- 组件A：ComponentA.vue -->
<template>
  <div class="comment-a">
    <button @click="sendMsg">向组件B传值</button>
  </div>
</template>

<script>
import bus from './event-bus'

export default {
  data() {
    return {
      msg: ''
    }
  },
  methods: {
    sendMsg() {
      // 调用自定义事件
      bus.$emit('listenToA', this.msg)
    }
  }
}
</script>
```

在组件 B 中接收数据（监听自定义事件），需要做两步操作，一是绑定自定义事件，二是在 `beforeDestroy` 中解绑自定义事件。

```vue
<!-- 组件B：ComponentB.vue -->
<template>
  <div class="comment-b"></div>
</template>

<script>
import bus from './event-bus'

export default {
  mounted() {
    // 绑定自定义事件
    bus.$on('listenToA', this.getAData)
  },
  beforeDestroy() {
    // 及时销毁自定义事件，否则可能造成内存泄露
    bus.$off('listenToA', this.getAData)
  },
  methods: {
    getAData(val) {
      console.log(`组件 A 传递过来的数据: ${val}`)
    }
  }
}
</script>
```

**注意事项（区别）**：

* `this.$emit(方法名, 传递的数据)` 是调用父组件的事件。
* `bus.$emit(方法名, 传递的数据)` 是调用自定义事件。

## 组件生命周期（单个组件）

* 挂载阶段
  * beforeCreate => created => beforeMount => mounted
* 更新阶段
  * beforeUpdate => updated
* 销毁阶段
  * beforeDestroy => destroyed

在 created 阶段，把 Vue 实例初始化，存在内存中；在 mounted 阶段，组件在网页中渲染完成，此时可以做一些 Ajax 请求等操作。

在 beforeDestroy 阶段，需要解除自定义事件的绑定、销毁定时任务、解除之前定义的 window 和 document 事件等。

## 组件生命周期（父子组件）

**1）加载渲染过程：创建 Vue 实例时从外到内，渲染时从内到外**

父 beforeCreate => 父 created => 父 beforeMount => 子 beforeCreate => 子 created => 子 beforeMount => 子 mounted => 父 mounted

**2）子组件更新过程**

父 beforeUpdate => 子 beforeUpdate => 子 updated => 父 updated

**3）父组件更新过程**

父 beforeUpdate => 父 updated

**4）销毁过程**

父 beforeDestroy => 子 beforeDestroy => 子 destroyed => 父 destroyed

（完）
