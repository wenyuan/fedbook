# Nginx 设置开机自启

在生产环境中，如果我们的服务器意外重启，此时要是 Nginx 没有随服务器启动起来，我们的 Web 站点就会是无应答的状态，这会给我们带来不同程度损失。

因此我们需要设置 Nginx 开机自启。

## Ubuntu 设置开机自启

> 以下所有命令，如果你是 root 账户，直接执行即可，不是的话前面加 `sudo` 获取权限。

在 Ubuntu 和 Debian 下，我们通过 update-rc.d 设置 Nginx 的开机启动。

经实验，以下步骤适用于 Ubuntu 16.04、18.04、20.04 版本的系统。

### 创建启动脚本

在 Linux 系统的 `/etc/init.d/` 目录下创建 `nginx` 文件：

```bash
vim /etc/init.d/nginx
```

往该文件内写入以下脚本内容（该脚本内容来自网络）：

```bash
#! /bin/sh
# chkconfig: 2345 55 25
# Description: Startup script for nginx webserver on Debian. Place in /etc/init.d and
# run 'update-rc.d -f nginx defaults', or use the appropriate command on your
# distro. For CentOS/Redhat run: 'chkconfig --add nginx'

### BEGIN INIT INFO
# Provides:          nginx
# Required-Start:    $all
# Required-Stop:     $all
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the nginx web server
# Description:       starts nginx using start-stop-daemon
### END INIT INFO

# Author:   licess
# website:  http://lnmp.org

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
NAME=nginx
NGINX_BIN=/usr/local/nginx/sbin/$NAME
CONFIGFILE=/usr/local/nginx/conf/$NAME.conf
PIDFILE=/usr/local/nginx/logs/$NAME.pid

case "$1" in
    start)
        echo -n "Starting $NAME... "

        if netstat -tnpl | grep -q nginx;then
            echo "$NAME (pid `pidof $NAME`) already running."
            exit 1
        fi

        $NGINX_BIN -c $CONFIGFILE

        if [ "$?" != 0 ] ; then
            echo " failed"
            exit 1
        else
            echo " done"
        fi
        ;;

    stop)
        echo -n "Stoping $NAME... "

        if ! netstat -tnpl | grep -q nginx; then
            echo "$NAME is not running."
            exit 1
        fi

        $NGINX_BIN -s stop

        if [ "$?" != 0 ] ; then
            echo " failed. Use force-quit"
            exit 1
        else
            echo " done"
        fi
        ;;

    status)
        if netstat -tnpl | grep -q nginx; then
            PID=`pidof nginx`
            echo "$NAME (pid $PID) is running..."
        else
            echo "$NAME is stopped"
            exit 0
        fi
        ;;

    force-quit)
        echo -n "Terminating $NAME... "

        if ! netstat -tnpl | grep -q nginx; then
            echo "$NAME is not running."
            exit 1
        fi

        kill `pidof $NAME`

        if [ "$?" != 0 ] ; then
            echo " failed"
            exit 1
        else
            echo " done"
        fi
        ;;

    restart)
        $0 stop
        sleep 1
        $0 start
        ;;

    reload)
        echo -n "Reload service $NAME... "

        if netstat -tnpl | grep -q nginx; then
            $NGINX_BIN -s reload
            echo " done"
        else
            echo "$NAME is not running, can't reload."
            exit 1
        fi
        ;;

    configtest)
        echo -n "Test $NAME configure files... "

        $NGINX_BIN -t
        ;;

    *)
        echo "Usage: $0 {start|stop|force-quit|restart|reload|status|configtest}"
        exit 1
        ;;

esac
```

### 修改部分参数

如果你的 Nginx 是通过编译安装的，则需要根据实际安装时的设置，修改启动脚本中的几个参数（大约在第）：

```bash
# 如果是按照我方式编译安装的，则不用修改，默认参数值就是我的实际安装位置
NGINX_BIN=/usr/local/nginx/sbin/$NAME
CONFIGFILE=/usr/local/nginx/conf/$NAME.conf
PIDFILE=/usr/local/nginx/logs/$NAME.pid
```

### 添加执行权限

上述脚本保存为 `/etc/init.d/nginx`，然后设置文件的执行权限：

```bash
# 给所有用户给予可执行权限
chmod a+x /etc/init.d/nginx
```

至此就可以通过下面指令控制 Nginx 的启动、停止和重新加载了：

```bash
# 启动
/etc/init.d/nginx start

# 停止
/etc/init.d/nginx stop

# 重新加载配置
/etc/init.d/nginx reload
```

### 添加至开机自启动

现在将 Nginx 服务加入开机自启动：

```bash
# 设置开机启动
sudo update-rc.d nginx defaults

# 启动 Nginx
sudo /etc/init.d/nginx start
```

当然了，如果需要关闭开机启动的功能：

