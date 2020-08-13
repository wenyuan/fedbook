# 执行上下文

## 1. 执行上下文是什么

我们知道 JavaScript 是单线程语言，也就是同一时间只能执行一个任务。当 JavaScript 解释器初始化代码后，默认会进入全局的执行环境，之后每调用一个函数， JavaScript 解释器会创建一个新的执行环境，确定该函数在执行期间用到的诸如 `this`、变量、对象以及函数等。

一言以蔽之：**执行环境是 JavaScript 执行一段代码时的运行环境**。

## 2. 执行上下文的分类

* 全局执行上下文：简单的理解，一个程序只有一个全局对象即 `window` 对象，全局对象所处的执行上下文就是全局执行上下文。
* 函数执行环境：函数调用过程会创建函数的执行环境，因此每个程序可以有无数个函数执行环境。
* Eval执行环境：`eval` 代码特定的环境（永远不要使用 `eval`！—— [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/eval "eval() - JavaScript | MDN")）。

## 3. 执行上下文的产生

### 3.1 何时产生

一段 JavaScript 代码在执行之前需要被 JavaScript 引擎编译，**编译**完成之后，才会进入**执行**阶段。

例如输入下面的代码：

```javascript
sayHello()
console.log(siteName)
var siteName = '闻鸢同学的技能书'
function sayHello() {
 console.log('欢迎访问：www.skillbook.top')
}
```

经过编译后生成两部分：

* 第一部分：变量提升部分的代码。

```javascript
var siteName = undefined
function sayHello() {
 console.log('欢迎访问：www.skillbook.top')
}
```

* 第二部分：执行部分的代码。

```javascript
sayHello()
console.log(siteName)
siteName = '闻鸢同学的技能书'
```

最后输出结果：

```bash
> "欢迎访问：www.skillbook.top"
> undefined
```

整个 JavaScript 的执行流程如下图所示：

