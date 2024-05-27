# Redis 的 ACL 安全策略

> ACL 是 Redis 6.0 的新特性，主要是做权限控制的。
> 
> 它的出现是因为在 Redis 6.0 版本之前是没有权限的概念的，所有连接的客户端都可以对 Redis 里面的数据进行操作，也可以使用所有高危命令，比如 `flushall` 或 `flushdb` 清空掉数据库里面的所有数据。

## 背景

最近给新安装的 Redis 设置密码时，按照以前的方式，因为在 Redis 6.0 之前，Redis 只有一个 default 用户也是 Redis 中的超级管理员用户，所以要将其设置密码，只需要修改 Redis 配置文件中如下项：

```bash
requirepass 123456
```

然后重启 Redis 就可以了。

这就是在 Redis 6.0 之前给 Redis 用户创建密码的方式，只有一个 `default` 用户也是 Redis 中的超级管理员用户。

但是这次安装的是 Redis 7，在一次开启公网调试并用代码访问时，发现通过配置文件设置的密码并未生效。又重新看了下配置文件，果然在这一项的上面注释中写着：`requirepass` 与 ACL 不兼容，如果开启了 ACL，那么这项配置将被忽略。

看来有必要了解一下 ACL 这个新特性了。

## ACL 简介

在 Redis 6.0 之前的版本，我们只能使用 `requirepass` 参数给 `default` 用户配置登录密码，同一个 Redis 集群的所有开发都共享 `default` 用户，难免会出现误操作把别人的 key 删掉或者数据泄露的情况。

因此 Redis 6.0 版本推出了 ACL（Access Controller List）访问控制权限的功能，基于此功能，我们可以设置多个用户，并且给每个用户单独设置命令权限和数据权限。在用户连接之后，它的工作方式是需要客户端进行身份验证，以提供用户名和有效密码：如果身份验证阶段成功，则连接与给定用户关联，并且该用户具有限制。

为了保证向下兼容，Redis 6.0 保留了 `default` 用户和使用 `requirepass` 的方式给 `default` 用户设置密码，默认情况下 `default` 用户拥有 Redis 最大权限，我们使用 redis-cli 连接时如果没有指定用户名，用户也是默认 `default`。

## 配置 ACL

配置 ACL 的方式有两种，一种是在 conf 文件中直接配置，另一种是在外部 aclfile 中配置。配置的命令是一样的，**但是两种方式只能选择其中一种**。

在讲具体的配置方式之前，需要先简单介绍一下定义 ACL 时用到的 DSL 语法。

### DSL 语法

ACL 是使用 DSL 定义的，该 DSL 就是一个规则，描述了指定用户可以执行的操作，且是按照从左到右、从第一个到最后一个的顺序实施，因为有时规则的顺序对于理解用户的实际能力很重要。

::: tip 小贴士
DSL（domain specific language）是领域专用语言，其基本思想是「求专不求全」，不像通用目的语言那样目标范围涵盖一切软件问题，而是具有受限的表达，专门针对某一特定问题的计算机语言。

* Java、Python、C 都是通用性编程语言，也就是我们可以用于多个不同的领域，普通应用编程。
* HTML、SQL 都算得上是领域专用语言，需要寄生在宿主语言中。比如 React 或者 Vue 支持的 JSX 语法都属于 DSL，「寄生」于前端 HTML 中。
:::

