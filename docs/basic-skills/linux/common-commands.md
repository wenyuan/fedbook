# 常用命令

## 基本操作

### Linux 关机，重启

```bash
# 关机
shutdown -h now

# 重启
shutdown -r now
```

### 查看系统，CPU 信息

```bash
# 查看系统内核信息
uname -a

# 查看系统内核版本
cat /proc/version

# 查看当前用户环境变量
env
cat /proc/cpuinfo

# 查看有几个逻辑 CPU，包括 CPU 型号
cat /proc/cpuinfo | grep name | cut -f2 -d: | uniq -c

# 查看有几颗 CPU，每颗分别是几核
cat /proc/cpuinfo | grep physical | uniq -c

# 查看当前 CPU 运行在 32bit 还是 64bit 模式下，如果是运行在 32bit 下也不代表 CPU 不支持 64bit
getconf LONG_BIT

# 结果大于 0，说明支持 64bit 计算。lm 指 long mode，支持 lm 则是 64bit
cat /proc/cpuinfo | grep flags | grep ' lm ' | wc -l
```

### rpm 相关

```bash
# 查看是否通过 rpm 安装了该软件
rpm -qa | grep 软件名
```

### 命令重命名

```bash
# 在各个用户的 .bash_profile 中添加重命名配置
alias ll='ls -alF'
```

### 同步服务器时间

```bash
sudo ntpdate -u ntp.api.bz
```

### 后台运行命令

```bash
# 后台运行，并且有nohup.out输出
nohup xxx &

# 后台运行，不输出任何日志
nohup xxx > /dev/null &

# 后台运行，并将错误信息做标准输出到日志中 
nohup xxx >out.log 2>&1 &
```

### 查看命令路径

```bash
which <命令>
```

### 查看进程所有打开最大 fd 数

```bash
ulimit -n
```

### nslookup，查看域名路由表

```bash
nslookup google.com
```

### last，最近登录信息列表

```bash
# 最近登录的 5 个账号
last -n 5
```

### 添加用户，配置 sudo 权限

```bash
# 新增用户
useradd 用户名
passwd 用户名

# 增加 sudo 权限
vim /etc/sudoers
# 修改文件里面的
# root    ALL=(ALL) ALL
# 用户名    ALL=(ALL) ALL
```

## 文件管理

### cat 命令

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


TODO...




#### 2）more：用于一页一页地显示文件内容

more 命令类似 cat ，不过会以一页一页的形式显示，更方便使用者逐页阅读，而最基本的指令就是按空白键（space）就往下一页显示，按 b 键就会往回（back）一页显示，而且还有搜寻字串的功能（与 vi 相似）。

**语法格式**：

`more [-dlfpcsu] [-num] [+/pattern] [+linenum] [fileNames...]`

> 参数说明：
> 
> * -num 一次显示的行数
> * -d 提示使用者，在画面下方显示 [Press space to continue, ‘q’ to quit.] ，如果使用者按错键，则会显示 [Press ‘h’ for instructions.] 而不是「哔」声
> * -l 取消遇见特殊字元 ^L（送纸字元）时会暂停的功能
> * -f 计算行数时，以实际上的行数，而非自动换行过后的行数（有些单行字数太长的会被扩展为两行或两行以上）
> * -p 不以卷动的方式显示每一页，而是先清除萤幕后再显示内容
> * -c 跟 -p 相似，不同的是先显示内容再清除其他旧资料
> * -s 当遇到有连续两行以上的空白行，就代换为一行的空白行
> * -u 不显示下引号（根据环境变数 TERM 指定的 terminal 而有所不同）
> * +/pattern 在每个文档显示前搜寻该字串（pattern），然后从该字串之后开始显示
> * +num 从第 num 行开始显示
> * fileNames 欲显示内容的文档，可为复数个数

**实例应用**：

* 逐页显示 `testfile` 文档内容，如有连续两行以上空白行则以一行空白行显示。

```bash
more -s testfile
```

* 从第 20 行开始显示 `testfile` 之文档内容。

```bash
more +20 testfile
```

#### 3）rm：用于删除一个文件或者目录

**语法规则**：

