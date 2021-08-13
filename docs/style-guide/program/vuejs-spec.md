# Vue 项目规范

## 写在前面

根据入乡随俗原则，在 Vue 项目中 ：

* JavaScript 语句后不加分号
* 缩进使用两个空格

市面上常用的命名规范：

* `camelCase`（小驼峰式命名法 —— 首字母小写）
* `PascalCase`（大驼峰式命名法 —— 首字母大写）
* `kebab-case`（短横线连接式）
* `Snake`（下划线连接式）

## 工程目录

* 全局通用的组件放在 `/src/components/` 下。
* 页面/视图组件放在 `/src/views/` 下。
* 全局公共指令、过滤器（多于三个文件以上引用）分别放在 `src/` 目录下的 `directives/`、`filters/`。
* 当页面文件具有私有组件、指令、过滤器时，则建立一个与页面同名的目录，页面文件更名为 `index.vue`，然后在该目录下创建私有 `./components` 等文件夹。

例如：

```bash
src/
├── App.vue
├── assets
├── main.js
├── components                     # 全局通用组件
├── directive                      # 全局公共指令
├── filters                        # 全局公共过滤器
└── views                          # 页面/视图
    ├── login
    │   ├── components             # 私有组件
    │   └── index.vue
    └── profile
        ├── components             # 私有组件
        └── index.vue
```

## 命名规范

### 通用文件与文件夹

#### 1）项目名

全部采用小写方式，以**短横线**分隔。例如：`my-project-name`。

#### 2）目录名

有复数结构时，要采用复数命名法。例如：`docs`、`assets`、`components`、`directives`、`mixins`、`utils`、`views`。

#### 3）图像文件名

全部采用小写方式， 优先选择单个单词命名，多个单词命名以**下划线**分隔。

```bash
banner_sina.gif
menu_aboutus.gif
menutitle_news.gif
logo_police.gif
logo_national.gif
pic_people.jpg
pic_TV.jpg
```

#### 4）HTML 文件名

全部采用小写方式， 优先选择单个单词命名，多个单词命名以**下划线**分隔。

```bash
├── error_report.html
├── success_report.html
```

#### 5）CSS 文件名

全部采用小写方式， 优先选择单个单词命名，多个单词命名以**短横线**分隔。

```bash
├── normalize.less
├── base.less
├── date-picker.scss
├── input-number.scss
```

#### 6）JavaScript 文件名

全部采用小写方式， 优先选择单个单词命名，多个单词命名以**短横线**分隔。

```bash
├── index.js
├── plugin.js
├── util.js
├── date-util.js
├── account-model.js
├── collapse-transition.js
```

> 上述规则可以快速记忆为「静态文件下划线，编译文件短横线」。

### Vue 特色文件夹

在 Vue 工程中，这是对通用文件与文件夹命名规范的补充。

#### 1）位于 `components/` 下的直接子文件夹

* 代表着这类模块的类别。
* 由名词组成（例如：`Charts/`）。
* 最好只有一个单词，特殊情况可例外（good: `Car/`，`Order/`，`Cart/`）（bad: `CarInfo/`，`CarPage/`）。
* 如果有两个以上单词，采用 PascalBase 风格（例如：`BackToTop/`）

#### 2）位于 `views/` 下的文件夹和其它文件夹

* 代表着页面的名字，或者类名。
* 由名词组成（例如：`profile/`）。
* 如果有两个以上单词，采用 kebab-case 的风格（例如：`error-page/`）。

例如：

```bash
src/
├── App.vue
├── assets
├── main.js
├── components
│   ├── BackToTop             # 通用组件的文件夹
│   └── Charts                # 通用组件的文件夹
│       ├── Keyboard.vue
│       ├── LineMarker.vue
│       ├── MixChart.vue
│       └── mixins            # 其它文件夹（不是 components/ 的直接子文件夹）
├── directive
│   ├── clipboard             # 其它文件夹
│   └── permission            # 其它文件夹
├── filters
└── views
    ├── charts                # 视图组件的文件夹
    ├── clipboard             # 视图组件的文件夹
    ├── dashboard             # 视图组件的文件夹
    │   ├── admin             # 视图组件的文件夹
    │   │   ├── components
    │   │   └── index.vue
    │   ├── editor            # 视图组件的文件夹
    │   │   └── index.vue
    │   └── index.vue
    └── error-page            # 视图组件的文件夹
        ├── 401.vue
        └── 404.vue
```

