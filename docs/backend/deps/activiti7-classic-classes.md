# Activiti7 基础类

## 流程部署 Deployment

执行部署后，会在以下三个表中写入数据：

+ `act_re_deployment`：部署信息表
+ `act_ge_bytearray`：二进制表，存储通用的流程资源（比如 bpmn 和图片）
+ `act_re_procdef`：流程定义数据表

### 通过 bpmn 部署流程

即，将 bpmn 写入到 activiti 的数据表（`act_re_deployment`）中：

> 流程部署相关的 API 需要注入 `RepositoryService` 这个类。

```java
package com.example.workflow;

import org.activiti.engine.RepositoryService;
import org.activiti.engine.repository.Deployment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class Part1_Deployment {

    @Autowired
    private RepositoryService repositoryService;

    @Test
    public void initDeploymentBPMN() {
        String filename = "BPMN/Part1_Deployment.bpmn"; // 路径从 resources 目录下开始
        Deployment deployment = repositoryService.createDeployment()
                .addClasspathResource(filename)
                .name("流程的名字")
                .deploy();
        System.out.println(deployment.getName());
    }
}
```

**注意：只要流程 key 不变，就认为是同一个流程**，会在写入数据表时给名称后面拼接上字符串 `_V2`，以此类推。

### 查询流程部署

> 查询的 API 都是 `repositoryService.createXxxQuery()`。

```java
package com.example.workflow;

import org.activiti.engine.RepositoryService;
import org.activiti.engine.repository.Deployment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class Part1_Deployment {

    @Autowired
    private RepositoryService repositoryService;

    @Test
    public void getDeployments() {
        List<Deployment> list = repositoryService.createDeploymentQuery().list(); // 查询所有部署过的流程
        for(Deployment dep : list) {
            System.out.println("Id："+dep.getId());
            System.out.println("Name："+dep.getName());
            System.out.println("DeploymentTime："+dep.getDeploymentTime());
            System.out.println("Key："+dep.getKey());
        }
    }
}
```

## 流程定义 ProcessDefinition

+ `Deployment` 类的作用：添加资源文件、获取部署信息、部署时间。
  + 数据库表：`act_re_deployment`
+ `ProcessDefinition` 的作用：获取版本号、key、资源名称、部署ID 等。
  + 数据库表：`act_re_procdef`
+ **这两个类都是描述流程定义的类**

> 其中 ProcessDefinition 的表中有一个外键（`DEPLOYMENT_ID_`）指向 Deployment 的表，构成多对一的关系，这个设计似乎是多余的，因为它们明明是一对一关系，完全可以做成一个表还方便查询信息，目前没有其它资料显示其用意，暂时认为是框架作者的设计所致。

### 查询流程定义

> 查询的 API 都是 `repositoryService.createXxxQuery()`。

```java
package com.example.workflow;

import org.activiti.engine.RepositoryService;
import org.activiti.engine.repository.ProcessDefinition;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class Part2_ProcessDefinition {

    @Autowired
    private RepositoryService repositoryService;

    @Test
    public void getDefinitions() {
        List<ProcessDefinition> list = repositoryService.createProcessDefinitionQuery().list();
        for(ProcessDefinition pd : list){
            System.out.println("------流程定义--------");
            System.out.println("Name："+pd.getName());
            System.out.println("Key："+pd.getKey());
            System.out.println("ResourceName："+pd.getResourceName());
            System.out.println("DeploymentId："+pd.getDeploymentId());
            System.out.println("Version："+pd.getVersion());
        }
    }
}
```

其中，`ID_` 即流程定义的 ID 值是由 `BPMN的KEY:版本号:流程定义实际的UUID` 组成。

### 删除流程定义

一次只删一个。

```java
package com.example.workflow;

import org.activiti.engine.RepositoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class Part2_ProcessDefinition {

    @Autowired
    private RepositoryService repositoryService;

    @Test
    public void getDefinitions() {
        String pdID = "44b15cfe-ce3e-11ea-92a3-dcfb4875e032";  // 流程部署的ID
        repositoryService.deleteDeployment(pdID, true); // true: 连同流程的历史一起删除干净
        System.out.println("删除流程定义成功");
        }
    }
}
```

## 流程实例 ProcessInstance

ProcessDefinition 与 ProcessInstance 是**一对多**的关系：即流程实例是流程定义的具体实现，每次执行流程，都会根据流程定义创建相应的流程实例。

初始化流程实例（调用 `.startProcessInstanceByKey`）后，会在以下两个表中写入数据：

+ `act_ru_execution`：运行时执行实例表，这个表存储当前正在运行的流程实例的执行数据
  + 启动时会先创建两条数据，一个是开始节点，一个是任务节点。
  + 之后每执行一个节点就创建一条数据。
  + 当流程实例结束时（完成所有任务、手动终止流程、删除流程），对应的记录会被删除。同时，流程实例的历史数据会被转移到 `act_hi_procinst`（历史流程实例表）中永久保存。