```bash
# 取消开机启动
sudo update-rc.d -f nginx remove
```

## CentOS 设置开机自启

> 以下所有命令，如果你是 root 账户，直接执行即可，不是的话前面加 `sudo` 获取权限。

在 CentOS 和 RedHat 下，我们通过 chkconfig 设置 Nginx 的开机启动。

经实验，以下步骤适用于 CentOS 7.x 版本的系统。

### 创建启动脚本

在 Linux 系统的 `/etc/init.d/` 目录下创建 `nginx` 文件：

```bash
vim /etc/init.d/nginx
```

往该文件内写入以下脚本内容（该脚本内容来自[官方网站 - Red Hat NGINX Init Script](https://www.nginx.com/resources/wiki/start/topics/examples/redhatnginxinit/)）：

```bash
#!/bin/sh
#
# nginx - this script starts and stops the nginx daemon
#
# chkconfig:   - 85 15
# description:  NGINX is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /etc/nginx/nginx.conf
# config:      /etc/sysconfig/nginx
# pidfile:     /var/run/nginx.pid

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

nginx="/usr/sbin/nginx"
prog=$(basename $nginx)

NGINX_CONF_FILE="/etc/nginx/nginx.conf"

[ -f /etc/sysconfig/nginx ] && . /etc/sysconfig/nginx

lockfile=/var/lock/subsys/nginx

make_dirs() {
   # make required directories
   user=`$nginx -V 2>&1 | grep "configure arguments:.*--user=" | sed 's/[^*]*--user=\([^ ]*\).*/\1/g' -`
   if [ -n "$user" ]; then
      if [ -z "`grep $user /etc/passwd`" ]; then
         useradd -M -s /bin/nologin $user
      fi
      options=`$nginx -V 2>&1 | grep 'configure arguments:'`
      for opt in $options; do
          if [ `echo $opt | grep '.*-temp-path'` ]; then
              value=`echo $opt | cut -d "=" -f 2`
              if [ ! -d "$value" ]; then
                  # echo "creating" $value
                  mkdir -p $value && chown -R $user $value
              fi
          fi
       done
    fi
}

start() {
    [ -x $nginx ] || exit 5
    [ -f $NGINX_CONF_FILE ] || exit 6
    make_dirs
    echo -n $"Starting $prog: "
    daemon $nginx -c $NGINX_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog -QUIT
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

restart() {
    configtest || return $?
    stop
    sleep 1
    start
}

reload() {
    configtest || return $?
    echo -n $"Reloading $prog: "
    killproc $prog -HUP
    retval=$?
    echo
}

force_reload() {
    restart
}

configtest() {
  $nginx -t -c $NGINX_CONF_FILE
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart|configtest)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2
esac
```

### 修改部分参数

如果你的 Nginx 是通过编译安装的，则需要根据实际安装时的设置，修改启动脚本中的两个参数（大约在第 22 行和第 25 行）：

```bash
# 修改成 Nginx 执行程序的路径，例如我的一般是：/usr/local/nginx/sbin/nginx
nginx="/usr/sbin/nginx"

# 修改成配置文件的路径，例如我的一般是：/usr/local/nginx/conf/nginx.conf
NGINX_CONF_FILE="/etc/nginx/nginx.conf"
```

### 添加执行权限

上述脚本保存为 `/etc/init.d/nginx`，然后设置文件的执行权限：

```bash
# 给所有用户给予可执行权限
chmod a+x /etc/init.d/nginx
```

至此就可以通过下面指令控制 Nginx 的启动、停止和重新加载了：

```bash
# 启动
/etc/init.d/nginx start

# 停止
/etc/init.d/nginx stop

# 重新加载配置
/etc/init.d/nginx reload
```

### 添加至开机自启动

现在将 Nginx 服务加入 chkconfig 管理列表：

```bash
# 添加 Nginx 启动脚本为 chkconfig 管理的一个服务
chkconfig --add /etc/init.d/nginx

# 将 Nginx 加入开机自启
chkconfig /etc/init.d/nginx on
```

当然了，如果需要关闭开机启动的功能：

```bash
# 查看该服务进程状态
chkconfig --list nginx

# 关闭 Nginx 开机自启
chkconfig /etc/init.d/nginx off

# 删除 chkconfig 管理的的 Nginx 启动服务（如果确实不需要了）
chkconfig --del /etc/init.d/nginx
```

## 开机自启脚本提供的快捷命令

通过 Nginx 开机自启脚本本身提供了一些 Nginx 常用操作的快捷命令，一旦我们通过这个脚本实现开机自启后，就可以通过这些快捷命令来操作 Nginx 了：

```bash
# 启动 Nginx
/etc/init.d/nginx start

# 重新加载 Nginx 配置
/etc/init.d/nginx reload

# 停止 Nginx
/etc/init.d/nginx stop
```

这些命令通过看脚本代码就能找到。

（完）
