# 数组

## 声明数组

```java
// 方式一：数据类型[] 数组名;
int[] arr;

// 方式二：数据类型 数组名[];
int arr[];
```

## 创建数组

```java
// 先声明后创建
int[] arr;
arr = new int[5];

// 声明时创建数组
int[] arr = new int[5];
```

## 数组初始化

### 静态初始化

```java
// 声明数组时初始化
int[] arr = {96, 25, 85, 66, 98};

// 创建数组时初始化
int[] arr = new int[] {96, 25, 85, 66, 98};
```

### 动态初始化

```java
# 通过下标初始化
int[] arr;
arr = new int[5];
arr[0] = 96;
arr[1] = 25;
arr[2] = 85;
arr[3] = 66;
arr[4] = 98;
```

## 遍历数组

使用普通 for 循环进行遍历：

```java
int[] nums = {10,9,17,18,22,34};

for(int i = 0; i < nums.length; i++) {
    // nums[i] 表示数组中的每一个元素
    System.out.println(nums[i]);
}
```

使用 foreach 循环进行遍历：

```java
int[] nums = {10,9,17,18,22,34};

for (int num : nums) {
    // num 是数组元素，而不是索引
    System.out.println(num);
}
```

（完）
