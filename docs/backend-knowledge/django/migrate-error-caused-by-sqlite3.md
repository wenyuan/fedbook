# 执行 migrate 时报错 SQLite 版本过低

## 问题描述

这个问题目前只会出现在较高版本的 Django 中，且数据库使用默认的 SQLite 的情况，在运行时会报出类似下面的错误提示：

* `django.core.exceptions.ImproperlyConfigured: SQLite 3.9.0 or later is required (found 3.7.17).`
* `django.db.utils.NotSupportedError: deterministic=True requires SQLite 3.8.3 or higher`

这主要是操作系统默认 SQLite 数据库版本太低造成的。经过几个小时的各种资料排查和反复试验，总结出三种解决办法，一种是能根本解决的，另外两种都只能算是 workaround。

不能保证根本解决的方法一定生效，因为每个人的环境不一样，至少在我的环境里是没生效，但后两种 workaround 都需要依赖它。

## 查看 SQLite 版本

系统命令查看 SQLite 版本：

```bash
[root@VM-16-7-centos ~]# sqlite3 -version
```

Python 解释器中查看 SQLite 版本：

```bash
import sqlite3

print(splite3.version)         # 显示 sqlite3 版本信息
print(sqlite3.sqlite_version)  # 显示 SQLite 版本信息
```

需要注意：

* `splite3.version` 返回的是 Python 内置的 `splite3` 这个模块的版本号，它是一个数据库适配器。这个模块最初是一个单独的项目 `pysqlite2`，后来 Python 以 `sqlite3` 的名称合并到了标准库中。
* `sqlite3.sqlite_version` 返回的才是 sqlite3 数据库的版本。

如果发现 `sqlite3.sqlite_version` 的版本是大于等于 3.8.3 的，那么就不用再升级系统里的 SQLite 版本了。

## 解决方案

### 升级系统里的 SQLite 版本

去 [SQLite 官网](https://www.sqlite.org/download.html)找到最新版本的 tar.gz 包下载下来。 如：

```bash
# 下载
wget https://www.sqlite.org/2022/sqlite-autoconf-3390300.tar.gz
```

```bash
# 编译
tar zxvf sqlite-autoconf-3390300.tar.gz

cd sqlite-autoconf-3390300

./configure --prefix=/usr/local

make && make install
```

```bash
# 替换系统低版本 sqlite3
mv /usr/bin/sqlite3  /usr/bin/sqlite3_old

ln -s /usr/local/bin/sqlite3   /usr/bin/sqlite3

echo "/usr/local/lib" > /etc/ld.so.conf.d/sqlite3.conf

ldconfig

sqlite3 -version
```

升级成功之后，看能否正常运行。如果使用的是 Python 虚拟环境，那么可能需要重新创建一下虚拟环境。

如果升级完系统里的 SQLite 版本，依旧报同样的错，那么只能采取 workaround 了。

### 第一种：修改源码里检测的版本

找到报错文件，例如我的项目是跑在 Python 虚拟环境`venv`中的，那么报错文件就位于：

* `{project_path}/venv/lib/python3.8/site-packages/django/db/backends/sqlite3/base.py`

打开它，找到：

```python
def check_sqlite_version():
    if Database.sqlite_version_info < (3, 9, 0):
```

把里面小括号里的 SQLite 版本（3，9，0）修改成你当前系统里版本就好。

同样是 workaround，这种显然很不优雅，所以不是很推荐。

### 第二种：使用第三方包运行 SQLite

即把 `sqlite3` 更换为 `pysqlite3` 和 `pysqlite3-binary` 方法：

```bash
# 安装 pysqlite3 和 pysqlite3-binary
pip install pysqlite3
pip install pysqlite3-binary
```

打开文件 `{project_path}/venv/lib/python3.8/site-packages/django/db/backends/sqlite3/base.py`（这里是因为我的项目位于 Python 虚拟环境中，具体路径视自己实际情况修改），找到 `from sqlite3 import dbapi2 as Database` 注释它，添加代码：

```python
# from sqlite3 import dbapi2 as Database  # 注释它
from pysqlite3 import dbapi2 as Database  # 新加这行代码
```

现在再运行项目，应该就不报错了。

## 总结

总的来说，如果升级完系统里的 SQLite 版本就能运行成功了，这是最顺利的情况。否则就只有 workaround，至少我调研了几个小时，涉及很多国内外文章，都没找到更好的、能解决根本问题的方案。

呐，先跑起来再说，也不浪费时间在这个报错问题上继续研究了，虽然 workaround 的解决方式可能会有隐性问题，但 Django 工程在生产环境下本就不太可能用 SQLite 数据库，仅仅是开发测试的时候图个方便而已。

就这样吧~

（完）
