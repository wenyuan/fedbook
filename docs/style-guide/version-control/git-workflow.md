# Git 工作流 — 分支策略

## 前言

设想这样一个场景：某企业的开发团队使用 Git 管理日常开发工作，最初开发团队的代码有一条主干分支（master/main）。后来为了开发新功能，从主干分支拉出一条特性分支，但新功能完成后，该特性分支没有合入主干分支，而是作为下次开发的主干分支，重新拉出一条新的特性分支，导致主干分支一直形同虚设，团队没有一条稳定的代码分支。

这个问题很大程度上源于团队对分支策略的不了解，导致分支策略使用很混乱。因此，我们需要采用 Git 工作流 —— 分支策略来此类问题。

目前业界常见的 Git 分支策略主要有：GitFlow、GitHubFlow 以及 GitLabFlow，本文一一作介绍，方便团队开发时，根据自身情况选择最合适的方案。

## GitFlow 策略

GitFlow 是这三种分支策略中最早出现的。

GitFlow 通常包含五种类型的分支：`master` 分支、`develop` 分支、`feature` 分支、`release` 分支以及 `hotfix` 分支。

### 分支定义

**master 分支**：主干分支，这是一个稳定的分支，又称为保护分支，表示正式发布的历史，所有对外正式版本发布都会合并到这里，并打上版本标签。通常情况下只允许其他分支将代码合入，不允许向 `master` 分支直接提交代码。

**develop 分支**：开发分支，用来用来整合功能分支，表示最新的开发状态。包含要发布到下一个 `release` 的代码。

> * 注意每次合并到 `master` 都要打上 tag，方便定位。
> * `master` 分支和 `develop` 分支都是历史分支，用来记录项目的历史记录。相对于这两个分支，下面的其它分支都属于临时分支，这些分支完成自己的使命后就可以被删除。

**feature 分支**：功能分支，通常从 `develop` 分支拉出，每个新功能的开发对应一个功能分支，用于开发人员提交代码并进行自测。自测完成后，会将 `feature` 分支的代码合并至 `develop` 分支，进入下一个 `release`。

**release 分支**：发布分支，发布新版本时，基于 `develop` 分支创建，从此刻开始新的功能不会加到这个分支，这个分支只应该做 bug 修复、文档生成和其他面向发布的任务。当发布分支足够稳定后，它的生命周期就可以结束了，这时候将 `release` 分支 合并到 `master` 分支，然后打上 tag 版本号；接着还需要将 `release` 分支合并回 `develop` 分支。

> * `release` 分支可以删掉，因为在 `master` 上打了 tag，即使删掉了发布分支，你也可以很方便的重新创建一个：
>   ```bash
>   # 基于 tag v1.0.0 创建一个分支
>   $ git checkout -b release/v1.0.0 v1.0.0
>   ```
> * release 分支是 develop 和 master 之间的缓冲区，对于一个发布，往往会在发布分支中停留一段时间，等待稳定后才合并到 master。  
> * release 分支使得团队可以在完善当前发布版本的同时，不阻拦新功能的开发。

**hotfix 分支**：热修复分支，生产环境发现新 bug 时创建的临时分支，这些 bug 可能比较紧急，而且跨越多个分支，所以可以创建一个 `hotfix` 分支快速修复 `master` 上面的 bug。问题验证通过后，合并到 `master` 和 `develop` 分支，并打上 tag。

> `hotfix` 分支是唯一一个可以从 `master` 分叉出来的分支类型。

### 开发流程

通常开发过程中新功能的开发过程如下：

* 从 `develop` 分支拉取一条 `feature` 分支，开发团队在 `feature` 分支上进行新功能开发。
* 开发完成后，将 `feature` 分支合入到 `develop` 分支，并进行开发环境的验证。
* 开发环境验证完成，从 `develop` 分支拉取一条 `release` 分支，到测试环境进行 SIT/UAT 测试。
* 测试无问题后，可将 `develop` 分支合入 `master` 分支。
* 待发版时，直接将 `master` 分支代码部署到生产环境。

可参考下图：

<div style="text-align: center;">
  <img src="./assets/gitflow.png" alt="GitFlow">
  <p style="text-align: center; color: #888;">（GitFlow 示意图）</p>
</div>

### 优缺点

GitFlow 的优点：

* 分支各司其职，覆盖大部分开发场景。
* 预期 master 分支中任何 commit 都是可部署的。
* 严格按照流程执行，出现重大事故的情形会大大降低。

GitFlow 的缺点：

