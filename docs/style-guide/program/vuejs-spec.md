# Vue 项目规范

## 写在前面

根据入乡随俗原则，在 Vue 项目中 ：

* JavaScript 语句后不加分号
* 缩进使用两个空格

## 工程目录安排

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
    │   ├── components             # 私有组件
    │   └── index.vue
    └── profile
        ├── components             # 私有组件
        └── index.vue
```

## 项目文件命名规范

### 项目名

全部采用小写方式，以**短横线**分隔。例如：`my-project-name`。

### 目录名

**有复数结构时，要采用复数命名法**。例如：docs、assets、components、directives、mixins、utils、views。

### 图像文件名

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

### HTML 文件名

全部采用小写方式， 优先选择单个单词命名，多个单词命名以**下划线**分隔。

```bash
├── error_report.html
├── success_report.html
```

### CSS 文件名

全部采用小写方式， 优先选择单个单词命名，多个单词命名以**短横线**分隔。

```bash
├── normalize.less
├── base.less
├── date-picker.scss
├── input-number.scss
```

### JavaScript 文件名

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

## Vue 组件命名规范

### 单文件组件名

文件扩展名为 `.vue` 的 `single-file components`（单文件组件）。单文件组件名应该始终是**单词大写开头**（PascalCase）。

```bash
src/
├── MyComponent.vue
```

### 单例组件名

**只拥有单个活跃实例的组件应该以 `The` 前缀命名，以示其唯一性**。

这不意味着组件只可用于一个单页面，而是每个页面只使用一次。这些组件永远不接受任何 prop，因为它们是为你的应用定制的。如果你发现有必要添加 prop，那就表明这实际上是一个可复用的组件，只是目前在每个页面里只使用一次。

比如，头部和侧边栏组件几乎在每个页面都会使用，不接受 prop，该组件是专门为该应用所定制的。

```bash
components/
├── TheHeading.vue
├── TheSidebar.vue
```

### 基础组件名

> 基础组件：不包含业务，独立、具体功能的基础组件，比如**日期选择器**、**模态框**等。
> 这类组件作为项目的基础控件，会被大量使用，因此组件的 API 进行过高强度的抽象，可以通过不同配置实现不同的功能。

应用特定样式和约定的基础组件（也就是展示类的、无逻辑的或无状态、不掺杂业务逻辑的组件）应该全部以一个特定的前缀开头 —— Base。

**基础组件在一个页面内可使用多次，在不同页面内也可复用，是高可复用组件**。

```bash
components/
├── BaseButton.vue
├── BaseTable.vue
├── BaseIcon.vue
```

### 业务组件

> 业务组件：它不像基础组件只包含某个功能，而是在业务中被多个页面复用的（具有可复用性）。
> 它与基础组件的区别是：业务组件只在当前项目中会用到，不具有通用性，而且会包含一些业务，比如数据请求；而基础组件不含业务，在任何项目中都可以使用，功能单一，比如一个具有数据校验功能的输入框。

**掺杂了复杂业务的组件（拥有自身 `data`、`prop` 的相关处理）即业务组件**。应该以 `Custom` 前缀命名。

业务组件在一个页面内比如：某个页面内有一个卡片列表，而样式和逻辑跟业务紧密相关的卡片就是业务组件。

```bash
components/
├── CustomCard.vue
```

### 紧密耦合的组件名

**和父组件紧密耦合的子组件应该以父组件名作为前缀命名**。因为编辑器通常会按字母顺序组织文件，所以这样做可以把相关联的文件排在一起。

```bash
components/
├── TodoList.vue
├── TodoListItem.vue
├── TodoListItemButton.vue
```

### 组件名中单词顺序

**组件名应该以高级别的（通常是一般化描述的）单词开头，以描述性的修饰词结尾**。因为编辑器通常会按字母顺序组织文件，所以现在组件之间的重要关系一目了然。如下组件主要是用于搜索和设置功能。

```bash
components/
├── SearchButtonClear.vue
├── SearchButtonRun.vue
├── SearchInputQuery.vue
├── SearchInputExcludeGlob.vue
├── SettingsCheckboxTerms.vue
├── SettingsCheckboxLaunchOnStartup.vue
```

还有另一种多级目录的方式，把所有的搜索组件放到 `search/` 目录，把所有的设置组件放到 `settings/` 目录。我们只推荐在非常大型（如有 100+ 个组件）的应用下才考虑这么做，因为在多级目录间找来找去，要比在单个 components 目录下滚动查找花费的精力更多。

### 组件名使用完整单词

**组件名应该倾向于完整单词而不是缩写**。编辑器中的自动补全已经让书写长命名的代价非常之低了，而其带来的明确性却是非常宝贵的。不常用的缩写尤其应该避免。

```bash
components/
├── StudentDashboardSettings.vue
├── UserProfileOptions.vue
```

## 代码参数命名规范







## 文件夹命名规范

### 大小写规范

*  `components/` 下的子文件夹（特指直接子文件夹），使用 `PascalBase` 风格。
* 其它文件夹统一使用 `kebab-case` 风格。

例如：

```bash
components/
├── BackToTop                     # BackToTop 大写
│   └── index.vue
├── Charts                        # Charts 大写
│   ├── MixChart.vue
│   └── mixins                    # mixins 小写（不是 components 的直接子文件夹）
│       └── resize.js
└── ImageCropper                  # ImageCropper 大写
    ├── index.vue
    └── utils                     # utils 小写（不是 components 的直接子文件夹）
        ├── data2blob.js
        └── mimes.js