<div style="text-align: center">
  <svg id="SvgjsSvg1006" width="859.140625" height="484.25" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1036" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1037" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="3"></path></marker><marker id="SvgjsMarker1040" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1041" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="3"></path></marker><pattern id="SvgjsPattern1088" x="0" y="0" width="282.37500000000006" height="94.5" patternUnits="userSpaceOnUse"><image id="SvgjsImage1089" xlink:href="https://cdn.processon.com/5f2f6d7d1e085366ab1709c5?e=1596947341&amp;amp;token=trhI0BY8QfVrIGn9nENop6JAc6l5nZuxhjQ62UfM:ZCkxMetu3DFh_i8rFn6xewzFSoU=" width="282.37500000000006" height="94.5" preserveAspectRatio="none" crossOrigin="anonymous" x="0" y="0"></image></pattern><pattern id="SvgjsPattern1100" x="0" y="0" width="298" height="70.5" patternUnits="userSpaceOnUse"><image id="SvgjsImage1101" xlink:href="https://cdn.processon.com/5f2f6fd1637689313ac3d1fe?e=1596947937&amp;amp;token=trhI0BY8QfVrIGn9nENop6JAc6l5nZuxhjQ62UfM:WZfSn8Gtxl34ZCJ_pNkCraMgXX0=" width="298" height="70.5" preserveAspectRatio="none" crossOrigin="anonymous" x="0" y="0"></image></pattern><pattern id="SvgjsPattern1112" x="0" y="0" width="208" height="62" patternUnits="userSpaceOnUse"><image id="SvgjsImage1113" xlink:href="https://cdn.processon.com/5f2f708e1e085366ab170e6d?e=1596948127&amp;amp;token=trhI0BY8QfVrIGn9nENop6JAc6l5nZuxhjQ62UfM:qIll9YQiUvq5xKD4sV1EiJNfl50=" width="208" height="62" preserveAspectRatio="none" crossOrigin="anonymous" x="0" y="0"></image></pattern></defs><g id="SvgjsG1008" transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,233,220.25)"><path id="SvgjsPath1009" d="M 13 0L 26 78L 0 78Z" stroke-dasharray="10,6" stroke="rgba(184,184,184,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="6px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="38.8" transform="rotate(0)"></text></g></g><g id="SvgjsG1012" transform="translate(25,89)"><path id="SvgjsPath1013" d="M 0 4Q 0 0 4 0L 284.99999999999994 0Q 288.99999999999994 0 288.99999999999994 4L 288.99999999999994 102Q 288.99999999999994 106 284.99999999999994 106L 4 106Q 0 106 0 102Z" stroke-dasharray="10,6" stroke="rgba(184,184,184,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1014"><text id="SvgjsText1015" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="269px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="43.05" transform="rotate(0)"></text></g></g><g id="SvgjsG1016" transform="translate(135.42857142857144,224.25)"><path id="SvgjsPath1017" d="M 0 0L 120 0L 120 66L 0 66Z" stroke="rgba(138,138,138,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1018"><text id="SvgjsText1019" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="100px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="12.9" transform="rotate(0)"><tspan id="SvgjsTspan1020" dy="17" x="60"><tspan id="SvgjsTspan1021" style="text-decoration:;">输入一段</tspan></tspan><tspan id="SvgjsTspan1022" dy="17" x="60"><tspan id="SvgjsTspan1023" style="text-decoration:;">JavaScript 代码</tspan></tspan></text></g></g><g id="SvgjsG1024" transform="translate(331,133.25)"><path id="SvgjsPath1025" d="M 0 0L 354 0L 354 237L 0 237Z" stroke="rgba(138,138,138,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1026"><text id="SvgjsText1027" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="334px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="108.55" transform="rotate(0)"></text></g></g><g id="SvgjsG1028" transform="translate(757.1428571428573,224.25)"><path id="SvgjsPath1029" d="M 0 0L 77 0L 77 66L 0 66Z" stroke="rgba(138,138,138,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1030"><text id="SvgjsText1031" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="57px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="21.9" transform="rotate(0)"><tspan id="SvgjsTspan1032" dy="17" x="38.5"><tspan id="SvgjsTspan1033" style="text-decoration:;">输出结果</tspan></tspan></text></g></g><g id="SvgjsG1034"><path id="SvgjsPath1035" d="M256 259.25L291 259.25L291 259.25L326 259.25" stroke="#323232" stroke-width="3" fill="none" marker-end="url(#SvgjsMarker1036)"></path></g><g id="SvgjsG1038"><path id="SvgjsPath1039" d="M686.2857142857143 259.25L719.7857142857143 259.25L719.7857142857143 259.25L753.2857142857143 259.25" stroke="#323232" stroke-width="3" fill="none" marker-end="url(#SvgjsMarker1040)"></path></g><g id="SvgjsG1042" transform="translate(339,144.25)"><path id="SvgjsPath1043" d="M 0 0L 338 0L 338 122L 0 122Z" stroke="rgba(207,207,207,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1044"><text id="SvgjsText1045" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="318px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="51.05" transform="rotate(0)"></text></g></g><g id="SvgjsG1046" transform="translate(451,144.25)"><path id="SvgjsPath1047" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1048"><text id="SvgjsText1049" font-family="微软雅黑" text-anchor="middle" font-size="18px" width="120px" fill="#ff6666" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="18px" weight="400" font-style="" opacity="1" y="5.800000000000001" transform="rotate(0)"><tspan id="SvgjsTspan1050" dy="22" x="60"><tspan id="SvgjsTspan1051" style="text-decoration:;">执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1052" transform="translate(344.5,189.25)"><path id="SvgjsPath1053" d="M 0 0L 165.5 0L 165.5 64L 0 64Z" stroke="rgba(138,138,138,1)" stroke-width="2" fill-opacity="1" fill="#66b2ff"></path><g id="SvgjsG1054"><text id="SvgjsText1055" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="146px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="11.9" transform="rotate(0)"><tspan id="SvgjsTspan1056" dy="17" x="83"><tspan id="SvgjsTspan1057" style="text-decoration:;">变量环境</tspan></tspan><tspan id="SvgjsTspan1058" dy="17" x="83"><tspan id="SvgjsTspan1059" style="text-decoration:;">Variable Environment</tspan></tspan></text></g></g><g id="SvgjsG1060" transform="translate(514.5,189.25)"><path id="SvgjsPath1061" d="M 0 0L 157.5 0L 157.5 64L 0 64Z" stroke="rgba(138,138,138,1)" stroke-width="2" fill-opacity="1" fill="#ebebeb"></path><g id="SvgjsG1062"><text id="SvgjsText1063" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="138px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="11.9" transform="rotate(0)"><tspan id="SvgjsTspan1064" dy="17" x="79"><tspan id="SvgjsTspan1065" style="text-decoration:;">词法环境</tspan></tspan><tspan id="SvgjsTspan1066" dy="17" x="79"><tspan id="SvgjsTspan1067" style="text-decoration:;">Lexical Environment</tspan></tspan></text></g></g><g id="SvgjsG1068" transform="translate(339,277.25)"><path id="SvgjsPath1069" d="M 0 0L 338 0L 338 80L 0 80Z" stroke="rgba(138,138,138,1)" stroke-width="2" fill-opacity="1" fill="#66b2ff"></path><g id="SvgjsG1070"><text id="SvgjsText1071" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="318px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="28.9" transform="rotate(0)"><tspan id="SvgjsTspan1072" dy="17" x="169"><tspan id="SvgjsTspan1073" style="text-decoration:;">可执行代码</tspan></tspan></text></g></g><g id="SvgjsG1074" transform="translate(229,220.25)"><path id="SvgjsPath1075" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1076"><text id="SvgjsText1077" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="700" align="middle" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="8.9" transform="rotate(0)"><tspan id="SvgjsTspan1078" dy="17" x="60"><tspan id="SvgjsTspan1079" style="text-decoration:;">编译代码</tspan></tspan></text></g></g><g id="SvgjsG1080" transform="translate(660,220.25)"><path id="SvgjsPath1081" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1082"><text id="SvgjsText1083" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="700" align="middle" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="8.9" transform="rotate(0)"><tspan id="SvgjsTspan1084" dy="17" x="60"><tspan id="SvgjsTspan1085" style="text-decoration:;">执行代码</tspan></tspan></text></g></g><g id="SvgjsG1086" transform="translate(31.624999999999886,94.75)"><path id="SvgjsPath1087" d="M 0 0L 282.37500000000006 0L 282.37500000000006 94.5L 0 94.5Z" stroke="none" fill="url(#SvgjsPattern1088)"></path></g><g id="SvgjsG1090" transform="matrix(-1,1.2246467991473532e-16,-1.2246467991473532e-16,-1,433.0000000000001,184.75)"><path id="SvgjsPath1091" d="M 11.000000000000057 0L 22.000000000000114 104.5L 0 104.5Z" stroke-dasharray="10,6" stroke="rgba(184,184,184,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1092"><text id="SvgjsText1093" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="3px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="55.3625" transform="rotate(0)"></text></g></g><g id="SvgjsG1094" transform="translate(356,25)"><path id="SvgjsPath1095" d="M 0 4Q 0 0 4 0L 306 0Q 310 0 310 4L 310 82Q 310 86 306 86L 4 86Q 0 86 0 82Z" stroke-dasharray="10,6" stroke="rgba(184,184,184,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1096"><text id="SvgjsText1097" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="290px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="33.05" transform="rotate(0)"></text></g></g><g id="SvgjsG1098" transform="translate(362,32.75)"><path id="SvgjsPath1099" d="M 0 0L 298 0L 298 70.5L 0 70.5Z" stroke="none" fill="url(#SvgjsPattern1100)"></path></g><g id="SvgjsG1102" transform="translate(501,360.25)"><path id="SvgjsPath1103" d="M 10 0L 20 77L 0 77Z" stroke-dasharray="10,6" stroke="rgba(184,184,184,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1104"><text id="SvgjsText1105" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="0px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="38.175" transform="rotate(0)"></text></g></g><g id="SvgjsG1106" transform="translate(401.5,388.25)"><path id="SvgjsPath1107" d="M 0 4Q 0 0 4 0L 220 0Q 224 0 224 4L 224 67Q 224 71 220 71L 4 71Q 0 71 0 67Z" stroke-dasharray="10,6" stroke="rgba(184,184,184,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1108"><text id="SvgjsText1109" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="204px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="25.55" transform="rotate(0)"></text></g></g><g id="SvgjsG1110" transform="translate(409.5,392.75)"><path id="SvgjsPath1111" d="M 0 0L 208 0L 208 62L 0 62Z" stroke="none" fill="url(#SvgjsPattern1112)"></path></g></svg>
  <p style="text-align:center;color:#888">（JavaScript 执行流程图）</p>
