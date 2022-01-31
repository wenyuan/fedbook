# 尾逗号 Trailing commas

## ES8 以前

在 ES8 以前，函数定义和调用时，都不允许最后一个参数后面出现逗号。

```javascript
function foo(
  param1,
  param2
) {
  /* ... */
}

foo(
  'hello',
  'world'
)
```

上面代码中，如果在 `param2` 或 `'world'` 后面加一个逗号，就会报错。

## ES8 新规定

如果像上面这样，将参数写成多行（即每个参数占据一行），以后修改代码的时候，想为函数 foo 添加第三个参数，或者调整参数的次序，就势必要在原来最后一个参数后面添加一个逗号。这对于版本管理系统来说，就会显示添加逗号的那一行也发生了变动。这看上去有点冗余，因此新的语法允许定义和调用时，尾部直接有一个逗号。

```javascript
function foo(
  param1,
  param2,
) {
  /* ... */
}

foo(
  'hello',
  'world',
)
```

这样的规定也使得，函数参数与数组和对象的尾逗号规则，保持一致了。

## 参考资料

* [尾后逗号](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Trailing_commas)

（完）
