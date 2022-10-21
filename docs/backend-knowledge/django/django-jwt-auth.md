# Django+JWT 实现 Token 认证

## 背景

> 几种主流的登录认证方案原理可以查看这篇文章：[前端登录方案总结](/project/solutions/login/)。

Django 默认采用传统的登录鉴权方式：当前端提交登录表单后，会发送请求给服务器，服务器对发送过来的账号密码进行验证鉴权，验证鉴权通过后，把用户信息记录在服务器端（`django_session` 表中），同时返回给浏览器一个 sessionid 用来唯一标识这个用户，浏览器将 sessionid 保存在 cookie 中，之后浏览器的每次请求都一并将 sessionid 发送给服务器，服务器根据 sessionid 与记录的信息做对比以验证身份。

而现在，基于 Token 的鉴权机制越来越多的用在了项目中：客户端通过账号密码进行登录，服务端验证鉴权，验证鉴权通过生成 Token 返回给客户端，之后客户端每次请求都将 Token 放在 header 里一并发送，服务端收到请求时校验 Token 以确定访问者身份。

session 的主要目的是给无状态的 HTTP 协议添加状态保持，通常在浏览器作为客户端的情况下比较通用。而 Token 的主要目的是为了鉴权，同时又不需要考虑 CSRF 防护以及跨域的问题，所以更多的用在专门给第三方提供 API 的情况下（比如前后端分离架构中，后端只提供 API 给前端），客户端请求无论是浏览器发起还是其他的程序发起都能很好的支持。所以目前基于 Token 的鉴权机制几乎已经成了前后端分离架构或者对外提供 API 访问的鉴权标准，得到广泛使用。

## 需求分析

JSON Web Token（JWT）是目前 Token 鉴权机制下最流行的方案，接下来讲下 Django 如何利用 JWT 实现对 API 的认证鉴权。

需求如下：

* 同一个接口既给前端页面提供数据，又对外提供 API 服务，要同时满足基于账号密码的验证和 JWT 验证。
* 项目用了 Django 默认的权限系统，既能对账号密码登录进行权限校验，又能对基于 JWT 的请求进行权限校验。

## PyJWT介绍

要实现上面说的功能，首先得引入 JWT 模块，Python 下有现成的 PyJWT 模块可以直接用，先看下 JWT 的简单用法。

### 安装 PyJWT

```bash
pip install pyjwt
```

### 利用 PyJWT 生成 Token

```python
import jwt

encoded_jwt = jwt.encode(
    {'username': '张三', 'site': 'https://www.baidu.com'},
    'secret_key',
    algorithm='HS256'
)
```

这里传了三个参数给 JWT：

* 第一部分是一个 json 对象，称为 Payload，主要用来存放有效的信息，例如用户名、过期时间等等想要传递的信息。
* 第二部分是一个秘钥字符串，这个秘钥主要用在下面 Signature 签名中，服务端用来校验 Token 合法性，这个秘钥只有服务端知道，不能泄露。
* 第三部分指定了 Signature 签名的算法。

### 查看生成的 Token

```python
print(encoded_jwt)
'''
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ilx1NWYyMFx1NGUwOSIsInNpdGUiOiJodHRwczovL3d3dy5iYWlkdS5jb20ifQ.COB52H7F5H9r-b19szBtwnlajuL5UQjNbtYnXJCNLPs
'''
```

JWT 生成的 Token 是一个用两个点（`.`）分割的长字符串，形如：`Header.Payload.Signature`。这三部分是：Header 头部，Payload 负载，Signature 签名。

JWT 是不加密的，任何人都可以读的到其中的信息，其中第一部分 Header 和第二部分 Payload 只是对原始输入的信息转成了 base64 编码，第三部分 Signature 是用 header+payload+secret_key 进行加密的结果。

因此可以直接用 base64 对 Header 和 Payload 进行解码得到相应的信息：

```python
import base64

# 解码 Header
print(base64.b64decode(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
))
'''
b'{"alg":"HS256","typ":"JWT"}'
'''

# 解码 Payload
# 这里最后拼接 == 的原因是 base64 解码对传入的参数长度不是 2 的对象，需要在参数最后加上一个或两个等号
print(base64.b64decode(
    'eyJ1c2VybmFtZSI6Ilx1NWYyMFx1NGUwOSIsInNpdGUiOiJodHRwczovL3d3dy5iYWlkdS5jb20ifQ' + '=='
))
'''
b'{"username":"\\u5f20\\u4e09","site":"https://www.baidu.com"}'
'''
```

因为 JWT 不会对结果进行加密，所以不要保存敏感信息在 Header 或者 Payload 中，服务端也主要依靠最后的 Signature 来验证 Token 是否有效以及有无被篡改。

### 解密 Token

```python
res = jwt.decode(encoded_jwt, 'secret_key', algorithms=['HS256'])
print(res)
'''
{'username': '张三', 'site': 'https://www.baidu.com'}
'''
```

服务端在有秘钥的情况下可以直接对 JWT 生成的 Token 进行解密，解密成功说明 Token 正确，且数据没有被篡改，返回一个 dict 对象。

## Django 案例

Django 要兼容 session 认证的方式，还需要同时支持 JWT，并且两种验证需要共用同一套权限系统，该如何处理呢？

我们可以参考 Django 的解决方案：装饰器。例如用来检查用户是否登录的 `login_required` 和用来检查用户是否有权限的 `permission_required` 两个装饰器，我们可以自己实现一个装饰器，检查用户的认证模式，同时认证完成后验证用户是否有权限操作。

