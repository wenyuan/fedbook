# 状态模式

## 介绍

状态模式（State Pattern）允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类，类的行为随着它的状态改变而改变。

当程序需要根据不同的外部情况来做出不同操作时，最直接的方法就是使用 `switch-case` 或 `if-else` 语句将这些可能发生的情况全部兼顾到，但是这种做法应付复杂一点的状态判断时就有点力不从心，开发者得找到合适的位置添加或修改代码，这个过程很容易出错，这时引入状态模式可以某种程度上缓解这个问题。

简单地说就是：

* 一个对象有状态变化
* 每次状态变化都会触发一个逻辑
* 不能总是用 `if-else` 来控制

## 通俗的示例

* 交通信号灯不同颜色的变化：红灯停，绿灯行，黄灯亮了等一等
* 下载文件时候的状态：比如下载验证、下载中、暂停下载、下载完毕、失败，文件在不同状态下表现的行为不一样。

在这些场景中，有以下特点：

* 对象有有限多个状态，且状态间可以相互切换。
* 各个状态和对象的行为逻辑有比较强的对应关系，即在不同状态时，对应的处理逻辑不一样。

## 状态模式的通用实现

使用 JavaScript 来将上面的交通灯例子实现一下。

如果通过 `if-else` 或 `switch-case` 来区分不同状态的处理逻辑，会存在这样的问题：在添加新的状态时，比如增加了 `蓝灯`、`紫灯` 等颜色及其处理逻辑的时候，需要到每个状态里找到相应的地方修改。业务处理逻辑越复杂，找到要修改的状态就不容易，特别是如果是别人的代码，或者接手遗留项目时，需要看完这个 `if-else` 的分支处理逻辑，新增或修改分支逻辑的过程中也很容易引入 Bug。

因此我们可以把每种状态和对应的处理逻辑封装在一起，放到一个状态类中：

```javascript
/* 抽象状态类 */
class AbstractState {
  constructor() {
    if (new.target === AbstractState) {
      throw new Error('抽象类不能直接实例化!');
    }
  }

  /* 抽象方法 */
  employ() {
    throw new Error('抽象方法不能调用!');
  }
}

/* 交通灯状态类 */
class State extends AbstractState {
  constructor(name, desc) {
    super();
    this.color = { name, desc };
  }

  /* 覆盖抽象方法 */
  employ(trafficLight) {
    console.log('交通灯颜色变为 ' + this.color.name + '，' + this.color.desc);
    trafficLight.setState(this);
  }
}

/* 交通灯类 */
class TrafficLight {
  constructor() {
    this.state = null;
  }

  /* 获取交通灯状态 */
  getState() {
    return this.state;
  }

  /* 设置交通灯状态 */
  setState(state) {
    this.state = state;
  }
}

const trafficLight = new TrafficLight();

const greenState = new State('绿色', '可以通行');
const yellowState = new State('黄色', '大家等一等');
const redState = new State('红色', '都给我停下来');

greenState.employ(trafficLight);  // 输出： 交通灯颜色变为 绿色，可以通行
yellowState.employ(trafficLight); // 输出： 交通灯颜色变为 黄色，大家等一等
redState.employ(trafficLight);    // 输出： 交通灯颜色变为 红色，都给我停下来
```

这里的不同状态是同一个类的类实例，比如 `redState` 这个类实例，就把所有红灯状态处理的逻辑封装起来，如果要把状态切换为红灯状态，那么只需要 `redState.employ()` 把交通灯的状态切换为红色，并且把交通灯对应的行为逻辑也切换为红灯状态。

如果要新建状态，不用修改原有代码，只要加上下面的代码：

```javascript
// 接上面

const blueState = new State('蓝色', '这是要干啥')

blueState.employ(trafficLight)    // 输出： 交通灯颜色变为 蓝色，这是要干啥
```

传统的状态区分一般是基于状态类扩展的不同状态类，如何实现看需求具体了，比如逻辑比较复杂，通过新建状态实例的方法已经不能满足需求，那么可以使用状态类的方式。

这里提供一个状态类的实现，同时引入状态的切换逻辑：

```javascript
/* 抽象状态类 */
class AbstractState {
  constructor() {
    if (new.target === AbstractState) {
      throw new Error('抽象类不能直接实例化!');
    }
  }

  /* 抽象方法 */
  employ() {
    throw new Error('抽象方法不能调用!');
  }

  changeState() {
    throw new Error('抽象方法不能调用!');
  }
}

/* 交通灯类-绿灯 */
class GreenState extends AbstractState {
  constructor() {
    super();
    this.colorState = '绿色';
  }

  /* 覆盖抽象方法 */
  employ() {
    console.log('交通灯颜色变为 ' + this.colorState + '，可以通行');
    // 省略业务相关操作
  }

  changeState(trafficLight) {
    trafficLight.setState(trafficLight.yellowState);
  }
}

/* 交通灯类-黄灯 */
class YellowState extends AbstractState {
  constructor() {
    super();
    this.colorState = '黄色';
  }

  /* 覆盖抽象方法 */
  employ() {
    console.log('交通灯颜色变为 ' + this.colorState + '，大家等一等');
    // 省略业务相关操作
  }

  changeState(trafficLight) {
    trafficLight.setState(trafficLight.redState);
  }
}

/* 交通灯类-红灯 */
class RedState extends AbstractState {
  constructor() {
    super();
    this.colorState = '红色';
  }

  /* 覆盖抽象方法 */
  employ() {
    console.log('交通灯颜色变为 ' + this.colorState + '，都给我停下来');
    // 省略业务相关操作
  }

  changeState(trafficLight) {
    trafficLight.setState(trafficLight.greenState);
  }
}

/* 交通灯类 */
class TrafficLight {
  constructor() {
    this.greenState = new GreenState();
    this.yellowState = new YellowState();
    this.redState = new RedState();

    this.state = this.greenState;
  }

  /* 设置交通灯状态 */
  setState(state) {
    state.employ(this);
    this.state = state;
  }

  changeState() {
    this.state.changeState(this);
  }
}


const trafficLight = new TrafficLight();

trafficLight.changeState();   // 输出：交通灯颜色变为 黄色，大家等一等
trafficLight.changeState();   // 输出：交通灯颜色变为 红色，都给我停下来
trafficLight.changeState();   // 输出：交通灯颜色变为 绿色，可以通行
```

