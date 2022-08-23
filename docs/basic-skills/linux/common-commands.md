# 常用命令

## 文件管理

### 查看与检索文件内容

#### 1）cat 命令

用于连接文件并打印到标准输出设备上。

```bash
# 把 text1 的文档内容加上行号后输入 text2 这个文档里
cat -n text1 > text2

# 把 text1 和 text2 的文档内容加上行号（空白行不加）之后将内容附加到 text3 文档里
cat -b text1 text2 >> text3

# 清空 /etc/test.txt 文档内容
cat /dev/null > /etc/test.txt
```

> 语法格式：`cat [-nbs] [--help] [--version] fileName`
>
> 参数说明：
>
> * -n 或 --number：由 1 开始对所有输出的行数编号。
> * -b 或 --number-nonblank：和 -n 相似，只不过对于空白行不编号。
> * -s 或 --squeeze-blank：当遇到有连续两行以上的空白行，就代换为一行的空白行。

#### 2）wc 命令

```bash
# 查看文件里有多少行
wc -l filename
 
# 看文件里有多少个word
wc -w filename

# 文件里最长的那一行是多少个字
wc -L filename

# 统计字节数
wc -c
```

#### 3）grep 命令

```bash
# 在当前目录下查找含有指定字符串的文件，并标出行号
grep -rn "hello"

# 反向匹配，查找不包含指定字符串的内容
grep -v "hello"

# 查询指定文件中以 abc 开头的行
grep -n "^abc" access.log

# 计算一下该字串出现的次数
grep "hello" -c access.log

# 比对的时候，不计较大小写的不同
grep "hello" -i access.log
```

#### 4）vim 操作

```bash	
# normal模式下
0         # 光标移到行首（数字0）
$         # 光标移至行尾
shift + g # 跳到文件最后
gg        # 跳到文件头
	
# 显示行号
:set number
	
# 去除行号
:set nonumber
	
# 检索
/xxx(检索内容)  # 从头检索，按 n 查找下一个
?xxx(检索内容)  # 从尾部检索

# 检索的关键字会高亮，取消高亮显示
:noh
```

### 查找文件的四个命令

#### 1）which 命令

用于在环境变量 $PATH 指定的路径中，搜索某个系统命令的位置，并且返回第一个搜索结果。

也就是说，使用which命令，就可以看到某个系统命令是否存在，以及执行的到底是哪一个位置的命令。

```bash
which grep
```

#### 2）whereis 命令

用于程序名的搜索，而且只搜索二进制文件（参数 -b）、man 说明文件（参数 -m）和源代码文件（参数 -s）。如果省略参数，则返回所有信息。

```bash
whereis bash 
```

#### 3）find 命令

这才是用于查找一般文件所在位置的命令。

如果不设置任何参数，则将在当前目录下查找子目录与文件，并且将查找到的子目录和文件全部进行显示。

```bash
# 将当前目录及其子目录下所有文件后缀为 .c 的文件列出来
find . -name "*.c"

# 同上，但需要显示它们的详细信息
find . -name "*.c" -ls

# 将当前目录及其子目录中的所有文件列出
find . -type f

# 将当前目录及其子目录下所有最近 20 天内更新过的文件列出
find . -ctime  20

# 查找 /var/log 目录中更改时间在 7 日以前的普通文件，并在删除之前询问它们
find /var/log -type f -mtime +7 -ok rm {} \;
```

> 语法格式：`find <指定目录> <指定条件> <指定动作>`
> * <指定目录>：所要搜索的目录及其所有子目录，默认为当前目录。
> * <指定条件>：所要搜索的文件的特征。
> * <指定动作>：对搜索结果进行特定的处理。
>
> <指定条件> 有很多，常用的有：
>
> * -amin n：在过去 n 分钟内被读取过
> * -atime n：在过去n天内被读取过的文件
> * -cmin n：在过去 n 分钟内被修改过
> * -ctime n：在过去n天内被修改过的文件
> * -name name，-iname name：文件名称符合 name 的文件，iname 会忽略大小写
> * -type <文件类型>：指定类型的文件，文件类型可选：
>   * d：目录
>   * f：一般文件
>   * s：socket

