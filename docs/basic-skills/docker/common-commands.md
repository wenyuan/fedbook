# 常用命令

一些 WEB 开发人员常用的 Docker 命令。

## docker build

该命令用于从 Dockerfile 构建 Docker image，Dockerfile 是一个包含构建镜像指令的脚本。

```bash
docker build -t [image_name] [dockerfile]

# Docker 17.05 开始，官网为了更好地描述作用，对一些命令名称进行了调整
docker image build -t [image_name] [dockerfile]
```

* `-t` 参数是 `-tag` 参数的缩写形式，允许镜像 `image` 指定名称和可选标签（冒号后面的部分），标签通常用于区分镜像的版本。
* `image_name`：镜像名称。
* `dockerfile`：`dockerfile` 文件，可以指定路径 `path/dockerfile`。

## docker images

列出本地构建的所有 docker 镜像。

```bash
docker images
# 等同于
docker image ls
```

## docker run

后面指定的是一个镜像，通过这个命令可以利用镜像生成容器，并启动容器。

```bash
# 各版本都可用
docker run [options] [image_name]

# 1.13 版本之后推荐使用
docker container run [options] [image_name]

# 示例：
# 用 face 镜像创建一个容器名为 node
# 把容器 3000 端口 映射到宿主机 3000 端口，把 /demo 目录（比如需要运行的程序）映射到宿主机的 /demo
docker run -d -it -p 3000:3000 -v /demo:/demo --name node face
```

这里要特别说一下 `docker run` 的 `option`，因为最常用：

* `--name` 为容器指定一个名称，否则 Docker 会为其分配一个随机名称。
* `-d` 容器启动后进入后台，并返回容器 ID，即启动守护式容器。
* `-P` 随机端口映射。
* `-p 80:8080` 将容器的 8080 端口映射到宿主机的 80 端口。
* `bash` 容器启动以后，内部第一个执行的命令。这里启动 bash，保证用户可以使用 Shell。
* `-i` 以交互模式运行容器，通常与 `-t` 同时使用。
* `-t` 为容器重新分配一个伪输入终端，容器的 Shell 会映射到当前的 Shell，然后在本机窗口输入的命令，就会传入容器，通常与 `-i` 同时使用。
* `--rm` 在容器终止运行后自动删除容器文件。
* `--restart=always` 设置容器自启动，这是一个重启策略，这个参数可以确保在 Docker 守护进程启动时，容器也会自动启动。
* `-v /xxx:/yyy` 映射命令，把本机的 xxx 目录映射到容器中的 yyy 目录，也就是说改变本机的 xxx 目录下的内容，容器 yyy 目录中的内容也会改变。

有时候，用后台模式启动一个容器 `docker run -d [image_name]` 后，用 `docker ps` 查看会发现容器并不在运行中。这是因为 Docker 的运行机制：**Docker 容器后台运行，必须有一个前台进程**。

容器运行的命令如果不是那些一直挂起的命令，比如 `top`、`tail`，那么命令执行完毕容器会自动退出。所以为了让容器持续在后台运行，那么需要将运行的程序以前台进程的形式运行。

```bash
# 方法一：在后台运行一个命令，这个命令一直在打印：
docker run -d --name [my_container_name] [image_name] /bin/bash -c "while true; do echo hello world; sleep 3600; done"

# 方法二：在运行命令中添加 -it 参数，这样容器就会以交互模式运行，即使没有前台进程，也不会退出
docker run -dit --name [my_container_name] [image_name] /bin/bash
```

但是在生产环境中，我们通常会尽量避免使用死循环或者 `tail -f /dev/null` 这样的方法来保持容器运行，因为这些方法虽然可以解决问题，但是它们并不是最佳实践。这些方法可能会消耗额外的 CPU 资源，尤其是在大规模部署的情况下。

在生产环境中，我们通常会让容器运行一个长期运行的进程，比如一个 Web 服务器或者一个数据库服务器。这样，只要这个进程在运行，容器就不会退出。

## docker ps

列出所有当前正在运行的容器。

```bash
# 各版本都可用
docker ps

# 1.13 版本之后推荐使用
docker container ps
```

运行后可以看到列出所有运行的容器，包括容器 ID、名称 和 镜像名称。

## docker start/stop

后面指定的是一个容器，用于启动/停止一个之前已经生成过的容器。

```bash
# 各版本都可用
docker start|stop [container_id]|[container_name]

# 新版本推荐使用
docker container start|stop [container_id]
```

> 一旦容器停止运行，它将不再出现在正在运行的容器列表中，通过 `docker ps` 是无法看到，需要列出不在运行的容器，可以使用命令 `docker ps -a`。

## docker logs

查看正在运行的容器的日志。

```bash
# 各版本都可用
docker logs [container_name]

# 新版本推荐使用
docker container logs [container_id]
```

此命令有助于调试容器中抛出的任何启动问题或异常。

可选参数：

* `--detail` 显示详细信息。
* `-t` 针对每行日志添加时间戳。
* `-f` 跟踪实时日志输出。
* `--tail n` 输出倒数 N 行的日志。

## docker exec

通过此命令可以进入运行的容器中。

```bash
# 各版本都可用
docker exec -it [container_id]|[container_name] /bin/bash

# 新版本推荐使用
docker container exec -it [container_id] /bin/bash
```

其中容器 ID 只要是能够证明唯一就可以，不用全输入。

## docker cp

该命令用于在 Docker 容器和主机之间复制文件或目录。

```bash
# 将主机上的文件或目录拷贝到容器的目录下
docker cp [src_path] [container_id]|[container_name]:[dest_path]

# 将容器中的目录拷贝到主机的目录下
docker cp [container_id]|[container_name]:[src_path] [dest_path]

# 新版本推荐使用
docker container cp
```

## docker login

为应用程序构建镜像并测试成功运行后，如果需要共享给其他人使用，就需要注册镜像仓库。

[DockerHub](https://hub.docker.com/) 是一个公共的镜像仓库，任何人都可以访问和下载存储在其中的镜像，除非用户将存储库设为私有。

要登录到 DockerHub（假设有一个帐户），可以使用以下命令：

```bash
docker login -u [username]
```

## docker push

该命令用于将镜像推送到 DockerHub。

```bash
# 各版本都可用
docker push [username]/[image_name]:[tag]

# 新版本推荐使用
docker image push [username]/[repository]:[tag]
```

跟 GitHub 的使用方式类似。

构建 Docker 镜像时的标准约定是：

```bash
# 各版本都可用
docker build -t [username]/[image_name]:[tag_name]

# 新版本推荐使用
docker image build -t [username]/[image_name]:[tag_name]
```

例如：

```bash
docker build -t test-user/vue3:v1
```

DockerHub 会在 `test-user` 用户下，自动将名为 `vue3` 的镜像标记为 `v1`。

## docker pull

登录到 DockerHub 后，可以使用这个命令拉取现有镜像：

```bash
# 各版本都可用
docker pull test-user/vue3:v1

# 新版本推荐使用
docker image pull test-user/vue3:v1
```

## 拓展

+ 推荐一个文档：[Docker 简介和安装 - Docker 快速入门](https://docker.easydoc.net/doc/81170005/cCewZWoN/lTKfePfP)
+ 官方文档： [官方文档](https://docs.docker.com/reference/cli/docker/container/)

（完）
