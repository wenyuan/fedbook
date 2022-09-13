# 网络排查工具

本文介绍网络各层的排查工具。

## 应用层

作为前端开发者，主要以 HTTP 应用的排查工具为主（其他应用开发者应该会有各种熟悉的排查工具）。

现在主流的浏览器是 Google 的 Chrome，它本身就内置了一个开发者工具。在 Chrome 界面里按下 F12，或者是苹果系统的话，还可以按下组合键 option + command + I，启动开发者工具。借助开发者工具，我们可以非常方便地做很多事。

### 找到有问题的服务端 IP

比如有用户报告死活访问不了你的网站，但是你很清楚这个网站的域名对应了很多 IP 地址，你怎么知道用户连的是哪个 IP 呢？

你可以这样做：让客户启用开发者工具，在「Network」页找到主页对象，在它的「Headers」部分，就能看到「Remote address」，这里的 IP 就是当前连接的 IP，比如下面这样：

<div style="text-align: center;">
  <img src="./assets/f12-remote-address.png" alt="通过开发者工具查询 IP 地址" style="width: 640px;">
  <p style="text-align: center; color: #888;">（通过开发者工具查询 IP 地址）</p>
</div>

不过因为 DNS 解析的关系，你很可能下次重连就不是这个 IP 了，所以每次都应该重新确认一下这个信息。

这个技巧，在排查公网的访问问题的时候特别有用。因为现在流量大一点的网站都已经上了 CDN，那就必然在全国乃至全球各地，有少则数十个、多则数百个 CDN 终端节点，在给访问者提供就近的服务。如果有人说他访问不了某个站点了，那么请他用开发者工具，找到他连的远程 IP，然后你再根据这个信息展开排查工作，会节省很多排查时间。

### 辅助排查网页慢的问题

访问页面感觉很慢，那么可以借助开发者工具的时间统计功能，找到耗时较高的 HTTP 资源对象，再针对性排查。比如访问百度很慢（这里我手动调节了模拟网速为 Slow 3G），那么可以先打开开发者工具，然后访问站点，等全部加载完成后，到「Network」页查看这些 HTTP 对象的加载时间。

<div style="text-align: center;">
  <img src="./assets/f12-network-time.png" alt="通过开发者工具查询资源加载时间" style="width: 640px;">
  <p style="text-align: center; color: #888;">（通过开发者工具查询资源加载时间）</p>
</div>

不过，这个办法只能排查到是哪个资源对象耗时比较长，但更进一步的排查，比如「为什么这个对象的加载时间比别的对象长」这个问题，开发者工具就难以回答了。关于这个问题，需要用到抓包分析来根本性地排查这类问题。

### 解决失效 Cookie 带来的问题

有时候我们的 Cookie 过期了，导致无法正常登录站点，那么可以打开开发者工具，到 Application 页，找到「Storage」->「Cookie」，把对应的条目清除。这样下次你再访问这个站点时，对站点来说，你就是一次新的访问，可以生成一次新的 Cookie 了。

当然，你通过删除浏览器缓存的方式，也是可以做到这一点的。但开发者工具的优点是，可以**细粒度**到这个网站级别，而删除缓存的方式，删除的就是所有站点的 Cookie 了。

## 表示层和会话层

表示层和会话层的协议并不多，TLS 可以归入这两个层级。为了对 TLS 的问题进行排查，可以使用两种工具。

**第一种，还是基于浏览器做初步的检查，主要是围绕证书本身做检查**。在浏览器的地址栏那里，有一个按钮，点开后就可以查看 TLS 证书等信息：

<div style="text-align: center;">
  <img src="./assets/check-certificate.png" alt="通过浏览器检查证书" style="width: 460px;">
  <p style="text-align: center; color: #888;">（通过浏览器检查证书）</p>
</div>

在上面的菜单中，继续点开「连接是安全的」按钮，进而点击「证书有效」按钮，就能查看证书了。

另外，使用开发者工具的「Security」菜单（如果找不到，就从「More tools 里面打开这个菜单」），还可以查看更为详细的 TLS 信息，包括协议版本、密钥交换算法、证书有效期等等。

<div style="text-align: center;">
  <img src="./assets/f12-check-tls.png" alt="通过开发者工具查询 TLS 信息" style="width: 740px;">
  <p style="text-align: center; color: #888;">（通过开发者工具查询 TLS 信息）</p>
</div>

**第二种，关于 TLS 握手、密钥交换、密文传输等方面的排查，还是需要用 tcpdump 和 Wireshark 来做**。在 Wireshark 中，可以更加全面地查看 TLS 细节。

比如，我们可以直接看到 TLS 握手阶段里，双方协商**过程中**各自展示的 Cipher suite，而在开发者工具里，我们只能看到协商**完成后**的选择。

```bash
# 先开一个 shell 窗口
tcpdump -i eth0 tcp and port 443 -w baidu.pcap

# 再开一个 shell 窗口
curl --interface eth0 https://www.baidu.com
```

<div style="text-align: center;">
  <img src="./assets/baidu-tls-packet.png" alt="访问百度的 TLS 握手阶段报文" style="width: 740px;">
  <p style="text-align: center; color: #888;">（访问百度的 TLS 握手阶段报文）</p>
</div>

## 传输层

传输层毫无疑问是重中之重，工具也很多。接下来就按排查场景来介绍工具。

### 路径可达性测试

如果要测试 TCP 握手，我们可以使用 **telnet**、**nc** 这两个常规工具。

使用 telnet：

```bash
[root@study ~]# telnet www.baidu.com 443
Trying 112.80.248.76...
Connected to www.baidu.com.
Escape character is '^]'.

```

::: tip 小贴士
我发现我的那台 CentOS 学习机器没有安装 telnet 命令，可以执行如下命令安装：

```bash
yum list telnet*           # 列出 telnet 相关的安装包
yum install telnet-server  # 安装 telnet 服务
yum install telnet.*       # 安装 telnet 客户端
```
:::

使用 nc：

```bash
[root@study ~]# nc -w 2 -zv www.baidu.com 443
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to 180.101.49.11:443.
Ncat: 0 bytes sent, 0 bytes received in 0.02 seconds.
```

::: tip 小贴士
同样，我的那台 CentOS 学习机器也没有安装 nc 命令，可以执行如下命令安装：

```bash
yum install nc
```

常用参数：
* `-l`：用于指定 nc 将处于侦听模式。指定该参数，则意味着 nc 被当作 server，侦听并接受连接，而非向其它地址发起连接。
* `-p <port>`：暂未用到（老版本的 nc 可能需要在端口号前加 -p 参数，当前测试环境未用到这个参数）。
* `-s`：指定发送数据的源 IP 地址，适用于多网卡机。
* `-u`：指定 nc 使用 UDP 协议，默认为 TCP。
* `-v`：输出交互或出错信息，新手调试时尤为有用。
* `-w`：超时秒数，后面跟数字。
* `-z`：表示 zero，表示扫描时不发送任何数据。
:::

### 查看当前连接状况

**netstat** 命令是一个经典命令了，很多时候都会使用它来获取当前的 TCP、UDP 等的连接信息，比如显示 TCP 传输协议的连线状况：

```bash
[root@study ~]# netstat -ant
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:25            0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:6379          0.0.0.0:*               LISTEN     
tcp        0      0 10.0.16.7:56676         169.254.0.55:5574       ESTABLISHED
```

### 查看当前连接的传输速率

