# 常用注解

> 在学习 SpringBoot 的实战项目的时候发现不理解的注解有很多，在不明白功能的情況下学习进度不顺利，先就常用的注解系统整理下。

## 核心注解

`@SpringBootApplication` 注解是 SpringBoot 的核心注解，创建项目之后会默认加在启动类上，一般不会主动去使用它。

```java
@SpringBootApplication
public class SpringSecurityJwtGuideApplication {
      public static void main(java.lang.String[] args) {
        SpringApplication.run(SpringSecurityJwtGuideApplication.class, args);
    }
}
```

它其实是一个组合注解，集合了：`@Configuration`、`@EnableAutoConfiguration`、`@ComponentScan`。

+ `@EnableAutoConfiguration`：启用 SpringBoot 的自动配置机制。
+ `@ComponentScan`：扫描被 `@Component`（`@Service`，`@Controller`）注解的 Bean，注解默认会扫描该类所在的包下所有的类。
+ `@Configuration`：允许在 Spring 上下文中注册额外的 Bean 或导入其他配置类。

## Spring Bean 注解

### @Autowired

作用：自动将 Spring 容器中相应的 Bean 注入到当前类，避免手动实例化对象。

通常与构造函数、Setter 方法或字段一起使用。

用法：

```java
@Service
public class UserService {
  ......
}

@RestController
@RequestMapping("/users")
public class UserController {
   @Autowired
   private UserService userService;
   ......
}
```

我们一般使用 `@Autowired` 注解让 Spring 容器帮我们自动装配 Bean。

不过现在（2025年）又有说法说不推荐使用字段注入（Field Injection），至少下面的代码 IDE 会给出黄色波浪线提示：

```java {2}
public class YourClass {
    @Autowired
    private SysConfigDao sysConfigDao;
    
    // 你的方法
}
```

给出的理由是字段注入有以下缺点（摘抄自 AI 总结）：

+ 不利于测试：字段注入依赖于反射机制，测试时很难通过构造函数或 setter 方法直接注入模拟对象。这使得单元测试更加困难。
+ 潜在的空指针异常：由于字段注入发生在对象构造之后，使用被注入字段时可能会导致空指针异常，尤其是在构造函数中使用这些字段时。
+ 不利于不可变类：字段注入要求类中的某些字段为非final，这破坏了类的不可变性。
+ 隐藏的依赖关系：通过字段注入的依赖关系没有明确地在构造函数或 setter 方法中体现出来，导致代码的可读性和可维护性降低。

因此（AI）建议使用构造函数注入或 setter 注入，代码这么写：

+ 使用构造函数注入

```java
public class YourClass {

    private final SysConfigDao sysConfigDao;

    @Autowired
    public YourClass(SysConfigDao sysConfigDao) {
        this.sysConfigDao = sysConfigDao;
    }

    // 你的方法
}
```

+ 使用 setter 注入

```java
public class YourClass {

    private SysConfigDao sysConfigDao;

    @Autowired
    public void setSysConfigDao(SysConfigDao sysConfigDao) {
        this.sysConfigDao = sysConfigDao;
    }

    // 你的方法
}
```

### @Component，@Repository，@Service，@Controller

作用：要想把类标识成会被 Spring 扫描并注册为一个 Bean 的类，可以采用以下注解实现：

+ `@Component`：通用的注解，可标注任意类为 Spring 组件。如果一个 Bean 不知道属于哪个层，可以使用` @Component` 注解标注。
+ `@Repository`：对应持久层即 Dao 层，主要用于数据库相关操作。
+ `@Service`：对应服务层，主要涉及一些复杂的逻辑，需要用到 Dao 层。
+ `@Controller`：对应 SpringMVC 控制层，主要用户接受用户请求并调用 Service 层返回数据给前端页面。
  + 一般是在前后端不分离的项目中使用，返回一个视图。
  + 对于前后端分离项目，需要搭配 `@ResponseBody` 来返回 JSON 或 XML 形式数据。