### Vue 组件命名

#### 1）单文件组件名

文件扩展名为 `.vue` 的 `single-file components`（单文件组件）。单文件组件名应该始终是**单词大写开头**（PascalCase）。

推荐：

```bash
src/
├── MyComponent.vue
```

#### 2）单例组件名

**只拥有单个活跃实例的组件应该以 `The` 前缀命名，以示其唯一性**。

这不意味着组件只可用于一个单页面，而是每个页面只使用一次。这些组件永远不接受任何 prop，因为它们是为你的应用定制的。如果你发现有必要添加 prop，那就表明这实际上是一个可复用的组件，只是目前在每个页面里只使用一次。

比如，头部和侧边栏组件几乎在每个页面都会使用，不接受 prop，该组件是专门为该应用所定制的。

推荐：

```bash
components/
├── TheHeading.vue
├── TheSidebar.vue
```

不推荐：

```bash
components/
├── Heading.vue
├── MySidebar.vue

```

#### 3）基础组件名

> 基础组件：不包含业务，独立、具体功能的基础组件，比如**日期选择器**、**模态框**等。
> 这类组件作为项目的基础控件，会被大量使用，因此组件的 API 进行过高强度的抽象，可以通过不同配置实现不同的功能。

应用特定样式和约定的基础组件（也就是展示类的、无逻辑的或无状态、不掺杂业务逻辑的组件）应该全部以一个特定的前缀开头，比如 `Base`、`App` 或 `V`。

**基础组件在一个页面内可使用多次，在不同页面内也可复用，是高可复用组件**。

推荐：

```bash
components/
├── BaseButton.vue
├── BaseTable.vue
├── BaseIcon.vue
```

不推荐：

```bash
components/
├── MyButton.vue
├── VueTable.vue
├── Icon.vue
```

#### 4）业务组件名

> 业务组件：它不像基础组件只包含某个功能，而是在业务中被多个页面复用的（具有可复用性）。
> 它与基础组件的区别是：业务组件只在当前项目中会用到，不具有通用性，而且会包含一些业务，比如数据请求；而基础组件不含业务，在任何项目中都可以使用，功能单一，比如一个具有数据校验功能的输入框。

**掺杂了复杂业务的组件（拥有自身 `data`、`prop` 的相关处理）即业务组件**。应该以 `Custom` 前缀命名。

业务组件在一个页面内比如：某个页面内有一个卡片列表，而样式和逻辑跟业务紧密相关的卡片就是业务组件。

推荐：

```bash
components/
├── CustomCard.vue
```

#### 5）紧密耦合的组件名

该类组件只在某个父组件的场景下有意义，这层关系应该体现在其名字上。因为编辑器通常会按字母顺序组织文件，所以这样做可以把相关联的文件排在一起。

**和父组件紧密耦合的子组件一般以父组件名作为前缀命名**。

推荐：

```bash
components/
├── TodoList.vue
├── TodoListItem.vue
├── TodoListItemButton.vue
```

不推荐：

```bash
components/
├── TodoList.vue
├── ItemForTodoList.vue
├── ButtonForTodoListItem.vue
```

#### 6）组件名中单词顺序

**组件名应该以高级别的（通常是一般化描述的）单词开头，以描述性的修饰词结尾**。因为编辑器通常会按字母顺序组织文件，所以现在组件之间的重要关系一目了然。

这个表达比较抽象，下面以搜索和设置功能的组件为例，解释什么叫「高级别」。

推荐：

```bash
components/
├── SearchButtonClear.vue
├── SearchButtonRun.vue
├── SearchInputQuery.vue
├── SearchInputExcludeGlob.vue
├── SettingsCheckboxTerms.vue
├── SettingsCheckboxLaunchOnStartup.vue
```

不推荐：

```bash
components/
├── ClearSearchButton.vue
├── ExcludeFromSearchInput.vue
├── LaunchOnStartupCheckbox.vue
├── RunSearchButton.vue
├── SearchInput.vue
├── TermsCheckbox.vue
```

还有另一种多级目录的方式，把所有的搜索组件放到 `search/` 目录，把所有的设置组件放到 `settings/` 目录。我们只推荐在非常大型（如有 100+ 个组件）的应用下才考虑这么做，因为在多级目录间找来找去，要比在单个 components 目录下滚动查找花费的精力更多。