#### 4）locate 命令

这也是用于查找一般文件所在位置的命令。它其实是 `find -name` 的另一种写法，但速度要快得多，原因在于它不搜索具体目录，而是搜索一个数据库（/var/lib/mlocate/mlocate.db），这个数据库中含有本地所有文件信息。

Linux 系统自动创建这个数据库，并且每天自动更新一次，所以使用 `locate` 命令查不到最新变动过的文件。为了避免这种情况，可以在使用 `locate` 之前，先使用 `updatedb` 命令，手动更新数据库。

```bash
# 查找 passwd 文件
locate passwd

# 搜索 etc 目录下所有以 sh 开头的文件
locate /etc/sh

# 搜索用户主目录下，所有以 m 开头的文件
locate ~/m

# 搜索用户主目录下，所有以 m 开头的文件，并且忽略大小写
locate -i ~/m
```

### 常用压缩，解压缩命令

压缩命令：

```bash
# 压缩成后缀 .tar 格式的文件
tar -zcvf test.tar test

# 压缩成后缀 .tar.gz 格式的文件
tar -zcvf test.tar.gz test

# 压缩成后缀 .zip 格式的文件
zip -r test.zip test
```

解压命令：

```bash
# 解压后缀为 .tar 格式的压缩包
tar -zxvf test.tar

# 解压后缀为 .tar.gz 格式的压缩包
tar -zxvf test.tar.gz

# 解压后缀为 .zip 格式的压缩包
unzip test.zip
# 解压到指定目录
unzip test.zip -d /opt/
```

### 机器间的文件传输

#### 1）scp 命令

用于向另一台机器发送文件。

```bash
# 将 /home/hello.py 发送到 192.168.10.50 机器的 /opt/ 目录下
scp /home/hello.py root@192.168.10.50:/opt/
```

#### 2）rz/sz 命令

用于 PC 和服务器之间传输文件，这组命令需要安装包：`lrzsz`。

```bash
# Linux 向 Windows 发送文件
sz filename

# Windows 向 Linux 发送文件
rz -be
```

> -be 参数是为了防止文件较大时可能长传出错的情况，如果执行命令有弹框，记得取消弹出对话框中 "Upload files as ASCII" 前的勾选。
>
> * -a 或 --ascii：以文本方式传输
> * -b 或 --binary：以二进制方式传输，推荐使用
> * -e 或 --escape：对所有控制字符转义，建议使用

## 磁盘管理

### 创建与查询目录

#### 1）mkdir 命令

用于创建目录。

```bash
# 在工作目录下，建立一个名为 www 的子目录
mkdir www

# 在工作目录下的 www 目录中，建立一个名为 fedbook 的子目录。若 www 目录原本不存在，则建立一个。
mkdir -p www/fedbook
```

#### 2）ls 命令

用于显示指定工作目录下之内容（列出目前工作目录所含之文件及子目录）。

```bash
# 列出根目录下的所有目录
ls /

# 列出目前工作目录下所有名称是 s 开头的文件，越新的排越后面
ls -ltr s*

# 将 /bin 目录以下所有目录及文件详细资料列出
ls -lR /bin

# 列出目前工作目录下所有文件及目录；目录于名称后加 "/", 可执行档于名称后加 "*"
ls -AF
```

> 语法格式：`ls [-alrtAFR] [name...]`
>
> 参数说明：
>
> * -a：显示所有文件及目录（`.` 开头的隐藏文件也会列出）
> * -l：除文件名称外，亦将文件型态、权限、拥有者、文件大小等资讯详细列出
> * -r：将文件以相反次序显示（原定依英文字母次序）
> * -t：将文件依建立时间之先后次序列出
> * -A：同 -a ，但不列出 "."（目前目录）及 ".."（父目录）
> * -F：在列出的文件名称后加一符号；例如可执行档则加 "*"，目录则加 "/"
> * -R：若目录下有文件，则以下之文件亦皆依序列出

