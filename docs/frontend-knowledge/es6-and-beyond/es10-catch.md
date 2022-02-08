# 可选的 Catch Binding

## 可以省略 catch 子句的错误变量

在 ES10 之前我们都是这样捕获异常的（即使不使用错误变量，也必须始终声明它）：

```javascript
try {
  // tryCode
} catch (err) {
  // catchCode
}
```

在这里 err 是必须的参数，在 ES10 可以省略这个参数：

```javascript
try {
  console.log('Foobar')
} catch {
  console.error('Bar')
}
```

通常，我们不希望忽略应用程序中的错误。至少希望将它们打印到控制台。然而，在一些罕见的情况下，可能根本不需要 catch 变量绑定，比如下面两个案例。

## 案例 1：验证参数是否为 json 格式

这个需求我们只需要返回 `true` 或 `false`，并不关心 `catch` 的参数。

```javascript
const validJSON = json => {
  try {
    JSON.parse(json)
    return true
  } catch {
    return false
  }
}

const json = '{"name":"zhangsan", "age": 13}'
console.log(validJSON(json))
```

## 案例 2：日志代码中的防错逻辑

假设我们试图将一个错误记录到控制台，然后由于某种原因，日志代码本身会导致另一个错误。我们不希望日志代码抛出错误，所以在这种情况下，没有绑定的 catch 子句可能是有意义的。

```javascript
function log(error) {
  try {
    console.log(error)
  } catch {
    // There's not much more we can do.
  }
}
```

（完）
