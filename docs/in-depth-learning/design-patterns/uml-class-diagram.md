# UML 类图

## UML 介绍

UML（Unified Modeling Language）中文名叫统一建模语言，是一种为面向对象系统的产品进行说明、可视化和编制文档的一种标准语言。

它本身包括很多类型的图，但在设计模式中，主要使用其中的一种 —— 类图，以及关系（泛化和关联）。

## 类图

* `+` 表示 public：完全开放
* `#` 表示 protected：对子类开放
* `-` 表示 private：对自己开放

当然了，JavaScript 的语言特性本身只支持 public，而 TypeScript 可以支持这三种类型。

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="359" height="184" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25,25)"><path id="SvgjsPath1009" d="M 0 4Q 0 0 4 0L 305 0Q 309 0 309 4L 309 130Q 309 134 305 134L 4 134Q 0 134 0 130Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1010" d="M 0 30L 309 30M 0 79L 309 79" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"></path><path id="SvgjsPath1011" d="M 0 0L 309 0L 309 134L 0 134Z" stroke="none" fill="none"></path><g id="SvgjsG1012"><text id="SvgjsText1013" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="289px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="4.375" transform="rotate(0)"><tspan id="SvgjsTspan1014" dy="16" x="154.5"><tspan id="SvgjsTspan1015" style="text-decoration:;">类名</tspan></tspan></text></g><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="start" font-size="13px" width="289px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="27.375" transform="rotate(0)"><tspan id="SvgjsTspan1018" dy="16" x="10"><tspan id="SvgjsTspan1019" style="text-decoration:;">+ public属性名A: 类型</tspan></tspan><tspan id="SvgjsTspan1020" dy="16" x="10"><tspan id="SvgjsTspan1021" style="text-decoration:;"># protected属性名B: 类型</tspan></tspan><tspan id="SvgjsTspan1022" dy="16" x="10"><tspan id="SvgjsTspan1023" style="text-decoration:;">- private属性名C: 类型</tspan></tspan></text></g><g id="SvgjsG1024"><text id="SvgjsText1025" font-family="微软雅黑" text-anchor="start" font-size="13px" width="289px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="76.375" transform="rotate(0)"><tspan id="SvgjsTspan1026" dy="16" x="10"><tspan id="SvgjsTspan1027" style="text-decoration:;">+ public方法名A(参数1, 参数2): 返回值类型</tspan></tspan><tspan id="SvgjsTspan1028" dy="16" x="10"><tspan id="SvgjsTspan1029" style="text-decoration:;"># protected方法名B(参数1, 参数2): 返回值类型</tspan></tspan><tspan id="SvgjsTspan1030" dy="16" x="10"><tspan id="SvgjsTspan1031" style="text-decoration:;">- private方法名C(参数1): 返回值类型</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（类图的画法）</p>
</div>

## 泛化和关联

* 泛化，表示继承
  * 用空心箭头表示，箭头指向就是「继承自」
* 关联，表示引用
  * 用实心箭头表示，箭头指向就是「引用了」

# 一个示例

代码示例：

* 继承关系：A 和 B 继承了 People
* 引用关系：People 里面引用了 House

```javascript
class People {
  constructor(name, house) {
    this.name = name;
    this.house = house;
  }
  saySomething() {}

}

class A extends People {
  constructor(name, house) {
    super(name, house);
  }
  saySomething(){
    console.log('I am A');
  }
}

class B extends People {
  constructor(name, house) {
    super(name, house);
  }
  saySomething(){
    console.log('I am B');
  }
}

class Houst {
  constructor(city) {
    this.city = city;
  }
  showCity() {
    console.log(`houst in ${this.city}`);
  }
}

// 测试
let aHoust = new Houst('北京');
let a = new A('aaa', aHoust);
console.log(a); // a 有房子
let b = new B('bbb');
console.log(b); // b 无房子
```

UML 类图示例：

