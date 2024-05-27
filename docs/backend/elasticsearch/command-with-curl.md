# 命令行操作

> 有的环境不能打开 Kibana，就需要在服务器上通过命令行，使用 curl 来进行操作。

## curl

参数：

* `-X`：指定 HTTP 的请求方式，有 `HEAD`、`GET`、`POST`、`PUT`、`DELETE`。
* `-d`：指定要传输的数据。
* `-H`：指定 HTTP 的请求头信息。

> Linux 系统下换行命令是：`\`。过长的单行命令需要进行换行，使用 `\` 即可达到目的，且不影响继续写命令。

## 集群操作

```bash
# 查看集群健康状态
curl -H 'Content-Type: application/json' -XGET 'http://localhost:9200/_cluster/health?pretty=true'
```

## 索引操作

```bash
# 列出所有索引
curl -X GET 'http://localhost:9200/_cat/indices?pretty=true'

# 删除指定索引
curl -X DELETE 'http://localhost:9200/索引名'

# 列出指定索引的 mapping
curl -X GET 'http://localhost:9200/索引名?pretty=true'

# 备份索引（也就是 reindex 操作）
curl -XPOST --header 'Content-Type: application/json' http://localhost:9200/_reindex -d '
{
  "source": {
    "index": "samples"
  },
  "dest": {
    "index": "samples_backup"
  }
}'
```

## 文档操作

```bash
# 列出指定索引中的所有数据
curl -X GET 'http://localhost:9200/索引名/_search?pretty=true'

# 根据过滤条件查询数据（使用 URL 传参，使用 Lucene 查询格式）
# 经测试，匹配字段的值是中文是会查不出来数据
curl -X GET http://localhost:9200/索引名/_search?pretty=true&q=guid:123

# 根据过滤条件查询数据（使用 JSON 查询，即 Elasticsearch 查询 DSL）
curl -XGET --header 'Content-Type: application/json' http://localhost:9200/索引名/_search?pretty=true -d '
{
  "query": {
    "match" : { "name": "张三" }
  }
}'

# 添加一条数据
curl -XPUT --header 'Content-Type: application/json' http://localhost:9200/索引名/_doc/1 -d '
{
  "name": "李四"			
}'

# 更新文档id更新指定文档
curl -XPOST --header 'Content-Type: application/json' http://localhost:9200/索引名/_doc/2/_update -d '
{
  "doc": {
    "age": 15
  }
}'
```

## 参考资料

* [Manage data from the command line](https://www.elastic.co/guide/en/cloud/current/ec-working-with-elasticsearch.html)

（完）