### @RestController

作用：用于表示这是个控制器 Bean，并且是将函数的返回值直接填入 HTTP 响应体中，是 REST 风格的控制器。

它是 `@Controller` 和 `@ResponseBody` 的合集。

### @Scope

作用：用于指定 Bean 的作用域。

使用方法：

```java
@Bean
@Scope("singleton")
public Person personSingleton() {
    return new Person();
}
```

四种常见的 Spring Bean 的作用域：

+ `singleton`：唯一 Bean 实例，Spring 中的 Bean 默认都是单例的。
+ `prototype`：每次请求都会创建一个新的 Bean 实例。
+ `request`：每一次 HTTP 请求都会产生一个新的 Bean，该 Bean 仅在当前 HTTP request 内有效。
+ `session`：每一次 HTTP 请求都会产生一个新的 Bean，该 Bean 仅在当前 HTTP session 内有效。

### @Configuration

作用：用于定义 Bean，一般用来标志配置类，可以使用 `@Component` 注解替代，不过使用 `Configuration` 注解声明配置类更加语义化。

使用方法：

```java
@Configuration
public class AppConfig {
    @Bean
    public TransferService transferService() {
        return new TransferServiceImpl();
    }
}
```

### @Bean

区别：

+ 类级别注解（`@Component` 及其衍生注解）：会将类标记为 Spring 容器中的 Bean，它们主要用于类级别的注解。
+ 方法级别注解（`@Bean`）：主要用在配置类中的方法上，用于手动注册 Bean。

@Bean适用场景：

+ 需要注册第三方库中的类时
+ 需要对 Bean 进行复杂配置时
+ 需要根据条件创建不同的 Bean 实例时

示例：

```java
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // 可以进行详细配置
        return restTemplate;
    }
}
```

## HTTP 请求注解

5 种常见的请求类型:

+ **GET**：请求从服务器获取特定资源。举个例子：`GET /users`（获取所有学生）
+ **POST**：在服务器上创建一个新的资源。举个例子：`POST /users`（创建学生）
+ **PUT**：更新服务器上的资源（客户端提供更新后的整个资源）。举个例子：`PUT /users/12`（更新编号为 12 的学生）
+ **DELETE**：从服务器删除特定的资源。举个例子：`DELETE /users/12`（删除编号为 12 的学生）
+ **PATCH**：更新服务器上的资源（客户端提供更改的属性，可以看做作是部分更新），使用的比较少。

### @RequestMapping

作用：用于映射 HTTP 请求到控制器方法，并指定 URL 路径。

用法：

```java
@Controller
@RequestMapping("/my")
public class MyController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }
}
```

### @GetMapping

作用：处理 GET 请求。

用法：`@GetMapping("users")` 等价于 `@RequestMapping(value="/users",method=RequestMethod.GET)`

```java
@GetMapping("/users")
public ResponseEntity<List<User>> getAllUsers() {
    return userRepository.findAll();
}
```

### @PostMapping

作用：处理 POST 请求。

用法：`@PostMapping("users")` 等价于 `@RequestMapping(value="/users",method=RequestMethod.POST)`

```java
@PostMapping("/users")
public ResponseEntity<User> createUser(@Valid @RequestBody UserCreateRequest userCreateRequest) {
    return userRespository.save(user);
}
```

### @PutMapping

作用：处理 PUT 请求。

用法：`@PutMapping("/users/{userId}")` 等价于 `@RequestMapping(value="/users/{userId}",method=RequestMethod.PUT)`

```java
@PutMapping("/users/{userId}")
public ResponseEntity<User> updateUser(@PathVariable(value = "userId") Long userId,
  @Valid @RequestBody UserUpdateRequest userUpdateRequest) {
    ......
}
```

### @DeleteMapping

作用：处理 DELETE 请求。

用法：`@DeleteMapping("/users/{userId}")` 等价于 `@RequestMapping(value="/users/{userId}",method=RequestMethod.DELETE)`

