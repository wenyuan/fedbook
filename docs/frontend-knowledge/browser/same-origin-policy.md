# 同源策略

## 什么是同源策略

如果两个 URL 的**协议**、**域名**和**端口**都相同，我们就称这两个 URL 同源。

而同源策略是基于安全考虑指定的策略，它对两个不同的源之间进行了互相访问的约束。具体表现在：

* DOM 层面：同源策略限制了来自不同源的 JavaScript 脚本对当前 DOM 对象读和写的操作。
* 数据层面：同源策略限制了不同源的站点读取当前站点的 Cookie、IndexDB、LocalStorage 等数据。
* 网络层面：同源策略限制了通过 XMLHttpRequest 等方式将站点的数据发送给不同源的站点。

## 浏览器对同源策略的让步

让不同的源之间绝对隔离是最安全的，但会损失易用性，所以浏览器也做出了一些让步，开放了一些可能会带来攻击的口子（比如 XSS 攻击和 CSRF 攻击）。

### 页面中可以嵌入第三方资源

让所有的资源都部署在同一个源，即同一个服务器上显然是不切实际的，这样会导致 CDN 等功能没法使用了。所以同源策略对页面的引用资源开了一个口子，让其可以任意引用外部文件。

安全隐患：如果恶意程序通过各种途径往 HTML 文件中插入恶意脚本，就会引发安全问题，比如 XSS 攻击。

解决方案：浏览器中引入了内容安全策略，称为 CSP。CSP 的核心思想是让服务器决定浏览器能够加载哪些资源，让服务器决定浏览器是否能够执行内联 JavaScript 代码。通过这些手段就可以大大减少 XSS 攻击。

### 跨域资源共享和跨文档消息机制

默认情况下，在一个页面中通过 XMLHttpRequest 或者 Fetch 来请求非同源网站中的资源，这时同源策略会阻止其发出请求，这样会大大制约我们的生产力。为了解决这个问题，引入了跨域资源共享（CORS），使用该机制可以进行跨域访问控制，从而使跨域数据传输得以安全进行。

同源策略还规定，如果两个页面不是同源的，则无法相互操纵 DOM。不过在实际应用中，经常需要两个不同源的 DOM 之间进行通信，于是浏览器中又引入了跨文档消息机制，可以通过 `window.postMessage` 的 JavaScript 接口来和不同源的 DOM 进行通信。

## 总结

由于同源策略，在非同源的情况下：

* 读取数据和操作 DOM 要用跨文档机制
* 跨域请求要用 CORS 机制
* 引用第三方资源要用 CSP

## 参考资料

* [跨域资源共享 CORS 详解](https://www.ruanyifeng.com/blog/2016/04/cors.html)

（完）
