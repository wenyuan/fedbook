# 控制反转与依赖注入

> 先只介绍概念，更深入的东西以后有时间在研究。

## 控制反转概念

在传统的方式中，如果我们要用到一个类的对象，需要自己 `new` 一个出来，例如：

```java
public void testMaster() {
    // 自己 new 一个对象
    Master master = new Master();
    master.sayHello();
}
```

而在 Spring 中，我们看不到 `new Master()` 的操作，而是通过 Spring 的 ApplicationContext 获得，例如：

```java
ApplicationContext context = new ClassPathXmlApplicationContext("spring-config.xml");
// 不是自己 new 的对象，而是从 ApplicationContext 中获得
// 其中，getBean 方法的参数值是 "master"，对应的是 xml 中 bean 的 id  
Master master = (Master) context.getBean("master");
```

可见：

+ 在传统的方式中，`master` 对象的创建和销毁是由应用程序负责的，**其控制权属于应用程序**（上面的 `testMaster` 方法）。
+ 而在 Spring 中，`master` 对象的创建和销毁是由 Spring 负责的，**其控制权属于 Spring 而不属于控制者**。

这个过程就叫做控制反转（Inversion of Control，缩写为 IoC）。

## 依赖注入概念

下面的代码是使用 Spring 框架时很常见的：

```java
@Resource
private Master master;
```

这里我们没有手动使用 `getBean()`，而是通过注解的形式获得了这个 bean。对于应用程序来说，我所使用的这个对象不是我创建的，是 Spring 帮我创建的，并且我能从 Spring 中得到它。

这个过程就叫做依赖注入（Dependency Injection，简称 DI）。

## 区别

控制反转与依赖注入其实说的是一回事，即：Spring 容器帮我们去管理对象。

区别在于它们站的角度不同：

+ 控制反转指的是被创建的对象，它的控制权交给了 Spring。
+ 依赖注入指的是在应用程序的角度，我们用到的对象不是自己创建的，而是 Spring 给我们的。

这样会带来很多好处，比如数据库相关的场景，数据是怎么打开的、怎么关闭的、怎么放回到连接池的、怎么提交事务的，这些东西应用程序都不用管，Spring 都会帮我们去做。

## 为什么要控制反转

IoC 把对象生成放在了 XML 里定义，所以当我们需要换一个实现子类时将会变得很简单（一般这样的对象都是实现于某种接口的），只要修改 XML 就可以了。

举个例子：

猫和狗都是宠物，猫是喵喵叫，狗是汪汪叫。在 pojo 包下有三个类，Pet，Dog，Cat：

```java
package pojo;

public abstract class Pet {
    // 动物都会叫，可叫声不同，所以方法是抽象的
    public abstract void shout();
}
```

```java
package pojo;

public class Cat extends Pet {
    @override
    public void shout() {
        System.out.println("喵喵");
    }
}
```

```java
package pojo;

public class Dog extends Pet {
    @override
    public void shout() {
        System.out.println("汪汪");
    }
}
```

现在的应用程序代码中，是听猫叫：

```java
@Test
public void testPet() {
    Pet pet = new Cat();
    pet.shout();
}
```

如果需求更改，要听狗叫了，那么业务代码就要修改：

```java {3}
@Test
public void testPet() {
    Pet pet = new Dog();
    pet.shout();
}
```

这种情况下，Cat 类和 Dog 类就和业务是紧密耦合的。用 Spring 可以降低这种耦合，如果需求变更，只需要修改 xml 文件：

```xml
<bean id="pet" class="pojo.Cat"></bean>
```

修改为

```xml
<bean id="pet" class="pojo.Dog"></bean>
```

而业务代码不需要修改：

```java {4}
@Test
public void testPet() {
    ApplicationContext context = new ClassPathXmlApplicationContext("spring-config.xml");
    Pet pet = context.getBean(Pet.class);
    pet.shout();
}
```

## 优缺点

IoC 的缺点是：

+ 生成一个对象的步骤变复杂了，对于不习惯这种方式的人，会觉得有些别扭和不直观。
+ 对象生成因为是使用反射编程，在效率上有些损耗。但相对于 IoC 提高的维护性和灵活性来说，这点损耗是微不足道的，除非某个对象的生成对效率要求特别高。

（完）