```java
@DeleteMapping("/users/{userId}")
public ResponseEntity deleteUser(@PathVariable(value = "userId") Long userId){
    ......
}
```

### @PatchMapping

作用：处理 PATCH 请求。

用法：（说实话，不常用这种请求类型）

```java
@PatchMapping("/profile")
public ResponseEntity updateStudent(@RequestBody StudentUpdateRequest studentUpdateRequest) {
    studentRepository.updateDetail(studentUpdateRequest);
    return ResponseEntity.ok().build();
}
```

## 前后端传值

### @PathVariable 和 @RequestParam

作用：

+ `@PathVariable` 用于获取路径参数
+ `@RequestParam` 用于获取查询参数

用法：

```java
@GetMapping("/klasses/{klassId}/teachers")
public List<Teacher> getKlassRelatedTeachers(
         @PathVariable("klassId") Long klassId,
         @RequestParam(value = "type", required = false) String type ) {
    ...
}
```

如果请求的 url 是：`/klasses/{123456}/teachers?type=web`

那么服务端获取到的数据就是：`klassId=123456,type=web`

### @RequestBody

作用：用于读取 Request 请求（可能是 POST、PUT、DELETE、GET 请求）的 body 部分并且 **Content-Type 为 application/json** 格式的数据，接收到数据之后会自动将数据绑定到 Java 对象上去。

系统会使用 HttpMessageConverter 或者自定义的 HttpMessageConverter 将请求的 body 中的 json 字符串转换为 java 对象。

用法：

Controller 接口：

```java
@PostMapping("/sign-up")
public ResponseEntity signUp(@RequestBody @Valid UserRegisterRequest userRegisterRequest) {
    userService.save(userRegisterRequest);
    return ResponseEntity.ok().build();
}
```

`UserRegisterRequest` 对象：

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String password;
    @FullName
    @NotBlank
    private String fullName;
}
```

假设发送 post 请求到这个接口，并且 body 携带 JSON 数据：

```json
{"userName":"admin","fullName":"Zhang San","password":"abc123456"}
```

这样后端就可以直接把 JSON 格式的数据映射到 `UserRegisterRequest` 类上了。

**Tips**：

+ 一个请求方法只可以有一个 `@RequestBody`
+ 但可以有多个 `@PathVariable` 和 `@RequestParam`

## 读取配置信息

可以使用一些注解读取 `application.yml` 中的配置信息。

例如配置文件里有一部分内容如下：

```yaml
emos:
  jwt:
    secret: abc123456
    expire: 5
    cache-expire: 10
  email:
    system: 发件人邮箱
    hr: 收件人邮箱
```

### @value

作用：用于将配置文件中的属性值注入到当前字段中。

```java
@Value("${emos.email.system}")
private String mailbox;
```

### @ConfigurationProperties

作用：读取配置信息并与 Bean 绑定。

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "emos")
class EmosProperties {
    private JwtProperties jwt;
    private EmailProperties email;

    // Getters and Setters

    public static class JwtProperties {
        private String secret;
        private int expire;
        private int cacheExpire;

        // Getters and Setters
    }
    
    public static class EmailProperties {
        private String system;
        private String hr;

        // Getters and Setters
    }
}
```

然后，在主应用程序类或任何需要的地方，启用 `@ConfigurationProperties`：

```java {6}
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(EmosProperties.class)
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

这样就可以使用 `@Autowired` 注入配置类，并在代码中使用这些配置：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Autowired
    private EmosProperties emosProperties;

    @GetMapping("/test")
    public String test() {
        return "JWT Secret: " + emosProperties.getJwt().getSecret() +
               ", Expire: " + emosProperties.getJwt().getExpire() +
               ", Cache Expire: " + emosProperties.getJwt().getCacheExpire() +
               ", Email System: " + emosProperties.getEmail().getSystem() +
               ", Email HR: " + emosProperties.getEmail().getHr();
    }
}
```

