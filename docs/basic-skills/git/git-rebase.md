# git rebase 的两种用法

## 前言

rebase 在 Git 中是一个非常有魅力的命令，使用得当会极大提高自己的工作效率；相反，如果乱用会给团队中其他人带来麻烦。

它的作用简要概括为：可以对某一段线性提交历史进行编辑、删除、复制、粘贴；因此，合理使用 rebase 命令可以使我们的提交历史干净、简洁。

## 用法一: 合并当前分支的多个 commit 记录

有时候会遇到对同一处代码进行多次处理的场景。这会导致如下提交记录：

```bash
$ git log --pretty=format:'%h: %s'
ad3593c: feat: modify c
21511a4: feat: modify b
a7b8f93: feat: modify b
89ab26f: feat: modify b
5f5d89a: feat: modify a
7092a92: Initial commit
```

其实，中间的对 b 的 3 次提交 完全可以合并成一次 commit，这个时候 rebase 就很有用了。

### 1. 执行 rebase -i 命令

找到想要合并的 commit，使用 rebase -i：

```bash
git rebase -i 5f5d89a
```

**注意**：

* `git rebase -i [startPoint] [endPoint]`
* 前开后闭区间，这里的 `[startPoint]` 指目标 commit 的前一个 commit（即上述示例中的 `5f5d89a: feat: modify a`)。 因为三个 commit 肯定要基于上一个 commit 来合并成新的 commit。
* **谨慎使用 `[endPoint]`**，省略即默认表示从起始 commit 一直到最后一个，但是一旦填写了，则表示 `[endPoint]` 后面的 commit 全部不要了。

### 2. 进入 Interact 交互界面

终端会进入选择交互界面，让你进行变基选择操作：

<div style="text-align: center;">
  <img src="./assets/git-rebase-interact.png" alt="git rebase 交互界面">
  <p style="text-align:center; color: #888;">（git rebase 交互界面）</p>
</div>

**说明**：

* 最上面三行，就是刚刚选中的三个 commit，按时间顺序依次往下排序(**和 git log 的展示顺序是反的**，查看的时候需要注意)
* 前面的三个 pick 就是下面 Commands 展示的一系列命令中的第一个 p，也就是使用 commit。
  * pick：保留该 commit（缩写：p）
  * reword：保留该 commit，但我需要修改该 commit 的注释（缩写：r）
  * edit：保留该 commit，但我要停下来修改该提交（不仅仅修改注释）（缩写：e）
  * squash：将该 commit 和前一个 commit 合并（缩写：s）
  * fixup：将该 commit 和前一个 commit 合并，但我不要保留该提交的注释信息（缩写：f）
  * exec：执行 shell 命令（缩写：x）
  * drop：丢弃该 commit（缩写：d）

### 3. 使用 s 命令合并 commit

使用 s 命令，合并到上一个commit（编辑时就跟操作 vim 一样）：

* 按 `i` 进入操作，将**第二、三个 commit 的 pick 改成 s**。
* 按 `Esc` 退出操作。
* 输入 `:wq` 保存并退出。

<div style="text-align: center;">
  <img src="./assets/git-rebase-interact-squash.png" alt="使用 s 命令合并 commit">
  <p style="text-align:center; color: #888;">（使用 s 命令合并 commit）</p>
</div>

### 4. 修改 commit 记录

接下来会弹出第二个页面，分别展示三个 commit 的提交信息：

<div style="text-align: center;">
  <img src="./assets/git-rebase-interact-commit-list.png" alt="相关的 commit 信息列表">
  <p style="text-align:center; color: #888;">（相关的 commit 信息列表）</p>
</div>

在这次的示例中，三个 commit 信息都是一样的。选用第一个的提交信息（也可以编辑下），将其余的全部注释掉，重复上述步骤，保存退出即可。

<div style="text-align: center;">
  <img src="./assets/git-rebase-interact-modify-commit-info.png" alt="编辑提交信息">
  <p style="text-align:center; color: #888;">（编辑提交信息）</p>
</div>

### 5. 查看最新合并情况

查看最新合并情况，会发现原来三个一样的提交现在合并成了一个新的 commit。

<div style="text-align: center;">
  <img src="./assets/git-rebase-result.png" alt="commit 合并前后对比">
  <p style="text-align:center; color: #888;">（commit 合并前后对比）</p>
</div>



