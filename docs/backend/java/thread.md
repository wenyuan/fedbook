# 多线程

> 进程和线程的基本概念在 Python 里梳理过了，此处不再赘述，直接整理用法。

## 多线程的实现

在 Java 中，每个线程对象都是由 Thread 类实例化得来的，目前 Java 给我们提供了多种构建线程对象的方式，包括继承 Thread 类、实现 Runnable 接口、实现 Callable 接口、Lambda 表达式、使用 Executor 框架等方式。

### 继承 Thread 类

继承 Thread 类是创建线程的最简单方式，只需要继承 `Thread` 类并重写 `run()` 方法即可，`run()` 方法中包含了该线程的核心执行逻辑，如下所示：

```java
// 自定义线程，继 承Thread 实现多线程
class MyThread extends Thread {
    private String name;

    public MyThread(String name) {
        this.name=name;
    }

    // 当线程启动的时候，会执行 run 方法中的代码
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("当前线程："+name+"输出:  "+i);
            try {
                sleep((int) (Math.random() * 10));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

然后就可以创建 `MyThread` 对象并调用 `start()` 方法来启动线程了，如下所示：

```java
public class Main {
    public static void main(String[] args) {
        // 创建线程对象
        MyThread mTh1 = new MyThread("A");
        MyThread mTh2 = new MyThread("B");
        // 启动线程
        mTh1.start();
        mTh2.start();

        // main 方法所在的类，属于默认的主线程
        System.out.println("主线程："+Thread.currentThread());
    }
}
```

> 说明：  
> 程序在启动 `main` 函数时，Java 虚拟机就已经启动了一个主线程来运行 `main` 函数。  
> 在调用到 `mTh1`，`mTh2` 的 `start` 方法时，就相当于有三个线程在同时工作了，这就是多线程的模式。  
> 子线程中有 `sleep()` 方法，`Thread.sleep()` 调用目的是不让当前线程独自霸占该进程所获取的 CPU 资源，留出一定时间给其他线程执行的机会。

从多次执行的输出结果来看，所有的线程执行顺序都是不确定的，CPU 资源的获取完全是看两个线程之间谁先抢占上谁就先运行。

注意：

+ Java 中的类，默认情况下都属于主线程。
+ 一个线程对象只能调用一次 start() 方法，从而启动一个线程。

### 实现 Runnable 接口

创建线程的第二种常用方式是通过实现 `Runnable` 接口，这种方式避免了 Java 单继承的限制，可以让我们同时实现多个接口。

在实现 `Runnable` 接口后，需要实现 `run()` 方法，并在该方法中实现核心业务，代码如下所示：

```java
public class MyRunnable implements Runnable {
    private String name;

