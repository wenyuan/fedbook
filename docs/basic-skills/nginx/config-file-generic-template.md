# Ngixn 配置文件模板

本文基于 Nginx 1.18.0，整理一份配置文件 nginx.conf 的通用模板。

## 模块拆分

当项目或业务越来越多的时候，Nginx 的配置文件 nginx.conf 会越来越大和复杂，不便于管理，所以需要拆分出多个子配置文件。

以下命令，如果你是 root 账户，直接执行即可，不是的话前面加 `sudo` 获取权限。

首先建立子配置文件目录：

```bash
cd /usr/local/nginx/conf
mkdir vhosts
```

然后在 nginx.conf 中使用 `include` 引入文件：

```bash
http {
    ...

    include /usr/local/nginx/conf/vhosts/*.conf;   # *.conf 代表所有 server 配置文件
    include /usr/local/nginx/conf/vhosts/*.proxy;  # *.proxy 代表所有做反向代理的 server（看情况可选）
}
```

最后把 server 模块移入子配置文件中：

```bash
# web.conf
server{   
    listen 80;
    server_name localhost;
    ...
}

# api.conf
server{   
    listen 81;
    server_name localhost;
    ...
}
```

此时的 Nginx 文件目录结构：

```bash
├── nginx
    │── html
    │── logs
    │── sbin
    │── ...
    └── conf
        ├── ...
        ├── nginx.conf         # 主配置文件
        └── vhosts             # 子配置文件的目录
            ├── web.conf       # 子配置文件 1
            └── api.conf       # 子配置文件 2
```

思路就是上面介绍的这样，下面是实际生产环境中的通用模板。

## 主配置文件

我在这份主配置文件中仅设置了几个核心参数，如果有特定需求可自行定制，如下所示：

```bash
user  nginx nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log crit;

pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    charset utf-8;

    access_log  off;

    sendfile        on;
    tcp_nopush     on;
    tcp_nodelay on;

    keepalive_timeout  65;

    fastcgi_connect_timeout 300;
    fastcgi_send_timeout 300;
    fastcgi_read_timeout 300;
    fastcgi_buffer_size 64k;
    fastcgi_buffers 4 64k;
    fastcgi_busy_buffers_size 128k;
    fastcgi_temp_file_write_size 128k;

    gzip on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    gzip_http_version 1.0;
    gzip_comp_level 2;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/bmp application/x-bmp image/x-ms-bmp application/vnd.ms-fontobject font/ttf font/opentype font/x-woff;
    gzip_vary on;
    # limit_zone crawler $binary_remote_addr 10m;    # 开启限制 IP 连接数的时候需要使用

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    include /usr/local/nginx/conf/vhosts/*.conf;

}
```

## 子配置文件

首先别忘了创建文件夹：

```bash
cd /usr/local/nginx/conf
mkdir vhosts
```

在该文件夹下所有以 `.conf` 结尾的文件都是子配置文件，在主配置文件的末尾被 `include` 引入了。

这里只做一份最基础的子配置文件（server 部分）模板，实现一个静态网站的部署配置。

```bash
server {
    listen 80;
    server_name  www.fedbook.cn fedbook.cn;

    root /sites/fedbook;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(html|htm)$ {
        expires 24h;
        add_header Cache-Control "public";
    }
    
    location ~* \.(css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|map|mp4|ogg|ogv|webm|htc)$ {
        expires 24h;
        access_log off;
        add_header Cache-Control "public";
    }

    access_log  /var/log/nginx/access/fedbook.log;
}
```

上面配置文件我们指定了这个子模块的日志输出路径，所以需要创建该路径的文件夹，否则在写入日志时会因文件夹不存在而报错：

```bash
mkdir -p /var/log/nginx/access/
```

检查 Nginx 配置文件的正确性：

```bash
/usr/local/nginx/sbin/nginx -t
```

最后重新加载 Nginx 配置即可上线该静态网站：

```bash
# 如果已将 Nginx 加入开机自启（有 Nginx 开机自启脚本）
/etc/init.d/nginx reload

# 如果未将 Nginx 加入开机自启
/usr/local/nginx/sbin/nginx -s reload
```

对于如何配置来实现更多强大的功能，会在后面章节一一展开介绍。

（完）
