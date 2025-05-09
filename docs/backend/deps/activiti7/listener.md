# Activiti7 监听器

## 执行监听器（ExecutionListener）

### 使用场景

执行监听器和流程相关，常见业务使用场景：

+ 流程实例相关
  + 流程启动时初始化业务数据
  + 流程结束时更新业务状态
  + 记录流程执行的审计日志
  + 发送流程状态通知
+ 节点执行相关
  + 记录节点执行的时间戳

### 代码示例

在 Activiti 中使用执行监听器最主流的方式是直接实现 `ExecutionListener` 接口并重写 `notify` 方法。

`notify` 方法会在流程实例的以下生命周期事件中被触发：

+ `start` 事件：
  + 当流程实例、活动（节点）开始时触发
+ `end` 事件：
  + 当流程实例、活动（节点）结束时触发
+ `take` 事件：
  + 当流程沿着某条连线流转时触发（当流程从「任务1」完成后，在进入「任务2」之前，正在经过这条连线时触发）

具体的执行时机需要在 BPMN 文件中通过 `event` 属性指定监听器的事件类型，比如在流程实例启动时触发：

```xml
<process id="myProcess">
  <extensionElements>
    <activiti:executionListener event="start"
                                class="com.example.workflow.listener.PiListener">
      <!-- - 通过表达式注入值，这个值会在运行时被解析并注入到监听器实例中 -->
      <activiti:field name="sendType" expression="${someExpression}" />
    </activiti:executionListener>
  </extensionElements>
  <!-- ... -->
</process>
```

相应的监听器代码如下：

```java
package com.example.workflow.listener;

import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.ExecutionListener;
import org.activiti.engine.delegate.Expression;
import org.springframework.beans.factory.annotation.Autowired;

public class PiListener implements ExecutionListener {
    @Autowired
    // 获取前端页面在 BPMN 中的字段注入
    // "sendType" 这个值保持和前端取得字段名一样，这里表示通知方式（email、sms...）
    private Expression sendType;

    @Override
    public void notify(DelegateExecution execution) {
        // 该方法中的 execution 参数包含了流程执行相关的信息
        System.out.println(execution.getEventName());           // 获取事件名称（start、end等）
        System.out.println(execution.getProcessDefinitionId()); // 获取流程定义ID
        System.out.println(execution.getProcessInstanceId());   // 获取流程实例ID
        System.out.println(execution.getCurrentActivityId());   // 获取当前活动的ID
        System.out.println(execution.getProcessBusinessKey());  // 获取业务关键字
        
        // 统计每个环节（主要是任务）的执行时间
        // 注意，由于上面的 BPMN 只把监听器配置在 <process> 下，因此只在流程实例启动时触发一次
        // 只有节点级别的监听器（配置在具体节点上），才会在节点执行开始和结束时触发
        if("start".equals(execution.getEventName())){
            // 记录节点开始时间（记在业务表里）
        } else if("end".equals(execution.getEventName())){
            // 记录节点结束时间（记在业务表里）
        }
        
        // 获取前端传递过来的 sendType 字段对应的值
        System.out.println("sendType:" + sendType.getValue(execution).toString());
    }
}
```

## 任务监听器（TaskListener）

### 使用场景

任务监听器和任务相关，常见业务使用场景：

+ 任务分配相关：
  + 动态计算任务处理人
  + 实现任务委派逻辑
+ 任务状态管理：
  + 任务创建时发送通知
  + 任务完成时更新业务数据
  + 记录任务处理时间
  + 监控任务超时情况
+ 任务权限控制：
  + 设置任务的候选人和候选组 
  + 控制任务的可见性 
  + 实现任务的转办功能 
  + 管理任务的优先级

### 代码示例

在 Activiti 中使用任务监听器最主流的方式是直接实现 `TaskListener` 接口并重写 `notify` 方法。

`notify` 方法会在任务的以下生命周期事件中被触发：

+ `create` 事件：
  + 当任务被创建时触发
  + 此时可以获取到初始的任务信息
  + 适合用于设置初始处理人、发送任务创建通知等
+ `assignment` 事件：
  + 当任务被分配给某个用户时触发
  + 可以获取到新的处理人信息
  + 适合用于发送任务分配通知、记录分配历史等
+ `complete` 事件：
  + 当任务完成时触发
  + 可以获取到任务的完成信息 
  + 适合用于发送完成通知、更新相关业务状态等
+ `delete` 事件：
  + 当任务被删除时触发
  + 适合用于清理相关数据、记录删除原因等

具体的执行时机需要在 BPMN 文件中通过 `event` 属性指定监听器的事件类型，比如在任务创建时触发：

```xml
<userTask id="userTask1" name="用户任务1">
    <extensionElements>
        <activiti:taskListener event="create" 
            class="com.example.workflow.listener.TkListener" />
    </extensionElements>
</userTask>
```

相应的监听器代码如下：

```java
package com.example.workflow.listener;

import org.activiti.engine.delegate.DelegateTask;
import org.activiti.engine.delegate.TaskListener;

public class TkListener implements TaskListener {
    @Override
    public void notify(DelegateTask delegateTask) {
        // 该方法中的 delegateTask 参数包含了当前任务的所有信息，可以通过它获取和设置任务相关的属性和变量
        System.out.println("执行人：" + delegateTask.getAssignee());
        
        // ...
        // 根据用户名查询用户电话并调用发送短信接口
        // ...
        
        // ...
        // 通过一系列业务逻辑计算出当前任务的执行人并动态设置，比如maomao
        delegateTask.setAssignee("maomao");
    }
}
```

## 主要区别

+ 执行监听器关注流程整体的执行过程和状态变化
+ 任务监听器专注于人工任务节点的生命周期管理
+ 执行监听器更适合处理业务数据和系统集成
+ 任务监听器更适合处理人员分配和任务管理

## 最佳实践

+ 监听器中的逻辑要简单高效
+ 复杂的业务逻辑建议放在 Service 中实现

```java
// 不推荐的写法 - 在监听器中实现复杂业务逻辑
public class TaskAssignmentListener implements TaskListener {
    @Override
    public void notify(DelegateTask delegateTask) {
        // 直接在监听器中实现复杂的业务逻辑
        List<User> users = getUsersByDepartment();
        calculateWorkload();
        updateUserStatus();
        sendNotifications();
        // ... 更多复杂逻辑
    }
}
```

```java
// 推荐的写法 - 监听器调用Service方法
@Component
public class TaskAssignmentListener implements TaskListener {
    @Autowired
    private TaskAssignmentService taskAssignmentService;
    
    @Override
    public void notify(DelegateTask delegateTask) {
        // 监听器只负责调用Service方法
        String assignee = taskAssignmentService.calculateAssignee(delegateTask);
        delegateTask.setAssignee(assignee);
    }
}

// Service层实现复杂业务逻辑
@Service
public class TaskAssignmentService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private WorkloadService workloadService;
    
    public String calculateAssignee(DelegateTask task) {
        // 在Service中实现复杂的业务逻辑
        List<User> users = getUsersByDepartment();
        Map<String, Integer> workloads = workloadService.calculateWorkloads();
        // ... 更多业务逻辑
        return selectOptimalAssignee(users, workloads);
    }
}
```

（完）