### 统计磁盘使用情况

```bash
# 以可读性较高的方式显示全部的文件系统
df -ah

# 以可读性较高的方式显示文件大小
ls -alh

# 查看当前目录磁盘总占用大小
du -hs

# 查看当前目录下各个文件，文件夹占了多少空间，不会递归
du -hs *

# 查看目录及子目录大小
du -Hh
```

### 打印树状目录结构

```bash
# Ubuntu 安装 tree
apt install tree
# CentOS 安装 tree
yum install tree

# 打印当前目录下的树形结构
tree

# 最多显示两级深度
tree -L 2

# 打印指定目录下的树形结构，并输出到文件
tree /home > tree.txt
```

> 语法格式：`tree [-aACdDfFgilnNpqstux][-I <范本样式>][-P <范本样式>][目录...]`
>
> 参数说明（有很多，仅列举常用的）：
>
> * -a：显示所有文件和目录，包括隐藏文件、目录。
> * -C：在文件和目录清单加上色彩，便于区分各种类型。
> * -L：目录树的最大显示深度。
> * -F：为目录添加一个 `/`，为套接字文件添加一个 `=`，为可执行文件添加一个 `*`，为 FIFO 添加一个 `|`。

## 网络通讯

### ifconfig 命令

用于显示或设置网络设备。

显示内容详解：

```bash
[root@localhost ~]# ifconfig
eth0      Link encap:Ethernet  HWaddr 00:50:56:BF:26:20  
          inet addr:192.168.120.204  Bcast:192.168.120.255  Mask:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:8700857 errors:0 dropped:0 overruns:0 frame:0
          TX packets:31533 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000 
          RX bytes:596390239 (568.7 MiB)  TX bytes:2886956 (2.7 MiB)

lo        Link encap:Local Loopback  
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:16436  Metric:1
          RX packets:68 errors:0 dropped:0 overruns:0 frame:0
          TX packets:68 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0 
          RX bytes:2856 (2.7 KiB)  TX bytes:2856 (2.7 KiB)
```

* 第一行
  * eth0 表示第一块网卡
  * Link encap 表示该网卡位于 OSI 物理层的名称（Ethernet：以太网，Local Loopback：本地环回）
  * HWaddr 表示网卡的物理地址，即MAC 地址
* 第二行
  * inet addr 表示该网卡在 TCP/IP 网络中的IP 地址
  * Bcast 表示广播地址
  * Mask 表示子网掩码
* 第三行
  * UP（代表网卡开启状态），RUNNING（代表网卡的网线被接上），MULTICAST（支持组播）
  * MTU 表示最大传送单元，不同局域网类型的 MTU 值不一定相同，对以太网来说，MTU 的默认设置是 1500 个字节
  * Metric 表示度量值，通常用于计算路由成本
* 第四行
  * RX 表示接收的数据包情况统计
  * RX packets: errors:0 dropped:0 overruns:0 frame:0 接受包数量/出错数量/丢失数量/过载数量/帧数
* 第五行
  * TX 表示发送的数据包情况统计
  * TX packets: errors:0 dropped:0 overruns:0 carrier:0 发送包数量/出错数量/丢失数量/过载数量/载波
* 第六行
  * collisions 表示数据包冲突的次数
  * txqueuelen 表示传送列队（Transfer Queue）长度
* 第七行
  * RX 表示接收字节
  * TX 表示发送字节

### 检测主机和端口连接情况

检测主机通不通：

```bash
# 检测是否与主机连通，需要手动终止：Ctrl+C
ping www.baidu.com

# 指定收到两次包后，自动退出
ping -c 2 www.baidu.com

# 发送周期为 3 秒，设置发送包的大小为 1024 字节，设置 TTL 值为 255
ping -i 3 -s 1024 -t 255 www.baidu.com
```

检测端口通不通：

```bash
# 监听 TCP 端口是否通
telnet 192.168.10.50 80

# 监听 UDP 端口是否通
nc -vuz 192.168.10.50 514
```

