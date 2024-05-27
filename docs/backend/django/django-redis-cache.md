# Django 设置 Redis 作为缓存

## 背景

如果是工具类小项目，一般用不到缓存。因为在项目设计的过程中应当尽量减少依赖，不过度设计，以实现需求为目标，尽量让项目简单，这样协作的小伙伴看起代码来不费劲，出了问题还容易查找原因。所以正常情况下一个数据库（MySQL）就足够了。

但很多时候随着使用频率的增加，出于性能优化的考虑，数据库已无法满足需求，增加缓存就很有必要了。

所谓的缓存，就是把数据库中不常变化的数据提取出来，临时存放到一个第三方存储介质中。在一定的时间内有用户来访问这些数据时，不需要再去执行数据库操作，直接从缓存中取得数据，这样将大大降低对数据库的消耗，且缓存大都使用内存来存储，读写效率极高。

Django 支持的缓存类型有：

* Memcached：它是 Django 原生支持的缓存系统，不过 Memcached 不是 Django 自带的软件，而是一个独立的软件，需要另外安装、配置和启动服务。
* 数据库缓存：我们使用缓存的很大原因就是要减少数据库的操作，如果将缓存又存到数据库，就有点奇怪了。但也有特例：比如你有一个高速、高效索引的数据库。
* 文件系统缓存：连数据库我们都觉得慢，那么基于文件系统显然更慢。不过在没有 Redis、Memcached 和数据库的时候，可以凑活着用一下。
* 本地内存缓存：如果本地主机内存够大够快，也可以直接使用它作为缓存，并且这也是 Django 默认使用的缓存后端。
* 开发用的虚拟缓存：仅用于开发模式，只是实现缓存接口，并不做其他操作，等正式部署的时候不会用这种缓存，但开发好的 API 就不用做什么大的修改了。 
* 自定义的缓存后台，自己写一个缓存后端，或者接入 Redis 第三方缓存。

这里不多介绍，配置和使用示例可以看[官方文档]([https://docs.djangoproject.com/en/dev/topics/cache/])。

因为正常情况下我们的环境中肯定会安装 Redis（就算不是当前服务用，也会有别的模块用），所以就采用 Redis 来做缓存了。

## 安装配置

Redis 的安装参考 [Redis 的安装与卸载](/backend/redis/installation-of-redis/)，另外要想在 Django 中使用 Redis 缓存，则需要先安装依赖：

```bash
pip install django-redis
```

接着在 settings.py 配置：

```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://:密码@127.0.0.1:6379/1",
        "TIMEOUT": 60,  # 缓存的默认过期时间，默认是 300s，None 表示永不过期
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "CONNECTION_POOL_KWARGS": {"max_connections": 100},
            "IGNORE_EXCEPTIONS": True,
            "COMPRESSOR": "django_redis.compressors.zlib.ZlibCompressor",
            # "PASSWORD": "密码",
        }
    }
}
```

配置完后就可以使用缓存了。

## 全站/视图/模板缓存

Django 提供不同级别的缓存粒度：可以缓存特定的视图，也可以只缓存部分模板片段，还可以缓存整个网站。

但现在一般都是前后端分离项目，所以这几类都不是目前我想要的，需要了解以上几类缓存的话可以参考官网，里面写的很详细。

这里我需要的是 Django 提供的底层缓存 API，可以使用这些 API 来读写缓存的数据。

## 缓存 API

开启 Django Cache 配置后，就可以使用缓存服务了，基本用法如下

```python
from django.core.cache import cache
```

获取到 `cache` 实例后，就可以使用 Redis 命令来操作缓存了，例如：

```bash
>>> from django.core.cache import cache
>>> cache.set("foo", "value", timeout=25)
>>> cache.ttl("foo")
25
```

其它 API 其实可以参考 Redis 的操作命令，因为 [django-redis](https://github.com/jazzband/django-redis) 这个模块提供了对 Redis 客户端的原始访问，它重写了文件缓存类中的所有方法。

也可以通过拿到 Redis 的链接操作 Redis 数据库，跟直接操作 Redis 数据库的语法一样：

```bash
>>> from django_redis import get_redis_connection
>>> con = get_redis_connection("default")
>>> con
<redis.client.Redis object at 0x2dc4510>
```

（完）
