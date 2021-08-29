---
sidebar: auto
anchorDisplay: false
---

# 接口设计

> 接口设计遵循 RESTful 规范，这是目前最流行的 API 设计规范。

在 RESTful 风格中，URL 被视为「资源」，要求使用名词进行说明，一般标准如下：

```
http(s)://域名:端口[/版本]/资源1[/子资源2/.../子资源n][/路径变量]
```

其中版本号是可选项，用于版本控制，通常使用 v1 / v1.1 这样的格式进行表达。如果版本号没有写，则默认使用最新版本获取资源。

下面列几个 RESTful 接口设计的注意点。

## 域名

应该尽量将 API 部署在专用域名之下。

```
https://api.example.com
```

如果确定 API 很简单，不会有进一步扩展，可以考虑放在主域名下。

```
https://example.org/api/
```

## 版本（Versioning）

应该将 API 的版本号放入 URL。

```
https://api.example.com/v1/
```

另一种做法是，将版本号放在 HTTP 头信息中，但不如放入 URL 方便和直观。[Github](https://developer.github.com/v3/media/#request-specific-version) 采用这种做法。

## 路径（Endpoint）

路径又称「终点」（endpoint），表示 API 的具体网址。

在 RESTful 架构中，每个网址代表一种资源（resource），所以网址中**不能有动词，只能有名词**，而且所用的名词往往与数据库的表格名对应。一般来说，数据库中的表都是同种记录的「集合」（collection），所以 API 中的名词也应该使用**复数**。

举例来说，有一个 API 提供动物园（zoo）的信息，还包括各种动物和雇员的信息，则它的路径应该设计成下面这样。

```
https://api.example.com/v1/zoos
https://api.example.com/v1/animals
https://api.example.com/v1/employees
```

> URL 中的名词，应该使用复数，还是单数？
>
> 这没有统一的规定，常见的操作是读取一个集合，比如 `GET /articles`（读取所有文章），这里明显应该是复数。
>
> 为了统一起见，建议都使用复数 URL，比如 `GET /articles/2` 要好于 `GET /article/2`。

## HTTP 动词

对于资源的具体操作类型，由 HTTP 动词表示。

常用的 HTTP 动词有下面五个（括号里是对应的 SQL 命令）。

* GET（SELECT）：从服务器取出资源（一项或多项）。
* POST（CREATE）：在服务器新建一个资源。
* PUT（UPDATE）：在服务器更新资源（客户端提供改变后的完整资源）。
* PATCH（UPDATE）：在服务器更新资源，通常是部分更新（客户端提供改变的属性）。
* DELETE（DELETE）：从服务器删除资源。

还有两个不常用的 HTTP 动词。

* HEAD：获取资源的元数据。
* OPTIONS：获取信息，关于资源的哪些属性是客户端可以改变的。

下面是一些例子（根据 HTTP 规范，动词一律大写）：

```
GET /zoos                     列出所有动物园
POST /zoos                    新建一个动物园
GET /zoos/ID                  获取某个指定动物园的信息
PUT /zoos/ID                  更新某个指定动物园的信息（提供该动物园的全部信息）
PATCH /zoos/ID                更新某个指定动物园的信息（提供该动物园的部分信息）
DELETE /zoos/ID               删除某个动物园
GET /zoos/ID/animals          列出某个指定动物园的所有动物
DELETE /zoos/ID/animals/ID    删除某个指定动物园的指定动物
```

## 过滤信息（Filtering）

如果记录数量很多，服务器不可能都将它们返回给用户。API 应该提供参数，过滤返回结果。

下面是一些常见的参数：

```
?limit=10                     指定返回记录的数量
?offset=10                    指定返回记录的开始位置
?page=2&per_page=100          指定第几页，以及每页的记录数
?sortby=name&order=asc        指定返回结果按照哪个属性排序，以及排序顺序
?animal_type_id=1             指定筛选条件
```

参数的设计允许存在冗余，即允许 API 路径和 URL 参数偶尔有重复。比如，`GET /zoo/ID/animals` 与 `GET /animals?zoo_id=ID` 的含义是相同的。

## 状态码（Status Codes）

客户端的每一次请求，服务器都必须给出回应。回应包括 HTTP 状态码和数据两部分。

HTTP 状态码就是一个三位数，分成五个类别。

* 1xx：接受的请求正在处理 （信息性状态码）
* 2xx：表示请求正常处理完毕 （成功状态码）
* 3xx：表示重定向状态，需要重新请求 （重定向状态码）
* 4xx：服务器无法处理请求 （客户端错误状态码）
* 5xx：服务器处理请求出错 （服务端错误状态码）

这五大类总共包含 [100 多种](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)状态码，覆盖了绝大部分可能遇到的情况。每一种状态码都有标准的（或者约定的）解释，客户端只需查看状态码，就可以判断出发生了什么情况，所以服务器应该返回尽可能精确的状态码。

常用的状态码有以下一些（方括号中是该状态码对应的 HTTP 动词）：

```
200 OK                     - [GET]             服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
201 Created                - [POST/PUT/PATCH]  用户新建或修改数据成功。
202 Accepted               - [*]               表示一个请求已经进入后台排队（异步任务）。
204 No Content             - [DELETE]          用户删除数据成功。
400 Bad Request            - [POST/PUT/PATCH]  服务器不理解客户端的请求，未做任何处理。
401 Unauthorized           - [*]               用户未提供身份验证凭据，或者没有通过身份验证。
403 Forbidden              - [*]               用户通过了身份验证，但是不具有访问资源所需的权限。
404 Not Found              - [*]               所请求的资源不存在，或不可用。
405 Method Not Allowed     - [*]               用户已经通过身份验证，但是所用的 HTTP 方法不在他的权限之内。
406 Not Acceptable         - [GET]             请求的资源的内容特性无法满足请求头中的条件，因而无法生成响应实体，即我要的你不给（比如用户请求 JSON 格式，但是只有 XML 格式）。
410 Gone                   - [GET]             所请求的资源已从这个地址转移，不再可用。
415 Unsupported Media Type - [POST/PUT/PATCH]  服务器拒绝服务，原因是请求格式不被支持，即我给的你不要（比如 API 只能返回 JSON 格式，但是客户端要求返回 XML 格式）。
422 Unprocesable entity    - [POST/PUT/PATCH]  客户端上传的附件无法处理，导致请求失败。
429 Too Many Requests      - [*]               客户端的请求次数超过限额。
500 Internal Server Error  - [*]               客户端请求有效，服务器处理时发生了意外。
503 Service Unavailable    - [*]               服务器无法处理请求，一般用于网站维护状态。
```

注意事项：

* API 不需要 1xx 状态码。
* API 用不到 301 状态码（永久重定向）和 302 状态码（暂时重定向，307 也是这个含义），因为它们可以由应用级别返回，浏览器会直接跳转，API 级别可以不考虑这两种情况。
* API 用到的 3xx 状态码，主要是 303（See Other），表示参考另一个 URL。它与 302 和 307 的含义一样，也是「暂时重定向」，区别在于 302 和 307 用于 GET 请求，而 303 用于 POST、PUT 和 DELETE 请求。收到 303 以后，浏览器不会自动跳转，而会让用户自己决定下一步怎么办。
* 一般来说，API 不会向用户透露服务器的详细信息，所以表示服务端错误的 5xx 状态码只要两个就够了：500 和 503。

状态码的完全列表参见[这里](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)。

## 返回结果

> API 返回的数据格式，不应该是纯文本，而应该是一个 JSON 对象，因为这样才能返回标准的结构化数据。
> 
> 所以，服务器回应的 HTTP 头的 `Content-Type` 属性要设为 `application/json`。
>
> 客户端请求时，也要明确告诉服务器，可以接受 JSON 格式，即请求的 HTTP 头的 `ACCEPT` 属性也要设成 `application/json`。

RESTful 响应的 JSON 结构应当全局保持相同的结构与语义，这里我给出行业最常见的数据格式范例。

在**标准化的响应结构**中，要包含 code、message 两项，分别对应了服务器处理结果与返回的消息内容。除此以外，data 属性是可选项，包含从响应返回的额外数据，如查询结果、新增或更新后的数据。

在**语义层面**，也要遵循相同的规则。例如，当服务器处理成功，code 固定等于 0；如果遇到异常情况，公司内部也要遵循统一的 code 命名标准。例如：code 以 1xxx 开头代表参数异常，2xxx 开头代表数据库处理异常。

> 注意：这里的 code 与 HTTP 状态码（Status Codes）是两码事，请不要混淆。

当然不同的公司有不同的命名规则，一定要提前定义好并要求开发团队严格按语义使用编码。

```
{
    code:"0" ,
    message : "success" ,
    data : {
        employee : {
            name : "张三",
            salary : 3500 , 
            version : 2
        }
    }
}
```

（完）
