# 子网掩码、网络地址和广播地址

## IP 地址

IP 地址用于在网络中标识设备，包括计算机、路由器和交换机、打印机和扫描仪等等。

+ IPv4 地址：
  + 由 32 位二进制数组成。
  + 通常被分为 4 组，每组 8 位。一般被写成点分十进制的形式表示，每组的值范围是 0-255。例如 `192.168.1.1`。
+ IPv6 地址
  + 由 128 位二进制数组成，因此可以提供更多的地址空间，支持更多的设备连接到互联网。
  + 通常被写成 8 组，每组为 4 个十六进制数的形式。例如 `AD70:0000:0000:0000:CBAA:0000:00C1:0002`。

下面的内容暂时先只考虑 IPv4 的情况。

## 子网掩码

### 概念

IP 地址由网络号和主机号组成，根据子网掩码的不同，可以将一个 IP 地址划分为网络地址和主机地址。

+ **网络地址**
  + 网络地址是指仅包含网络号而不包含主机号的 IP 地址，它用于唯一标识一个网络。
  + 在网络通信中，网络地址用于路由和寻址。
  + 例如，一个 IP 地址为 `192.168.0.0`，IP 掩码为 `255.255.255.0`，那么它的网络地址就是 `192.168.0.0`。
+ **广播地址**
  + 广播地址是指在特定网络上发送广播消息的地址。它用于向网络上的所有设备发送信息。
  + 广播地址通常是某个网络的最大可能地址，将主机号部分全部设置为 1。
  + 例如，在 IP 地址为 `192.168.0.0`，子网掩码为 `255.255.255.0` 的情况下，广播地址就是 `192.168.0.255`。
+ **主机地址**
  + 主机地址是指除网络地址和广播地址之外的IP地址部分。它用于标识一个特定的主机或设备。
  + 主机地址可以是网络中的任意一个有效地址。
  + 例如，在 IP 地址为 `192.168.0.0`，子网掩码为 `255.255.255.0` 的情况下，可以有从 `192.168.0.1` 到 `192.168.0.254` 的主机地址。

### 如何根据 IP 地址和掩码确定网络地址和主机地址

以最常见的一个子网掩码 `255.255.255.0` 为例，它的二进制形式是 `11111111.11111111.11111111.00000000`。

+ 前 24 位全是 `1`，代表与此相对应的 IP 地址左边 24 位是网络号。
+ 后 8 位全是 `0`，代表与此相对应的 IP 地址右边 8 位是主机号。

这样，子网掩码就确定了一个 IP 地址的 32 位二进制数字中哪些是网络号、哪些是主机号。

子网掩码 `255.255.255.0` 常用于小型网络，因为它允许最多拥有 254 个可用主机地址（`2^8 - 2`）。减去 2 的原因是，一个地址（全 `0`）用作子网地址，另一个地址（全 `1`）用作广播地址。

值得注意的是，在点分十进制表示法中，子网掩码每一位的值可以是 0-255 的任何值，但这一位的左边就必须全是 255。用二进制来解释就是，所有的 `1` 都在左边，所有的 `0` 都在右边。

例如子网掩码 `255.255.255.128` 的二进制形式是 `11111111.11111111.11111111.10000000`，这表示前 25 位（所有的 `1`）是网络位，后 7 位（所有的 `0`）是主机位。

这意味着，这个网络的 IP 地址数是 `2^7=128`，也就是这个网络最多只有 126 台主机（实际可用的主机地址数需要减去 2）。

因此，子网掩码 `255.255.255.128` 表示的是一个网络可以有 128 个 IP 地址，其中 126 个可以分配给主机。

## 广播地址和网络地址

### 广播地址

广播地址在 IP 地址中用于向同一网络内的所有设备发送消息或数据包。它是一个特殊的地址，使得发送到该地址的数据包将被网络上的所有设备接收。

广播通常用于一些特定的场景，比如局域网中的设备发出某个请求，希望获得同一网络下的所有设备的响应。一个常见的例子是 DHCP（动态主机配置协议）服务器，在启动时会向整个网络广播一个 DHCP 请求，以获取静态 IP 地址分配。同样地，ARP（地址解析协议）也使用广播来查找与给定 IP 地址关联的 MAC 地址。

