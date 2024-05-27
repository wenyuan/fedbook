# .filter() 使用 isnull 参数时返回重复对象

## 问题描述

有两张这样的表：

```python
class Device(models.Model):
    templates = models.ManyToManyField(
        Template,
        verbose_name=_('service templates'),
        db_table='Device_Template_Ship',  # 自定义中间表名
        related_name='devices',           # 自定义反向关联名称
        blank=True
    )
    ...其它一些字段和方法


class Template(models.Model):
    ...一些字段和方法
```

当我使用下面的语法来查询时：

```python
devices = Device.objects.filter(templates__isnull=False)
```

发现会返回完全相同的对象（重复的 device 实例）。

## 原因剖析

`templates__isnull` 导致的问题。

查询时跨越多个表，在计算 QuerySet 时可能会得到重复的结果。比如在上面的查询中，与 `Template` 表进行了关联（找出设置了字段 `templates` 值的 `device` 实例），它的 SQL 语法就像这样：

```sql
SELECT Device.*
  FROM Device 
  INNER JOIN Device_Template_Ship 
    ON (Device.id = Device_Template_Ship.device_id) 
  WHERE Device_Template_Ship.template_id IS NOT NULL;
```

因此，如果有一个 `device` 实例关联了两个 `template` 实例，那么最终将得到这个 `device` 记录两次。

## 解决方案

这时需要使用 [`distinct()`](https://docs.djangoproject.com/en/4.2/ref/models/querysets/#distinct) 来去除重复的记录。

```python
devices = Device.objects.filter(templates__isnull=False).distinct()
```

（完）