### netstat 命令

用于显示网络状态。

```bash
# 显示所有连线中的端口
netstat -anp

# 列出监听中的 TCP 端口
netstat -lntp

# 列出监听中的 UDP 端口
netstat -lnup

# 查询端口占用情况
lsof -i:port
```

> 语法格式：`netstat [-acCeFghilMnNoprstuvVwx][-A<网络类型>][--ip]`
>
> 参数说明（太多了，仅列举常用的）：
>
> * -a 或 --all：显示所有连线中的 Socket。
> * -l 或 --listening：显示监控中的服务器的 Socket。
> * -n 或 --numeric：直接使用 IP 地址，而不通过域名服务器。
> * -p 或 --programs：显示正在使用Socket的程序识别码和程序名称。
> * -t 或 --tcp：显示 TCP 传输协议的连线状况。
> * -u 或 --udp：显示 UDP 传输协议的连线状况。

输出每个 IP 的连接数，以及总的各个状态的连接数：

```bash
netstat -n | awk '/^tcp/ {n=split($(NF-1),array,":");if(n<=2)++S[array[(1)]];else++S[array[(4)]];++s[$NF];++N} END {for(a in S){printf("%-20s %s\n", a, S[a]);++I}printf("%-20s %s\n","TOTAL_IP",I);for(a in s) printf("%-20s %s\n",a, s[a]);printf("%-20s %s\n","TOTAL_LINK",N);}'
```

统计所有连接状态： 

```bash
netstat -n | awk '/^tcp/ {++state[$NF]} END {for(key in state) print key,"\t",state[key]}'
```

* CLOSED：无连接是活动的或正在进行
* LISTEN：服务器在等待进入呼叫
* SYN_RECV：一个连接请求已经到达，等待确认
* SYN_SENT：应用已经开始，打开一个连接
* ESTABLISHED：正常数据传输状态
* FIN_WAIT1：应用说它已经完成
* FIN_WAIT2：另一边已同意释放
* ITMED_WAIT：等待所有分组死掉
* CLOSING：两边同时尝试关闭
* TIME_WAIT：主动关闭连接一端还没有等到另一端反馈期间的状态
* LAST_ACK：等待所有分组死掉

查找较多 time_wait 连接：

```bash
netstat -n|grep TIME_WAIT|awk '{print $5}'|sort|uniq -c|sort -rn|head -n20
```


###	tcpdump 命令

用于抓包。

```bash
# 抓取经过 eth0 网卡的包，过滤条件为端口号 80
tcpdump -i eth0 port 80

# 抓本地环回的包
tcpdump -i lo port 80

# 将抓到的包导出为 test.pcap 文件
tcpdump -i lo port 80 -w test.pcap
```

## 系统管理

### 添加、修改、删除用户

创建常规用户：

```bash
# 创建用户，会自动创建 home 目录
adduser 用户名
# 设置、修改密码
passwd 用户密码

# 增加 sudo 权限
vim /etc/sudoers
# 修改文件里面的
# root    ALL=(ALL) ALL
# 用户名    ALL=(ALL) ALL
```

删除用户：

```bash
# 删除用户、密码、用户组，保留用户的家目录和用户的邮件目录
userdel testuser

# 删除用户与其 home 目录和用户的邮件通知目录
userdel -r testuser
```

创建一个不能 ssh 登录的帐号（这类账号专门用于启动服务，只是让服务启动起来，但是不能登录系统 —— 提升安全性）：

```bash
useradd 用户名 -s /sbin/nologin -M
```

> 在 useradd 命令后跟了两个参数，它们分别表示：
>
> * -s：表示指定用户所用的 shell，此处为 `/sbin/nologin`，表示不登录
> * -M：表示不创建用户主目录

### date 命令

用来显示或设定系统的日期与时间。

```bash
# 直接显示日期与时间：Thu Mar 24 13:35:25 CST 2022
date

# 自定义输出格式
date "+%Y_%m_%d %H-%M-%S"
```

