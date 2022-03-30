# 备忘录模式

## 介绍

备忘录模式（Memento Pattern）用于随时记录一个对象的状态变化，随时可以恢复之前的某个状态（如撤销功能）。

## 通俗的示例

前端实现的一些工具比如编辑器中比较常见，其它场景用的比较少。

## 备忘录模式的通用实现

以一个编辑器为例，代码如下：

```javascript
/* 状态备忘 */
class Memento {
  constructor(content) {
    this.content = content;
  }
  getContent() {
    return this.content;
  }
}

/* 备忘列表 */
class CareTaker {
  constructor() {
    this.list = [];
  }
  add(memento) {
    this.list.push(memento);
  }
  get(index) {
    return this.list[index];
  }
}

/* 编辑器 */
class Editor {
  constructor() {
    this.content = null;
  }
  setContent(content) {
    this.content = content;
  }
  getContent() {
    return this.content;
  }
  saveContentToMemento() {
    return new Memento(this.content);
  }
  getContentFromMemento(memento) {
    this.content = memento.getContent();
  }
}

// 测试
let editor = new Editor();
let careTaker = new CareTaker();
editor.setContent('111');
editor.setContent('222');
careTaker.add(editor.saveContentToMemento()); // 将当前内容备份
editor.setContent('333');
careTaker.add(editor.saveContentToMemento()); // 将当前内容备份
editor.setContent('444');

console.log(editor.getContent());
editor.getContentFromMemento(careTaker.get(1)); // 撤销
console.log(editor.getContent());
editor.getContentFromMemento(careTaker.get(0)); // 撤销
console.log(editor.getContent());
```

## 设计原则验证

* 状态对象与使用者分开，解耦
* 符合开放封闭原则

（完）
