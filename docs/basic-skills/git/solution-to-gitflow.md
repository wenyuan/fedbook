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

现在我和小明开始独立开发自己的功能。比如，我开发角色模块，小明开发文章模块。我们都新建自己的功能分支，独立开发、独立测试，互不干扰。

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
