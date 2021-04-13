window.onload = function() {
  function webLocation() {
    // 判断浏览器的首选语言
    let protocol = 'https://'
    let cnDomain = 'fedbook.gitee.io'
    let language = navigator.language
    let host = window.location.host
    let urlRelativePath = getUrlRelativePath()
    if (language === 'zh-CN') {
      if (host !== cnDomain) {
        swal('提示', '建议大陆用户访问部署在国内的站点，是否跳转？', {
          buttons: ['取消', '确定'],
        }).then(value => {
          if (value) {
            location.href = protocol + cnDomain + urlRelativePath
          }
        })
      }
    }
  }

  function getUrlRelativePath() {
    let url = window.location.href.toString()
    let arrUrl = url.split('//')
    let start = arrUrl[1].indexOf('/')
    let relUrl = arrUrl[1].substring(start) //stop省略，截取从start开始到结尾的所有字符
    if (relUrl.indexOf('?') !== -1) {
      relUrl = relUrl.split('?')[0]
    }
    return relUrl
  }

  function init() {
    // console.clear(); // clear theme bug errors
    console.log('%cWelcome', 'color:#0a0;font-size:5em')
    console.log("%c任何高超的技术，初看都与魔法无异", "color:#3fa9f5;line-height:28px;font-size:16px;");
    console.log("%c欢迎通过 GitHub Issue 交流心得：%chttps://github.com/wenyuan/fedbook/issues","color:#3fa9f5;line-height:28px;font-size:16px;","color:#3fa9f5;line-height:28px;font-size:16px;");
  }

  function addCommentLink() {
    let tagStr = `
    <div class="comment-link">
      <a href="https://github.com/wenyuan/fedbook/issues/new?title=【讨论】此处填写文章标题&body=-%20文章标题：%0A-%20文章链接：%0A-%20我的疑问/观点：%0A-%20推荐资料：" target="_blank" rel="noopener noreferrer">写评论！</a>
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" x="0px" y="0px" viewBox="0 0 100 100" width="15" height="15" class="icon outbound"><path fill="currentColor" d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"></path> <polygon fill="currentColor" points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"></polygon></svg>
      </div>
    `
    let pageEdit = document.querySelector('footer.page-edit')
    if (pageEdit) {
      pageEdit.insertAdjacentHTML('afterbegin', tagStr)
    }
  }

  webLocation()
  init()
}
