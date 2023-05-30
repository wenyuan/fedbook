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
  */5 * * * * /root/XXXX.sh &>/dev/null 2>&1  
  ```

* 将正确和错误日志都输出到 `/tmp/debug.log`
  ```bash
  */1 * * * * /root/XXXX.sh > /tmp/debug.log 2>&1 &
  ```

* 只输出正确日志到 `/tmp/debug.log`
  ```bash
  */1 * * * * /root/XXXX.sh > /tmp/debug.log &
  # 等同于
  */1 * * * * /root/XXXX.sh 1> /tmp/debug.log &
  ```

* 只输出错误日志到 `/tmp/debug.log`
  ```bash
  */1 * * * * /root/XXXX.sh 2> /tmp/debug.log &
  ```

> 名词解释：
> * 在 shell 中，每个进程都和三个系统文件相关联：标准输入（stdin），标准输出（stdout）和标准错误（stderr）。三个系统文件的文件描述符分别为 `0`，`1` 和 `2`。所以这里 `2>&1` 的意思就是将标准错误也输出到标准输出当中。
> * `>` 就相当于 `1>` 也就是重定向标准输出，不包括标准错误。通过 `2>&1`，就将标准错误重定向到标准输出了（stderr 已作为 stdout 的副本），那么再使用 `>` 重定向就会将标准输出和标准错误信息一同重定向了。如果只想重定向标准错误到文件中，则可以使用 `2> file`。

（完）
