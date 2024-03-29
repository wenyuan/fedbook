# 代理模式

## 介绍

代理模式（Proxy Pattern）又称委托模式，它为目标对象创造了一个代理对象，以控制对目标对象的访问。

代理模式把代理对象插入到访问者和目标对象之间，从而为访问者对目标对象的访问引入一定的间接性。正是这种间接性，给了代理对象很多操作空间，比如在调用目标对象前和调用后进行一些预操作和后操作，从而实现新的功能或者扩展目标的功能。

## 通俗的示例

明星一般都有个经纪人，如果某个品牌来找明星做广告，需要经纪人帮明星做接洽工作，而且经纪人也起到过滤的作用。

在类似场景中，这些例子有以下特点：

* 广告商（访问者）对明星（目标）的访问都是通过经纪人（代理）来完成。
* 访问者不关心实例创建过程。

## 代理模式的通用实现

就用明星和经纪人的例子，明星就相当于被代理的目标对象（Target），而经纪人就相当于代理对象（Proxy），希望找明星的人是访问者（Visitor），他们直接找不到明星，只能找明星的经纪人来进行业务商洽。主要有以下几个概念：

* **Target**：目标对象，也是被代理对象，是具体业务的实际执行者。
* **Proxy**：代理对象，负责引用目标对象，以及对访问的过滤和预处理。

结构如下：

<div style="text-align: center;">
  <img src="./assets/factory-pattern.jpg" alt="代理模式结构图" style="width: 640px;">
  <p style="text-align: center; color: #888;">（代理模式结构图）</p>
</div>

ES6 原生提供了 `Proxy` 构造函数，这个构造函数让我们可以很方便地创建代理对象：

```javascript
var proxy = new Proxy(target, handler);
```

参数中 `target` 是被代理对象，`handler` 用来设置代理行为。

使用 `Proxy` 来实现一下上面的经纪人例子，代码如下：

```javascript
/* 明星 */
const SuperStar = {
  name: '当红小鲜肉',
  scheduleFlag: false, // 档期标识位，false-没空（默认值），true-有空
  playAdvertisement(ad) {
    console.log(ad)
  }
}

/* 经纪人 */
const ProxyAssistant = {
  name: '经纪人刘姐',
  scheduleTime(ad) {
    const schedule = new Proxy(SuperStar, { // 在这里监听 scheduleFlag 值的变化
      set(obj, prop, val) {
        if (prop !== 'scheduleFlag') return
        if (obj.scheduleFlag === false && val === true) { // 小鲜肉现在有空了
          obj.scheduleFlag = true
          obj.playAdvertisement(ad) // 安排上了
        }
      }
    })

    setTimeout(() => {
      console.log('小鲜肉有空了')
      schedule.scheduleFlag = true // 明星有空了
    }, 2000)
  },
  playAdvertisement(reward, ad) {
    if (reward > 1000000) { // 如果报酬超过 100w
      console.log('没问题，我们小鲜肉最喜欢拍广告了！')
      ProxyAssistant.scheduleTime(ad)
    } else
      console.log('最近档期排满了，没空！')
  }
}

ProxyAssistant.playAdvertisement(10000, '纯蒸酸牛奶，味道纯纯，尽享纯蒸')
// 输出： 没空，滚

ProxyAssistant.playAdvertisement(1000001, '纯蒸酸牛奶，味道纯纯，尽享纯蒸')
// 输出： 没问题，我们小鲜肉最喜欢拍广告了！
// 2秒后
// 输出： 小鲜肉有空了
// 输出： 纯蒸酸牛奶，味道纯纯，尽享纯蒸
```

## 代理模式的实际应用

### 拦截器

前面的例子使用代理模式代理对象的访问的方式，一般又被称为拦截器。

拦截器的思想在实战中应用非常多，比如我们在项目中经常使用 Axios 的实例来进行 HTTP 的请求，使用拦截器 `interceptor` 可以提前对 `request` 请求和 `response` 返回进行一些预处理，比如：

* `request` 请求头的设置，和 Cookie 信息的设置。
* 权限信息的预处理，常见的比如验权操作或者 Token 验证。
* 数据格式的格式化，比如对组件绑定的 `Date` 类型的数据在请求前进行一些格式约定好的序列化操作。
* 空字段的格式预处理，根据后端进行一些过滤操作。
* `response` 的一些通用报错处理，比如使用 Message 控件抛出错误。

除了 HTTP 相关的拦截器之外，还有 vue-router、react-router 路由跳转的拦截器，可以进行一些路由跳转的预处理等操作。以 vue-router 的路由全局前置守卫为例：

```javascript
const router = new VueRouter({ ... })

router.beforeEach((to, from, next) => {
  // ...
  console.log(' beforeRouteEnter ! ')
  next()
})
```

拦截器看起来似乎和装饰器模式很像，但是要注意装饰器模式和代理模式的区别，代理模式控制访问者对目标对象的访问，而装饰器模式只给目标对象添加功能，原有功能不变且可直接使用。Axios 拦截器是可以取消请求的，vue-router 路由拦截器也可以进行路由截停和重定向等等复杂操作，这些场景下，无疑是代理模式，因为这里的拦截器控制了对目标对象的访问，如果没有进行访问控制而只进行消息预处理和后处理，那么则可以当作是装饰器模式。

