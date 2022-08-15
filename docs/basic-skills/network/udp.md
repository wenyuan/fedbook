# UDP 协议

传输层里比较重要的两个协议，一个是 TCP，一个是 UDP。对于从事应用开发的人来讲，最常用的就是这两个协议。

## TCP 和 UDP 的区别

**1. 连接**

* TCP 是面向连接的传输层协议，传输数据前先要通过三次握手来建立连接。
* UDP 是不需要连接，即刻传输数据。

**2. 服务对象**

* TCP 是一对一的两点服务，即一条连接只有两个端点。
* UDP 支持一对一、一对多、多对多的交互通信。

**3. 可靠性**

* TCP 是可靠交付数据的，数据可以无差错、不丢失、不重复、按序到达。
* UDP 继承了 IP 包的特性，尽最大努力交付，不保证不丢失，不保证按顺序到达。

**4. 拥塞控制、流量控制**

* TCP 有拥塞控制和流量控制机制，保证数据传输的安全性。（它意识到包丢弃了或者网络的环境不好了，就会根据情况调整自己的行为，看看是不是发快了，要不要发慢点）
* UDP 则没有，即使网络非常拥堵了，也不会影响 UDP 的发送速率。（应用让我发，我就发）

**5. 首部开销**

* TCP 首部长度较长，会有一定的开销，首部在没有使用「选项」字段时是 20 个字节，如果使用了「选项」字段则会变长的。
* UDP 首部只有 8 个字节，并且是固定不变的，开销较小。

**6. 传输方式**

* TCP 是面向字节流的，发送的时候发的是一个流，没头没尾（IP 包可不是一个流，而是一个个的 IP 包。之所以变成了流，这也是 TCP 自己的状态维护做的事情），但保证顺序和可靠。
* UDP 继承了 IP 的特性，是一个包一个包的发送，一个包一个包的接收，但可能会丢包和乱序。

**7. 分片不同**

* TCP 的数据大小如果大于 MSS 大小，则会在传输层进行分片，目标主机收到后，也同样在传输层组装 TCP 数据包，如果中途丢失了一个分片，只需要传输丢失的这个分片。
* UDP 的数据大小如果大于 MTU 大小，则会在 IP 层进行分片，目标主机收到后，在 IP 层组装完数据，接着再传给传输层。

因而 **TCP 其实是一个有状态服务**，里面精确地记着发送了没有，接收到没有，发送到哪个了，应该接收哪个了，错一点儿都不行。而 **UDP 则是无状态服务**，发出去就发出去了。

::: tip 小贴士
我们可以这样比喻，如果 MAC 层定义了本地局域网的传输行为，IP 层定义了整个网络端到端的传输行为，这两层基本定义了这样的基因：网络传输是以包为单位的，数据链路层叫帧，网络层叫包，传输层叫段。我们笼统地称为包。包单独传输，自行选路，在不同的设备封装解封装，不保证到达。基于这个基因，生下来的孩子 UDP 完全继承了这些特性，几乎没有自己的思想。
:::

## UDP 包头

UDP 包头里面有**源端口号**和**目的端口号**，因为两端通信必须要根据端口号来决定将数据交给相应的应用程序。

