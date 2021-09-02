# Vue3 源码中的基础工具函数

## 学习目标

* 学习调试源码：打包构建项目代码，生成 sourcemap 调试源码。
* 学习优秀开源框架中工具函数是如何设计以达到优化的目的。
* 工作中如果有用到类似的工具函数，可以借鉴参考。
* 对 JavaScript 基础知识查漏补缺。
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
// 第 3 ~ N 个参数（可选）：指定要插入数组的元素，如果不指定，则 splice() 将只删除数组元素
const months = ['Jan', 'March', 'April', 'June'];
months.splice(1, 0, 'Feb');
// inserts at index 1
console.log(months);
// expected output: Array ["Jan", "Feb", "March", "April", "June"]

months.splice(4, 1, 'May');
// replaces 1 element at index 4
console.log(months);
// expected output: Array ["Jan", "Feb", "March", "April", "May"]
```

但是，`splice()` 其实是一个很耗性能的方法，因为删除数组中的一项，其他元素都要移动位置。

引申：在 [`axios InterceptorManager` 拦截器源码](https://github.com/axios/axios/blob/master/lib/core/InterceptorManager.js) 中，拦截器用数组存储的。但实际移除拦截器时，只是把拦截器置为 `null` 。而不是用 `splice` 移除。最后执行时为 `null` 的不执行，同样效果。axios 拦截器这个场景下，不得不说为性能做到了很好的考虑。

看如下 axios 拦截器代码示例：

```javascript
// 代码有删减
// 声明
this.handlers = [];

// 移除
if (this.handlers[id]) {
    this.handlers[id] = null;
}

// 执行
if (h !== null) {
    fn(h);
}
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

这里用到了 TypeScript 中的泛型，泛型是指在定义函数，接口或者类的时候，不预先定义好具体的类型，而在使用的时候再指定类型，或者索性使用的时候也不手动指定类型，让代码根据你传入的值，用类型推论自动推算出来。

泛型的语法是在函数名后添加范型变量 `<T>`（上例的匿名函数将函数名称省略了），其中 `T` 用来指代任意输入的类型，之后我们就可以使用这个类型。例如在后面的两个输入参数 `arr: T[]` 和 `el: T` 中再次使用，分别指定了数组元素的类型和变量的类型。

### hasOwn

hasOwn：是不是自己本身所拥有的属性

* JS 版

```javascript
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
```

`hasOwnProperty` 是 `Object` 原型上的方法，几乎所有的对象都可以调用该方法。该方法用于判断对象自身属性中有没有指定的属性，会返回一个布尔值（和 `in` 运算符不同，该方法会忽略掉那些从原型链上继承到的属性）。

* TS 版

```typescript
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)
```

`key is keyof typeof val` 这句比较复杂，包含了三个 TypeScript 语法，意思是函数返回的 `key` 是属于 `val` 对象的键的联合类型。

`is` 关键字：又被称为类型谓词。一般用在封装的类型判断函数中，用来判断参数是否属于某个类型，并根据结果返回对应的布尔类型。语法为 `prop is type`，例如：

```typescript
// val is number 指定函数返回类型，而不是将 boolean 用为函数返回类型。
// 因为在调用 isNumber 之后，如果函数返回 true，TypeScript 会将类型范围缩小为 string，
// 这样在编译时就能发现代码错误，有效缩小类型范围，从而避免一些隐藏的运行时错误。
const isNumber = (val: unknown): val is number => typeof val === 'number'
const isString = (val: unknown): val is string => typeof val === 'string'
```

`keyof` 操作符：用于获取某种类型的所有键，其返回类型是联合类型，例如：

```typescript
interface Person {
  name: string,
  age: number;
  location: string;
}

// type 是 TypeScript 的保留关键字
// 用来给一个类型起个新名字，常用于联合类型
type K = keyof Person; // "name" | "age" | "location"
let param1: K = "name"; // 正常
let param2: K = 12;     // 报错，只能为 K 中字符串其一
```

`typeof` 操作符：js 中的 `typeof` 只能获取几种类型，而在 ts 中 `typeof` 用来获取一个变量或对象的类型，例如：

```typescript
interface Person {
  name: string,
  age: number;
}

const sem: Person = { name: 'semlinker', age: 30 };
type Sem = typeof sem; // type Sem = Person
```

### isArray

isArray：判断是否数组