+ `act_ru_identitylink`：运行时身份连接表
  + 用于关联用户实例、流程实例和任务实例
  + 当流程实例终止时，对应的记录会被删除；同时，相关的身份链接信息会被转移到 `act_hi_identitylink` 历史表中。
  + 根据需要可以调用 `historyService.deleteHistoricProcessInstance(processInstanceId);` 同时删除运行时和历史数据。

### 初始化流程实例

> 流程实例相关的 API 需要注入 `RuntimeService` 这个类。

`startProcessInstanceByKey()` 接收两个参数：

+ 第一个参数：流程定义 key（就是 BPMN 图的 ID）
+ 第二个参数：业务标识 businessKey（就是业务表单的 ID，比如请假单的ID）

```java
package com.example.workflow;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.runtime.ProcessInstance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class Part3_ProcessInstance {

    @Autowired
    private RuntimeService runtimeService;

    @Test
    public void initProcessInstance() {
        // 实际业务中的执行步骤如下：
        // 1. 获取页面表单填报的内容，比如请假时间，请假事由：String fromData
        // 2. fromData 写入业务表，返回业务表主键ID，后 businessKey
        // 3. 初始化实例，把业务数据与 Activiti7 流程数据关联，即 业务表主键 == businessKey
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("myProcess_claim","bKey002");
        System.out.println("流程实例ID："+processInstance.getProcessDefinitionId());
    }
}
```

### 获取流程实例列表

> 查询的 API 都是 `runtimeService.createXxxQuery()`。

```java
package com.example.workflow;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.runtime.ProcessInstance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class Part3_ProcessInstance {

    @Autowired
    private RuntimeService runtimeService;

    @Test
    public void getProcessInstances(){
        List<ProcessInstance> list = runtimeService.createProcessInstanceQuery().list();
        for(ProcessInstance pi : list) {
            System.out.println("--------流程实例------");
            // 流程实例ID
            System.out.println("ProcessInstanceId："+pi.getProcessInstanceId());
            // 所属流程定义ID
            System.out.println("ProcessDefinitionId："+pi.getProcessDefinitionId());
            // 流程实例是否执行完成
            System.out.println("isEnded"+pi.isEnded());
            // 流程实例是否被挂起
            System.out.println("isSuspended："+pi.isSuspended());
        }
    }
}
```

### 暂停与激活流程实例

挂起后，后面的任务就都执行不了了。

```java
package com.example.workflow;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.runtime.ProcessInstance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class Part3_ProcessInstance {

    @Autowired
    private RuntimeService runtimeService;

    @Test
    public void activitieProcessInstance(){
        // runtimeService.suspendProcessInstanceById("73f0fb9a-ce5b-11ea-bf67-dcfb4875e032");
        // System.out.println("挂起流程实例");

        runtimeService.activateProcessInstanceById("73f0fb9a-ce5b-11ea-bf67-dcfb4875e032");
        System.out.println("激活流程实例");
    }
}
```

注意：如果要挂起/激活的流程实例已经被挂起/激活，会报错，实际使用时需要 try-catch。

### 删除流程实例

`deleteProcessInstance()` 接收两个参数：

+ 第一个参数：processInstanceId（就是流程定义的ID）
+ 第二个参数：deleteReason（就是删除理由）

```java
package com.example.workflow;

import org.activiti.engine.RuntimeService;
import org.activiti.engine.runtime.ProcessInstance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class Part3_ProcessInstance {

    @Autowired
    private RuntimeService runtimeService;

    @Test
    public void delProcessInstance(){
        runtimeService.deleteProcessInstance("73f0fb9a-ce5b-11ea-bf67-dcfb4875e032","删着玩");
        // 如果使用下面的方法，会同时删除运行时和历史数据
        // historyService.deleteHistoricProcessInstance(processInstanceId);
        System.out.println("删除流程实例");
    }
}
```

注意：如果要删除的流程实例不存在，会报错，实际使用时需要 try-catch。

## 任务处理 Task

「任务」在 bpmn-js 的可视化页面中是一个矩形，然后在矩形的左侧添加具体的图表表示一个特定的任务类型。

Activiti7 中主要有以下几种任务类型：

+ 用户任务（UserTask）：需要人来参与，需要人为触发
+ 服务任务（ServiceTask）
+ 脚本任务（ScriptTask）
+ 接收任务（ReceiveTask）
+ 其他自动执行的任务节点

### 用户任务

用户任务有以下几个元素。

+ Assignee：执行人/代理人
+ Candidate Users：候选人（多个，英文逗号 `,` 分隔），谁先拾取任务就谁来执行任务
+ Candidate Groups：候选组（多个候选人可以分为一个组）
+ Due Date：任务到期时间（有的事件可以在此触发）

当流程执行到**用户任务**节点时，会在以下两个表中写入数据：

+ `act_ru_task`：运行时任务表，存储每个用户的执行数据
  + 存储任务的基本信息（如任务ID、名称、办理人等）。
  + 任务完成后，数据会从 `act_ru_task` 移至 `act_hi_taskinst` 历史表。