于是一个 `auth_permission_required` 的装饰器产生了：

```python
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied

UserModel = get_user_model()


def auth_permission_required(perm):
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            # 格式化权限
            perms = (perm,) if isinstance(perm, str) else perm

            if request.user.is_authenticated:
                # 正常登录用户判断是否有权限
                if not request.user.has_perms(perms):
                    raise PermissionDenied
            else:
                try:
                    auth = request.META.get('HTTP_AUTHORIZATION').split()
                except AttributeError:
                    return JsonResponse({"code": 401, "message": "No authenticate header"})

                # 用户通过 API 获取数据验证流程
                if auth[0].lower() == 'token':
                    try:
                        dict = jwt.decode(auth[1], settings.SECRET_KEY, algorithms=['HS256'])
                        username = dict.get('data').get('username')
                    except jwt.ExpiredSignatureError:
                        return JsonResponse({"status_code": 401, "message": "Token expired"})
                    except jwt.InvalidTokenError:
                        return JsonResponse({"status_code": 401, "message": "Invalid token"})
                    except Exception as e:
                        return JsonResponse({"status_code": 401, "message": "Can not get user object"})

                    try:
                        user = UserModel.objects.get(username=username)
                    except UserModel.DoesNotExist:
                        return JsonResponse({"status_code": 401, "message": "User Does not exist"})

                    if not user.is_active:
                        return JsonResponse({"status_code": 401, "message": "User inactive or deleted"})

                    # Token 登录的用户判断是否有权限
                    if not user.has_perms(perms):
                        return JsonResponse({"status_code": 403, "message": "PermissionDenied"})
                else:
                    return JsonResponse({"status_code": 401, "message": "Not support auth type"})

            return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator
```

在接口函数使用时就可以用这个装饰器来代替原本的 `login_required` 和 `permission_required` 装饰器了：

```python
@auth_permission_required('account.select_user')
def user(request):
    if request.method == 'GET':
        _jsondata = {
            "user": "张三",
            "site": "https://www.baidu.com"
        }
        return JsonResponse({"state": 1, "message": _jsondata})
    else:
        return JsonResponse({"state": 0, "message": "Request method 'POST' not supported"})
```

我们还需要一个生成用户 Token 的方法，通过给 User model 添加一个 token 的静态方法来处理：

```python
class User(AbstractBaseUser, PermissionsMixin):
    create_time = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    update_time = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    username = models.EmailField(max_length=255, unique=True, verbose_name='用户名')
    fullname = models.CharField(max_length=64, null=True, verbose_name='中文名')
    phonenumber = models.CharField(max_length=16, null=True, unique=True, verbose_name='电话')
    is_active = models.BooleanField(default=True, verbose_name='激活状态')

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    @property
    def token(self):
        return self._generate_jwt_token()

    def _generate_jwt_token(self):
        token = jwt.encode({
            'exp': int(time.time() * 1000) + 1 * 24 * 60 * 60 * 1000,
            'iat': int(time.time() * 1000),
            'data': {
                'username': self.username
            }
        }, settings.SECRET_KEY, algorithm='HS256')

        return token.decode('utf-8')

    class Meta:
        default_permissions = ()

        permissions = (
            ("select_user", "查看用户"),
            ("change_user", "修改用户"),
            ("delete_user", "删除用户"),
        )
```

::: tip 小贴士
JWT 的载荷（Payload）常见信息：

* iss：该 JWT 的签发者，是否使用是可选的。
* sub：该 JWT 所面向的用户，是否使用是可选的。
* aud：接收该 JWT 的一方，是否使用是可选的。
* exp（expires）：什么时候过期，这里是一个 Unix 时间戳，是否使用是可选的。
* iat（issued at）：在什么时候签发的（UNIX 时间），是否使用是可选的。
* nbf（Not Before）：如果当前时间在 nbf 里的时间之前，则 Token 不被接受。一般都会留一些余地，比如几分钟。是否使用是可选的。

例如：

```json
{
  "iss": "Online JWT Builder", 
  "iat": 1666257979166, 
  "exp": 1666344379166, 
  "aud": "www.example.com", 
  "sub": "zhangsan@163.com",
  "role": ["manager", "project administrator"] 
}
```
:::

可以直接通过用户对象来生成 Token：

```bash
>>> from accounts.models import User
>>> u = User.objects.get(username='zhangsan')
>>> u.token
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjYzNDQwMjgzOTYsImlhdCI6MTY2NjI1NzYyODM5NiwiZGF0YSI6eyJ1c2VybmFtZSI6InpoYW5nc2FuIn19.ewizdndVWZE8IKD_MjiDN3B6YiKE2fzfpQhyXTwyhbU'
```

生成的 Token 给到客户端，客户端就可以拿这个 Token 进行鉴权了：

```bash
>>> import requests
>>> token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjYzNDQwMjgzOTYsImlhdCI6MTY2NjI1NzYyODM5NiwiZGF0YSI6eyJ1c2VybmFtZSI6InpoYW5nc2FuIn19.ewizdndVWZE8IKD_MjiDN3B6YiKE2fzfpQhyXTwyhbU'
>>>
>>> r = requests.get('http://localhost/api/user', headers={'Authorization': 'Token '+token})
>>> r.json()
{'username': 'zhangsan', 'fullname': '张三', 'is_active': True}
```

这样一个 `auth_permission_required` 方法就可以搞定上面的全部需求了，简单好用。

（完）
