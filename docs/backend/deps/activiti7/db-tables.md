# Activiti7 数据表

运行 SpringBoot 项目后，Activiti7 会生成如下 25 张表（如果开启了历史表创建）：

| **表名**              | **介绍**                                           |
| --------------------- | -------------------------------------------------- |
| act_evt_log           | 流程引擎通用日志表                                 |
| act_ge_bytearray      | 二进制表，存储通用的流程资源                       |
| act_ge_property       | 系统存储表，存储整个流程引擎数据，默认存储三条数据 |
| act_hi_actinst        | 历史节点表                                         |
| act_hi_attachment     | 历史附件表                                         |
| act_hi_comment        | 历史意见表                                         |
| act_hi_detail         | 历史详情表                                         |
| act_hi_identitylink   | 历史用户信息表                                     |
| act_hi_procinst       | 历史流程实例表                                     |
| act_hi_taskinst       | 历史任务实例表                                     |
| act_hi_varinst        | 历史变量表                                         |
| act_procdef_info      | 流程定义的动态变更信息                             |
| act_re_deployment     | 部署信息表                                         |
| act_re_model          | 流程设计实体表                                     |
| act_re_procdef        | 流程定义数据表                                     |
| act_ru_deadletter_job | 作业失败表，失败次数>重试次数                      |
| act_ru_event_subscr   | 运行时事件表                                       |
| act_ru_execution      | 运行时流程执行实例表                               |
| act_ru_identitylink   | 运行时用户信息表                                   |
| act_ru_integration    | 运行时综合表                                       |
| act_ru_job            | 作业表                                             |
| act_ru_suspended_job  | 作业暂停表                                         |
| act_ru_task           | 运行时任务信息表                                   |
| act_ru_timer_job      | 运行时定时器表                                     |
| act_ru_variable       | 运行时变量表                                       |

## 1. act_re_deployment ：流程部署表

| Field           | Type         | Comment                   |
| --------------- | ------------ | ------------------------- |
| ID_             | varchar(64)  | 部署ID                    |
| NAME_           | varchar(255) | 部署的名字，通过api设置的 |
| CATEGORY_       | varchar(255) | 分类，通过api设置的       |
| KEY_            | varchar(255) | 唯一标识，通过api设置的   |
| TENANT_ID_      | varchar(255) | 租户ID                    |
| DEPLOY_TIME_    | timestamp(3) | 部署时间                  |
| ENGINE_VERSION_ | varchar(255) | 版本                      |

## 2. act_re_procdef：流程定义表

| Field                   | Type          | Comment                           |
| ----------------------- | ------------- | --------------------------------- |
| ID_                     | varchar(64)   | 流程ID，由流程key:版本:自增ID组成 |
| REV_                    | int(11)       | 回退版本                          |
| CATEGORY_               | varchar(255)  | 类别，自动生成的                  |
| NAME_                   | varchar(255)  | 画流程图时的name                  |
| KEY_                    | varchar(255)  | 画流程图时的ID                    |
| VERSION_                | int(11)       | 当前版本                          |
| DEPLOYMENT_ID_          | varchar(64)   | 管理流程部署的ID                  |
| RESOURCE_NAME_          | varchar(4000) | bpmn文件名称                      |
| DGRM_RESOURCE_NAME_     | varchar(4000) | 图片名称                          |
| DESCRIPTION_            | varchar(4000) | 流程描述                          |
| HAS_START_FORM_KEY_     | tinyint(4)    | 是否从key启动，0否1是             |
| HAS_GRAPHICAL_NOTATION_ | tinyint(4)    |                                   |
| SUSPENSION_STATE_       | int(11)       | 是否挂起，1激活 2挂起             |
| TENANT_ID_              | varchar(255)  | 租户ID                            |
| ENGINE_VERSION_         | varchar(255)  | 所属流程引擎版本                  |

## 3. act_procdef_info：流程定义信息表

| Field         | Type        | Comment                  |
| ------------- | ----------- | ------------------------ |
| ID_           | varchar(64) | 唯一ID                   |
| PROC_DEF_ID_  | varchar(64) | 流程定义的ID             |
| REV_          | int(11)     | 回退版本，乐观锁         |
| INFO_JSON_ID_ | varchar(64) | 流程定义相关json信息的ID |

