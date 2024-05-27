# 使用 logging 配置日志的方式

正是开发中不可避免的要进行日志记录，Python 内置模 块logging 提供了强大的日志记录能力，不过在使用前的配置阶段会比较复杂，本文整理 logging 的常见使用方法和一些基本概念。

## 三种配置方式简介

目前社区主流的有以下 3 种方式来配置 logging：

* 使用 Python 代码显式的创建 loggers，handlers 和 formatters 并分别调用它们的配置函数。
* 创建一个日志配置文件，然后使用 `fileConfig()` 函数来读取该文件的内容。
* 创建一个包含配置信息的 dict，然后把它传递个 `dictConfig()` 函数。

需要说明的是，网上很多文章提到的 `logging.basicConfig(**kwargs)` 也属于第一种方式，它只是对 loggers，handlers 和 formatters 的配置函数进行了封装。另外，第二种配置方式相对于第一种配置方式的优点在于，它将配置信息和代码进行了分离，这一方面降低了日志的维护成本，同时还使得非开发人员也能够去很容易地修改日志配置。

## 四大核心组件功能

上面也提到了，使用 logging 模块记录日志，需要接触的四大核心组件，这里简单介绍下：

<svg id="SvgjsSvg1006" width="829" height="239" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25.012481689453125,25)"><path id="SvgjsPath1009" d="M0 0L113.1108 0L113.1108 37.800000000000004 L0 37.800000000000004Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1010" d="M113.1108 0L244.2165 0L244.2165 37.800000000000004 L113.1108 37.800000000000004Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1011" d="M244.2165 0L779 0L779 37.800000000000004 L244.2165 37.800000000000004Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1012" d="M0 37.800000000000004L113.1108 37.800000000000004L113.1108 75.60000000000001 L0 75.60000000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1013" d="M113.1108 37.800000000000004L244.2165 37.800000000000004L244.2165 75.60000000000001 L113.1108 75.60000000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1014" d="M244.2165 37.800000000000004L779 37.800000000000004L779 75.60000000000001 L244.2165 75.60000000000001Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1015" d="M0 75.60000000000001L113.1108 75.60000000000001L113.1108 113.4 L0 113.4Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1016" d="M113.1108 75.60000000000001L244.2165 75.60000000000001L244.2165 113.4 L113.1108 113.4Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1017" d="M244.2165 75.60000000000001L779 75.60000000000001L779 113.4 L244.2165 113.4Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1018" d="M0 113.39999999999999L113.1108 113.39999999999999L113.1108 151.2 L0 151.2Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1019" d="M113.1108 113.39999999999999L244.2165 113.39999999999999L244.2165 151.2 L113.1108 151.2Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1020" d="M244.2165 113.39999999999999L779 113.39999999999999L779 151.2 L244.2165 151.2Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1021" d="M0 151.20000000000002L113.1108 151.20000000000002L113.1108 189 L0 189Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1022" d="M113.1108 151.20000000000002L244.2165 151.20000000000002L244.2165 189 L113.1108 189Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1023" d="M244.2165 151.20000000000002L779 151.20000000000002L779 189 L244.2165 189Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1024"><text id="SvgjsText1025" font-family="微软雅黑" text-anchor="start" font-size="16px" width="114px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="4.900000000000002" transform="rotate(0)"><tspan id="SvgjsTspan1026" dy="20" x="0"><tspan id="SvgjsTspan1027" style="text-decoration:;">  组件名称</tspan></tspan></text></g><g id="SvgjsG1028"><text id="SvgjsText1029" font-family="微软雅黑" text-anchor="start" font-size="16px" width="132px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="4.900000000000002" transform="rotate(0)"><tspan id="SvgjsTspan1030" dy="20" x="113.1108"><tspan id="SvgjsTspan1031" style="text-decoration:;">  对应类名</tspan></tspan></text></g><g id="SvgjsG1032"><text id="SvgjsText1033" font-family="微软雅黑" text-anchor="start" font-size="16px" width="535px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="4.900000000000002" transform="rotate(0)"><tspan id="SvgjsTspan1034" dy="20" x="244.2165"><tspan id="SvgjsTspan1035" style="text-decoration:;">  功能描述</tspan></tspan></text></g><g id="SvgjsG1036"><text id="SvgjsText1037" font-family="微软雅黑" text-anchor="start" font-size="16px" width="114px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="42.7" transform="rotate(0)"><tspan id="SvgjsTspan1038" dy="20" x="0"><tspan id="SvgjsTspan1039" style="text-decoration:;">  日志器</tspan></tspan></text></g><g id="SvgjsG1040"><text id="SvgjsText1041" font-family="微软雅黑" text-anchor="start" font-size="16px" width="132px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="42.7" transform="rotate(0)"><tspan id="SvgjsTspan1042" dy="20" x="113.1108"><tspan id="SvgjsTspan1043" style="text-decoration:;">  Logger</tspan></tspan></text></g><g id="SvgjsG1044"><text id="SvgjsText1045" font-family="微软雅黑" text-anchor="start" font-size="16px" width="535px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="42.7" transform="rotate(0)"><tspan id="SvgjsTspan1046" dy="20" x="244.2165"><tspan id="SvgjsTspan1047" style="text-decoration:;">  提供日志接口，供应用代码使用</tspan></tspan></text></g><g id="SvgjsG1048"><text id="SvgjsText1049" font-family="微软雅黑" text-anchor="start" font-size="16px" width="114px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="80.50000000000001" transform="rotate(0)"><tspan id="SvgjsTspan1050" dy="20" x="0"><tspan id="SvgjsTspan1051" style="text-decoration:;">  处理器</tspan></tspan></text></g><g id="SvgjsG1052"><text id="SvgjsText1053" font-family="微软雅黑" text-anchor="start" font-size="16px" width="132px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="80.50000000000001" transform="rotate(0)"><tspan id="SvgjsTspan1054" dy="20" x="113.1108"><tspan id="SvgjsTspan1055" style="text-decoration:;">  Handler</tspan></tspan></text></g><g id="SvgjsG1056"><text id="SvgjsText1057" font-family="微软雅黑" text-anchor="start" font-size="16px" width="535px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="80.50000000000001" transform="rotate(0)"><tspan id="SvgjsTspan1058" dy="20" x="244.2165"><tspan id="SvgjsTspan1059" style="text-decoration:;">  将 logger 创建的日志记录发送到合适的目的输出，比如文件，socket 等</tspan></tspan></text></g><g id="SvgjsG1060"><text id="SvgjsText1061" font-family="微软雅黑" text-anchor="start" font-size="16px" width="114px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="118.3" transform="rotate(0)"><tspan id="SvgjsTspan1062" dy="20" x="0"><tspan id="SvgjsTspan1063" style="text-decoration:;">  过滤器</tspan></tspan></text></g><g id="SvgjsG1064"><text id="SvgjsText1065" font-family="微软雅黑" text-anchor="start" font-size="16px" width="132px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="118.3" transform="rotate(0)"><tspan id="SvgjsTspan1066" dy="20" x="113.1108"><tspan id="SvgjsTspan1067" style="text-decoration:;">  Filter</tspan></tspan></text></g><g id="SvgjsG1068"><text id="SvgjsText1069" font-family="微软雅黑" text-anchor="start" font-size="16px" width="535px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="118.3" transform="rotate(0)"><tspan id="SvgjsTspan1070" dy="20" x="244.2165"><tspan id="SvgjsTspan1071" style="text-decoration:;">  提供了更细粒度的控制工具来决定输出哪条日志记录，丢弃哪条日志记录</tspan></tspan></text></g><g id="SvgjsG1072"><text id="SvgjsText1073" font-family="微软雅黑" text-anchor="start" font-size="16px" width="114px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="156.10000000000002" transform="rotate(0)"><tspan id="SvgjsTspan1074" dy="20" x="0"><tspan id="SvgjsTspan1075" style="text-decoration:;">  格式器</tspan></tspan></text></g><g id="SvgjsG1076"><text id="SvgjsText1077" font-family="微软雅黑" text-anchor="start" font-size="16px" width="132px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="156.10000000000002" transform="rotate(0)"><tspan id="SvgjsTspan1078" dy="20" x="113.1108"><tspan id="SvgjsTspan1079" style="text-decoration:;">  Formatter</tspan></tspan></text></g><g id="SvgjsG1080"><text id="SvgjsText1081" font-family="微软雅黑" text-anchor="start" font-size="16px" width="535px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="156.10000000000002" transform="rotate(0)"><tspan id="SvgjsTspan1082" dy="20" x="244.2165"><tspan id="SvgjsTspan1083" style="text-decoration:;">  决定日志记录的最终输出格式</tspan></tspan></text></g></g></svg>

