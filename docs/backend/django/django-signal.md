# Signal 监测 model 变化

signal 是 Django 自带的一个信号调度程序。它和 Git 的 hooks 有点类似，通俗来说就是当你的程序产生一个事件时，会通过 signal 自动触发其他的事件。比如在论坛中，帖子得到回复时，通知楼主；在工单系统中，当工单状态产生变化时自动发送邮件给相关人。

事实上，通知就是 signal 最常用的场景之一。

## 内置信号

Django 内部已经定义好了一些 signal 供我们使用，如果不能满足我们也可以自定义 signal，其中 Django 内部定义的 signal 主要分为几类：

### model signals

* `pre_init`：model 初始化前触发
* `post_init`：model 初始化后触发
* `pre_save`：save() 方法前触发
* `post_save`：save() 方法后触发
* `pre_delete`：delete() 方法前触发
* `post_delete`：delete() 方法后触发
* `m2m_changed`：ManyToManyField 字段改变时触发
* `class_prepared`：没用过字面意思理解吧

### management signals

* `pre_migrate`：migrate 之前触发
* `post_migrate`：migrate 之后触发

### request/response signals

* `request_started`：请求开始时触发
* `request_finished`：请求完成后触发
* `got_request_exception`：请求异常时触发

### test signals

* `setting_changed`：配置改变时触发
* `template_rendered`：模板渲染时触发

### Database Wrappers

* `connection_created`：连接建立时触发

## 使用实例

下面用一个实际的例子来说明信号的使用。

### model 定义

就以工单系统发送通知的需求为例，先创建一个普通的 Django app 名字就叫 `workflow`。来看看一个简化版的工单表结构：

```python
# workflow/models.py
class Ticket(models.Model):
    '''工单表'''

    STATE = (
        (1, '待审批'),
        (2, '已撤销'),
        (3, '已通过'),
        (4, '被拒绝'),
        (5, '已挂起'),
        (6, '执行中'),
        (7, '已完成'),
        (8, '已失败')
    )

    created_time = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    created_user = models.ForeignKey(User, on_delete=models.DO_NOTHING, verbose_name='创建用户')

    state = models.IntegerField(choices=STATE, default=1, verbose_name='工单状态')
```

Ticket 工单表有一个 `state` 字段标识当前工单状态，这个状态会随着工单的进行而改变，每当工单状态改变时就需要发送通知给相应的用户，例如工单创建时，需要发送给创建者一个工单创建成功的通知，同时发送给审核者一个待审核的通知。

### 编写通知类

每一个状态的变化都需要通知，为了代码易读及解耦，我们需要写一个单独的通知类，当需要通知的时候调用一下就好了。

通知类中需要判断当前工单的状态，为了避免写太多的 if-else 代码，可以维护一个状态字典，然后用一个 if 判断就可以了：

```python
# workflow/backends/notify.py
class Notify:
    def __init__(self):
        self.receiver_list = ["admin@xxx.com", "devops@xxx.com"]

    def push_notification(self, pk):
        '''推送通知'''

        _ticket = Ticket.objects.get(id=pk)
        _username = _ticket.created_user.username
        _state = _ticket.state

        _jump_url = "https://xxx.com/xxx/%d/" %(_ticket.id)
        state_map = {
            1: [{
                "subject": "[已提交]-xx系统工单",
                "content": "你的工单已提交，正在等待后台人员审批，后续有状态变更将会自动通知你。\r\n\r\n工单详情：%s" %_jump_url,
                "receiver_list": [_username],
            }, {
                "subject": "[待审批]-xx系统工单",
                "content": "你有工单需要审批，点击下方工单详情链接及时审批。\r\n\r\n工单详情：%s" %_jump_url,
                "receiver_list": self.receiver_list,
            }],
            6: [{
                "subject": "[执行中]-xx系统工单",
                "content": "工单已通过后台人员审核，正在执行中，后续有状态变更将会自动通知你。\r\n\r\n工单详情：%s" %_jump_url,
                "receiver_list": [_username] + self.receiver_list,
            }],
            7: [{
                "subject": "[已完成]-xx系统工单",
                "content": "工单已完成，请检查最终状态，如有任何疑问随时联系DBA。\r\n\r\n工单详情：%s" %_jump_url,
                "receiver_list": [_username] + self.receiver_list,
            }]
        }

        _email_list = state_map[_state]
        for i in range(0, len(_email_list)):
            try:
                # Email 是封装的发送邮件的类，不是重点，这里就不展开了
                Email(
                    subject=_email_list[i]['subject'], 
                    content=_email_list[i]['content'], 
                    receiver_list=_email_list[i]['receiver_list']
                )
            except Exception as e:
                print('Error:' +str(e))
```

### signal 定义

接下来定义信号通知，第一步需要新建 `workflow/signals.py` 文件绑定 signal：

```python
from django.db.models import signals
from django.dispatch import receiver

from workflow.models import Ticket
from workflow.backends.notify import Notify


@receiver(signals.post_init, sender=Ticket)
def migrate_notify_init(instance, **kwargs):
    instance.old_state = instance.state


@receiver(signals.post_save, sender=Ticket)
def migrate_notify_post(instance, created, **kwargs):
    if created or instance.old_state != instance.state:
        Notify().push_notification(instance.id)
```

这里用到了两个 signal：`post_init` 和 `post_save`。

在 model 初始化之后通过 `post_init` 信号获取到 state 的值作为初始状态值，在每次 model 执行 save 方法后调用 `post_save` 信号获取到新的状态值，对两次状态值做比较如果不一致则表示状态有更新发送通知。

因为第一个函数中的判断只能判断到状态变更了发通知，但工单在第一次创建时 `old_state` 和 `state` 是一样的，所以也需要在 save 之后判断下这次操作是不是新建，如果是新建同样需要发送通知。

### 加载 signal

接下来加载 signal，需要修改两个配置文件：

* 第一个配置文件：`workflow/apps.py`：

```python
from django.apps import AppConfig


class WorkflowConfig(AppConfig):
    name = 'workflow'

    def ready(self):
        import workflow.signals
```

* 第二个配置文件：`workflow/__init__.py`：

```python
default_app_config = 'workflow.apps.WorkflowConfig'
```

绑定成功后就可以在每次工单状态发生变化时发送邮件了。

（完）
