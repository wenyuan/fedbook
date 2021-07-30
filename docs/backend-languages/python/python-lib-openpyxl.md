# 使用 openpyxl 处理新版本 Excel

## 关于 openpyxl

openpyxl 是读写新版本 Excel（`.xlsx`） 的第三方库，是一个比较综合的工具，能够同时读取和修改 Excel 文档。支持的格式有 `.xlsx` / `.xlsm` / `.xltx` / `.xltm`。

安装比较简单，直接用 pip 工具即可，安装命令如下：

```bash
sudo pip install openpyxl
```

## 写入 Excel

下面是一个使用 openpyxl 写入数据到 Excel 的代码示例，大致逻辑是：遍历源数据，通过指定行号和列号，依次插入 Excel 表格的每个单元格中。

::: warning
* Python 中数组的索引是从 0 开始的，
* 而 openpyxl 在指定单元格时索引是从 1 开始的（`sheet.cell(row, column, value)`），
* 因此，openpyxl 的首行、首列是 (1, 1) 而不是 (0, 0)。
:::

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用第三方库：pip install openpyxl
一般用于处理新版本 Excel(.xlsx)
"""

import openpyxl


# 数据形如：[['张三', '信息与通信工程', '数值分析', 88]]
def write_excel(sheet_name, head, data, path):
    # 实例化一个工作薄对象
    workbook = openpyxl.Workbook()
    # 激活一个 Sheet 表（工作表），并为它设置一个 title
    sheet = workbook.active
    sheet.title = sheet_name

    # data 中添加表头（不需要表头可以不用加）
    data.insert(0, list(head))

    # 开始遍历并插入数据
    # row: 行  col: 列
    for row_index, row_item in enumerate(data):
        for col_index, col_item in enumerate(row_item):
            # 写入单元格
            sheet.cell(row=row_index + 1, column=col_index + 1, value=col_item)

    workbook.save(path)


if __name__ == "__main__":
    # mock 数据
    sheet_name = '成绩'
    head = ['姓名', '专业', '科目', '成绩']
    data = [
        ['张三', '信息与通信工程', '数值分析', 88],
        ['李四', '物联网工程', '数字信号处理分析', 95],
        ['王华', '电子与通信工程', '模糊数学', 90],
        ['王欢', '通信工程', '机器学习', 89]
    ]
    path = 'student.xlsx'

    # 执行方法
    write_excel(sheet_name， head, data, path)
```

运行代码，结果会看到生成名为 student.xlsx 的 Excel 文件，打开文件查看如下图所示：

<div style="text-align: center;">
  <img src="./assets/write-xlsx.png" height="200" alt="使用 openpyxl 写入数据到 Excel">
  <p style="text-align: center; color: #888;">（使用 openpyxl 写入数据到 Excel）</p>
</div>

拓展：

* 在实例化一个工作薄对象时，默认会产生一个 Sheet，默认名字是：`"Sheet"`，激活它后就可使用。

```python
workbook = openpyxl.Workbook()
sheet = workbook.active
sheet.title = sheet_name
```

* 新增第二个 Sheet 并使用。

```python
sheet_2 = workbook.create_sheet(title="Sheet名")
sheet_2['F5'] = 3.14
```

* 遍历 Sheet 对象。

```python
for sheet in workbook:
    print('sheet:', sheet)
```

* 遍历 Sheet 名然后通过名字获取 Sheet 对象。

```python
sheet_names = workbook.sheet_names
for sheet_name in sheet_names:
    sheet = workbook[sheet_name]
    print('sheet:', sheet)
```

## 读取 Excel

下面是一个使用 openpyxl 读取 Excel 数据的代码示例，逻辑比较简单：先执行要读取的 Sheet 表，然后逐行遍历，每一行中依次读取每一列（即每个单元格的数据）。

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用第三方库：pip install openpyxl
一般用于处理新版本 Excel(.xlsx)
"""

import openpyxl


