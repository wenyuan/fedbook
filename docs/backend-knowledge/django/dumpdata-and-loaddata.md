# 导出/导入数据库表数据

使用 Django 自带的管理命令，可以用来备份你的模型实例和数据库表数据。

* `manage.py dumpdata`
* `manage.py loaddata`

## dumpdata 导出数据

通过 `python manage.py dumpdata -h` 可以查看相关参数：

* `-h` 查看帮助文档
* `--format` 格式化输出导出的数据，支持导出数据格式为：json/xml/yaml
* `--indent` 美化 json 格式，json 缩进空格数
* `--database` 指定要从中转储装置的特定数据库。默认为 `"default"` 数据库
* `--exclude`（`-e`） 选择不需要备份的 app 或者表
* `--natural-foreign` 使用外键
* `-a`（`--all`）使用 Django 的基本管理器转储数据库中存储的所有模型，包括那些将由自定义管理器过滤或修改的模型。

将整个 Django 使用到的数据库转存到 db.json 文件中（备份整个数据库）：

```bash
python manage.py dumpdata > db.json
```

将指定 app 中的所有数据导出（备份指定的 app）：

```bash
python manage.py dumpdata app名 > app名.json
```

将指定表中的数据导出（备份特定的表）：

```bash
python manage.py dumpdata app名.model名 > model名.json
```

也可以美化一下导出的数据格式，方便查看，比如导出 json 格式的数据：

```bash
python manage.py dumpdata app名.model名 --indent 2 --format json > model名.json
```

## loaddata 导入数据

loaddata 可以用来导入固定格式的数据到数据库，不过一般建议先清空对应表的数据，再导入数据，否则可能会因为字段重复产生报错：

```bash
# 将 users.json 中的数据导入数据库
python manage.py loaddata users.json
```

命令执行完，数据就会导入到数据库了。

（完）
