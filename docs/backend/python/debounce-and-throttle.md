# 封装防抖和节流函数

## 封装函数控制类

```python
import time
import threading
from typing import Callable, Optional


class FunctionControl:
    def __init__(self):
        self._timers = {}     # 存储防抖函数的计时器
        self._last_call = {}  # 存储节流函数的最后调用时间

        self._timer = None           # 用于没有指定 key 的防抖操作
        self._last_call_time = None  # 用于没有指定 key 的节流操作

    def debounce(self, fn: Callable[[], None], wait: float, key: Optional[str] = None) -> None:
        """
        防抖函数：在某段时间内，不管目标函数调用了多少次，都只执行最后一次
        :param fn: 一个无参数的可调用对象，且无返回值
        :param wait: 防抖的时间间隔（秒）
        :param key: 用于区分不同的防抖实例，每个不同的 key 会有独立的防抖计时器
        :return:
        """
        def call_it() -> None:
            fn()

        if key:
            if key in self._timers:
                self._timers[key].cancel()
            self._timers[key] = threading.Timer(wait, call_it)
            self._timers[key].start()
        else:
            if self._timer is not None:
                self._timer.cancel()
            self._timer = threading.Timer(wait, call_it)
            self._timer.start()

    def throttle(self, fn: Callable[[], None], wait: float, key: Optional[str] = None) -> None:
        """
        节流函数：在某段时间内，不管目标函数调用了多少次，都只执行第一次
        :param fn: 一个无参数的可调用对象，且无返回值
        :param wait: 节流的时间间隔（秒）
        :param key: 用于区分不同的防抖实例，每个不同的 key 会有独立的节流计时器
        :return:
        """
        current_time = time.time()

        if key:
            if key not in self._last_call or (current_time - self._last_call[key]) >= wait:
                self._last_call[key] = current_time
                fn()
        else:
            if self._last_call_time is None or (current_time - self._last_call_time) >= wait:
                self._last_call_time = current_time
                fn()
```

参数说明：

在 `debounce` 函数中，三个参数分别是：

+ `fn: Callable[[], None]`：
  + 这是一个可调用对象（通常是一个函数），它不接受任何参数并且没有返回值。这个函数是你希望进行防抖处理的目标函数。
+ `wait: float`：
  + 这是一个浮点数，表示防抖的等待时间（以秒为单位）。在这个等待时间内，如果多次调用 `debounce` 函数，目标函数只会在等待时间结束后执行一次。
+ `key: Optional[str] = None`：
  + 这是一个可选的字符串参数，用于标识特定的防抖操作。如果提供了 `key`，那么每个不同的 `key` 都会有独立的计时器。这样可以对不同的操作进行独立的防抖处理。如果没有提供 `key`，则使用一个全局的计时器。

在 `throttle` 函数中，三个参数分别是：

+ `fn: Callable[[], None]`：
  + 这是一个可调用对象（通常是一个函数），它不接受任何参数并且没有返回值。这个函数是你希望进行节流处理的目标函数。
+ `wait: float`：
  + 这是一个浮点数，表示节流的时间间隔（以秒为单位）。在这个时间间隔内，目标函数最多只会被调用一次。即使在时间间隔内多次调用 `throttle` 函数，目标函数也只会执行一次。
+ `key: Optional[str] = None`：
  + 这是一个可选的字符串参数，用于标识特定的节流操作。如果提供了 `key`，那么每个不同的 `key` 都会有独立的节流计时器和调用记录。这样可以对不同的操作进行独立的节流处理。如果没有提供 `key`，则使用一个全局的计时器和调用记录。

## 使用示例

```python
# 需要进行防抖/节流处理的函数
def update_instance(instance_id: int, desc: str) -> None:
    # 更新实例的逻辑
    print(f"Updating instance {instance_id}，desc: {desc}\n")


# 调用示例
# 调用方式：debounce(lambda: foo(*args, **kwargs), wait=1.0, key='xxx')
# 需要将目标函数及其参数封装成一个【无参数的可调用对象】，这样可以在防抖函数内部调用它，也可以直接传递一个无参数的函数对象
# 创建类实例
fc = FunctionControl()

# 调用示例
fc.debounce(lambda: update_instance(1, '防抖模式第1次更新'), 1.0, 'instance_1')  # 对实例1进行防抖处理
fc.debounce(lambda: update_instance(2, '防抖模式第1次更新'), 1.0, 'instance_2')  # 对实例2进行防抖处理
fc.debounce(lambda: update_instance(1, '防抖模式第2次更新'), 1.0, 'instance_1')  # 对实例1进行防抖处理
fc.debounce(lambda: update_instance(1, '防抖模式第3次更新'), 1.0)  # 没有指定键的防抖处理
fc.debounce(lambda: update_instance(1, '防抖模式第4次更新'), 1.0)  # 没有指定键的防抖处理
fc.debounce(lambda: update_instance(1, '防抖模式第5次更新'), 1.0)  # 没有指定键的防抖处理

fc.throttle(lambda: update_instance(1, '节流模式第1次更新'), 1.0, 'instance_1')  # 对实例1进行节流处理
fc.throttle(lambda: update_instance(2, '节流模式第1次更新'), 1.0, 'instance_2')  # 对实例2进行节流处理
fc.throttle(lambda: update_instance(1, '节流模式第2次更新'), 1.0, 'instance_1')  # 对实例1进行节流处理
fc.throttle(lambda: update_instance(1, '节流模式第3次更新'), 1.0)  # 没有指定键的节流处理
fc.throttle(lambda: update_instance(1, '节流模式第4次更新'), 1.0)  # 没有指定键的节流处理
fc.throttle(lambda: update_instance(1, '节流模式第5次更新'), 1.0)  # 没有指定键的节流处理
```

（完）
