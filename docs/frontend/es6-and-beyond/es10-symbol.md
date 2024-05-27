# Symbol 扩展

## Symbol.prototype.description

我们知道，Symbol 的描述只被存储在内部的 `description`，没有直接对外暴露，只有调用 Symbol 的 `toString()` 时才可以读取这个属性：

```javascript
const name = Symbol('es')
console.log(name.toString()) // Symbol(es)
console.log(name)            // Symbol(es)
console.log(name === 'Symbol(es)')            // false
console.log(name.toString() === 'Symbol(es)') // true
```

现在可以通过 `description` 方法获取 Symbol 的描述：

```javascript
const name = Symbol('es')
console.log(name.description) // es
console.log(name.description === 'es') // true
```

（完）
