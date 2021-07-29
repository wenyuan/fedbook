# 使用 xlrd 处理 Excel

## 关于 xlrd

xlrd 用于读取老版本 Excel（`.xls`） 中的数据，配合 xlwt 和 xlutils 也可以对 Excel 进行写入和编辑。

这三个库的职责分工如下：

* xlrd：用于读取 Excel 文件；
* xlwt：用于写入 Excel 文件；
* xlutils：用于操作 Excel 文件的实用工具，比如复制、分割、筛选等。

安装比较简单，直接用 pip 工具安装三个库即可，安装命令如下：

```bash
sudo pip install xlrd xlwt xlutils
```

## 写入 Excel

下面是一个使用 xlwt 写入 Excel 的代码示例：

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
一般用于处理老版本 Excel(.xls)
"""

import xlwt


def write_excel():
    # 创建 xls 文件对象
    wb = xlwt.Workbook()

    # 新增两个表单页
    sh1 = wb.add_sheet('成绩')
    sh2 = wb.add_sheet('汇总')

    # 然后按照位置来添加数据,第一个参数是行，第二个参数是列
    # 写入第一个 sheet
    sh1.write(0, 0, '姓名')
    sh1.write(0, 1, '专业')
    sh1.write(0, 2, '科目')
    sh1.write(0, 3, '成绩')

    sh1.write(1, 0, '张三')
    sh1.write(1, 1, '信息与通信工程')
    sh1.write(1, 2, '数值分析')
    sh1.write(1, 3, 88)

    sh1.write(2, 0, '李四')
    sh1.write(2, 1, '物联网工程')
    sh1.write(2, 2, '数字信号处理分析')
    sh1.write(2, 3, 95)

    sh1.write(3, 0, '王华')
    sh1.write(3, 1, '电子与通信工程')
    sh1.write(3, 2, '模糊数学')
    sh1.write(3, 3, 90)

    # 写入第二个 sheet
    sh2.write(0, 0, '总分')
    sh2.write(1, 0, 273)

    # 最后保存文件即可
    wb.save('student.xls')


if __name__ == "__main__":
    write_excel()
```

运行代码，结果会看到生成名为 student.xls 的 Excel 文件，打开文件查看如下图所示：

<div style="text-align: center;">
  <img src="./assets/write-xls.png" height="200" alt="使用 xlwt 写入数据到 Excel">
  <p style="text-align: center; color: #888;">（使用 xlwt 写入数据到 Excel）</p>
</div>

## 参考资料

* [xlrd](https://pypi.org/project/xlrd/)

（完）