logging 模块就是通过这些组件来完成日志处理的，简单来说就是：**日志器（logger）是入口，真正干活儿的是处理器（handler），处理器（handler）还可以通过过滤器（filter）和格式器（formatter）对要输出的日志内容做过滤和格式化等处理操作**。

所以一般的日志记录会经历一下一些步骤：

1. 创建 logger
2. 创建 handler
3. 定义 formatter 和 filter
4. 给 handler 添加 formatter 和 filter。这个 filter 用于筛选哪些东西可以写入日志，哪些东西不需要写入日志。
5. 给 logger 添加 handler 和 filter。这个 filter 用于筛选哪些东西需要发送给 handler，哪些不需要发送给它。

## 第一种：直接通过代码来配置

### 简单示例

直接通过 Python 代码来配置，简称五步走策略。

代码如下：

```python
import logging
import sys

# 第一步：创建一个 logger 并进行设置
logger = logging.getLogger('simple_logger')
logger.setLevel(logging.DEBUG)

# 第二步：创建一个 handler 并进行设置
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)

# 第三步：创建一个 formatter
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

# 第四步：将 formatter 添加到 handler
handler.setFormatter(formatter)

# 第五步：将 handler 添加到 logger
logger.addHandler(handler)

# 测试：通过 logger 对象来记录日志信息
logger.debug('debug message')
logger.info('info message')
logger.warning('warning message')
logger.error('error message')
logger.critical('critical message')
```

输出结果：

```
2022-10-15 15:36:15,233 - simple_logger - DEBUG - debug message
2022-10-15 15:36:15,233 - simple_logger - INFO - info message
2022-10-15 15:36:15,233 - simple_logger - WARNING - warning message
2022-10-15 15:36:15,233 - simple_logger - ERROR - error message
2022-10-15 15:36:15,233 - simple_logger - CRITICAL - critical message
```

## 第二种：使用配置文件来配置

### 简单示例

现在通过配置文件的方式来实现与上面同样的功能，需要用到 `fileConfig()` 函数。

代码如下：

```python
import logging
import logging.config

# 读取日志配置文件内容
logging.config.fileConfig('logging.conf')

# 创建一个 logger
logger = logging.getLogger('simpleExample')

# 测试：通过 logger 对象来记录日志信息
logger.debug('debug message')
logger.info('info message')
logger.warning('warning message')
logger.error('error message')
logger.critical('critical message')
```

配置文件 `logging.conf` 内容如下：

