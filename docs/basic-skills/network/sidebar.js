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
    title: '经典问题',
    collapsable: false,
    children: [
      {
        title: 'Linux 系统是如何收发网络包的？',
        path: '/basic-skills/network/how-os-deal-with-network-packets'
      },
      {
        title: '拔掉网线后，TCP 连接会断开吗？',
        path: '/basic-skills/network/tcp-connection-after-unpluging-network-cable'
      }
    ]
  }
]