<div style="text-align: center;">
  <svg id="SvgjsSvg1032" width="579" height="349" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1033"><marker id="SvgjsMarker1098" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1099" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1102" markerWidth="14" markerHeight="12" refX="16" refY="6" viewBox="0 0 14 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1103" d="M1,1 L14,6 L1,11L1,1" fill="#ffffff" stroke="#323232" stroke-width="2"></path></marker><marker id="SvgjsMarker1106" markerWidth="14" markerHeight="12" refX="16" refY="6" viewBox="0 0 14 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1107" d="M1,1 L14,6 L1,11L1,1" fill="#ffffff" stroke="#323232" stroke-width="2"></path></marker></defs><g id="SvgjsG1034" transform="translate(25,85)"><path id="SvgjsPath1035" d="M 0 4Q 0 0 4 0L 226 0Q 230 0 230 4L 230 89Q 230 93 226 93L 4 93Q 0 93 0 89Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1036" d="M 0 30L 230 30M 0 63L 230 63" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"></path><path id="SvgjsPath1037" d="M 0 0L 230 0L 230 93L 0 93Z" stroke="none" fill="none"></path><g id="SvgjsG1038"><text id="SvgjsText1039" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="210px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="4.375" transform="rotate(0)"><tspan id="SvgjsTspan1040" dy="16" x="115"><tspan id="SvgjsTspan1041" style="text-decoration:;">People</tspan></tspan></text></g><g id="SvgjsG1042"><text id="SvgjsText1043" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="27.375" transform="rotate(0)"><tspan id="SvgjsTspan1044" dy="16" x="10"><tspan id="SvgjsTspan1045" style="text-decoration:;">+ name: String</tspan></tspan><tspan id="SvgjsTspan1046" dy="16" x="10"><tspan id="SvgjsTspan1047" style="text-decoration:;">+ house: House</tspan></tspan></text></g><g id="SvgjsG1048"><text id="SvgjsText1049" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="67.375" transform="rotate(0)"><tspan id="SvgjsTspan1050" dy="16" x="10"><tspan id="SvgjsTspan1051" style="text-decoration:;">+ saySomething(): void</tspan></tspan></text></g></g><g id="SvgjsG1052" transform="translate(324,161)"><path id="SvgjsPath1053" d="M 0 4Q 0 0 4 0L 226 0Q 230 0 230 4L 230 86Q 230 90 226 90L 4 90Q 0 90 0 86Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1054" d="M 0 30L 230 30M 0 60L 230 60" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"></path><path id="SvgjsPath1055" d="M 0 0L 230 0L 230 90L 0 90Z" stroke="none" fill="none"></path><g id="SvgjsG1056"><text id="SvgjsText1057" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="210px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="4.375" transform="rotate(0)"><tspan id="SvgjsTspan1058" dy="16" x="115"><tspan id="SvgjsTspan1059" style="text-decoration:;">B</tspan></tspan></text></g><g id="SvgjsG1060"><text id="SvgjsText1061" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.375" transform="rotate(0)"></text></g><g id="SvgjsG1062"><text id="SvgjsText1063" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="64.375" transform="rotate(0)"><tspan id="SvgjsTspan1064" dy="16" x="10"><tspan id="SvgjsTspan1065" style="text-decoration:;">+ saySomething(): void</tspan></tspan></text></g></g><g id="SvgjsG1066" transform="translate(25,234)"><path id="SvgjsPath1067" d="M 0 4Q 0 0 4 0L 226 0Q 230 0 230 4L 230 86Q 230 90 226 90L 4 90Q 0 90 0 86Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1068" d="M 0 30L 230 30M 0 60L 230 60" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"></path><path id="SvgjsPath1069" d="M 0 0L 230 0L 230 90L 0 90Z" stroke="none" fill="none"></path><g id="SvgjsG1070"><text id="SvgjsText1071" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="210px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="4.375" transform="rotate(0)"><tspan id="SvgjsTspan1072" dy="16" x="115"><tspan id="SvgjsTspan1073" style="text-decoration:;">House</tspan></tspan></text></g><g id="SvgjsG1074"><text id="SvgjsText1075" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.375" transform="rotate(0)"><tspan id="SvgjsTspan1076" dy="16" x="10"><tspan id="SvgjsTspan1077" style="text-decoration:;">+ city: String</tspan></tspan></text></g><g id="SvgjsG1078"><text id="SvgjsText1079" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="64.375" transform="rotate(0)"><tspan id="SvgjsTspan1080" dy="16" x="10"><tspan id="SvgjsTspan1081" style="text-decoration:;">+ showCity(): void</tspan></tspan></text></g></g><g id="SvgjsG1082" transform="translate(324,25)"><path id="SvgjsPath1083" d="M 0 4Q 0 0 4 0L 226 0Q 230 0 230 4L 230 86Q 230 90 226 90L 4 90Q 0 90 0 86Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1084" d="M 0 30L 230 30M 0 60L 230 60" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"></path><path id="SvgjsPath1085" d="M 0 0L 230 0L 230 90L 0 90Z" stroke="none" fill="none"></path><g id="SvgjsG1086"><text id="SvgjsText1087" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="210px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="700" font-style="" opacity="1" y="4.375" transform="rotate(0)"><tspan id="SvgjsTspan1088" dy="16" x="115"><tspan id="SvgjsTspan1089" style="text-decoration:;">A</tspan></tspan></text></g><g id="SvgjsG1090"><text id="SvgjsText1091" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="34.375" transform="rotate(0)"></text></g><g id="SvgjsG1092"><text id="SvgjsText1093" font-family="微软雅黑" text-anchor="start" font-size="13px" width="210px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="64.375" transform="rotate(0)"><tspan id="SvgjsTspan1094" dy="16" x="10"><tspan id="SvgjsTspan1095" style="text-decoration:;">+ saySomething(): void</tspan></tspan></text></g></g><g id="SvgjsG1096"><path id="SvgjsPath1097" d="M140 179L140 206L140 206L140 230.39999999999998" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1098)"></path></g><g id="SvgjsG1100"><path id="SvgjsPath1101" d="M323.32049378635134 205.26633024758218L257.4462223691353 134.14121110870408" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1102)"></path></g><g id="SvgjsG1104"><path id="SvgjsPath1105" d="M323.25348672832433 70.66537052475445L257.6874477780326 129.10466611088398" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1106)"></path></g></svg>
  <p style="text-align: center; color: #888;">（一个类图示例）</p>
</div>

（完）