`rm [options] name...`

> 参数说明：
> 
> * -i 删除前逐一询问确认。
> * -f 即使原档案属性设为唯读，亦直接删除，无需逐一确认。
> * -r 将目录及以下之档案亦逐一删除。

**实例应用**：

* 删除文件可以直接使用 rm 命令，若删除目录则必须配合选项 -r，例如：

```bash
# 删除文件
rm test.txt

# 删除目录
rm -r homework  
```

* 删除当前目录下的所有文件及目录，命令行为：

```bash
rm -r * 
```

#### 4）cp：主要用于复制文件或目录

**语法规则**：

`cp [options] source dest` 或 `cp [options] source... directory`

> 参数说明：
>
> * -a：此选项通常在复制目录时使用，它保留链接、文件属性，并复制目录下的所有内容。其作用等于 dpR 参数组合。
> * -d：复制时保留链接。这里所说的链接相当于 Windows 系统中的快捷方式。
> * -f：覆盖已经存在的目标文件而不给出提示。
> * -i：与 -f 选项相反，在覆盖目标文件之前给出提示，要求用户确认是否覆盖，回答 "y" 时目标文件将被覆盖。
> * -p：除复制文件的内容外，还把修改时间和访问权限也复制到新文件中。
> * -r：若给出的源文件是一个目录文件，此时将复制该目录下所有的子目录和文件。
> * -l：不复制文件，只是生成链接文件。

**实例应用**：

* 使用指令 cp 将当前目录 `test/` 下的所有文件复制到新目录 `newtest` 下，输入如下命令：

```bash
$ cp –r test/ newtest
```

#### 4）read：用于从标准输入读取数值

read 内部命令被用来从标准输入读取单行数据。这个命令可以用来读取键盘输入，当使用重定向的时候，可以读取文件中的一行数据。

**语法规则**：

`read [-ers] [-a aname] [-d delim] [-i text] [-n nchars] [-N nchars] [-p prompt] [-t timeout] [-u fd] [name ...]`

> 参数说明：
>
> * -a 后跟一个变量，该变量会被认为是个数组，然后给其赋值，默认是以空格为分割符。
> * -d 后面跟一个标志符，其实只有其后的第一个字符有用，作为结束的标志。
> * -p 后面跟提示信息，即在输入前打印提示信息。
> * -e 在输入的时候可以使用命令补全功能。
> * -n 后跟一个数字，定义输入文本的长度，很实用。
> * -r 屏蔽 \，如果没有该选项，则 \ 作为一个转义字符，有的话 \ 就是个正常的字符了。
> * -s 安静模式，在输入字符时不再屏幕上显示，例如 login 时输入密码。
> * -t 后面跟秒数，定义输入字符的等待时间。
> * -u 后面跟 fd，从文件描述符中读入，该文件描述符可以是 exec 新开启的。

## 磁盘管理

#### 1）cd：用于切换当前工作目录

**语法规则**：

`cd [dirName]`

其中 dirName 表示法可为绝对路径或相对路径。若目录名称省略，则变换至使用者的 `home` 目录（也就是刚 login 时所在的目录）。另外，`~` 也表示为 `home` 目录 的意思，`.` 则是表示目前所在的目录，`..` 则表示目前目录位置的上一层目录。

**实例应用**：

* 跳到 `/usr/bin/`：

```bash
cd /usr/bin
```

* 跳到自己的 `home` 目录：

```bash
cd ~
```

* 跳到目前目录的上上两层：

```bash
cd ../..
```

#### 2）mkdir：用于创建目录

**语法规则**：

`mkdir [-p] dirName`

> 参数说明：
>
> * -p 确保目录名称存在，不存在的就建一个。

**实例应用**：

* 在工作目录下，建立一个名为 `www` 的子目录：

```bash
mkdir www
```

* 在工作目录下的 `www` 目录中，建立一个名为 `fedbook` 的子目录。若 `www` 目录原本不存在，则建立一个。

```bash
mkdir -p www/fedbook
```

#### 3）pwd：用于显示工作目录

执行 pwd 指令可立刻得知目前所在的工作目录的绝对路径名称。

