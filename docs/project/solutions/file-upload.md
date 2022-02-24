# 大文件分片上传和断点续传

## 场景描述

文件上传是一个很常见的需求，在文件相对比较小的情况下，可以直接把文件转化为字节流上传到服务器，但在文件比较大的情况下，用普通的方式进行上传就不是一个好的办法了。毕竟很少有人能忍受，当文件上传到一半中断后，继续上传却只能重头开始上传，这种体验很不友好。

本文将从零搭建前端和服务端，实现一个大文件分片上传和断点续传的小案例。

* 前端：Vue.js、Element-Ui、Axios
* 后端：Node.js 
* 实例代码仓库：[file-upload](https://github.com/wenyuan/file-upload)

## 整体思路

### 前端

#### 大文件上传

* 将大文件转换成二进制流的格式
* 利用流可以切割的属性，将二进制流切割成多份
* 借助 http 的可并发性，同时上传多个切片（比起传一个大文件可以减少上传时间）
* 等监听到所有请求都成功发出去以后，再给服务端发出一个合并的信号

#### 断点续传

* 为每一个文件切割块添加不同的标识
* 当上传成功的之后，记录上传成功的标识
* 当我们暂停或者发送失败后，可以重新发送没有上传成功的切割文件

### 后端

* 接收每一个切割文件，并在接收成功后，存到指定位置，并告诉前端接收成功
* 收到合并信号，将所有的切割文件排序、合并，生成最终的大文件，然后删除切割小文件，并告知前端大文件的地址

## 前端代码

前端使用 Vue + ElementUI，代码比较清晰，虽然原生也可以，但要多写很多代码。

### 上传控件

首先创建上传控件和进度条控件，因为要自定义一个上传的实现，所以 `el-upload` 组件的 `auto-upload` 要设定为 `false`；`action` 为必选参数，此处可以不填值。

::: tip
ElementUI 的上传组件，默认是基于文件流的：

* 数据格式：form-data
* 传递的数据： file 文件流信息；filename 文件名字
:::

代码如下：

```vue
<template>
  <div id="app">
    <div class="file-upload">
      <!-- 上传组件 -->
      <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleChange">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="handleUpload">上传到服务器</el-button>
        <div slot="tip" class="el-upload__tip" v-if="file">待上传文件：{{ file.name }}</div>
      </el-upload>
      <!-- 进度显示 -->
      <div class="progress-box">
        <span>上传进度：{{ percent.toFixed() }}%</span>
        <el-button type="primary" size="mini" @click="handleClickBtn">{{ upload | btnTextFilter}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  filters: {
    btnTextFilter(val) {
      return val ? '暂停' : '继续'
    }
  },
  data() {
    return {
      file: null,
      chunkList: [],
      hash: '',
      percentCount: 0,
      percent: 0,
      upload: true
    }
  },
  methods: {
    // 提交文件后触发
    handleChange(file) {
      Object.assign(this.$data, this.$options.data()) // 将 data 重置为初始状态
      this.file = file
    },
    // 点击上传按钮后触发
    async handleUpload() {
    },
    // 将 File 对象转为 ArrayBuffer
    fileToBuffer() {
    },
    // 生成文件切片
    createChunks() {
    },
    // 上传文件切片
    uploadChunks() {
    },
    // 发送合并指令
    mergeUpload() {
    },
    // 按下暂停按钮
    handleClickBtn() {
    }
  }
}
</script>

<style>
.file-upload {
  margin-top: 50px;
  margin-left: 50px;
}

.progress-box {
  box-sizing: border-box;
  width: 360px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #ecf5ff;
  font-size: 14px;
  border-radius: 4px;
}
</style>
```

### 转二进制

转成 ArrayBuffer 是因为后面要用 SparkMD5 这个库生成 hash 值，对文件进行命名。

JS 常见的二进制格式有 Blob，ArrayBuffer 和 Buffer，如果对二进制流不了解，可以查看[这篇文章](https://www.cnblogs.com/penghuwan/p/12053775.html)。

这里采用 ArrayBuffer，并且因为解析过程可能会比较久，所以我们采用 promise 异步处理的方式。

代码如下：

```javascript
// 在 ElementUI 中, 自带方法中的 file 并不是 File 对象
// 要获取 File 对象需要通过 file.raw, 以下所有的 fileObj = file.raw
fileToBuffer(fileObj) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = event => {
      resolve(event.target.result)
    }
    fileReader.readAsArrayBuffer(fileObj)
    fileReader.onerror = () => {
      reject(new Error('转换文件格式发生错误'))
    }
  })
}
```

### 创建切片

接下来将大文件按固定大小（10M）进行切片，就像操作数组一样（注意此处同时声明了多个常量）。

我们在拆分切片大文件的时候，还要考虑大文件的合并，所以我们的拆分必须有规律，比如 `1_1`，`1_2`，`1_3`，`1_5` 这样的，到时候服务端拿到切片数据，当接收到合并信号的时候，就可以将这些切片排序合并了。

同时，为了避免同一个文件（改名字）多次上传，我们引入了 spark-md5，它能根据具体文件内容，生成 hash 值。

这么一来，为每一个切片命名的时候，也就成了 `hash_1`，`hash_2` 这种形式。

> 切割文件用到的是 [`Blob.slice()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/slice)。

代码如下：

```javascript
const SIZE = 10 * 1024 * 1024 // 切片大小

createChunks(buffer, fileObj, chunkSize = SIZE) {
  // 声明几个变量, 后面切分文件要用
  const chunkList = [] // 保存所有切片的数组
  const chunkListLength = Math.ceil(fileObj.size / chunkSize) // 计算总共多个切片
  const suffix = /\.([0-9A-z]+)$/.exec(fileObj.name)[1] // 文件后缀名(文件格式)

  // 根据文件内容生成 hash 值
  const spark = new SparkMD5.ArrayBuffer()
  spark.append(buffer)
  const hash = spark.end()
  
  // 生成切片, 这里后端要求传递的参数为字节数据块(chunk)和每个数据块的文件名(fileName)
  let cur = 0 // 切片时的初始位置
  for (let i = 0; i < chunkListLength; i++) {
    const item = {
      chunk: fileObj.slice(cur, cur + chunkSize),
      fileName: `${hash}_${i}.${suffix}` // 文件名规则按照 hash_1.jpg 命名
    }
    cur += chunkSize
    chunkList.push(item)
  }
  console.log('切片完后的数组：', chunkList)
  this.chunkList = chunkList // uploadChunks 要用到
  this.hash = hash           // uploadChunks 要用到
}
```

::: tip
分割大文件的时候，一般可以采用「定切片数量」和「定切片大小」两种方式。

为了避免由于 JS 使用的 IEEE754 二进制浮点数算术标准可能导致的误差，这里采用定切片大小的方式，规定每个切片 10MB，也就是说 100 MB 的文件会被分成 10 个切片。
:::

### 发送请求

上传切片的请求可以是并行的或是串行的，这里选择串行发送。每个切片都新建一个请求，为了后面能实现断点续传，将请求封装到函数 `fn` 里，用一个数组 `requestList` 来保存请求集合，然后封装一个 `send` 函数，用于请求发送，这样一旦按下暂停键，可以方便的终止上传。

切片发送完成后，何时合并它们呢，一般有两种思路：

* 前端在每个切片中都携带切片最大数量的信息，当服务端接受到这个数量的切片时自动合并
* 前端额外发一个请求，主动通知服务端进行合并，服务端接受到这个请求时主动合并切片

这里采用第二种方式，即前端主动通知服务端进行合并。为此需要再发送一个 get 请求并把文件的 hash 值传给服务器，我们定义一个 `complete` 方法来实现。

代码如下：

```javascript
const BaseUrl = 'http://localhost:5000'

uploadChunks() {
  const requestList = [] // 请求集合
  this.chunkList.forEach((item, index) => {
    const fn = () => {
      const formData = new FormData()
      formData.append('hash', this.hash)
      formData.append('chunk', item.chunk)
      formData.append('filename', item.fileName)
      return axios({
        url: BaseUrl + '/api/upload/',
        method: 'post',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: formData
      }).then(res => {
        if (res.data.code === 0) { // 成功
          if (this.percentCount === 0) { // 避免上传成功后会删除切片改变 chunkList 的长度影响到 percentCount 的值
            this.percentCount = 100 / this.chunkList.length
          }
          this.percent += this.percentCount // 改变进度
          this.chunkList.splice(index, 1)   // 一旦上传成功就删除这一个 chunk, 方便断点续传
        }
      }).catch(error => {
        console.log('上传失败：', error)
        this.$message.error('上传失败，请检查服务端是否正常')
      })
    }
    requestList.push(fn)
  })

  let i = 0 // 记录发送的请求个数
  // 文件切片全部发送完毕后, 需要请求 merge 接口, 把文件的 hash 传递给服务器
  const complete = () => {
    axios({
      url: BaseUrl + '/api/merge/',
      method: 'post',
      data: { hash: this.hash, filename: this.file.name, size: this.chunkList.length}
    }).then(res => {
      if (res.data.code === 0) { // 请求发送成功
        this.$message({
          message: res.data.message,
          type: 'success'
        })
      } else {
        this.$message({
          message: res.data.message,
          type: 'error'
        })
      }
    })
  }
  const send = async () => {
    if (i >= requestList.length) {
      // 全部发送完毕
      complete()
      return
    }
    await requestList[i]()
    i++
    send()
  }
  send() // 发送请求
}
```

::: tip
这里需要注意的就是，我们发出去的数据采用的是 FormData 数据格式。（[为什么](https://segmentfault.com/q/1010000025217412)）
:::

### 断点续传

暂停按钮文字的处理，用了一个过滤器，如果 `upload` 值为 `true` 则显示「暂停」，否则显示「继续」：

```javascript
filters: {
  btnTextFilter(val) {
    return val ? '暂停' : '继续'
  }
}
```

当按下暂停按钮，触发 `handleClickBtn()` 方法：

```javascript
handleClickBtn() {
  this.upload = !this.upload
  // 如果不暂停则继续上传
  if (this.upload) this.uploadChunks()
}
```

同时需要在 `send()` 方法里增加判断是否暂停的逻辑：只要 `upload` 这个变量为 `false` 就不会继续上传了。

为了在暂停完后可以继续发送，需要在每次成功发送一个切片后将这个切片从 `chunkList` 数组里删除 `this.chunkList.splice(index, 1)`（所以前面在写上传接口的时候有了这么一行代码）。

代码中增加一行如下：

```javascript {2}
const send = async () => {
  if (!this.upload) return
  if (i >= requestList.length) {
    // 全部发送完毕
    complete()
    return
  }
  await requestList[i]()
  i++
  send()
}
```

## 后端代码

简单使用 http 模块搭建服务端，主要实现两个接口的处理逻辑：

* 上传切片（`/api/upload/`）
* 合并切片（`/api/merge/`）

代码比较简单，主要是一些第三方和内置模块的使用，关键的地方加了一些注释，参见 [file-upload/backend/](https://github.com/wenyuan/file-upload/tree/main/backend)。

## 问题总结

当前的例子，基于前端大文件分片上传和断点续传的场景，总结了实现思路，并用代码进行了简单的实现。

如果是在复杂的生产环境中，可能会有更多的问题需要考虑，下面是我能想到的一些以及思路：

* 断网（或者电脑重启）后，再次选择文件，如何续传？

> 思路：前端把已经上传的信息存在 Local Storage 里，或者向后端请求接口去获得，更偏向于让后端来存这个信息。

* 基于上面的问题，如何判别新的上次文件，是新建上传还是续传文件？

> 思路：根据 SparkMD5 生成的 hash 来判断（这个 hash 值是依据文件内容来的）。

* 多人同时上传同一文件冲突、换电脑之后再次上传同一文件处理。

> 思路：多人上传可以考虑用用户 token 来区分，或者从生成浏览器唯一 id 的思路出发，id 结合文件 hash 来标识这个文件。

* 更大的文件（比如 100G）上传时，计算 MD5 切片时会遇到资源不够用的问题，浏览器会卡死。

> JS 单线程逻辑异步的效果不会很明显，整个过程（计算 Md5 - 获取切片 - 上传切片 - 文件合并）可以用 worker api，开多线程调用 CPU 另外的核去做，主线程只负责接收 Message，这样性能和体验应该会好很多。但因为 V8 对内存的限制，并没有完美的解决方案。

* 多文件上传的优化思路

> 大文件用 worker 切片保证线程不卡，但多个大文件内存肯定不够用，所以只能尽可能优化。

## 不错的项目

实际业务中，可能对大文件上传有更细化的需求，并且需要兼容和考虑很多种情况，因此可以借鉴现成的轮子，经过调研，我发现了几个不错的项目：

* [vue-simple-uploader](https://github.com/simple-uploader/vue-uploader)
* [file-chunk](https://github.com/yangrds/file-chunk)
* [webuploader](https://github.com/fex-team/webuploader)

（完）
