# Ngixn 配置文件详解

本文基于 Nginx 1.18.0，介绍其配置文件 `nginx.conf` 的主要配置参数。

## 核心参数详解

```bash
user  nginx nginx;                 # 指定 Nginx 服务运行的用户和用户组
worker_processes  1;               # 定义 Nginx 的 worker 进程数，建议等于 CPU 总核心数

# 全局指定 Nginx 错误日志，定义类型，[ debug | info | notice | warn | error | crit ]
# 如果要关闭 error log，需要写成 error_log /dev/null;
# 而不是 error_log off; 否则错误日志会写到一个叫做 off 的文件中
error_log  /var/log/nginx/error.log warn;

pid        /var/run/nginx.pid;     # 指定 Nginx PID 进程号文件

# 一个 Nginx 进程打开的最多文件描述符数目
# 理论值应该是最多打开文件数（系统的值 ulimit -n）与 Nginx 进程数相除
# 但是 Nginx 分配请求并不均匀，所以建议与 ulimit -n 的值保持一致
worker_rlimit_nofile 65535;

# 工作模式与连接数上限
events {
    # 参考事件模型
    # use [ kqueue | rtsig | epoll | /dev/poll | select | poll ]
    # epoll 模型是 Linux 2.6 以上版本内核中的高性能网络 I/O 模型
    # 如果跑在 FreeBSD 上面，就用 kqueue 模型
    use epoll;
    # 单个进程最大连接数（最大连接数=连接数*进程数），默认值为 1024
    worker_connections  65535;
}

# 设定 http 服务器
http {
    # 文件扩展名与文件类型映射表
    # Nginx 会根据 mime.type 定义的对应关系来告诉浏览器如何处理当前返回的文件（打开或下载）
    include       mime.types;

    # 当 Nginx 无法识别当前访问页面内容时（未定义的扩展名），默认触发下载动作
    # 浏览器访问到未定义的扩展名的时候，就默认为下载该文件
    # 如果将这个设置改成 default_type text/html; 即把所有未设置的扩展名当 HTML 文件打开
    default_type  application/octet-stream;

    charset utf-8;                         # 默认编码

    # 服务器名字的 hash 表大小（看不懂的参数默认即可）
    server_names_hash_bucket_size 128;
    # 客户端请求头部的缓冲区大小
    client_header_buffer_size 32k;
    # 客户请求头缓冲大小
    # Nginx 默认会用 client_header_buffer_size 这个 buffer 来读取 header 值
    # 如果 header 过大，它会使用 large_client_header_buffers 来读取
    large_client_header_buffers 4 64k;
    # 设定通过 Nginx 上传文件的大小
    client_max_body_size 8m;

    # 开启高效文件传输模式
    # sendfile 指令指定 Nginx 是否调用 sendfile 函数来输出文件
    # 对于普通应用设为 on，如果用来进行下载等应用磁盘 IO 重负载应用，可设置为 off，以平衡磁盘与网络 I/O 处理速度，降低系统的负载
    # 注意：如果图片显示不正常把这个改成 off
    sendfile on;
    # 开启目录列表访问，适合下载服务器，默认关闭
    autoindex on;
    # 防止网络阻塞，此选项仅在使用 sendfile 的时候使用
    tcp_nopush on;
    # 防止网络阻塞，此选项仅在使用 sendfile 的时候使用
    tcp_nodelay on;

    keepalive_timeout 65;                  # 长连接超时时间，单位是秒

    # FastCGI 相关参数是为了改善网站的性能：减少资源占用，提高访问速度。下面参数看字面意思都能理解。
    fastcgi_connect_timeout 300;
    fastcgi_send_timeout 300;
    fastcgi_read_timeout 300;
    fastcgi_buffer_size 64k;
    fastcgi_buffers 4 64k;
    fastcgi_busy_buffers_size 128k;
    fastcgi_temp_file_write_size 128k;

    # gzip 模块设置
    gzip on;                               # 开启 gzip 压缩输出
    gzip_min_length 1k;                    # 最小压缩文件大小
    gzip_buffers 4 16k;                    # 压缩缓冲区
    gzip_http_version 1.0;                 # 压缩版本（默认 1.1，前端如果是 squid2.5 请使用 1.0）
    gzip_comp_level 2;                     # 压缩等级
    # 压缩类型，默认就已经包含 text/html，所以下面就不用再写了，写上去也不会有问题，但是会有一个 warn
    gzip_types text/plain application/x-javascript text/css application/xml;
    gzip_vary on;
    # limit_zone crawler $binary_remote_addr 10m;    # 开启限制 IP 连接数的时候需要使用

    # upstream 的负载均衡，weight 是权重，可以根据机器配置定义权重
    # weigth 参数表示权值，权值越高被分配到的几率越大
    # Nginx 的 upstream 目前支持 4 种方式的分配，这里演示一种，后面章节会分别演示
    upstream www.baidu.com {
        server 192.168.80.121:80 weight=3;
        server 192.168.80.122:80 weight=2;
        server 192.168.80.123:80 weight=3;
    }

    # 全局指定 Nginx 访问日志的格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    # 全局定义 Nginx 访问日志的位置
    access_log  logs/access.log  main;
    # 一般上面两个不配置，只设置 access_log off; 然后在需要的 server 下配置日志
    # 这么做可以避免日志产生过大（如果 http 和 server 都不配置，默认会写入 logs/access.log）
    access_log  off;

    # 虚拟主机的配置，一个 server 配置段一般对应一个域名
    # 在实际生产中一般会将这部分拆出来形成子配置文件，后面的章节会讲
    server {
        listen       80;                     # 指定监听端口
        server_name  www.baidu.com;          # 指定当前网站的访问域名

        location / {
            root   html;                     # 指定代码位置
            index  index.html index.htm;     # 指定首页文件
        }

        #  定义 404 错误页面，如果是 404 错误，则把站点根目录下的 404.html 返回给用户 
        error_page  404                    /404.html;
        #  定义 50x 错误页面，可以配合 location 使用，用 location 调用实际的错误页面
        error_page      500 502 503 504    /50x.html;
        location = /50x.html { 
            root  /usr/share/nginx/html; 
        } 
    }
}
```