### 前端框架的数据响应式化

现在的很多前端框架或者状态管理框架都使用 `Object.defineProperty` 和 `Proxy` 来实现数据的响应式化，比如 Vue、Mobx、AvalonJS 等，Vue 2.x 与 AvalonJS 使用前者，而 Vue 3.x 与 Mobx 5.x 使用后者。

Vue 2.x 中通过 `Object.defineProperty` 来劫持各个属性的 `setter/getter`，在数据变动时，通过发布-订阅模式发布消息给订阅者，触发相应的监听回调，从而实现数据的响应式化，也就是数据到视图的双向绑定。

为什么 Vue 2.x 到 3.x 要从 `Object.defineProperty` 改用 `Proxy` 呢，是因为前者的一些局限性，导致的以下缺陷：

* 无法监听利用索引直接设置数组的一个项，例如：`vm.items[indexOfItem] = newValue`。
* 无法监听数组的长度的修改，例如：`vm.items.length = newLength`。
* 无法监听 ES6 的 `Set`、`WeakSet`、`Map`、`WeakMap` 的变化。
* 无法监听 `Class` 类型的数据。
* 无法监听对象属性的新加或者删除。

除此之外还有性能上的差异，基于这些原因，Vue 3.x 改用 `Proxy` 来实现数据监听了。当然缺点就是对 IE 用户的不友好，兼容性敏感的场景需要做一些取舍。

### 缓存代理

在高阶函数的文章中，就介绍了**备忘模式**，备忘模式就是使用缓存代理的思想，将复杂计算的结果缓存起来，下次传参一致时直接返回之前缓存的计算结果。

### 保护代理和虚拟代理

有的书籍中着重强调代理的两种形式，**保护代理**和**虚拟代理**：

* **保护代理**：当一个对象可能会收到大量请求时，可以设置保护代理，通过一些条件判断对请求进行过滤。
* **虚拟代理**：在程序中可以能有一些代价昂贵的操作，此时可以设置虚拟代理，虚拟代理会在适合的时候才执行操作。

保护代理其实就是对访问的过滤，之前的经纪人例子就属于这种类型。

而虚拟代理是为一个开销很大的操作先占位，之后再执行，比如：

* 一个很大的图片加载前，一般使用菊花图、低质量图片等提前占位，优化图片加载导致白屏的情况。
* 现在很流行的页面加载前使用骨架屏来提前占位，很多 WebApp 和 NativeApp 都采用这种方式来优化用户白屏体验。

### 正向代理与反向代理

还有个经常用的例子是反向代理（Reverse Proxy），反向代理对应的是正向代理（Forward Proxy），他们的区别是：

* **正向代理**：一般的访问流程是客户端直接向目标服务器发送请求并获取内容，使用正向代理后，客户端改为向代理服务器发送请求，并指定目标服务器（原始服务器），然后由代理服务器和原始服务器通信，转交请求并获得的内容，再返回给客户端。正向代理隐藏了真实的客户端，为客户端收发请求，使真实客户端对服务器不可见。
* **反向代理**：与一般访问流程相比，使用反向代理后，直接收到请求的服务器是代理服务器，然后将请求转发给内部网络上真正进行处理的服务器，得到的结果返回给客户端。反向代理隐藏了真实的服务器，为服务器收发请求，使真实服务器对客户端不可见。

反向代理一般在处理跨域请求的时候比较常用，属于服务端开发人员的日常操作了，另外在缓存服务器、负载均衡服务器等等场景也是使用到代理模式的思想。

<div style="text-align: center;">
  <img src="./assets/forward-proxy-and-reverse-proxy.jpg" alt="正向代理与反向代理" style="width: 640px;">
  <p style="text-align: center; color: #888;">（正向代理与反向代理）</p>
</div>

## 设计原则验证

* 代理类和目标类分离，隔离开目标类和使用者
* 符合开放封闭原则

## 代理模式的优缺点

优点：

* 代理对象在访问者与目标对象之间可以起到**中介和保护目标对象**的作用。
* 代理对象可以**扩展目标对象的功能**。
* 代理模式能将访问者与目标对象分离，在一定程度上**降低了系统的耦合度**，如果我们希望适度扩展目标对象的一些功能，通过修改代理对象就可以了，符合开闭原则。

缺点：

* 增加了系统的复杂度，要斟酌当前场景是不是真的需要引入代理模式（**三十六线明星就别请经纪人了**）。

## 其他相关模式

很多其他的模式，比如状态模式、策略模式、访问者模式其实也是使用了代理模式，包括在之前高阶函数处介绍的备忘模式，本质上也是一种缓存代理。

### 代理模式与适配器模式

代理模式和适配器模式都为另一个对象提供间接性的访问，他们的区别：

* **适配器模式**：主要用来解决接口之间不匹配的问题，通常是为所适配的对象提供一个不同的接口。
* **代理模式**：提供访问目标对象的间接访问，以及对目标对象功能的扩展，一般提供和目标对象一样的接口。

### 代理模式与装饰器模式

装饰器模式实现上和代理模式类似，都是在访问目标对象之前或者之后执行一些逻辑，但是目的和功能不同：

* **装饰器模式**：目的是为了方便地给目标对象添加功能，也就是动态地添加功能。
* **代理模式**：主要目的是控制其他访问者对目标对象的访问。

（完）