### @PropertySource

作用：读取指定 properties 文件。

用法：

```java
@Component
@PropertySource("classpath:website.properties")

class WebSite {
    @Value("${url}")
    private String url;

    省略getter/setter
    ......
}
```

## 参数校验

即对前端提交的数据进行校验，避免用户向后端请求一些非法数据。

SpringBoot 中遵循的是 JSR（Java Specification Requests）这样一套 JavaBean 参数校验的标准，它定义了很多常用的校验注解，我们可以直接将这些注解加在我们 Java Bean 的属性上面，这样就可以在需要校验的时候进行校验了，非常方便。

校验的时候我们实际用的是 Hibernate Validator 框架，它已经存在于 SpringBoot 项目的 spring-boot-starter-web 依赖中。

如果使用 Spring Boot Starter Web（`spring-boot-starter-web`），那么会默认包含下面两个依赖及其注解库：

+ `javax.validation.constraints`：定义了一组通用的校验注解，这些注解可以在任何支持 JSR-303 的实现中使用。
+ `org.hibernate.validator.constraints`：提供了一些额外的校验注解，这些注解在 JSR-303 规范中没有定义。

### 一些常用的字段验证的注解

+ `@NotEmpty`：被注释的字符串的不能为 null 也不能为空
+ `@NotBlank`：被注释的字符串非 null，并且必须包含一个非空白字符
+ `@Null`：被注释的元素必须为 null
+ `@NotNull`：被注释的元素必须不为 null
+ `@AssertTrue`：被注释的元素必须为 true
+ `@AssertFalse`：被注释的元素必须为 false
+ `@Pattern(regex=,flag=)`：被注释的元素必须符合指定的正则表达式
+ `@Email`：被注释的元素必须是 Email 格式。
+ `@Min(value)`：被注释的元素必须是一个数字，其值必须大于等于指定的最小值
+ `@Max(value)`：被注释的元素必须是一个数字，其值必须小于等于指定的最大值
+ `@DecimalMin(value)`：被注释的元素必须是一个数字，其值必须大于等于指定的最小值
+ `@DecimalMax(value)`：被注释的元素必须是一个数字，其值必须小于等于指定的最大值
+ `@Size(max=, min=)`：被注释的元素的大小必须在指定的范围内
+ `@Digits (integer, fraction)`：被注释的元素必须是一个数字，其值必须在可接受的范围内
+ `@Past`：被注释的元素必须是一个过去的日期
+ `@Future`：被注释的元素必须是一个将来的日期
+ ......

### 验证请求体（RequestBody）

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Person {

    @NotNull(message = "classId 不能为空")
    private String classId;

    @Size(max = 33)
    @NotNull(message = "name 不能为空")
    private String name;

    @Pattern(regexp = "((^Man$|^Woman$|^UGM$))", message = "sex 值不在可选范围")
    @NotNull(message = "sex 不能为空")
    private String sex;

    @Email(message = "email 格式不正确")
    @NotNull(message = "email 不能为空")
    private String email;

}
```

接下来在需要验证的参数上加上了 `@Valid` 注解，如果验证失败，它将抛出 `MethodArgumentNotValidException`。

```java
@RestController
@RequestMapping("/api")
public class PersonController {

    @PostMapping("/person")
    public ResponseEntity<Person> getPerson(@RequestBody @Valid Person person) {
        return ResponseEntity.ok().body(person);
    }
}
```

### 验证请求参数（Path Variables 和 Request Parameters）

注意一定要在类上加上 `@Validated` 注解，这个参数可以告诉 Spring 去校验方法参数。

```java
@RestController
@RequestMapping("/api")
@Validated
public class PersonController {

