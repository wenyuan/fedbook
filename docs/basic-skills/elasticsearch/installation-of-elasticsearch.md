# ES 的安装

## Ubuntu 下安装 ES

### 下载、解压 ES 安装包

可以在[官方下载页面](https://www.elastic.co/cn/downloads/elasticsearch)进行下载，然后上传到服务器。

也可以在 Ubuntu 上使用 `wget` 指令进行下载，然后解压：

```bash
# 我一般将 ES 安装在 /opt 目录下
cd /opt

wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.13.0-linux-x86_64.tar.gz

tar -zxvf elasticsearch-7.13.0-linux-x86_64.tar.gz
```

解压后可以看到 ES 的文件目录结构如下：

```
├── elasticsearch-7.13.0
    │── bin              # 包含一些执行脚本，其中 ES 的启动文件和脚本安装文件就在这里
    │── config           # 包含集群的配置文件（elasticsearch.yml）、jvm配置（jvm.options）、user等相关配置
    │── jdk              # 7.0 后自带 jdk，java 运行环境
    │── lib              # java 的类库
    │── LICENSE.txt
    │── logs
    │── modules          # 包含所有 ES 的模块
    │── NOTICE.txt
    │── plugins          # 插件安装的目录
    └── README.asciidoc
```

### 修改 ES 服务配置

虽然 ES 可以开箱即用，但这里我们还是需要修改部分配置的。ES 的配置文件在 config 目录内，我们主要关注两个配置文件：`elasticsearch.yml` 和 `jvm.options`。

elasticsearch.yml 是用来配置 ES 服务的各种参数的，而 jvm.options 主要保存 JVM 相关的配置。

编辑配置文件 `vim /config/elasticsearch.yml`，在最后添加如下配置项：

```bash
# 建议和前面的内容之间加个空行，可以更清晰些

cluster.name: my_app
node.name: my_node_1
path.data: ./data
path.logs: ./logs
http.port: 9211
network.host: 0.0.0.0  # 线上一定不能配置为 0.0.0.0
discovery.seed_hosts: ["localhost"]
cluster.initial_master_nodes: ["my_node_1"]
```

配置项解析：

* `discovery.seed_hosts`：在开箱即用的场景下（本机环境）无需配置，ES 会自动扫描本机的 9300 到9305 端口。一旦进行了网络环境配置，这个自动扫描操作就不会执行。
  * 将它的值配置为 master 候选者节点即可。如果需要指定端口的话，其值可以为：`["localhost:9300", "localhost:9301"]`
* `cluster.initial_master_nodes`：指定新集群 master 候选者列表，其值为节点的名字列表。
  * 这里配置了 `node.name: my_node_1`，所以其值为 `["my_node_1"]`，而不是 ip 列表。
* `network.host` 和 `http.port`：这是 ES 提供服务的监听地址和端口。
  * 线上一定不能配置 ip 为 0.0.0.0，这是非常危险的行为！！！

> 怎么样来理解这个 `discovery.seed_hosts` 和 `cluster.initial_master_nodes` 呢？
> 
> * `cluster.initial_master_nodes` 是候选者列表，一般我们线上环境候选者的数量会比较少，毕竟是用来做备用的。而且这个配置只跟选举 master 有关，也就是跟其他类型的节点没有关系，其他类型的节点不需要配置这个也是可以的。
>
> * `discovery.seed_hosts` 这个可以理解为是做服务或者节点发现的，其他节点必须知道他们才能进入集群，一般配置为集群的 master 候选者的列表。
>
> 在现实环境中是这些 master 候选者（组织联系人）可能会经常变化，那怎么办呢？
> 
> `discovery.seed_hosts` 这个配置项除了支持 ip 外还支持域名，所以可以用域名来解决这个问题。其他类型节点的配置上写的是域名，域名解析到对应的 ip，如果机器挂了，新的节点 ip 换了，就把域名解析到新的 ip 即可，这样其他节点的配就不用修改了。所以非 master 候选节点要配 `discovery.seed_hosts`（组织联系人）才能顺利加入到集群中来。

### 修改 JVM 参数

除了修改 ES 服务配置外，还需要在 jvm.options 文件中配置 JVM 的参数，我们主要配置服务占用的堆内存的大小：

编辑配置文件 `vim /config/jvm.options`，在最后添加如下配置项：

```bash
# 建议和前面的内容之间加个空行，可以更清晰些

# 设置堆内存最小值
-Xms1g
# 设置堆内存最大值
-Xmx1g
```

JVM 配置需要注意以下几点：

* **-Xms 和 -Xmx 这两个 JVM 的参数必须配置为一样的数值**。服务在启动的时候就分配好内存空间，避免运行时申请分配内存造成系统抖动。
* **Xmx 不要超过机器内存的 50%，留下些内存供 JVM 堆外内存使用**。
* **并且 Xmx 不要超过 32G，建议最大配置为 30G**。接近 32G，JVM 会启用压缩对象指针的功能，导致性能下降。具体可以参考：[a-heap-of-trouble](https://www.elastic.co/cn/blog/a-heap-of-trouble)。

### 配置系统环境

如果就上面的配置进行启动，ES 会报错：

```bash
bootstrap check failure [1] of [1]:

max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
```

按照提示进行操作系统配置就可以了，执行 `vim /etc/sysctl.conf` 指令，添加如下内容来配置系统环境：

```bash
# 建议和前面的内容之间加个空行，可以更清晰些

vm.max_map_count=262144
```

然后执行 `sysctl -p`。

### 运行 ES

注意，ES 不能使用 root 来运行！！！！

```bash
# 前台运行，可以直接查看日志
.bin/elasticsearch

# 后台运行，日志在 ./logs/my_app.log
# 查看日志的话可以：tail -n 100 -f logs/my_app.log
.bin/elasticsearch -d
```

在浏览器中访问 localhost:9211，可以看到有关节点信息的内容即运行成功。

## Ubuntu 下安装 Kibana

### 下载、解压

Kibana 是官方的数据分析和可视化平台，但现在我们只需要把它当作 ES 查询的调试工具即可。Kibana 与 ES 的版本是有对应关系的，所以需要下载与 ES 同版本的 Kibana，在这里下载 [Kibana](https://www.elastic.co/cn/downloads/kibana)。

下面是使用 `wget` 下载并且解压安装 Kibana 的指令（版本与前面安装的 ES 一致，都是 7.13.0）：

```bash
# 还是安装在 /opt 目录
cd /opt

wget https://artifacts.elastic.co/downloads/kibana/kibana-7.13.0-linux-x86_64.tar.gz

tar -zxvf kibana-7.13.0-linux-x86_64.tar.gz

# 重命名
mv kibana-7.13.0-linux-x86_64 kibana-7.13.0

# 进入安装目录，准备做一些配置
cd kibana-7.13.0
```

### 修改服务配置

编辑配置文件 `vim /config/kibana.yml`，在最后添加如下配置项：

```bash
# 建议和前面的内容之间加个空行，可以更清晰些

server.host: "0.0.0.0"  # 线上一定不能配置ip为 0.0.0.0，这是非常危险的行为！！！

elasticsearch.hosts: ["http://localhost:9211"]
```

### 前台运行 ES

```bash
./bin/kibana >> run.log 2>&1 &
```

安装完成后，在浏览器中访问 localhost:5601，如果运行成功可以进入到可视化操作界面。

打开 Dev Tools 即可开始你的查询了，新版的 Kibana 加入了很多功能，比我之前用的 5.x 丰富很多。

## 安装 Cerebro

[Cerebro](https://github.com/lmenezes/cerebro) 是一个简单的 ES 集群管理工具，其安装如下：

```bash
cd /opt

wget https://github.com//lmenezes/cerebro/releases/download/v0.9.4/cerebro-0.9.4.tgz

tar -zxvf cerebro-0.9.4.tgz

mv cerebro-0.9.4 cerebro

cd cerebro

sed -i 's/server.http.port = ${?CEREBRO_PORT}/server.http.port = 9800/g' conf/application.conf

echo -e '\nhosts = [
    {
        host = "http://localhost:9211"
        name = "my_app"
    }
]' >> conf/application.conf
```

配置完成后，运行以下指令启动 Cerebro：

```bash
# 启动， 在 run.log 中查看日志
.bin/cerebro >> run.log 2>&1 &
```

如果启动成功，在浏览器中访问 localhost:9800 即可访问 Cerebro。

（完）
