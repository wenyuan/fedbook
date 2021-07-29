# 使用 smtplib 发送电子邮件

## 准备

### 1. 开启邮箱的 SMTP 服务

这里使用第三方 SMTP 服务发送邮件，可以使用 QQ 邮箱，163，Gmail 等的 SMTP 服务，但需要做以下配置，以 QQ 邮箱为例。

登录 QQ 邮箱，依次点击最上方的**设置** => **账户**，

<div style="text-align: center;">
  <img src="./assets/qq-smtp-setting-1.png" alt="QQ 邮箱设置">
  <p style="text-align: center; color: #888;">（QQ 邮箱设置，未来界面可能会变化）</p>
</div>

往下翻页，找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV** 这一版块，开启 **POP3/SMTP 服务**。（不同版本的 QQ 可能会不一样，总之就是找到 QQ 邮箱的「POP3/SMTP服务」开启按钮）

<div style="text-align: center;">
  <img src="./assets/qq-smtp-setting-2.png" alt="开启 POP3/SMTP 服务">
  <p style="text-align: center; color: #888;">（开启 POP3/SMTP 服务，未来界面可能会变化）</p>
</div>

成功开启 QQ 邮箱的 SMTP 服务后，我们会得到一串授权码，在后面的代码里，这串授权码就是我们邮箱的登录密码。开启 SMTP 服务可能需要进行手机验证，根据提示来就好。

### 2. 常用的邮件服务器配置

下面整理了常用的邮件服务器名称、地址及 SSL/非SSL 协议端口号。

**网易 163 免费邮箱相关服务器信息：**

| 服务器名称 |   服务器地址     |  SSL协议端口号  |  非SSL协议端口号  |
| :------: | :------------: | :-----------: | :------------: |
|   IMAP   |  imap.163.com  |      993      |       143      |
|   SMTP   |  smtp.163.com  |    454/994    |        25      |
|   POP3   |  pop.163.com   |       995     |       110      |


**网易 163 企业邮箱相关服务器信息：**（免费企业邮箱的 smtp 服务器名及端口号为：smtp.ym.163.com / 25）

| 服务器名称 |   服务器地址          |  SSL协议端口号   |  非SSL协议端口号  |
| :------: | :-----------------: | :------------: | :-------------: |
|   IMAP   |  imap.qiye.163.com  |      993       |       143       |
|   SMTP   |  smtp.qiye.163.com  |      994	      |        25       |
|   POP3   |  pop.qiye.163.com   |      995	      |       110       |


**网易 126 免费邮箱相关服务器信息：**

| 服务器名称 |   服务器地址     |  SSL协议端口号   |  非SSL协议端口号  |
| :------: | :------------: | :------------: | :-------------: |
|   IMAP   |  imap.126.com  |      993       |       143       |
|   SMTP   |  smtp.126.com  |    465/994     |       25        |
|   POP3   |  pop.126.com   |      995       |       110       |


**腾讯 QQ 免费邮箱相关服务器信息：**

| 服务器名称 |   服务器地址     |  SSL协议端口号   |  非SSL协议端口号  |
| :------: | :------------: | :------------: | :-------------: |
|   IMAP   |  imap.qq.com   |      993       |       143       |
|   SMTP   |  smtp.qq.com   |    465/587     |       25        |
|   POP3   |  pop.qq.com    |      995       |       110       |


**腾讯 QQ 企业邮箱相关服务器信息：**

| 服务器名称 |       服务器地址       |  SSL协议端口号   |  非SSL协议端口号  |
| :------: | :------------------: | :------------: | :-------------: |
|   IMAP   |  imap.exmail.qq.com  |      993       |       143       |
|   SMTP   |  smtp.exmail.qq.com  |    465/587     |       25        |
|   POP3   |  pop.exmail.qq.com   |      995       |       110       |


**谷歌 Gmail 邮箱相关服务器信息：**

| 服务器名称 |     服务器地址     |  SSL协议端口号   |  非SSL协议端口号  |
| :------: | :--------------: | :------------: | :-------------: |
|   IMAP   |  imap.gmail.com  |      993       |       143       |
|   SMTP   |  smtp.gmail.com  |      465       |       25        |
|   POP3   |  pop.gmail.com   |      995       |       110       |

## 发送纯文本邮件

> 下面所有示例使用 QQ 邮箱，注意 QQ 邮箱 SMTP 服务器地址：smtp.qq.com，ssl，端口：465。

以下实例你需要修改：发件人邮箱（你的 QQ 邮箱），密码，收件人邮箱（可发给自己）。

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import smtplib
from email.header import Header
from email.mime.text import MIMEText

# ----- 需要修改的参数 -----
# email相关
sender = 'fedbook@qq.com'
password = '******'
smtp_server = 'smtp.qq.com'
smtp_port = 465
receivers = ['recever1@163.com', 'recever2@qq.com']
# ------------------------


def send_email(subject, detail):
    now_time = time.strftime('%Y-%m-%d %H:%M:%S')
    mail_msg = """
    时间：{now_time}
    详情：{detail}
    """.format(subject=subject, now_time=now_time, detail=detail)

    msg = MIMEText(mail_msg, 'plain', 'utf-8')
    msg['From'] = Header('fedbook汇报人 <%s>' % sender, 'utf-8')
    msg['To'] = Header('fedbook订阅者', 'utf-8')
    msg['Subject'] = Header(subject, 'utf-8')

    try:
        smtp = smtplib.SMTP_SSL(smtp_server, smtp_port)
        # smtp.set_debuglevel(1)    # 打印和SMTP服务器交互的所有信息
        smtp.login(sender, password)
        smtp.sendmail(sender, receivers, msg.as_string())
        smtp.quit()
        print('邮件发送成功')
    except smtplib.SMTPException as e:
        print('Error: 无法发送邮件')
        print(e)