#### 4）rmdir：删除空的目录

**语法规则**：

`rmdir [-p] dirName`

> 参数说明：
>
> * -p 是当子目录被删除后使它也成为空目录的话，则顺便一并删除。

**实例应用**

* 将工作目录下，名为 `AAA` 的子目录删除：

```bash
rmdir AAA
```

* 在工作目录下的 `BBB` 目录中，删除名为 `Test` 的子目录。若 `Test` 删除后，`BBB` 目录成为空目录，则 `BBB` 亦予删除。

```bash
rmdir -p BBB/Test
```

#### 5）ls：用于显示指定工作目录下之内容（列出目前工作目录所含之文件及子目录）

**语法规则**：

`ls [-alrtAFR] [name...]`

> 参数说明：
> 
> * -a 显示所有文件及目录（`.` 开头的隐藏文件也会列出）
> * -l 除文件名称外，亦将文件型态、权限、拥有者、文件大小等资讯详细列出
> * -r 将文件以相反次序显示（原定依英文字母次序）
> * -t 将文件依建立时间之先后次序列出
> * -A 同 -a ，但不列出 `.`（目前目录）及 `..`（父目录）
> * -F 在列出的文件名称后加一符号；例如可执行档则加 `*`，目录则加 `/`
> * -R 若目录下有文件，则以下之文件亦皆依序列出

**实例应用**：

* 列出根目录下的所有目录：

```bash
ls /
```

* 列出目前工作目录下所有名称是 `s` 开头的文件，越新的排越后面：

```bash
ls -ltr s*
```

* 将 `/bin` 目录以下所有目录及文件详细资料列出：

```bash
ls -lR /bin
```

* 列出目前工作目录下所有文件及目录；目录于名称后加 `/`，可执行档于名称后加 `*`：

```bash
ls -AF
```

## 网络通讯





















## 磁盘，文件，目录相关操作

### vim 操作

```bash
# normal 模式下，g 表示全局，x 表示查找的内容，y 表示替换后的内容
:%s/x/y/g
	
# normal 模式下
0  # 光标移到行首（数字 0）
$  # 光标移至行尾
shift + g # 跳到文件最后
gg # 跳到文件头
	
# 显示行号
:set nu
	
# 去除行号
:set nonu
	
# 检索
/xxx(检索内容)  # 从头检索, 按n查找下一个
?xxx(检索内容)  # 从尾部检索
```

### 打开只读文件，修改后需要保存时（不用切换用户即可保存的方式）

```bash
# 在 normal 模式下
:w !sudo tee %
```

### 查看磁盘，文件目录基本信息

```bash
# 查看磁盘挂载情况
mount

# 查看磁盘分区信息
df

# 查看目录及子目录大小
du -H -h

# 查看当前目录下各个文件，文件夹占了多少空间，不会递归
du -sh *
```

### wc 命令

```bash
# 查看文件里有多少行
wc -l filename
 
# 看文件里有多少个 word
wc -w filename

# 文件里最长的那一行是多少个字
wc -L filename

# 统计字节数
wc -c
```

### 常用压缩，解压缩命令

#### 压缩命令

```bash
tar czvf xxx.tar 压缩目录
	
zip -r xxx.zip 压缩目录
```

#### 解压缩命令

```bash
tar zxvf xxx.tar
	
# 解压到指定文件夹
tar zxvf xxx.tar -C /xxx/yyy/
	
unzip xxx.zip
```

### 变更文件所属用户，用户组

```bash
chown eagleye.eagleye xxx.log
```

### cp，scp，mkdir

```bash
# 复制
cp xxx.log

# 复制并强制覆盖同名文件
cp -f xxx.log

# 复制文件夹
cp -r xxx(源文件夹) yyy(目标文件夹)

# 远程复制
scp -P ssh端口 username@10.10.10.101:/home/username/xxx /home/xxx

# 级联创建目录
mkdir -p /xxx/yyy/zzz

# 批量创建文件夹, 会在test,main下都创建java, resources文件夹
mkdir -p src/{test,main}/{java,resources}
```

### 比较两个文件

```bash
diff -u 1.txt 2.txt
```

