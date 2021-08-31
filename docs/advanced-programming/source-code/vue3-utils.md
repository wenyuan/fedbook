# Vue3 源码中的基础工具函数

## 学习目标

* 学习调试源码：打包构建项目代码，生成 sourcemap 调试源码。
* 学习优秀开源框架中工具函数是如何设计以达到优化的目的。
* 工作中如果有用到类似的工具函数，可以借鉴参考。
* 复习巩固 TypeScript 语法和用法。

## 前期准备

### 源码位置

Vue3 的源码仓库是 [vue-next](https://github.com/vuejs/vue-next)，根据 [项目目录结构](https://github.com/vuejs/vue-next/blob/master/.github/contributing.md#project-structure) 的描述：

* `shared`: Internal utilities shared across multiple packages (especially environment-agnostic utils used by both runtime and compiler packages).

本次要阅读的工具函数位于 `shared` 模块，对应的文件路径是：[`vue-next/packages/shared/src/index.ts`](https://github.com/vuejs/vue-next/blob/master/packages/shared/src/index.ts)。


### 打包构建代码（非必须）

这个步骤非必须，主要是为了将 `ts` 编译成 `js`，从而可以降低阅读源代码的难度。

```bash
# 需要确保 Node.js 版本是 10+，而且 yarn 的版本是 1.x
node -v

# 克隆项目
git clone https://github.com/vuejs/vue-next.git
cd vue-next

# 全局安装 yarn
npm install --global yarn

yarn # install the dependencies of the project
yarn build
```

可以得到 `vue-next/packages/shared/dist/shared.esm-bundler.js`，文件也就是纯 `js` 文件。
                                                               
## 工具函数

由于我刚学过 TypeScript，但还未在实际项目中运用过，所以可以借此机会通过阅读 `ts` 代码来巩固相关知识点。

接下来我会先按照源码 `vue-next/packages/shared/src/index.ts` 中的工具函数顺序，找到纯 `js` 文件里对应的函数进行解读；然后回到 `ts` 文件学习 TS 版本的实现方式。（从外部导入的方法暂时先省去不进行阅读）

### babelParserDefaultPlugins

babelParserDefaultPlugins：babel 解析默认插件，定义了 babel 需要使用的插件。

* JS 版

```javascript
/**
 * List of @babel/parser plugins that are used for template expression
 * transforms and SFC script transforms. By default we enable proposals slated
 * for ES2020. This will need to be updated as the spec moves forward.
 * Full list at https://babeljs.io/docs/en/next/babel-parser#plugins
 */
const babelParserDefaultPlugins = [
    'bigInt',
    'optionalChaining',
    'nullishCoalescingOperator'
];
```

* TS 版

```typescript
export const babelParserDefaultPlugins = [
  'bigInt',
  'optionalChaining',
  'nullishCoalescingOperator'
] as const
```

第一个 `const`：常量声明，是 ES6 的语法，对 TS 而言，它只能反映该常量本身是不可被重新赋值的，它的子属性仍然可以被修改，故 TS 只会对它们做松散的类型推断。

第二个 `const`：`as const` 这个语法叫 [const 断言](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)，它专用于字面量类型，它的语法是将类型断言 `值 as 类型` 的类型名称修改为 `const`。
使用 const 断言构造字面量类型时，它告诉 TS 它所断言的值以及该值的所有层级的子属性都是不可篡改的（readonly），故对每一级子属性都会做最严格的类型推断。

例如下面字面量对象的第二层属性会被推断成 `13` 这样的单值类型而不是宽泛的 number 或 string 类型，其类型推断结果与字面量声明几乎长得一模一样。

```typescript
const students = [
  {
    name: 'zhangsan',
    age: 13
  },
  {
    name: 'lisi',
    age: 14
  }
] as const;
```

### EMPTY_OBJ

EMPTY_OBJ：空对象，Vue 源码中常用它来赋初值和做判断。

* JS 版

```javascript
const EMPTY_OBJ = (process.env.NODE_ENV !== 'production')
    ? Object.freeze({})
    : {};
```

`process.env.NODE_ENV` 是 node 项目中的一个环境变量，一般定义为：`development` 和 `production`。根据环境写代码。比如开发环境，有报错等信息，生产环境则不需要这些报错警告。

`Object.freeze()` 方法可以冻结一个对象，被冻结对象自身的所有属性都不能以任何方式被修改，且该对象的原型也不能被修改。但如果一个属性的值是个对象（对象B），则这个对象（对象B）中的属性是可以修改的，除非它也是个冻结对象。数组作为一种对象，被冻结，其元素不能被修改，没有数组元素可以被添加或移除。这个方法返回传递的对象，而不是创建一个被冻结的副本。

在开发环境中，如果开发者误操作（对冻结后的对象进行修改），就可以在编译时发现错误（严格模式下会报错）。而在生产环境中则只需要直接使用 `{}` 创建空对象。

* TS 版

```typescript
export const EMPTY_OBJ: { readonly [key: string]: any } = __DEV__
  ? Object.freeze({})
  : {}
```

`__DEV__` 是一个环境变量，但它是个布尔值，所以只能区别两种环境。而 `NODE_ENV` 依赖了 `process.env` 环境变量，它是个字符串，可以写多个值区分多个环境。

### EMPTY_ARR

EMPTY_ARR：空数组，Vue 源码中常用它来赋初值和做判断。

* JS 版

```javascript
const EMPTY_ARR = (process.env.NODE_ENV !== 'production') ? Object.freeze([]) : [];
```

* TS 版

```typescript
export const EMPTY_ARR = __DEV__ ? Object.freeze([]) : []
```

和 EMPTY_OBJ 一样，在开发环境中，如果开发者误操作（对冻结后的数组进行修改），就可以在编译时发现错误（非严格模式下也会报错）。而在生产环境中则只需要直接使用 `[]` 创建空数组。

### NOOP

NOOP：空函数

* JS 版

```javascript
const NOOP = () => { };
```

* TS 版

```typescript
export const NOOP = () => {}
```

### NO

NO：永远返回 `false` 的函数。

* JS 版

```javascript
const NO = () => false;
```

* TS 版

```typescript
export const NO = () => false
```

### isOn

isOn：判断字符串是不是 `on` 开头，并且 `on` 后首字母不是小写字母。

* JS 版

```javascript
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
```

`^` 符号在开头，表示以什么开头，而在其他地方是指非。  
`$` 符号在结尾，表示是以什么结尾。  
`[]` 表示字符组，表示匹配其中任何一个字符。  
`[^a-z]` 指不是 `a` 到 `z` 的小写字母，即英文小写字母以外的其它任意字符。

* TS 版

```typescript
const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)
```

### isModelListener

isModelListener 监听器：判断字符串是不是以 `onUpdate:` 开头。

* JS 版

```javascript
const isModelListener = (key) => key.startsWith('onUpdate:');
```

`startsWith()` 是 ES6 新增的方法，用于判断原字符串是不是以指定的参数字符串开头，返回布尔值。

* TS 版

```typescript
export const isModelListener = (key: string) => key.startsWith('onUpdate:')
```

### extend

extend：合并对象

* JS 版

```javascript
const extend = Object.assign;
```

`Object.assign()` 是 ES6 新增的方法，忽略 `enumerable` 为 `false` 的属性，只拷贝对象自身的可枚举的属性。

* TS 版

```typescript
export const extend = Object.assign
```

### remove

remove：移除数组的一项（传入一个数组和一个元素，删除第一个匹配到的值），直接修改在原数组上，无返回值。

* JS 版

```javascript
const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
        arr.splice(i, 1);
    }
};
```

[`splice()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) 方法通过删除或替换现有元素或者原地添加新的元素来修改数组，并以数组形式返回被修改的内容。此方法会改变原数组。

例子：

```javascript
// 第 1 个参数：从 0 计数，指定开始位置
// 第 2 个参数：指定要移除的元素个数
// 第 3~N 个参数（可选）：指定要插入数组的元素
```

* TS 版

```typescript
export const remove = <T>(arr: T[], el: T) => {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}
```