if __name__ == "__main__":
    email_title = 'Python SMTP 纯文本邮件测试'
    detail = """
    欢迎访问：www.fedbook.cn
    这里是 WENYUAN 的学习小册，记录前端学习的知识体系
    包含 HTML, CSS, JavaScript, Vue, React, 数据结构与算法, 设计模式, etc.
    """
    send_email(email_title, detail)
```

## 发送 HTML 格式的邮件

以下实例你需要修改：发件人邮箱（你的 QQ 邮箱），密码，收件人邮箱（可发给自己）。

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import smtplib
from email.header import Header
from email.mime.text import MIMEText

# ----- 需要修改的参数 -----
# email相关
sender = 'fedbook@qq.com'
password = '******'
smtp_server = 'smtp.qq.com'
smtp_port = 465
receivers = ['recever1@163.com', 'recever2@qq.com']
# ------------------------


def send_email(subject, detail):
    now_time = time.strftime('%Y-%m-%d %H:%M:%S')
    mail_msg = """
    <h1 style='margin-top:10px;margin-bottom:10px;text-align:center'>{subject}</h1>
    <hr>
    <h2 style='margin-top:0;margin-bottom:10px'>时间</h2>
    <div style='margin-left: 40px'>{now_time}</div>
    <hr>
    <h2 style='margin-top:0;margin-bottom:10px'>详情</h2>
    <div style='margin-left: 40px'>{detail}</div>
    <hr>
    """.format(subject=subject, now_time=now_time, detail=detail)

    msg = MIMEText(mail_msg, 'html', 'utf-8')
    msg['From'] = Header('fedbook汇报人 <%s>' % sender, 'utf-8')
    msg['To'] = Header('fedbook订阅者', 'utf-8')
    msg['Subject'] = Header(subject, 'utf-8')

    try:
        smtp = smtplib.SMTP_SSL(smtp_server, smtp_port)
        # smtp.set_debuglevel(1)    # 打印和SMTP服务器交互的所有信息
        smtp.login(sender, password)
        smtp.sendmail(sender, receivers, msg.as_string())
        smtp.quit()
        print('邮件发送成功')
    except smtplib.SMTPException as e:
        print('Error: 无法发送邮件')
        print(e)


if __name__ == "__main__":
    email_title = 'Python SMTP HTML格式邮件测试'
    detail = """
    <div>欢迎访问：<a href="http://www.fedbook.cn" target="_blank">www.fedbook.cn</a></div>
    <div style='margin-bottom:5px'>这里是 WENYUAN 的学习小册，记录前端学习的知识体系。</div>
    """
    send_email(email_title, detail)
```

## 发送带附件的邮件

以下实例你需要修改：发件人邮箱（你的 QQ 邮箱），密码，收件人邮箱（可发给自己）。

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
import smtplib
from email.header import Header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ----- 需要修改的参数 -----
# email相关
sender = 'fedbook@qq.com'
password = '******'
smtp_server = 'smtp.qq.com'
smtp_port = 465
receivers = ['recever1@163.com', 'recever2@qq.com']
# ------------------------


def send_email(subject, detail, attach_list):
    now_time = time.strftime('%Y-%m-%d %H:%M:%S')
    mail_msg = """
    时间：{now_time}
    详情：{detail}
    """.format(subject=subject, now_time=now_time, detail=detail)

    # 创建一个带附件的实例
    msg = MIMEMultipart()
    # msg = MIMEText(mail_msg, 'plain', 'utf-8')
    msg['From'] = Header('fedbook汇报人 <%s>' % sender, 'utf-8')
    msg['To'] = Header('fedbook订阅者', 'utf-8')
    msg['Subject'] = Header(subject, 'utf-8')

    # 邮件正文内容
    msg.attach(MIMEText(mail_msg, 'plain', 'utf-8'))
    # 构造附件，传送指定目录下的文件
    for att_path in attach_list:
        att = MIMEText(open(att_path, 'rb').read(), 'base64', 'utf-8')
        att["Content-Type"] = 'application/octet-stream'
        # 这里的filename可以任意写，写什么名字，邮件中显示什么名字
        att["Content-Disposition"] = 'attachment; filename={filename}'.format(filename=att_path)
        msg.attach(att)

    try:
        smtp = smtplib.SMTP_SSL(smtp_server, smtp_port)
        # smtp.set_debuglevel(1)    # 打印和SMTP服务器交互的所有信息
        smtp.login(sender, password)
        smtp.sendmail(sender, receivers, msg.as_string())
        smtp.quit()
        print('邮件发送成功')
    except smtplib.SMTPException as e:
        print('Error: 无法发送邮件')
        print(e)


if __name__ == "__main__":
    email_title = 'Python SMTP 带附件邮件测试'
    detail = """
    欢迎访问：www.fedbook.cn
    这里是 WENYUAN 的学习小册，记录前端学习的知识体系。
    附件是网站源码，请查收。
    """
    attach_list = ['send_email.py', 'README.md']
    send_email(email_title, detail, attach_list)
```

## 总结

以上就是通过 Python SMTP 发送邮件的代码示例，一般情况下是够用了。还有一些图片 email 等特殊邮件，因为需要考虑到兼容性问题，有些邮箱默认不显示图片，个人感觉不太常用，就不整理了。

## 参考资料

* [smtplib](https://docs.python.org/3/library/smtplib.html "smtplib -- SMTP protocol client")
* [email](https://docs.python.org/zh-cn/3/library/email.html "email -- 电子邮件与 MIME 处理包")

（完）
