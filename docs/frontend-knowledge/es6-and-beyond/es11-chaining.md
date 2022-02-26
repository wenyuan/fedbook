# 可选链 Optional chaining

可让我们在查询具有多层级的对象时，不再需要进行冗余的各种前置校验。

```javascript
const user = {
  address: {
    street: 'xx街道',
    getNum() {
      return '80号'
    }
  }
}
```

在之前的语法中，想获取到深层属性或方法，不得不做的前置校验，否则很容易命中 `Uncaught TypeError: Cannot read property...` 这种错误，这极有可能让你整个应用挂掉。

```javascript
const street = user && user.address && user.address.street
const num = user && user.address && user.address.getNum && user.address.getNum()
console.log(street, num)
```

用了 Optional Chaining ，上面代码会变成：

```javascript
const street2 = user?.address?.street
const num2 = user?.address?.getNum?.()
console.log(street2, num2)
```

可选链中的 `?.` 表示如果问号左边表达式有值，就会继续查询问号后面的字段。如果为 `null` 或者 `undefined`，该表达式的短路返回值是 `undefined`。

根据上面可以看出，用可选链可以大量简化类似繁琐的前置校验操作，而且更安全。

## 参考资料

* [Optional chaining](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

（完）
