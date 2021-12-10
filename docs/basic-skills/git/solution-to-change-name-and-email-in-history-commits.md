# 如何修改历史 commits 中的用户名和邮箱

## 问题描述

出于某些需求，想要：

* 修改某个仓库历史 commit 的用户 name 和 email 信息。
* 将历史提交记录中的指定 name/email 修改为新的 name/email。

## 解决方案

主要分为四个步骤：

* 确认本地全局邮箱/用户名
* 查看仓库的历史提交信息
* 批量修改历史记录中的信息
* 将修改结果推送到远程

### 确认本地全局邮箱/用户名

使用下面两个命令查看 Git 在本地的全局邮箱和用户名：

```bash
git config user.name
git config user.email
```

如果需要修改 Git 在本地的全局邮箱和用户名，执行下面的命令：

```bash
git config --global user.name "输入你的用户名"
git config --global user.email "输入你的邮箱"
```

现在我们已经设置好了本地 Git 的 `user.name` 和 `user.email` 信息。

### 查看仓库的历史提交信息

进入目标仓库目录，打开 git bash 界面，执行以下命令查看历史提交信息（重点关注 Author）：

```bash
git log
```

### 批量修改历史记录中的信息

打开一个文本编辑器，粘贴下面代码。

主要需要把 `OLD_EMAIL`，`CORRECT_NAME`，`CORRECT_EMAIL` 改成自己的新旧邮箱和新用户名。

```bash
git filter-branch -f --env-filter '
OLD_EMAIL="原来的邮箱"
CORRECT_NAME="现在的名字"
CORRECT_EMAIL="现在的邮箱"
if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

回到 git bash 界面，复制粘贴上面的代码并按回车执行。

如果 commit 记录比较多的话执行的时间会比较长。

等待执行完成后，再查看 `git log` 可以看到已经修改成功。

::: warning
如果上面的批量修改命令执行失败的话，执行一下这段命令：
```bash
git filter-branch -f --index-filter 'git rm --cached --ignore-unmatch Rakefile' HEAD
```
再次复制粘贴批量修改的代码并按回车执行。
:::

### 将修改结果推送到远程

这时候虽然本地修改成功了，但是你还没有推送到远程。

所以再执行一下命令：

```bash
git push origin --force --all
```

去看一下 Github 你就会发现之前的提交记录中，name 和 email 信息都更新了。

## Linux/Mac下可以写个脚本

在项目根目录下创建 `git-email.sh`，写入下面这段代码：

```bash
#!/bin/sh

git filter-branch --env-filter '

OLD_EMAIL="原来的邮箱"
CORRECT_NAME="现在的名字"
CORRECT_EMAIL="现在的邮箱"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

然后需要赋予执行权限：

```bash
chmod +x git-email.sh
```

执行一下这个 `.sh` 文件：

```bash
./git-email.sh
```

`git log` 检查修改成功后，就可以推送到远程仓库了。

（完）
