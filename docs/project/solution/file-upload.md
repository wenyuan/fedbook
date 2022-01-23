# 大文件分片上传和断点续传

## 场景描述

文件上传是一个很常见的需求，在文件相对比较小的情况下，可以直接把文件转化为字节流上传到服务器，但在文件比较大的情况下，用普通的方式进行上传就不是一个好的办法了。毕竟很少有人能忍受，当文件上传到一半中断后，继续上传却只能重头开始上传，这种体验很不友好。

本文将从零搭建前端和服务端，实现一个大文件分片上传和断点续传的小案例。

* 前端：Vue.js、Element-Ui
* 后端：Node.js 
* 实例代码仓库：[file-upload](https://github.com/wenyuan/file-upload)

## 整体思路

### 前端

#### 大文件上传

* 将大文件转换成二进制流的格式
* 利用流可以切割的属性，将二进制流切割成多份
* 借助 http 的可并发性，同时上传多个切片（比起传一个大文件可以减少上传时间）
* 等监听到所有请求都成功发出去以后，再给服务端发出一个合并的信号

::: tip 注意点
由于是并行上传，传输到服务端的顺序可能会发生变化，所以我们还需要给每个切片记录顺序
:::

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

首先创建上传控件和进度条控件，从使用体验角度考虑，采取手动上传的方式，而不是默认的提交文件立刻上传。

::: tip
ElementUI 的上传组件，默认是基于文件流的：

* 数据格式：form-data
* 传递的数据： file 文件流信息；filename 文件名字
:::

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
      percent: 0,
      upload: true,
      percentCount: 0
    }
  },
  methods: {
    // 提交文件后触发
    handleChange(file) {
      this.file = file
    },
    // 点击上传按钮后触发
    async handleUpload() {
    },
    // 将 File 对象转为 ArrayBuffer
    fileToBuffer() {
    },
    // 生成文件切片
    createFileChunk() {
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

### 创建切片

接下来将大文件进行切片：

```vue
<script>
const SIZE = 10 * 1024 * 1024; // 切片大小

export default {
  name: 'App',
  data() {
    return {
      file: null,
      fileChunkList: []
    }
  },
  methods: {
    handleFileChange(e) {},
    async handleUpload() {
      if (!this.file) return
      // 创建切片
      const fileChunkList = this.createFileChunk(this.file)
      this.fileChunkList = fileChunkList.map(({ file }, idx)=>{
        return { chunk: file, hash: this.file.name + '-' + idx } 
      })
      // TODO...上传切片
    },
    // 生成文件切片
    createFileChunk (file, size = SIZE) {
      const fileChunkList = []
      let cur = 0
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur+size) })
        cur += size
      }
      return fileChunkList
    }
  }
}
</script>
```

当点击上传按钮后，调用 `createFileChunk` 将文件切片。一般可以采用「定切片数量」和「定切片大小」两种方式，这里采用定切片大小的方式，规定每个切片 10MB，也就是说 100 MB 的文件会被分成 10 个切片。

在生成文件切片时，需要给每个切片一个标识作为 hash，这里暂时使用`文件名 + 下标`，这样后端可以知道当前切片是第几个切片，在之后合并切片时需要。

### 并行发送切片

随后调用 `uploadChunks` 上传所有的文件切片，将文件切片、切片 hash，以及文件名放入 FormData 中，再使用 axios 发送 ajax 请求，最后调用 `Promise.all()` 并发上传所有的切片。

```vue
<script>
import axios from 'axios'

const BaseUrl = 'http://localhost:8080'
const SIZE = 10 * 1024 * 1024; // 切片大小

export default {
  name: 'App',
  data() {
    return {
      file: null,
      fileChunkList: []
    }
  },
  methods: {
    handleFileChange(e) {},
    async handleUpload() {
      if (!this.file) return
      // 创建切片
      // ...
      // 上传切片
      await this.uploadChunks()
    },
    // 生成文件切片
    createFileChunk (file, size = SIZE) {},
    // 并行上传切片
    async uploadChunks() {
      const requestList = this.fileChunkList
        .map(({ chunk, hash }) => {
          const formData = new FormData()
          formData.append("chunk", chunk)
          formData.append("hash", hash)
          formData.append("filename", this.file.name)
          return { formData } // TODO...为什么要加{}
        })
        .map(async ({ formData }) => {
          axios.post({
            url: BaseUrl + "/upload/",
            data: formData,
            headers: {"Content-Type": "multipart/form-data"}
          })
        })
      await Promise.all(requestList); // 并发切片
    }
  }
}
</script>
```

::: tip
这里需要注意的就是，我们发出去的数据采用的是 FormData 数据格式。（[为什么](https://segmentfault.com/q/1010000025217412)）
:::

### 发送合并请求

服务端接收到一个个切片后，何时合并它们呢？

一般有两种思路：

* 前端在每个切片中都携带切片最大数量的信息，当服务端接受到这个数量的切片时自动合并
* 前端额外发一个请求，主动通知服务端进行合并，服务端接受到这个请求时主动合并切片

这里采用第二种方式，即前端主动通知服务端进行合并。

```vue
<script>
import axios from 'axios'

const BaseUrl = 'http://localhost:8080'
const SIZE = 10 * 1024 * 1024; // 切片大小

export default {
  name: 'App',
  data() {
    return {
      file: null,
      fileChunkList: []
    }
  },
  methods: {
    handleFileChange(e) {},
    async handleUpload() {
      if (!this.file) return
      // 创建切片
      // 上传切片
    },
    // 生成文件切片
    createFileChunk (file, size = SIZE) {},
    // 并行上传切片
    async uploadChunks() {
      const requestList = this.fileChunkList.map().map() // 这里为了减少篇幅, 省略 .map() 里面的处理
      await Promise.all(requestList) // 并发切片
      // 合并切片
      await this.mergeRequest()
    },
    // 发送合并通知
    async mergeRequest() {
      await axios.post({
        url: BaseUrl + "/merge/",
        data: JSON.stringify({
          filename: this.file.name
        }),
        headers: {"Content-Type": "application/json"}
      })
    }
  }
}
</script>
```

## 后端代码

简单使用 http 模块搭建服务端。

```javascript
const http = require("http")
const server = http.createServer()

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")
  if (req.method === "OPTIONS") {
    res.status = 200
    res.end()
    return
  }
});

server.listen(5000, () => console.log("正在监听 5000 端口"))
```

### 接受切片

使用 `multiparty` 包处理前端传来的 FormData。

在 `multiparty.parse` 的回调中，`files` 参数保存了 FormData 中文件，`fields` 参数保存了 FormData 中非文件的字段。

```javascript
const http = require("http");
const path = require("path");
const fse = require("fs-extra");
const multiparty = require("multiparty");

const server = http.createServer();
const UPLOAD_DIR = path.resolve(__dirname, "..", "target"); // 大文件存储目录

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status = 200;
    res.end();
    return;
  }

  const multipart = new multiparty.Form();

  multipart.parse(req, async (err, fields, files) => {
    if (err) {
      return;
    }
    const [chunk] = files.chunk;
    const [hash] = fields.hash;
    const [filename] = fields.filename;
    const chunkDir = path.resolve(UPLOAD_DIR, filename);

   // 切片目录不存在，创建切片目录
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirs(chunkDir);
    }

      // fs-extra 专用方法，类似 fs.rename 并且跨平台
      // fs-extra 的 rename 方法 windows 平台会有权限问题
      // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
      await fse.move(chunk.path, `${chunkDir}/${hash}`);
    res.end("received file chunk");
  });
});

server.listen(5000, () => console.log("正在监听 5000 端口"));
```

查看 multiparty 处理后的 chunk 对象，path 是存储临时文件的路径，size 是临时文件大小，在 multiparty 文档中提到可以使用 fs.rename(由于我用的是 fs-extra，它的 rename 方法 windows 平台权限问题，所以换成了 fse.move) 移动临时文件，即移动文件切片

在接受文件切片时，需要先创建存储切片的文件夹，由于前端在发送每个切片时额外携带了唯一值 hash，所以以 hash 作为文件名，将切片从临时路径移动切片文件夹中，最后的结果如下：

图片

### 合并切片

在接收到前端发送的合并请求后，服务端将文件夹下的所有切片进行合并。

```javascript
const http = require("http");
const path = require("path");
const fse = require("fs-extra");

const server = http.createServer();
const UPLOAD_DIR = path.resolve(__dirname, "..", "target"); // 大文件存储目录

const resolvePost = req =>
   new Promise(resolve => {
     let chunk = "";
     req.on("data", data => {
       chunk += data;
     });
     req.on("end", () => {
       resolve(JSON.parse(chunk));
     });
   });

 const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });

// 合并切片
 const mergeFileChunk = async (filePath, filename, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, filename);
  const chunkPaths = await fse.readdir(chunkDir);
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1) * size
        })
      )
    )
  );
  fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
};

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status = 200;
    res.end();
    return;
  }

   if (req.url === "/merge") {
     const data = await resolvePost(req);
     const { filename,size } = data;
     const filePath = path.resolve(UPLOAD_DIR, `${filename}`);
     await mergeFileChunk(filePath, filename);
     res.end(
       JSON.stringify({
         code: 0,
         message: "file merged success"
       })
     );
   }

});

server.listen(5000, () => console.log("正在监听 5000 端口"));
```

由于前端在发送合并请求时会携带文件名，服务端根据文件名可以找到上一步创建的切片文件夹
