# 常用命令清单

## 本地配置

Git 的配置文件为 `.gitconfig`，它可以在用户主目录下（全局配置），也可以在项目目录下（项目配置）。

下面只整理常用的 Git 配置操作：

```bash
# 查看全局配置列表
git config --global -l
# 查看局部配置列表
git config --local -l

# 查看已设置的全局用户名/邮箱
git config --global --get user.name
git config --global --get user.email

# 设置全局用户名/邮箱
git config --global user.name "输入你的用户名"
git config --global user.email "输入你的邮箱"

# 设置本地当前工作区仓库用户名/邮箱
git config --local user.name "输入你的用户名"
git config --local user.email "输入你的邮箱"

# 删除配置
git config --unset --global user.name
git config --unset --global user.email

# 文件权限的变动也会视为改动, 可通过以下配置忽略文件权限变动
git config core.fileMode false

# 文件大小写设为敏感, git 默认是忽略大小写
git config --global core.ignorecase false

# 提交时转换成 unix 风格的换行符, 检出时不转换(看各人习惯设置)
git config --global core.autocrlf input
```

## 初始化仓库

在 GitHub 上手动创建一个仓库，一般创建完的仓库会包括一个 `README.md` 文件。

将远程仓库克隆到本地：

```bash
# https 协议
git clone https://github.com/[your-github-id]/[repo-name].git

# 或 SSH 协议(一般不用)
git clone git@github.com:[your-github-id]/[repo-name].git
```

## 增加/删除文件

以下命令默认在本地克隆下来的仓库目录下执行：

```bash
# 添加指定文件到暂存区
git add [file1] [file2] ...

# 添加指定目录到暂存区, 包括子目录
git add [dir]

# 添加当前目录的所有文件到暂存区
git add .

# 添加每个变化前, 都会要求确认
# 对于同一个文件的多处变化, 可以实现分次提交
git add -p

# 删除工作区文件，并且将这次删除放入暂存区
git rm [file1] [file2] ...

# 停止追踪指定文件，但该文件会保留在工作区
git rm --cached [file]

# 改名文件，并且将这个改名放入暂存区
# 实际上是新建一个相同的文件, 删除旧文件, 然后将新旧文件都放入暂存区
git mv [file-original] [file-renamed]
```

## 代码提交

这个过程一般用可视化工具进行，因为可以很方便的核对每个文件的改动，不过命令行操作也要了解，如需要修改上一次的 commit 信息，就可以通过命令行快速搞定。

```bash
# 提交暂存区到仓库区
git commit -m [message]

# 提交暂存区的指定文件到仓库区
git commit [file1] [file2] ... -m [message]

# 提交工作区自上次 commit 之后的变化, 直接到仓库区
git commit -a

# 提交时显示所有 diff 信息
git commit -v

# 使用一次新的 commit, 替代上一次提交
# 如果代码没有任何新变化, 则用来改写上一次 commit 的提交信息
git commit --amend -m [message]

# 重做上一次 commit, 并包括指定文件的新变化
git commit --amend [file1] [file2] ...
```

## 分支操作

```bash
# 列出所有本地分支
git branch

# 列出所有远程分支
git branch -r

# 列出所有本地分支和远程分支
git branch -a

# 新建一个分支, 但依然停留在当前分支
git branch [branch-name]

# 新建一个分支, 并切换到该分支
git checkout -b [branch-name]

# 新建一个分支, 指向指定 commit
git branch [branch-name] [commit-id]

# 新建一个分支, 与指定的远程分支建立追踪关系
git branch --track [branch-name] [remote-branch-name]

# 切换到指定分支, 并更新工作区
git checkout [branch-name]

# 切换到上一个分支
git checkout -

# 建立追踪关系, 在现有分支与指定的远程分支之间
git branch --set-upstream [branch-name] [remote-branch-name]

# 合并指定分支到当前分支
git merge [branch-name]

# 从其它分支上挑选一个指定 commit, 合并进当前分支
git cherry-pick [commit-id]

# 保留原有作者信息进行合并
git cherry-pick -x [commit-id]

# 删除分支
git branch -d [branch-name]

# 删除远程分支
git push origin --delete [branch-name]
git branch -dr [remote/branch]
```

## 标签操作

```bash
# 列出所有 tag
git tag

# 新建一个 tag 在当前 commit
git tag [tag-name]

# 新建一个 tag 在指定 commit
git tag [tag-name] [commit-id]

# 删除本地 tag
git tag -d [tag-name]

# 删除远程 tag
git push origin :refs/tags/[tag-name]

# 查看 tag 信息
git show [tag-name]

# 提交指定 tag
git push [remote-repo-name, 默认是 origin] [tag-name]

# 提交所有 tag
git push [remote-repo-name, 默认是 origin] --tags

# 新建一个分支, 指向某个 tag
git checkout -b [branch-name] [tag-name]
```

## 查看信息

查看日志是经常用的命令，而查看文件 diff 的功能我更倾向于用可视化工具，因为比对起来更加直观。