    @GetMapping("/person/{id}")
    public ResponseEntity<Integer> getPersonByID(@Valid @PathVariable("id") @Max(value = 5,message = "超过 id 的范围了") Integer id) {
        return ResponseEntity.ok().body(id);
    }
}
```

## 全局处理 Controller 层异常

相关注解：

+ `@ControllerAdvice`：注解定义全局异常处理类
+ `@ExceptionHandler`：注解声明异常处理方法


## JPA 相关

### 创建表

作用：

+ `@Entity`：声明一个类对应一个数据库实体。
+ `@Table`：设置表名。

用法：

```java
@Entity
@Table(name = "role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    省略getter/setter......
}
```

### 创建主键

作用：

+ `@Id`：声明一个字段为主键。
+ `@GeneratedValue`：指定主键生成策略。
  + 使用 `@Id` 声明之后，还需要定义主键的生成策略。可以使用这个注解指定主键生成策略。

用法：

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

### 设置字段类型

作用：使用 `@Column` 声明字段。

用法：

```java
// 设置属性 userName 对应的数据库字段名为 user_name，长度为 32，非空
@Column(name = "user_name", nullable = false, length=32)
private String userName;

// 设置字段类型并且加默认值，常用
Column(columnDefinition = "tinyint(1) default 1")
private Boolean enabled;
```

### 指定不持久化特定字段

作用：使用 `@Transient` 声明不需要与数据库映射的字段，在保存的时候不需要保存进数据库。

用法：

```java
Entity(name="USER")
public class User {

    ......
    @Transient
    private String secrect; // not persistent because of @Transient

}
```

除了 `@Transient` 关键字声明，还可以采用下面几种方法（一般使用注解的方式比较多）：

```java
static String secrect; // not persistent because of static
final String secrect = “Satish”; // not persistent because of final
transient String secrect; // not persistent because of transient
```

### 声明大字段

作用：使用 `@Lob` 声明某个字段为大字段。

```java
@Lob
private String content;
```

### 创建枚举类型的字段

作用：可以使用枚举类型的字段，不过枚举字段要用 `@Enumerated` 注解修饰。

用法：

```java
public enum Gender {
    MALE("男性"),
    FEMALE("女性");

    private String value;
    Gender(String str) {
        value = str;
    }
}
```

```java {9}
@Entity
@Table(name = "role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    省略getter/setter......
}
```

数据库里面对应存储的是 `MAIL`/`FEMAIL`。

### 增加审计功能

作用：只要继承了 `AbstractAuditBase` 的类都会默认加上下面四个字段。

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@EntityListeners(value = AuditingEntityListener.class)
public abstract class AbstractAuditBase {

    @CreatedDate
    @Column(updatable = false)
    @JsonIgnore
    private Instant createdAt;

    @LastModifiedDate
    @JsonIgnore
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    @JsonIgnore
    private String createdBy;

    @LastModifiedBy
    @JsonIgnore
    private String updatedBy;
}
```

对应的审计功能配置类可能是下面这样的（SpringSecurity 项目）：

```java

@Configuration
@EnableJpaAuditing
public class AuditSecurityConfiguration {
    @Bean
    AuditorAware<String> auditorAware() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getName);
    }
}
```

其中涉及到的一些注解：

+ `@CreatedDate`：表示该字段为创建时间时间字段，在这个实体被 insert 的时候，会设置值。
+ `@CreatedBy`：表示该字段为创建人，在这个实体被 insert 的时候，会设置值。
  + `@LastModifiedDate`、`@LastModifiedBy` 同理。
+ `@EnableJpaAuditing`：开启 JPA 审计功能。

### 删除/修改数据

作用：`@Modifying` 注解提示 JPA 该操作是修改操作，还要配合 `@Transactional` 注解使用。

用法：

```java
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    @Modifying
    @Transactional(rollbackFor = Exception.class)
    void deleteByUserName(String userName);
}
```

### 关联关系

作用：

+ `@OneToOne`：声明一对一关系
+ `@OneToMany`：声明一对多关系
+ `@ManyToOne`：声明多对一关系
+ `MangToMang`：声明多对多关系

## LomBok 工具注解

