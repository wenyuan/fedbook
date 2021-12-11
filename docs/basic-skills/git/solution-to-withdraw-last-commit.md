# 刚刚的 commit 有误，想要撤回

## 问题描述

出于某种原因，发现刚才的一次 `commit` 是错的，需要回退到上一个 `commit` 版本，进行修复后再重新 `commit`。

这里可以用到的有两个命令：`git reset` 和 `git revert`，它们的区别还挺大的。

## 解决方案

### 方案一：git reset

直接删除指定的 commit。

代码回滚中这个命令用的很多，而且是 `--hard` 用的比较多：

`--hard`：硬性回滚，简单粗暴，直接抛弃上次提交后的所有本次修改，回滚到之前的样子。  
`--soft`：软性回滚，可以理解为撤销指定的 commit 记录。

```bash
# 修改版本库, 保留暂存区, 保留工作区
# 软回退表示将本地版本库的头指针全部重置到指定版本, 且将这次提交之后的所有变更都移动到暂存区
# 将版本库软回退一个版本
git reset --soft HEAD~1 # 或 git reset --soft HEAD^
# 将版本库软回退 N 个版本
git reset --soft HEAD~N

# 修改版本库, 修改暂存区, 修改工作区
# 不仅仅是将本地版本库的头指针全部重置到指定版本, 也会重置暂存区, 并且会将工作区代码也回退到这个版本
# 将版本库回退一个版本
git reset --hard HEAD^
# 将版本库回退两个版本
git reset --hard HEAD^^
# 将版本库回退到特定的 commit-id 版本, 可以通过 git log 查看每次 commit 对应的 ID
git reset --hard [commit-id] 
```

如果需要撤销已经 `push` 到远端的 `commit`，使远端的仓库也回退到相应的版本，需要在 `push` 时加上参数 `--force`：

```bash
git push origin [branch-name] --force
```

### 方案二：git revert

撤销某次操作，此次操作之前和之后的 commit 和 history 都会保留，并且把这次撤销作为一次最新的提交。

```bash
# 撤销前一次 commit
git revert HEAD

#  撤销前前一次 commit
git revert HEAD^

# 撤销指定的版本，撤销动作本身也会作为一次提交进行保存
git revert [commit-id]
```

`git revert` 是提交一个新的版本，将需要 revert 的版本的内容作为一次新的 `commit` 再反向修改回去，版本会递增，不影响之前提交的内容。

## 区别：revert 和 reset

* `git revert` 是用一次新的 commit 来回滚之前的 commit，`git reset` 是直接删除指定的 commit。
* 在回滚这一操作上看，效果差不多。但是在日后继续 merge 以前的老版本时有区别。因为 `git revert` 是用一次逆向的 commit「中和」之前的提交，因此日后合并老的 branch 时，导致这部分改变不会再次出现，但是 `git reset` 是直接把某些 commit 在某个 branch 上删除，因而和老的 branch 再次 merge 时，这些被回滚的 commit 应该还会被引入。
* `git reset` 是把 HEAD 向后移动了一下，而 `git revert` 是 HEAD 继续前进，只是新的 commit 的内容和要 revert 的内容正好相反，能够抵消要被 revert 的内容。

## 总结

* 使用 reset 回退版本后，需要其他所有人手动用远程 master 分支覆盖本地 master 分支。显然，这不是优雅的回退方法。
* 使用 revert 撤销某次提交后，它会产生一个新的提交，虽然代码回退了，但是版本依然是向前的。所以当你用这种方式回退之后，其他人 pull 完，他们的代码也自动的回退了。

相对之下，`git revert` 更加优雅。但是，要注意以下几点：

* revert 是撤销一次提交，所以后面的 commit-id 是你想要抵达的版本的后一次提交。
* 使用 `revert HEAD` 是撤销最近的一次提交，如果你最近一次提交是用 revert 命令产生的，那么你再执行一次，就相当于撤销了上次的撤销操作，换句话说，你连续执行两次 `revert HEAD` 命令，就跟没执行是一样的。
* 使用 `revert HEAD~1` 表示撤销最近 2 次提交，这个数字是从 0 开始的，如果你之前撤销过产生了 commit-id，那么也会计算在内的；
* 如果使用 revert 撤销的不是最近一次提交，那么一定会有代码冲突，需要你合并代码，合并代码只需要把当前的代码全部去掉，保留之前版本的代码就可以了。

`git revert` 命令的好处就是不会丢掉别人的提交，即使你撤销后覆盖了别人的提交，他更新代码后，可以在本地用 reset 向前回滚，找到自己的代码，然后拉一下分支，再回来合并上去就可以找回被你覆盖的提交了。

（完）