## 4. act_re_model：流程模型表

描述：需要通过api来手动操作(Model)

| Field                         | Type          | Comment                                      |
| ----------------------------- | ------------- | -------------------------------------------- |
| ID_                           | varchar(64)   | 流程模型ID                                   |
| REV_                          | int(11)       | 回退版本                                     |
| NAME_                         | varchar(255)  | 模型名称                                     |
| KEY_                          | varchar(255)  | 模型key                                      |
| CATEGORY_                     | varchar(255)  | 模型类别                                     |
| CREATE_TIME_                  | timestamp(3)  | 创建时间                                     |
| LAST_UPDATE_TIME_             | timestamp(3)  | 模型最后一次修改时间                         |
| VERSION_                      | int(11)       | 当前版本                                     |
| META_INFO_                    | varchar(4000) | 元信息，可用json存储                         |
| DEPLOYMENT_ID_                | varchar(64)   | 关联部署ID                                   |
| EDITOR_SOURCE_VALUE_ID_       | varchar(64)   | 关联act_ge_bytearray表统一部署下的bpmn资源ID |
| EDITOR_SOURCE_EXTRA_VALUE_ID_ | varchar(64)   | 关联act_ge_bytearray表统一部署下的png资源ID  |
| TENANT_ID_                    | varchar(255)  | 租户ID                                       |

## 5. act_ge_bytearray：二进制资源表

**描述：**通常用于存储流程的bpmn文件和图片文件

| Field          | Type         | Comment                        |
| -------------- | ------------ | ------------------------------ |
| ID_            | varchar(64)  | ID                             |
| REV_           | int(11)      | 回退版本号                     |
| NAME_          | varchar(255) | 资源名称，和流程定义的name一样 |
| DEPLOYMENT_ID_ | varchar(64)  | 所属流程部署ID                 |
| BYTES_         | longblob     | 二进制资源,bpmn或图片等        |
| GENERATED_     | tinyint(4)   | 0为用户生成，1为Activiti生成   |

## 6. act_ge_property：引擎属性表

描述：除了activiti7自带的系统属性，还能自定义添加，然后，通过managementService.getProperties();获取

| Field  | Type         | Comment  |
| ------ | ------------ | -------- |
| NAME_  | varchar(64)  | key      |
| VALUE_ | varchar(300) | value    |
| REV_   | int(11)      | 回退版本 |

## 7. act_ru_execution：运行时执行实例表

| Field                 | Type         | Comment                                                      |
| --------------------- | ------------ | ------------------------------------------------------------ |
| ID_                   | varchar(64)  | ID                                                           |
| REV_                  | int(11)      | 回退版本号                                                   |
| PROC_INST_ID_         | varchar(64)  | 流程实例ID                                                   |
| BUSINESS_KEY_         | varchar(255) | 关联业务系统的业务key                                        |
| PARENT_ID_            | varchar(64)  | 父ID，比如执行实例的parentId就是流程实例ID                   |
| PROC_DEF_ID_          | varchar(64)  | 所属流程定义ID                                               |
| SUPER_EXEC_           | varchar(64)  |                                                              |
| ROOT_PROC_INST_ID_    | varchar(64)  | 根流程实例ID                                                 |
| ACT_ID_               | varchar(255) | 正在活跃的节点ID，节点可认为是事件或任务，ID对应画图时的ID，节点详细信息保存在act_hi_actinst里 |
| IS_ACTIVE_            | tinyint(4)   | 是否激活，1激活，2挂起                                       |
| IS_CONCURRENT_        | tinyint(4)   | 是否是并行分支，1是0否                                       |
| IS_SCOPE_             | tinyint(4)   |                                                              |
| IS_EVENT_SCOPE_       | tinyint(4)   |                                                              |
| IS_MI_ROOT_           | tinyint(4)   |                                                              |
| SUSPENSION_STATE_     | int(11)      | 暂停状态，1是0否                                             |
| CACHED_ENT_STATE_     | int(11)      | 缓存结束状态                                                 |
| TENANT_ID_            | varchar(255) | 租户ID                                                       |
| NAME_                 | varchar(255) | 流程实例名称                                                 |
| START_TIME_           | datetime(3)  | 流程开始时间                                                 |
| START_USER_ID_        | varchar(255) | 开始于哪个用户                                               |
| LOCK_TIME_            | timestamp(3) | 锁住的时间，毫秒                                             |
| IS_COUNT_ENABLED_     | tinyint(4)   | 是否能够计数                                                 |
| EVT_SUBSCR_COUNT_     | int(11)      |                                                              |
| TASK_COUNT_           | int(11)      | 任务数量                                                     |
| JOB_COUNT_            | int(11)      | 作业数量                                                     |
| TIMER_JOB_COUNT_      | int(11)      | 定时作业数量，activiti自带定时作业功能                       |
| SUSP_JOB_COUNT_       | int(11)      | 挂起的作业数量                                               |
| DEADLETTER_JOB_COUNT_ | int(11)      | 死亡的作业数量                                               |
| VAR_COUNT_            | int(11)      | 变量的数量                                                   |
| ID_LINK_COUNT_        | int(11)      |                                                              |