这是一个 Java 库，它通过注解的方式可以简化 Java 代码的编写，能在编译时自动生成例如 getter 和 setter 方法、构造函数、`toString` 方法、`equals` 和 `hashCode` 方法等。

### @Data

作用：生成所有字段的 `getter`、`toString()`、`hashCode()`、`equals()`、所有非 `final` 字段的 `setter`、构造器。

相当于设置了 `@Getter`、`@Setter`、`@RequiredArgsConstructor`、`@ToString` 和 `@EqualsAndHashCode`。

用法：

```java
@Data
public class User {
    private String name;
    private int age;
}
```

### @Slf4j

作用：最常用的日志注解，为类生成一个 SLF4J 日志对象。

用法：

```java
@Slf4j
public class LogExample {
    public void doSomething() {
        log.info("这是一条信息日志");
        log.error("这是一条错误日志");
        log.debug("这是一条调试日志");
        
        // 支持参数占位符
        String name = "admin";
        log.info("用户 {} 登录成功", name);
        
        try {
            // 一些可能抛出异常的代码
        } catch (Exception e) {
            log.error("发生错误", e);
        }
    }
}
```

## 事务

在要开启事务的方法上使用 `@Transactional` 注解即可。

+ 不配置 `rollbackFor` 属性：事务只会在遇到 RuntimeException 的时候才会回滚
+ 配置 `rollbackFor=Exception.class` 属性：可以让事物在遇到非运行时异常时也回滚

```java
@Transactional(rollbackFor = Exception.class)
public void save() {
  ......
}
```

`@Transactional` 注解可以作用在类或者方法上：

+ 作用于类：当把 `@Transactional` 注解放在类上时，表示所有该类的 public 方法都配置相同的事务属性信息。
+ 作用于方法：当类配置了 `@Transactional`，方法也配置了 `@Transactional`，方法的事务会覆盖类的事务配置信息。

## json 数据处理

###  过滤 json 数据

作用：

+ `@JsonIgnoreProperties`：作用在类上用于过滤掉特定字段不返回或者不解析。
+ `@JsonIgnore`：一般用于类的属性上，作用和 `@JsonIgnoreProperties` 一样。

用法：

```java
// 生成 json 时 将userRoles 属性过滤
@JsonIgnoreProperties({"userRoles"})
public class User {

    private String userName;
    private String fullName;
    private String password;
    @JsonIgnore
    private List<UserRole> userRoles = new ArrayList<>();
}
```

```java

public class User {

    private String userName;
    private String fullName;
    private String password;
    // 生成 json 时将 userRoles 属性过滤
    @JsonIgnore
    private List<UserRole> userRoles = new ArrayList<>();
}
```

### 格式化 json 数据

作用：`@JsonFormat` 一般用来格式化 json 数据。

用法：

```java
@JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone="GMT")
private Date date;
```

### 扁平化对象

```java
@Getter
@Setter
@ToString
public class Account {
    @JsonUnwrapped
    private Location location;
    @JsonUnwrapped
    private PersonInfo personInfo;

    @Getter
    @Setter
    @ToString
    public static class Location {
        private String provinceName;
        private String countyName;
    }
    @Getter
    @Setter
    @ToString
    public static class PersonInfo {
        private String userName;
        private String fullName;
    }
}
```

未扁平化之前：

```json
{
  "location": {
    "provinceName":"江苏",
    "countyName":"苏州"
  },
  "personInfo": {
    "userName": "admin",
    "fullName": "ZhangSan"
  }
}
```

扁平化之后：

```json
{
  "provinceName":"江苏",
  "countyName":"苏州",
  "userName": "admin",
  "fullName": "ZhangSan"
}
```

## 参考资料

+ [Spring/Spring Boot 常用注解总结](https://github.com/Snailclimb/JavaGuide/blob/master/docs/system-design/framework/spring/Spring%26SpringBoot%E5%B8%B8%E7%94%A8%E6%B3%A8%E8%A7%A3%E6%80%BB%E7%BB%93.md)

（完）
