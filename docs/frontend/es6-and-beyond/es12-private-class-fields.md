# 类私有域

类属性和类方法在默认情况下是公有的，但可以通过增加 `#` 前缀的方法来定义私有类字段，这样标识后的私有字段只能在类内部调用，外部无法访问到。

## 私有属性

通常，对于属性，我们能以 `get` 修饰符来进行修饰，然后就可以直接通过属性名来访问了：

```javascript
class Student {
  get age() {
    return 18;
  }
}

student= new Student();
console.log(student.age); // 18
```

在属性名前面加上 `#`，让其变成私有变量，如下所示：

```javascript
class Student {
  get #age() {
    return 18;
  }
}

student= new Student();
console.log(student.age); // undefined
```

要想访问上述的私有属性，则可以用公有属性去调用私有属性方法：

```javascript
class Student {
  get #age() {
    return 18;
  }
   get publicAge() {
    return this.#age
  }
}

student= new Student();
console.log(student.publicAge); // 18
```

## 私有方法

通常类中定义的方法，在通过实例化之后就可以直接进行调用，如下所示：

```javascript
class Student {
  getAge() {
    console.log("永远18岁")
  }
}

student= new Student();
student.getAge(); // "永远18岁"
```

但是如果我们不希望 `getAge()` 方法直接暴露给外部使用，那么只需要在方法前面加上 `#` 就可以把它变成一个私有方法。

```javascript
class Student {
  #getAge() {
    console.log("永远18岁")
  }
}

student= new Student();
student.getAge(); // Uncaught TypeError: student.getAge is not a function
```

用以前的方式调用类的私有方法会报错。怎么处理呢？我们知道私有方法是可以在方法内部调用的，那么只需要创建一个公有方法，然后在这个公有方法中调用私有方法即可，如下所示：

```javascript
class Student {
  #getAge() {
    console.log("永远18岁")
  }
  
  getPublicAge(){
    this.#getAge();
  }
}

student= new Student();
student.getPublicAge(); // "永远18岁"
```

总的来说，类私有域这个新特性很好用。

## 参考资料

* [类私有域](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

（完）
