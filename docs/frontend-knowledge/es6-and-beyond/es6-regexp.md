# RegExp

## y 修饰符

ES6 为正则表达式添加了 y 修饰符，叫做「粘连」（sticky）修饰符。

y 修饰符的作用与 g 修饰符类似，也是全局匹配，后一次匹配都从上一次匹配成功的下一个位置开始。

不同之处在于，g 修饰符只要剩余位置中存在匹配就可，而 y 修饰符确保匹配必须从剩余的第一个位置开始，这也就是「粘连」的涵义。

```javascript
const str = 'aaa_aa_a'
const regex1 = /a+/g
const regex2 = /a+/y

regex1.exec(str) // [ 'aaa', index: 0, input: 'aaa_aa_a', groups: undefined ]
regex2.exec(str) // [ 'aaa', index: 0, input: 'aaa_aa_a', groups: undefined ]

regex1.exec(str) // [ 'aa', index: 4, input: 'aaa_aa_a', groups: undefined ]
regex2.exec(str) // null
```