## 8. act_ru_identitylink：运行时身份连接表

| Field         | Type         | Comment                                                      |
| ------------- | ------------ | ------------------------------------------------------------ |
| ID_           | varchar(64)  | ID                                                           |
| REV_          | int(11)      | 回退版本                                                     |
| GROUP_ID_     | varchar(255) | 候选人组ID                                                   |
| TYPE_         | varchar(255) | 用户类型，有assignee、candidate、owner、starter、participant。即：受让人,候选人,所有者、起动器、参与者 |
| USER_ID_      | varchar(255) | 用户ID                                                       |
| TASK_ID_      | varchar(64)  | 任务ID                                                       |
| PROC_INST_ID_ | varchar(64)  | 流程实例ID                                                   |
| PROC_DEF_ID_  | varchar(64)  | 流程定义ID                                                   |

## 9. act_ru_task：运行时任务表

| Field             | Type          | Comment                                                      |
| ----------------- | ------------- | ------------------------------------------------------------ |
| ID_               | varchar(64)   | ID                                                           |
| REV_              | int(11)       | 回退版本                                                     |
| EXECUTION_ID_     | varchar(64)   | 执行实例ID                                                   |
| PROC_INST_ID_     | varchar(64)   | 流程实例ID                                                   |
| PROC_DEF_ID_      | varchar(64)   | 流程定义ID                                                   |
| NAME_             | varchar(255)  | 任务名称                                                     |
| PARENT_TASK_ID_   | varchar(64)   | 父任务ID                                                     |
| DESCRIPTION_      | varchar(4000) | 任务描述，对应画图时的document。  ps：可以将document的值设置成UEL表达式，动态设置描述，例如待办/已办任务的自定义标题 |
| TASK_DEF_KEY_     | varchar(255)  | 任务的key，画图时任务的id对应                                |
| OWNER_            | varchar(255)  | 任务的拥有者                                                 |
| ASSIGNEE_         | varchar(255)  | 任务的办理人                                                 |
| DELEGATION_       | varchar(64)   | 任务委托状态。任务被委托时，为PENDING，委托任务被解决后为RESOLVED |
| PRIORITY_         | int(11)       | 优先级，默认为50                                             |
| CREATE_TIME_      | timestamp(3)  | 创建时间                                                     |
| DUE_DATE_         | datetime(3)   | 执行耗时                                                     |
| CATEGORY_         | varchar(255)  | 任务类别                                                     |
| SUSPENSION_STATE_ | int(11)       | 挂起状态，1激活，2挂起                                       |
| TENANT_ID_        | varchar(255)  | 租户ID                                                       |
| FORM_KEY_         | varchar(255)  |                                                              |
| CLAIM_TIME_       | datetime(3)   | 任务被拾取的时间                                             |

## 10. act_ru_timer_job：运行时定时作业表

描述：存储通过activiti发起的定时作业的信息。

