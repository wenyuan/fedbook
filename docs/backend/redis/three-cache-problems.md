# Redis 缓存三大问题

数据缓存是 Redis 最重要的一个场景，缓存的设计包含很多技巧，设计不当将会导致严重的后果。最常见的三大问题就是：

* 缓存穿透
* 缓存雪崩
* 缓存击穿

## 缓存穿透

### 业务背景

设计初衷是这样的：

1. 当业务系统发起某一个查询请求时，首先判断缓存中是否有该数据。
2. 如果缓存中存在，则直接返回数据。
3. 如果缓存中不存在，则再查询数据库，然后返回数据。

### 什么是缓存穿透

查询的数据既不在缓存数据库，也不在数据库。此时就会一直查询数据库，对数据库的访问压力增大。

> 形象的比喻：请求跟拥有穿墙能力一样，直接穿透缓存，直击数据库。

### 缓存穿透的危害

如果有人拿一个压根就不存在的数据去发起海量请求，就会产生大量的请求打到数据库，最终可能会导致数据库由于压力过大而宕掉。

### 缓存穿透的原因

发生缓存穿透的原因有很多，一般为如下两种：

* 程序员的代码设计错误，因为缓存中没有存储空数据的 key，导致每次查询都会将请求打到数据库中去。
* 恶意攻击，故意营造大量不存在的数据请求我们的服务，由于缓存中并不存在这些数据，因此海量请求均落在数据库中，从而可能会导致数据库崩溃。

### 解决方案

一般有两种防止缓存穿透的手段。

#### 1）缓存空数据

之所以发生缓存穿透，是因为缓存中没有存储这些空数据的 key，导致这些请求全都打到数据库上。

那么，我们可以稍微修改一下业务系统的代码，将数据库查询结果为空的 key 也存储在缓存中。当后续又出现该 key 的查询请求时，缓存直接返回 `null`，而无需查询数据库。

缓存空对象会有两个问题：

* 第一，空值做了缓存，意味着缓存层中存了更多的键，需要更多的内存空间（如果是攻击，问题更严重），比较有效的方法是针对这类数据**设置一个较短的过期时间**，让其自动删除。
* 第二，缓存层和存储层的数据会有一段时间窗口的不一致，可能会对业务有一定影响。例如过期时间设置为 5 分钟，如果此时存储层添加了这个数据，那此段时间就会出现缓存层和存储层数据的不一致，此时可以利用消息系统或者其他方式清除掉缓存层中的空对象。

#### 2）BloomFilter

BloomFilter 又称布隆过滤器。

它需要在缓存之前再加一道屏障，里面存储目前数据库中存在的所有 key，如下图所示：