#### 7）组件名使用完整单词

**组件名应该倾向于完整单词而不是缩写**，这样便于团队合作与后期维护。编辑器中的自动补全已经让书写长命名的代价非常之低了，而其带来的明确性却是非常宝贵的。不常用的缩写尤其应该避免。

推荐：

```bash
components/
├── StudentDashboardSettings.vue
├── UserProfileOptions.vue
```

不推荐：

```bash
components/
├── SdSettings.vue
├── UProfOpts.vue
```

#### 8）视图组件名

> 视图文件夹：位于 `views/` 文件夹下，代表着一类页面的名字，存放视图组件。
> 视图组件：代表着某一页面的名字，或者类名。
> 视图组件与其它组件的区别是：视图组件位于 `view/` 文件夹或视图文件夹下，其它组件位于 `components/` 文件夹下。

* 视图组件可以直接位于 `views/` 文件夹下，例如：`Login.vue`、`Home.vue`。
* 视图文件夹的名字要代表着页面的名字，例如：`login/`、`error-page/`。
* 视图文件夹下只有一个视图组件的时候，该组件取名为 `index.vue`，例如：`login/index.vue`。
* 视图文件夹下有两个以上视图组件的时候，分别取名，要体现内部文件的所属类名，例如：`car/car-list.vue` 和 `car/car-detail.vue`。
* 尽量是名词。
* 常用结尾单词有（`detail`、`edit`、`list`、`info`、`report`）。
* 视图文件夹下可以存在私有 `components/`，其内部 `.vue` 文件遵循其它组件的命名方式（大驼峰）。
* 除 `components/` 下的，一律采用 kebab-case 的风格。

例如：

```bash
src/
├── components
│   ├── BackToTop               # 通用组件的文件夹
│   └── Charts                  # 通用组件的文件夹
│       ├── Keyboard.vue
│       ├── LineMarker.vue
│       ├── MixChart.vue
│       └── mixins              # 其它文件夹
└── views
    ├── login                   # 视图组件的文件夹
    │   └── index.vue
    ├── profile                 # 视图组件的文件夹
    │   ├── index.vue
    │   └── components
    ├── car                     # 视图组件的文件夹
    │   ├── car-list.vue        # 视图组件
    │   ├── car-detail.vue      # 视图组件
    │   └── components
    │       ├── CarListItem.vue
    │       └── CarInfoItem.vue
    └── error-page              # 视图组件的文件夹
        ├── 401.vue             # 视图组件
        └── 404.vue             # 视图组件
```

### Vue 组件内部参数命名

#### 1）name

**组件名应该始终是多个单词，应该始终是 PascalCase 的**。根组件 App 以及 `<transition>`、`<component>` 之类的 Vue 内置组件除外。这样做可以避免跟现有的以及未来的 HTML 元素相冲突，因为所有的 HTML 元素名称都是单个单词的。

推荐：

```javascript
export default {
  name: 'ToDoList',
  // ...
}
```

#### 2）prop

**在声明 prop 的时候，其命名应该始终使用 camelCase，而在模板和 JSX 中应该始终使用 kebab-case**。我们单纯的遵循每个语言的约定，在 JavaScript 中更自然的是 camelCase。而在 HTML 中则是 kebab-case。

推荐：

```html
<WelcomeMessage greeting-text="hi"/>
```

```javascript
export default {
  name: 'MyComponent',
  // ...
  props: {
    greetingText: {
      type: String,
      required: true,
      validator: function (value) {
        return ['syncing', 'synced',].indexOf(value) !== -1
      }
    }
  }
}
```

#### 3）router

**Vue Router Path 命名采用 kebab-case 格式**。用 Snake（如：`/user_info`）或 camelCase（如：`/userInfo`)的单词会被当成一个单词，搜索引擎无法区分语义。

推荐：

```javascript
{
  path: '/user-info', // user-info 能被搜索引擎解析成 user info
  name: 'UserInfo',
  component: UserInfo,
  meta: {
    title: ' - 用户',
    desc: ''
  }
},
```

不推荐：

```javascript
// bad
{
  path: '/user_info', // user_info 被搜索引擎当成一个单词
  name: 'UserInfo',
  component: UserInfo,
  meta: {
    title: ' - 用户',
    desc: ''
  }
},
```

#### 4）模板中组件