</div>

从上图可以看出，输入一段代码，**经过编译后**，会生成两部分内容：**执行上下文（Execution context）** 和**可执行代码**。

### 3.2 如何创建

上面是**宏观**介绍了执行环境是什么时候产生的：每次调用函数时，JavaScript 引擎都会创建一个新的执行环境；

接下来从**微观**角度简单描述下执行环境是如何创建的：答案是执行器会分为两个阶段来完成， 分别是创建阶段和激活(执行)阶段。而即使步骤相同但是由于规范的不同，每个阶段执行的过程有很大的不同。

**ES3 规范**

* 创建阶段：  
  ① 创建作用域链。  
  ② 创建变量对象 VO（即 variable object，包括参数，函数，变量）。  
  ③ 确定 `this` 的值。
* 激活/执行阶段：  
  完成变量分配，执行代码。

**ES5 规范**

* 创建阶段：  
  ① 确定 `this` 的值。  
  ② 创建词法环境（Lexical Environment）。  
  ③ 创建变量环境（Variable Environment）。
* 激活/执行阶段：  
  完成变量分配，执行代码。

从规范上可以发现，ES3 和 ES5 在执行环境的创建阶段存在差异，当然他们都会在这个阶段确定 `this` 的值。

但为了避免混淆，下面的内容将围绕 ES5 规范来讲解。