```python
[loggers]
keys=root,simpleExample

[handlers]
keys=fileHandler,consoleHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=DEBUG
handlers=fileHandler

[logger_simpleExample]
level=DEBUG
handlers=consoleHandler
qualname=simpleExample
propagate=0

[handler_consoleHandler]
class=StreamHandler
args=(sys.stdout,)
level=DEBUG
formatter=simpleFormatter

[handler_fileHandler]
class=FileHandler
args=('logging.log', 'a')
level=ERROR
formatter=simpleFormatter

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
datefmt=
```

输出结果：

```
2022-10-15 15:54:54,503 - simpleExample - DEBUG - debug message
2022-10-15 15:54:54,504 - simpleExample - INFO - info message
2022-10-15 15:54:54,504 - simpleExample - WARNING - warning message
2022-10-15 15:54:54,504 - simpleExample - ERROR - error message
2022-10-15 15:54:54,504 - simpleExample - CRITICAL - critical message
```

可以看到配置文件方法比 Python 代码方法有一些优势，主要是配置和代码的分离。

### 配置文件说明

配置文件格式说明：

* **配置文件中一定要包含 `[loggers]`、`[handlers]`、`[formatters]`**，它们的值是下面即将单独定义的日志器、处理器和格式器。另外 loggers 一定要包含 `root` 这个值。
* 日志器、处理器和格式器在单独定义时，要遵循的命名规范为：
  * `[logger_loggerName]`、`[formatter_formatterName]`、`[handler_handlerName]`。
* **定义日志器**必须指定 `level` 和 `handlers` 这两个参数：
  * `level` 的可取值为 `DEBUG`、`INFO`、`WARNING`、`ERROR`、`CRITICAL`。
  * `handlers` 的值是以逗号分隔的处理器名字列表，这里出现的处理器必须出现在 `[handlers]` 中，并且相应的处理器必须在配置文件中有对应的定义。
* 对于非 root 的日志器来说，除了 `level` 和 `handlers` 这两个参数，还需要一些额外的参数，其中：
  * `qualname` 是必须的，它表示日志器的名字，在应用代码中通过这个名字得到 logger。
  * `propagate` 是可选项，其默认是为 `1`，表示消息将会传递给高层级日志器的处理器，通常我们需要指定其值为 `0`，理由待会说。
* **定义处理器**必须指定 `class` 和 `args` 这两个参数，`level` 和 `formatter` 为可选参数。
  * `class` 表示用于创建处理器的类名。
  * `args` 表示传递给 `class` 中指定的处理器的参数，它必须是一个元组的形式，即便只有一个参数值也需要是一个元组的形式。
  * `level` 与 logger 中的 level 一样。
  * `formatter` 指定的是该处理器所使用的格式器，这里指定的格式器名称必须出现在 `[formatters]` 中，且在配置文件中必须要有这个格式器的定义；如果不指定格式器则该处理器将会以消息本身作为日志消息进行记录，而不添加额外的时间、日志器名称等信息。
* **定义格式器**时参数都是可选的，其中包括：
  * `format` 用于指定格式字符串，默认为消息字符串本身。
  * `datefmt` 用于指定 asctime（日志创建时的普通时间）的时间格式，默认为 `'%Y-%m-%d %H:%M:%S'`。
  * `class` 用于指定格式器类名，默认为 `logging.Formatter`。

::: tip 为什么 logger 的 propagate 建议设置为 0？
日志器（logger）是有层级关系的，root 处于日志器层级关系最顶层，其它 logger 的名称可以是一个以 `.` 分割的层级结构，例如名称为 `a` 的 logger 是名称为 `a.b`、`a.b.c` 这些 logger 的前辈。

子 logger 在完成对日志消息的处理后，默认会将日志消息传递给它们的父 logger 的 handlers。这种机制会带来一些好处，比如我们不必为一个项目中的所有 loggers 定义 handlers，只需要为一个顶层的 logger 配置 handlers，然后按照需要创建子 loggers 就可以了。

但是，这样会导致日志记录在多个地方都有输出，增大了开发和运维人员阅读日志文件时的成本。所以我习惯关闭这种传递机制：

* `propagate=1`：默认，表示日志消息将会被传递给父 logger 的 handlers 进行处理。
* `propagate=0`：自己处理日志消息，不向父 logger 的 handlers 传递该消息，到此结束。

另外，当一个日志器没有被设置任何处理器时，系统会去查找该日志器的上层日志器上所设置的日志处理器来处理日志记录，如果找不到，那么最上级当然就是 root 了。
:::

## 第三种：使用字典来配置

### 简单示例

在 Python 3.2 中，引入了一种新的配置日志记录的方法：使用字典来保存配置信息。

这种方法是基于配置文件方法的超集，并且是新项目开发时的推荐配置方法。因为它的功能更加强大，也更加灵活，因为我们可把很多的数据转换成字典。比如，我们可以使用 JSON 格式的配置文件、YAML 格式的配置文件，然后将它们填充到一个配置字典中；或者，我们也可以用 Python 代码构建这个配置字典，或者通过 socket 接收 pickled 序列化后的配置信息。总之，可以使用编程语言支持的任何方法来构建这个配置字典。

下面的例子显示使用 YAML 格式来完成与上面同样的日志配置。

首先需要安装 PyYAML 模块：

```bash
pip install PyYAML
```

代码如下：

```python
import logging
import logging.config
import yaml

with open('logging_cfg.yml', 'r') as f:
    log_conf = yaml.safe_load(f)
logging.config.dictConfig(log_conf)

logger = logging.getLogger('simpleExample')
logger.debug('debug message')
logger.info('info message')
logger.warning('warning message')
logger.error('error message')
logger.critical('critical message')
```