对于绝大多数项目来说，在单文件组件和字符串模板中组件名应该总是 PascalCase 的，但是在 DOM 模板中总是 kebab-case 的。

推荐：

```html
<!-- 在单文件组件和字符串模板中 --> 
<MyComponent/>

<!-- 在 DOM 模板中 --> 
<my-component></my-component>
```

#### 5）自闭合组件

在单文件组件、字符串模板和 JSX 中没有内容的组件应该是自闭合的 —— 但在 DOM 模板里永远不要这样做。

推荐：

```html
<!-- 在单文件组件和字符串模板中 -->
<MyComponent/>

<!-- 在所有地方 -->
<my-component></my-component>
```

#### 6）变量

* 命名方法：camelCase
* 命名规范：类型 + 对象描述或属性的方式

推荐：

```javascript
let tableTitle = "LoginTable"
let mySchool = "我的学校"
```

不推荐：

```javascript
var getTitle = "LoginTable"
```

#### 7）常量

* 命名方法：全部大写下划线分割
* 命名规范：使用大写字母和下划线来组合命名，下划线用以分割单词

推荐：

```javascript
const MAX_COUNT = 10
const URL = 'https://www.fedbook.cn'
```

#### 8）方法

* 命名方法：camelCase
* 命名规范：统一使用动词或者动词 + 名词形式

**1）普通情况下，使用动词 + 名词形式**

推荐：`jumpPage`、`openCarInfoDialog`

不推荐：`go`、`nextPage`、`show`、`open`、`login`

**2）请求数据方法，以 data 结尾**

推荐：`getListData`、`postFormData`

不推荐：`takeData`、`confirmData`、`getList`、`postForm`

**3）单个动词的情况**

推荐：`init`、`refresh`

| 动词 | 含义                      | 返回值                                         |
| --- | ------------------------- | -------------------------------------------- |
| can | 判断是否可执行某个动作（权）   | 函数返回一个布尔值。true：可执行；false：不可执行。   |
| has | 判断是否含有某个值           | 函数返回一个布尔值。true：含有此值；false：不含有此值。|
| is  | 判断是否为某个值             | 函数返回一个布尔值。true：为某个值；false：不为某个值。|
| get | 获取某个值                  | 函数返回一个非布尔值。                            |
| set | 设置某个值                  | 无返回值、返回是否设置成功或者返回链式对象。          |

#### 9）自定义事件

**自定义事件应始终使用 kebab-case 的事件名**。

不同于组件和 prop，事件名不存在任何自动化的大小写转换。而是触发的事件名需要完全匹配监听这个事件所用的名称。

```html
<MyComponent @my-event="handleDoSomething" />
```

```javascript
this.$emit('my-event')
```

不同于组件和 prop，事件名不会被用作一个 JavaScript 变量名或 property 名，所以就没有理由使用 camelCase 或 PascalCase 了。并且 `v-on` 事件监听器在 DOM 模板中会被自动转换为全小写 (因为 HTML 是大小写不敏感的)，所以 `v-on:myEvent` 将会变成 `v-on:myevent` —— 导致 `myEvent` 不可能被监听到。

* [原生事件参考列表](https://developer.mozilla.org/zh-CN/docs/Web/Events "原生事件参考列表")

由原生事件可以发现其使用方式如下：

```html
<div
  @blur="toggleHeaderFocus"
  @focus="toggleHeaderFocus"
  @click="toggleMenu"
  @keydown.esc="handleKeydown"
  @keydown.enter="handleKeydown"
  @keydown.up.prevent="handleKeydown"
  @keydown.down.prevent="handleKeydown"
  @keydown.tab="handleKeydown"
  @keydown.delete="handleKeydown"
  @mouseenter="hasMouseHoverHead = true"
  @mouseleave="hasMouseHoverHead = false">
</div>
```

而为了区分**原生事件**和**自定义事件**在 Vue 中的使用，建议除了多单词事件名使用 kebab-case 的情况下，自定义事件的命名还需遵守 **`on` + 动词** 的形式，如下：

```html
<!-- 父组件 -->
<div
  @on-search="handleSearch"
  @on-clear="handleClear"
  @on-clickoutside="handleClickOutside">
</div>
```

```javascript
// 子组件
export default {
  methods: {
    handleTriggerItem () {
      this.$emit('on-clear')
    }
  }
}
```

#### 10）事件方法

* 命名方法：camelCase
* 命名规范：handle + 名称（可选）+ 动词

```vue
<template>
  <div
    @click.native.stop="handleItemClick()"
    @mouseenter.native.stop="handleItemHover()">
  </div>
</template>

<script>

export default {
  methods: {
    handleItemClick () {
      //...
    },
    handleItemHover () {
      //...
    }
  }
}
</script>
```

## Vue 代码规范

### 代码结构

```vue
<template>
  <div id="my-component">
    <DemoComponent />
  </div>
</template>

<script>
import DemoComponent from '../components/DemoComponent'

export default {
  name: 'MyComponent',
  components: {
    DemoComponent
  },
  mixins: [],
  props: {},
  data () {
    return {}
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  destroyed () {},
  methods: {},
}
</script>

<style lang="scss" scoped>
#my-component {
}
</style>
```

### 书写顺序

#### 1）元素 attribute 顺序

这是 Vue 官方为组件选项推荐的默认顺序。它们被划分为几大类，所以你也能知道新添加的自定义 attribute 和指令应该放到哪里。

* **定义**（提供组件的选项）  
  * `is`
* **列表渲染**（创建多个变化的相同元素)
  * `v-for`
