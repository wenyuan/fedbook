# 解决 clone 速度过慢问题

> 很多时候想从 GitHub 上 clone 一个仓库，都会遇到速度慢的问题，而且经常连接失败，这里给出有效解决方案。

## 背景

对于经常用 GitHub 的同学来说，这应该是个很头疼的问题：想从 GitHub 上面 clone 项目，很多情况下会慢的离谱，等待好久后报错：

<div style="color: #FF6827;">
fatal: early EOF  <br>
fatal: the remote end hung up unexpectedly  <br>
fatal: index-pack failed  <br>
error: RPC failed; curl 18 transfer closed with outstanding read data remaining
</div>

网上有一些方法：复制项目到码云（比较麻烦），修改 hosts 文件（以前有用），调整 git 的传输缓存（仅用于解决文件过大导致的下载慢问题，不能解决网络本身带来的问题）

最终方案还得给 git 设置代理模式。

## 二、git 设置代理模式（亲测有效）

需要用到几个命令，注意下面的端口 `1080` 和 `1081` 都是我自行配置的，每个人情况可能不一样。

### 1. 设置代理

全局代理：

```bash
# git config --global http.proxy http://127.0.0.1:1081
# git config --global https.proxy https://127.0.0.1:1081

# 实测后，用下面这条就能实现加速 clone 的效果，且能避开一些设置证书的坑
git config --global http.proxy 127.0.0.1:1081
# 如果用的是 v2rayN，默认使用 socks 协议，也可以用下面的命令
git config --global http.proxy socks5://127.0.0.1:1080
```

局部代理，在 github clone 的仓库内执行：

```bash
# git config --local http.proxy http://127.0.0.1:1081
# git config --local https.proxy https://127.0.0.1:1081

# 实测后，用下面这条就能实现加速 clone 的效果，且能避开一些设置证书的坑
git config --local http.proxy 127.0.0.1:1081
# 如果用的是 v2rayN，默认使用 socks 协议，也可以用下面的命令
git config --local http.proxy socks5://127.0.0.1:1080
```

只对 github 进行代理，对国内的仓库不影响：

```bash
# git config --global http.https://github.com.proxy https://127.0.0.1:1081
# git config --global https.https://github.com.proxy https://127.0.0.1:1081

# 实测后，用下面这条就能实现加速 clone 的效果，且能避开一些设置证书的坑
git config --global http.https://github.com.proxy 127.0.0.1:1081
# 如果用的是 v2rayN，默认使用 socks 协议，也可以用下面的命令
git config --global http.https://github.com.proxy socks5://127.0.0.1:1080
```

### 2. 查询是否代理

查询当前的 git 环境是否使用了代理。

查询全局代理：

```bash
git config --global http.proxy
git config --global https.proxy
```

查询局部代理：

```bash
git config --local http.proxy
git config --local https.proxy
```

查询对 github 进行的代理：

```bash
git config --global http.https://github.com.proxy
git config --global https.https://github.com.proxy
```


### 3. 取消代理

取消当前 git 环境使用的代理，恢复直连模式。

取消全局代理：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

取消局部代理：

```bash
git config --local --unset http.proxy
git config --local --unset https.proxy
```

取消对 github 进行的代理：

```bash
git config --global --unset http.https://github.com.proxy
git config --global --unset https.https://github.com.proxy
```

### 4. 注意代理端口

要注意的是，上面的 127.0.0.1:1081 这个地址是我自己的代理地址，每个人都需要查看自己的端口是不是也是 1081，同时也要区分 socks 端口和 http 端口，因为我这里主要是用的 https 方式来 clone GitHub 项目。


## 调整 git 的传输缓存（亲测无效）

这个方法我试了下，感觉没什么明显的效果。

当前环境执行一行 git 命令：

```bash
git config --global http.postBuffer 524288000
```

**不过这个命令可能在另一种场景下有用**，就是：

在进行 git push 操作时，出现 500 错误，根据错误信息判断是文件过大所致。

因为 Git 默认设置 http post 的缓存为 1M，如果遇到大文件，需要调整 post 缓存，例如调整到 500M。