举个例子，假设你的局域网中有四台计算机，它们的 IP 地址范围是：`192.168.0.1` - `192.168.0.4`，子网掩码为 `255.255.255.0`。如果你想向整个局域网发送一个广播消息，你可以将目标地址设置为 `192.168.0.255`，这是该网络的广播地址。这样，所有四台计算机都能够接收到该消息，并根据需要作出响应。

需要注意的是，广播只会在同一网络中传播，因此不会跨越路由器或互联网边界。所以这仅适用于发送到同一局域网内的设备。

### 网络地址

它是指一个网络的起始地址，用于标识一个特定的网络。网络地址用于路由器将数据包发送到正确的网络。在网络地址中，主机部分全为 0。

例如，假设一个局域网使用 IP 地址范围是 `192.168.0.0` - `192.168.0.255`，其中子网掩码为 `255.255.255.0`。那么网络地址就是 `192.168.0.0`。在该网络中，所有以此开始的 IP 地址都属于同一个网络。

## 示例说明

假设一个公司使用的 IP 地址段是 `192.168.0.0/24`，其中的主机地址范围是从 `192.168.0.1` 到 `192.168.0.254`（共有 254 个主机），子网掩码为 `255.255.255.0`。那么在这个网络中：

+ 网络地址是 `192.168.0.0`，用于表示整个公司内部的网络。
+ 广播地址是 `192.168.0.255`，用于向公司内的所有设备发送广播消息。
+ 主机地址是从 `192.168.0.1` 到 `192.168.0.254`，用于标识公司内每个具体的设备。

在实际应用中，注意以下几点：

+ 网络地址和广播地址不能被分配给具体的设备，否则会导致通信问题。
+ 通常情况下，IP 地址段中的第一个地址（如 `192.168.0.1`）被分配给默认网关，用于连接不同网络之间的通信。
+ IP 地址段中的最后一个地址通常用作保留地址或广播地址。

## 子网划分

现有一个 C 类网络地址段：`192.168.1.0/24`，请使用可变长子网掩码给三个子网分配 IP 地址。第一个子网包含 10 台主机，第二个子网包含 10 台主机，第三个子网包含 30 台主机，应该怎么划分，请详细说明每个子网的网段和可用主机 IP。

给定的 C 类网络地址段是 `192.168.1.0/24`，其中子网掩码为 `255.255.255.0`。我们可以使用可变长子网掩码（VLSM）来划分三个子网并分配 IP 地址。

首先，确定每个子网需要的主机数量和对应的子网掩码位数。

+ 第一个子网需要 10 台主机，对应最小的子网掩码位数为 4（2^4=16，可容纳 16 个 IP 地址）
+ 第二个子网需要 10 台主机，同样对应 4 位子网掩码
+ 第三个子网需要 30 台主机，对应最小的子网掩码位数为 5（2^5=32，可容纳 32 个 IP 地址）

接下来，为每个子网确定子网掩码，并划分对应的网段和可用主机 IP。

+ 第一个子网：
  + 子网掩码：`255.255.255.240`（因为 4 位子网掩码为 `11110000`，转换为十进制就是 `240`）
  + 网段范围：`192.168.1.0` - `192.168.1.15`
  + 可用主机 IP：`192.168.1.1` - `192.168.1.14`（其中 `0` 表示网络地址，`15` 表示广播地址，不能使用）
+ 第二个子网：
  + 子网掩码：`255.255.255.240`（与第一个子网相同）
  + 网段范围：`192.168.1.16` - `192.168.1.31`
  + 可用主机 IP：`192.168.1.17` - `192.168.1.30`
+ 第三个子网：
  + 子网掩码：`255.255.255.224`（因为 5 位子网掩码为 `11100000`，转换为十进制就是 `224`）
  + 网段范围：`192.168.1.32` - `192.168.1.63`
  + 可用主机 IP：`192.168.1.33` - `192.168.1.62`

这样，我们使用可变长子网掩码成功将给定的 C 类网络地址段划分为三个子网，并为每个子网分配了对应的网段和可用主机 IP。