### 日志输出的字节数，可以用作性能测试

```bash
# 如果做性能测试，可以每执行一次，往日志里面输出 “.”，这样日志中的字节数就是实际的性能测试运行的次数，还可以看见实时速率。
tail -f xxx.log | pv -bt
```

### 查看，去除特殊字符

```bash
# 查看特殊字符
cat -v xxx.sh

# 去除特殊字符
sed -i 's/^M//g’ env.sh  去除文件的特殊字符，比如^M:  需要这样输入: ctrl+v+enter
```

### 处理因系统原因引起的文件中特殊字符的问题

```bash
# 可以转换为该系统下的文件格式
cat file.sh > file.sh_bak

# 先将 file.sh 中文件内容复制下来然后运行，然后粘贴内容，最后 ctrl + d 保存退出
cat > file1.sh

# 在 vim 中通过如下设置文件编码和文件格式
:set fileencodings=utf-8 ，然后 w （存盘）一下即可转化为 utf8 格式，
:set fileformat=unix

# 在 mac 下使用 dos2unix 进行文件格式化
find . -name "*.sh" | xargs dos2unix
```

### tee，重定向的同时输出到屏幕

```bash
awk ‘{print $0}’ xxx.log | tee test.log
```

## 检索相关

### grep

```bash
# 反向匹配，查找不包含 xxx 的内容
grep -v xxx

# 排除所有空行
grep -v '^$'

# 返回结果 2，则说明第二行是空行
grep -n “^$” 111.txt    

# 查询以 abc 开头的行
grep -n “^abc” 111.txt 

# 同时列出该词语出现在文章的第几行
grep 'xxx' -n xxx.log

# 计算一下该字串出现的次数
grep 'xxx' -c xxx.log

# 比对的时候，不计较大小写的不同
grep 'xxx' -i xxx.log
```

### awk

```bash
# 以':' 为分隔符，如果第五域有 user 则输出该行
awk -F ':' '{if ($5 ~ /user/) print $0}' /etc/passwd 

# 统计单个文件中某个字符（串）(中文无效)出现的次数
awk -v RS='character' 'END {print --NR}' xxx.txt
```

### find 检索命令

```bash
# 在目录下找后缀是 .mysql 的文件
find /home/eagleye -name '*.mysql' -print

# 会从 /usr 目录开始往下找，找最近3天之内存取过的文件。
find /usr -atime 3 –print
  
# 会从 /usr 目录开始往下找，找最近5天之内修改过的文件。
find /usr -ctime 5 –print

# 会从 /doc 目录开始往下找，找jacky 的、文件名开头是 j的文件。  
find /doc -user jacky -name 'j*' –print

# 会从 /doc 目录开始往下找，找寻文件名是 ja 开头或者 ma开头的文件。
find /doc \( -name 'ja*' -o- -name 'ma*' \) –print

# 会从 /doc 目录开始往下找，找到凡是文件名结尾为 bak的文件，把它删除掉。-exec 选项是执行的意思，rm 是删除命令，{ } 表示文件名，“\;”是规定的命令结尾。 
find /doc -name '*bak' -exec rm {} \;
```

## 网络相关

### 查看什么进程使用了该端口

```bash
lsof -i:port
```

### 获取本机 ip 地址

```bash
/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v inet6|awk '{print $2}'|tr -d "addr:"
```

### iptables

```bash
# 查看 iptables 状态
service iptables status

# 要封停一个 ip
iptables -I INPUT -s ***.***.***.*** -j DROP

# 要解封一个 IP，使用下面这条命令：
iptables -D INPUT -s ***.***.***.*** -j DROP

备注: 参数-I是表示Insert（添加），-D表示Delete（删除）。后面跟的是规则，INPUT表示入站，***.***.***.***表示要封停的IP，DROP表示放弃连接。

# 开启 9090 端口的访问
/sbin/iptables -I INPUT -p tcp --dport 9090 -j ACCEPT 

# 防火墙开启、关闭、重启
/etc/init.d/iptables status
/etc/init.d/iptables start
/etc/init.d/iptables stop
/etc/init.d/iptables restart
```

