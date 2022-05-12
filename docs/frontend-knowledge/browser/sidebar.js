module.exports = [
  {
    title: '浏览器工作原理',
    collapsable: false,
    children: [
      {
        title: '浏览器宏观认识',
        path: '/frontend-knowledge/browser/browser-macro-knowledge',
        collapsable: true
      },
      {
        title: '浏览器内核与 JavaScript 引擎',
        path: '/frontend-knowledge/browser/kernel-and-javascript-engine',
        collapsable: true
      },
      {
        title: '渲染引擎的工作原理',
        path: '/frontend-knowledge/browser/execution-details-of-rendering-process',
        collapsable: true
      },
      {
        title: 'V8 引擎的工作原理',
        path: '/frontend-knowledge/browser/execution-details-of-v8-engine',
        collapsable: true
      }
    ]
  },
  {
    title: '浏览器安全',
    collapsable: false,
    children: [
      {
        title: '同源策略',
        path: '/frontend-knowledge/browser/same-origin-policy',
        collapsable: true
      },
      {
        title: '跨站脚本攻击（XSS）',
        path: '/frontend-knowledge/browser/xss',
        collapsable: true
      },
      {
        title: 'CSRF 攻击',
        path: '/frontend-knowledge/browser/csrf',
        collapsable: true
      },
    ]
  }
]