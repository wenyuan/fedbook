# 字符串

## char

`char` 是基本数据类型，用于表示单个字符。

### 特点

+ 它的值不能直接改变。不过，可以通过赋新值的方式来改变变量所存储的字符。

### 用法

```java
char letter = 'A';
System.out.println(letter); // 输出：A

letter = 'B';
System.out.println(letter); // 输出：B

```

### 使用场景

例如在循环中处理字符或操作数组中的单个字符。

## String 类

`String` 是一个类，用于表示字符串。

### 特点

+ 它是不可变的，即一旦创建了一个字符串对象，它的内容不能改变。

### 用法

```java
// 直接赋值
// 创建的对象存在字符串常量池，相同的值指向同一个字符串对象
String str1 = "Hello, World!";

// 使用 new 关键字
// 创建的对象存在堆内存，每 new 一次创建一个新的字符串对象
String str2 = new String("Hello, World!");

// 从字符数组创建字符串
char[] charArray = {'H', 'e', 'l', 'l', 'o'};
String str3 = new String(charArray);

// 从字节数组创建字符串（指定字符集例如 UTF-8）
byte[] byteArray = {72, 101, 108, 108, 111}; // 对应于 "Hello"
String str4 = new String(byteArray, StandardCharsets.UTF_8);
```

### 使用场景

+ 用于存储和处理文本信息，例如用户输入、文件内容等。

## StringBuffer 类

### 特点

+ 内容可变性：原理是它在底层使用了一个可扩展的字符数组来存储字符串数据。
+ 自带扩容机制：可以初始化容量，也可以指定容量，当字符串长度超过了指定的容量后，会创建一个新的更大的字符数组，并将旧数组中的内容复制到新数组中。
+ 具有线程安全性：因为它的所有方法都是同步的，多个线程可以安全地访问和修改同一个 StringBuffer 对象。

### 用法

```java
// 创建 StringBuffer对 象
StringBuffer sb = new StringBuffer("Hello");

// 在字符串后面追加新的字符串
sb.append(", World");
System.out.println(sb); 

// 删除指定位置上的字符串，可以指定下标开始和结束
sb.delete(2, 4);

// 在指定下标位置上添加指定的字符串
sb.insert(2, "123");
System.out.println(sb);

// 将字符串翻转
sb.reverse();
System.out.println(sb);

// 将StringBuffer 转换成 String 类型
String s = sb.toString();
System.out.println(s);
```

## StringBuilder 类

和 StringBuffer 的基本用法几乎是完全一样的。

### 特点

+ 是线程不安全的，但执行效率比 StringBuffer 快的多。
+ 适用于单线程环境下，在字符缓冲区进行大量操作的情况。

### 用法

与 StringBuffer 一样，此处略过。

## 总结

+ `String`：适用于少量字符串操作的情况。
+ `StringBuilder`：适用于单线程环境下，在字符缓冲区进行大量操作的情况。
+ `StringBuffer`：适用多线程环境下，在字符缓冲区进行大量操作的情况。

（完）