### nc 命令, tcp 调试利器

```bash
# 给某一个endpoint发送TCP请求,就将data的内容发送到对端
nc 192.168.0.11 8000 < data.txt

# nc可以当做服务器，监听某个端口号,把某一次请求的内容存储到received_data里
nc -l 8000 > received_data

# 上边只监听一次，如果多次可以加上-k参数
nc -lk 8000
```

### tcpdump

```bash
# dump出本机 12301 端口的 tcp 包
tcpdump -i em1 tcp port 12301 -s 1500 -w abc.pcap
```

### 跟踪网络路由路径

```bash
# traceroute默认使用udp方式, 如果是-I则改成icmp方式
traceroute -I www.163.com

# 从ttl第3跳跟踪
traceroute -M 3 www.163.com  

# 加上端口跟踪
traceroute -p 8080 192.168.10.11
```

### ss

```bash
# 显示本地打开的所有端口
ss -l 
	
# 显示每个进程具体打开的socket
ss -pl 
	
# 显示所有tcp socket
ss -t -a 
	
# 显示所有的UDP Socekt
ss -u -a 
	
# 显示所有已建立的SMTP连接
ss -o state established '( dport = :smtp or sport = :smtp )'  
	
# 显示所有已建立的HTTP连接 
ss -o state established '( dport = :http or sport = :http )'  
	
找出所有连接X服务器的进程
ss -x src /tmp/.X11-unix/*  
	
列出当前socket统计信息
ss -s 
	
解释：netstat是遍历/proc下面每个PID目录，ss直接读/proc/net下面的统计信息。所以ss执行的时候消耗资源以及消耗的时间都比netstat少很多
```

### netstat

```bash
# 输出每个ip的连接数，以及总的各个状态的连接数
netstat -n | awk '/^tcp/ {n=split($(NF-1),array,":");if(n<=2)++S[array[(1)]];else++S[array[(4)]];++s[$NF];++N} END {for(a in S){printf("%-20s %s\n", a, S[a]);++I}printf("%-20s %s\n","TOTAL_IP",I);for(a in s) printf("%-20s %s\n",a, s[a]);printf("%-20s %s\n","TOTAL_LINK",N);}'

# 统计所有连接状态, 
# CLOSED：无连接是活动的或正在进行
# LISTEN：服务器在等待进入呼叫
# SYN_RECV：一个连接请求已经到达，等待确认
# SYN_SENT：应用已经开始，打开一个连接
# ESTABLISHED：正常数据传输状态
# FIN_WAIT1：应用说它已经完成
# FIN_WAIT2：另一边已同意释放
# ITMED_WAIT：等待所有分组死掉
# CLOSING：两边同时尝试关闭
# TIME_WAIT：主动关闭连接一端还没有等到另一端反馈期间的状态
# LAST_ACK：等待所有分组死掉
netstat -n | awk '/^tcp/ {++state[$NF]} END {for(key in state) print key,"\t",state[key]}'

# 查找较多 time_wait 连接
netstat -n|grep TIME_WAIT|awk '{print $5}'|sort|uniq -c|sort -rn|head -n20
```

## 监控 Linux 性能命令

### top

```bash
按大写的 F 或 O 键，然后按 a-z 可以将进程按照相应的列进行排序，然后回车。而大写的 R 键可以将当前的排序倒转
```

