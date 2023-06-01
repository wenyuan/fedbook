# 浏览器缓存机制

缓存可以减少网络 IO 消耗，提高访问速度。浏览器缓存机制有四个方面，它们按照获取资源时请求的优先级依次排列如下：

* Memory Cache
* Service Worker Cache
* HTTP Cache
* Push Cache

在浏览器的 Network 面板，Size 那一栏写着形如 `(from disk cache)` 这样描述的，就是代表该资源是通过缓存获取到的。

## HTTP 缓存机制

> 考虑到 HTTP 缓存是最主要、最具有代表性的缓存策略，故优先针对 HTTP 缓存机制进行剖析。

HTTP 缓存分为**强缓存**和**协商缓存**。优先级较高的是强缓存，在命中强缓存失败的情况下，才会走协商缓存。

### 强缓存

强缓存是利用 HTTP 头中的 `Expires` 和 `Cache-Control` 两个字段来控制的。强缓存中，当请求再次发出时，浏览器会根据其中的 `expires` 和 `cache-control` 判断目标资源是否**命中强缓存**，若命中则直接从缓存中获取资源，**不会再与服务端发生通信**。

命中强缓存的情况下，返回的 HTTP 状态码为 200 （如下图）。

<div style="text-align: center;">
  <img src="./assets/hit-strong-caching.png" alt="命中强缓存">
  <p style="text-align: center; color: #888;">（命中强缓存）</p>
</div>

在 Http1.0 的规范中，在请求头里用 `expires` 表示资源的过期时间，值是一个**绝对的时间戳**，是由服务器端返回的。在浏览器第一次请求资源时，服务器端会在 Response Headers 中将过期时间写入 `expires` 字段。接下来如果我们试图再次向服务器请求资源，浏览器就会先对比本地时间和 `expires` 的时间戳，如果本地时间小于 `expires` 设定的过期时间，那么就直接去缓存中取这个资源。

由于时间戳是服务器来定义的，而本地时间的取值却来自客户端，因此客户端和服务器时间不同，会导致缓存命中误差。

为了解决这个问题，在 HTTP1.1 的规范中，提出了 `cache-control` 字段，这个字段的 `max-age` 属性允许我们通过设定**相对的时间长度**来达到同样的目的：客户端会记录请求到资源的时间点，以此作为相对时间的起点，从而确保参与计算的两个时间节点（起始时间和当前时间）都来源于客户端，由此便能够实现更加精准的判断。

当 `Cache-Control` 与 `Expires` 同时出现时，`Cache-Control` 的优先级更高。

`cache-control` 中常见的几个响应属性值：

<div style="text-align: center;">
  <img src="./assets/cache-control-attributes.svg" alt="cache-control 属性值">
  <p style="text-align: center; color: #888;">（cache-control 属性值）</p>
</div>

### 协商缓存

强缓存是由本地浏览器在确定是否使用缓存，当浏览器没有命中强缓存时就会使用协商缓存：浏览器向服务器发送请求，验证协商缓存是否命中，如果缓存命中则返回 304 状态码（表示缓存资源未改动），否则返回新的资源数据。

<div style="text-align: center;">
  <img src="./assets/hit-negotiated-caching.png" alt="命中协商缓存">
  <p style="text-align: center; color: #888;">（命中协商缓存）</p>
</div>

如果启用了协商缓存，它会在首次请求时随着 Response Headers 返回：

```
Last-Modified: Wed, 31 May 2023 08:21:46 GMT
```

随后我们每次请求时，会带上一个叫 `If-Modified-Since` 的时间戳字段，它的值正是上一次 Response 返回给它的 `Last-Modified` 值：

```
If-Modified-Since: Wed, 31 May 2023 08:21:46 GMT
```

服务器接收到这个时间戳后，会比对该时间戳和资源在服务器上的最后修改时间是否一致，从而判断资源是否发生了变化。如果发生了变化，就会返回一个完整的响应内容，并在 Response Headers 中添加新的 `Last-Modified` 值；否则，返回如上图的 304 响应，Response Headers 不会再添加 `Last-Modified` 字段。

单纯使用 `Last-Modified` 存在一些弊端，比如：

* 我们编辑了文件，但文件的内容没有改变。服务端并不清楚我们是否真正改变了文件，它仍然通过最后编辑时间进行判断。因此这个资源在再次被请求时，会被当做新资源，进而引发一次完整的响应 —— 不该重新请求的时候，也会重新请求。
* 当我们修改文件的速度过快时（比如花了 `100ms` 完成了改动），由于 `If-Modified-Since` 只能检查到以秒为最小计量单位的时间差，所以它是感知不到这个改动的 —— 该重新请求的时候，反而没有重新请求了。

为了让服务器正确感知文件的变化，就引入了 `Etag`。它是由服务器为每个资源生成的**唯一的标识字符串**，这个标识字符串是基于文件内容编码的，只要文件内容不同，它们对应的 `Etag` 就是不同的，反之亦然。

`Etag` 和 `Last-Modified` 类似，当首次请求时，我们会在 Response Headers 里获取到一个最初的标识符字符串：

```
Etag: W/"d989f816c318997ceef047a94f447c2a"
```

那么下一次请求时，请求头里就会带上一个值相同的、名为 `if-None-Match` 的字符串供服务端比对了：

```
If-None-Match: W/"d989f816c318997ceef047a94f447c2a"
```

`Etag` 的生成过程需要服务器额外付出开销，会影响服务端的性能，这是它的弊端。因此启用 `Etag` 并不能替代 `Last-Modified`，它只能作为 `Last-Modified` 的补充和强化存在。**`Etag` 在感知文件变化上比 `Last-Modified` 更加准确，优先级也更高。当 `Etag` 和 `Last-Modified` 同时存在时，以 `Etag` 为准**。

### 如何配置缓存策略