<div style="text-align: center;">
  <svg id="SvgjsSvg1006" width="350" height="354" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1034" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1035" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1038" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1039" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1042" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1043" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1052" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1053" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1062" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1063" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker><marker id="SvgjsMarker1066" markerWidth="14" markerHeight="10" refX="10" refY="5" viewBox="0 0 14 10" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1067" d="M0,0 L14,5 L0,10 L0,0" fill="#323232" stroke="#323232" stroke-width="1"></path></marker></defs><g id="SvgjsG1008" transform="translate(130.5,25)"><path id="SvgjsPath1009" d="M 0 0L 125 0L 125 51L 0 51Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="105px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="14.875" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="16" x="62.5"><tspan id="SvgjsTspan1013" style="text-decoration:;">业务系统</tspan></tspan></text></g></g><g id="SvgjsG1014" transform="translate(145,185.625)"><path id="SvgjsPath1015" d="M 0 27L 48 0L 96 27L 48 54Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1016"><text id="SvgjsText1017" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="76px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="16.645" transform="rotate(0)"><tspan id="SvgjsTspan1018" dy="16" x="48"><tspan id="SvgjsTspan1019" style="text-decoration:;">缓存</tspan></tspan></text></g></g><g id="SvgjsG1020" transform="translate(147,114.375)"><path id="SvgjsPath1021" d="M 0 4Q 0 0 4 0L 88 0Q 92 0 92 4L 92 35.5Q 92 39.5 88 39.5L 4 39.5Q 0 39.5 0 35.5Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1022"><text id="SvgjsText1023" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="72px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.125" transform="rotate(0)"><tspan id="SvgjsTspan1024" dy="16" x="46"><tspan id="SvgjsTspan1025" style="text-decoration:;">BloomFilter</tspan></tspan></text></g></g><g id="SvgjsG1026" transform="translate(130.5,278)"><path id="SvgjsPath1027" d="M 0 0L 125 0L 125 51L 0 51Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"></path><g id="SvgjsG1028"><text id="SvgjsText1029" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="105px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="14.875" transform="rotate(0)"><tspan id="SvgjsTspan1030" dy="16" x="62.5"><tspan id="SvgjsTspan1031" style="text-decoration:;">数据库</tspan></tspan></text></g></g><g id="SvgjsG1032"><path id="SvgjsPath1033" d="M193 77L193 95.1875L193 95.1875L193 110.775" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1034)"></path></g><g id="SvgjsG1036"><path id="SvgjsPath1037" d="M193 154.875L193 169.75L193 169.75L193 182.025" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1038)"></path></g><g id="SvgjsG1040"><path id="SvgjsPath1041" d="M193 240.625L193 258.8125L193 258.8125L193 274.4" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1042)"></path></g><g id="SvgjsG1044" transform="translate(147,234)"><path id="SvgjsPath1045" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1046"><text id="SvgjsText1047" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1048" dy="16" x="60"><tspan id="SvgjsTspan1049" style="text-decoration:;">无</tspan></tspan></text></g></g><g id="SvgjsG1050"><path id="SvgjsPath1051" d="M242 212.625L253.5 212.625L253.5 79.00192378864668" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1052)"></path></g><g id="SvgjsG1054" transform="translate(205,148)"><path id="SvgjsPath1055" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1056"><text id="SvgjsText1057" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1058" dy="16" x="60"><tspan id="SvgjsTspan1059" style="text-decoration:;">有</tspan></tspan></text></g></g><g id="SvgjsG1060"><path id="SvgjsPath1061" d="M256.5 303.5L298.5 303.5L298.5 50.5L259.1 50.5" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1062)"></path></g><g id="SvgjsG1064"><path id="SvgjsPath1065" d="M146 134.125L96.5 134.125L96.5 50.5L126.89999999999998 50.5" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1066)"></path></g><g id="SvgjsG1068" transform="translate(25,88.375)"><path id="SvgjsPath1069" d="M 0 0L 120 0L 120 40L 0 40Z" stroke="none" fill="none"></path><g id="SvgjsG1070"><text id="SvgjsText1071" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="120px" fill="#323232" font-weight="400" align="middle" lineHeight="125%" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="9.375" transform="rotate(0)"><tspan id="SvgjsTspan1072" dy="16" x="60"><tspan id="SvgjsTspan1073" style="text-decoration:;">无</tspan></tspan></text></g></g></svg>
  <p style="text-align:center; color: #888;">（防止缓存穿透 - 布隆过滤器）</p>
</div>

当业务系统有查询请求的时候，首先去 BloomFilter 中查询该 key 是否存在：

* 若不存在，则说明数据库中也不存在该数据，因此缓存都不要查了，直接返回 `null`。
* 若存在，则继续执行后续的流程，先前往缓存中查询，缓存中没有的话再前往数据库中的查询。

这种方法适用于数据命中不高，数据相对固定实时性低（通常是数据集较大）的应用场景，代码维护较为复杂，但是缓存空间占用少。

### 方案比较

上述两种方案都能解决缓存穿透的问题，但使用场景却各不相同。

对于一些恶意攻击，查询的 key 往往各不相同，而且数据巨多。此时，第一种方案就显得提襟见肘了。因为它需要存储所有空数据的 key，而这些恶意攻击的 key 往往各不相同，而且同一个 key 往往只请求一次。因此即使缓存了这些空数据的 key，由于不再使用第二次，因此也起不了保护数据库的作用。

因此，对于**空数据的 key 各不相同、key 重复请求概率低**的场景而言，应该选择第二种方案。而对于**空数据的 key 数量有限、key 重复请求概率较高**的场景而言，应该选择第一种方案。

## 缓存雪崩

### 什么是缓存雪崩

缓存其实扮演了一个保护数据库的角色，它帮数据库抵挡大量的查询请求，从而避免脆弱的数据库受到伤害。

但如果缓存因某种原因发生了宕机，那么原本被缓存抵挡的海量查询请求就会像洪水猛兽一样涌向数据库。此时数据库如果抵挡不了这巨大的压力，它就会崩溃。

这就是缓存雪崩。

> 形象的比喻：城墙被攻破了，缓存不存在了，海量请求就像发生雪崩一样哗啦啦涌向数据库。

### 解决方案

#### 事前

* 使用缓存集群，保证缓存服务的高可用。
* 即使个别缓存节点宕机了，仍然有其他缓存节点可用，依然可以提供缓存服务。

#### 事中

使用 Hystrix，这是一款开源的「防雪崩工具」，通过熔断、降级、限流三个手段来降低雪崩发生后的损失。

它采用命令模式，每一项服务处理请求都有各自的处理器。所有的请求都要经过各自的处理器，处理器会记录当前服务的请求失败率。