|列名     |含义     |
|:------ |:--------|
|PID     |进程 id   |
|PPID    |父进程 id |
|RUSER   |Real user name   |
|UID     |进程所有者的用户 id   |
|USER    |进程所有者的用户名   |
|GROUP   |进程所有者的组名   |
|TTY     |启动进程的终端名。不是从终端启动的进程则显示为 ?   |
|PR      |优先级   |
|NI      |nice 值。负值表示高优先级，正值表示低优先级   |
|P       |最后使用的 CPU，仅在多 CPU 环境下有意义   |
|%CPU    |上次更新到现在的 CPU 时间占用百分比   |
|TIME    |进程使用的 CPU 时间总计，单位秒   |
|TIME+   |进程使用的 CPU 时间总计，单位 1/100 秒   |
|%MEM    |进程使用的物理内存百分比   |
|VIRT    |进程使用的虚拟内存总量，单位 kb。VIRT=SWAP+RES   |
|SWAP    |进程使用的虚拟内存中，被换出的大小，单位 kb。   |
|RES     |进程使用的、未被换出的物理内存大小，单位 kb。RES=CODE+DATA   |
|CODE    |可执行代码占用的物理内存大小，单位 kb   |
|DATA    |可执行代码以外的部分（数据段+栈）占用的物理内存大小，单位 kb   |
|SHR     |共享内存大小，单位 kb   |
|nFLT    |页面错误次数   |
|nDRT    |最后一次写入到现在，被修改过的页面数。   |
|S       |进程状态。D=不可中断的睡眠状态，R=运行，S=睡眠，T=跟踪/停止，Z=僵尸进程   |
|COMMAND |命令名/命令行   |
|WCHAN   |若该进程在睡眠，则显示睡眠中的系统函数名   |
|Flags   |任务标志，参考 sched.h   |

### dmesg，查看系统日志

```bash
dmesg
```

### iostat，磁盘 IO 情况监控

```bash
iostat -xz 1
	
# r/s, w/s, rkB/s, wkB/s：分别表示每秒读写次数和每秒读写数据量（千字节）。读写量过大，可能会引起性能问题。
# await：IO操作的平均等待时间，单位是毫秒。这是应用程序在和磁盘交互时，需要消耗的时间，包括IO等待和实际操作的耗时。如果这个数值过大，可能是硬件设备遇到了瓶颈或者出现故障。
# avgqu-sz：向设备发出的请求平均数量。如果这个数值大于1，可能是硬件设备已经饱和（部分前端硬件设备支持并行写入）。
# %util：设备利用率。这个数值表示设备的繁忙程度，经验值是如果超过60，可能会影响IO性能（可以参照IO操作平均等待时间）。如果到达100%，说明硬件设备已经饱和。
# 如果显示的是逻辑设备的数据，那么设备利用率不代表后端实际的硬件设备已经饱和。值得注意的是，即使IO性能不理想，也不一定意味这应用程序性能会不好，可以利用诸如预读取、写缓存等策略提升应用性能。
```

### free，内存使用情况

```bash
free -m
	
eg:
	
					total       used       free     shared    buffers     cached
Mem:         	1002        769        232          0         62        421
-/+ buffers/cache:        	 286        715
Swap:          1153          0       1153
	
第一部分Mem行:
total 内存总数: 1002M
used 已经使用的内存数: 769M
free 空闲的内存数: 232M
shared 当前已经废弃不用,总是0
buffers Buffer 缓存内存数: 62M
cached Page 缓存内存数:421M
	
关系：total(1002M) = used(769M) + free(232M)
	
第二部分(-/+ buffers/cache):
(-buffers/cache) used内存数：286M (指的第一部分Mem行中的used – buffers – cached)
(+buffers/cache) free内存数: 715M (指的第一部分Mem行中的free + buffers + cached)
	
可见-buffers/cache反映的是被程序实实在在吃掉的内存,而+buffers/cache反映的是可以挪用的内存总数.
	
第三部分是指交换分区
```

### sar，查看网络吞吐状态

```bash
# sar命令在这里可以查看网络设备的吞吐率。在排查性能问题时，可以通过网络设备的吞吐量，判断网络设备是否已经饱和
sar -n DEV 1
	
#
# sar命令在这里用于查看TCP连接状态，其中包括：
# active/s：每秒本地发起的TCP连接数，既通过connect调用创建的TCP连接；
# passive/s：每秒远程发起的TCP连接数，即通过accept调用创建的TCP连接；
# retrans/s：每秒TCP重传数量；
# TCP连接数可以用来判断性能问题是否由于建立了过多的连接，进一步可以判断是主动发起的连接，还是被动接受的连接。TCP重传可能是因为网络环境恶劣，或者服务器压力过大导致丢包
sar -n TCP,ETCP 1
```

### vmstat，给定时间监控 CPU 使用率，内存使用，虚拟内存交互，IO 读写