| Field                | Type          | Comment |
| -------------------- | ------------- | ------- |
| ID_                  | varchar(64)   |         |
| REV_                 | int(11)       |         |
| TYPE_                | varchar(255)  |         |
| LOCK_EXP_TIME_       | timestamp(3)  |         |
| LOCK_OWNER_          | varchar(255)  |         |
| EXCLUSIVE_           | tinyint(1)    |         |
| EXECUTION_ID_        | varchar(64)   |         |
| PROCESS_INSTANCE_ID_ | varchar(64)   |         |
| PROC_DEF_ID_         | varchar(64)   |         |
| RETRIES_             | int(11)       |         |
| EXCEPTION_STACK_ID_  | varchar(64)   |         |
| EXCEPTION_MSG_       | varchar(4000) |         |
| DUEDATE_             | timestamp(3)  |         |
| REPEAT_              | varchar(255)  |         |
| HANDLER_TYPE_        | varchar(255)  |         |
| HANDLER_CFG_         | varchar(4000) |         |
| TENANT_ID_           | varchar(255)  |         |



## 11. act_ru_variable：运行时流程变量表

| Field         | Type          | Comment                                    |
| ------------- | ------------- | ------------------------------------------ |
| ID_           | varchar(64)   | 变量ID                                     |
| REV_          | int(11)       | 回退版本，乐观锁                           |
| TYPE_         | varchar(255)  | 变量类型，如string，int等                  |
| NAME_         | varchar(255)  | 变量key                                    |
| EXECUTION_ID_ | varchar(64)   | 所属执行实例ID                             |
| PROC_INST_ID_ | varchar(64)   | 所属流程实例ID                             |
| TASK_ID_      | varchar(64)   | 所属任务ID                                 |
| BYTEARRAY_ID_ | varchar(64)   | 二进制数据ID，如果是流程变量是二进制数据时 |
| DOUBLE_       | double        | double类型对应的值                         |
| LONG_         | bigint(20)    | long类型对应的值                           |
| TEXT_         | varchar(4000) | 文本类型对应的值                           |
| TEXT2_        | varchar(4000) | 文本类型对应的值                           |

## 12. act_ru_suspended_job：运行时挂起的定时作业表

| Field                | Type          | Comment |
| -------------------- | ------------- | ------- |
| ID_                  | varchar(64)   |         |
| REV_                 | int(11)       |         |
| TYPE_                | varchar(255)  |         |
| EXCLUSIVE_           | tinyint(1)    |         |
| EXECUTION_ID_        | varchar(64)   |         |
| PROCESS_INSTANCE_ID_ | varchar(64)   |         |
| PROC_DEF_ID_         | varchar(64)   |         |
| RETRIES_             | int(11)       |         |
| EXCEPTION_STACK_ID_  | varchar(64)   |         |
| EXCEPTION_MSG_       | varchar(4000) |         |
| DUEDATE_             | timestamp(3)  |         |
| REPEAT_              | varchar(255)  |         |
| HANDLER_TYPE_        | varchar(255)  |         |
| HANDLER_CFG_         | varchar(4000) |         |
| TENANT_ID_           | varchar(255)  |         |

## 13. act_ru_job：运行时作业表

| Field                | Type          | Comment |
| -------------------- | ------------- | ------- |
| ID_                  | varchar(64)   |         |
| REV_                 | int(11)       |         |
| TYPE_                | varchar(255)  |         |
| LOCK_EXP_TIME_       | timestamp(3)  |         |
| LOCK_OWNER_          | varchar(255)  |         |
| EXCLUSIVE_           | tinyint(1)    |         |
| EXECUTION_ID_        | varchar(64)   |         |
| PROCESS_INSTANCE_ID_ | varchar(64)   |         |
| PROC_DEF_ID_         | varchar(64)   |         |
| RETRIES_             | int(11)       |         |
| EXCEPTION_STACK_ID_  | varchar(64)   |         |
| EXCEPTION_MSG_       | varchar(4000) |         |
| DUEDATE_             | timestamp(3)  |         |
| REPEAT_              | varchar(255)  |         |
| HANDLER_TYPE_        | varchar(255)  |         |
| HANDLER_CFG_         | varchar(4000) |         |
| TENANT_ID_           | varchar(255)  |         |

## 14. act_ru_integration：运行时积分表

