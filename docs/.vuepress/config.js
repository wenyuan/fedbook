module.exports = {
    title: '闻鸢同学的技能书',
    description: '一个90后程序员，终身学习者',
    dest: './dist',
    port: '7777',
    head: [
        ['link', {rel: 'icon', href: '/img/favicon.png'}],
        ["link", { rel: "stylesheet", href: "/css/style.css" }],
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
        lastUpdated: 'Last Updated',
        searchMaxSuggestoins: 10,
        serviceWorker: {
            updatePopup: {
                message: "有新的内容.",
                buttonText: '更新'
            }
        },
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页 ！',
        smoothScroll: true
    }
}