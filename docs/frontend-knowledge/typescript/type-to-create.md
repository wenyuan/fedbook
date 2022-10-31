# 类型创建

所谓类型创建，就是基于前面学到的已有类型，创建出新的类型。创建新类型需要用到的工具有类型别名、交叉类型、索引类型与映射类型。

## 类型别名

类型别名的作用主要是对一组类型或一个特定类型结构进行封装，以便于在其它地方进行复用。

语法是使用 `type` 关键字，例如：

```typescript
type StatusCode = 200 | 301 | 400 | 500 | 502;

const status: StatusCode = 502;
```

### 工具类型

类型别名结合泛型，就成了工具类型。

工具类型能够接受泛型参数（就像函数的参数），然后内部逻辑再基于入参进行某些操作，再返回一个新的类型。

比如这样：

```typescript
// 定义一个工具类型，返回一个包括 null 的联合类型
type MaybeNull<T> = T | null;

// 确保能处理可能为空值的属性读取与方法调用
function process(input: MaybeNull<{ handler: () => {} }>) {
    // 因为可能是 null，所以用可选链操作符来调用一个可能不存在的方法
    input?.handler();
}
```

总之对于工具类型来说，它的主要意义是**基于传入的泛型进行各种类型操作**，得到一个新的类型。

## 联合类型与交叉类型

联合类型的符号是 `|`，它代表了「或」，即只需要符合其中的一个类型，就可以认为实现了这个联合类型，例如：

```typescript
let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
myFavoriteNumber = 7;
```

交叉类型的符号是 `&`，它代表了「与」，即需要符合这里的所有类型，才可以说实现了这个交叉类型，例如：

```typescript
interface NameStruct {
  name: string;
}

interface AgeStruct {
  age: number;
}

type ProfileStruct = NameStruct & AgeStruct;

const profile: ProfileStruct = {
  name: "张三",
  age: 13
}
```

上面是对于对象类型的合并，如果是对原始类型进行合并，就会变成 `never`，因为会造出一个根本不存在的类型：

```typescript
// 世界上不存在既是 string 又是 number 的类型，所以是 never
type StrAndNum = string & number;
```

## 索引类型

索引类型指的不是某一个特定的类型工具，它包含三个部分：索引签名类型、索引类型查询与索引类型访问。这三者都是独立的类型工具，唯一共同点是它们都通过索引的形式来进行类型操作。但索引签名类型是声明，后两者则是读取。

### 索引签名类型

索引签名类型，主要指的是在接口或类型别名中，通过以下语法来**快速声明一个键值类型一致的类型结构**：

```typescript
// 用在接口中
interface AllStringTypes {
  [key: string]: string;
}

// 用在类型别名中
type AllStringTypes = {
  [key: string]: string;
}
```

这时即使还没声明具体的属性，也意味着在实现这个类型结构的变量中**只能声明字符串类型的键**：

```typescript
interface AllStringTypes {
  [key: string]: string;
}

const foo: AllStringTypes = {
  "name": "张三"
}
```

### 索引类型查询

索引类型查询，可以通过 `keyof` 操作符，将对象中的所有键转换为对应字面量类型，然后再组合成联合类型。

```typescript
interface Foo {
  name: string,
  age: number,
  123: 13
}

type FooKeys = keyof Foo; // "name" | "age" | 123

const tmp: FooKeys = 123  // tmp 的值只能是 "name"、"age"、123 中的一个
```

`keyof` 的产物必定是一个联合类型，而 `keyof any` 产生的联合类型，是由所有可用作对象键值的类型组成的，即 `string | number | symbol`。

### 索引类型访问

在 JavaScript 中我们可以通过 `obj[expression]` 的方式来动态访问一个对象属性，其中 expression 表达式会先被执行，然后使用返回值来访问属性。

在 TypeScript 中也可以通过类似的方式，只不过这里的 expression 要换成类型：

```typescript
interface Foo {
    propA: number;
    propB: boolean;
}

type PropAType = Foo['propA']; // number
type PropBType = Foo['propB']; // boolean
```

要注意其访问方式与返回值均是类型。上面代码中的 `'propA'` 和 `'propB'` 都是字符串字面量类型，而不是一个 JavaScript 字符串值。

索引类型查询的本质其实就是，通过键的字面量类型（`'propA'`）访问这个键对应的键值类型（`number`）。

## 映射类型

映射类型的主要作用是基于键名，映射到键值类型。概念不好理解，直接看例子：

```typescript
type Stringify<T> = {
  [K in keyof T]: string;
};
```