```bash
# 显示有变更的文件
git status

# 显示当前分支的版本历史
git log

# 查看指定作者历史记录
git log --author=[author-name]

# 只显示合并日志
git log --merges

# 以图形查看日志记录, --oneline 可选, 表示输出概要日志
git log --graph --oneline

# 显示 commit 历史, 以及每次 commit 发生变更的文件
git log --stat

# 搜索提交历史, 根据关键词
git log -S [keyword]

# 显示某个 commit 之后的所有变动, 每个 commit 占据一行
git log [tag] HEAD --pretty=format:%s

# 显示某个 commit 之后的所有变动, 其"提交说明"必须符合搜索条件
git log [tag] HEAD --grep feature

# 显示某个文件的版本历史, 包括文件改名
git log --follow [file]
git whatchanged [file]

# 显示指定文件相关的每一次 diff
git log -p [file]

# 显示过去 5 次提交
git log -5 --pretty --oneline

# 显示所有提交过的用户, 按提交次数排序
git shortlog -sn

# 显示指定文件是什么人在什么时间修改过
git blame [file]

# 显示暂存区和工作区的差异
git diff

# 显示暂存区和上一个 commit 的差异
git diff --cached [file]

# 显示工作区与当前分支最新 commit 之间的差异
git diff HEAD

# 显示两次提交之间的差异
git diff [first-branch]...[second-branch]

# 显示今天你写了多少行代码
git diff --shortstat "@{0 day ago}"

# 显示某次提交的元数据和内容变化
git show [commit]

# 显示某次提交发生变化的文件
git show --name-only [commit]

# 显示某次提交时, 某个文件的内容
git show [commit]:[filename]

# 显示当前分支的最近几次提交
git reflog
```

## 远程同步

```bash
# 下载远程仓库的所有变动
git fetch [remote]

# 显示所有远程仓库
git remote -v

# 显示某个远程仓库的信息
git remote show [remote]

# 增加一个新的远程仓库, 并命名
git remote add [shortname] [url]

# 取回远程仓库的变化, 并与本地分支合并
git pull [remote] [branch]

# 上传本地指定分支到远程仓库
git push [remote] [branch]

# 强行推送当前分支到远程仓库, 即使有冲突
git push [remote] --force

# 推送所有分支到远程仓库
git push [remote] --all
```

## 文件临存

有一种场景，在当前分支开发时，临时需要切换到其他分支修改 Bug，但此时又不想提交当前分支上开发到一半的代码（切换分支必须把当前工作内容提交，否则无法切换），这个时候就可以用到 `git stash` 将代码临时储藏起来。

强烈建议给每个 stash 添加描述信息！！！

```bash
# 暂存当前工作区内容
git stash

# 暂存时添加描述信息, 推荐使用此命令
git stash push -m "更改了 xx"

# 暂存包含没有被 Git 追踪的文件
git stash -u

# 查看当前暂存列表
git stash list

# 恢复修改工作区内容, 会从 git stash list 移除掉
git stash pop           # 恢复最近一次保存内容到工作区, 默认会把暂存区的改动恢复到工作区
git stash pop stash@{1} # 恢复指定 id, 通过 git stash list 可查到

# 与 pop 命令一致, 唯一不同的是不会从 git stash list 移除掉
git stash apply

# 清空所有保存(慎用)
git stash clear

# 清空指定 stash id, 如果 drop 后面不指定 id 则清除最近的一次
git stash drop stash@{0}
git stash drop  # 清除最近一次

# 想看 stash 做了什么改动, 类似简化版的 git diff
git stash show stash@{0}
```

关于 stash 的补充：

::: tip git stash 信息存储到哪了？
项目路径下的 `.git` 文件中存储着版本管理的所有信息，在文件 `.git/log/refs/stash` 中可以看到全部的 stash 记录信息
:::

::: tip 在有新增文件（不是新增代码）时，git stash 并不会储藏新增的文件?
也就是说，没有在 Git 版本控制中的文件，是不能被 `git stash` 存起来的，此时需要先执行下 `git add` 将新增文件加到 Git 版本控制中，然后再 `git stash` 就可以了。
:::

## 撤销操作

```bash
# 恢复暂存区的指定文件到工作区
git checkout [file]

# 恢复某个 commit 的指定文件到暂存区和工作区
git checkout [commit] [file]

# 恢复暂存区的所有文件到工作区
git checkout .

# 重置暂存区的指定文件, 与上一次 commit 保持一致, 但工作区不变
git reset [file]

# 重置暂存区与工作区, 与上一次 commit 保持一致
git reset --hard

# 重置当前分支的指针为指定 commit, 同时重置暂存区, 但工作区不变
git reset [commit]

# 重置当前分支的 HEAD 为指定 commit, 同时重置暂存区和工作区, 与指定 commit 一致
git reset --hard [commit]

# 重置当前 HEAD 为指定 commit，但保持暂存区和工作区不变
git reset --keep [commit]

# 新建一个 commit, 用来撤销指定 commit
# 后者的所有变化都将被前者抵消, 并且应用到当前分支
git revert [commit]

# 暂时将未提交的变化移除, 稍后再移入
git stash
git stash pop
```

（完）
