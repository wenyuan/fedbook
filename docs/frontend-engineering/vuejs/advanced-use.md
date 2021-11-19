# 高级用法特性

## 自定义 v-model

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

在父组件上使用 `v-model` 的时候：

```vue
<template>
  <h1>我是父组件</h1>
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

## $nextTick

Vue 是异步渲染，data 改变之后，DOM 不会立刻渲染。`$nextTick` 会在 DOM 渲染之后被触发，以获取最新 DOM 节点。

如下代码所示，如果不使用 `$nextTick`，那每次打印出来的数组长度是上一次渲染后的数组长度，而不是执行添加后的最新结果。

```vue
<template>
  <div id="app">
    <ul ref="itemList">
      <li v-for="(item, index) in list" :key="index">
        {{ item }}
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
      // 2. 页面渲染时会将 data 的修改做整合，多次 data 修改只会渲染一次
      this.$nextTick(() => {
        // 获取 DOM 元素
        const ulElem = this.$refs.itemList
        console.log(ulElem.childNodes.length)
      })
    }
  }
}
</script>
```

总结一下 `$nextTick` 的特点：

* 汇总 data 的修改，一次性更新视图
* 能够减少 DOM 操作次数，提高性能

## slot 插槽

### 基本使用

slot 的基本用法是在父组件中往子组件插入一段内容（不一定只是字符串），示例如下：

父组件引入了一个名为 `SlotDemo.vue` 的子组件，向其传入一个动态属性 `url` 以及一个类似子节点的 `website.title`。

```vue
<template>
  <div>
    <h1>我是父组件</h1>
    <slot-demo :url="website.url">
      {{ website.title }}
    </slot-demo>
  </div>
</template>

<script>
import SlotDemo from './SlotDemo'

export default {
  components: {
    SlotDemo,
  },
  data() {
    return {
      website: {
        url: 'https://fedbook.cn/',
        title: '前端修炼小册'
      },
    }
  }
}
</script>
```

子组件除了在 `props` 中接收父组件传进来的 `url`，还多了一个 `<slot></slot>` 标签，它接收父组件中写的子节点 `website.title` 中的内容。

```vue
<template>
  <a :href="url">
    <slot>
      默认内容，即父组件没设置内容时，显示这句话
    </slot>
  </a>
</template>

<script>
export default {
  props: ['url'],
  data() {
    return {}
  }
}
</script>
```

### 作用域插槽

有时我们需要让插槽内容能够访问子组件中才有的数据，即在父组件中获取子组件 `data` 里的值，就需要用到作用域插槽，示例如下：

首先在子组件的 `data` 中定义一个 `website` 对象，再给 `<slot></slot>` 标签定义一个动态属性 `slotData` （名字可自定义）并赋值为 `website`。

```vue
<template>
  <a :href="url">
    <slot :slotData="website">
      {{ website.subTitle }} <!-- 默认值显示 subTitle ，即父组件不传内容时 -->
    </slot>
  </a>
</template>

<script>
export default {
    props: ['url'],
    data() {
      return {
        website: {
          url: 'https://cn.vuejs.org/',
          title: 'Vue.js'
        }
      }
    }
}
</script>
```

父组件调用子组件时，现在增加了一个 `<template>` 标签，给它设置一个 `v-slot` 属性且值为 `slotProps`（名字可自定义）。

在新增的 `<template>` 标签中进行插值，例如需要获取子组件 `data` 中的 `website.title`，写法就是 `slotProps.slotData.title`（`slotData` 对应的就是子组件的 `website`）。

此时页面显示的就是子组件中的 `title` 值：

```vue
<template>
  <div>
    <h1>我是父组件</h1>
    <scoped-slot-demo :url="website.url">
      <template v-slot="slotProps">
        {{ slotProps.slotData.title }}
      </template>
    </scoped-slot-demo>
  </div>
</template>

<script>
import ScopedSlotDemo from './ScopedSlotDemo'

export default {
  components: {
    ScopedSlotDemo,
  },
  data() {
    return {
      website: {
        url: 'https://fedbook.cn/',
        title: '前端修炼小册'
      }
    }
  }
}
</script>
```

### 具名插槽

具名插槽用于子组件中有多个 slot 的场景，父组件往子组件传值时需要对应上名字，示例如下：

子组件中每个 `<slot>` 元素有一个特殊的 `name` 属性，如果不指定 `name` 属性则默认是 "default"：

```vue
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

