# IEDA 配置 JDK 版本

## 由 IDEA 决定的版本

> 注意：要按照下边的顺序依次修改。

### 1. 设置平台的 JDK 版本

```
File --> Project Structure --> Platform Settings --> SDKs
```

### 2. 设置项目和模块的 JDK 版本

方法 1：

```
File --> Project Structure --> Project Settings --> 
          Project --> SDK
          Modules --> Dependencies --> Module SDK
```

方法 2：

```
Settings --> Build, Execution, Deployment --> Compiler --> Java Compiler --> 
  Per-Module bytecode version（为每个工程模块设置JDK版本）
```

## 由 Maven 决定的版本

### 1. IDEA 中模块的 JDK 版本（可选，可从 `pom.xml` 读取）

```
File --> Project Structure --> Project Settings -->
         Modules --> 
                Sources --> Language level
                Dependencies --> Module SDK  
```

### 2. IDEA 中编译工具的 JDK 版本（可选，可从 `pom.xml` 读取）

> 以及构建工具（Maven/Gradle）的 JDK 版本

```
File --> Setting --> Build,Execution,Deployment --> 
           Build Tools --> 
               Maven --> 
                        importing --> JDK for importer  
                        Runner --> JRE  
           Complier --> Java Compiler --> Per-module bytecode version --> Target bytecode version
```

### 3. 设置运行时的 JDK 版本

> 即指定 Application/JUnit/main 方法类的运行时 JDK 版本

```
Run --> Edit Configurations --> Run/Debug Configurations
        若应用为 SpringBoot：Configuration --> Environment --> JRE --> 选择正确的 JRE  
        若应用为 Application：Build and run --> 选择正确的 JDK
        若应用为 JUnit：Run --> Configuration --> 选择正确的 JDK
```

其中，通过给 `pom.xml` 添加如下配置，会自动修改上面的 1 和 2 两个配置：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <!-- <version>3.5.1</version> -->
            <!-- 指定maven编译的jdk版本。对于JDK8，写成8或者1.8都可以 -->
            <configuration>
                <source>8</source>
                <target>8</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

（完）