* JS 版

```javascript
const isArray = Array.isArray;
```

`Array.isArray` 比 `instanceof` 更加可靠，如下代码对比两者的区别：

```javascript
const arr = []
const fakeArr = { __proto__: Array.prototype, length: 0 };

// 如果参数是数组一定返回 true，否则一定返回 false
// 在判断对象是否为数组时，采用Array.isArray 更加可靠
Array.isArray(Array.prototype)   // true
Array.isArray(arr)               // true
Array.isArray(fakeArr);          // false

// instanceof 操作符判断左边是否为右边的实例，其工作原理是判断右边参数的原型是否在左边参数的原型链上
Array.prototype instanceof Array // false 不能正确判断 Array.prototype
arr instanceof Array             // true
fakeArr instanceof Array;        // true 可以被刻意误导
```

* TS 版

```typescript
export const isArray = Array.isArray
```

### isMap

isMap：判断是否 Map 对象

* JS 版

```javascript
const isMap = (val) => toTypeString(val) === '[object Map]';

const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
```

Map 是 ES6 提供的数据结构，它类似于对象，也是键值对的集合。但是「键」的范围不限于字符串，各种类型的值（包括对象）都可以当作键。也就是说，Object 结构提供了「字符串—值」的对应，Map 结构提供了「值—值」的对应，是一种更完善的 Hash 结构实现。如果你需要「键值对」的数据结构，Map 比 Object 更合适。

Map 的用法：

```javascript
let map = new Map();
let o = { p: 'Hello World' };

map.set(o, 'content');
map.get(o); // 'content'
```

* TS 版

```typescript
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)
```

### isSet

isSet：判断是否 Set 对象

* JS 版

```javascript
const isSet = (val) => toTypeString(val) === '[object Set]';

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)
```

Set 是 ES6 提供的数据结构，它类似于数组，但是成员的值都是唯一的，没有重复的值。

Set 的用法：

```javascript
let set = new Set();
// 在 Set 内部，两个NaN是相等的。
let a = NaN;
let b = NaN;
set.add(a);
set.add(b);
set // Set { NaN }

// 而两个对象总是不相等的
set.add({});
set.add({});
set // Set { NaN, {}, {} }
```

* TS 版

```typescript
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)
```

### 其它判断是否某种类型的函数

* JS 版

```javascript
// 判断是否 Date 对象
// instanceof 这种根据原型链向上查找的方式不太精确，但这里够用了。
const isDate = (val) => val instanceof Date;

// 判断是否函数
const isFunction = (val) => typeof val === 'function';

// 判断是否字符串
const isString = (val) => typeof val === 'string';

// 判断是否 Symbol
// Symbol 是 ES6 引入的一种新的原始数据类型，表示独一无二的值。
const isSymbol = (val) => typeof val === 'symbol';

// 判断是否对象
// 因为 typeof null 也是 "object"，所以这里同时判断了非 null 的值
const isObject = (val) => val !== null && typeof val === 'object';

// 判断是否 Promise
const isPromise = (val) => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
```

* TS 版

```typescript
// 判断是否 Date 对象
export const isDate = (val: unknown): val is Date => val instanceof Date

// 判断是否函数
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

// 判断是否字符串
export const isString = (val: unknown): val is string => typeof val === 'string'

// 判断是否 Symbol
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

// 判断是否对象
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

// 判断是否 Promise
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}
```

### toRawType

toRawType：对象转字符串，截取后第八位到倒数第二位

* JS 版

```javascript
const toRawType = (value) => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
};
```

可以截取到 `String`、`Array` 等这些类型，这个函数可以用来做类型判断。

JS 判断类型也有 `typeof` ，但不是很准确，而且能够识别出的不多。[MDN - typeof 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof) 中介绍的比较详细，而且也实现了一个很完善的 `type` 函数。

```
// typeof 返回值目前有以下8种 
'undefined'
'object'
'boolean'
'number'
'bigint'
'string'
'symobl'
'function'
```

* TS 版

```typescript
export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}
```

### isPlainObject

isPlainObject：判断是否纯粹的对象

* JS 版

```javascript
const isPlainObject = (val) => toTypeString(val) === '[object Object]';
```

前面有一个 `isObject` 用来判断是否对象，这里的 `isPlainObject` 区别在于：

```javascript
isObject([])      // true  因为 type [] 为 'object'
isPlainObject([]) // false
```
 