以查看默认用户的 ACL 为例，默认情况下，只有一个用户定义，称为 `default`。我们可以使用 [`ACL LIST`](https://redis.io/commands/acl-list/) 命令来检查当前活动的 ACL 并验证新启动的，默认的 Redis 实例的配置是：

```bash
[root@VM-16-7-centos ~]# redis-cli -h 127.0.0.1 -p 6379
127.0.0.1:6379> acl list
1) "user default on nopass sanitize-payload ~* &* +@all"
```

解释一下返回值：

* 第一个是固定单词 `user`，后面跟上用户名（此处是 `default`）。
* 默认用户已配置为活动状态（`on`），不需要密码（`nopass`）
* 权限是访问所有可能的键（`~*`）和 发布/订阅（Pub/Sub）频道（`&*`），并能够调用所有可能的命令（`+@all`）。

对于这个默认用户，具有 `nopass` 规则意味着新连接将自动与默认用户进行身份验证，而无需任何显式的 auth 调用。

至于 ACL 规则用 DSL 怎么写，最后再讲，现在有个大概的概念就行。下面展开来讲两种配置方式。

### 使用 conf 配置 ACL

我们之前使用 `requirepass` 给 `default` 用户设置密码默认就是使用的 conf 方式。并且 6.0 版本开始，在用之前方式给 `default` 用户配置密码后，再执行 `config rewrite` 重写配置，就会自动在 conf 文件最下面新增一行记录来配置 `default` 的密码和权限。

使用 conf 文件配置 default 和其他用户的 ACL 权限，操作步骤如下：

#### 1）第一步，在 conf 文件中配置 `default` 用户的密码

```bash
# The requirepass is not compatible with aclfile option and the ACL LOAD
# command, these will cause requirepass to be ignored.
#
requirepass 123456
```

#### 2）第二步，重启 redis 服务，进入命令行执行 `config rewrite` 命令

```bash
[root@VM-16-7-centos ~]# redis-cli -h 127.0.0.1 -p 6379
127.0.0.1:6379> config rewrite
OK
127.0.0.1:6379>
```

这时候可以看到 conf 文件的最后面自动新增了 `default` 用户的 ACL，如下所示：

```bash
user default on nopass sanitize-payload ~* &* +@all
```

#### 3）在 conf 文件中注释 aclfile 的路径配置（默认是注释的）

原因是因为两种配置方式（conf 方式和 aclfile 方式）是冲突的，只能开启一个。

```bash {11}
# Using an external ACL file
#
# Instead of configuring users here in this file, it is possible to use
# a stand-alone file just listing users. The two methods cannot be mixed:
# if you configure users here and at the same time you activate the external
# ACL file, the server will refuse to start.
#
# The format of the external ACL user file is exactly the same as the
# format that is used inside redis.conf to describe users.
#
# aclfile /etc/redis/users.acl
```

#### 4）重启 Redis 服务来加载配置

加载配置需要重启 Redis 服务。

#### 5）查看新的 acl list

```bash
[root@VM-16-7-centos ~]# redis-cli -h 127.0.0.1 -p 6379
127.0.0.1:6379> acl list
1) "user default on nopass sanitize-payload ~* &* +@all"
127.0.0.1:6379>
```

因此我们可以直接在 conf 配置文件中，使用类似上面 `default` 用户的这行 DSL 命令来设置用户权限，或者我们也可以配置外部 aclfile 配置权限。

### 使用外部 aclfile 配置 ACL

> 如果我们有较多的用户且希望有一个单独的配置文件时，可以使用这种方式。

配置 aclfile 需要先将 conf 中配置的 DSL 注释掉或直接删除，因为 Redis 不允许两种 ACL 管理方式同时使用，否则在启动 Redis的时候会报下面的错误：

```bash
# Configuring Redis with users defined in redis.conf and at the same setting an ACL file path is invalid. This setup is very likely to lead to configuration errors and security holes, please define either an ACL file or declare users directly in your redis.conf, but not both.
```

使用外部 aclfile 文件配置 `default` 和其他用户的 ACL 权限，操作步骤如下：

#### 1）第一步，注释 conf 文件中所有已授权的 ACL 命令

如果先前是用 `config rewrite` 命令生成的 ACL 语句，那么它们一般是在 conf 文件最末尾，例如 `default` 用户的这行，把它注释掉：

```bash
# user default on nopass sanitize-payload ~* &* +@all
```

#### 2）第二步，在 conf 文件中配置外部 aclfile 路径

* 在 conf 文件中注释掉 `default` 用户的密码，因为开启 aclfile 之后，`requirepass` 的密码就失效了
* 在 conf 文件中配置 aclfile 的路径，然后创建该文件，否则重启 Redis 服务会报错找不到该文件

```bash {11,22}
# Using an external ACL file
#
# Instead of configuring users here in this file, it is possible to use
# a stand-alone file just listing users. The two methods cannot be mixed:
# if you configure users here and at the same time you activate the external
# ACL file, the server will refuse to start.
#
# The format of the external ACL user file is exactly the same as the
# format that is used inside redis.conf to describe users.
#
aclfile /usr/local/redis/acl/users.acl

# IMPORTANT NOTE: starting with Redis 6 "requirepass" is just a compatibility
# layer on top of the new ACL system. The option effect will be just setting
# the password for the default user. Clients will still authenticate using
# AUTH <password> as usually, or more explicitly with AUTH default <password>
# if they follow the new protocol: both will work.
#
# The requirepass is not compatible with aclfile option and the ACL LOAD
# command, these will cause requirepass to be ignored.
#
# requirepass 123456
```

新建一个文件夹 `acl/`，然后新建一个文件 `users.acl`，将用户权限相关的配置（DSL 语法）拷贝到 `users.acl` 中：

```bash
cd /usr/local/redis/
mkdir acl
cd acl
vim users.acl
```

然后将信息写入到配置文件中：

```bash
user default on nopass sanitize-payload ~* &* +@all
```

上面这段 DSL 是从前面复制的，由`config rewrite` 命令生成的。也就是有最高权限的 `default` 用户。

#### 3）第三步，重启 Redis 服务来加载配置

加载配置需要重启 Redis 服务。

PS：经测试，首次将 conf 方式改为 aclfile 方式，必须要重启 Redis 服务才行（否则会报错 `(error) ERR This Redis instance is not configured to use an ACL file.（此处省略 100 字）`）。

而以后修改 `users.acl` 文件里面的 DSL 语句后，只需要在命令行执行 `acl load` 即可将将最新的 aclfile 中的权限加载至 Redis服务中）

#### 4）查看新的 acl list

```bash
[root@VM-16-7-centos ~]# redis-cli -h 127.0.0.1 -p 6379
127.0.0.1:6379> acl list
1) "user default on nopass sanitize-payload ~* &* +@all"
127.0.0.1:6379>
```

### 对比 conf 和 aclfile 两种方式

在 conf 和 aclfile 两种方式中配置 DSL，官方更推荐使用 aclfile，因为如果在 conf 中配置了权限之后需要重启 redis 服务才能将配置的权限加载至 Redis 服务中来，但如果使用 aclfile 模式，可以调用 `acl load` 命令将 aclfile 中配置的 ACL 权限热加载进环境中，类似于 MySQL 中的 `flush privileges`。

<svg id="SvgjsSvg1006" width="611" height="235" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25,67)"><path id="SvgjsPath1009" d="M0 0L165.9999 0L165.9999 35.75 L0 35.75Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1010" d="M165.9999 0L373.96259999999995 0L373.96259999999995 35.75 L165.9999 35.75Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1011" d="M373.9626 0L561 0L561 35.75 L373.9626 35.75Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1012" d="M0 35.75L165.9999 35.75L165.9999 71.5 L0 71.5Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1013" d="M165.9999 35.75L373.96259999999995 35.75L373.96259999999995 71.5 L165.9999 71.5Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1014" d="M373.9626 35.75L561 35.75L561 71.5 L373.9626 71.5Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1015" d="M0 71.5L165.9999 71.5L165.9999 107.25 L0 107.25Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1016" d="M165.9999 71.5L373.96259999999995 71.5L373.96259999999995 107.25 L165.9999 107.25Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1017" d="M373.9626 71.5L561 71.5L561 107.25 L373.9626 107.25Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1018" d="M0 107.25L165.9999 107.25L165.9999 143 L0 143Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1019" d="M165.9999 107.25L373.96259999999995 107.25L373.96259999999995 143 L165.9999 143Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1020" d="M373.9626 107.25L561 107.25L561 143 L373.9626 143Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1021"><text id="SvgjsText1022" font-family="微软雅黑" text-anchor="start" font-size="16px" width="166px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="3.875" transform="rotate(0)"></text></g><g id="SvgjsG1023"><text id="SvgjsText1024" font-family="微软雅黑" text-anchor="start" font-size="16px" width="208px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="3.875" transform="rotate(0)"><tspan id="SvgjsTspan1025" dy="20" x="165.9999"><tspan id="SvgjsTspan1026" style="text-decoration:;">  redis.conf</tspan></tspan></text></g><g id="SvgjsG1027"><text id="SvgjsText1028" font-family="微软雅黑" text-anchor="start" font-size="16px" width="188px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="3.875" transform="rotate(0)"><tspan id="SvgjsTspan1029" dy="20" x="373.9626"><tspan id="SvgjsTspan1030" style="text-decoration:;">  users.acl</tspan></tspan></text></g><g id="SvgjsG1031"><text id="SvgjsText1032" font-family="微软雅黑" text-anchor="start" font-size="16px" width="166px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="39.625" transform="rotate(0)"><tspan id="SvgjsTspan1033" dy="20" x="0"><tspan id="SvgjsTspan1034" style="text-decoration:;">  配置方式</tspan></tspan></text></g><g id="SvgjsG1035"><text id="SvgjsText1036" font-family="微软雅黑" text-anchor="start" font-size="16px" width="208px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="39.625" transform="rotate(0)"><tspan id="SvgjsTspan1037" dy="20" x="165.9999"><tspan id="SvgjsTspan1038" style="text-decoration:;">  DSL</tspan></tspan></text></g><g id="SvgjsG1039"><text id="SvgjsText1040" font-family="微软雅黑" text-anchor="start" font-size="16px" width="188px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="39.625" transform="rotate(0)"><tspan id="SvgjsTspan1041" dy="20" x="373.9626"><tspan id="SvgjsTspan1042" style="text-decoration:;">  DSL</tspan></tspan></text></g><g id="SvgjsG1043"><text id="SvgjsText1044" font-family="微软雅黑" text-anchor="start" font-size="16px" width="166px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="75.375" transform="rotate(0)"><tspan id="SvgjsTspan1045" dy="20" x="0"><tspan id="SvgjsTspan1046" style="text-decoration:;">  加载 ACL 配置</tspan></tspan></text></g><g id="SvgjsG1047"><text id="SvgjsText1048" font-family="微软雅黑" text-anchor="start" font-size="16px" width="208px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="75.375" transform="rotate(0)"><tspan id="SvgjsTspan1049" dy="20" x="165.9999"><tspan id="SvgjsTspan1050" style="text-decoration:;">  重启 Redis 服务</tspan></tspan></text></g><g id="SvgjsG1051"><text id="SvgjsText1052" font-family="微软雅黑" text-anchor="start" font-size="16px" width="188px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="75.375" transform="rotate(0)"><tspan id="SvgjsTspan1053" dy="20" x="373.9626"><tspan id="SvgjsTspan1054" style="text-decoration:;">  ACL LOAD 命令</tspan></tspan></text></g><g id="SvgjsG1055"><text id="SvgjsText1056" font-family="微软雅黑" text-anchor="start" font-size="16px" width="166px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="111.125" transform="rotate(0)"><tspan id="SvgjsTspan1057" dy="20" x="0"><tspan id="SvgjsTspan1058" style="text-decoration:;">  持久化 ACL 配置</tspan></tspan></text></g><g id="SvgjsG1059"><text id="SvgjsText1060" font-family="微软雅黑" text-anchor="start" font-size="16px" width="208px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="111.125" transform="rotate(0)"><tspan id="SvgjsTspan1061" dy="20" x="165.9999"><tspan id="SvgjsTspan1062" style="text-decoration:;">  CONFIG REWRITE 命令</tspan></tspan></text></g><g id="SvgjsG1063"><text id="SvgjsText1064" font-family="微软雅黑" text-anchor="start" font-size="16px" width="188px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="111.125" transform="rotate(0)"><tspan id="SvgjsTspan1065" dy="20" x="373.9626"><tspan id="SvgjsTspan1066" style="text-decoration:;">  ACL SAVE 命令</tspan></tspan></text></g></g><g id="SvgjsG1067" transform="translate(168,25)"><path id="SvgjsPath1068" d="M 0 0L 250 0L 250 39L 0 39Z" stroke="none" fill="none"></path><g id="SvgjsG1069"><text id="SvgjsText1070" font-family="微软雅黑" text-anchor="middle" font-size="16px" width="250px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="5.5" transform="rotate(0)"><tspan id="SvgjsTspan1071" dy="20" x="125"><tspan id="SvgjsTspan1072" style="text-decoration:;">对比 conf 和 aclfile 两种方式</tspan></tspan></text></g></g></svg>