```

### 取名规范

#### 1）位于 `components/` 下的直接子文件夹

* 代表着这类模块的类别。
* 由名词组成（例如：`Charts`）。
* 最好只有一个单词，特殊情况可例外（good: `Car`，`Order`，`Cart`）（bad: `CarInfo`，`CarPage`）。
* 如果有两个以上单词，采用 `PascalBase` 风格（例如：`BackToTop`）。

#### 2）位于 `view/` 下的文件夹和其它文件夹

* 代表着页面的名字，或者类名。
* 由名词组成（例如：`profile`）。
* 如果有两个以上单词，采用 `kebab-case` 的风格，（例如：`error-page`）。

例如：

```bash
src/
├── App.vue
├── assets
├── main.js
├── components
│   ├── BackToTop             # 通用组件的文件夹
│   └── Charts                # 通用组件的文件夹
│       ├── Keyboard.vue
│       ├── LineMarker.vue
│       ├── MixChart.vue
│       └── mixins            # 其它文件夹（不是 components 的直接子文件夹）
├── directive
│   ├── clipboard             # 其它文件夹
│   └── permission            # 其它文件夹
├── filters
└── views
    ├── charts                # 视图组件的文件夹
    ├── clipboard             # 视图组件的文件夹
    ├── dashboard             # 视图组件的文件夹
    │   ├── admin             # 视图组件的文件夹
    │   │   ├── components
    │   │   └── index.vue
    │   ├── editor            # 视图组件的文件夹
    │   │   └── index.vue
    │   └── index.vue
    └── error-page            # 视图组件的文件夹
        ├── 401.vue
        └── 404.vue