```bash
# 2 表示每 2 秒采集一次状态信息，1 表示只采集一次（忽略既是一直采集）
vmstat 2 1
	
eg:
r b swpd free buff cache si so bi bo in cs us sy id wa
1 0 0 3499840 315836 3819660 0 0 0 1 2 0 0 0 100 0
0 0 0 3499584 315836 3819660 0 0 0 0 88 158 0 0 100 0
0 0 0 3499708 315836 3819660 0 0 0 2 86 162 0 0 100 0
0 0 0 3499708 315836 3819660 0 0 0 10 81 151 0 0 100 0
1 0 0 3499732 315836 3819660 0 0 0 2 83 154 0 0 100 0
```

* **r** 表示运行队列(就是说多少个进程真的分配到CPU)，我测试的服务器目前CPU比较空闲，没什么程序在跑，当这个值超过了CPU数目，就会出现CPU瓶颈了。这个也和top的负载有关系，一般负载超过了3就比较高，超过了5就高，超过了10就不正常了，服务器的状态很危险。top的负载类似每秒的运行队列。如果运行队列过大，表示你的CPU很繁忙，一般会造成CPU使用率很高。

* **b** 表示阻塞的进程,这个不多说，进程阻塞，大家懂的。

* **swpd** 虚拟内存已使用的大小，如果大于0，表示你的机器物理内存不足了，如果不是程序内存泄露的原因，那么你该升级内存了或者把耗内存的任务迁移到其他机器。

* **free** 空闲的物理内存的大小，我的机器内存总共8G，剩余3415M。

* **buff** Linux/Unix系统是用来存储，目录里面有什么内容，权限等的缓存，我本机大概占用300多M

* **cache** cache直接用来记忆我们打开的文件,给文件做缓冲，我本机大概占用300多M(这里是Linux/Unix的聪明之处，把空闲的物理内存的一部分拿来做文件和目录的缓存，是为了提高 程序执行的性能，当程序使用内存时，buffer/cached会很快地被使用。)

* **si** 每秒从磁盘读入虚拟内存的大小，如果这个值大于0，表示物理内存不够用或者内存泄露了，要查找耗内存进程解决掉。我的机器内存充裕，一切正常。

* **so** 每秒虚拟内存写入磁盘的大小，如果这个值大于0，同上。

* **bi** 块设备每秒接收的块数量，这里的块设备是指系统上所有的磁盘和其他块设备，默认块大小是1024byte，我本机上没什么IO操作，所以一直是0，但是我曾在处理拷贝大量数据(2-3T)的机器上看过可以达到140000/s，磁盘写入速度差不多140M每秒

* **bo** 块设备每秒发送的块数量，例如我们读取文件，bo就要大于0。bi和bo一般都要接近0，不然就是IO过于频繁，需要调整。

* **in** 每秒CPU的中断次数，包括时间中断

* **cs** 每秒上下文切换次数，例如我们调用系统函数，就要进行上下文切换，线程的切换，也要进程上下文切换，这个值要越小越好，太大了，要考虑调低线程或者进程的数目,例如在apache和nginx这种web服务器中，我们一般做性能测试时会进行几千并发甚至几万并发的测试，选择web服务器的进程可以由进程或者线程的峰值一直下调，压测，直到cs到一个比较小的值，这个进程和线程数就是比较合适的值了。系统调用也是，每次调用系统函数，我们的代码就会进入内核空间，导致上下文切换，这个是很耗资源，也要尽量避免频繁调用系统函数。上下文切换次数过多表示你的CPU大部分浪费在上下文切换，导致CPU干正经事的时间少了，CPU没有充分利用，是不可取的。

* **us** 用户CPU时间，我曾经在一个做加密解密很频繁的服务器上，可以看到us接近100,r运行队列达到80(机器在做压力测试，性能表现不佳)。

* **sy** 系统CPU时间，如果太高，表示系统调用时间长，例如是IO操作频繁。

* **id** 空闲 CPU时间，一般来说，id + us + sy = 100,一般我认为id是空闲CPU使用率，us是用户CPU使用率，sy是系统CPU使用率。

* **wt** 等待IO CPU时间。
