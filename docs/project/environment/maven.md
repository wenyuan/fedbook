# Maven 环境配置

## 安装 Maven

- 下载二进制压缩包并解压缩即可：[apache-maven-3.9.11-bin.zip](https://dlcdn.apache.org/maven/maven-3/3.9.11/binaries/apache-maven-3.9.11-bin.zip)

## 配置本地仓库（可选）

> 配置本地仓库是为了更灵活地管理依赖包存放位置。

在 `conf/settings.xml` 文件的第55行，配置 repository 目录地址（根据 Maven 解压缩的位置，修改这个文件夹地址即可），其中 `repository` 这个目录需要自己创建一个：

```xml
  <!-- localRepository
   | The path to the local repository maven will use to store artifacts.
   |
   | Default: ${user.home}/.m2/repository
  <localRepository>/path/to/local/repo</localRepository>
  -->
  <localRepository>D:\Code\apache-maven-3.9.11\repository</localRepository>
```

## 配置阿里云仓库（可选）

> 配置阿里云仓库，这样下载软件包的速度会快很多。

编辑 `conf/settings.xml`，找到 `<mirrors>` 节点，可以配置多个子节点，但是它只会使用其中的一个节点，即默认情况下只有第一个生效，只有当前一个 mirror 无法连接的时候，才会去找后一个：

```xml
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
    <!-- 阿里云公共仓库（使用 HTTPS） -->
    <mirror>
      <id>aliyunmaven</id>
      <mirrorOf>*</mirrorOf>
      <name>阿里云公共仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>

    <!-- 华为云镜像（备用） -->
    <mirror>
      <id>huaweicloud</id>
      <mirrorOf>*</mirrorOf>
      <name>华为云公共仓库</name>
      <url>https://repo.huaweicloud.com/repository/maven/</url>
    </mirror>

    <!-- Maven 中央仓库（最后备用） -->
    <mirror>
      <id>central-mirror</id>
      <mirrorOf>central</mirrorOf>
      <name>Maven Central</name>
      <url>https://repo.maven.apache.org/maven2</url>
    </mirror>

    <!-- 阻止 HTTP 协议 -->
    <mirror>
      <id>maven-default-http-blocker</id>
      <mirrorOf>external:http:*</mirrorOf>
      <name>Pseudo repository to mirror external repositories initially using HTTP.</name>
      <url>http://0.0.0.0/</url>
      <blocked>true</blocked>
    </mirror>
  </mirrors>
```

## 配置 IDEA 环境

> IDEA 默认的 Maven 配置是 Bundled（Maven3）， 我们需要把这个 Maven 更换成我们自己的。

进入如下配置页面：

```
File --> Settings --> Build, Execution, Deployment --> Build Tools --> Maven
```

分别配置：

- Maven 的解压缩路径
- `settings.xml` 文件路径
- `repository`文件夹路径

```
Maven home path: D:\Code\apache-maven-3.9.11
    
User settings file: D:\Code\apache-maven-3.9.11\conf\settings.xml
    
Local repository: D:\Code\apache-maven-3.9.11\repository
```

IDEA 的共享索引要设置成不下载，否则 IDEA 会自动从网上远程下载依赖库，而不是用本地 Maven 的依赖库：

```
File --> Settings --> Tools --> Shared Indexes
```

> 2024 开始的版本好像不需要了。

（完）
