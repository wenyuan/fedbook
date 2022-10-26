# Django 与 Channels 的集成

> 本项目的环境为：
>
> * CentOS 7
> * Python 3.8
> * Django 4
> * Channels 3.x
> * Redis 7
>
> 虽然是 Django 4，但没有使用什么新的特性和语法，所以同样适用于 Django 3 和 2。对于 Django 1，只有少部分路由语法不一样。

## 背景

WebSocket 是一种在单个 TCP 连接上进行全双工通讯的协议。它允许服务端主动向客户端推送数据。客户端浏览器和服务器只需要完成一次握手就可以创建持久性的连接，并在浏览器和服务器之间进行双向的数据传输。

使用场景：

* 在 Django 中遇到一些耗时较长的任务我们通常会使用 Celery 来异步执行，那么浏览器如果想要获取这个任务的执行状态，在 HTTP 协议中只能通过轮询的方式由浏览器不断的发送请求给服务器来获取最新状态，这样发送很多无用的请求不仅浪费资源，还不够优雅，这时候可以考虑使用 WebSocket 来实现。
* 对于告警或通知的需求，虽然使用 HTTP 轮询也能实现，但借助 WebSocket 能创建持久性的连接并可以让服务端主动发起消息的特性，实现起来会更优雅。
* 还有诸如本案例的聊天室场景，一个用户（浏览器）发送的消息需要实时的让其他用户（浏览器）接收，这在 HTTP 协议下是很难实现的。

Django 本身不支持 WebSocket，但可以通过集成 Channels 框架来实现 WebSocket。

Channels 是针对 Django 项目的一个增强框架，可以使 Django 不仅支持 HTTP 协议，还能支持 WebSocket，MQTT 等多种协议，同时 Channels 还将 Django 自带的认证系统以及 session 集成到了模块中，扩展性非常强。

## 初始化项目