### 最近登录信息列表

```bash
# 最近登录的 5 个账号
last -n 5
```

### 查找进程：ps 命令

用于显示当前进程的状态，类似于 Windows 的任务管理器。

```bash
# 查找指定进程
ps -ef | grep 进程关键字

# 显示进程信息
ps -A

# 显示指定用户信息
ps -u 用户名
```

> 语法格式：`ps [options] [--help]`
>
> 参数说明（ps 的参数非常多，在此仅列出几个常用的参数）：
>
> * -A：列出所有的进程
> * -w：显示加宽可以显示较多的资讯
> * -au：显示较详细的资讯
> * -aux：显示所有包含其他使用者的行程

显示内容详解（以 `ps -aux` 为例）：

```bash
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
```

* USER：进程拥有者
* PID：pid
* %CPU：占用的 CPU 使用率
* %MEM：占用的内存使用率
* VSZ：占用的虚拟内存大小
* RSS：占用的内存大小
* TTY：终端的次要装置号码（minor device number of tty）
* STAT：该进程的状态
  * D：无法中断的休眠状态（通常表示该进程正在进行 I/O 动作）
  * R：正在运行或者在运行队列中等待
  * S：休眠，在等待某个事件、信号
  * T：暂停执行，进程接收到信息 SIGSTOP，SIGSTP，SIGTIN，SIGTOU 信号
  * Z：不存在但暂时无法消除（僵死进程）
  * W：没有足够的内存分页可分配
  * <：高优先级的行程
  * N：低优先级的行程
  * L：有内存分页分配并锁在内存内（即时系统或定制 I/O）
* START：进程开始时间
* TIME：执行的时间
* COMMAND：所执行的指令

### 监控服务器性能

#### 1）top 命令

用于实时显示 process 的动态。

```bash
# 显示进程信息
top

# 显示完整命令
top -c

# 显示指定的进程信息
top -p 进程号
```

TOP 交互命令如下（运行 top 命令后，键入如下按键触发交互行为）：

```bash
c  # 显示完整的命令
d  # 更改刷新频率
h  # 显示帮助画面
H  # 显示线程
i  # 忽略闲置和僵死进程
m  # 显示内存信息
M  # 根据内存资源使用大小进行排序
N  # 按 PID 由高到低排列
P  # 根据 CPU 资源使用大小进行排序
q  # 退出 top 命令
S  # 累计模式（把已完成或退出的子进程占用的 CPU 时间累计到父进程的 MITE+）
T  # 根据进程使用 CPU 的累积时间排序
t  # 显示进程和 CPU 状态信息（即显示隐藏 CPU 行）
u  # 指定用户进程
<  # 向前翻页
>  # 向后翻页
?  # 显示帮助画面
1  # 数字 1，显示每个 CPU 的详细情况
```

显示内容详解（以 `top -c` 为例）：

```bash
PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
```

* PID：进程 id
* PPID：父进程 id
* RUSER：Real user name
* UID：进程所有者的用户 id
* USER：进程所有者的用户名
* GROUP：进程所有者的组名
* TTY：启动进程的终端名。不是从终端启动的进程则显示为 ?
* PR：优先级
* NI：nice 值。负值表示高优先级，正值表示低优先级
* P：最后使用的 CPU，仅在多 CPU 环境下有意义
* %CPU：上次更新到现在的 CPU 时间占用百分比
* TIME：进程使用的 CPU 时间总计，单位秒
* TIME+：进程使用的 CPU 时间总计，单位 1/100 秒
* %MEM：进程使用的物理内存百分比
* VIRT：进程使用的虚拟内存总量，单位 kb。VIRT=SWAP+RES
* SWAP：进程使用的虚拟内存中，被换出的大小，单位 kb
* RES：进程使用的、未被换出的物理内存大小，单位 kb，RES=CODE+DATA
* CODE：可执行代码占用的物理内存大小，单位 kb
* DATA：可执行代码以外的部分（数据段+栈）占用的物理内存大小，单位 kb
* SHR：共享内存大小，单位 kb
* nFLT：页面错误次数
* nDRT：最后一次写入到现在，被修改过的页面数
* S：进程状态。D=不可中断的睡眠状态，R=运行，S=睡眠，T=跟踪/停止，Z=僵尸进程
* COMMAND：命令名/命令行
* WCHAN：若该进程在睡眠，则显示睡眠中的系统函数名
* Flags：任务标志，参考 sched.h