| Field                | Type         | Comment |
| -------------------- | ------------ | ------- |
| ID_                  | varchar(64)  |         |
| EXECUTION_ID_        | varchar(64)  |         |
| PROCESS_INSTANCE_ID_ | varchar(64)  |         |
| PROC_DEF_ID_         | varchar(64)  |         |
| FLOW_NODE_ID_        | varchar(64)  |         |
| CREATED_DATE_        | timestamp(3) |         |

## 15. act_ru_event_subscr：运行时事件订阅表

| Field          | Type         | Comment          |
| -------------- | ------------ | ---------------- |
| ID_            | varchar(64)  | ID               |
| REV_           | int(11)      | 回退版本，乐观锁 |
| EVENT_TYPE_    | varchar(255) | 事件类型         |
| EVENT_NAME_    | varchar(255) | 事件名称         |
| EXECUTION_ID_  | varchar(64)  | 所属执行实例ID   |
| PROC_INST_ID_  | varchar(64)  | 所属流程实例ID   |
| ACTIVITY_ID_   | varchar(64)  | 所属活跃节点ID   |
| CONFIGURATION_ | varchar(255) | 配置信息         |
| CREATED_       | timestamp(3) | 创建时间         |
| PROC_DEF_ID_   | varchar(64)  | 所属流程定义ID   |
| TENANT_ID_     | varchar(255) | 租户ID           |

## 16. act_ru_deadletter_job：运行时死信作业表

| Field                | Type          | Comment |
| -------------------- | ------------- | ------- |
| ID_                  | varchar(64)   |         |
| REV_                 | int(11)       |         |
| TYPE_                | varchar(255)  |         |
| EXCLUSIVE_           | tinyint(1)    |         |
| EXECUTION_ID_        | varchar(64)   |         |
| PROCESS_INSTANCE_ID_ | varchar(64)   |         |
| PROC_DEF_ID_         | varchar(64)   |         |
| EXCEPTION_STACK_ID_  | varchar(64)   |         |
| EXCEPTION_MSG_       | varchar(4000) |         |
| DUEDATE_             | timestamp(3)  |         |
| REPEAT_              | varchar(255)  |         |
| HANDLER_TYPE_        | varchar(255)  |         |
| HANDLER_CFG_         | varchar(4000) |         |
| TENANT_ID_           | varchar(255)  |         |

## 17. act_evt_log：事件日志表

描述：事件日志表，记录activiti引擎级别的事件日志，默认关闭

| Field         | Type         | Comment      |
| ------------- | ------------ | ------------ |
| LOG_NR_       | bigint(20)   |              |
| TYPE_         | varchar(64)  |              |
| PROC_DEF_ID_  | varchar(64)  | 流程定义ID   |
| PROC_INST_ID_ | varchar(64)  | 流程实例ID   |
| EXECUTION_ID_ | varchar(64)  | 执行实例ID   |
| TASK_ID_      | varchar(64)  | 任务ID       |
| TIME_STAMP_   | timestamp(3) | 发生时间戳   |
| USER_ID_      | varchar(255) | 用户ID       |
| DATA_         | longblob     | 事件json数据 |
| LOCK_OWNER_   | varchar(255) |              |
| LOCK_TIME_    | timestamp(3) |              |
| IS_PROCESSED_ | tinyint(4)   |              |

## 18. act_hi_actinst：历史活动信息表

**描述：**记录流程流转过的所有节点信息

这里记录流程流转过的所有节点，与HI_TASKINST不同的是，taskinst只记录usertask内容

| Field              | Type          | Comment                              |
| ------------------ | ------------- | ------------------------------------ |
| ID_                | varchar(64)   | 活动ID                               |
| PROC_DEF_ID_       | varchar(64)   | 所属流程定义ID                       |
| PROC_INST_ID_      | varchar(64)   | 所属流程实例ID                       |
| EXECUTION_ID_      | varchar(64)   | 所属执行实例ID                       |
| ACT_ID_            | varchar(255)  | 活动ID                               |
| TASK_ID_           | varchar(64)   | 任务ID，其他活动类型实例ID在这里为空 |
| CALL_PROC_INST_ID_ | varchar(64)   | 调用外部流程的流程实例ID             |
| ACT_NAME_          | varchar(255)  | 活动名称                             |
| ACT_TYPE_          | varchar(255)  | 活动类型startEvent、userTask         |
| ASSIGNEE_          | varchar(255)  | 任务办理人                           |
| START_TIME_        | datetime(3)   | 活动开始时间                         |
| END_TIME_          | datetime(3)   | 活动结束时间                         |
| DURATION_          | bigint(20)    | 耗时时间(毫秒)                       |
| DELETE_REASON_     | varchar(4000) | 删除原因                             |
| TENANT_ID_         | varchar(255)  | 租户ID                               |

