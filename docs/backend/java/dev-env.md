# 开发环境准备

## JDK

### 下载

JDK V1.8 下载地址：

+ [https://www.oracle.com/java/](https://www.oracle.com/java/)
+ [https://repo.huaweicloud.com/java/jdk/](https://repo.huaweicloud.com/java/jdk/)（推荐）

### 安装和配置

安装步骤（Windows）：

+ 双击运行、安装
+ 添加环境变量
  + `JAVA_HOME`：jdk 的安装路径（例如 `D:\jdk1.8\jdk`）
  + `CLASSPATH`：`,;%JAVA_HOME%\lib;%JAVA_HOME%\lib\tools.jar;`
  + `PATH`：`%JAVA_HOME%\bin`
+ CMD 命令行查询：`java -version`

## Maven

### 下载

Maven 下载地址：

+ [http://maven.apache.org/download.cgi](http://maven.apache.org/download.cgi)
  + 历史版本比如 [Maven 3.6.3](https://archive.apache.org/dist/maven/maven-3/3.6.3/binaries/)，下载 [apache-maven-3.6.3-bin.zip](https://archive.apache.org/dist/maven/maven-3/3.6.3/binaries/apache-maven-3.6.3-bin.zip)

### 安装和配置

+ 放到本地磁盘，解压
+ 配置环境变量
  + `MAVEN_HOME`：maven 的安装路径（例如 `D:\maven\apache-maven-3.6.3`）
  + `PATH`：`%MAVEN_HOME%\bin`
+ CMD 命令行查询：`mvn -v`

### 建议配置（可选）

+ 修改中央仓库为阿里的 Maven 镜像仓库

修改 `D:\maven\apache-maven-3.6.3\conf\settings.xml`，找到 `<>mirrors` 节点，[添加如下内容](https://developer.aliyun.com/mvn/guide)：

```xml {16-21}
<?xml version="1.0" encoding="UTF-8"?>
  ...
  <mirrors>
    <!-- mirror
     | Specifies a repository mirror site to use instead of a given repository. The repository that
     | this mirror serves has an ID that matches the mirrorOf element of this mirror. IDs are used
     | for inheritance and direct lookup purposes, and must be unique across the set of mirrors.
     |
    <mirror>
      <id>mirrorId</id>
      <mirrorOf>repositoryId</mirrorOf>
      <name>Human Readable Name for this Mirror.</name>
      <url>http://my.repository.com/repo/path</url>
    </mirror>
     -->
    <mirror>
      <id>aliyunmaven</id>
      <mirrorOf>*</mirrorOf>
      <name>阿里云公共仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
  ...
```

+ 修改依赖的默认下载路径

先在 maven 的安装路径（例如 `D:\maven\apache-maven-3.6.3\`）下新建一个文件夹 `repository`。

然后依旧是 `settings.xml` 文件，找到 `<localRepository>`，添加如下内容：

```xml {7}
  <!-- localRepository
   | The path to the local repository maven will use to store artifacts.
   |
   | Default: ${user.home}/.m2/repository
  <localRepository>/path/to/local/repo</localRepository>
  -->
  <localRepository>D:\maven\apache-maven-3.6.3\repository</localRepository>
```

+ 修改 IDEA 中关于 maven 的配置：
  + 位于 `Settings` -> `Build, Execution, Deployment` -> `Build Tools -> Maven`，修改下面三项：
  + Maven home path: `D:\maven\apache-maven-3.6.3`
  + User settings file: `D:\maven\apache-maven-3.6.3\conf\settings.xml`
  + Local repository: `D:\maven\apache-maven-3.6.3\repository`

## Mysql 安装

+ [MySQL 的安装](/backend/mysql/installation-of-mysql/)

## SpringBoot 项目创建

### 项目创建

+ 打开 IDEA，新建项目，左边栏选择 `Spring Initializr`。
+ 选择 Project SDK 即自己安装的 JDK 版本。
+ 如果要创建 SpringBoot 2.3.x 版本的项目，就修改 `Server URL` 为 `https://start.aliyun.com`，否则只能选择高版本的 SpringBoot。
+ 填写项目信息
  + Name：项目名称
  + Location：项目位置，一般路径的最后（文件夹名）就是项目名称
  + Language：`Java`
  + Type：`Maven`
  + Group：组，也就是公司域名反过来，例如 `com.example`
  + Artifact：标识，一般就写项目名称
  + Package name：软件包名称，一般就是组+项目名称
    + 比如组是 `com.example`，项目名称是 `demo-api`
    + 软件包名称就用点拼接，设置为 `com.example.demo.api` 或 `com.example.demo-api`
  + JDK：项目编译和运行时所依赖的 JDK 版本
  + Java：代码里将要用到的语法和语言特性版本，不能高于项目 JDK
  + Packaging：`Jar`
+ 安装对应的插件，最起码要包含如下：
  + Web：Spring Web
  + SQL：JDBC API，MyBatis Framework，MySQL Driver
+ 完成项目创建

### 基础配置

+ 检查并修改修改项目 Maven 仓库（`Settings` -> `Build, Execution, Deployment` -> `Build Tools -> Maven`），共三项
+ 检查项目用的 SDK 版本是否正确
  + （`Settings` -> `Project Settings` -> `Project`），共两项（Project SDK 和 Project Language Level）
  + （`Settings` -> `Project Settings` -> `Modules`），共一项（Language Level）
+ 将 `application.properties` 修改为 `application.yml`，然后编辑。

（完）
