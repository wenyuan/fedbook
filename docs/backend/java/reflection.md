# 反射

## 概念理解

+ [官方解释](https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/index.html)

Java 的**反射机制**是指在运行状态中，对于任意一个类都能够知道这个类所有的属性和方法；并且对于任意一个对象，都能够调用它的任意一个方法；这种动态获取信息以及动态调用对象方法的功能成为 Java 语言的反射机制。

代码 + 白话解释：

我们在编写代码时，当需要使用到某一个类的时候，都会先了解这个类是做什么的。然后实例化这个类，接着用实例化好的对象进行操作，就像这样：

```java
Student student = new Student();
student.study("语文");
```

反射就是，一开始并不知道我们要初始化的类对象是什么，自然也无法使用 `new` 关键字来创建对象了。

```java
Class clazz = Class.forName("reflection.Student");
Method method = clazz.getMethod("study", String.class);
Constructor constructor = clazz.getConstructor();
Object object = constructor.newInstance();
method.invoke(object, "语文");
```

以上两段代码，执行效果是一样的，差别主要是在实现过程上：

+ 第一段代码在未运行前就已经知道了要运行的类是 `Student`。
+ 第二段代码则是到整个程序运行的时候，从字符串 `reflection.Student`，才知道要操作的类是 `Student`。

所以，**反射就是在运行时才知道要操作的类是什么，并且可以在运行时获取类的完整构造，并调用对应的方法**。

## Class 类对象

### 是啥

在 Java 中，Class 类对象是一个特别的对象，它表示 Java 运行时中某个类的类型信息，这里的类型信息指的是关于该类的所有数据：类名、类的修饰符、父类、实现的接口、构造函数、方法、字段等等等等。

每当我们定义一个类时，Java 虚拟机（JVM）会自动为这个类生成一个 Class 类对象，用于表示该类的元数据。每个类在内存中只有一个 Class 类对象。

### 过程

类对象的创建过程如下：

1. **编译时**：在编译阶段，Java 编译器（如 javac）会将源代码（.java 文件）编译成字节码（.class 文件）。这些字节码文件包含了类的结构和方法的详细信息，但此时还没有创建 Class 类对象。
2. **类加载时**：在运行时，当 JVM 首次使用某个类时，会加载该类的字节码并创建对应的 Class 类对象。这一步骤称为类加载（Class Loading）。
3. **Class 类对象创建**：在类加载过程中，JVM 会为每个加载的类生成一个 Class 类对象，用于表示该类的类型信息。此 Class 类对象会包含类的元数据（如类名、字段、方法等）。

例如，当我们在运行代码时首次引用某个类：

```java
public class Main {
    public static void main(String[] args) {
        MyClass myClass = new MyClass(); // 类加载，Class 类对象创建
    }
}
```

当代码执行到 `MyClass myClass = new MyClass();` 时，JVM 会加载 MyClass 类，并创建相应的 Class 类对象。

### 用途

+ **反射**：通过 Class 类对象，我们可以使用 Java 反射机制获取类的构造函数、方法、字段等信息，并可以动态地创建实例或调用方法。
+ **类型检查**：在运行时可以使用 Class 类对象进行类型检查。
+ **框架**：许多 Java 框架和库（如 Spring、Hibernate）依赖于 Class 类对象来实现动态代理、依赖注入等功能。

## 基本使用

### 获取 Class 类对象

获取 Class 对象有三种方法。

+ 第一种，`使用 Class.forName` 静态方法。

```java
Class class1 = Class.forName("reflection.TestReflection");
```

+ 第二种，使用类的 `.class` 方法。

```java
Class class2 = TestReflection.class;
```

+ 第三种，使用实例对象的 `getClass()` 方法。

```java
TestReflection testReflection = new TestReflection();
Class class3 = testReflection.getClass();
```

### 反射的基本 API

+ 实例化对象

```java
// 方式一
Class class1 = Class.forName("reflection.Student");
Student student = (Student) class1.newInstance();
System.out.println(student);

// 方式二
Constructor constructor = class1.getConstructor();
Student student1 = (Student) constructor.newInstance();
System.out.println(student1);
```

+ 获取类的构造函数（可能有多个）

```java
Class class1 = Class.forName("reflection.Student");
Constructor[] constructors = class1.getDeclaredConstructors();
for (int i = 0; i < constructors.length; i++) {
    System.out.println(constructors[i]);
}
```

+ 获取类的成员变量
  + `getField(String name)` 方法只能访问公有字段，否则会抛出 `NoSuchFieldException` 异常。
  + `getDeclaredField(String name)` 方法可以获取私有字段，但仍然需要设置其可访问性。

```java
public class Student {

    // 私有属性 age
    private Integer age;

    // 公有属性 email
    public String email;
}

public class TestReflection {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchFieldException {
        // 动态加载 Student 类
        Class class1 = Class.forName("reflection.Student");
        
        // 获取公有字段 email
        Field email = class1.getField("email");
        System.out.println(email);
        
        // 获取私有字段 age，并设置其可访问性
        Field age = class1.getDeclaredField("age");
        age.setAccessible(true);
        System.out.println(age);
    }
}
```

+ 获取类的方法

```java
public class Student {

    private void testPrivateMethod() {}

    public void testPublicMethod() {}
}

public class TestReflection {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchFieldException {
        Class class1 = Class.forName("reflection.Student");

        Method[] methods = class1.getMethods();
        for (int i = 0; i < methods.length; i++) {
            System.out.println(methods[i]);
        }
    }
}
```

## 反射的应用

+ 很多框架都使用了反射技术，如 Spring，Mybatis，Hibernate 等。
  + Spring 通过 XML 配置模式装载 Bean，就是反射的一个典型例子：
  + 加载 XML 配置文件 -> 解析 XML 里内容，得到相关字节码信息 -> 使用反射机制，得到 Class 实例 -> 动态配置实例的属性并使用
  + 好处：不用每次都去 `new` 实例了，并且可以修改配置文件，比较灵活。
+ JDBC 的数据库的连接
  + 在 JDBC 连接数据库中，一般包括**加载驱动，获得数据库连接**等步骤。而加载驱动，就是引入相关 Jar 包后，通过 `Class.forName()` 即反射技术，加载数据库的驱动程序。

## 反射的问题

+ 使用反射有性能开销，尤其在类加载的过程中会比较慢（[java-reflection-why-is-it-so-slow](https://stackoverflow.com/questions/1392351/java-reflection-why-is-it-so-slow)）
+ 安全问题：反射可以获取类中的方法和构造器，修改访问权限，某种程度上来说这不一定是安全的（比如单例模式中，会将构造器设计为私有，以此防止从外部构造对象）

（完）