* **条件渲染**（元素是否渲染/显示）
  * `v-if`
  * `v-else-if`
  * `v-else`
  * `v-show`
  * `v-cloak`
* **渲染方式**（改变元素的渲染方式）
  * `v-pre`
  * `v-once`
* **全局感知**（需要超越组件的知识）
  * `id`
* **唯一的 attribute**（需要唯一值的 attribute）
  * `ref`
  * `key`
* **双向绑定**（把绑定和事件结合起来）
  * `v-model`
* **其它 attribute**（所有普通的绑定或未绑定的 attribute）
* **事件**（组件事件监听器）
  * `v-on`
* **内容**（覆写元素的内容）
  * `v-html`
  * `v-text`
  
注意：不推荐同时使用 `v-if` 和 `v-for`。

#### 2）组件方法顺序

这是 Vue 官方推荐的组件选项默认顺序。它们被划分为几大类，所以你也能知道从插件里添加的新 property 应该放到哪里。

* **副作用**（触发组件外的影响）
  * `el`
* **全局感知**（要求组件以外的知识）
  * `name`
  * `parent`
* **组件类型**（更改组件的类型）
  * `functional`
* **模板修改器**（改变模板的编译方式）
  * `delimiters`
  * `comments`
* **模板依赖**（模板内使用的资源）
  * `components`
  * `directives`
  * `filters`
* **组合**（向选项里合并 property）
  * `extends`
  * `mixins`
* **接口**（组件的接口）
  * `inheritAttrs`
  * `model`
  * `props` / `propsData`
* **本地状态**（本地的响应式 property）
  * `data`
  * `computed`
* **事件**（通过响应式事件触发的回调）
  * `watch`
  * 生命周期钩子（按照它们被调用的顺序）
    * `beforeCreated`
    * `created`
    * `beforeMount`
    * `mounted`
    * `beforeUpdate`
    * `updated`
    * `activated`
    * `deactivated`
    * `beforeDestroy`
    * `destroyed`
* **非响应式的 property**（不依赖响应系统的实例 property）
  * `methods`
* **渲染**（组件输出的声明式描述）
  * `templated` / `render`
  * `renderError`
  
### 书写格式

#### 1）多个 attribute 的元素

多个 attribute 的元素应该分多行撰写，每个 attribute 一行。

推荐：

```html
<img
  src="https://vuejs.org/images/logo.png"
  alt="Vue Logo">

<MyComponent
  foo="a"
  bar="b"
  baz="c"/>
```

不推荐：

```html
<img src="https://vuejs.org/images/logo.png" alt="Vue Logo">
<MyComponent foo="a" bar="b" baz="c"/>
```

#### 2）模板中简单的表达式

**组件模板应该只包含简单的表达式，复杂的表达式则应该重构为计算属性或方法**。

复杂表达式会让你的模板变得不那么声明式。我们应该尽量描述应该出现的**是什么**，而非**如何**计算那个值。而且计算属性和方法使得代码可以重用。

推荐：

```html
<!-- 在模板中 -->
{{ normalizedFullName }}
```

