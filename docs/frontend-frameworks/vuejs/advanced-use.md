# 高级用法特性

## 1. 自定义 v-model

使用场景：在自定义的组件中，`v-model` 默认会利用名为 `value` 的 prop 和名为 `input` 的事件。但是像单选框、复选框等类型的输入控件，它们的 `value` 属性有其它用途。此时 `model` 选项可以用来避免这样的冲突。

下面演示一个例子（改自[官方文档](https://cn.vuejs.org/v2/guide/components-custom-events.html#自定义组件的-v-model)）：

编写一个自定义的复选框组件 `BaseCheckbox.vue`：

```vue
<template>
  <input type="checkbox" :checked="checked" @change="$emit('change', $event.target.checked)">
  <!--
      1. 上面的 input 使用了 v-bind 而不是 v-model
      2. "checked" 对应上 props 里的 checked
      3. @change 时间里的 'change' 和 model.event 里的 'change' 要对应起来，名字可以自定义
  -->
</template>

<script>
export default {
  model: {
    prop: 'checked', // 对应 props 中的 checked（名字两者可以自定义，但要前后一致）
    event: 'change'
  },
  props: {
    checked: Boolean,
    default() {
      return false
    }
  }
}
</script>
```

在组件上使用 `v-model` 的时候：

```vue
<template>
  <base-checkbox v-model="lovingVue"></base-checkbox>
</template>

<script>
import BaseCheckbox from './BaseCheckbox'

export default {
  components: {
    BaseCheckbox
  },
  data() {
    return {
      lovingVue: false
    }
  }
}
</script>
```

这里的 `lovingVue` 的值将会传入这个名为 `checked` 的 prop。同时当 `<base-checkbox>` 触发一个 `change` 事件并附带一个新的值的时候，这个 `lovingVue` 的值将会被更新。

## 2. $nextTick

Vue 是异步渲染，data 改变之后，DOM 不会立刻渲染。`$nextTick` 会在 DOM 渲染之后被触发，以获取最新 DOM 节点。

如下代码所示，如果不使用 `$nextTick`，那每次打印出来的数组长度是上一次渲染后的数组长度，而不是执行添加后的最新结果。

```vue
<template>
  <div id="app">
    <ul ref="itemList">
      <li v-for="(item, index) in list" :key="index">
        {{item}}
      </li>
    </ul>
    <button @click="addItem">添加一项</button>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      list: ['a', 'b', 'c']
    }
  },
  methods: {
    addItem() {
      this.list.push(`${Date.now()}`)
      this.list.push(`${Date.now()}`)
      this.list.push(`${Date.now()}`)

      // 1. 异步渲染，$nextTick 待 DOM 渲染完再回调
      // 3. 页面渲染时会将 data 的修改做整合，多次 data 修改只会渲染一次
      this.$nextTick(() => {
        // 获取 DOM 元素
        const ulElem = this.$refs.itemList
        // eslint-disable-next-line
        console.log(ulElem.childNodes.length)
      })
    }
  }
}
</script>
```

