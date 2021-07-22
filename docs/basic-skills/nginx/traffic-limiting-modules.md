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

限制 IP 并发数，也是说限制同一个 IP 同时连接服务器的数量。

### 1. 添加 `limit_conn_zone`

这个变量只能配置在 `http` 中。

```bash {8}
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
 location {
 ...
 limit_conn one 20;		 #连接数限制
 #带宽限制,对单个连接限数，如果一个ip两个连接，就是500x2k
 limit_rate 500k;		 
 ...
 }
 ...
 }
```

## 限制 IP 访问频率

限制同一个 IP 在一段时间里连接服务器的次数，可以一定程度上防止类似 CC 这种快速频率请求的攻击。

### 1. 添加 `limit_req_zone`

这个变量只能配置在 `http` 中。

```bash
http{
 ...
 #定义一个名为allips的limit_req_zone用来存储session，大小是10M内存，
 #以$binary_remote_addr 为key,限制平均每秒的请求为5个，
 #1M能存储16000个状态，rete的值必须为整数，
 #如果限制两秒钟一个请求，可以设置成30r/m
 limit_req_zone $binary_remote_addr zone=allips:10m rate=5r/s;
 ...
```

### 2. 添加 `limit_req`

这个变量可以配置在 `http`，`server`，`location` 中的任一位置。因为我这里只限制一个站点，所以添加到 `server` 里面。


## 参考资料

* [Module ngx_http_limit_conn_module](https://nginx.org/en/docs/http/ngx_http_limit_conn_module.html "Module ngx_http_limit_conn_module")
* [Module ngx_http_limit_req_module](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html "Module ngx_http_limit_req_module")

（完）
