# Nginx 安全访问控制

## 模块介绍

该功能用到了 `ngx_http_access_module` 这个模块，他提供了一个**根据客户端 IP 来限制访问**的功能。

该模块默认是关闭的，可以将它配置在 `http`，`server`，`location`，`limit_except` 中的任一位置。

语法：

* 配置允许访问：`allow 地址值;`
* 配置拒绝访问：`deny 地址值;`
* 地址值的形式支持：address | CIDR | unix: | all

## 配置案例

假设我们有个网站，要限制外人不能访问管理页面（只允许指定 IP 访问 `/admin` 开始的 uri）。

```bash {8,9}
server {
    listen 80;
    server_name  www.fedbook.cn;
    root /html/docs;
    index index.html;

    location /admin {
        allow 192.168.10.50;
        deny all;
    }
}
```

## 参考资料

* [Module ngx_http_access_module](http://nginx.org/en/docs/http/ngx_http_access_module.html "Module ngx_http_access_module")

（完）