然后再没有其他的了，这比 TCP 包头简单很多。

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="550" height="218" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25,25)"><path id="SvgjsPath1009" d="M0 0L247.959918 0L247.959918 39.993999599999995 L0 39.993999599999995Z" stroke="rgba(102, 102, 102,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1010" d="M247.959918 0L500.02 0L500.02 39.993999599999995 L247.959918 39.993999599999995Z" stroke="rgba(102, 102, 102,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1011" d="M0 39.993999599999995L247.959918 39.993999599999995L247.959918 80.00399999999999 L0 80.00399999999999Z" stroke="rgba(102, 102, 102,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1012" d="M247.959918 39.993999599999995L500.02 39.993999599999995L500.02 80.00399999999999 L247.959918 80.00399999999999Z" stroke="rgba(102, 102, 102,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1013"><text id="SvgjsText1014" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="248px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="5.9969997999999975" transform="rotate(0)"><tspan id="SvgjsTspan1015" dy="20" x="124"><tspan id="SvgjsTspan1016" style="text-decoration:;">源端口号（16 位）</tspan></tspan></text></g><g id="SvgjsG1017"><text id="SvgjsText1018" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="253px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="5.9969997999999975" transform="rotate(0)"><tspan id="SvgjsTspan1019" dy="20" x="374.459918"><tspan id="SvgjsTspan1020" style="text-decoration:;">目的端口号（16 位）</tspan></tspan></text></g><g id="SvgjsG1021"><text id="SvgjsText1022" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="248px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="45.99899979999999" transform="rotate(0)"><tspan id="SvgjsTspan1023" dy="20" x="124"><tspan id="SvgjsTspan1024" style="text-decoration:;">UDP 长度（16 位）</tspan></tspan></text></g><g id="SvgjsG1025"><text id="SvgjsText1026" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="253px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="45.99899979999999" transform="rotate(0)"><tspan id="SvgjsTspan1027" dy="20" x="374.459918"><tspan id="SvgjsTspan1028" style="text-decoration:;">UDP 校验和（16 位）</tspan></tspan></text></g></g><g id="SvgjsG1029" transform="translate(25,105)"><path id="SvgjsPath1030" d="M0 0L500.02 0L500.02 88 L0 88Z" stroke="rgba(102, 102, 102,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1031"><text id="SvgjsText1032" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="501px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="30" transform="rotate(0)"><tspan id="SvgjsTspan1033" dy="20" x="250.5"><tspan id="SvgjsTspan1034" style="text-decoration:;">数据</tspan></tspan></text></g></g></svg>
  <p style="text-align: center; color: #888;">（UDP 包头示意图）</p>
</div>

* 目标和源端口：主要是告诉 UDP 协议应该把报文发给哪个进程。
* 包长度：该字段保存了 UDP 首部的长度跟数据的长度之和。
* 校验和：校验和是为了提供可靠的 UDP 首部和数据而设计，防止收到在网络传输中受损的 UDP 包。

## UDP 三大特点

* **沟通简单**：不需要大量的数据结构、处理逻辑、包头字段。
* **轻信他人**：它不会建立连接，虽然有端口号，但是监听在这个地方，谁都可以传给他数据，他也可以传给任何人数据，甚至可以同时传给多个人数据。
* **愣头青，做事不懂权变**：不知道什么时候该坚持，什么时候该退让。它不会根据网络的情况进行发包的拥塞控制，无论网络丢包丢成啥样了，它该怎么发还怎么发。

## UDP 三大使用场景

* 需要资源少，在网络情况比较好的内网，或者对于丢包不敏感的应用。
  * 比如 DHCP 就是基于 UDP 协议的。
* 不需要一对一沟通，建立连接，而是可以广播的应用。
* 需要处理速度快，时延低，可以容忍少数丢包，但是要求即便网络拥塞，也毫不退缩，一往无前的时候。
  * 当前很多应用都是要求低时延的，它们会根据自己的场景实现自己的可靠和连接保证。如果应用自己觉得，有的包丢了没事，就不用重传；有的比较重要，则应用自己重传，而不依赖于 TCP。有的前面的包没到，后面的包到了，那就先给用户展示后面的。

也就是说，如果你实现的应用需要有自己的连接策略，可靠保证，时延要求，使用 UDP，然后再应用层实现这些是再好不过了。

## UDP 在实际生活中的应用 

### 网页或者 APP 的访问

原来访问网页和手机 APP 都是基于 HTTP 协议的。HTTP 协议是基于 TCP 的，建立连接都需要多次交互，对于时延比较大的目前主流的移动互联网来讲，建立一次连接需要的时间会比较长，然而既然是移动中，TCP 可能还会断了重连，也是很耗时的。而且目前的 HTTP 协议，往往采取多个数据通道共享一个连接的情况，这样本来为了加快传输速度，但是 TCP 的严格顺序策略使得哪怕共享通道，前一个不来，后一个和前一个即便没关系，也要等着，时延也会加大。

而 **QUIC**（全称 **Quick UDP Internet Connections，快速 UDP 互联网连接**）是 Google 提出的一种基于 UDP 改进的通信协议，其目的是降低网络通信的延迟，提供更好的用户互动体验。

QUIC 在应用层上，会自己实现快速连接建立、减少重传时延，自适应拥塞控制，是应用层使用 UDP 并添加自己策略的代表。

### 流媒体的协议

现在直播比较火，直播协议多使用 RTMP（这也是一种协议），而这个 RTMP 协议也是基于 TCP 的。TCP 的严格顺序传输要保证前一个收到了，下一个才能确认，如果前一个收不到，下一个就算包已经收到了，在缓存里面，也需要等着。对于直播来讲，这显然是不合适的，因为老的视频帧丢了其实也就丢了，就算再传过来用户也不在意了，他们要看新的了，如果老是没来就等着，卡顿了，新的也看不了，那就会丢失客户，**所以直播，实时性比较比较重要，宁可丢包，也不要卡顿的**。

另外，对于丢包，其实对于视频播放来讲，有的包可以丢，有的包不能丢，因为视频的连续帧里面，有的帧重要，有的不重要，如果必须要丢包，隔几个帧丢一个，其实看视频的人不会感知，但是如果连续丢帧，就会感知了，因而**在网络不好的情况下，应用希望选择性的丢帧**。

### 实时游戏

游戏有一个特点，就是实时性比较高。快一秒你干掉别人，慢一秒你被别人爆头，所以很多职业玩家会买非常专业的鼠标和键盘，争分夺秒。

因而，实时游戏中客户端和服务端要建立长连接，来保证实时传输。但是游戏玩家很多，服务器却不多。由于维护 TCP 连接需要在内核维护一些数据结构，因而一台机器能够支撑的 TCP 连接数目是有限的，然后 UDP 由于是没有连接的，在异步 IO 机制引入之前，常常是应对海量客户端连接的策略。

另外还是 TCP 的强顺序问题，对战的游戏，对网络的要求很简单，玩家通过客户端发送给服务器鼠标和键盘行走的位置，服务器会处理每个用户发送过来的所有场景，处理完再返回给客户端，客户端解析响应，渲染最新的场景展示给玩家。

如果出现一个数据包丢失，所有事情都需要停下来等待这个数据包重发。客户端会出现等待接收数据，然而玩家并不关心过期的数据，激战中卡 1 秒，等能动了都已经死了。

游戏对实时要求较为严格的情况下，采用自定义的可靠 UDP 协议，自定义重传策略，能够把丢包产生的延迟降到最低，尽量减少网络问题对游戏性造成的影响。

### IoT 物联网

一方面，物联网领域终端资源少，很可能只是个内存非常小的嵌入式系统，而维护 TCP 协议代价太大；另一方面，物联网对实时性要求也很高，而 TCP 还是因为上面的那些原因导致时延大。Google 旗下的 Nest 建立 Thread Group，推出了物联网通信协议 Thread，就是基于 UDP 协议的。

### 移动通信领域

在 4G 网络里，移动流量上网的数据面对的协议 GTP-U 是基于 UDP 的。因为移动网络协议比较复杂，而 GTP 协议本身就包含复杂的手机上线下线的通信协议。如果基于 TCP，TCP 的机制就显得非常多余。

（完）