+ `act_ru_variable`：运行时流程变量表，存储运行时传递的变量参数
  + 启动流程实例、执行过程中、任务执行时都可以设置变量。
  + 流程实例结束、流程被删除，数据会从 `act_ru_variable` 移至 `act_hi_varinst` 历史表。

以报销流程为例，包含以下节点：

```text
开始节点 -> 用户任务（发起报销）-> 用户任务（财务审批）-> 结束节点
```

对应在 Activiti7 中就需要编写以下方法：

+ 查询任务
  + 在流程实例创建后，第一个节点的人就能够查询到任务了
+ 执行任务
  + 发起报销的人看到任务后，填写并上传表单，此时就是执行任务，将任务流转到下一环节
  + 财务审批的人看到任务后，可以执行任务，将任务流转到下一环节
+ 拾取任务：给候选人用的方法

> 任务相关的 API 需要注入 `TaskService` 这个类。

```java
package com.example.workflow;

import org.activiti.engine.TaskService;
import org.activiti.engine.task.Task;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class Part4_Task {

    @Autowired
    private TaskService taskService;

    // 查询所有任务（一般给管理员使用）
    @Test
    public void getTasks(){
        List<Task> list = taskService.createTaskQuery().list();
        for(Task tk : list){
            System.out.println("Id："+tk.getId());
            System.out.println("Name："+tk.getName());
            System.out.println("Assignee："+tk.getAssignee());
        }
    }

    // 查询我的代办任务
    @Test
    public void getTasksByAssignee(){
        List<Task> list = taskService.createTaskQuery()
                .taskAssignee("bajie") // 此处参数为执行人
                .list();
        for(Task tk : list){
            System.out.println("Id："+tk.getId());
            System.out.println("Name："+tk.getName());
            System.out.println("Assignee："+tk.getAssignee());
        }
    }

    // 执行任务
    @Test
    public void completeTask(){
        taskService.complete("d07d6026-cef8-11ea-a5f7-dcfb4875e032"); // 此处参数为 taskId，也可以传一些变量
        System.out.println("完成任务");
    }

    // 拾取任务
    @Test
    public void claimTask(){
        Task task = taskService.createTaskQuery().taskId("1f2a8edf-cefa-11ea-84aa-dcfb4875e032").singleResult();
        taskService.claim("1f2a8edf-cefa-11ea-84aa-dcfb4875e032", "bajie");
    }

    // 归还与交办任务
    @Test
    public void setTaskAssignee(){
        Task task = taskService.createTaskQuery().taskId("1f2a8edf-cefa-11ea-84aa-dcfb4875e032").singleResult();
        taskService.setAssignee("1f2a8edf-cefa-11ea-84aa-dcfb4875e032", "null");  // 归还候选任务
        taskService.setAssignee("1f2a8edf-cefa-11ea-84aa-dcfb4875e032", "wukong"); // 交办任务
    }
}
```

## 历史任务 HistoricTaskInstance

也就是查询历史记录，往往查询历史数据会涉及到两个类：

+ 历史综合信息：HistoricTaskInstance
+ 历史变量：HistoricVariableInstance

### 根据用户名查询历史

> 历史相关的 API 需要注入 `HistoryService` 这个类。

```java
package com.example.workflow;

import org.activiti.engine.HistoryService;
import org.activiti.engine.history.HistoricTaskInstance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class Part5_HistoricTaskInstance {
    @Autowired
    private HistoryService historyService;

    @Test
    public void HistoricTaskInstanceByUser() {
        List<HistoricTaskInstance> list = historyService
                .createHistoricTaskInstanceQuery()
                .orderByHistoricTaskInstanceEndTime().asc()
                .taskAssignee("bajie")
                .list();
        for(HistoricTaskInstance hi : list) {
            System.out.println("Id："+ hi.getId());
            System.out.println("ProcessInstanceId："+ hi.getProcessInstanceId());
            System.out.println("Name："+ hi.getName());
        }
    }
}
```

### 根据流程实例ID查询历史

> 历史相关的 API 需要注入 `HistoryService` 这个类。

```java
package com.example.workflow;

import org.activiti.engine.HistoryService;
import org.activiti.engine.history.HistoricTaskInstance;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class Part5_HistoricTaskInstance {
    @Autowired
    private HistoryService historyService;

    @Test
    public void HistoricTaskInstanceByPiID(){
        List<HistoricTaskInstance> list = historyService
                .createHistoricTaskInstanceQuery()
                .orderByHistoricTaskInstanceEndTime().asc()
                .processInstanceId("1f2314cb-cefa-11ea-84aa-dcfb4875e032")
                .list();
        for(HistoricTaskInstance hi : list){
            System.out.println("Id："+ hi.getId());
            System.out.println("ProcessInstanceId："+ hi.getProcessInstanceId());
            System.out.println("Name："+ hi.getName());
        }
    }
}
```

（完）
