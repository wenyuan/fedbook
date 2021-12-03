# Nginx 限流常用模块

限流是一个比较常见的需求，它可以限制某个用户在一定时间内产生的 HTTP 请求数。常用于安全方面，通过限制请求速度来防止外部暴力扫描，或者减慢暴力密码破解攻击，可以结合日志标记出目标 URL 来帮助防范 DDoS 攻击，也可以解决流量突发的问题（如整点活动）。

## 模块介绍

Nginx 有两个限流常用模块：

* `ngx_http_limit_conn_module`：该模块用于限制并发连接数
  * 在配置文件中，使用 `limit_conn_zone` 和 `limit_conn` 指令
* `ngx_http_limit_req_module`：该模块用于限制一段时间内同一 IP 的访问频率
  * 在配置文件中，使用 `limit_req_zone` 和 `limit_req` 指令

下面是配置案例。

## 限制并发

限制 IP 并发数，也是说限制同一个 IP 同时连接服务器的数量。可以防止一瞬间的并发访问过高导致服务器崩掉。

### 1. 添加 `limit_conn_zone`

这个变量只能配置在 `http` 中。

```bash
http {
    ...

    # 定义一个名为 addr 的 limit_req_zone 用来存储 session，大小是 10M 内存
    # 以 $binary_remote_addr 为 key
    # nginx 1.18 以后用 limit_conn_zone 替换了 limit_conn
    # 且只能放在 http{} 代码段
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    ...
    include /usr/local/nginx/conf/vhosts/*.conf;
}
```

### 2. 添加 `limit_conn`

这个变量可以配置在 `http`，`server`，`location` 中的任一位置。因为我这里只限制一个站点，所以添加到 `server` 里面。

```bash
server{
    ...

    limit_conn addr 10;      # 连接数限制
    # 设置给定键值的共享内存区域和允许的最大连接数。超出此限制时，服务器将返回 503（服务临时不可用）错误.
    # 如果区域存储空间不足，服务器将返回503（服务临时不可用）错误

    ...
}
```

上面的配置能达到的效果就是，一瞬间访问的时候，只会有 10 个 IP 能得到响应，后面的 IP 直接就返回 503 状态。

## 限制 IP 访问频率

限制同一个 IP 在一段时间里连接服务器的次数，可以一定程度上防止类似 CC 这种快速频率请求的攻击。

### 1. 添加 `limit_req_zone`

这个变量只能配置在 `http` 中。

```bash
http {
    ...

    # 定义一个名为 allips 的 limit_req_zone 用来存储 session，大小是 10M 内存，
    # 以 $binary_remote_addr 为 key，限制平均每秒的请求为 20 个，
    # 1M 能存储 16000 个状态，rate 的值必须为整数，
    # 如果限制两秒钟一个请求，可以设置成 30r/m
    limit_req_zone $binary_remote_addr zone=allips:10m rate=20r/s;

    ...
    include /usr/local/nginx/conf/vhosts/*.conf;
}
```

### 2. 添加 `limit_req`

这个变量可以配置在 `http`，`server`，`location` 中的任一位置。因为我这里只限制一个站点，所以添加到 `server` 里面。

```bash
server{
    ...

    # 限制每 IP 每秒不超过 20 个请求，漏桶数 burst 为 5
    # brust 的意思就是，如果第 1、2、3、4 秒请求为 19 个，
    # 第 5 秒的请求为 25 个是被允许的。
    # 但是如果第 1 秒就 25 个请求，第 2 秒超过 20 的请求返回 503 错误。
    # nodelay，如果不设置该选项，严格使用平均速率限制请求数，
    # 第 1 秒 25 个请求时，5 个请求放到第 2 秒执行，
    # 设置 nodelay，25 个请求将在第 1 秒执行。
    limit_req zone=allips burst=5 nodelay;

    ...
}
```

此时能达到的效果，同一个 IP 在一秒钟只能获得 20 个访问，超过 20 个请求，后面的也是直接返回 503。

## 限制并发 + 限制 IP 访问频率

上面的两个配置加在一起就可以做到：**一秒只有 10 个连接，每个连接只能发送 20 个请求**。

注意：对 request 的访问限制，一定要注意数量的配置，否则一不小心就会 503（ERR_ABORTED 503 (Service Temporarily Unavailable)），这会导致很多静态资源类型被拦截，使得页面加载不完整。

## 总结

通过 Nginx 的这两个模块实现限流是挺好用的功能，但是这两个配置也不是绝对安全，只要有足够的耐心来尝试，摸索出间接等待的时长，一样可以绕过这些校验，所以最好的方式还是在服务端做校验，防止不法分子对后台端口进行疯狂调用。

## 参考资料

* [Module ngx_http_limit_conn_module](https://nginx.org/en/docs/http/ngx_http_limit_conn_module.html "Module ngx_http_limit_conn_module")
* [Module ngx_http_limit_req_module](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html "Module ngx_http_limit_req_module")

（完）
