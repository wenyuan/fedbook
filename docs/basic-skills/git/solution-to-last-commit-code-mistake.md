# 刚刚 commit 的代码，发现写错了

## 问题描述

刚刚 `commit` 了一个代码文件（`test.js`），发现有几个字写错了，此时还未 `push`。

比较粗糙的处理方式是再做一个专门修复这几个错别字的 commit。可以是可以，不过还有一个更加优雅和简单的解决方法。

## 解决方案

使用 `commit -—amend` 命令。

::: tip 命令解释
"amend" 是「修正」的意思。在提交时，如果加上 `--amend` 参数，Git 不会在当前 `commit` 上增加 `commit`，而是会把当前 `commit` 里的内容和暂存区（stageing area）里的内容合并起来后创建一个新的 `commit`，**用这个新的 `commit` 把当前 `commit` 替换掉**。所以 `commit --amend` 做的事就是它的字面意思：对最新一条 `commit` 进行修正。
:::

具体地，对于上面提到的这种小错误，你就可以把文件（`test.js`）中的错别字修改好之后，输入：

```bash
git add test.js
git commit --amend
```

Git 会把你带到提交信息编辑界面。可以看到，提交信息默认是当前提交的提交信息。你可以修改或者保留它，然后保存退出。最后，你的最近一次 commit 就被更新了。

（完）