如果我们要增加新的交通灯颜色，也是很方便的：

```javascript
// 接上面

/* 交通灯类-蓝灯 */
class BlueState extends AbstractState {
  constructor() {
    super();
    this.colorState = '蓝色';
  }

  /* 覆盖抽象方法 */
  employ() {
    console.log('交通灯颜色变为 ' + this.colorState + '，这是要干啥');
    const redDom = document.getElementById('color-blue');
    redDom.click();
  }
}

const blueState = new BlueState();

trafficLight.employ(blueState);    // 输出：交通灯颜色变为 蓝色，这是要干啥
```

对原来的代码没有修改，非常符合开闭原则了。

## 状态模式的原理

所谓对象的状态，通常指的就是对象实例的属性的值。行为指的就是对象的功能，行为大多可以对应到方法上。状态模式把状态和状态对应的行为从原来的大杂烩代码中分离出来，把每个状态所对应的功能处理封装起来，这样选择不同状态的时候，其实就是在选择不同的状态处理类。

也就是说，状态和行为是相关联的，它们的关系可以描述总结成：**状态决定行为**。由于状态是在运行期被改变的，因此行为也会在运行期根据状态的改变而改变，看起来，同一个对象，在不同的运行时刻，行为是不一样的，就像是类被修改了一样。

为了提取不同的状态类共同的外观，可以给状态类定义一个共同的状态接口或抽象类，正如之前最后的两个代码示例一样，这样可以面向统一的接口编程，无须关心具体的状态类实现。

## 设计原则验证

* 将状态对象和主题对象分离，状态的变化逻辑单独处理
* 符合开放封闭原则

## 状态模式的优缺点

优点：

* **结构相比之下清晰**，避免了过多的 `switch-case` 或 `if-else` 语句的使用，避免了程序的复杂性提高系统的可维护性。
* **符合开闭原则**，每个状态都是一个子类，增加状态只需增加新的状态类即可，修改状态也只需修改对应状态类就可以了。
* **封装性良好**，状态的切换在类的内部实现，外部的调用无需知道类内部如何实现状态和行为的变换。

缺点：

* 引入了多余的类，每个状态都有对应的类，导致系统中类的个数增加。

## 状态模式的适用场景

* 操作中含有庞大的多分支的条件语句，且这些分支依赖于该对象的状态，那么可以使用状态模式来将分支的处理分散到单独的状态类中。
* 对象的行为随着状态的改变而改变，那么可以考虑状态模式，来把状态和行为分离，虽然分离了，但是状态和行为是对应的，再通过改变状态调用状态对应的行为。

## 其他相关模式

### 状态模式和策略模式

状态模式和策略模式在之前的代码就可以看出来，看起来比较类似，他们的区别：

* **状态模式**：重在强调对象内部状态的变化改变对象的行为，状态类之间是**平行**的，无法相互替换。
* **策略模式**：策略的选择由外部条件决定，策略可以动态的切换，策略之间是**平等**的，可以相互替换。

状态模式的状态类是**平行**的，意思是各个状态类封装的状态和对应的行为是相互独立、没有关联的，封装的业务逻辑可能差别很大毫无关联，相互之间不可替换。但是策略模式中的策略是**平等**的，是同一行为的不同描述或者实现，在同一个行为发生的时候，可以根据外部条件挑选任意一个实现来进行处理

### 状态模式和观察者模式

这两个模式都是在状态发生改变的时候触发行为，不过观察者模式的行为是固定的，那就是通知所有的订阅者，而状态模式是根据状态来选择不同的处理逻辑。

* **状态模式**：根据状态来分离行为，当状态发生改变的时候，动态地改变行为。
* **观察者模式**：发布者在消息发生时通知订阅者，具体如何处理则不在乎，或者直接丢给用户自己处理。

这两个模式是可以组合使用的，比如在观察者模式的发布消息部分，当对象的状态发生了改变，触发通知了所有的订阅者后，可以引入状态模式，根据通知过来的状态选择相应的处理。

### 状态模式和单例模式

之前的示例代码中，状态类每次使用都 `new` 出来一个状态实例，实际上使用同一个实例即可，因此可以引入单例模式，不同的状态类可以返回的同一个实例。

（完）
