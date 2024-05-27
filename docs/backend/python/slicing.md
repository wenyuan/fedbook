# 切片

切片也是一个 Python 的高级特性，实际开发中经常会用到。

## 正向范围取值

### 关键点

* 首位下标是 `0`
* 前闭后开：第一个数字是起始下标，第二个数字是结束下标（但最终结果不包含它）

### 代码示例

下面以字符串为例，数组同理。

```python
# 正向范围取值 - 字符串
strs ="image.baidu.com"

print(strs[0:1])    # i
print(strs[0:10])   # image.baid
print(strs[5:10])   # .baid

# 如果字符串总长度比较小，会取到最后一个结束就结束了
print(strs[5:100])  # .baidu.com

# 相同数字返回空
print(strs[5:5])

# 第二个数字比第一个数字小，返回空
print(strs[5:4])

# 从第 0 个下班开始取值，取后面所有元素
print(strs[0:])     # image.baidu.com

# 取前面 10 个元素
print(strs[:10])    # image.baid
```

## 反向范围取值

### 关键点

* 因为是反向，所以倒数的下标从 `-1` 算起
* 前闭后开：第一个数字是起始下标，第二个数字是结束下标（但最终结果不包含它）
* 第一个数字是负数情况下，第二个数字最大是 `-1`，如果写成 `0` 会返回空值

### 代码示例

下面以字符串为例，数组同理。

```python
# 反向范围取值 - 字符串
strs = "image.baidu.com"

# 取最后 10 个元素
print(strs[-10:])    # .baidu.com

# 从倒数第 5 个元素取到倒数第 2 个元素
print(strs[-5:-1])   # u.co

# 从倒数第 10 个元素取到倒数第 6 个元素
print(strs[-10:-5])  # .baid

# 第二个值写 0，返回空值
print(strs[-10:0])

# 正数 + 负数组合，表示从正数索引开始取到倒数第 N 个元素的前一个元素（倒数的索引从 -1 开始计数）
print(strs[1:-5])    # mage.baid
```

## 复制对象

### 关键点

* 使用 `[:]` 可以复制对象
* 等同于浅拷贝，对可变对象是生效的

### 代码示例

字符串：

```python
str1 = "abcd"
str2 = str1
str1 = "abc"
print(str1, str2, id(str1), id(str2))
# 输出结果
abc abcd 140171144697840 140171143901616


str1 = "abcd"
str2 = str1[:]
str1 = "abc"
print(str1, str2, id(str1), id(str2))
# 输出结果
abc abcd 140506105735152 140506104938928
```

数组：

```python
arr1 = [1, 2, 3, 4, 5]
arr2 = arr1
arr1.append(6)
print(arr1, arr2, id(arr1), id(arr2))
# 输出结果
[1, 2, 3, 4, 5, 6] [1, 2, 3, 4, 5, 6] 139869821785536 139869821785536


arr1 = [1, 2, 3, 4, 5]
arr2 = arr1[:]
arr1.append(6)
print(arr1, arr2, id(arr1), id(arr2))
# 输出结果
[1, 2, 3, 4, 5, 6] [1, 2, 3, 4, 5] 139891489719744 139891489734016


arr1 = [1, 2, 3, 4, 5, [1, 2, 3]]
arr2 = arr1
arr1[5].append(4)
print(arr1, arr2, id(arr1), id(arr2))
# 输出结果
[1, 2, 3, 4, 5, [1, 2, 3, 4]] [1, 2, 3, 4, 5, [1, 2, 3, 4]] 140057171381696 140057171381696


arr1 = [1, 2, 3, 4, 5, [1, 2, 3]]
arr2 = arr1[:]
arr1[5].append(4)
print(arr1, arr2, id(arr1), id(arr2))
# 输出结果
[1, 2, 3, 4, 5, [1, 2, 3, 4]] [1, 2, 3, 4, 5, [1, 2, 3, 4]] 139836932160960 139836931269248
```

## 步进

### 代码示例

字符串：

```python
strs = "image.baidu.com"

# 取最后 10 个元素，每 2 个取 1 个
print(strs[-10::2])  # .ad.o

# 取第 0 到 10 的元素，每 5 个取 1 个
print(strs[0:10:5])  # i.

print(strs[::])      # image.baidu.com
# 倒序
print(strs[::-1])    # moc.udiab.egami
```

数组：

```python
arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 取全部元素，每 3 个 取 1 个
print(arr[::3])   # [1, 4, 7, 10]
# 倒序
print(arr[::-1])  # [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
```

（完）