`logging_cfg.yml` 配置文件的内容：

```yaml
version: 1
formatters:
  simple:
    format: '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
handlers:
  console:
    class: logging.StreamHandler
    level: DEBUG
    formatter: simple
    stream: ext://sys.stdout
  console_err:
    class: logging.StreamHandler
    level: ERROR
    formatter: simple
    stream: ext://sys.stderr
loggers:
  simpleExample:
    level: DEBUG
    handlers: [console]
    propagate: yes
root:
  level: DEBUG
  handlers: [console_err]
```

输出结果：

```
2022-10-15 18:34:55,554 - simpleExample - DEBUG - debug message
2022-10-15 18:34:55,554 - simpleExample - INFO - info message
2022-10-15 18:34:55,554 - simpleExample - WARNING - warning message
2022-10-15 18:34:55,554 - simpleExample - ERROR - error message
2022-10-15 18:34:55,554 - simpleExample - CRITICAL - critical message
2022-10-15 18:34:55,554 - simpleExample - ERROR - error message
2022-10-15 18:34:55,554 - simpleExample - CRITICAL - critical message
```

### 配置字典说明

无论是上面提到的配置文件，还是这里的配置字典，它们都要描述出日志配置所需要创建的各种对象以及这些对象之间的关联关系。比如，可以先创建一个名为 `simple` 的格式器 formatter；然后创建一个名为 `console` 的处理器 handler，并指定该 handler 输出日志所使用的格式器为 `simple`；然后再创建一个日志器 logger，并指定它所使用的处理器为 `console`。

传递给 `dictConfig()` 函数的字典对象只能包含下面这些 keys，其中 `version` 是必须指定的 key，其它 key 都是可选项：