* TS 版

```typescript
export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'
```

### isIntegerKey

isIntegerKey：判断是不是数字型的字符串 key 值

* JS 版

```javascript
const isIntegerKey = (key) => isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
```

第一步先判断 key 是否是字符串类型（作为 key 值有两种类型，`string` 和 `symbol`），第二步排除 `NaN` 值，第三步排除 `-` 值（排除负数），第四步将 key 转换成数字再隐式转换为字符串，与原 key 对比。

* TS 版

```typescript
export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key
```

### isReservedProp

isReservedProp：判断该属性是否为保留属性

* JS 版

```javascript
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
}

const isReservedProp = /*#__PURE__*/ makeMap(
// the leading comma is intentional so empty string "" is also included
',key,ref,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted');
```

这个函数依赖于 `makeMap`，也是 Vue3 源码中自用的工具函数，它传入一个以逗号分隔的字符串，将这个字符串转换成数组，并循环赋值 key 給一个空对象 map，然后返回一个包含参数 val 的闭包用来检查 val 是否是存在在字符串中。

`isReservedProp("key")` 其实就相当于 `makeMap(str)("key")`。

测试：

```javascript
// 保留的属性
isReservedProp('key');                  // true
isReservedProp('ref');                  // true
isReservedProp('onVnodeBeforeMount');   // true
isReservedProp('onVnodeMounted');       // true
isReservedProp('onVnodeBeforeUpdate');  // true
isReservedProp('onVnodeUpdated');       // true
isReservedProp('onVnodeBeforeUnmount'); // true
isReservedProp('onVnodeUnmounted');     // true
```

* TS 版

```typescript
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}

export const isReservedProp = /*#__PURE__*/ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ',key,ref,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted'
)
```

### cacheStringFunction

cacheStringFunction：缓存字符串的函数

* JS 版

```javascript
const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
```

这个函数和上面 `makeMap` 函数类似，传入一个 `fn` 参数，返回一个包含参数 `str` 的闭包，将这个 `str` 字符串作为 key 赋值给一个空对象 `cache`，闭包返回 `cache[str] || (cache[str] = fn(str))`。

`cache[str] || (cache[str] = fn(str))` 的意思是，如果 `cache` 有缓存到 `str` 这个 key，直接返回对应的值；否则，先调用 `fn(str)`，再赋值给 `cache[str]`，这样可以将需要经过 `fn` 函数处理的字符串缓存起来，避免多次重复处理字符串。

用法举例（也是来自于源码后面几行内容）：

```javascript
// \w 就是 [0-9a-zA-Z_]。表示数字、大小写字母和下划线。
// () 小括号是分组捕获
// g 是 global 的意思，表示全局匹配，即在目标字符串中按顺序找到满足匹配模式的所有子串
const camelizeRE = /-(\w)/g;
/**
 * @private
 */
// 连字符 => 驼峰  on-click => onClick
const camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});

// \B 是指非单词边界(与 \b 是反面意思)
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
// 驼峰 => 连字符  onClick => on-click
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());

/**
 * @private
 */
// 首字母转大写
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));

/**
 * @private
 */
// 加上 on 字符串  click => onClick
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
```

* TS 版

```typescript
const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}
```

用法举例（也是来自于源码后面几行内容）：

```typescript
const camelizeRE = /-(\w)/g
/**
 * @private
 */
export const camelize = cacheStringFunction((str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})

const hyphenateRE = /\B([A-Z])/g
/**
 * @private
 */
export const hyphenate = cacheStringFunction((str: string) =>
  str.replace(hyphenateRE, '-$1').toLowerCase()
)

/**
 * @private
 */
export const capitalize = cacheStringFunction(
  (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
)

/**
 * @private
 */
export const toHandlerKey = cacheStringFunction((str: string) =>
  str ? `on${capitalize(str)}` : ``
)
```

### hasChanged

hasChanged：判断是否有变化

* JS 版

```javascript
// compare whether a value has changed, accounting for NaN.
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
```

`Object.is(value1, value2)` 是 ES6 提供的方法，用来比较两个值是否严格相等。它与严格比较运算符（`===`）的行为基本一致。不同之处只有两个：一是 `+0` 不等于 `-0`，而 `NaN` 等于自身。

对比：