## 4. 执行上下文的组成

ES5 标准规定，执行上下文包括：词法环境、变量环境、this 绑定。

* 词法环境
* 变量环境
* this 绑定

在《JavaScript高级程序设计（第3版）》（P73）中介绍执行环境及作用域时，多次提到了变量对象和活动对象，而较新的材料里用的都是词法环境、变量环境。我在阅读该书时对此产生了疑问，一番查阅得到的答案是：变量对象与活动对象的概念是 ES3 提出的老概念，从 ES5 开始就用词法环境和变量环境替代了。

ES3 的变量对象、活动对象为什么可以被抛弃？个人认为有两个原因，第一个是在创建过程中所执行的创建作用域链和创建变量对象（VO）都可以在创建词法环境的过程中完成。第二个是针对 ES6 中存储函数声明和变量（`let` 和 `const`），以及存储变量（`var`）的绑定，可以通过两个不同的过程（词法环境，变量环境）区分开来。

### 4.1 词法环境（Lexical Environment）

词法环境由两个部分组成：

* 环境记录（enviroment record），存储变量和函数声明。
* 对外部环境的引用（outer），可以通过它访问外部词法环境（作用域链）。

环境记录分两部分：

* 声明性环境记录（declarative environment records）：存储变量、函数和参数，但是主要用于函数 、`catch` 词法环境。  
  注意：函数环境下会存储 arguments 的值。
* 对象环境记录（object environment records），主要用于 `with` 和全局的词法环境。

伪代码如下：

```javascript
// 全局环境
GlobalExectionContext = {  
// 词法环境
  LexicalEnvironment: {  
    EnvironmentRecord: {
        ···
    }
    outer: <null>  
  }  
}

// 函数环境
FunctionExectionContext = {  
// 词法环境
  LexicalEnvironment: {  
    EnvironmentRecord: {  
        ···
        // 包含argument
    }
    outer: <Global or outer function environment reference>  
  }  
}
```

### 4.2 变量环境（Variable Environment）

变量环境也是个词法环境，主要的区别在于：  
词法环境（Lexical Environment）用于存储函数声明和变量（通过 `let` 和 `const` 声明的变量）；  
变量环境（Variable Environment）仅用于存储变量（通过 `var` 声明的变量）。

### 4.3 this 绑定

每个执行环境中都有一个 `this`，前面提到过执行环境主要分为三种：全局执行环境、函数执行环境和 Eval执行环境，所以对应的 `this` 也只有这三种：  
全局执行环境中的 `this`、函数中的 `this` 和 `eval` 中的 `this`。

由于 `eval` 使用的不多，对此就不做介绍了。关于 `this` 后面会单独出一个章节。

### 4.4 伪代码展示

输入代码：

```javascript
let a = 20;  
const b = 30;  
var c;

function d(e, f) {  
 var g = 20;  
 return e * f * g;  
}

c = d(20, 30);
```

整个创建过程的执行上下文：

```javascript
// 全局环境
GlobalExectionContext = {

  this: <Global Object>,
  // 词法环境
  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  // 环境记录分类：对象环境记录
      a: < uninitialized >,  // 未初始化
      b: < uninitialized >,  
      d: < func >  
    }  
    outer: <null>  
  },

  // 变量环境
  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  // 环境记录分类：对象环境记录
      c: undefined,  // undefined
    }  
    outer: <null>  
  }  
}

// 函数环境
FunctionExectionContext = {  
   
  this: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  // 环境记录分类： 声明环境记录
      Arguments: {0: 20, 1: 30, length: 2},  // 函数环境下，环境记录比全局环境下的环境记录多了 argument 对象
    },  
    outer: <GlobalLexicalEnvironment>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  // 环境记录分类： 声明环境记录
      g: undefined  
    },  
    outer: <GlobalLexicalEnvironment>  
  }  
}
```