    public MyRunnable(String name) {
        this.name=name;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("当前线程："+name+"输出:  "+i);
            try {
                Thread.sleep((int) (Math.random() * 10));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

在实现了 `Runnable` 接口之后，接下来我们就要把 `Thread` 线程对象创建出来了，如下所示：

```java
public class Main {
    public static void main(String[] args) {
        // 创建线程对象，注意这种方式要把 Runnale 对象作为 Thread 的参数
        Thread th1 = new Thread(new MyRunnable("A"));
        Thread th2 = new Thread(new MyRunnable("B"));
        // 启动线程
        th1.start();
        th2.start();

        // main 方法所在的类，属于默认的主线程
        System.out.println("主线程："+Thread.currentThread());
    }
}
```

整体和继承 `Thread` 差别不大，因为在 `Thread` 类中也是实现的 `Runnable` 接口。

> 说明：  
> 不管是继承 `Thread` 类还是实现 `Runnable` 接口来实现多线程，最终都是通过 `Thread` 的对象的 API 来控制线程的，因此熟悉 `Thread` 类的 API 是进行多线程编程的基础。

### Lambda 表达式

这是 Java 8 中引入的一种新的方式来创建线程，也就是使用 Lambda 表达式来实现 `Runnable` 接口的 `run()` 方法，代码如下：

```java
public static void main(String[] args) {
    Thread t = new Thread(() -> {
        System.out.println("start new thread!");
    });
    // 启动新线程
    t.start(); 
}
```

这种方式简化了线程的创建过程，提高了代码的可读性和可维护性。

### 实现 Callable 接口

除了可以通过实现 `Runnable` 接口来创建线程之外，还可以通过实现 `Callable` 接口结合 `Future` 来创建线程。

与 `Runnable` 接口不同的是，`Callable` 接口可以返回线程的执行结果，我们可以通过该接口中的 `call()` 方法返回执行结果，在调用时通过 `Future` 接口来获取到最终的执行结果。比如下面的例子：

```java
import java.util.concurrent.Callable;
public class MyCallable implements Callable<String> {
    private String name;

    public MyCallable(String name) {
        this.name = name;
    }

    @Override
    public String call() throws Exception {
        // 执行业务方法，可以在该方法中返回结果
        // 此处模拟任务执行
        Thread.sleep((int) (Math.random() * 3000));
        return "任务 " + name + " 完成";
    }
}
```

在实现 `Callable` 接口时，需要通过泛型指明 `call()` 方法要返回的结果类型。

接下来创建出对应的线程对象，代码如下：

```java
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class Main {
    public static void main(String[] args) {
        // 创建线程对象，注意这种方式是通过 Executors 线程池创建出来的
        ExecutorService executorService = Executors.newSingleThreadExecutor();

        try {
            //将 Callable 作为参数传入 submit() 方法中，得到一个 Future 对象
            Future<String> future = executorService.submit(new MyCallable("A"));
            // 获取执行结果，设置超时时间为 5 秒
            String result = future.get(5, TimeUnit.SECONDS);
            System.out.println("执行结果："+result);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            e.printStackTrace();
        } finally {
            // 关闭线程池
            executorService.shutdown();
        }
    }
}
```

上面用到的 `Executors`、`ExecutorService`、`Future` 等 API，都是和线程池有关的内容。

### 使用 Executor 框架

除了以上创建线程的方式之外，我们还可以利用 Executor 线程池框架进行线程的创建与管理。所谓的线程池，就是包含了一定数量线程的「集合」，当需要执行任务时，线程池中的线程会自动分配任务并执行。线程池技术可以避免频繁地创建和销毁线程对象，提高了程序的性能。

在 Java 中，Executor 就是一种线程池框架，它可以把线程的创建和执行分离开，提高了程序的可扩展性和可维护性，所以使用 Executor 框架就可以简化线程的管理。

另外 ExecutorService 是 Java 中用于管理线程池的接口，它提供了提交任务、管理任务、管理线程池等方法。下面是利用 Executor 框架创建线程的案例：

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) {
        // 通过 Executors 线程池框架创建一个固定大小的线程池
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        // 执行线程池中的线程
        executorService.execute(new Runnable() {
            @Override
            public void run() {
                System.out.println("当前线程："+Thread.currentThread());
            }
        });

        //关闭线程池
        executorService.shutdown();
    }
}
```

> 注意：  
> `shutdown()` 方法用于关闭线程池。一旦调用，线程池会停止接收新的任务，已经提交但未执行的任务会继续执行，直到所有的任务都执行完毕后线程池才会真正的关闭，释放资源。  

## 区别

主要是 **继承 `Thread` 类** 与 **实现 `Runnable` 接口**，这两种创建线程方式的区别：

+ 当继承 `Thread` 类时，我们需要重写 `Thread` 类的 `run()` 方法，并通过调用 `start()` 方法来启动线程。
+ 当实现 `Runnable` 接口时，需要实现 `Runnable` 接口中的 `run()` 方法，并通过创建 `Thread` 对象，并将其传递给 Runnable 对象来启动线程。
+ 两种方式的主要区别在于继承 `Thread` 类只能单继承，而实现 `Runnable` 接口可以避免单继承的限制，适用于多个线程执行相同任务的情况。
+ 实现 `Runnable` 接口的方式还可以方便地使用线程池，实现线程的复用；而继承 `Thread` 类的方式则需要手动实现线程池的功能。

## 常用函数说明

### sleep(long millis)

作用：在指定的毫秒数内让当前正在执行的线程休眠（暂停执行），从而让出 CPU 的使用，目的是不让当前线程独自霸占该进程所获的 CPU 资源，以留一定时间给其他线程执行的机会。

`sleep()` 是 `Thread` 类的静态方法，因此他不能改变对象的机锁，所以当在一个 Synchronized 块中调用 `sleep()` 方法时，线程虽然休眠了，但是对象的锁并木有被释放，其他线程无法访问这个对象（即使睡着也持有对象锁）。

### join()

作用：等待一个线程执行完毕。

当一个线程调用另一个线程的 `join()` 方法时，当前线程会进入等待状态，直到被调用的线程执行完毕。这使得我们可以控制线程的执行顺序，确保某些关键线程在其他线程之前完成执行。

例如：主线程生成并起动了子线程，如果子线程里要进行大量的耗时的运算，主线程往往将于子线程之前结束，但是如果主线程处理完其他的事务后，需要用到子线程的处理结果，也就是主线程需要等待子线程执行完成之后再结束，这个时候就要用到 `join()` 方法了。

对于这个线程类：

```java
public class MyRunnable implements Runnable {
    private String name;