```javascript
Object.is('abc', 'abc'); // true
Object.is({},{});        // false
Object.is(+0, -0);       // false
Object.is(NaN, NaN);     // true

+0 === -0;               // true
NaN === NaN;             // false
```

因而基于 `Object.is` 的 `hasChanged` 会有如下比较结果：

```javascript
hasChanged(NaN, NaN); // false
hasChanged(1, 1);     // false
hasChanged(1, 2);     // true
hasChanged(+0, -0);   // false

// 场景
// watch 监测值是否变化了
// (value === value || oldValue === oldValue)
// 为什么会有这句，因为要判断 NaN。hasChanged 认为 NaN 是不变的，通过 NaN === NaN 为 false 来判断。
```

ES5 可以通过以下代码实现 `Object.is`。

```javascript
Object.defineProperty(Object, 'is', {
    value: function() {x, y} {
        if (x === y) {
           // 针对 +0 不等于 -0 的情况
           return x !== 0 || 1 / x === 1 / y;
        }
        // 针对 NaN的情况
        return x !== x && y !== y;
    },
    configurable: true,
    enumerable: false,
    writable: true
});
```

* TS 版

```typescript
// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)
```

### invokeArrayFns

invokeArrayFns：执行数组里的函数

当有多个函数要依次执行，且每个函数的参数存在包含关系（或个别函数没有参数）时，可以用这种写法来统一执行多个函数。

* JS 版

```javascript
const invokeArrayFns = (fns, arg) => {
    for (let i = 0; i < fns.length; i++) {
        fns[i](arg);
    }
};
```

用法示例：

```javascript
const funcArr = [
    function(val){
        console.log('当前时间是:' + val);
    },
    function(val){
        console.log('打印当前时间:' + val);
    },
    function(){
        console.log('上面的时间是通过 new Date().toLocaleString() 计算出来的');
    },
]
invokeArrayFns(funcArr, new Date().toLocaleString());
```

* TS 版

```typescript
export const invokeArrayFns = (fns: Function[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}
```

这里对函数 `invokeArrayFns` 的参数进行了类型约束， `fns: Function[]` 指定第一个参数为数组且元素都是 `Function` 类型。`arg?: any` 用 `?` 表示第二个参数为可选，且值类型为任意值。

### def

def：定义对象属性

* JS 版

```javascript
const def = (obj, key, value) => {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: false,
        value
    });
};
```

[`Object.defineProperty(obj, prop, descriptor)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。还有一个方法能用于定义多个属性：[`Object.defineProperties(obj, props)`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties) (ES5)。

引申：`Object.defineProperty` 涉及到比较重要的知识点：

在 ES3 中，除了一些内置属性（如：`Math.PI`），对象的所有的属性在任何时候都可以被修改、插入、删除。在 ES5 中，我们可以设置属性是否可以被改变或是被删除 —— 在这之前，它是内置属性的特权。ES5 中引入了属性描述符的概念，我们可以通过它对所定义的属性有更大的控制权。这些属性描述符（特性）包括：

> `value` —— 当试图获取属性时所返回的值。  
> `writable` —— 该属性是否可写。  
> `enumerable` —— 该属性在 `for in` 循环中是否会被枚举。  
> `configurable`—— 该属性是否可被删除。  
> `set()` —— 该属性的更新操作所调用的函数。  
> `get()` —— 获取属性值时所调用的函数。

另外，**数据描述符**（其中属性为：`enumerable`，`configurable`，`value`，`writable`）与**存取描述符**（其中属性为 `enumerable`，`configurable`，`set()`，`get()`）之间是有互斥关系的。在定义了 `set()` 和 `get()` 之后，描述符会认为存取操作已被 定义了，其中再定义 `value` 和 `writable` 会引起错误。

以下是 ES3 风格的属性定义方式：

```javascript
var person = {};
person.legs = 2;
```

以下是等价的 ES5 通过数据描述符定义属性的方式：

```javascript
var person = {};
Object.defineProperty(person, 'legs', {
    value: 2,
    writable: true,
    configurable: true,
    enumerable: true
});
```

其中， 除了 value 的默认值为 `undefined` 以外，其他的默认值都为 `false`。这就意味着，如果想要通过这一方式定义一个可写的属性，必须显示将它们设为 `true`。或者，我们也可以通过 ES5 的存储描述符来定义：

```javascript
var person = {};
Object.defineProperty(person, 'legs', {
    set:function(v) {
        return this.value = v;
    },
    get: function(v) {
        return this.value;
    },
    configurable: true,
    enumerable: true
});
person.legs = 2;
```

这样一来，多了许多可以用来描述属性的代码，如果想要防止别人篡改我们的属性，就必须要用到它们。此外，也不要忘了浏览器向后兼容 ES3 方面所做的考虑。例如，跟添加 ``Array.prototype`` 属性不一样，我们不能再旧版的浏览器中使用 `shim` 这一特性。 另外，我们还可以（通过定义 `nonmalleable` 属性），在具体行为中运用这些描述符：

```javascript
var person = {};
Object.defineProperty(person, 'heads', {value: 1});
person.heads = 0;    // 0
person.heads;        // 1  (改不了)
delete person.heads; // false
person.heads         // 1 (删不掉)
```

* TS 版

```typescript
export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  })
}
```

### toNumber

toNumber：转数字

* JS 版

```javascript
const toNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
};
```

JavaScript 中将字符串转为数字的方法有三种：

`Number()`（ES6）：将字符串转换为数字（空字符串转换为 `0`，其他的字符串会转换为 `NaN`）。
`parseFloat()`：解析一个字符串，并返回一个浮点数（空字符串转换为 `NaN`，其他的字符串会返回非数字或无效数字字符之前的值）。
`parseInt()`：解析一个字符串，并返回一个整数（空字符串转换为 `NaN`，其他的字符串会返回非数字或无效数字字符之前的值）。

`isNaN` 本意是判断是不是 `NaN` 值，但是不准确。比如：`isNaN('a')` 为 `true`。所以 ES6 有了 `Number.isNaN` 这个判断方法，为了弥补这一个 API。

```javascript
isNaN(NaN);        // true
Number.isNaN(NaN); // true