```javascript
// 复杂表达式已经移入一个计算属性
computed: {
  normalizedFullName: function () {
    return this.fullName.split(' ').map(function (word) {
      return word[0].toUpperCase() + word.slice(1)
    }).join(' ')
  }
}
```

不推荐：

```html
<!-- 在模板中 -->
{{
  fullName.split(' ').map((word) => {
    return word[0].toUpperCase() + word.slice(1)
  }).join(' ')
}}
```

#### 3）带引号的 attribute 值

非空 HTML 特性值应该始终带双引号。

推荐：

```html
<input type="text">
<AppSidebar :style="{ width: sidebarWidth + 'px' }">
```

不推荐：

```html
<input type=text>
<AppSidebar :style={width:sidebarWidth+'px'}>
```

#### 4）指令缩写

* 用 `:` 表示 `v-bind:`
* 用 `@` 表示 `v-on:`
* 用 `#` 表示 `v-slot:`

```html
<input
  :value="newTodoText"
  :placeholder="newTodoInstructions">

<input
  @input="onInput"
  @focus="onFocus">

<template #header>
  <h1>Here might be a page title</h1>
</template>

<template #footer>
  <p>Here's some contact info</p>
</template>
```

### 赋值要求

#### 1）data

组件的 `data` 必须是一个函数。

```javascript
// In a .vue file
export default {
  data () {
    return {
      foo: 'bar'
    }
  }
}
```

#### 2）prop

Prop 定义应该尽量详细。

```javascript
export default {
  props: {
    status: {
      type: String,
      required: true,
      validator: function (value) {
        return [
          'syncing', 
          'synced',
          'version-conflict',
          'error'
        ].indexOf(value) !== -1
      }
    }
  }
}
```

#### 3）computed

**应该把复杂计算属性分割为尽可能多的更简单的属性**。小的、专注的计算属性减少了信息使用时的假设性限制，所以需求变更时也用不着那么多重构了。

推荐：

```javascript
computed: {
  basePrice: function () {
    return this.manufactureCost / (1 - this.profitMargin)
  },
  discount: function () {
    return this.basePrice * (this.discountPercent || 0)
  },
  finalPrice: function () {
    return this.basePrice - this.discount
  }
}
```

不推荐：

```javascript
computed: { 
  price: function () { 
    var basePrice = this.manufactureCost / (1 - this.profitMargin) 
    return ( 
      basePrice - 
      basePrice * (this.discountPercent || 0) 
    ) 
  } 
}
```

### API 用法要求

#### 1）为 `v-for` 设置键值

**在组件上必须用 `key` 搭配 `v-for`**，以便维护内部组件及其子树的状态。甚至在元素上维护可预测的行为，比如动画中的[对象固化（object constancy）](https://bost.ocks.org/mike/constancy/)。

```html
<ul>
  <li
    v-for="todo in todos"
    :key="todo.id">
      {{ todo.text }}
  </li>
</ul>
```

#### 2）`v-if` 和 `v-for` 互斥

永远不要把 `v-if` 和 `v-for` 同时用在同一个元素上。

不推荐（控制台会报错）：

```html
<ul>
  <li
    v-for="user in users"
    v-if="shouldShowUsers"
    :key="user.id">
      {{ user.name }}
  </li>
</ul>
```

一般我们在两种常见的情况下会倾向于这样做：

* 为了过滤一个列表中的项目（比如 `v-for="user in users" v-if="user.isActive"`）。在这种情形下，请将 `users` 替换为一个计算属性（比如 `activeUsers`），让其返回过滤后的列表。

推荐：

```html
<ul>
  <li
    v-for="user in activeUsers"
    :key="user.id">
      {{ user.name }}
  </li>
</ul>
```

```javascript
computed: {
  activeUsers: function () {
    return this.users.filter((user) => {
      return user.isActive
    })
  }
}
```

* 为了避免渲染本应该被隐藏的列表（比如 `v-for="user in users" v-if="shouldShowUsers"`）。这种情形下，请将 `v-if` 移动至容器元素上（比如 `ul`，`ol`）。

推荐：

```html
<ul v-if="shouldShowUsers">
  <li
    v-for="user in users"
    :key="user.id">
      {{ user.name }}
  </li>
</ul>
```

不推荐：

```html
<ul>
  <li
    v-for="user in users"
    v-if="shouldShowUsers"
    :key="user.id">
      {{ user.name }}
  </li>
</ul>
```

（完）