#### 2）free 命令

用于显示内存状态（包括实体内存，虚拟的交换文件内存，共享内存区段，以及系统核心使用的缓冲区等）。

```bash
# 显示内存使用信息
free

# 以总和的形式查询内存的使用信息
free -t

# 每 10s 执行一次命令
free -s 10
```

> 语法格式：`free [-bkmotV][-s <间隔秒数>]`
>
> 参数说明：
>
> * -b：以 Byte 为单位显示内存使用情况。
> * -k：以 KB 为单位显示内存使用情况。
> * -m：以 MB 为单位显示内存使用情况。
> * -h：以合适的单位显示内存使用情况，最大为三位数，自动计算对应的单位值。单位有：
>   * B = bytes
>   * K = kilos
>   * M = megas
>   * G = gigas
>   * T = teras
> * -o：不显示缓冲区调节列。
> * -s<间隔秒数>：持续观察内存使用状况。
> * -t：显示内存总和列。
> * -V：显示版本信息。

显示内容详解（以 `free -m` 为例）：

```bash
              total        used        free      shared  buff/cache   available
Mem:          48257       26204         625         190       21427       21335
Swap:         49105        1652       47453
```

* 行
  * Mem：内存的使用情况。
  * Swap：交换空间的使用情况。
* 列
  * total：总的内存量
  * used：被当前运行中的进程使用的内存量
  * free：未被使用的内存量
  * shared：在两个或多个进程之间共享的内存量
  * buffers：内存中保留用于内核记录进程队列请求的内存量
  * cache：在 RAM 中存储最近使用过的文件的页缓冲大小
  * buff/cache 缓冲区和缓存总的使用内存量（被 buffer 和 cache 使用的物理内存大小）
  * available 可用于启动新应用的可用内存量（不含交换分区）

关系：total(48257M) = used(26204M) + free(625M) + buff/cache(21427M)，少许偏差是由于单位转换为 M 后造成的。


更多的参考[linux下free命令详解](https://www.cnblogs.com/ultranms/p/9254160.html)。


### shutdown 命令

用来进行开关机。

```bash
# 立即关机
shutdown -h now

# 重新启动计算机
shutdown -r now
```

## 系统设置

### alias 和 unalias 命令

alias 命令用于设置指令的别名，unalias 命令用于删除别名。

> alias 的效力仅作用于本次登入的操作。

```bash
# 列出目前所有的别名设置
alias

# 给命令设置别名
alias ll='ls -alF'

# 显示别名
alias ll

# 删除别名
unalias ll
```

### 清除历史命令记录

```
echo > /root/.bash_history
history -c

# 清空指定用户的记录
su - xxx
echo > ./.bash_history
history -c
```

## 日常操作

### 后台运行命令

用于在系统后台不挂断地运行命令，退出终端不会影响程序的运行。

```bash
# 后台运行，并且有 nohup.out 输出
nohup xxx &

# 后台运行，不输出任何日志
nohup xxx > /dev/null &

# 后台运行，并将错误信息做标准输出到日志中 
nohup xxx >out.log 2>&1 &
```

### 同步服务器时间

Linux 服务器运行久时，系统时间就会存在一定的误差，此时可以使用 ntpdate 进行时间同步。

```bash
# 与中国国家授时中心的官方服务器同步
ntpdate -u 210.72.145.44

# 与 NTP 服务器（上海）同步
ntpdate -u ntp.api.bz
```

## Linux 命令大全

* [Linux 命令大全](https://www.runoob.com/linux/linux-command-manual.html)

（完）
