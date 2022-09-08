module.exports = [
  {
    title: '网络基础',
    collapsable: false,
    children: [
      {
        title: '网络分层模型',
        path: '/basic-skills/network/layered-network-model'
      },
      {
        title: 'IP 地址',
        path: '/basic-skills/network/ip-address'
      },
      {
        title: 'UDP 协议',
        path: '/basic-skills/network/udp'
      },
      {
        title: 'TCP 协议',
        path: '/basic-skills/network/tcp'
      }
    ]
  },
  {
    title: '网络排查',
    collapsable: false,
    children: [
      {
        title: '抓包与分析',
        path: '/basic-skills/network/tcpdump-and-wireshark'
      },
    ]
  },
  {
    title: '经典问题',
    collapsable: true,
    children: [
      {
        title: 'Linux 系统是如何收发网络包的？',
        path: '/basic-skills/network/how-os-deal-with-network-packets'
      },
      {
        title: '输入 URL 到页面展示，中间发生了什么？',
        path: '/basic-skills/network/what-happens-after-url'
      },
      {
        title: 'TCP 三次握手期间异常，会发生什么？',
        path: '/basic-skills/network/tcp-handshake-exception'
      },
      {
        title: 'TCP 四次挥手期间异常，会发生什么？',
        path: '/basic-skills/network/tcp-wave-exception'
      },
      {
        title: '拔掉网线几秒再插回去，原本的 TCP 连接还在吗？',
        path: '/basic-skills/network/tcp-connection-after-unpluging-network-cable'
      },
      {
        title: '如果已经建立了连接，但是客户端突然出现故障了怎么办？',
        path: '/basic-skills/network/tcp-connection-after-client-break-down'
      },
      {
        title: '如果已经建立了连接，但是服务端的进程崩溃会发生什么？',
        path: '/basic-skills/network/tcp-connection-after-server-break-down'
      },
      {
        title: 'TCP 和 UDP 可以使用同一个端口吗？',
        path: '/basic-skills/network/can-tcp-and-udp-use-the-same-port'
      },
    ]
  }
]