* **熔断**：一旦发现当前服务的请求失败率达到预设的值，Hystrix 将会拒绝随后该服务的所有请求，直接返回一个预设的结果。
* **限流**：当经过一段时间后，Hystrix 会放行该服务的一部分请求，再次统计它的请求失败率。
  * 如果此时请求失败率符合预设值，则完全打开限流开关。
  * 如果请求失败率仍然很高，那么继续拒绝该服务的所有请求。
* **降级**：Hystrix 向那些被拒绝的请求直接返回一个预设结果。

#### 事后

* 开启 Redis 持久化机制，尽快恢复缓存集群。
* 一旦重启，就能从磁盘上自动加载数据并恢复内存中的数据

## 缓存击穿

### 什么是缓存击穿

缓存击穿又称热点数据集中失效，往往发生在高并发系统中。

我们一般都会给缓存设定一个失效时间，过了失效时间后，该数据库会被缓存直接删除，从而一定程度上保证数据的实时性。

但是，对于一些请求量极高的热点数据而言，一旦过了有效时间，此刻将会有大量请求直接打在数据库上，从而可能会导致数据库崩溃。

> 形象的比喻：秦时明月里卫庄打铜筋铁骨的无双鬼，趁无双鬼换口气的一瞬间，发动上千次攻击，直接击穿了对方的防御，此时压根就来不及重新架起防御姿态。

### 缓存击穿的危害

造成某一时刻，数据库的请求量过大，容易出现性能瓶颈。

此外，因为缓存击穿大多出现在高并发的场景，那么当这些并发请求查询完成后，都会重复更新缓存。

### 解决方案

#### 1）采用互斥锁

* 缓存击穿一般是多个线程同时去查询数据库的某条数据。
* 当第一个数据库查询请求发起后，就将缓存中该数据上锁；此时到达缓存的其他查询请求将无法查询该字段，从而被阻塞等待。
* 当第一个请求完成数据库查询，并将数据更新值缓存后，释放锁；此时其他被阻塞的查询请求将可以直接从缓存中查到该数据。

当某一个热点数据失效后，只有第一个数据库查询请求发往数据库，其余所有的查询请求均被阻塞，从而保护了数据库。但是，由于采用了互斥锁，其他请求将会阻塞等待，此时系统的吞吐量将会下降。这需要结合实际的业务考虑是否允许这么做。

互斥锁可以避免某一个热点数据失效导致数据库崩溃的问题，而在实际业务中，往往会存在一批热点数据同时失效的场景。那么，对于这种场景该如何防止数据库过载呢？

* 设置不同的失效时间

当我们向缓存中存储这些数据的时候，可以将他们的缓存失效时间错开。这样能够避免同时失效。如：在一个基础时间上加/减一个随机数，从而将这些缓存的失效时间错开。

#### 2）永远不过期

「永远不过期」包含两层意思：

* 从缓存层面来看，确实没有设置过期时间，所以不会出现热点 key 过期后产生的问题，也就是「物理」不过期。
* 从功能层面来看，为每个 value 设置一个逻辑过期时间，当发现超过逻辑过期时间后，会使用单独的线程去构建缓存。

此方法有效杜绝了热点 key 产生的问题，但唯一不足的就是重构缓存期间，会出现数据不一致的情况，这取决于应用方是否容忍这种不一致。

### 方案比较

* 互斥锁：这种方案思路比较简单，但是存在一定的隐患，如果构建缓存过程出现问题或者时间较长，可能会存在死锁和线程池阻塞的风险，但是这种方法能够较好的降低后端存储负载并在一致性上做的比较好。
* 永远不过期：这种方案由于没有设置真正的过期时间，实际上已经不存在热点 key 产生的一系列危害，但是会存在数据不一致的情况，同时代码复杂度会增大。

所以可以分情况选择不同的方案：

* 数据基本不变：热点数据 value 基本不更新时，可以设置成永不过期。
* 数据更新不频繁：缓存刷新流程耗时较少时，可采用互斥锁保证少量的请求能请求到数据库并重新更新缓存，其他的流程等锁释放后才可以访问新缓存。
* 数据更新频繁：采用定时线程，在缓存过期前主动重新构建缓存或延长过期时间，保证所有的请求能一直访问缓存。

## 补充：穿透和击穿的区别

这两个词都带有「穿」字，稍微做一下区分：

* 穿透是针对大面积数据请求，由于它们的 key 在缓存里没有值，就跳过了缓存服务器直接打到了数据库上。
* 击穿是针对一个热点 key，在缓存过期的瞬间，大量的请求击穿了缓存，直接请求数据库，就像在屏障中凿开了一个洞。

（完）