<svg id="SvgjsSvg1007" width="880" height="653" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"></defs><g id="SvgjsG1008" transform="translate(25.012481689453125,24.999998092651367)"><path id="SvgjsPath1009" d="M0 0L208.662 0L208.662 37.50017474 L0 37.50017474Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1010" d="M208.662 0L830 0L830 37.50017474 L208.662 37.50017474Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#f5f7fb"></path><path id="SvgjsPath1011" d="M0 37.50017474L208.662 37.50017474L208.662 75.00034948 L0 75.00034948Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1012" d="M208.662 37.50017474L830 37.50017474L830 75.00034948 L208.662 75.00034948Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1013" d="M0 75.00034948L208.662 75.00034948L208.662 132.33582565 L0 132.33582565Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1014" d="M208.662 75.00034948L830 75.00034948L830 132.33582565 L208.662 132.33582565Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1015" d="M0 132.33582565L208.662 132.33582565L208.662 187.68174271 L0 187.68174271Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1016" d="M208.662 132.33582565L830 132.33582565L830 187.68174271 L208.662 187.68174271Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1017" d="M0 187.68174271L208.662 187.68174271L208.662 314.22976004000003 L0 314.22976004000003Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1018" d="M208.662 187.68174271L830 187.68174271L830 314.22976004000003 L208.662 314.22976004000003Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1019" d="M0 314.22976004000003L208.662 314.22976004000003L208.662 379.70434166000007 L0 379.70434166000007Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1020" d="M208.662 314.22976004000003L830 314.22976004000003L830 379.70434166000007 L208.662 379.70434166000007Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1021" d="M0 379.70434166L208.662 379.70434166L208.662 464.10987966000005 L0 464.10987966000005Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1022" d="M208.662 379.70434166L830 379.70434166L830 464.10987966000005 L208.662 464.10987966000005Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1023" d="M0 464.17016933L208.662 464.17016933L208.662 546.64643789 L0 546.64643789Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1024" d="M208.662 464.17016933L830 464.17016933L830 546.64643789 L208.662 546.64643789Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1025" d="M0 546.58614822L208.662 546.58614822L208.662 602.8967 L0 602.8967Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><path id="SvgjsPath1026" d="M208.662 546.58614822L830 546.58614822L830 602.8967 L208.662 602.8967Z" stroke="rgba(201,208,227,1)" stroke-width="1" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1027"><text id="SvgjsText1028" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="0.7500873699999993" transform="rotate(0)"><tspan id="SvgjsTspan1029" dy="24" x="0"><tspan id="SvgjsTspan1030" style="text-decoration:;">                key 名称</tspan></tspan></text></g><g id="SvgjsG1031"><text id="SvgjsText1032" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="0.7500873699999993" transform="rotate(0)"><tspan id="SvgjsTspan1033" dy="24" x="208.662"><tspan id="SvgjsTspan1034" style="text-decoration:;">                                                             描述</tspan></tspan></text></g><g id="SvgjsG1035"><text id="SvgjsText1036" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="38.250262109999994" transform="rotate(0)"><tspan id="SvgjsTspan1037" dy="24" x="0"><tspan id="SvgjsTspan1038" style="text-decoration:;">  version</tspan></tspan></text></g><g id="SvgjsG1039"><text id="SvgjsText1040" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="38.250262109999994" transform="rotate(0)"><tspan id="SvgjsTspan1041" dy="24" x="208.662"><tspan id="SvgjsTspan1042" style="text-decoration:;">  必选项，其值是一个整数值，表示配置格式的版本，当前唯一可用的值是 1</tspan></tspan></text></g><g id="SvgjsG1043"><text id="SvgjsText1044" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="85.66808756500001" transform="rotate(0)"><tspan id="SvgjsTspan1045" dy="24" x="0"><tspan id="SvgjsTspan1046" style="text-decoration:;">  formatters</tspan></tspan></text></g><g id="SvgjsG1047"><text id="SvgjsText1048" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="73.66808756500001" transform="rotate(0)"><tspan id="SvgjsTspan1049" dy="24" x="208.662"><tspan id="SvgjsTspan1050" style="text-decoration:;">  可选项，其值是一个字典对象，该字典对象每个元素的 key 为要定义的</tspan><tspan id="SvgjsTspan1051" style="text-decoration:;font-size: inherit;">格式器名称，</tspan></tspan><tspan id="SvgjsTspan1052" dy="24" x="208.662"><tspan id="SvgjsTspan1053" style="text-decoration:;font-size: inherit;">  value 为格式器的配置信息组成的 dict，如 format 和 datefmt</tspan></tspan></text></g><g id="SvgjsG1054"><text id="SvgjsText1055" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="142.00878418000002" transform="rotate(0)"><tspan id="SvgjsTspan1056" dy="24" x="0"><tspan id="SvgjsTspan1057" style="text-decoration:;">  filters</tspan></tspan></text></g><g id="SvgjsG1058"><text id="SvgjsText1059" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="130.00878418000002" transform="rotate(0)"><tspan id="SvgjsTspan1060" dy="24" x="208.662"><tspan id="SvgjsTspan1061" style="text-decoration:;">  可选项，其值是一个字典对象，该字典对象每个元素的 key 为要定义的过</tspan><tspan id="SvgjsTspan1062" style="text-decoration:;font-size: inherit;">滤器名称，</tspan></tspan><tspan id="SvgjsTspan1063" dy="24" x="208.662"><tspan id="SvgjsTspan1064" style="text-decoration:;font-size: inherit;">  value 为过滤器的配置信息组成的 dict，如 name</tspan></tspan></text></g><g id="SvgjsG1065"><text id="SvgjsText1066" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="232.955751375" transform="rotate(0)"><tspan id="SvgjsTspan1067" dy="24" x="0"><tspan id="SvgjsTspan1068" style="text-decoration:;">  handlers</tspan></tspan></text></g><g id="SvgjsG1069"><text id="SvgjsText1070" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="184.955751375" transform="rotate(0)"><tspan id="SvgjsTspan1071" dy="24" x="208.662"><tspan id="SvgjsTspan1072" style="text-decoration:;">  可选项，其值是一个字典对象，该字典对象每个元素的 key 为要定义的处理器名称，</tspan></tspan><tspan id="SvgjsTspan1073" dy="24" x="208.662"><tspan id="SvgjsTspan1074" style="text-decoration:;font-size: inherit;">  value 为处理器的配置信息组成的 dict，如 class、level、formatter 和 filters，其中</tspan></tspan><tspan id="SvgjsTspan1075" dy="24" x="208.662"><tspan id="SvgjsTspan1076" style="text-decoration:;font-size: inherit;">  class 为必选项，其他为可选项；其他配置信息将会传递给 class 所指定的处理器类的</tspan></tspan><tspan id="SvgjsTspan1077" dy="24" x="208.662"><tspan id="SvgjsTspan1078" style="text-decoration:;font-size: inherit;">  构造函数，如上面的 handlers 定义示例中的 stream、filename、maxBytes 和</tspan></tspan><tspan id="SvgjsTspan1079" dy="24" x="208.662"><tspan id="SvgjsTspan1080" style="text-decoration:;font-size: inherit;">  backupCount 等</tspan></tspan></text></g><g id="SvgjsG1081"><text id="SvgjsText1082" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="328.96705085" transform="rotate(0)"><tspan id="SvgjsTspan1083" dy="24" x="0"><tspan id="SvgjsTspan1084" style="text-decoration:;">  loggers</tspan></tspan></text></g><g id="SvgjsG1085"><text id="SvgjsText1086" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="316.96705085" transform="rotate(0)"><tspan id="SvgjsTspan1087" dy="24" x="208.662"><tspan id="SvgjsTspan1088" style="text-decoration:;">  可选项，其值是一个字典对象，该字典对象每个元素的 key 为要定义的日志器名称，</tspan></tspan><tspan id="SvgjsTspan1089" dy="24" x="208.662"><tspan id="SvgjsTspan1090" style="text-decoration:;">  value 为日志器的配置信息组成的 dict，如 level、handlers、filters 和 propagate</tspan></tspan></text></g><g id="SvgjsG1091"><text id="SvgjsText1092" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="403.90711066" transform="rotate(0)"><tspan id="SvgjsTspan1093" dy="24" x="0"><tspan id="SvgjsTspan1094" style="text-decoration:;">  root</tspan></tspan></text></g><g id="SvgjsG1095"><text id="SvgjsText1096" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="379.90711066" transform="rotate(0)"><tspan id="SvgjsTspan1097" dy="24" x="208.662"><tspan id="SvgjsTspan1098" style="text-decoration:;">  可选项，这是 root loggger 的配置信息，其值也是一个字典对象。除非在定义其他 </tspan></tspan><tspan id="SvgjsTspan1099" dy="24" x="208.662"><tspan id="SvgjsTspan1100" style="text-decoration:;">  logger 时明确指定 propagate 值为 no，否则 root logger 定义的 handlers 都会被</tspan></tspan><tspan id="SvgjsTspan1101" dy="24" x="208.662"><tspan id="SvgjsTspan1102" style="text-decoration:;">  作用到其他 logger 上</tspan></tspan></text></g><g id="SvgjsG1103"><text id="SvgjsText1104" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="487.40830361" transform="rotate(0)"><tspan id="SvgjsTspan1105" dy="24" x="0"><tspan id="SvgjsTspan1106" style="text-decoration:;">  incremental</tspan></tspan></text></g><g id="SvgjsG1107"><text id="SvgjsText1108" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="463.40830361" transform="rotate(0)"><tspan id="SvgjsTspan1109" dy="24" x="208.662"><tspan id="SvgjsTspan1110" style="text-decoration:;">  可选项，默认值为 False。该选项的意义在于，如果这里定义的对象已经存在，那么</tspan></tspan><tspan id="SvgjsTspan1111" dy="24" x="208.662"><tspan id="SvgjsTspan1112" style="text-decoration:;">  这里对这些对象的定义是否应用到已存在的对象上。值为 False 表示，已存在的对象</tspan></tspan><tspan id="SvgjsTspan1113" dy="24" x="208.662"><tspan id="SvgjsTspan1114" style="text-decoration:;">  将会被重新定义</tspan></tspan></text></g><g id="SvgjsG1115"><text id="SvgjsText1116" font-family="微软雅黑" text-anchor="start" font-size="16px" width="209px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="556.74142411" transform="rotate(0)"><tspan id="SvgjsTspan1117" dy="24" x="0"><tspan id="SvgjsTspan1118" style="text-decoration:;">  disable_existing_loggers</tspan></tspan></text></g><g id="SvgjsG1119"><text id="SvgjsText1120" font-family="微软雅黑" text-anchor="start" font-size="16px" width="622px" fill="#323232" font-weight="400" align="middle" lineHeight="150%" anchor="start" family="微软雅黑" size="16px" weight="400" font-style="" opacity="1" y="544.74142411" transform="rotate(0)"><tspan id="SvgjsTspan1121" dy="24" x="208.662"><tspan id="SvgjsTspan1122" style="text-decoration:;">  可选项，默认值为 True。该选项用于指定是否禁用已存在的日志器 loggers，如果</tspan></tspan><tspan id="SvgjsTspan1123" dy="24" x="208.662"><tspan id="SvgjsTspan1124" style="text-decoration:;">  incremental 的值为 True 则该选项将会被忽略</tspan></tspan></text></g></g></svg>