## 全局日志的关闭

为了避免日志产生过大，也是处于模块化的思想，我们一般不在全局中（http 中）指定日志格式和输出位置，而是在子配置文件中（每个 server 中）单独配置。

但是如果 http 和 server 都不配置，默认会写入 `logs/access.log`，即全局的形式。所以需要关闭全局日志。

网上很多博客中展示的都是错误示例，这里演示正确的关闭方式，包括 `error_log` 和 `access_log `：

```bash
# 错误示例，会产生名字为 off/on 的日志文件
error_log off;
access_log on;

正确关闭方式
error_log /dev/null;
access_log off;
```

## 日志 log_format 可选项

默认格式：

```bash
log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';
```

参数释义表：

| 字段                    | 说明                                       |
| ----------------------- | ----------------------------------------- |
| $remote_addr            | 客户端地址                                 |
| $remote_user            | 客户端用户名称                              |
| $time_local             | 访问时间和时区                              |
| $request                | 请求的 URI 和 HTTP 协议                     |
| $http_host              | 请求地址，即浏览器中你输入的地址（IP 或域名）  |
| $status                 | HTTP 请求状态                               |
| $upstream_status        | upstream 状态                               |
| $body_bytes_sent        | 发送给客户端文件内容大小                      |
| $http_referer           | url 跳转来源                                |
| $http_user_agent        | 用户终端浏览器等信息                         |
| $ssl_protocol           | SSL协议版本                                 |
| $ssl_cipher             | 交换数据中的算法                             |
| $upstream_addr          | 后台 upstream 的地址，即真正提供服务的主机地址 |
| $request_time           | 整个请求的总时间                             |
| $upstream_response_time | 请求过程中，upstream 响应时间                 |

## 参考资料

* [Full Example Configuration](https://www.nginx.com/resources/wiki/start/topics/examples/full/ "Full Example Configuration")
