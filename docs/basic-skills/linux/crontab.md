# crontab 命令

> Linux 中的 `crontab` 是用来执行定时任务/周期性任务的，比较常用，这里主要记录常用知识点。

## crontab 计算器

* [crontab 执行时间计算](https://tool.lu/crontab/)

## 常用命令

* 编辑
  ```bash
  crontab -e 
  ```
* 重新启动
  ```bash
  sudo /etc/init.d/cron restart
  ```
* 查看日志
  ```bash
  tail cron /var/log/syslog
  ```

## 重定向输出

如果 crontab 不重定向输出，并且 crontab 所执行的命令有输出内容的话，默认会将输出内容以邮件的形式发送给用户，内容存储在邮件文件：

```bash
/var/spool/mail/$user
```

如果命令执行比较频繁（比如每分钟一次），或者命令输出内容较多，会使这个邮件文件不断追加内容，文件越来越大。而邮件文件一般存放在根分区，根分区一般相对较小，所以会造成根分区写满而无法登录服务器。

* 不输出内容
  ```bash
  */1 * * * * /root/XXXX.sh > /dev/null 2>&1  
  ```

* 将正确和错误日志都追加输出到 `/tmp/debug.log`
  ```bash
  */1 * * * * /root/XXXX.sh >> /tmp/debug.log 2>&1
  ```

* 只输出正确日志到 `/tmp/debug.log`
  ```bash
  */1 * * * * /root/XXXX.sh >> /tmp/debug.log
  # 等同于
  */1 * * * * /root/XXXX.sh 1>> /tmp/debug.log
  ```

* 只输出错误日志到 `/tmp/debug.log`
  ```bash
  */1 * * * * /root/XXXX.sh 2>> /tmp/debug.log
  ```

> 名词解释：
> * 在 shell 中，每个进程都和三个系统文件相关联：标准输入（stdin），标准输出（stdout）和标准错误（stderr）。三个系统文件的文件描述符分别为 `0`，`1` 和 `2`。`>` 就相当于 `1>` 也就是重定向标准输出，不包括标准错误。
> * 所以这里 `2>&1` 的意思就是将标准错误也输出到标准输出当中。

## 使用日期命名重定向文件

如果将每次定时任务的输出都追加到日志文件中，那么运行了一段很长的时间后，这个文件的内容会很大，这样不方便查看对应日期的输出记录。

因此我们可以按不同时段写入不同的日志文件，例如每日，每周，每月使用一个日志文件（具体根据不同的需求定义）这样就可以方便搜寻。

例如：

* 每分钟执行，使用当天日期来命名重定向文件
  ```bash
  */1 * * * * /root/XXXX.sh >> "/tmp/$(date +"\%Y-\%m-\%d").log" 2>&1
  ```

* 同理，也可以使用月份/周为日志命名，如果日志内容很多也可以按小时来命名
  ```bash
  # 使用月份命名
  */1 * * * * /root/XXXX.sh >> "/tmp/$(date +"\%Y-\%m").log" 2>&1

  # 使用周命名
  */1 * * * * /root/XXXX.sh >> "/tmp/$(date +"\%Y-W\%W").log" 2>&1

  # 使用小时命名
  */1 * * * * /root/XXXX.sh >> "/tmp/$(date +"\%Y-\%m-\%d_\%H").log" 2>&1
  ```

（完）