* 过于繁琐，无法要求所有团队成员按照这个流程严格执行。
* 违反 Git 提倡的 short-lived 分支原则。
* 如果特性分支过多的话很容易造成代码冲突，从而提高了合入的成本。
* 由于每次提交都涉及多个分支，所以 GitFlow 也太不适合提交频率较高的项目。
* master 分支历史记录并不干净，只能通过打 tag 标记哪些是 master 真正要部署的。
* 对持续部署和 [Monorepo](https://zhuanlan.zhihu.com/p/77577415) 仓库不友好。

## GitHubFlow 策略

GitHubFlow 看名字也知道和 GitHub 有关，它来源于 GitHub 团队的工作实践。当代码托管在 GitHub 上时，则需要使用 GitHubFlow。相比 GitFlow 而言，GitHubFlow 没有那么多分支。

GitHubFlow 通常只有一个 `master` 分支是固定的（[现在被更名为 main 了](https://github.com/github/renaming)），而且 GitHubFlow 中的 `master` 分支通常是受保护的，只有特定权限的人才可以向 `master` 分支合入代码。

### 适用场景

* 适合开源项目。开源项目需要接受任何开发者的代码共享，无需给他们正式的代码库的写权限。
* 适合大型的，自发性的团队。fork 的方式可以提供灵活的方式来安全协作。

### 开发流程

* 在 GitHubFlow 中，要求每个成员先 fork 项目到自己的目录（fork 的本质就是让 GitHub 将项目克隆到你的个人目录）。
* 每次有新功能开发或修复 bug 时，需要从 `master` 分支拉取一个新的 `feature` 分支，在这个新分支上进行代码提交。
* 功能开发完成，开发者创建 `feature` 分支合并到上游（upstream）项目的 Pull Request（简称 PR），通知源仓库开发者进行代码修改 Review。
* 上游项目的所有者决定是否合并你的代码，如果确认无误，他会将代码合入 `master` 分支。

可参考下图：

<div style="text-align: center;">
  <img src="./assets/githubflow.png" alt="GitHubFlow">
  <p style="text-align: center; color: #888;">（GitHubFlow 示意图）</p>
</div>

很多人可能会问，提交代码通常是 `commit` 或者 `push`，拉取代码才是 `pull`，为什么 GitHubFlow 中提交代码是「Pull Request」。因为在 GitHubFlow 中，PR 是通知其他人员到你的代码库去拉取代码至本地，然后由他们进行最终的提交，所以用 `pull` 而非 `push`。

### 优缺点

GitHubFlow 的优点：

* 相对于 GitFlow 来说比较简单。

GitHubFlow 的缺点：

* 因为只有一条 master 分支，万一代码合入后，由于某些因素 master 分支不能立刻发布，就会导致最终发布的版本和计划不同。

## GitLabFlow 策略

GitLabFlow 出现的最晚，GitLabFlow 是开源工具 GitLab 推荐的做法。

GitLabFlow 支持 GitFlow 的分支策略，也支持 GitHubFlow 的「Pull Request」（在 GitLabFlow 中被称为「Merge Request」）。

相比于 GitHubFlow，GitLabFlow 增加了对预生产环境和生产环境的管理，即 `master` 分支对应为开发环境的分支，预生产和生产环境由其他分支（如 `pre-production`、`production`）进行管理。在这种情况下，`master` 分支是 `pre-production` 分支的上游，`pre-production` 是 `production` 分支的上游；GitLabFlow 规定代码必须从上游向下游发展，即新功能或修复 bug 时，特性分支的代码测试无误后，必须先合入 `master` 分支，然后才能由 `master` 分支向 `pre-production` 环境合入，最后由 `pre-production` 合入到 `production`。

基于环境：

<div style="text-align: center;">
  <img src="./assets/gitlabflow-production.png" alt="GitLabFlow" style="width: 200px;">
  <p style="text-align: center; color: #888;">（GitLabFlow：master -> production，图来源于网络）</p>
</div>

<div style="text-align: center;">
  <img src="./assets/gitlabflow-pre-production.png" alt="GitLabFlow" style="width: 300px;">
  <p style="text-align: center; color: #888;">（GitLabFlow：master -> pre-production -> production，图来源于网络）</p>
</div>

基于发布计划：

<div style="text-align: center;">
  <img src="./assets/gitlabflow-stable.png" alt="GitLabFlow" style="width: 300px;">
  <p style="text-align: center; color: #888;">（GitLabFlow：master -> stable，图来源于网络）</p>
</div>

GitLabFlow 中的 Merge Request 是将一个分支合入到另一个分支的请求，通过 Merge Request 可以对比合入分支和被合入分支的差异，也可以做代码的 Review。

GitLabFlow 并不像 GitFlow、GitHubFlow 一样具有明显的规范，它更多是在 GitHubFlow 基础上，综合考虑环境部署、项目管理等问题而得出的一种实践。

## 团队定制的分支策略

比较流行的 Git 分支策略是 GitFlow，但是大部分团队会根据自己的情况制定自己的 Git 工作流规范，例如我们团队的分支规范：

**master 分支**：表示一个稳定的发布版本。

* 场景：前端会跟随后端的版本迭代，在 `dev` 分支测试稳定后，合并到 `master` 分支，并使用 `tag` 标记前端版本和对应的后端版本。
* tag 规范：`v{version}@{product_version}`，例如 v0.1.0@SQY_3.0。
* 人员：由项目负责人进行审核合并，普通开发者没有权限。

**dev 分支**：开发者主要工作的分支，最新的特性或 bug 修复都会提交到这个分支。开发者如果在该分支进行了提交，在 `push` 到远程之前应该先 `pull` 一下，并尽量使用 `rebase` 模式，保证分支的简洁。

* 命名规范：`dev`
* tag 规范：在 `dev` 分支中也可能会经历发布过程，例如 bug 修复版本。这里同样使用 tag 来标记这些发布，例如 v0.1.1。
* 提交规范：如果是在开发分支上进行开发，在推送到远程之前，应该使用 `git rebase` 形式更新本地分支。
* 建议操作：建议时不时地 `pull` 一下，尤其是每天打开电脑正式工作前，保证本地代码版本与远端版本的一致性（因为很多人都不能优雅地解决代码冲突）。

**feature 分支**：涉及多人协作或者大功能的开发，应该从 `dev` 分支 `checkout` 出独立的 `feature` 分支，避免干扰 `dev` 分支。

* 场景
  * 涉及多人协作：团队多个成员在同一个项目下负责开发不同的功能，这时候每个成员在自己的 `feature` 分支独立开发。
  * 大功能开发：大功能开发跨越周期比较长，需要多次迭代才会稳定。这时候应该在独立的分支上开发。方便跟踪历史记录，也免于干扰 `dev` 分支的迭代和发布。
* 命名规范
  * `feature/name`：name 是功能名称。
  * `feature/product_version`：这也是团队常见的模式，当无法使用一个功能名称来描述时，可以使用后端版本号作为「功能」。
* 合并时机
  * 当 `feature` 分支迭代稳定，并通过测试后，合并到 `dev` 分支。合并到 `dev` 后，`feature` 分支的生命周期就结束了。后续 bug 修复和功能优化直接在 `dev` 开发。
  * 当多个 `feature` 分支需要合并对外发布临时版本时。合并到 `preview` 分支。（⚠️这种情况不应该合并到 `dev` 分支，因为 `feature` 分支可能还不稳定或未完成，比如为了联调某些功能）
* 合并方式
  * 为了能在分支图上查看到分支历史，不要使用 [fast-forward](https://www.cnblogs.com/mengff/p/15514944.html)。

**preview 分支**：临时的预览分支，`preview` 分支用于临时合并 `feature` 分支，这其中可能会修复某些 bug 或者冲突。可以选择性地将这些提交 `cherry-pick` 回 `feature` 分支。当预览结束后就可以销毁 `preview` 分支。

**release 分支**：`release` 分支遵循 GitFlow 流程。

* GitFlow 风格的 release：当前前端的稳定版本和 SQY（产品名）版本绑定。`release` 分支不一定存在。一般情况下，只会在前端版本稳定后，将其合并到 `master`，并创建 tag 标记。而只有需要为指定的正式版本修复 bug 时才会创建 `release` 分支。
* 场景：需要为某个正式版本修复 bug（hotfix）时，从 `master` 的对应 tag 中 `checkout` 出一个 `release` 分支。
* 命名规范：`release/{product_version}`，外部人员只会关注产品版本。
* 如何修复：
  * 如果对应 bug 可以在 `dev` 分支直接被修复，可以先提交到 `dev` 分支（或者已经修复了），然后再 `cherry-pick` 到 `release` 分支。
  * 如果 bug 在新版本无法复现，比如新版本升级了依赖，那么在 `release` 分支直接修复即可。
* `release` 分支树：
  <div style="text-align: center;">
    <svg id="SvgjsSvg1006" width="309.5" height="462" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1036" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1037" d="M0,0 L14,5 L0,10 L0,0" fill="#64b5f6" stroke="#64b5f6" stroke-width="1"></path></marker><marker id="SvgjsMarker1040" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1041" d="M0,0 L14,5 L0,10 L0,0" fill="#64b5f6" stroke="#64b5f6" stroke-width="1"></path></marker><marker id="SvgjsMarker1044" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1045" d="M0,0 L14,5 L0,10 L0,0" fill="#64b5f6" stroke="#64b5f6" stroke-width="1"></path></marker><marker id="SvgjsMarker1048" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1049" d="M0,0 L14,5 L0,10 L0,0" fill="#64b5f6" stroke="#64b5f6" stroke-width="1"></path></marker><marker id="SvgjsMarker1076" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1077" d="M0,0 L14,5 L0,10 L0,0" fill="#e57373" stroke="#e57373" stroke-width="1"></path></marker><marker id="SvgjsMarker1086" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1087" d="M0,0 L14,5 L0,10 L0,0" fill="#e57373" stroke="#e57373" stroke-width="1"></path></marker><marker id="SvgjsMarker1090" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1091" d="M0,0 L14,5 L0,10 L0,0" fill="#64b5f6" stroke="#64b5f6" stroke-width="1"></path></marker></defs><g id="SvgjsG1008" transform="translate(109.75,414)"><path id="SvgjsPath1009" d="M 0 0L 71.5 0L 71.5 23L 0 23Z" stroke="rgba(229,115,115,1)" stroke-width="2" fill-opacity="1" fill="#ffcdd2"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="52px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="0.75" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="17" x="36"><tspan id="SvgjsTspan1013" style="text-decoration:;">master</tspan></tspan></text></g></g><g id="SvgjsG1014" transform="translate(135.5,353.5)"><path id="SvgjsPath1015" d="M 0 11.5C 0 -3.8333333333333335 20 -3.8333333333333335 20 11.5C 20 26.833333333333332 0 26.833333333333332 0 11.5Z" stroke="rgba(100,181,246,1)" stroke-width="1" fill-opacity="1" fill="#bbdefb"></path><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="0px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="0.75" transform="rotate(0)"></text></g></g><g id="SvgjsG1018" transform="translate(135.5,270.5)"><path id="SvgjsPath1019" d="M 0 11.5C 0 -3.8333333333333335 20 -3.8333333333333335 20 11.5C 20 26.833333333333332 0 26.833333333333332 0 11.5Z" stroke="rgba(100,181,246,1)" stroke-width="1" fill-opacity="1" fill="#bbdefb"></path><g id="SvgjsG1020"><text id="SvgjsText1021" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="0px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="0.75" transform="rotate(0)"></text></g></g><g id="SvgjsG1022" transform="translate(135.5,136.5)"><path id="SvgjsPath1023" d="M 0 11.5C 0 -3.8333333333333335 20 -3.8333333333333335 20 11.5C 20 26.833333333333332 0 26.833333333333332 0 11.5Z" stroke="rgba(100,181,246,1)" stroke-width="1" fill-opacity="1" fill="#bbdefb"></path><g id="SvgjsG1024"><text id="SvgjsText1025" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="0px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="0.75" transform="rotate(0)"></text></g></g><g id="SvgjsG1026" transform="translate(135.5,54.5)"><path id="SvgjsPath1027" d="M 0 11.5C 0 -3.8333333333333335 20 -3.8333333333333335 20 11.5C 20 26.833333333333332 0 26.833333333333332 0 11.5Z" stroke="rgba(100,181,246,1)" stroke-width="1" fill-opacity="1" fill="#bbdefb"></path><g id="SvgjsG1028"><text id="SvgjsText1029" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="0px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="0.75" transform="rotate(0)"></text></g></g><g id="SvgjsG1030" transform="translate(213,234)"><path id="SvgjsPath1031" d="M 0 11.5C 0 -3.8333333333333335 20 -3.8333333333333335 20 11.5C 20 26.833333333333332 0 26.833333333333332 0 11.5Z" stroke="rgba(100,181,246,1)" stroke-width="1" fill-opacity="1" fill="#bbdefb"></path><g id="SvgjsG1032"><text id="SvgjsText1033" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="0px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="400" font-style="" opacity="1" y="0.75" transform="rotate(0)"></text></g></g><g id="SvgjsG1034"><path id="SvgjsPath1035" d="M145.5 413L145.5 394.5L145.5 394.5L145.5 379.6" stroke="#64b5f6" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1036)"></path></g><g id="SvgjsG1038"><path id="SvgjsPath1039" d="M145.5 353L145.5 323.5L145.5 323.5L145.5 296.6" stroke="#64b5f6" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1040)"></path></g><g id="SvgjsG1042"><path id="SvgjsPath1043" d="M145.5 270L145.5 215L145.5 215L145.5 162.6" stroke="#64b5f6" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1044)"></path></g><g id="SvgjsG1046"><path id="SvgjsPath1047" d="M145.5 136L145.5 106L145.5 106L145.5 80.6" stroke="#64b5f6" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1048)"></path></g><g id="SvgjsG1050" transform="translate(143.5,345)"><path id="SvgjsPath1051" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1052"><text id="SvgjsText1053" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="9.25" transform="rotate(0)"><tspan id="SvgjsTspan1054" dy="17" x="60"><tspan id="SvgjsTspan1055" style="text-decoration:;">v0.5.0@3.2</tspan></tspan></text></g></g><g id="SvgjsG1056" transform="translate(25,262)"><path id="SvgjsPath1057" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1058"><text id="SvgjsText1059" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="9.25" transform="rotate(0)"><tspan id="SvgjsTspan1060" dy="17" x="60"><tspan id="SvgjsTspan1061" style="text-decoration:;">v1.0.0@3.3</tspan></tspan></text></g></g><g id="SvgjsG1062" transform="translate(143.5,46)"><path id="SvgjsPath1063" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1064"><text id="SvgjsText1065" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="9.25" transform="rotate(0)"><tspan id="SvgjsTspan1066" dy="17" x="60"><tspan id="SvgjsTspan1067" style="text-decoration:;">v1.2.0@3.5</tspan></tspan></text></g></g><g id="SvgjsG1068" transform="translate(143.5,128)"><path id="SvgjsPath1069" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1070"><text id="SvgjsText1071" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="120px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="9.25" transform="rotate(0)"><tspan id="SvgjsTspan1072" dy="17" x="60"><tspan id="SvgjsTspan1073" style="text-decoration:;">v1.1.0@3.4</tspan></tspan></text></g></g><g id="SvgjsG1074"><path id="SvgjsPath1075" d="M155.9984707362022 282.03907588962545C 183.85493945180906 286.99974086170886 217.5 275 221.4350122678727 259.6759696183423" stroke="#e57373" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1076)"></path></g><g id="SvgjsG1078" transform="translate(186.5,181)"><path id="SvgjsPath1079" d="M 0 0L 98 0L 98 23L 0 23Z" stroke="rgba(229,115,115,1)" stroke-width="2" fill-opacity="1" fill="#ffcdd2"></path><g id="SvgjsG1080"><text id="SvgjsText1081" font-family="微软雅黑" text-anchor="middle" font-size="14px" width="78px" fill="#323232" font-weight="700" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="14px" weight="700" font-style="" opacity="1" y="0.75" transform="rotate(0)"><tspan id="SvgjsTspan1082" dy="17" x="49"><tspan id="SvgjsTspan1083" style="text-decoration:;">release/3.3</tspan></tspan></text></g></g><g id="SvgjsG1084"><path id="SvgjsPath1085" d="M223.0898770882842 233.50814421930653C 225.9561216427084 222.96760383605817 225.3804347826087 216.9670315068311 225.38437810353196 207.5999978403077" stroke="#e57373" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1086)"></path></g><g id="SvgjsG1088"><path id="SvgjsPath1089" d="M144.5 56L144.5 40.5L144.5 40.5L144.5 25" stroke="#64b5f6" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1090)"></path></g></svg>
    <p style="text-align: center; color: #888;">（浏览器可视区域的宽高）</p>
  </div>

## 总结

Git 提供了丰富的分支策略和工作流方式，通过学习业界 Git 工作流，可以发现每种工作流都设计的非常好，似乎都能运用到团队实践。但在引入 Git 工作流规范开发时要留意：Git 工作流仅仅是整个研发流程中的一环。上游项目管理/缺陷追踪系统虎视眈眈，下游 CD (Continuous Delivery) 嗷嗷待哺，还得考虑团队规模、产品形态、发版方式等等因素。因此，在团队中落地 Git 工作流规范并不是一件能轻松决定的事。

选择的策略不同，研发效率也不同，没有最好的工作流策略，只有最适合团队的工作流策略，Git工作流中常见的三种分支策略及其优缺点在上面已经列出，可以根据团队具体情况，选择合适的分支策略进行开发。

（完）
