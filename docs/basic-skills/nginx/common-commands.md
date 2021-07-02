# Nginx 常用命令

## Nginx 操作的命令

```bash
# 查看 Nginx 版本
/usr/local/nginx/sbin/nginx -v

# 检查配置文件 ngnix.conf 的正确性
/usr/local/nginx/sbin/nginx -t

# 启动 Nginx 服务
/usr/local/nginx/sbin/nginx

# 启动 Nginx 服务，-c 指定配置文件的路径
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf

# 重新加载配置
/usr/local/nginx/sbin/nginx -s reload

# 停止 Nginx 服务（快速关闭，不管有没有正在处理的请求）
/usr/local/nginx/sbin/nginx -s stop

# 安全退出 Nginx 服务（在退出前会完成已经接受的连接请求，比较优雅）
/usr/local/nginx/sbin/nginx -s quit
```

## Linux 检查的命令

```bash
# 查看 Nginx 进程
ps -ef | grep nginx

# 检查 Nginx 启动的端口
netstat -lntup | grep nginx
```

## 服务器防火墙相关命令

如果 Nginx 启动成功后，从浏览器访问还是连接不上，按如下步骤排查：

* 检查阿里云安全组是否开放端口（通过阿里云后台）
* 服务器防火墙是否开放端口

（完）
