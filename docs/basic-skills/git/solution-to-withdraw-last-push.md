# 刚刚的 push 有误，想要撤回

## 问题描述

出于某种原因，不小心把错误的或者不完整的代码 commit 并且 push 到了远程，可能会影响到远程上代码的正确性。

Git 提供了撤回远程代码的方法。

## 解决方案

按下面的步骤进行：

* `git log` 查看提交记录，找到**需要撤回到的提交 id**（即有问题的那次提交的上一个 commit）。
* `git reset --soft [commit-id]` 或者 `git reset --hard [commit-id]`，id 为需要回退到的 commit-id。
* `git push origin [本地当前分支名] --force`，强制提交当前版本号

这个时候查看本地和远程的 log，发现有错误的那次记录已经查不到了，表示撤销成功了。

::: warning
--hard 会丢弃本地修改，请谨慎使用。

* --soft 撤销 commit，保留工作区的代码变更，不会撤销 git add
* --mixed 撤销 commit，保留工作区的代码变更，撤销 git add
* --hard 撤销 commit，删除工作区的代码变更，撤销 git add
:::

（完）