## 实际开发配置模板

### 需求分析

在实际开发中，我们对日志记录往往有这样的需求：

* 对于 handler：
  * 有标准输出，即前台调试代码时，输出到 console 显示，省的打开日志文件去看了。
  * 有日志持久化，一般都是输出到 log 文件，很少会存到数据库，且一般需要按文件大小或日期进行回滚，防止单个日志文件过大。
  * 要对日志进行分级，最起码要有：DEBUG，INFO，ERROR，分的细的话再增加 WARNING，CRITICAL。
* 对于 loggers：
  * 视业务模块划分情况，可以创建多个 logger，每个 logger 可以有多个 handlers。
* 对于 formatters：
  * 要输出时间、logger 的名称、日志等级、日志信息
  * 必要时候如果记录调用日志消息的文件名和行号，能帮助我们更高效地定位问题

下面参考[官方文档](https://docs.python.org/zh-cn/3/howto/logging.html)，我使用上面介绍的第三种配置方式整理了一个通用的配置模板，考虑到传递给 `dictConfig()` 函数的字典对象在转换前，可以是 YAML、JSON、字典三种格式，因此也做了三份模板。

### 用 YAML 配置

配置文件（`logging_cfg.yml`）：

```yaml
version: 1
disable_existing_loggers: False
formatters:
  simple_formatter:
    format: "%(levelname)s %(asctime)s: %(message)s"
  standard_formatter:
    format: "%(levelname)s %(asctime)s %(filename)s %(funcName)s[line %(lineno)d]: %(message)s"

handlers:
  console_handler:
    class: logging.StreamHandler
    level: DEBUG
    formatter: standard_formatter
    stream: ext://sys.stdout
  info_file_handler:
    class: logging.handlers.RotatingFileHandler
    level: INFO
    formatter: standard_formatter
    filename: logs/info.log
    maxBytes: 10485760  # 10MB
    backupCount: 20
    encoding: utf-8
  error_file_handler:
    class: logging.handlers.RotatingFileHandler
    level: ERROR
    formatter: standard_formatter
    filename: logs/errors.log
    maxBytes: 10485760  # 10MB
    backupCount: 20
    encoding: utf-8
  warning_file_handler:
    class: logging.handlers.RotatingFileHandler
    level: WARNING
    formatter: standard_formatter
    filename: logs/warning.log
    maxBytes: 5242880  # 5MB
    backupCount: 10
    encoding: utf-8
  critical_file_handler:
    class: logging.handlers.RotatingFileHandler
    level: CRITICAL
    formatter: standard_formatter
    filename: logs/critical.log
    maxBytes: 5242880  # 5MB
    backupCount: 10
    encoding: utf-8

loggers:
  my_logger:
    level: INFO
    handlers: [info_file_handler, warning_file_handler, error_file_handler, critical_file_handler]
    propagate: false

root:
  level: DEBUG
  handlers: [console_handler, info_file_handler]
```

使用方式：

```python
import logging
import logging.config
import os
import yaml


def setup_logging(log_dir='logs', cfg_path='logging_cfg.yml'):
    """ setup logging configuration """
    if not os.path.exists(log_dir):
        os.mkdir(log_dir)

    with open(cfg_path, 'r') as f:
        log_conf = yaml.safe_load(f)
    logging.config.dictConfig(log_conf)


if __name__ == '__main__':
    setup_logging()
    logger = logging.getLogger('my_logger')
    logger.debug('debug message')
    logger.info('info message')
    logger.warning('warning message')
    logger.error('error message')
    logger.critical('critical message')
```

### 用 JSON 配置

配置文件（`logging_cfg.json`）：

```json
{
  "version": 1,
  "disable_existing_loggers": false,
  "formatters": {
    "simple_formatter": {
      "format": "%(levelname)s %(asctime)s: %(message)s"
    },
    "standard_formatter": {
      "format": "%(levelname)s %(asctime)s %(filename)s %(funcName)s[line %(lineno)d]: %(message)s"
    }
  },
  "handlers": {
    "console_handler": {
      "class": "logging.StreamHandler",
      "level": "DEBUG",
      "formatter": "standard_formatter",
      "stream": "ext://sys.stdout"
    },
    "info_file_handler": {
      "class": "logging.handlers.RotatingFileHandler",
      "level": "INFO",
      "formatter": "standard_formatter",
      "filename": "logs/info.log",
      "maxBytes": 10485760,
      "backupCount": 20,
      "encoding": "utf-8"
    },
    "error_file_handler": {
      "class": "logging.handlers.RotatingFileHandler",
      "level": "ERROR",
      "formatter": "standard_formatter",
      "filename": "logs/errors.log",
      "maxBytes": 10485760,
      "backupCount": 20,
      "encoding": "utf-8"
    },
    "warning_file_handler": {
      "class": "logging.handlers.RotatingFileHandler",
      "level": "WARNING",
      "formatter": "standard_formatter",
      "filename": "logs/warning.log",
      "maxBytes": 5242880,
      "backupCount": 10,
      "encoding": "utf-8"
    },
    "critical_file_handler": {
      "class": "logging.handlers.RotatingFileHandler",
      "level": "CRITICAL",
      "formatter": "standard_formatter",
      "filename": "logs/critical.log",
      "maxBytes": 5242880,
      "backupCount": 10,
      "encoding": "utf-8"
    }
  },
  "loggers": {
    "my_logger": {
      "level": "INFO",
      "handlers": [
        "info_file_handler",
        "warning_file_handler",
        "error_file_handler",
        "critical_file_handler"
      ],
      "propagate": false
    }
  },
  "root": {
    "level": "DEBUG",
    "handlers": [
      "console_handler",
      "info_file_handler"
    ]
  }
}
```

使用方式：

```python
import json
import logging
import logging.config
import os


def setup_logging(log_dir='logs', cfg_path='logging_cfg.json'):
    """ setup logging configuration """
    if not os.path.exists(log_dir):
        os.mkdir(log_dir)

    with open(cfg_path, 'r') as f:
        log_conf = json.load(f)
    logging.config.dictConfig(log_conf)


if __name__ == '__main__':
    setup_logging()
    logger = logging.getLogger('my_logger')
    logger.debug('debug message')
    logger.info('info message')
    logger.warning('warning message')
    logger.error('error message')
    logger.critical('critical message')
```

### 用 Dict 配置

配置文件（`logging_cfg.py`）：

```python
# Dictionary based on "Configuration dictionary schema" which can passed to dictConfig()
logging_cfg = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'simple_formatter': {
            'format': '%(levelname)s %(asctime)s: %(message)s'
        },
        'standard_formatter': {
            'format': '%(levelname)s %(asctime)s %(filename)s %(funcName)s[line %(lineno)d]: %(message)s'
        }
    },
    'handlers': {
        'console_handler': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard_formatter',
            'level': 'DEBUG',
            'stream': 'ext://sys.stdout'
        },
        'info_file_handler': {
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'standard_formatter',
            'level': 'INFO',
            'filename': 'logs/info.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 20,
            'encoding': 'utf-8'
        },
        'error_file_handler': {
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'standard_formatter',
            'level': 'ERROR',
            'filename': 'logs/error.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 20,
            'encoding': 'utf-8'
        },
        'warning_file_handler': {
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'standard_formatter',
            'level': 'WARNING',
            'filename': 'logs/warning.log',
            'maxBytes': 5242880,  # 5MB
            'backupCount': 10,
            'encoding': 'utf-8'
        },
        'critical_file_handler': {
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'standard_formatter',
            'level': 'CRITICAL',
            'filename': 'logs/critical.log',
            'maxBytes': 5242880,  # 5MB
            'backupCount': 10,
            'encoding': 'utf-8'
        },
    },
    'loggers': {
        'my_logger': {
            'level': 'INFO',
            'handlers': [
                'info_file_handler',
                'warning_file_handler',
                'error_file_handler',
                'critical_file_handler'
            ],
            'propagate': False
        }
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['console_handler', 'info_file_handler']
    }
}
```

使用方式：

```python
import logging
import logging.config
import os
from logging_cfg import logging_cfg


def setup_logging(log_dir='logs'):
    """ setup logging configuration """
    if not os.path.exists(log_dir):
        os.mkdir(log_dir)
    logging.config.dictConfig(logging_cfg)


if __name__ == '__main__':
    setup_logging()
    logger = logging.getLogger('my_logger')
    logger.debug('debug message')
    logger.info('info message')
    logger.warning('warning message')
    logger.error('error message')
    logger.critical('critical message')
```

## 其它常用的知识点

### 消息显示格式

通过在 formatters 里定义 formatter，可以控制消息显示的格式。哪些是可以出现在格式字符串中的内容，参考官方文档的 [LogRecord 属性](https://docs.python.org/zh-cn/3.7/library/logging.html#logrecord-attributes)。

下面是常见的格式设置的字段标识：

:::
* `%(asctime)s`：日志创建时的普通时间
* `%(created)f`：日志创建时的时间（由 time.time() 返回）
* `%(filename)s`：文件名
* `%(funcName)s`：调用日志记录的函数
* `%(levelname)s`：日志消息的文本级别
* `%(levelno)s`：日志消息的数字级别
* `%(lineno)d`：调用日志消息的行号
* `%(msecs)d`：创建时间的毫秒部分
* `%(message)s`：日志消息
* `%(name)s`：日志器的名称
* `%(pathname)s`：记录日志的源文件的路径名
* `%(process)d`：进程 ID
* `%(processName)s`：进程名
* `%(thread)d`：线程 ID
* `%(threadName)s`：线程名
* `%(relativeCreated)d`：创建日志记录的时间（以毫秒为单位）
:::

### 日志记录的堆栈追踪

前面都是一些最简单的日志记录操作与格式设置，有时候在编写的 Python 代码中，需要对捕获的异常进行日志记录，这个时候如果能跟踪函数调用的堆栈信息并记录下来，就能更快速地定位出到底是哪一个函数的哪一个位置出现了错误。

为了在调用 `logger.error()` 时记录程序的堆栈信息，有两个非常关键的参数，它们是：

* `exc_info`：默认是 `False`，设置为 `True` 后，在出现异常时会记录堆栈调用信息。
* `stack_info`：默认是 `False`，设置为 `True` 后，会记录每一条日志打印语句所在的位置（可能没什么用，不过能辅助更快地速定位问题代码吧）。

一般情况下设置 `exc_info=True` 就够了，要不要设置 `stack_info` 就看个人喜好了，有的人喜欢日志越全越好，有的人喜欢越精简越好。

下面是一个示范：

```python
def divide_func(x, y):
    return x / y


if __name__ == '__main__':
    setup_logging()
    logger = logging.getLogger('my_logger')
    try:
        divide_func(1, 0)
    except Exception as e:
        logger.error(e, exc_info=True, stack_info=True)
```

日志记录结果：

```
ERROR 2022-10-16 15:36:50,408 main.py <module>[line 24]: division by zero
Traceback (most recent call last):
  File "E:/project/py-demo/main.py", line 22, in <module>
    divide_func(1, 0)
  File "E:/project/py-demo/main.py", line 15, in divide_func
    return x / y
ZeroDivisionError: division by zero
Stack (most recent call last):
  File "E:/project/py-demo/main.py", line 24, in <module>
    logger.error(e, exc_info=True, stack_info=True)

```

### 日志回滚模式

当我们选择将日志记录到文件系统时，Python 的 logging 模块提供了两个支持日志回滚的 FileHandler 类，分别是 RotatingFileHandler 和 TimedRotatingFileHandler.

* [RotatingFileHandler](https://docs.python.org/zh-cn/3.7/library/logging.handlers.html#rotatingfilehandler)：当日志文件的大小达到指定值的时候，它会将日志文件重命名存档，然后打开一个新的日志文件。
* [TimedRotatingFileHandler](https://docs.python.org/zh-cn/3.7/library/logging.handlers.html#timedrotatingfilehandler)：当某个时刻到来时执行回滚。当回滚时机来临时，它会将日志文件重命名存档，然后打开一个新的日志文件。

使用方式也就是支持哪些参数看官方文档即可。这里主要讲一下 logging 模块的 RotatingHandler 存在的问题：

按照[官方文档](https://docs.python.org/2/library/logging.html#thread-safety)的介绍，logging 是线程安全的，也就是说，在一个进程内的多个线程同时往同一个文件写日志是安全的。但是多个进程往同一个文件写日志不是安全的。当有多个进程向同一个日志文件写入日志的时候，这两个 RotatingHandler 就会带来问题。

> 举个例子，假如某个 Web 应用通过 uWSGI 提供服务，uWSGI 一般以多进程 master/worker 的方式启动。然后该 Web 应用需要记录运行日志，并且希望日志能够每天午夜时刻自动切分回滚。如果使用 TimedRotatingFileHandler，那么由于 uWSGI 的多个 worker 可能同时也可能相差很小一段时间对日志文件进行回滚操作，这会导致先前回滚的存档日志被后来的 worker 的回滚操作覆盖，导致日志丢失。

有的人会说，那我不用多进程不就可以了。但是 Python 有一个 GIL 锁，使用多线程是没法利用到多核 CPU 的，对于 Web 服务，大部分情况下会改用多进程来利用多核 CPU，因此我们还是绕不开不开多进程下日志的问题。

至于解决方案，网上有很有自己造轮子的方法，就是自己定义一个继承 FileHandler 的 XXXHandler 类，核心原理就是围绕这两点来实现：

* 日志文件以日期结尾，当天的日志写入以当天日期结尾的文件
* 每到午夜，**原子性地**创建新的日志文件，新的日志文件以新日期结尾
  * 如何原子性地创建文件呢？以 `os.O_CREAT | os.O_EXCL` 模式打开文件就可以了。如果日志文件已经存在，打开文件就失败。

可以找一个看起来相对靠谱的模仿着写一下。不过比起造轮子，我一般会优先考虑看看有没有什么相对官方的「正统」解决方案。于是找到了一个 Python 的第三方日志库：

* [loguru](https://github.com/Delgan/loguru)。

看介绍这个库开箱即用很方便，而且通过参数配置就能让多进程安全。等有时间了学一下再整理它的用法。

## 参考资料

* [logging.config](https://docs.python.org/zh-cn/3.7/library/logging.config.html#module-logging.config)
* [Logging Cookbook](https://docs.python.org/3/howto/logging-cookbook.html)

（完）