    public MyRunnable(String name) {
        this.name=name;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("当前线程："+name+"输出:  "+i);
            try {
                Thread.sleep((int) (Math.random() * 10));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

调用时不加 `join()` 方法：

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("主线程："+Thread.currentThread().getName()+" 开始运行");

        // 创建线程对象，注意这种方式要把 Runnale 对象作为 Thread 的参数
        Thread th1 = new Thread(new MyRunnable("A"));
        Thread th2 = new Thread(new MyRunnable("B"));
        // 启动线程
        th1.start();
        th2.start();

        System.out.println("主线程："+Thread.currentThread().getName()+" 运行结束");
    }
}
```

调用时加 `join()` 方法：

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("主线程："+Thread.currentThread().getName()+" 开始运行");

        // 创建线程对象，注意这种方式要把 Runnale 对象作为 Thread 的参数
        Thread th1 = new Thread(new MyRunnable("A"));
        Thread th2 = new Thread(new MyRunnable("B"));
        // 启动线程
        th1.start();
        th2.start();

        try {
            th1.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        try {
            th2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("主线程："+Thread.currentThread().getName()+" 运行结束");
    }
}
```

从输出结果来看，后者主线程一定会等子线程都结束了才会输出「主线程运行结束」的信息。


## SpringBoot 中使用多线程

在使用 SpringBoot 框架时，虽然也可以使用上述 Java 提供的各种方式来实现多线程，但 SpringBoot 本身提供了一些便捷的方法，例如使用 `@Async` 注解，这使得我们可以更方便地处理并发任务和多线程。

首先在项目启动文件中启用异步支持：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

然后创建一个异步服务类：

```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncService {
    @Async
    public void executeAsyncTask() {
        System.out.println("开始执行异步任务");
        try {
            Thread.sleep(2000); // 模拟长时间任务
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("异步任务执行完成");
    }
}
```

最后在控制器或其他类中使用异步服务：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AsyncController {
    @Autowired
    private AsyncService asyncService;

    @GetMapping("/async-task")
    public String startAsyncTask() {
        asyncService.executeAsyncTask();
        return "异步任务已开始";
    }
}
```

通过这种方式，我们可以很方便地在 SpringBoot 中实现多线程，而不需要手动管理线程池或线程。

（完）