isNaN('a');        // true
Number.isNaN('a'); // false

```

* TS 版

```typescript
export const toNumber = (val: any): any => {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}
```

### getGlobalThis

getGlobalThis：获取全局对象

* JS 版

```javascript
let _globalThis;
const getGlobalThis = () => {
    return (_globalThis ||
        (_globalThis =
            typeof globalThis !== 'undefined'
                ? globalThis
                : typeof self !== 'undefined'
                    ? self
                    : typeof window !== 'undefined'
                        ? window
                        : typeof global !== 'undefined'
                            ? global
                            : {}));
};
```

这个方法用于获取全局 `this` 指向。

**首次执行**时 `_globalThis` 是 `undefined`。所以会执行后面的赋值语句。

如果存在 `globalThis` 就用 `globalThis`。[MDN - globalThis](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis)

如果存在 `self`，就用 `self`。在 `Web Worker` 中不能访问到 `window` 对象，但是我们却能通过 `self` 访问到 `Worker` 环境中的全局对象。

如果存在 `window`，就用 `window`。

如果存在 `global`，就用 `global`。Node环境下，使用 `global`。

如果都不存在，使用空对象。可能是微信小程序环境下。

**下次执行**就直接返回 `_globalThis`，不需要第二次继续判断了。这种设计思路值得我们借鉴。

* TS 版

```typescript
let _globalThis: any
export const getGlobalThis = (): any => {
  return (
    _globalThis ||
    (_globalThis =
      typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
        ? global
        : {})
  )
}
```

## 总结

以上这些是 Vue3 源码中的基础工具函数，但实际上跟 Vue3 框架本身的耦合性不是很强（除了个别函数比如 `isReservedProp` 是专门设计给框架内部用的），相对独立，能够很方便的上手阅读和调试。

通过阅读这部分工具函数产生了不少价值：

* 对 JavaScript 原生基础知识进行查漏补缺，特别像 Object 对象的那些 API 等等。
* 刚学习完 TypeScript，在正式使用前先阅读高手代码里的 TS 写法，既能检验学习效果，也能为之后 TS 的运用提高熟练度。
* 部分函数中用到了正则表达式的知识点，这块内容很大，如果需要专门学习就需要通读 《[JS 正则迷你书](https://github.com/qdlaoyao/js-regex-mini-book)》了，平时用正则表达式的使用需求查阅即可。
* 汲取了一些优秀的设计思路，例如 `cacheStringFunction`、`invokeArrayFns`、`getGlobalThis` 等函数。

（完）
