# Nginx 部署前后端分离项目

## 部署目标

* 解决前后端分离项目的跨域问题
* 前端路由采用 HTML5 History 模式
* 配置反向代理 Websocket

## 部署前准备

* 将前端代码打包成为纯静态文件，上传至服务器
* 后端代码启动在服务器，监听 `30000` 端口

## Nginx 配置

* `location` 为代理接口，可以转发代理后端的请求接口域名或者 ip，即可解决接口跨域问题
* 升级 Http1.1 到 Websocket 协议

```bash
upstream http_proxy {
    server 127.0.0.1:30000;
}

upstream ws_proxy {
    server 127.0.0.1:30000;
}

server {
    listen       80;
    server_name  www.wenyuanblog.com wenyuanblog.com;

    root /home/spa-project/wenyuanblog;
    index index.html;

    # 将 404 错误页面重定向到 index.html 可以解决 history 模式访问不到页面问题
    error_page    404         /index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ^~ /api/ {
        proxy_pass http://http_proxy;
        # timeout
        proxy_connect_timeout 75;
        proxy_read_timeout 150;
        proxy_send_timeout 150;
        client_max_body_size 50m;
        # redefine request header to backend
        proxy_set_header  Host              $http_host;
        proxy_set_header  X-Real-IP         $remote_addr;
        proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header  X-Forwarded-Proto $scheme;
    }

    location ^~ /ws/ {
        proxy_pass http://ws_proxy;
        # timeout
        proxy_connect_timeout 75;
        proxy_read_timeout 600;  # Websocket 保持长连接
        proxy_send_timeout 150;
        client_max_body_size 50m;
        # http => websocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        # redefine request header to backend
        proxy_set_header  Host              $host;
        proxy_set_header  X-Real-IP         $remote_addr;
        proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header  X-Forwarded-Proto $scheme;
    }

    location ~* \.(html|htm)$ { 
        expires 1h;
        add_header Cache-Control "public"; 
    }
    
    location ~* \.(css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|map|mp4|ogg|ogv|webm|htc)$ { 
        expires 24h;
        access_log off; 
        add_header Cache-Control "public"; 
    } 
    
    access_log  /var/log/nginx/access/wenyuanblog.log;
}
```

部分配置项解析：

* `proxy_connect_timeout`：后端服务器连接的超时时间，发起握手等候响应超时时间（默认为 60 秒，官方推荐最长不要超过 75 秒）
* `proxy_read_timeout`：连接成功后，Nginx 能够等待后端服务器响应的时间（默认 60 秒）
* `proxy_send_timeout`：后端服务器数据回传时间，就是在规定时间之内后端服务器必须传完所有的数据（默认 60 秒）
* `client_max_body_size`：Nginx 对上传文件大小的限制（默认是 1M）
* `proxy_set_header`：用来重定义发往后端服务器的请求头
  * `Host              $http_host;`：将原 http 请求 Header 中的 Host 字段也放到转发的请求
  * `X-Real-IP         $remote_addr;`：前一节点的 IP（并不一定是用户的真实 IP）
  * `X-Forwarded-For   $proxy_add_x_forwarded_for;`：前一节点的 X-Forwarded-For 的值
  > X-Real-IP 一般是最后一级代理将上游 IP 地址添加到该头中，X-Forwarded-For 是多个 IP 地址，而 X-Real-IP 是一个。
  * `X-Forwarded-Proto $scheme;`：拿到来源的传输协议（HTTP 或 HTTPS）

## 参考资料

* [Module ngx_http_proxy_module：proxy_set_header](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header "Module ngx_http_proxy_module：proxy_set_header")

（完）
