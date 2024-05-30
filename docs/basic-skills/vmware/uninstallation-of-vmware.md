# VMware 彻底卸载删除干净

VMware 这个软件属于安装容易卸载难，因为卸载不干净会导致后续重新安装和使用出现各种问题，本文整理彻底卸载删除干净 VMware 的步骤。

## 一、卸载虚拟机内的系统

关闭虚拟机，移除虚拟机 or 从磁盘中删除，区别是这个虚拟机的镜像是否需要保留以备下次使用，视个人情况而定。

## 二、卸载 VMware 软件

### 终止相关的服务和进程

同时按下键盘的「Win+R」键，打开运行框。输入命令 `services.msc`，点击确定，进入服务页面。

找到跟 VMware 相关的服务，应该是下面四个（未来版本可能会变，但一般都是以 `VMware` 开头的）：

```bash
VMware Authorization Service
VMware DHCP Service
VMware NAT Service
VMware USB Aribitration Service
```

依次右键点击其中的每一个，在弹出的下拉列表中点击「停止」按钮，稍等片刻即可停止对应的服务。左上角变成「[启动](#二卸载-vmware-软件)此服务」代表已经停止服务了。

### 结束相关的进程

同时按下键盘的「Crtl+Shift+Esc」键，打开任务管理器，并找到以 `VMware` 开头命名的进程，然后右键结束这些进程任务（如果有）。

### 开始卸载软件

同时按下键盘的「Win+R」键，打开运行框。输入命令 `control`，点击确定，进入控制面板，然后点击「程序和功能」，找到 `WMware Workstation` 并卸载它。

## 三、清理注册表

同时按下键盘的「Win+R」键，打开运行框。输入命令 `regedit`，点击确定，打开注册表编辑器。

在注册表编辑器中找到 `HKEY_CURRENT_USER` 目录，再依次打开 `software` —> `VMware, Inc.`，右击删除。

打开我的电脑，在 C 盘的 Program Files(x86) 文件下找到 VMware 文件，然后删除。

至此，VMware 虚拟机以彻底卸载完成，接下来重新安装就不会有问题了。

## 四、进一步清理残余无效文件

如果想进一步删掉 VMware 软件产生的无效文件、空文件夹、日志等，就需要借助一些工具了，因为它们可能会散布各地，不影响重新安装，但是有洁癖的就会想要彻底删干净。

+ 借助 [eveything 软件](https://www.voidtools.com/zh-cn/)，这是一个快速查找文件的工具。
+ 借助 [CCleaner 软件](https://www.ccleaner.com/zh-cn/ccleaner/download/standard)，这是一个计算机文件清理工具。

打开 everything，在搜索框输入 `VMware`，把你看到的全删除（稍微判断下再删除，防止有的文件名字里有 `VMware` 但实际上和 VMware 无关）。

打开 CCleaner，点击四个方框的那个按钮（Registry），列表全选，点击「Scan for Issues」按钮，选中你需要的问题（或者全选），选择右下角「Review selected Issues」，然后他会问你要不要备份注册表（以防万一可以备份，不过需要查一下怎么恢复），然后选择「fix」（如果问题多的话就会有两个 fix，左边的是只修改该文件，右边那个是修改选中的所有问题），选择修复所有问题，最后点击「close」即可。

（完）