## 19. act_hi_attachment：历史流程附件表

| Field         | Type          | Comment                          |
| ------------- | ------------- | -------------------------------- |
| ID_           | varchar(64)   | 附件ID                           |
| REV_          | int(11)       | 回退版本，做乐观锁用             |
| USER_ID_      | varchar(255)  | 用户ID                           |
| NAME_         | varchar(255)  | 附件名称                         |
| DESCRIPTION_  | varchar(4000) | 描述                             |
| TYPE_         | varchar(255)  | 附件类型                         |
| TASK_ID_      | varchar(64)   | 所属任务ID                       |
| PROC_INST_ID_ | varchar(64)   | 所属流程实例ID                   |
| URL_          | varchar(4000) | 附件地址url                      |
| CONTENT_ID_   | varchar(64)   | 内容Id，内容保存在二进制资源表中 |
| TIME_         | datetime(3)   | 创建时间                         |



## 20. act_hi_comment：历史审批意见表

| Field         | Type          | Comment                                                      |
| ------------- | ------------- | ------------------------------------------------------------ |
| ID_           | varchar(64)   | ID                                                           |
| TYPE_         | varchar(255)  | 类型有event(事件)、comment(意见)，默认comment                |
| TIME_         | datetime(3)   | 创建时间                                                     |
| USER_ID_      | varchar(255)  | 用户Id                                                       |
| TASK_ID_      | varchar(64)   | 任务ID                                                       |
| PROC_INST_ID_ | varchar(64)   | 流程实例ID                                                   |
| ACTION_       | varchar(255)  | 行为类型，有AddUserLink、DeleteUserLink、AddGroupLink、DeleteGroupLink、AddComment、AddAttachment、DeleteAttachment |
| MESSAGE_      | varchar(4000) | 用于存放流程产生的信息，比如审批意见                         |
| FULL_MSG_     | longblob      | 全部消息                                                     |

## 21. act_hi_detail：历史详情表

描述：提供历史变量的查询

| Field         | Type          | Comment |
| ------------- | ------------- | ------- |
| ID_           | varchar(64)   |         |
| TYPE_         | varchar(255)  |         |
| PROC_INST_ID_ | varchar(64)   |         |
| EXECUTION_ID_ | varchar(64)   |         |
| TASK_ID_      | varchar(64)   |         |
| ACT_INST_ID_  | varchar(64)   |         |
| NAME_         | varchar(255)  |         |
| VAR_TYPE_     | varchar(255)  |         |
| REV_          | int(11)       |         |
| TIME_         | datetime(3)   |         |
| BYTEARRAY_ID_ | varchar(64)   |         |
| DOUBLE_       | double        |         |
| LONG_         | bigint(20)    |         |
| TEXT_         | varchar(4000) |         |
| TEXT2_        | varchar(4000) |         |

## 22. act_hi_identitylink：历史身份连接表

**描述：**相同字段含义和运行时身份连接表一样



| Field         | Type         | Comment                                                      |
| ------------- | ------------ | ------------------------------------------------------------ |
| ID_           | varchar(64)  | id                                                           |
| GROUP_ID_     | varchar(255) | 组ID                                                         |
| TYPE_         | varchar(255) | 用户类型，有assignee、candidate、owner、starter、participant。即：受让人,候选人,所有者、起动器、参与者 |
| USER_ID_      | varchar(255) | 用户ID                                                       |
| TASK_ID_      | varchar(64)  | 任务ID                                                       |
| PROC_INST_ID_ | varchar(64)  | 流程实例ID                                                   |