## 通过命令行来管理用户

上面可以看到，我们在安装好 Redis 后，需要通过编辑文件来选择使用哪种 ACL 模式（conf 还是外部 aclfile）。并且我们知道无论哪种方式，里面都是存一些 DSL 语句，那么自然我们可以直接在配置文件中配置各用户的 ACL 权限，但每次编辑完后都需要执行 `ACL LOAD` 或者重启 Redis 服务才能生效。

事实上我们可以直接在命令行下配置 ACL，**在命令行模式下配置的权限无需重启服务即可生效**。

只是我们在命令行模式下配置 ACL 后，必须要将其持久化到 aclfile 或者 conf 文件中，因为只有将权限持久化，下次重启才会自动加载该权限，**如果忘记持久化，一旦服务宕机或重启，该权限就会丢失**。

### 持久化的方式

```bash
# 如果使用 conf 模式，将 ACL 权限持久化到 redis.conf 文件中使用下面的命令：
config rewrite

# 如果使用 aclfile 模式，将 ACL 权限持久化到 users.acl 文件中使用下面的命令：
acl save
```

下面看如何使用命令来创建、编辑用户以及它们的 ACL。

### 增删改查用户

#### 1）创建和修改用户

使用 [`ACL SETUSER`](https://redis.io/commands/acl-setuser/) 命令来创建和编辑用户 ACL。

```bash
# username 区分大小写 
# 若用户不存在，则按默认规则创建用户，并为其增加 <rules>。若用户存在则在已有规则上增加 <rules>。
ACL SETUSER <username> <rules> 
```

默认规则下新增的用户处于非活跃状态，且没有密码，同时也没有任何命令和 key 的权限：

```bash {1, 5}
127.0.0.1:6379> acl setuser zhangsan
OK
127.0.0.1:6379> acl list
1) "user default on nopass sanitize-payload ~* &* +@all"
2) "user zhangsan off resetchannels -@all"
127.0.0.1:6379>
```

所以我们可以在新增用户时，指定一些规则，包含密码和权限等：

```bash
# 创建 lisi 用户，on 为活跃状态，密码为 123456，允许对所有 demo 开头的 key 使用 get 和 set 命令
127.0.0.1:6379> acl setuser lisi on >123456 ~demo* +get +set

# 让之前创建的 zhangsan 用户可用，并给它新增一个密码 123456
127.0.0.1:6379> acl setuser zhangsan on >123456

# 为 zhangsan 用户新增 list 类别下所有命令的权限
127.0.0.1:6379> acl setuser zhangsan on +@list
```

查看现在的 `acl list`，可以发现密码都是一个 sha256 码的字符串，不是明文存储，还是比较安全的：

```bash
127.0.0.1:6379> acl list
1) "user default on nopass sanitize-payload ~* &* +@all"
2) "user lisi on #8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92 ~demo* resetchannels -@all +get +set"
3) "user zhangsan on #8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92 resetchannels -@all +@list"
```

需要注意的是，多次调用 `SETUSER` 不会重置用户，而只会将 ACL 规则应用于现有用户。什么意思呢？

```bash
127.0.0.1:6379> acl setuser zhangsan +get
OK
127.0.0.1:6379> acl setuser zhangsan +set
OK
```

以上两次调用 `SETUSER` 将导致 `zhangsan` 这个用户能够调用 [`GET`](https://redis.io/commands/get/) 和 [`SET`](https://redis.io/commands/set/)。

#### 2）查询用户

```bash
# 查看所有用户名
127.0.0.1:6379> acl users

# 查看所有用户的 acl 信息
127.0.0.1:6379> acl list

# 查看当前登录的用户名
127.0.0.1:6379> acl whoami

# 查看指定用户的 ACL 权限
127.0.0.1:6379> acl getuser <username>
```

#### 3）删除用户

```bash
# 删除指定用户
127.0.0.1:6379> acl deluser <username>
```

### 登录和切换指定用户

#### 1）登录指定用户

对于用 ACL 管理的用户，需要使用 `redis-cli --user xxx  --pass yyy` 来登陆：

```bash
[root@VM-16-7-centos ~]# redis-cli -h 127.0.0.1 -p 6379 --user lisi --pass 123456
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
127.0.0.1:6379> acl whoami
(error) NOPERM this user has no permissions to run the 'acl|whoami' command
127.0.0.1:6379>

[root@VM-16-7-centos ~]# redis-cli -h 127.0.0.1 -p 6379 --user wangwu --pass 123456
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
127.0.0.1:6379> acl whoami
"wangwu"
127.0.0.1:6379>
```

#### 2）切换到指定用户

```bash
# 使用 auth 命令切换用户
127.0.0.1:6379> auth <username> <password>
```

### 热加载命令

如果直接在 aclfile 中修改或新增 ACL 权限，修改之后不会立刻生效，需要执行如下命令将配置热加载至 Redis 服务中。

```bash
127.0.0.1:6379> acl load
```

### 持久化命令

如果是通过命令行修改或新增 ACL 权限，需要将其持久化到配置文件中，否则在重启 Redis 服务后，这些 ACL 权限就会丢失。

```bash
# 如果使用的是 aclfile 方式，将 ACL 权限持久化到磁盘的 aclfile 中
127.0.0.1:6379> acl save

# 如果使用的是 conf 方式，将 ACL 权限持久化到 redis.conf 中
127.0.0.1:6379> config rewrite
```

### 查看命令类别，用于授权

命令类别的出现就是为了方便我们定义用户权限。因为如果通过一个接一个地指定所有命令来设置用户 ACL 确实很烦人，所以我们这样做：

```bash
# 通过 +@all 和 -@dangerous，我们包含了所有命令，然后在 Redis 命令表中删除了所有标记为危险的命令
127.0.0.1:6379> acl setuser zhangsan on +@all -@dangerous >123456... ~*
```

那么有哪些命令类别可供选择呢？可以用如下命令进行查看：

```bash
# acl cat 显示所有的命令类别
127.0.0.1:6379> acl cat
 1) "keyspace"
 2) "read"
 3) "write"
 4) "set"
 5) "sortedset"
 6) "list"
 7) "hash"
 8) "string"
 9) "bitmap"
10) "hyperloglog"
11) "geo"
12) "stream"
13) "pubsub"
14) "admin"
15) "fast"
16) "slow"
17) "blocking"
18) "dangerous"
19) "connection"
20) "transaction"
21) "scripting"
```

每一个命令类别具体包含了哪些命令呢？可以用如下命令进行查看：

```bash
# acl cat <category> 显示指定类别下的所有命令
127.0.0.1:6379> acl cat list
 1) "rpushx"
 2) "lrange"
 3) "lindex"
 4) "blpop"
 5) "lpop"
 6) "brpoplpush"
 7) "lset"
 8) "rpoplpush"
 9) "lpos"
10) "lrem"
11) "lpushx"
12) "llen"
13) "blmove"
14) "brpop"
15) "sort"
16) "rpop"
17) "ltrim"
18) "sort_ro"
19) "rpush"
20) "blmpop"
21) "lmove"
22) "lmpop"
23) "lpush"
24) "linsert"
```

### 其他常用 ACL 命令

```bash
# 查看 ACL 安全日志
127.0.0.1:6379> acl log

# 查看 help 文档
127.0.0.1:6379> acl help
```

## ACL 规则

前面大量介绍了 ACL 的一些命令，ACL 是使用 DSL（Domain specific language）定义的，一个 DSL 中最核心也是最难记忆的就是规则的写法。

以下是整理的一些 ACL 规则的列表，某些规则只是一个单词，用于激活或删除标志或对用户 ACL 执行更改。其他规则是与命令或类别名称、键模式等、关联的字符前缀。

### 启用和禁用用户

* `on`：启用用户，可以以该用户身份进行认证。
* `off`：禁用用户，不再可以使用此用户进行身份验证，但是已经通过身份验证的连接仍然可以使用。

### 允许和禁止调用命令

* `+<command>`：将命令添加到用户可以调用的命令列表中。
* `-<command>`：将命令从用户可以调用的命令列表中移除。
* `+@<category>`：允许用户调用 `<category>` 类别中的所有命令，有效类别为 `@admin`，`@set`，`@sortedset` 等，可通过调用 [`ACL CAT`](https://redis.io/commands/acl-cat/) 命令查看完整列表。特殊类别 `@all` 表示所有命令，包括当前和未来版本中存在的所有命令。
* `-@<category>`：禁止用户调用 `<category>` 类别中的所有命令。
* `+<command>|subcommand`：允许使用已禁用命令的特定子命令。
* `allcommands`：`+@all` 的别名，包括当前存在的命令以及将来通过模块加载的所有命令。
* `nocommands`：`-@all` 的别名，禁止调用所有命令。

### 允许和禁止访问某些 Key

* `~<pattern>`：添加可以在命令中提及的键模式。例如 `~*` 允许所有键。
* `allkeys`：`~*` 的别名。
* `resetkeys`：刷新允许的键模式列表。例如 ACL `~foo:* ~bar:* resetkeys ~objects:*`，将导致客户端只能访问与模式 `objects:*` 匹配的键。

### 为用户配置有效密码

* `><password>`：将此密码添加到用户的有效密码列表中。例如，`>mypass`将 `mypass` 添加到有效密码列表中。该命令会清除用户的 `nopass` 标记。每个用户可以有任意数量的有效密码。
* `<<password>`：从有效密码列表中删除此密码。若该用户的有效密码列表中没有此密码则会返回错误信息。
* `#<hash>`：将此 SHA-256 哈希值添加到用户的有效密码列表中。该哈希值将与为 ACL 用户输入的密码的哈希值进行比较。允许用户将哈希存储在 users.acl 文件中，而不是存储明文密码。仅接受 SHA-256 哈希值，因为密码哈希必须为 64 个字符且小写的十六进制字符。
* `!<hash>`：从有效密码列表中删除该哈希值。当不知道哈希值对应的明文是什么时很有用。
* `nopass`：移除该用户已设置的所有密码，并将该用户标记为 `nopass` 无密码状态：任何密码都可以登录。`resetpass` 命令可以清除 `nopass` 这种状态。
* `resetpass`：清空该用户的所有密码列表，而且移除 `nopass` 状态。`resetpass` 之后用户没有关联的密码同时也无法使用无密码登录，因此 `resetpass` 之后必须添加密码或改为 `nopass` 状态才能正常登录。
* `reset`：重置用户状态为初始状态。执行以下操作 `resetpass`，`resetkeys`，`off`，`-@all`。

## 参考资料

* [官方文档 - ACL](https://redis.io/docs/manual/security/acl/)

（完）