## 5. 执行栈：用来管理执行上下文

函数多了，就有多个函数执行上下文，每次调用函数创建一个新的执行上下文，那如何管理创建的那么多执行上下文呢？

执行栈（Execution Stack），也称为执行上下文栈（Execution Context Stack），在其他编程语言中也被叫做调用栈（Call Stack），在 ECMAScript 文档里是叫 [Execution Context Stack](https://www.ecma-international.org/ecma-262/9.0/index.html#sec-execution-contexts "Execution Context Stack")，但本质上是同一个的东西的不同名称。

它是**一种用来管理执行上下文的数据结构**，存储了在代码执行期间创建的所有执行上下文。因为是栈，所以遵循 LIFO（后进先出）的原则。

### 5.1 执行栈运行过程

从一个简单的例子开始讲起：

```javascript
function foo(i) {
  if (i < 0) return;
  console.log('begin:' + i);
  foo(i - 1);
  console.log('end:' + i);
}
foo(2);
```

当 JavaScript 引擎首次读取你的脚本时，它会创建一个全局执行上下文并将其推入当前的执行栈底部。当调用一个函数时，引擎会为该函数创建一个新的执行上下文并将其推到当前执行栈的顶端。

在新的执行上下文中，如果继续发生一个新函数调用，则继续创建新的执行上下文并推到当前执行栈的顶端，直到再无新函数调用。

引擎会运行执行上下文在执行栈顶端的函数，当此函数运行完成后，其对应的执行上下文将会从执行栈中弹出，上下文控制权将移到当前执行栈的下一个执行上下文，直到全局执行上下文。

当程序或浏览器关闭时，全局执行上下文也将退出并销毁。

<div style="text-align: center">
  <svg id="SvgjsSvg1006" width="931" height="194" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1106" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1107" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1110" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1111" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1114" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1115" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1118" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1119" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1122" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1123" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1126" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1127" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"></path></marker></defs><g id="SvgjsG1008" transform="translate(25,133)"><path id="SvgjsPath1009" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="16" x="57"><tspan id="SvgjsTspan1013" style="text-decoration:;">全局执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1014" transform="translate(153,133)"><path id="SvgjsPath1015" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1018" dy="16" x="57"><tspan id="SvgjsTspan1019" style="text-decoration:;">全局执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1020" transform="translate(280,133)"><path id="SvgjsPath1021" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1022"><text id="SvgjsText1023" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1024" dy="16" x="57"><tspan id="SvgjsTspan1025" style="text-decoration:;">全局执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1026" transform="translate(407,133)"><path id="SvgjsPath1027" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1028"><text id="SvgjsText1029" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1030" dy="16" x="57"><tspan id="SvgjsTspan1031" style="text-decoration:;">全局执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1032" transform="translate(535,133)"><path id="SvgjsPath1033" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1034"><text id="SvgjsText1035" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1036" dy="16" x="57"><tspan id="SvgjsTspan1037" style="text-decoration:;">全局执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1038" transform="translate(663,133)"><path id="SvgjsPath1039" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1040"><text id="SvgjsText1041" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1042" dy="16" x="57"><tspan id="SvgjsTspan1043" style="text-decoration:;">全局执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1044" transform="translate(792,133)"><path id="SvgjsPath1045" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1046"><text id="SvgjsText1047" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1048" dy="16" x="57"><tspan id="SvgjsTspan1049" style="text-decoration:;">全局执行上下文</tspan></tspan></text></g></g><g id="SvgjsG1050" transform="translate(153,97)"><path id="SvgjsPath1051" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1052"><text id="SvgjsText1053" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1054" dy="16" x="57"><tspan id="SvgjsTspan1055" style="text-decoration:;">foo(2)</tspan></tspan></text></g></g><g id="SvgjsG1056" transform="translate(280,97)"><path id="SvgjsPath1057" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1058"><text id="SvgjsText1059" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1060" dy="16" x="57"><tspan id="SvgjsTspan1061" style="text-decoration:;">foo(2)</tspan></tspan></text></g></g><g id="SvgjsG1062" transform="translate(407,97)"><path id="SvgjsPath1063" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1064"><text id="SvgjsText1065" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1066" dy="16" x="57"><tspan id="SvgjsTspan1067" style="text-decoration:;">foo(2)</tspan></tspan></text></g></g><g id="SvgjsG1068" transform="translate(535,97)"><path id="SvgjsPath1069" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1070"><text id="SvgjsText1071" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1072" dy="16" x="57"><tspan id="SvgjsTspan1073" style="text-decoration:;">foo(2)</tspan></tspan></text></g></g><g id="SvgjsG1074" transform="translate(663,97)"><path id="SvgjsPath1075" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1076"><text id="SvgjsText1077" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1078" dy="16" x="57"><tspan id="SvgjsTspan1079" style="text-decoration:;">foo(2)</tspan></tspan></text></g></g><g id="SvgjsG1080" transform="translate(280,61)"><path id="SvgjsPath1081" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1082"><text id="SvgjsText1083" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1084" dy="16" x="57"><tspan id="SvgjsTspan1085" style="text-decoration:;">foo(1)</tspan></tspan></text></g></g><g id="SvgjsG1086" transform="translate(407,61)"><path id="SvgjsPath1087" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1088"><text id="SvgjsText1089" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1090" dy="16" x="57"><tspan id="SvgjsTspan1091" style="text-decoration:;">foo(1)</tspan></tspan></text></g></g><g id="SvgjsG1092" transform="translate(535,61)"><path id="SvgjsPath1093" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1094"><text id="SvgjsText1095" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1096" dy="16" x="57"><tspan id="SvgjsTspan1097" style="text-decoration:;">foo(1)</tspan></tspan></text></g></g><g id="SvgjsG1098" transform="translate(407,25)"><path id="SvgjsPath1099" d="M 0 0L 114 0L 114 36L 0 36Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1100"><text id="SvgjsText1101" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="94px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="8.05" transform="rotate(0)"><tspan id="SvgjsTspan1102" dy="16" x="57"><tspan id="SvgjsTspan1103" style="text-decoration:;">foo(0)</tspan></tspan></text></g></g><g id="SvgjsG1104"><path id="SvgjsPath1105" d="M82 133L82 115L153 115" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1106)"></path></g><g id="SvgjsG1108"><path id="SvgjsPath1109" d="M210 97L210 79L280 79" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1110)"></path></g><g id="SvgjsG1112"><path id="SvgjsPath1113" d="M337 61L337 43L407 43" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1114)"></path></g><g id="SvgjsG1116"><path id="SvgjsPath1117" d="M521 43L592 43L592 61" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1118)"></path></g><g id="SvgjsG1120"><path id="SvgjsPath1121" d="M649 79L720 79L720 97" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1122)"></path></g><g id="SvgjsG1124"><path id="SvgjsPath1125" d="M777 115L849 115L849 133" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1126)"></path></g></svg>
  <p style="text-align:center;color:#888">（JavaScript 执行栈）</p>