这个工具类型接受一个对象类型，使用 `keyof` 获得这个对象类型的键名组成字面量联合类型，然后通过映射类型（即这里的 `in` 关键字）将这个联合类型的每一个成员映射出来，并将其键值类型设置为 `string`。

放到代码中的用法：

```typescript
interface Foo {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}

type StringifiedFoo = Stringify<Foo>;

// 上述代码就等价于
interface StringifiedFoo {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
}
```

要说这个用法的实际场景的话，可能是这样：

```typescript
type Clone<T> = {
  [K in keyof T]: T[K];
};
```

就是先拿到键，然后通过索引类型访问（`T[K]`）获得值的类型，最终实现了接口的克隆。这样就结合到了「索引类型」这一主题下的几个功能了：

* `K in` 是上面提到的映射类型的语法
* `[K in keyof T]` 的 `[]` 是索引签名类型的语法
* `keyof T` 是索引类型查询的语法（keyof 操作符）
* `T[K]` 是索引类型访问的语法

## 总结

类型别名、联合类型、索引类型以及映射类型，这些主要都用于创建新类型，它们的实现方式与常见搭配总结如下：

<svg id="SvgjsSvg1006" width="833" height="372" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25.000015258789062,24.99999237060547)"><path id="SvgjsPath1009" d="M0 0L126.9243 0L126.9243 35.76304312 L0 35.76304312Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1010" d="M126.9243 0L614.0286 0L614.0286 35.76304312 L126.9243 35.76304312Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1011" d="M613.9503 0L783 0L783 35.76304312 L613.9503 35.76304312Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1012" d="M0 35.76304312L126.9243 35.76304312L126.9243 71.52608624 L0 71.52608624Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1013" d="M126.9243 35.76304312L614.0286 35.76304312L614.0286 71.52608624 L126.9243 71.52608624Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1014" d="M613.9503 35.76304312L783 35.76304312L783 71.52608624 L613.9503 71.52608624Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1015" d="M0 71.52608624L126.9243 71.52608624L126.9243 107.28912936 L0 107.28912936Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1016" d="M126.9243 71.52608624L614.0286 71.52608624L614.0286 107.28912936 L126.9243 107.28912936Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1017" d="M613.9503 71.52608624L783 71.52608624L783 107.28912936 L613.9503 107.28912936Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1018" d="M0 107.28912936L126.9243 107.28912936L126.9243 143.05217248 L0 143.05217248Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1019" d="M126.9243 107.28912936L614.0286 107.28912936L614.0286 143.05217248 L126.9243 143.05217248Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1020" d="M613.9503 107.28912936L783 107.28912936L783 143.05217248 L613.9503 143.05217248Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1021" d="M0 143.05217248L126.9243 143.05217248L126.9243 178.8152156 L0 178.8152156Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1022" d="M126.9243 143.05217248L614.0286 143.05217248L614.0286 178.8152156 L126.9243 178.8152156Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1023" d="M613.9503 143.05217248L783 143.05217248L783 178.8152156 L613.9503 178.8152156Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1024" d="M0 178.81521560000002L126.9243 178.81521560000002L126.9243 214.57825872 L0 214.57825872Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1025" d="M126.9243 178.81521560000002L614.0286 178.81521560000002L614.0286 214.57825872 L126.9243 214.57825872Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1026" d="M613.9503 178.81521560000002L783 178.81521560000002L783 214.57825872 L613.9503 214.57825872Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1027" d="M0 214.57825872L126.9243 214.57825872L126.9243 250.27697982 L0 250.27697982Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1028" d="M126.9243 214.57825872L614.0286 214.57825872L614.0286 250.27697982 L126.9243 250.27697982Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1029" d="M613.9503 214.57825872L783 214.57825872L783 250.27697982 L613.9503 250.27697982Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1030" d="M0 250.27697981999998L126.9243 250.27697981999998L126.9243 285.97570092 L0 285.97570092Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1031" d="M126.9243 250.27697981999998L614.0286 250.27697981999998L614.0286 285.97570092 L126.9243 285.97570092Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1032" d="M613.9503 250.27697981999998L783 250.27697981999998L783 285.97570092 L613.9503 285.97570092Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1033" d="M0 285.97570092L126.9243 285.97570092L126.9243 321.6101 L0 321.6101Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1034" d="M126.9243 285.97570092L614.0286 285.97570092L614.0286 321.6101 L126.9243 321.6101Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1035" d="M613.9503 285.97570092L783 285.97570092L783 321.6101 L613.9503 321.6101Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1036"><text id="SvgjsText1037" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="6.1315215599999995" transform="rotate(0)"></text></g><g id="SvgjsG1038"><text id="SvgjsText1039" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="6.1315215599999995" transform="rotate(0)"></text></g><g id="SvgjsG1040"><text id="SvgjsText1041" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="6.1315215599999995" transform="rotate(0)"></text></g><g id="SvgjsG1042"><text id="SvgjsText1043" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="41.89456468" transform="rotate(0)"><tspan id="SvgjsTspan1044" dy="17" x="0"><tspan id="SvgjsTspan1045" style="text-decoration:;">  类型别名</tspan></tspan></text></g><g id="SvgjsG1046"><text id="SvgjsText1047" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="41.89456468" transform="rotate(0)"><tspan id="SvgjsTspan1048" dy="17" x="126.9243"><tspan id="SvgjsTspan1049" style="text-decoration:;">  将一组类型/类型结构封装，作为一个新的类型</tspan></tspan></text></g><g id="SvgjsG1050"><text id="SvgjsText1051" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="41.89456468" transform="rotate(0)"><tspan id="SvgjsTspan1052" dy="17" x="613.9503"><tspan id="SvgjsTspan1053" style="text-decoration:;">  联合类型、映射类型</tspan></tspan></text></g><g id="SvgjsG1054"><text id="SvgjsText1055" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="77.6576078" transform="rotate(0)"><tspan id="SvgjsTspan1056" dy="17" x="0"><tspan id="SvgjsTspan1057" style="text-decoration:;">  工具类型</tspan></tspan></text></g><g id="SvgjsG1058"><text id="SvgjsText1059" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="77.6576078" transform="rotate(0)"><tspan id="SvgjsTspan1060" dy="17" x="126.9243"><tspan id="SvgjsTspan1061" style="text-decoration:;">  在类型别名的基础上，基于泛型去动态创建新类型</tspan></tspan></text></g><g id="SvgjsG1062"><text id="SvgjsText1063" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="77.6576078" transform="rotate(0)"><tspan id="SvgjsTspan1064" dy="17" x="613.9503"><tspan id="SvgjsTspan1065" style="text-decoration:;">  基本所有类型工具</tspan></tspan></text></g><g id="SvgjsG1066"><text id="SvgjsText1067" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="113.42065092" transform="rotate(0)"><tspan id="SvgjsTspan1068" dy="17" x="0"><tspan id="SvgjsTspan1069" style="text-decoration:;">  联合类型</tspan></tspan></text></g><g id="SvgjsG1070"><text id="SvgjsText1071" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="113.42065092" transform="rotate(0)"><tspan id="SvgjsTspan1072" dy="17" x="126.9243"><tspan id="SvgjsTspan1073" style="text-decoration:;">  创建一组类型集合，满足其中一个类型即满足这个联合类型（||）</tspan></tspan></text></g><g id="SvgjsG1074"><text id="SvgjsText1075" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="113.42065092" transform="rotate(0)"><tspan id="SvgjsTspan1076" dy="17" x="613.9503"><tspan id="SvgjsTspan1077" style="text-decoration:;">  类型别名、工具类型</tspan></tspan></text></g><g id="SvgjsG1078"><text id="SvgjsText1079" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="149.18369404" transform="rotate(0)"><tspan id="SvgjsTspan1080" dy="17" x="0"><tspan id="SvgjsTspan1081" style="text-decoration:;">  交叉类型</tspan></tspan></text></g><g id="SvgjsG1082"><text id="SvgjsText1083" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="149.18369404" transform="rotate(0)"><tspan id="SvgjsTspan1084" dy="17" x="126.9243"><tspan id="SvgjsTspan1085" style="text-decoration:;">  创建一组类型集合，满足其中所有类型才满足映射联合类型（&amp;&amp;）</tspan></tspan></text></g><g id="SvgjsG1086"><text id="SvgjsText1087" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="149.18369404" transform="rotate(0)"><tspan id="SvgjsTspan1088" dy="17" x="613.9503"><tspan id="SvgjsTspan1089" style="text-decoration:;">  类型别名、工具类型</tspan></tspan></text></g><g id="SvgjsG1090"><text id="SvgjsText1091" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="184.94673716000003" transform="rotate(0)"><tspan id="SvgjsTspan1092" dy="17" x="0"><tspan id="SvgjsTspan1093" style="text-decoration:;">  索引签名类型</tspan></tspan></text></g><g id="SvgjsG1094"><text id="SvgjsText1095" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="184.94673716000003" transform="rotate(0)"><tspan id="SvgjsTspan1096" dy="17" x="126.9243"><tspan id="SvgjsTspan1097" style="text-decoration:;">  声明一个拥有任意属性，键值类型一致的接口结构</tspan></tspan></text></g><g id="SvgjsG1098"><text id="SvgjsText1099" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="184.94673716000003" transform="rotate(0)"><tspan id="SvgjsTspan1100" dy="17" x="613.9503"><tspan id="SvgjsTspan1101" style="text-decoration:;">  映射类型</tspan></tspan></text></g><g id="SvgjsG1102"><text id="SvgjsText1103" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="220.67761927" transform="rotate(0)"><tspan id="SvgjsTspan1104" dy="17" x="0"><tspan id="SvgjsTspan1105" style="text-decoration:;">  索引类型查询</tspan></tspan></text></g><g id="SvgjsG1106"><text id="SvgjsText1107" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="220.67761927" transform="rotate(0)"><tspan id="SvgjsTspan1108" dy="17" x="126.9243"><tspan id="SvgjsTspan1109" style="text-decoration:;">  从一个接口结构，创建一个由其键名字符串字面量组成的联合类型</tspan></tspan></text></g><g id="SvgjsG1110"><text id="SvgjsText1111" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="220.67761927" transform="rotate(0)"><tspan id="SvgjsTspan1112" dy="17" x="613.9503"><tspan id="SvgjsTspan1113" style="text-decoration:;">  映射类型</tspan></tspan></text></g><g id="SvgjsG1114"><text id="SvgjsText1115" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="256.37634037" transform="rotate(0)"><tspan id="SvgjsTspan1116" dy="17" x="0"><tspan id="SvgjsTspan1117" style="text-decoration:;">  索引类型访问</tspan></tspan></text></g><g id="SvgjsG1118"><text id="SvgjsText1119" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="256.37634037" transform="rotate(0)"><tspan id="SvgjsTspan1120" dy="17" x="126.9243"><tspan id="SvgjsTspan1121" style="text-decoration:;">  从一个接口结构，使用键名字符串字面量访问到对应的键值类型</tspan></tspan></text></g><g id="SvgjsG1122"><text id="SvgjsText1123" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="256.37634037" transform="rotate(0)"><tspan id="SvgjsTspan1124" dy="17" x="613.9503"><tspan id="SvgjsTspan1125" style="text-decoration:;">  类型别名、映射类型</tspan></tspan></text></g><g id="SvgjsG1126"><text id="SvgjsText1127" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="292.04290046" transform="rotate(0)"><tspan id="SvgjsTspan1128" dy="17" x="0"><tspan id="SvgjsTspan1129" style="text-decoration:;">  映射类型</tspan></tspan></text></g><g id="SvgjsG1130"><text id="SvgjsText1131" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="292.04290046" transform="rotate(0)"><tspan id="SvgjsTspan1132" dy="17" x="126.9243"><tspan id="SvgjsTspan1133" style="text-decoration:;">  从一个联合类型依次映射到其内部的每一个类型</tspan></tspan></text></g><g id="SvgjsG1134"><text id="SvgjsText1135" font-family="微软雅黑" text-anchor="start" font-size="14px" width="170px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="292.04290046" transform="rotate(0)"><tspan id="SvgjsTspan1136" dy="17" x="613.9503"><tspan id="SvgjsTspan1137" style="text-decoration:;">  工具类型</tspan></tspan></text></g></g><g id="SvgjsG1138" transform="translate(25.000015258789062,24.99999237060547)"><path id="SvgjsPath1139" d="M0 0L126.9243 0L126.9243 35.760899999999985 L0 35.760899999999985Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1140" d="M126.9243 0L614.0286 0L614.0286 35.760899999999985 L126.9243 35.760899999999985Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1141" d="M614.0286 0L783 0L783 35.760899999999985 L614.0286 35.760899999999985Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><g id="SvgjsG1142"><text id="SvgjsText1143" font-family="微软雅黑" text-anchor="start" font-size="14px" width="127px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="6.130449999999993" transform="rotate(0)"><tspan id="SvgjsTspan1144" dy="17" x="0"><tspan id="SvgjsTspan1145" style="text-decoration:;">  类型工具</tspan></tspan></text></g><g id="SvgjsG1146"><text id="SvgjsText1147" font-family="微软雅黑" text-anchor="start" font-size="14px" width="488px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="6.130449999999993" transform="rotate(0)"><tspan id="SvgjsTspan1148" dy="17" x="126.9243"><tspan id="SvgjsTspan1149" style="text-decoration:;">  创建新类型的方式</tspan></tspan></text></g><g id="SvgjsG1150"><text id="SvgjsText1151" font-family="微软雅黑" text-anchor="start" font-size="14px" width="169px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="6.130449999999993" transform="rotate(0)"><tspan id="SvgjsTspan1152" dy="17" x="614.0286"><tspan id="SvgjsTspan1153" style="text-decoration:;">  常见搭配</tspan></tspan></text></g></g></svg>

（完）
