# 平时用到的编程小技巧

> 记录平时用到的编程小技巧。

## 按指定字符串顺序排序

> 对于：["cat", "pig", "dog", "dog", "pig"]
> 按照："dog" < "cat" < "pig" 的顺序从小到大排序

```python
# 定义排序顺序
order = ['dog', 'cat', 'pig']
# 定义要排序的列表
animals = ['cat', 'pig', 'dog', 'dog', 'pig']
# 根据自定义的顺序排序列表
sorted_animals = sorted(animals, key=order.index)

# 输出排序后的列表
print(sorted_animals)
>>> ['dog', 'dog', 'cat', 'pig', 'pig']
```

> 对于：[{"name": "cat"}, {"name": "cat"}, {"name": "pig"}, {"name": "dog"}, {"name": "cat"}]
> 按照：name 的顺序从小到大排序，且顺序为 "dog" < "cat" < "pig"

```python
# 定义排序顺序
order = ['dog', 'cat', 'pig']
# 定义要排序的列表
animals = [{'name': 'cat'}, {'name': 'cat'}, {'name': 'pig'}, {'name': 'dog'}, {'name': 'cat'}]
# 根据自定义的顺序排序列表
sorted_animals = sorted(animals, key=lambda x: order.index(x['name']))

# 输出排序后的列表
print(sorted_animals)
>>> [{'name': 'dog'}, {'name': 'cat'}, {'name': 'cat'}, {'name': 'cat'}, {'name': 'pig'}]
```

> 对于：[{"name": "cat"}, {"name": "cat"}, {"name": "pig"}, {"name": "dog"}, {"name": "cat"}]
> 输出：其中 name 最大的值，name 从大到小的顺序为 "dog" < "cat" < "pig"

```python
# 定义排序顺序
order = ['dog', 'cat', 'pig']
# 定义要排序的列表
animals = [{'name': 'cat'}, {'name': 'cat'}, {'name': 'pig'}, {'name': 'dog'}, {'name': 'cat'}]
# 找到 name 的最大值
max_name = max(animals, key=lambda x: order.index(x['name']))

# 输出最大的 name 值
print(max_name)
>>> {'name': 'pig'}
```

## 拼接两个字典

> 如果两个字典中有相同的键，那么拼接后的字典中该键的值将是第二个字典中该键的值。

```python
# 方法一：使用 update() 方法
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}
dict1.update(dict2)
print(dict1)  # 输出：{'a': 1, 'b': 3, 'c': 4}

# 方法二：使用 ** 运算符
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}
merged_dict = {**dict1, **dict2}
print(merged_dict)  # 输出：{'a': 1, 'b': 3, 'c': 4}
```

## 分块取元素（性能优化）

> 本质是使用内置的 range() 函数和列表切片来实现这个功能
> get_chunks  函数会生成一个迭代器，每次迭代返回列表中的一个块，每个块包含 chunk_size 个元素（最后一个块可能包含少于 chunk_size 个元素，如果列表的长度不能被 chunk_size 整除）。然后，可以在循环中使用这个迭代器，每次处理一个块。
> 这种方法的好处是，它只需要固定的内存，无论列表有多大，都可以有效地处理。

```python
def get_chunks(lst: list, chunk_size: int):
    """
    每次取chunk_size个元素，不足就全部取完
    :param lst:        列表
    :param chunk_size: 每次取的个数
    :return:
    """
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]


# 测试列表
my_list = [...]
for chunk in get_chunks(my_list, 100):
    print(chunk)
```

（完）
