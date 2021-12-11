# 刚刚 commit，发现漏提交了文件

## 问题描述

已经 `commit` 但还未 `push` 时，发现遗漏了部分文件没有提交。

## 解决方案

有两种解决方案：

### 方案一：再次 commit

```bash
git commit -m "commit info"
```

此时，Git 上会出现两次 `commit`。

### 方案二：将遗漏文件提交到之前 commit 上

```bash
git add [missed-file]  # missed-file 为遗漏提交的文件
git commit --amend --no-edit
```

`--no-edit` 表示提交消息不会更改，该操作会修改上一次提交的内容，但不会要求你编辑提交信息，仍保持上一次 `commit` 的 message。

（完）
