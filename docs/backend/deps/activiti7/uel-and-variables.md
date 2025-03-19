# UEL表达式与流程变量

之所以需要使用 UEL 表达式与流程变量，是因为在实际开发中，很多值（比如任务指派人）是不可能写死在流程图里的。

## UEL表达式

使用 Activiti 时，动态赋值用 UEL 表达式。

+ 表达式以 `${` 开始，以 `}` 结束，例如 `${day > 100}`
+ 支持逻辑运算
+ 支持变量与实体类赋值

> 使用场景：对执行流程变量赋值，但不要反复赋值（可能存在BUG）。

对应数据库表：

+ `act_ru_variable`：运行时参数表
+ `act_hi_varinst`：历史参数表（varinst：参数实例的缩写）

| 保留关键字   |         |         |
| ------------ | ------- | ------- |
| `eq`         | `and`   | `gt`    |
| `instanceof` | `div`   | `or`    |
| `le`         | `false` | `empty` |
| `not`        | `lt`    | `ge`    |

| 运算符       | 功能     | 示例                                                    | 结果                                                    |
| ------------ | -------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `+`          | 加法运算 | `${1 + 1}`                                              | `2`                                                     |
| `-`          | 减法运算 | `${1 - 1}`                                              | `0`                                                     |
| `*`          | 乘法运算 | `${2 * 2 }`                                             | `4`                                                     |
| `/` 或 `div` | 除法运算 | `2/1` 或 `{2 div 1}`<br />`2/0` 或 `{2 div 0}`          | `2`<br />`Infinity`                                     |
| `%` 或 `mod` | 求余运算 | `{3 % 2}` 或 `{3 mod 2}`<br /> `{3 % 0}` 或 `{3 mod 0}` | `1`<br />异常 `java.lang.ArithmenticException:/by zero` |


## 流程变量

可以给流程变量（UEL表达式）赋值的环节：

+ 流程实例启动的时候
+ 任务完成的时候
+ 任意时候通过 API 动态设置变量

下面以报销流程为例，演示在各个环节使用流程变量的方法。

### 示例一：启动流程示例带参数

+ 绘制 BPMN 图，用户任务节点中 Assignee 值为 `${ZhiXingRen}`
+ 流程部署
+ **启动流程示例带参数**，进入用户任务节点

```java
package com.example.workflow;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.TaskService;
import org.activiti.engine.runtime.ProcessInstance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

@SpringBootTest
public class Part6_UEL {

    @Autowired
    private RepositoryService repositoryService;

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private TaskService taskService;
    
    // 通过 bpmn 部署流程
    @Test
    public void initDeploymentBPMN() {
        String filename = "BPMN/Part1_Deployment.bpmn"; // 路径从 resources 目录下开始
        Deployment deployment = repositoryService.createDeployment()
                .addClasspathResource(filename)
                .name("流程的名字")
                .deploy();
        System.out.println(deployment.getName());
    }

    // 启动流程实例带参数：指定执行人
    @Test
    public void initProcessInstanceWithArgs() {
        // 流程变量：假定任务节点的 Assignee 值为 ${ZhiXingRen}
        Map<String, Object> variables = new HashMap<String, Object>();
        variables.put("ZhiXingRen", "wukong");
        ProcessInstance processInstance = runtimeService
                .startProcessInstanceByKey("myProcess_claim", "claim", variables);
        System.out.println("流程实例ID:"+processInstance.getProcessInstanceId());
    }
}
```

### 示例二：完成任务带参数

+ 用户任务节点触发完成任务后，从业务表单获取报销金额，**给流程变量 `pay` 赋值**
+ 后面根据 `pay` 的值进入排它网关

```java
    // 完成任务带参数，指定流程变量
    @Test
    public void completeTaskWItchArgs(){
        Map<String, Object> variables = new HashMap<String, Object>();
        // 指定流程变量：
        // 赋值 pay 的值，任务节点结束后进入排它网关，根据 pay 的值进入相应的任务节点
        variables.put("pay", "101");
        taskService.complete("", null);
        System.out.println("完成任务");
    }
```

### 示例三：启动流程实例带参数（使用实体类）

> 比较麻烦，实际开发中不推荐使用。

声明实体类，注意：

+ 类中成员变量的名称必须全小写，否则在传入实例类的时候会提示找不到
+ 类必须实现 `Serializable`（序列化）接口

```java
package com.example.workflow;

import lombok.Data;
import java.io.Serializable;

@Data //lombok
public class UEL_POJO implements Serializable {
    private String zhixingren;
    private String pay;
}
```

+ 绘制 BPMN 图
  + 第一个用户任务节点（实体类任务）中 Assignee 值为 `${uelpojo.zhixingren}`
  + 第二个用户任务节点（候选人任务）中 Assignee 值为 `${houxuanren}`（这里大小写无所谓）
+ 流程部署
+ **启动流程示例带参数（使用实体类）**，进入用户任务节点

```java
    // 启动流程实例带参数：使用实体类
    @Test
    public void initProcessInstanceWitchClassArgs(){
        // 创建实体类
        UEL_POJO uel_pojo = new UEL_POJO();
        uel_pojo.setZhixingren("bajie");

        // 流程变量：将实体类作为参数放进 variables
        Map<String,Object> variables = new HashMap<String,Object>();
        variables.put("uelpojo",uel_pojo);

        ProcessInstance processInstance = runtimeService
                .startProcessInstanceByKey(
                        "myProcess_claim",
                        "bKey002",
                        variables);
        System.out.println("流程实例ID:"+processInstance.getProcessInstanceId());
    }
```

### 示例四：任务完成环节带参数（指定多个候选人）

延续示例三：

+ 用户任务节点（实体类任务）触发完成任务后，指定两个任务候选人进入下一个用户任务节点（候选人任务）

```java
    // 任务完成环节带参数：指定多个候选人
    @Test
    public void initProcessInstanceWithCandiDateArgs(){
        Map<String,Object> variables = new HashMap<String,Object>();
        variables.put("houxuanren", "wukong,tangseng"); // 英文逗号
        taskService.complete("",null);
        System.out.println("完成任务");
    }
```

### 示例五：直接指定流程变量

在流程的任何环节都可以通过 API 直接指定流程变量。

```java
    // 直接指定流程变量
    @Test
    public void otherArgs() {
        // 设置变量
        runtimeService.setVariable("流程实例ID", "pay", "101");
        runtimeService.setVariables("任务节点ID", "pay", "101");
        // 设置多个变量
        runtimeService.setVariables("流程实例ID", variables);
        runtimeService.setVariables("任务节点ID", variables);
    }
```

### 示例六：指定局部变量

局部变量值只在当前环节有效。

```java
    // 局部变量
    @Test
    public void otherLocalArgs(){
        // 设置变量
        runtimeService.setVariableLocal("流程实例ID", "pay", "101");
        runtimeService.setVariablesLocal("任务节点ID", "pay", "101");
        // 设置多个变量
        runtimeService.setVariablesLocal("流程实例ID", variables);
        runtimeService.setVariablesLocal("任务节点ID", variables);
    }
```

（完）