def read_excel(path, sheet_name):
    # 实例化一个工作薄对象
    workbook = openpyxl.load_workbook(path)
    # 获取指定名字的 Sheet 表
    sheet = workbook[sheet_name]

    # 定义一个数组，存放要输出的数据
    result = []

    # sheet.rows 为表格内的每一行数据
    # 循环获取表格内的每一行数据
    for index, row in enumerate(sheet.rows):
        # 定义一个空的数组用来存放每一行数据单元格的数据
        current_row = []
        for col_index, col_value in enumerate(row):
            # 获取单元格数据 追加到 return_row
            current_row.append(col_value.value)
        # 把每一行数据追加到结果 return_data 中，最后输出
        result.append(current_row)

    return result


if __name__ == "__main__":
    # mock 数据
    sheet_name = '成绩'
    path = 'student.xlsx'

    # 执行方法
    result = read_excel(path, sheet_name)
    print(result)
```

输出如下结果：

<div style="text-align: center;">
  <img src="./assets/read-xlsx.png" height="133" alt="使用 openpyxl 从 Excel 读取数据">
  <p style="text-align: center; color: #888;">（使用 openpyxl 从 Excel 读取数据）</p>
</div>

## 常用 API

接下来列举通过 openpyxl 读写 Excel 时常用的 API。

> 如无特别标注，以下所有代码中的 `workbook` 为工作薄的实例对象，`sheet` 为工作表的实力对象。

### 打开 Excel 表格并获取表格名称

```python
from openpyxl import load_workbook
workbook = load_workbook(filename="test.xlsx")
workbook.sheetnames
```

### 通过 Sheet 名称获取表格

```python
from openpyxl import load_workbook
workbook = load_workbook(filename="test.xlsx")
workbook.sheetnames
sheet = workbook["Sheet1"]
print(sheet)
```

### 获取表格的尺寸大小

这里所说的尺寸大小，指的是 Excel 表格中的数据有几行几列，针对的是不同的 Sheet 而言。

```python
sheet.dimensions
```

### 获取表格内某个格子的数据

* `sheet["A1"]` 方式

```python
"""
workbook.active 打开激活的表格；
sheet["A1"] 获取A1格子的数据；
cell.value 获取格子中的值；
"""

workbook = load_workbook(filename="test.xlsx")
sheet = workbook.active
print(sheet)
cell1 = sheet["A1"]
cell2 = sheet["C11"]
print(cell1.value, cell2.value)
```

* `sheet.cell(row=, column=)` 方式，这种方式更简单

```python
workbook = load_workbook(filename="test.xlsx")
sheet = workbook.active
print(sheet)
cell1 = sheet.cell(row = 1,column = 1)
cell2 = sheet.cell(row = 11,column = 3)
print(cell1.value, cell2.value)
```

### 获取某个单元格的行数、列数、坐标

```python
"""
.row 获取某个格子的行数；
.columns 获取某个格子的列数；
.corordinate 获取某个格子的坐标；
"""

workbook = load_workbook(filename="test.xlsx")
sheet = workbook.active
print(sheet)
cell1 = sheet["A1"]
cell2 = sheet["C11"]
print(cell1.value, cell1.row, cell1.column, cell1.coordinate)
print(cell2.value, cell2.row, cell2.column, cell2.coordinate)
```

### 获取一系列单元格

* `sheet[]` 方式

```python
workbook = load_workbook(filename="test.xlsx")
sheet = workbook.active
# 获取 A1:C2 区域的值
cells = sheet["A1:C2"]
print(cells)
for row in cells:
    for col in row:
        print(col.value)

# 如果我们只想获取"A列"，或者获取"A-C列"，可以采取如下方式：
# sheet["A"]    --- 获取 A 列的数据
# sheet["A:C"]  --- 获取 A,B,C 三列的数据
# sheet[5]      --- 获取第 5 行的数据
```

* `.iter_rows()` 和 `.iter_cols()` 方式

```python
workbook = load_workbook(filename = "test.xlsx")
sheet = workbook.active

# 按行获取值
for row in sheet.iter_rows(min_row=2, max_row=5, min_col=1, max_col=2):
    for col in row:
        print(col.value)

# 按列获取值
for col in sheet.iter_cols(min_row=2, max_row=5, min_col=1, max_col=2):
    for row in col:
        print(row.value)
```

## 参考资料

* [openpyxl](https://openpyxl.readthedocs.io/en/stable/)

（完）
