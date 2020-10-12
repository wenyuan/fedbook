const resolve = require("vuepress-theme-hope/resolve");

module.exports = resolve({
    title: '前端修炼小册',
    description: "Wenyuan's Front-End Development Book",
    dest: './dist',
    port: '7777',
    head: [
        ['link', {rel: 'icon', href: '/img/favicon.png'}],
        ["link", { rel: "stylesheet", href: "/css/style.css" }],
        ["script", { charset: "utf-8", src: "https://unpkg.com/sweetalert/dist/sweetalert.min.js" }],
        ["script", { charset: "utf-8", src: "/js/main.js" }]
    ],
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        logo: '/img/logo.png',
        nav: require('./nav.js'),
        sidebar: require('./sidebar.js'),
        sidebarDepth: 2,
        lastUpdated: '上次更新',
        searchMaxSuggestoins: 10,
        editLinks: false,
        editLinkText: '在 GitHub 上编辑此页 ！',
        smoothScroll: true,
        // vuepress-theme-hope params
        baseLang: 'zh-CN',
        author: 'wenyuan',
        themeColor: false,
        blog: false,
        pwa: false,
        pageInfo: false,
        seo: false,
        sitemap: false,
        comment: false,
        copyright: false,
        breadcrumb: false
    },
    plugins: ['demo-block']
});