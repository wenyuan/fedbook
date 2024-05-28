# 忘记 root 密码如何重置

## 问题描述

忘记了 root 密码，无法登录服务器。

## 解决方案

进入单用户模式更改一下 root 密码即可。

## 不同发行版本的操作

> 不同的 Linux 系统可能会有不同的操作步骤。

### 对于 CentOS 6.5

1）重启 Linux 系统，在读秒的时候按下任意键就会进入 GRUB 启动菜单

2）选中要使用的内核版本，按「e」进入编辑模式

3）将光标移动到 kernel 那一行，再按一次「e」进入 kernel 该行的编辑画面中。然后在出现的画面当中，最后方输入 `single`，注意前边有一个空格，例如：

```bash
kernel /vmlinuz-2.6.18-128.el5 ro root=LABEL=/ rhgb quiet single
```

4）按下回车键「Enter」确定，然后按「b」就可以启动进入单用户模式了，并自动以 root 用户身份进入命令行界面

6）现在就能够执行 `passwd` 命令来设置 root 的新密码了

7）根据系统提示输入两次新的密码后，`reboot` 重启系统

8）现在可以使用新设置的 root 密码登录了

### 对于 CentOS 7

1）重启 Linux 系统，在读秒的时候按下任意键就会进入 GRUB 启动菜单

2）选中要使用的内核版本，按「e」进入编辑模式

3）找到以 `linux16` 开头的行，将其中的 `ro` 参数更改为 `rw init=/sysroot/bin/sh`

4）按下「Ctrl + x」以启动修改后的内核，CentOS 7 将进入单用户模式，并自动以 root 用户身份进入命令行界面

5）使用 `chroot /sysroot` 命令切换根目录

6）执行 `passwd` 命令来设置新密码

7）执行 `touch /.autorelabel` 命令来更新 SELinux 安全标签

8）执行 `exit` 命令退出单用户模式，重新启动系统

9）现在可以使用新设置的 root 密码登录了

## 修改密码的密码重启失效

我在某个 CentOS 7 的镜像上测试时，发现修改密码成功，但是重启服务器又失效了。

解决方法如下：

在进入单用户模式后，执行：

```bash
vim /etc/selinux/config
```

更改为：

```bash
SELINUX=disabled
```

然后保存，重置密码，重启。
