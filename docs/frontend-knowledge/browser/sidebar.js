module.exports = [
  {
    title: '浏览器工作原理',
    collapsable: false,
    children: [
      {
        title: '浏览器宏观认识',
        path: '/frontend-knowledge/browser/browser-macro-knowledge'
      },
      {
        title: '浏览器内核与 JavaScript 引擎',
        path: '/frontend-knowledge/browser/kernel-and-javascript-engine'
      },
      {
        title: '渲染引擎的工作原理',
        path: '/frontend-knowledge/browser/execution-details-of-rendering-process'
      },
      {
        title: 'V8 引擎的工作原理',
        path: '/frontend-knowledge/browser/execution-details-of-v8-engine'
      }
    ]
  },
  {
    title: '浏览器安全',
    collapsable: false,
    children: [
      {
        title: '同源策略',
        path: '/frontend-knowledge/browser/same-origin-policy'
      },
      {
        title: '跨站脚本攻击（XSS）',
        path: '/frontend-knowledge/browser/xss'
      },
      {
        title: 'CSRF 攻击',
        path: '/frontend-knowledge/browser/csrf'
      },
      {
        title: '网络安全协议（HTTPS）',
        path: '/frontend-knowledge/browser/https'
      },
    ]
  },
  {
    title: '浏览器性能',
    collapsable: false,
    children: [
      {
        title: '浏览器缓存机制',
        path: '/frontend-knowledge/browser/browser-caching-mechanism'
      }
    ]
  }
]