</div>

最后输出结果：

```bash
begin:2
begin:1
begin:0
end:0
end:1
end:2
```

### 5.2 执行栈大小

执行栈是有大小的，当入栈的执行上下文超过一定数目，或达到最大调用深度，就会出现栈溢出（Stack Overflow）的问题，这在递归代码中很容易出现。

如下代码所示，会抛出错误信息：超过了最大栈调用大小（Maximum call stack size exceeded）。

```javascript
function division(a,b){
  return division(a,b)
}
console.log(division(1,2))
```

<div style="text-align: center">
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="408" height="221" viewBox="0 0 408 221">
    <image id="wenyuan_maximum-call-stack-size-exceeded" data-name="wenyuan_maximum-call-stack-size-exceeded" width="408" height="221" xlink:href="data:img/png;base64,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"/>
  </svg>
  <p style="text-align:center;color:#888">（JavaScript 栈溢出错误）</p>
</div>

那为什么会出现这个问题呢？这是因为当 JavaScript 引擎开始执行这段代码时，它首先调用函数 division，并创建执行环境，压入栈中；然而，这个函数是递归的，并且没有任何终止条件，所以它会一直创建新的函数执行环境，并反复将其压入栈中，但栈是有容量限制的，超过最大数量后就会出现栈溢出的错误。

理解了栈溢出原因后，你就可以使用一些方法来避免或者解决栈溢出的问题，比如把递归调用的形式改造成其他形式，或者使用加入定时器的方法来把当前任务拆分为其他很多小任务。
