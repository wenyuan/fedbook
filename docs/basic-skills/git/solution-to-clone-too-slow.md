# clone 速度过慢

## 问题描述

想从 GitHub 上面 clone 项目，很多情况下会慢的离谱，等待好久后报错：

<div style="color: #FF6827;">
fatal: early EOF  <br>
fatal: the remote end hung up unexpectedly  <br>
fatal: index-pack failed  <br>
error: RPC failed; curl 18 transfer closed with outstanding read data remaining
</div>

网上有一些方法：复制项目到码云（比较麻烦），修改 hosts 文件（以前有用），调整 Git 的传输缓存（仅用于解决文件过大导致的下载慢问题，不能解决网络本身带来的问题）。

最终方案还得是给 Git 设置代理模式。

## 解决方案

需要用到几个命令，注意下面的端口 `1080` 和 `1081` 都是我自行配置的，每个人情况可能不一样。

* 1080：SOCKS 端口
* 1081：HTTP 端口（某些软件默认的 SOCKS + 1）

### 设置代理

::: tip 小贴士
我推荐使用专用代理里中 http 代理，这是不容易有负面影响且切实有效的，因为 GitHub 在某次更新后，socks 代理有时候会被拒绝。  
但其它代理模式的命令还是要整理一下的，万一需要用到呢~
:::

全局代理：使用后作用于全局环境，太极端，一般不推荐。

```bash
# 使用 http 协议(推荐)
git config --global http.proxy 127.0.0.1:1081
# 或使用 socks 协议
git config --global http.proxy socks5://127.0.0.1:1080
```

局部代理：在 github clone 的仓库内执行，不是很方便，一般不推荐。

```bash
# 使用 http 协议
git config --local http.proxy 127.0.0.1:1081
# 或使用 socks 协议
git config --local http.proxy socks5://127.0.0.1:1080
```

专用代理：只对 github 进行代理，对国内的仓库不影响，推荐！

```bash
# 使用 http 协议
git config --global http.https://github.com.proxy 127.0.0.1:1081
# 或使用 socks 协议
git config --global http.https://github.com.proxy socks5://127.0.0.1:1080
```

### 查询目前是否使用了代理

查询当前的 Git 环境是否使用了代理。

查询全局代理：

```bash
git config --global http.proxy
```

查询局部代理：

```bash
git config --local http.proxy
```

查询专用代理（对 github 进行的代理）：

```bash
git config --global http.https://github.com.proxy
```

### 取消代理

取消当前 Git 环境使用的代理，恢复直连模式。

取消全局代理：

```bash
git config --global --unset http.proxy
```

取消局部代理：

```bash
git config --local --unset http.proxy
```

取消专用代理（对 github 进行的代理）：

```bash
git config --global --unset http.https://github.com.proxy
```

## 补充：关于调整 Git 的传输缓存

网上很多文章多 clone 过慢或 push 时因为文件过大导致报错时，可以调整 Git 的传输缓存：

```bash
# Git 默认设置 http post 的缓存为 1M, 很多文章建议调大一点, 例如 500M。
git config --global http.postBuffer 524288000
```

但我发现这非但解决不了本文提到的问题，而且即使真遇到大文件的情况，官方也并不推荐这么做，详见：

《[Git: Stop changing http.postBuffer...](https://docs.microsoft.com/en-us/azure/devops/repos/git/rpc-failures-http-postbuffer?view=azure-devops)》

（完）
