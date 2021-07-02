# Nginx 的卸载

我一般都是通过源码编译安装的方式，所以这里主要介绍如何卸载编译安装的 Nginx。

编译安装的 Nginx 卸载非常方便，直接将 Nginx 的安装目录删除即可，同时可以把 Nginx 使用的日志目录和临时目录一并删除。

## 停止 Nginx 服务

首先输入命令 `ps -ef | grep nginx` 检查一下 Nginx 服务是否在运行，在卸载之前需要先停止服务。

## 删除 Nginx 安装目录

```bash
# 查找安装路径
whereis nginx

# 如果是按照我上一篇介绍的步骤安装，删除安装目录的命令如下：
rm -rf /usr/local/nginx
```

## 删除 Nginx 自启动

如果安装了 Nginx 自启动（后面章节会讲），按照如下命令将自启动脚本删除。

```bash
# 取消开机启动
sudo update-rc.d -f nginx remove

# 删除自启动脚本
sudo rm -rf /etc/init.d/nginx
```

## find 查找相关文件并删除

查找并删除 Nginx 相关文件，如日志目录和临时目录等。

```bash
# 查找相关文件
find / -name nginx

# 判断是否能删除后，执行删除命令
...
```

（完）
