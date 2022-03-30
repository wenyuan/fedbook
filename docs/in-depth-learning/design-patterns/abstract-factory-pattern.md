# 抽象工厂模式

## 介绍

工厂模式（Factory Pattern），根据输入的不同返回不同类的实例，一般用来创建同一类对象。工厂方式的主要思想是**将对象的创建与对象的实现分离**。

抽象工厂模式（Abstract Factory Pattern），通过对类的工厂抽象使其业务用于对产品类簇的创建，而不是负责创建某一类产品的实例。关键在于使用抽象类制定了实例的结构，调用者直接面向实例的结构编程，**从实例的具体实现中解耦**。

我们知道 JavaScript 并不是强面向对象语言，所以使用传统编译型语言比如 JAVA 等实现的设计模式和 JavaScript 不太一样，比如 JavaScript 中没有原生的类和接口等（不过 ES6+ 渐渐提供类似的语法糖），我们可以用变通的方式来解决。最重要的是设计模式背后的核心思想，和它所要解决的问题。

## 通俗的示例

还是以之前工厂模式中举的 KFC 的例子，之前我们说 KFC 是工厂，汉堡是产品，工厂封装做产品的工作，做好直接给购买者。

现在进行扩展，汉堡属于一种具体的产品，同样还有薯条、咖啡、牛奶等也都是产品。无论你点哪个产品，他们都具有同样的属性：炸的都可以吃，冲调的都可以喝。对于工厂也一样，KFC 可以做汉堡、薯条、咖啡、牛奶，麦当劳和华莱士也可以，那么这些工厂就具有同样的功能结构。

这样的场景就是属于抽象工厂模式的例子：

* 食品类属于抽象产品类，制定具体产品类所具备的属性（可以喝、可以吃）。
* 具体的汉堡类、薯条类属于产品类，在这里面实现了该产品自身的具体属性值（原材料、口味、佐料）。
* 工厂类和之前的工厂模式一样，负责具体生产产品实例。

访问者通过柜台获取想拿的产品。只要我们点的是冲调产品，即使还没有被做出来，我们就知道是可以喝的。

推广一下，工厂功能也可以被抽象（抽象工厂类），继承这个类的工厂实例都具有油炸食品和冲调饮品的功能，这样也完成了抽象类对实例的结构约束。

在类似场景中，这些例子有这样的特点：只要实现了抽象类的实例，都实现了抽象类制定的结构；

## 抽象工厂模式的通用实现

我们提炼一下抽象工厂模式，快餐店品牌是抽象工厂类（AbstractFactory），实现抽象工厂类的 KFC 是具体的工厂（Factory），它和麦当劳、华莱士等存在共同的功能结构。食品种类是抽象类（AbstractFactory），而实现抽象类的菜品是具体的产品（Product）。

总的来说就是一句话：只要这几个平级的类存在共同的功能结构，就可以将共同结构作为抽象类抽象出来。

通过工厂拿到实现了不同抽象类的产品，这些产品可以根据实现的抽象类被区分为类簇。主要有下面几个概念：

* **Factory**：工厂类，负责返回产品实例。
* **AbstractFactory**：抽象工厂类，制定工厂实例的结构。
* **Product**：产品类，访问者从工厂中拿到的产品实例，实现抽象类。
* **AbstractProduct**：产品抽象类，由具体产品实现，制定产品实例的结构

结构如下：

<div style="text-align: center;">
  <img src="./assets/abstract-factory-pattern.jpg" alt="抽象工厂模式结构图" style="width: 640px;">
  <p style="text-align: center; color: #888;">（抽象工厂模式结构图）</p>
</div>

代码如下：

> 我们知道 JavaScript 并不强面向对象，也没有提供抽象类（至少目前没有提供），但是可以模拟抽象类。用对 `new.target` 来判断 `new` 的类，在父类方法中 `throw new Error()`，如果子类中没有实现这个方法就会抛错，这样来模拟抽象类。

```javascript
/* 工厂 抽象类 */
class AbstractFactory {
  constructor() {
    if (new.target === AbstractFactory)
      throw new Error('抽象类不能直接实例化!')
  }

  /* 抽象方法 */
  createProduct1() { throw new Error('抽象方法不能调用!') }
}

/* 具体饭店类 */
class Factory extends AbstractFactory {
  constructor() { super() }

  createProduct1(type) {
    switch (type) {
      case 'Product1':
        return new Product1()
      case 'Product2':
        return new Product2()
      default:
        throw new Error('当前没有这个产品 -。-')
    }
  }
}

/* 抽象产品类 */
class AbstractProduct {
  constructor() {
    if (new.target === AbstractProduct)
      throw new Error('抽象类不能直接实例化!')
    this.kind = '抽象产品类1'
  }

  /* 抽象方法 */
  operate() { throw new Error('抽象方法不能调用!') }
}

/* 具体产品类1 */
class Product1 extends AbstractProduct {
  constructor() {
    super()
    this.type = 'Product1'
  }

  operate() { console.log(this.kind + ' - ' + this.type) }
}

/* 具体产品类2 */
class Product2 extends AbstractProduct {
  constructor() {
    super()
    this.type = 'Product2'
  }

  operate() { console.log(this.kind + ' - ' + this.type) }
}


const factory = new Factory()

const prod1 = factory.createProduct1('Product1')
prod1.operate()										// 输出: 抽象产品类1 - Product1
const prod2 = factory.createProduct1('Product3')	// 输出: Error 当前没有这个产品 -。-
```

如果希望增加第二个类簇的产品，除了需要改一下对应工厂类之外，还需要增加一个抽象产品类，并在抽象产品类基础上扩展新的产品。

我们在实际使用的时候不一定需要每个工厂都继承抽象工厂类，比如只有一个工厂的话我们可以直接使用工厂模式，在实战中灵活使用。

## 设计原则验证

* 不符合开放封闭原则，因为扩展新类簇时需要同时创建新的抽象类。

## 抽象工厂模式的优缺点

优点：

* 抽象产品类将产品的结构抽象出来，访问者不需要知道产品的具体实现，只需要面向产品的结构编程即可，**从产品的具体实现中解耦**。

缺点：

* **扩展新类簇的产品类比较困难**，因为需要创建新的抽象产品类，并且还要修改工厂类，违反开闭原则。
* 带来了**系统复杂度**，增加了新的类，和新的继承关系。

## 抽象工厂模式的适用场景

如果一组实例都有相同的结构，那么就可以使用抽象工厂模式。

## 其他相关模式

### 抽象工厂模式与工厂模式

工厂模式和抽象工厂模式的区别：

* **工厂模式** 主要关注单独的产品实例的创建。
* **抽象工厂模式** 主要关注产品类簇实例的创建，如果产品类簇只有一个产品，那么这时的抽象工厂模式就退化为工厂模式了。

根据场景灵活使用即可。

（完）