```

## 组件命名规范

### 大小写规范

* `components/` 下的组件名采用 `PascalBase` 风格，各模块的入口文件`index.vue`采用小写。
* 其它地方的组件名采用 `kebab-case` 的风格。

### 取名规范

#### 1）位于 `components/` 下的通用组件

应该全部以一个特定的前缀开头，比如 `Base`、`App` 或 `V`。

推荐：

```bash
components/
|- BaseButton.vue
|- BaseTable.vue
|- BaseIcon.vue
```

不推荐：

```bash
components/
|- MyButton.vue
|- VueTable.vue
|- Icon.vue
```

#### 2）位于 `components/` 下的单例组件

位于 `components` 文件夹下的通用组件，但这类组件在每个页面只使用一次，永远不接受任何 prop，是为你的应用定制的。

一般以 `The` 前缀命名，以示其唯一性。

推荐：

```bash
components/
|- TheHeading.vue
|- TheSidebar.vue
```

不推荐：

```bash
components/
|- Heading.vue
|- MySidebar.vue
```

#### 3）位于 `components/` 下的紧密耦合组件

位于 `components` 文件夹下，该类组件只在某个父组件的场景下有意义，这层关系应该体现在其名字上。因为编辑器通常会按字母顺序组织文件，所以这样做可以把相关联的文件排在一起。

一般以父组件名作为前缀命名。

推荐：

```bash
components/
|- SearchSidebar.vue
|- SearchSidebarNavigation.vue
```

不推荐：

```bash
components/
|- SearchSidebar.vue
|- NavigationForSearchSidebar.vue
```

#### 4）组件名中的单词顺序

组件名应该以高级别的（通常是一般化描述的）单词开头，以描述性的修饰词结尾。

这个表达比较抽象，什么叫「高级别」的呢，直接看例子。

推荐：

```bash
components/
|- SearchButtonClear.vue
|- SearchButtonRun.vue
|- SearchInputQuery.vue
|- SearchInputExcludeGlob.vue
|- SettingsCheckboxTerms.vue
|- SettingsCheckboxLaunchOnStartup.vue
```

不推荐：

```bash
components/
|- ClearSearchButton.vue
|- ExcludeFromSearchInput.vue
|- LaunchOnStartupCheckbox.vue
|- RunSearchButton.vue
|- SearchInput.vue
|- TermsCheckbox.vue
```

#### 5）组件名使用完整单词

组件名应该倾向于完整单词而不是缩写，这样便于团队合作与后期维护。

推荐：

```bash
components/
|- StudentDashboardSettings.vue
|- UserProfileOptions.vue
```

不推荐：

```bash
components/
|- SdSettings.vue
|- UProfOpts.vue
```

#### 6）位于 `views/` 下的视图组件

这个文件夹下主要是**以页面为单位的组件**或者**模块文件夹**，需要遵循以下命名规范：

* `views/` 目录下面的 `.vue` 文件代表着页面的名字；
* 只有一个文件的情况，直接放在 `views/` 目录下面，如 `Login.vue`、`Home.vue`；
* 有 `utils/` 等子文件夹时，在 `views/` 下创建一个文件夹，要体现页面的名字， `.vue` 文件可与之同名；
* 有两个以上 `.vue` 文件时，在 `views/` 下创建一个文件夹，要体现内部文件的所属类名（例如`car`），`.vue` 文件放在里面（例如`car-list.vue`，`car-detail.vue`）；
* 有私有组件时，在 `views/` 下创建一个文件夹，要体现页面的名字，文件夹下必须有 `index.vue` 或 `index.js`；
* 尽量是名词；
* 除 `components/` 下的，一律采用 `kebab-case` 的风格；
* 名字至少两个单词（good: `car-detail`）（bad: `car`）
* 常用结尾单词有（`detail`、`edit`、`list`、`info`、`report`）
* 私有 `components/` 目录下，以 `Item` 结尾的代表着私有组件（`CarListItem`、`CarInfoItem`）

## 组件内部编程规范

### 元素 attribute 顺序

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

### 组件内选项顺序

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

### prop 名大小写

* 在声明 `prop` 的时候，其命名应该始终使用 `camelCase`。
* 在模板和 JSX 中应该始终使用 `kebab-case`。

子组件
```vue
props: {
  myProps: String
}
```
父组件
```vue
<my-component :my-props="abc"></my-component>
```

### 自定义事件名

`v-on` 事件监听器在 DOM 模板中会被自动转换为全小写（因为 HTML 是大小写不敏感的），所以 `v-on:myEvent` 将会变成 `v-on:myevent` —— 导致 `myEvent` 不可能被监听到。

因此，应该**始终使用 kebab-case 的事件名**。

子组件
```vue
this.$emit('my-event')
```
父组件
```vue
<my-component @my-event="abc"></my-component>
```

### method 方法命名

* 动宾短语（good：`jumpPage`、`openCarInfoDialog`）（bad：`go`、`nextPage`、`show`、`open`、`login`）
* ajax 方法以 `get`、`post` 开头，以 `data` 结尾（good：`getListData`、`postFormData`）（bad：`takeData`、`confirmData`、`getList`、`postForm`）
* 事件方法以 `on` 或者 `handle` 开头（例如：`onTypeChange`、`onUsernameInput`、`handleTypeChange`）
* `init`、`refresh` 单词除外
* 尽量使用常用单词开头（例如`set`、`get`、`open`、`close`、`jump`）
* 驼峰命名（good: `getListData`）（bad: `get_list_data`、`getlistData`）

### data props 方法注意点

* 使用 `data` 里的变量时请先在 `data` 里面初始化；
* `props` 指定类型，也就是 `type`；

### 生命周期方法注意点

* 不在 `mounted`、`created` 之类的方法里直接写取异步数据的逻辑，将方法抽象出来，只在此处调用；
* 在 `created` 里面监听 Bus 事件

## 资源文件命名规范(.js .less等)

### `.js` 文件命名规范

* 属于类的 `.js` 文件，除 `index.js` 外，使用 `PascalBase` 风格；
* 其他类型的 `.js` 文件，使用 `kebab-case` 风格

### `.less` 等其它文件命名规范

* 一律采用 `kebab-case` 的风格。
