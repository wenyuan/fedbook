# Git 提交信息规范

> 无论是个人项目还是在团队协作中，commit message 都应该清晰明了，遵守一定规范。
>
> 目前，社区有多种 commit message 的写法规范。本文介绍 [Angular 规范](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)，这是目前使用最广的写法，比较合理和系统化，并且有配套的工具。

## 规范 commit 的好处

* 提供更明确的历史信息，方便浏览和判断提交目的
* 可以过滤某些不必要的提交，方便快速查找信息
* 自动化生成 Change log

以上的好处，个人认为要有一个大的前提，就是每一个提交，尽量保证其目的单一性。例如几个 bug 仅仅看上去类似，就合并成一次性修改提交，反而会让 commit 的信息变的复杂化，阅读不方便，也容易让人想到一些不必要的关联性。

## 开源项目 commit 示例

找了几个 star 较多的库，看看它们的提交格式。

* [angular-commit](https://github.com/angular/angular/commits/master)

<div style="text-align: center;">
  <img src="./assets/angular-commit.png" alt="Angular 的提交历史" style="width: 500px;">
  <p style="text-align: center; color: #888;">（Angular 的提交历史）</p>
</div>

* [vuejs-commit](https://github.com/vuejs/vue/commits/dev)

<div style="text-align: center;">
  <img src="./assets/vuejs-commit.png" alt="Vue.js 的提交历史" style="width: 500px;">
  <p style="text-align: center; color: #888;">（Vue.js 的提交历史）</p>
</div>

* [react-commit](https://github.com/facebook/react/commits/main)：跟前两者的风格不一样，似乎就是首字母大写，但最近的提交记录中，看见有参与者在按照 Angular 的 commit 规范进行提交。

<div style="text-align: center;">
  <img src="./assets/react-commit.png" alt="React 的提交历史" style="width: 500px;">
  <p style="text-align: center; color: #888;">（React 的提交历史）</p>
</div>

## commit 的格式

每次提交，commit message 都包括三个部分，每部分之间用空行隔开。

```bash
<type>(<scope>): <subject>    # 一句话概述 commit 主题（必须）
                              # 空行
<body>                        # 详细描述 What 和 Why（可选）
                              # 空行
<footer>                      # 不兼容或关闭 issue 等说明（可选）
```

注意：commit message 的每一行的文字不能太长，这样子在 GitHub 和 Git 工具上更便于阅读。

```yaml
正文(Body)详细描述本次 commit 做了什么、为什么这样做(不是怎么做的)
- 每行不要超过70字符
1. 这个改动解决了什么问题？
2. 这个改动为什么是必要的？
3. 会影响到哪些其他的代码？
  bug fix - 组件 bug 修复；
  breaking change - 不兼容的改动；
  new feature - 新功能

尾注(Footer) 用于关闭 Issue 或存在不兼容时添加相关说明等
1. breaking change: 与上一个版本不兼容的相关描述、理由及迁移办法
2. close #issue: 关闭相关问题（附链接）
3. revert: 撤销以前的commit
```

更详细的规范如下。

### 主题（Subject）

主题（Subject）是 commit 的简短描述，不超过 50 个字符。

采用 动词 + 宾语 + 副词 的形式描述，第一个字母小写，结尾不加句号(`.`)。

常见类别标识及示例如下：

* **feat**：新功能、添加代码和逻辑。例如 `feat: add xxx field/method/class`
* **fix**：修复 bug。例如 `fix: #123, fix xxx error`
* **docs**：文档更新。例如 `docs: change documents`
* **style**：不影响程序逻辑的代码修改（CSS 样式、代码格式化等）。例如 `style: add class or change style`
* **refactor**：一般指重构代码。例如 `refactor: rename, move, extract, inline` 等
* **perf**：代码性能优化。例如 `perf: improves performance`
* **test**：代码单元测试。例如 `test: test menu component`
* **build**：变更项目构建或外部依赖（webpack、glup、npm、rollup 等）。例如 `build: build project`
* **ci**：修改持续集成配置文件（Travis，Jenkins，GitLab CI，Circle 等）。例如 `ci: change gitlab-ci.yml`
* **chore**：日常事务，例如对构建或者辅助工具的更改、生成文档等。例如 `chore: change webpack`
* **revert**：代码回退。例如 `revert: feat(pencil): add 'graphiteWidth' option`

::: tip 小贴士
* Subject 是用一句话说明本次所作的提交，如果一句话说不清楚，那有可能这个提交得拆分成多次。
* 如果类别标识为 `feat` 和 `fix`，则该 commit 将肯定出现在 Change log 之中。其他情况由你决定要不要放入 Change log，建议是不要。
* 类别标识后的括号（scope） 用于说明 commit 影响的范围（比如数据层、控制层、视图层等等），当影响的范围有多个时候，可以使用 `*`。
:::

特别注意：

如果当前 commit 用于撤销之前的 commit，则必须以 `revert:` 开头，后面跟着被撤销 commit 的 header。

body 部分的格式是固定的，必须写成 `This reverts commit <hash>.`，其中的 hash 是被撤销 commit 的 SHA 标识符。

```bash
revert: feat(pencil): add 'graphiteWidth' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

### 正文（Body）

详细描述本次 commit 做了什么、为什么这样做(不是怎么做的)，每行不要超过 70 字符。

* 这个改动解决了什么问题？ 
* 这个改动为什么是必要的？ 
* 会影响到哪些其他的代码？ 
  * bug fix - 组件 bug 修复
  * breaking change - 不兼容的改动
  * new feature - 新功能

### 尾注（Footer）

用于关闭 Issue 或存在不兼容时添加相关说明等。

* breaking change：与上一个版本不兼容的相关描述、理由及迁移办法
* close #issue：关闭相关问题（附链接）。例如：`close #123, #245`
* revert：撤销以前的 commit

## 模板参考

```bash
feat($browser): onUrlChange event (popstate/hashchange/polling)

Added new event to $browser:
- forward popstate event if available
- forward hashchange event if popstate not available
- do polling when neither popstate nor hashchange available

Breaks $browser.onHashChange, which was removed (use onUrlChange instead)
```

```bash
fix($compile): couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Close #392
Breaks foo.bar api, foo.baz should be used instead
```

```bash
feat(directive): ng:disabled, ng:checked, ng:multiple, ng:readonly, ng:selected

New directives for proper binding these attributes in older browsers (IE).
Added coresponding description, live examples and e2e tests.

Close #351
```

```bash
style($location): add couple of missing semi colons
```

```bash
docs(guide): updated fixed docs from Google Docs

Couple of typos fixed:
- indentation
- batchLogbatchLog -> batchLog
- start periodic checking
- missing brace
```

```bash
feat($compile): simplify isolate scope bindings

Changed the isolate scope binding options to:
  - @attr - attribute binding (including interpolation)
  - =model - by-directional model binding
  - &expr - expression execution binding

This change simplifies the terminology as well as
number of choices available to the developer. It
also supports local name aliasing from the parent.

BREAKING CHANGE: isolate scope bindings definition has changed and
the inject option for the directive controller injection was removed.

To migrate the code follow the example below:

Before:

scope: {
  myAttr: 'attribute',
  myBind: 'bind',
  myExpression: 'expression',
  myEval: 'evaluate',
  myAccessor: 'accessor'
}

After:

scope: {
  myAttr: '@',
  myBind: '@',
  myExpression: '&',
  // myEval - usually not useful, but in cases where the expression is assignable, you can use '='
  myAccessor: '=' // in directive's template change myAccessor() to myAccessor
}

The removed `inject` wasn't generaly useful for directives so there should be no code using it.
```

## 提交频率

关于什么时候提交一次：

**每次你写完一个功能的时候，就应该做一次 commit 提交（这个提交是提交到本地的 Git 库中）**。

当然，这里的写完表示的是你的这个功能是没有问题的。

## 参考资料

* [Angular 规范](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)
* [Angular 规范文档](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit)
* [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

（完）