## 23. act_hi_procinst：历史流程实例表

| Field                      | Type          | Comment                                                |
| -------------------------- | ------------- | ------------------------------------------------------ |
| ID_                        | varchar(64)   | 唯一ID                                                 |
| PROC_INST_ID_              | varchar(64)   | 流程实例ID                                             |
| BUSINESS_KEY_              | varchar(255)  | 关联业务系统的key，一般为【流程定义key:表单ID】 的形式 |
| PROC_DEF_ID_               | varchar(64)   | 流程定义ID                                             |
| START_TIME_                | datetime(3)   | 流程实例开始时间                                       |
| END_TIME_                  | datetime(3)   | 流程实例结束时间                                       |
| DURATION_                  | bigint(20)    | 总耗时(毫秒)                                           |
| START_USER_ID_             | varchar(255)  | 开始用户ID                                             |
| START_ACT_ID_              | varchar(255)  | 开始节点ID                                             |
| END_ACT_ID_                | varchar(255)  | 结束节点ID                                             |
| SUPER_PROCESS_INSTANCE_ID_ | varchar(64)   | 上级流程实例ID                                         |
| DELETE_REASON_             | varchar(4000) | 删除原因                                               |
| TENANT_ID_                 | varchar(255)  | 租户ID                                                 |
| NAME_                      | varchar(255)  | 流程实例名称                                           |

## 24. act_hi_taskinst：历史任务表

描述: 记录历史和正在进行的任务

| Field           | Type          | Comment              |
| --------------- | ------------- | -------------------- |
| ID_             | varchar(64)   | 唯一ID               |
| PROC_DEF_ID_    | varchar(64)   | 流程定义ID           |
| TASK_DEF_KEY_   | varchar(255)  | 任务的ID，画图时的ID |
| PROC_INST_ID_   | varchar(64)   | 所属流程实例ID       |
| EXECUTION_ID_   | varchar(64)   | 所属执行实例ID       |
| NAME_           | varchar(255)  | 任务名称             |
| PARENT_TASK_ID_ | varchar(64)   | 父任务ID             |
| DESCRIPTION_    | varchar(4000) | 任务描述             |
| OWNER_          | varchar(255)  | 任务拥有者           |
| ASSIGNEE_       | varchar(255)  | 任务办理人           |
| START_TIME_     | datetime(3)   | 任务开始时间         |
| CLAIM_TIME_     | datetime(3)   | 任务被拾取时间       |
| END_TIME_       | datetime(3)   | 任务结束时间         |
| DURATION_       | bigint(20)    | 总耗时(毫秒)         |
| DELETE_REASON_  | varchar(4000) | 删除原因             |
| PRIORITY_       | int(11)       | 优先级               |
| DUE_DATE_       | datetime(3)   | 办理时间             |
| FORM_KEY_       | varchar(255)  |                      |
| CATEGORY_       | varchar(255)  | 任务分类             |
| TENANT_ID_      | varchar(255)  | 租户ID               |

## 25. act_hi_varinst：历史流程变量表

| Field              | Type          | Comment                            |
| ------------------ | ------------- | ---------------------------------- |
| ID_                | varchar(64)   | 唯一ID                             |
| PROC_INST_ID_      | varchar(64)   | 所属流程实例ID                     |
| EXECUTION_ID_      | varchar(64)   | 执行实例ID                         |
| TASK_ID_           | varchar(64)   | 所属任务ID                         |
| NAME_              | varchar(255)  | 变量名                             |
| VAR_TYPE_          | varchar(100)  | 变量类型                           |
| REV_               | int(11)       | 回退版本，用于activiti的乐观锁操作 |
| BYTEARRAY_ID_      | varchar(64)   | 关联字节数组资源的ID               |
| DOUBLE_            | double        | 小数类型的值放这                   |
| LONG_              | bigint(20)    | 整数类型的值放这                   |
| TEXT_              | varchar(4000) | 文本类型的值放这                   |
| TEXT2_             | varchar(4000) | 文本类型的值放这                   |
| CREATE_TIME_       | datetime(3)   | 创建时间                           |
| LAST_UPDATED_TIME_ | datetime(3)   | 最后更改时间                       |

（完）