父组件中，在向具名插槽提供内容的时候，我们可以在一个 `<template>` 元素上使用 `v-slot` 指令，该指令的值就要对应上子组件中 `<slot>` 元素的 `name`。

任何没有被包裹在带有 `v-slot` 的 `<template>` 中的内容都会被视为默认插槽的内容。

```vue
<template>
  <div>
    <h1>我是父组件</h1>
    <named-slot-demo>
      <template v-slot:header>
        <h1>将插入 header slot 中</h1>
      </template>
        
      <p>将插入 main slot 中，即未命名的 slot</p>
      <p>也将插入 main slot 中</p>
        
      <template v-slot:footer>
        <p>将插入 footer slot 中</p>
      </template>
    </named-slot-demo>
  </div>
</template>

<script>
import NamedSlotDemo from './NamedSlotDemo'

export default {
  components: {
    NamedSlotDemo,
  },
  data() {
    return {}
  }
}
</script>
```

## 动态组件

动态组件用于在某个区域切换显示不同组件的场景，可以通过 Vue 的 `<component>` 元素加一个特殊的 `is` 属性来实现。

代码示例：

```vue
<component :is="componentName"></component>
```

其中，`componentName` 传入需要显示的组件名。

## 异步组件

同步加载的组件在打包的时候只会打成一个包，如果体积过大，会导致每次进入页面初始化的时候需要加载很大的一个文件：

```vue
<script>
import FormDemo1 from './FormDemo1'
import FormDemo2 from './FormDemo2'

export default {
  component: {
    FormDemo1,
    FormDemo2
  }
}
</script>
```

异步加载组件是通过 `import()` 函数来引入组件，可以实现按需加载/异步加载大组件，从而提升网页加载性能。

```vue
<script>
export default {
  component: {
    FormDemo: () => import('./FormDemo')
  }
}
</script>
```

## 缓存组件

缓存组件的意思是在频繁切换页面时（例如 Tab 切换），不需要重复渲染，常用于 Vue 的性能优化。

通过 keep-alive 来实现缓存组件，示例如下：

```vue
<template>
  <div>
    <button @click="changeState('A')">A</button>
    <button @click="changeState('B')">B</button>
    <button @click="changeState('C')">C</button>

    <keep-alive> <!-- 模拟 tab 切换 -->
      <KeepAliveStageA v-if="state === 'A'"/>
      <KeepAliveStageB v-if="state === 'B'"/>
      <KeepAliveStageC v-if="state === 'C'"/>
    </keep-alive>
  </div>
</template>

<script>
import KeepAliveStageA from './KeepAliveStateA'
import KeepAliveStageB from './KeepAliveStateB'
import KeepAliveStageC from './KeepAliveStateC'

export default {
  components: {
    KeepAliveStageA,
    KeepAliveStageB,
    KeepAliveStageC
  },
  data() {
    return {
      state: 'A'
    }
  },
  methods: {
    changeState(state) {
      this.state = state
    }
  }
}
</script>
```

**keep-alive 和 v-show 的区别**：

* 控制层级不同，v-show 是通过原生的 CSS（display）；keep-alive 是在 Vue 层级进行的 JS 对象的渲染
* 实际使用中，简单的标签可以使用 v-show，复杂的组件结构（例如 Tab 切换）使用 keep-alive。

**keep-alive 和 v-if 的区别**：

* v-if 也是 Vue 本身机制控制的，但会销毁和重新渲染组件，也就是会频繁触发组件的 mounted 和 destroyed；而 keep-alive 的方式，Vue 会把组件缓存，不需要走渲染流程。

## mixin

mixin 用于将多个组件的相同逻辑抽离出来，可以避免重复编写相同代码。

但 mixin 并不是完美的解决方案，会有一些问题：

* 变量来源不明确，不利于阅读
* 多 mixin 可能会造成命名冲突
* mixin 和组件可能出现多对多的关系，复杂度较高

Vue3 提出的 Composition API 旨在解决这些问题。

（完）
