# SpringBoot 集成

## 环境依赖

+ JDK V1.8
+ SpringBoot 2.3.x

## 数据库环境准备

### 修改 MySQL 大小写敏感

Linux 环境中安装的 MySQL 默认是大小写敏感的，需要关闭。

因为 Activiti 比较坑，它自动创建表的时候用的是**小写**，操作表的代码是**大写**，如果不关闭 MySQL 的大小写敏感机制，代码执行会报错。

```bash
vim /etc/my.cnf
```

找到如下内容并修改（或添加）：

```bash
# 是否对 sql 语句大小写敏感，1 表示不敏感
lower_case_table_names=1
```

然后重启 MySQL。

### 创建数据库

创建一个数据库，比如就叫 `activiti`，剩下的 activiti7 相关的表会在运行 SpringBoot 项目后自动创建。

## 安装 Activiti 依赖

### 所需依赖

从 [Activiti 官方网站](https://activiti.gitbook.io/activiti-7-developers-guide/getting-started/getting-started-activiti-core#taskruntime-api) 可以查到的坐标如下：

```xml
<!-- 与 SpringBoot 整合用的坐标 -->
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-spring-boot-starter</artifactId>
</dependency>
<!-- 这是个内存数据库，项目启动时初始化，项目结束后释放，由于我们用 MySQL 持久化数据，所以这个不需要 -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>
<!-- Activiti7 版本的坐标 -->
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-dependencies</artifactId>
    <version>7.1.0-M16</version>
    <scope>import</scope>
    <type>pom</type>
</dependency>
```

### 安装依赖

**不过上面的包在官方和阿里的 Maven 仓库都搜不到（本地导入不了）**，所以需要在[阿里云 Maven](https://developer.aliyun.com/mvn/search)中分别搜：

+ `activiti-spring-boot-starter`

  | 仓库    | 文件名                                    | group-Id     | artifact-Id                  | version  | classifier | packaging |
  | ------- | ----------------------------------------- | ------------ | ---------------------------- | -------- | ---------- | --------- |
  | central | activiti-spring-boot-starter-7.1.0.M4.jar | org.activiti | activiti-spring-boot-starter | 7.1.0.M4 | \--        | jar       |

+ `activiti-dependencies`

  | 仓库    | 文件名                             | group-Id                  | artifact-Id           | version  | classifier | packaging |
  | ------- | ---------------------------------- | ------------------------- | --------------------- | -------- | ---------- | --------- |
  | central | activiti-dependencies-7.1.0.M4.pom | org.activiti.dependencies | activiti-dependencies | 7.1.0.M4 | \--        | pom       |

然后添加到 `pom.xml`：

```xml
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-spring-boot-starter</artifactId>
    <version>7.1.0.M4</version>
</dependency>
<dependency>
    <groupId>org.activiti.dependencies</groupId>
    <artifactId>activiti-dependencies</artifactId>
    <version>7.1.0.M4</version>
    <type>pom</type>
</dependency>

```

### 配置 Activiti7 历史表创建

为了在项目启动时自动生成 activiti 历史表，需要在 `application.yml` 中增加如下配置：

```yaml
spring:
  activiti:
    database-schema-update: true # 生产环境改为 false
    history-level: audit
    db-history-used: true
    check-process-definitions: false # 关闭自动部署
```

## 版本 Bug

### M4

Bug 描述：存在自建表缺失两个字段的 Bug，需要补充字段。

修复方式：执行下面两条 SQL 语句：

```sql
-- ----------------------------
-- 修复Activiti7的M4版本缺失字段Bug
-- ----------------------------
alter table ACT_RE_DEPLOYMENT add column PROJECT_RELEASE_VERSION_ varchar(255) DEFAULT NULL;
alter table ACT_RE_DEPLOYMENT add column VERSION_ varchar(255) DEFAULT NULL;
```

### M5

**不要使用 M5 版本的 Activiti7，它存在 Bug**。

Bug 描述：会在每次项目启动的时候，都会在 `act_re_deployment` 表中自动增加一条数据 `SpringAutoDeployment`。

（完）
