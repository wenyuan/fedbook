# Object.fromEntries()

方法 Object.fromEntries() 把键值对列表转换为一个对象，这个方法是和 Object.entries() 相对的。

```javascript
Object.fromEntries([
  ['foo', 1],
  ['bar', 2]
])
// {foo: 1, bar: 2}
```

## 案例 1：Object 转换操作

```javascript
const obj = {
  name: 'zhangsan',
  age: 13
}
const entries = Object.entries(obj)
console.log(entries)
// [Array(2), Array(2)]

// ES10
const fromEntries = Object.fromEntries(entries)
console.log(fromEntries)
// {name: 'zhangsan', age: 13}
```

## 案例 2：Map 转 Object

```javascript
const map = new Map()
map.set('name', 'zhangsan')
map.set('age', 13)
console.log(map)
// {'name' => 'zhangsan', 'age' => 13}

const obj = Object.fromEntries(map)
console.log(obj)
// {name: 'zhangsan', age: 13}
```

## 案例 3：过滤

course 表示所有课程，想请求课程分数大于 80 的课程组成的对象：

```javascript
const course = {
  math: 80,
  english: 85,
  chinese: 90
}
const res = Object.entries(course).filter(([key, val]) => val > 80)
console.log(res)
// [Array(2), Array(2)]
console.log(Object.fromEntries(res))
// {english: 85, chinese: 90}
```

## 参考资料

* [proposal-object-from-entries](https://github.com/tc39/proposal-object-from-entries)

（完）