> 接下来的案例出自[官方文档](https://channels.readthedocs.io/en/stable/tutorial/index.html)的案例，增加了一些更详细的代码解读和注释。

初始化一个 Django 工程（名为 `django_channels_demo`）和新建应用（名为 `chat`）的步骤就省略了。

需要注意的是这个案例在 `python manage.py startapp chat` 新建一个应用后，只用到了 `chat/views.py` 和 `chat/__init__.py`，所以将 `chat/` 目录下的其他文件给删掉了。

```
chat/
├── __init__.py
└── views.py
```

在运行代码时，可以忽略关于未做数据库迁移的警告，因为没有使用到数据库。

## 集成 Channels

首先安装 `channels`：

```bash
pip install channels
```

修改 `django_channels_demo/asgi.py`：

```python
import os

from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_channels_demo.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        # Just HTTP for now. (We can add other protocols later.)
    }
)
```

修改 `settings.py` 文件：

```python
# APPS 中添加 channels 和 daphne
INSTALLED_APPS = [
    'daphne',  # must be the first one
    ...
    # 3rd apps
    'channels',
    # my apps
    'chat'
]

# 指定 ASGI 的路由地址
ASGI_APPLICATION = 'django_channels_demo.asgi.application'
```

Channels 需要运行于 ASGI 协议上，它是区别于 Django 使用的 WSGI 协议的一种异步服务网关接口协议，当 Django 集成 Channels 时候，我们需要 ASGI 服务器来处理 WebSocket 请求，官方推荐使用 daphne。

daphne 配置入口就是前面的 `asgi.py`，使用 daphne 后，能同时兼容以前的 HTTP 协议并扩展支持其他协议，这个后面再讲。

`ASGI_APPLICATION` 指定主路由的位置（`application` 的位置）。官方文档是把 `application` 写在 `settings.py` 同级的 `asgi.py` 里面的，看到很多人写的文章会在 `settings.py` 同级新建一个 `routing.py`，然后将 `application` 写在里面。

::: warning
Daphne 库必须位于 `INSTALLED_APPS` 的顶部，这样可以确保 Daphne 模式的 runserver 命令正常运行。因为有可能你使用的其他第三方应用也要修改 runserver 命令，从而会产生冲突。
:::

现在运行 `python manage.py runserver`，就可以发现这个 Django 工程是以 `Starting ASGI/Daphne …` 的模式在运行了，这表明项目已经由 Django 使用的 WSGI 协议转换为了 Channels 使用的 ASGI 协议。

## 增加聊天室的视图

根 `urls.py`，`chat/urls.py`、`chat/views.py` 以及 `chat/templates/` 这几份文件的内容直接看官方文档或者 [GitHub 仓库](https://github.com/wenyuan/django_channels_demo)即可，这些都是 Django 基础，就不赘述了。

``` {4-6,9}
django_channels_demo/
├── chat
│   │── __init__.py
│   │── templates/
│   │── urls.py
│   │── views.py
│   └── ...（其它省略）
├── django_channels_demo
│   │── urls.py
│   └── ...（其它省略）
└── ...
```

重点关注下 `chat/templates/room.html` 里的 WebSocket 部分（属于前端开发的知识）：

```javascript
const chatSocket = new WebSocket(
  'ws://'
  + window.location.host
  + '/ws/chat/'
  + roomName
  + '/'
);

chatSocket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  document.querySelector('#chat-log').value += (data.message + '\n');
};

chatSocket.onclose = function (e) {
  console.error('Chat socket closed unexpectedly');
};
```

WebSocket 对象一个支持四个消息：`onopen`，`onmessage`，`onclose` 和 `onerror`，我们这里用了两个 `onmessage` 和 `onclose`。

* `onopen`：当浏览器和 WebSocket 服务端连接成功后会触发 `onopen` 消息。
* `onerror`：如果连接失败，或者发送、接收数据失败，或者数据处理出错都会触发 `onerror` 消息。
* `onmessage`：当浏览器接收到 WebSocket 服务器发送过来的数据时，就会触发 `onmessage` 消息，参数 `e` 包含了服务端发送过来的数据。
* `onclose`：当浏览器接收到 WebSocket 服务器发送过来的关闭连接请求时，会触发 `onclose` 消息。

所以，在浏览器中输入消息就会通过 websocket --> rouging.py --> consumer.py 处理后返回给前端。

## 编写消费者

Consumer 类似 Django 中的 View 或者 API，用于编写业务代码。在这个案例中它位于 `chat/consumers.py`：

代码内容如下：

```python
import json

from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        self.send(text_data=json.dumps({"message": message}))
```

`connect` 方法在连接建立时触发，`disconnect` 在连接关闭时触发，`receive` 方法会在收到消息后触发。

## 编写路由

既然有消费者了（类似处理 http 请求的 views.py），那么就要有一个处理 WebSocket 请求的路由（类似处理 http 请求的 urls.py）。

这里需要新建一个文件 `chat/routing.py`。它跟 Django 的 url.py 功能类似，语法也一样，下面代码的意思就是访问 `ws/chat/` 都交给 ChatConsumer 处理。

```python
from django.urls import re_path
from chat.consumers import ChatConsumer

websocket_urlpatterns = [
    # 跟 Django 的 url.py 功能类似，语法也一样
    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
]
```

调用 `as_asgi()` 类方法是为了获得一个 ASGI 应用程序，该应用程序将为每个用户连接提供 ChatConsumer 的实例。这类似于 Django 的 `as_view()`，它起的作用跟每个对 Django 视图的请求一样。

## 完善 asgi.py

现在完善 `asgi.py` 文件：

```python
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import chat.routing

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
```

这样一来，Daphne 服务就接管了 Django 原先的服务，能同时支持 `http` 和 `websocket` 请求：

* 当 Django 接收到 HTTP 请求时，它会查询根路由配置（`urls.py`）来查找视图函数，然后调用视图函数来处理请求。
* 当 Channels 接收到 WebSocket 连接时，它会查询根路由配置（`routing.py`）来查找使用者，然后调用使用者上的各种函数来处理来自连接的事件。

一些类的说明：

* `ProtocolTypeRouter`：ASGI 支持多种不同的协议，在这里可以指定特定协议的路由信息，如果只使用了 WebSocket 协议，这里只配置 `websocket` 即可。
* `AuthMiddlewareStack`：Django 的 Channels 封装了 Django 的 auth 模块，使用这个配置我们就可以在 consumer 中通过类似下面的代码获取到用户的信息。
  ```python
  def connect(self):
      # self.scope 类似于 Django 中的 request，包含了请求的 type、path、header、cookie、session、user 等等有用的信息
      self.user = self.scope["user"]
  ```
* `URLRouter`：指定路由文件的路径，也可以直接将路由信息写在这里，代码中配置了路由文件的路径，会去 `chat` 下的 `routeing.py` 文件中查找 `websocket_urlpatterns`。

## 启用 Channel Layer

截止上面的代码，我们已经实现了 WebSocket 消息的发送和接收。

但目前有一个问题，这个聊天室只是一个单机聊天室，也就是先打开第一个聊天窗口进入一个房间，然后打开第二个浏览器选项卡到同一个房间页面并键入一条消息，该消息将不会出现在第一个选项卡中。

如何解决这个问题，让所有客户端都能一起聊天呢？

Channels 引入了一个 Layer 的概念，它是一个中间通道层，它允许多个 consumer 实例之间互相通信，以及与外部 Django 程序实现互通。

Layer 的大致原理是（以本案例的聊天室消费者为例）：

* 让每个 ChatConsumer 将其 Channel 添加到一个组（Group），这里我们把组就命名为房间名称。
* 使用 Redis 作为后台存储，当用户发布消息时，JavaScript 函数将通过 WebSocket 将消息传输到 ChatConsumer。ChatConsumer 接收到该消息并将其转发到对应的组（Group）。同一组中（即同一个房间中）的每个 ChatConsumer 将接收来自该组的消息，并通过 WebSocket 将其转发回 JavaScript，然后将其添加到聊天日志中。

因此 Layer 有两个关键的概念：

* channel name：Channel 实际上就是一个发送消息的通道，每个 Channel 都有一个名称，每一个拥有这个名称的人都可以往 Channel 里面发送消息。
* group：多个 channel 可以组成一个 Group，每个 Group 都有一个名称，每一个拥有这个名称的人都可以往 Group 里面添加/删除 Channel，也可以往 Group 里发送消息，Group 内的所有 Channel 都可以收到，但是无法发送给 Group 内的具体某个 Channel。

官方推荐使用 Redis 作为 Channel Layer：

```bash
pip install channels_redis
```

然后修改 `settings.py` 添加对 layer 的支持：

```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            # https://github.com/django/channels/issues/164
            "hosts": ["redis://:mypassword@127.0.0.1:6379/0"],
        },
    },
}
```

添加 channel 之后我们可以通过以下命令检查通道层是否能够正常工作：

```bash
$ python manage.py shell
>>> import channels.layers
>>> channel_layer = channels.layers.get_channel_layer()
>>> from asgiref.sync import async_to_sync
>>> async_to_sync(channel_layer.send)('test_channel', {'type': 'hello'})
>>> async_to_sync(channel_layer.receive)('test_channel')
{'type': 'hello'}
```

最后 consumer 做如下修改引入 channel layer：

```python
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name

        # join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # receive message from websocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    # receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # send message to websocket
        self.send(text_data=json.dumps({"message": message}))
```

这里我们通过参数的方式将房间名传进来作为 Group name，如果用户打开不同的房间就建立了多个Group，所有的消息都会发送到对应的 Group 里边，这样可以实现仅相同房间内的消息互通。

当我们启用了 Channel Layer 之后，所有与 consumer 之间的通信将会变成异步的，所以必须使用 `async_to_sync`。

* 一个链接（channel）创建时，通过 `group_add` 将 channel 添加到 Group 中。
* 链接关闭通过 `group_discard` 将 channel 从 Group 中剔除。
* 收到消息时可以调用 `group_send` 方法将消息发送到 Group，这个 Group 内所有的 channel 都可以收的到。
  * `group_send` 中的 `type` 指定了消息处理的函数，这里会将消息转给 `chat_message` 函数去处理。

经过以上的修改，我们再次打开多个聊天页面并各自输入消息，发现彼此已经能够看到了，至此一个完整的聊天室已经基本完成。

## 修改为异步

前面编写的 consumer 消费者代码都是同步的，同步代码写起来很方便，不需要做特殊的考虑。但是异步代码可以提高性能，因为它们在处理请求时不需要创建额外的线程。

如果我们的 consumer 中没有访问 Django 模型或其他同步代码，仅仅只是 channel 和 layer 的逻辑，那么改成异步来实现都会大大提高性能。

现在将 ChatConsumer 重写为异步的：

```python
import json

from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name

        # join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # receive message from websocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": message}
        )

    # receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # send message to websocket
        await self.send(text_data=json.dumps({"message": message}))
```

其实异步的代码跟之前的差别不大，只有几个小区别：

* `ChatConsumer` 继承的类由 `WebsocketConsumer` 修改为了 `AsyncWebsocketConsumer`。
* 所有的方法都修改为了异步 def（`async def`）。
* 用 `await` 来实现异步I/O的调用。
* channel layer 也不再需要使用 `async_to_sync` 了。

好了，现在一个完全异步且功能完整的聊天室已经构建完成了。

## 完整代码

完整代码我放到 GitHub 了，详见 [django_channels_demo](https://github.com/wenyuan/django_channels_demo)。

## 参考资料

* [Django Channels](https://channels.readthedocs.io/en/stable/index.html)

（完）
