# 如何使用 GitFlow 工作流进行团队协作

> 以博客项目为例，记录一下应用 GitFlow 工作流进行团队协作的主要步骤和命令。

## 初始化项目

首先创建项目，并创建一个 `develop` 分支, 以后更多操作是在 `develop` 分支上进行的：

```bash
# 创建项目
mkdir blog && cd blog
# 初始化 Git 版本库
git init
# 添加远程版本库
git remote add origin https://github.com/[your-github-id]/blog.git
# 新建 develop 分支并切换
git checkout -b develop

# 初始化项目
echo '# 个人博客' > README.md
# 创建 .gitignore 文件, 用于忽略一些临时文件或自动编译生成文件
touch .gitignore
# ...
git add .
git commit -m "init repo"
# 推送到远程开发分支
git push -u origin develop
```

## 功能开发

我和小明开始独立开发自己的功能。比如，我开发`角色模块`，小明开发`文章模块`。我们都新建自己的功能分支，独立开发、独立测试，互不干扰。

```bash
# (我)克隆版本库
git clone https://github.com/[your-github-id]/blog.git

# (我)切换到 develop 分支
git checkout develop

# (我)创建功能分支, 功能分支是从开发分支分叉出去的
git checkout -b feature/role

# (我)现在可以愉快地开发新功能了
....
# (我)将分支推送到远程版本库
git push origin feature/role
```

## 代码 Review 和合并

现在，我已经完成角色模块，而且基本功能也通过了测试，是时候合并到开发分支了。我发起了 Pull Request，接受群众 Review。项目负责人可以接收 Pull Request 并将分支合并到开发分支。

当然 Pull Request 只是一个可选的步骤，你可以直接将分支合并到开发分支。

## 发布分支

现在角色模块和文章模块都开发完毕了，项目负责人小甲掐指一算，发布新版本吉时已到，假设是 v0.1.0，从开发分支中拉取出一个发布分支：

```bash
# 保持是最新代码
git pull
git checkout develop
git checkout -b release/v0.1.0
git push -u origin release/v0.1.0
```

我们已经开始新的功能了，突然间测试报了个 bug, 我得优先处理这个 bug：

```bash
# 但是(我)在切换分支时报了个错:
git checkout release/v0.1.0
error: Your local changes to the following files would be overwritten by checkout:
  xxx.js
Please commit your changes or stash them before you switch branches.
Aborting
```

意思是，你的本地已经修改了一些文件，如果就这样 `checkout` 过去，将会被覆盖。你可以提交（`commit`）你的变更，或者暂存（`stash`）起来。因为我的代码写到一半，不能将没有意义的代码提交到版本库，所以只能使用后者：

```bash
# 推荐在暂存时添加描述信息,
git stash push -m "更改了 xx"
git checkout release/v0.1.0

# 修复完 bug 回到原来的功能分支
# 恢复暂存
git stash pop
```

## 合并发布分支

发布分支在经过几次迭代之后，稳定性已经足以合并到 master 了：

```bash
# 切换到 master 分支
git checkout master

# 合并分支
git merge release/v0.1.0
# 打个 tag
git tag -a v0.1.0 -m "v0.1.0: 包含了角色模块和文章模块等功能更新"
# 推送版本库
git push
# 推送 tags
git push --tags

# 切换到开发分支
git checkout develop
git merge release/v0.1.0
git push

# 删除发布分支
git branch -d release/v0.1.0
# 删除远程发布分支
git push -d release/v0.1.0
```

## 修复 bug

客户报了一个生产版本的 bug，这 bug 影响使用，我们必须马上修复这个 bug 并发个版：

```bash
# 切换到 master 分支
git checkout master
# 创建 bug 修复分支
git checkout -b bug/B20220212
# 修复 bug 并提交
git commit -m "紧急修复xxxbug"

# 合并到 master
git checkout master
git merge bug/B20220212
git tag -a v0.1.1 -m "紧急修复xxxbug"
git push

# 合并到开发分支, 因为开发分支同样有这个 bug
git checkout develop
git merge bug/B20220212
git push

# 删除 bug 分支
git branch -d bug/B20220212
```

（完）
