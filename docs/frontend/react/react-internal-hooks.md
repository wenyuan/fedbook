# React Hooks（内置）

React 内置提供了一些 Hooks，这里仅整理常用的几个。

## useState

useState 这个 Hook 是用来管理 state 的，它可以让函数组件具有维持状态的能力。

也就是说，在一个函数组件的多次渲染之间，这个 state 是共享的。

### 用法示例

```jsx {5}
import React, { useState } from 'react';

function Example() {
  // 创建一个保存 count 的 state，并给初始值 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
}
```

第五行中，`count` 是这个 state 的变量名，`setCount` 是设置这个 state 值的函数。当调用 `setCount` 时，`count` 这个 state 就会被更新，并触发组件的刷新。

用法总结：

* `useState(initialState)` 的参数 `initialState` 是创建 state 的初始值，它可以是任意类型，比如数字、对象、数组等等。
* `useState()` 的返回值是一个数组，有两个元素，一般通过数组的解构赋值来获取。
  * 第一个元素用来读取 state 的值。
  * 第二个元素用来设置这个 state 的值。
  * 注意点：state 的变量是只读的，必须通过第二个元素（方法）来设置它的值。

### 和类组件区别

`useState` 就和类组件中的 `setState` 使用场景是一样的，区别在于：

* 类组件中的 state 只能有一个，所以一般都是把一个对象作为一个 state，然后再通过对象内部不同的属性来表示不同的状态。
* 函数组件中用 `useState` 则可以很容易地创建多个 state，所以它更加语义化。

如果要创建多个 state，那么我们就需要多次调用 `useState`：

```jsx
// 定义一个年龄的 state，初始值是 42
const [age, setAge] = useState(42);
// 定义一个水果的 state，初始值是 banana
const [fruit, setFruit] = useState('banana');
// 定一个一个数组 state，初始值是包含一个 todo 的数组
const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
```

### 使用场景

要遵循的一个原则：state 中永远不要保存可以通过计算得到的值。否则容易造成一致性问题。

比如：

* 从 props 传递过来的值。有时候 props 传递过来的值无法直接使用，而是要通过一定的计算后再在 UI 上展示，比如说排序。那么我们要做的就是每次用的时候，都重新排序一下，或者利用某些 cache 机制，而不是将结果直接放到 state 里。
* 从 URL 中读到的值。比如有时需要读取 URL 中的参数，把它作为组件的一部分状态。那么我们可以在每次需要用的时候从 URL 中读取，而不是读出来直接放到 state 里。
* 从 cookie、localStorage 中读取的值。通常来说，也是每次要用的时候直接去读取，而不是读出来后放到 state 里。

### 弊端

state 虽然便于维护状态，但也有自己的弊端。一旦组件有自己状态，意味着组件如果重新创建，就需要有恢复状态的过程，这通常会让组件变得更复杂。

比如一个组件想在服务器端请求获取一个用户列表并显示，如果把读取到的数据放到本地的 state 里，那么每个用到这个组件的地方，就都需要重新获取一遍。

解决方案就是通过一些状态管理框架，去管理所有组件的 state。

## useEffect

useEffect 这个 Hook 用于处理组件中的 effect，通常用来修改函数外部的某个变量、发起一个请求等等。

狭义上可以先理解为 created、update、destroyed 生命周期。

也就是说，在函数组件的当次执行过程中，useEffect 中代码的执行是不影响渲染出来的 UI 的。

### 用法示例

useEffect 可以接收两个参数：

```jsx
useEffect(callback, dependencies)
```

* 第一个参数为要执行的函数 `callback`，
* 第二个参数是可选的依赖项数组 `dependencies`。
  * 可选值，如果不指定，那么 `callback` 就会在每次函数组件执行完后都执行；如果指定了，那么只有依赖项中的值发生变化的时候，它才会执行。
  * 有点类似于 Vue 中的 `watch`。
  * 依赖项是否发生变化是通过浅比较来判断的，要注意数组或对象类型，如果每次都是新建的数组或对象，即使值相等但也表示发生了变化。

举个例子，某个组件用于显示一篇 Blog 文章，那么这个组件会接收一个参数来表示 Blog 的 ID。而当 ID 发生变化时，组件需要发起请求来获取文章内容并展示：

```jsx
import React, { useState, useEffect } from "react";

function BlogView({ id }) {
  // 设置一个本地 state 用于保存 blog 内容
  const [blogContent, setBlogContent] = useState(null);

  useEffect(() => {
    // useEffect 的 callback 要避免直接的 async 函数，需要封装一下
    const doAsync = async () => {
      // 当 id 发生变化时，将当前内容清楚以保持一致性
      setBlogContent(null);
      // 发起请求获取数据
      const res = await fetch(`/blog-content/${id}`);
      // 将获取的数据放入 state
      setBlogContent(await res.text());
    };
    doAsync();
  }, [id]); // 使用 id 作为依赖项，变化时则执行副作用

  // 如果没有 blogContent 则认为是在 loading 状态
  const isLoading = !blogContent;
  return <div>{isLoading ? "Loading..." : blogContent}</div>;
}
```

### 和类组件区别

对应到 Class 组件，那么 useEffect 可以类似等价于 ComponentDidMount、componentDidUpdate 和 componentWillUnmount 三个生命周期方法。

但不是完全等价的：

* 回调函数跟 componentDidUpdate 区别
  * useEffect 接收的回调函数（callback），只有在依赖项变化时才被执行。这样设计的好处是不需要手动判断某个状态是否发生变化，然后再执行特定的逻辑。
  * 类组件的 componentDidUpdate 则一定会执行。
* 回调函数返回的函数跟 componentWillUnmount 区别
  * useEffect 中返回的函数（一般用于清理工作），不只是会在组件销毁时执行，它在每次 Effect 重新执行之前都会执行。因此只是清理当前执行的 Effect 本身，也就是说它的作用是用于清理上一次 Effect 的结果。
  * 类组件的 componentWillUnmount 只在组件销毁时才会执行。

### 特殊用法

#### 依赖项的特殊值

* 如果没有依赖项，则每次 `render` 后都会重新执行。例如：

```jsx
useEffect(() => {
  // 每次 render 完一定执行
  console.log('re-rendered');
});
```

* 如果依赖项为空数组，则只在首次执行时触发，对应到 Class 组件就是 componentDidMount。例如：

```jsx
useEffect(() => {
  // 组件首次渲染时执行，等价于 class 组件中的 componentDidMount
  console.log('did mount');
}, [])
```

#### 回调函数返回值

useEffect 的第一个参数还允许返回一个函数，用于在组件销毁的时候做一些清理的操作。比如移除事件的监听，这个机制就几乎等价于类组件中的 componentWillUnmount。

例如在组件中，我们需要监听窗口的大小变化，以便做一些布局上的调整：

```jsx
// 设置一个 size 的 state 用于保存当前窗口尺寸
const [size, setSize] = useState({});
useEffect(() => {
  // 窗口大小变化事件处理函数
  const handler = () => {
    setSize(getSize());
  };
  // 监听 resize 事件
  window.addEventListener('resize', handler);

  // 返回一个 callback 在组件销毁时调用
  return () => {
    // 移除 resize 事件
    window.removeEventListener('resize', handler);
  };
}, []);
```

### 使用场景

useEffect 一般在下面四种时机去执行一个回调函数产生副作用（副作用：与 UI 渲染无关的作用）：

* 每次 `render` 后执行：不提供第二个依赖项参数。比如 `useEffect(() => {})`。
* 仅第一次 `render` 后执行：提供一个空数组作为依赖项。比如 `useEffect(() => {}, [])`。
* 第一次以及依赖项发生变化后执行：提供依赖项数组。比如 `useEffect(() => {}, [deps])`。
* 组件 unmount 后执行：返回一个回调函数。比如 `useEffect() => { return () => {} }, [])`。

## useCallback

useCallback 这个 Hook 用来缓存回调函数。

因为在 React 函数组件中，每一次 UI 的变化，都是通过重新执行整个函数来完成的。而有些定义在函数组件内部的函数（比如事件处理函数）没有必要在多次渲染时每次都重新创建一次。

如果这个事件处理函数还是作为 props 传递给子组件使用的，那么还会造成子组件的重新渲染。

### 用法示例

useCallback 接收两个参数：

```jsx
useCallback(fn, deps)
```

* 第一个参数是定义的回调函数
* 第二个参数是依赖的变量数组

只有当某个依赖变量发生变化时，才会重新声明 `fn` 这个回调函数。

举个例子，下面这个计数器组件：

```jsx
import React, { useState, useCallback } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // 这样写会每次函数组件重新渲染，都会重新创建回调函数
  // const handleIncrement = () => setCount(count + 1);

  // 这样写只有当 count 发生变化时，才会重新创建回调函数
  const handleIncrement = useCallback(
    () => setCount(count + 1),
    [count],
  );
  // ...
  return <button onClick={handleIncrement}>+</button>
}
```

## useMemo

useMemo 这个 Hook 也是为了缓存而设计的。只不过，useCallback 缓存的是一个函数，而 useMemo 缓存的是计算的结果。

### 用法示例

useMemo 接收两个参数：

```jsx
useMemo(fn, deps);
```

* 第一个参数是产生所需数据的一个计算函数
* 第二个参数是依赖的变量数组

通常来说，`fn` 会使用 `deps` 中声明的一些变量来生成一个结果，用来渲染出最终的 UI。

举个例子，对于一个显示用户信息的列表，现在需要对用户名进行搜索，且 UI 上需要根据搜索关键字显示过滤后的用户，那么这样一个功能需要有两个状态：

* 用户列表数据本身：来自某个请求。
* 搜索关键字：用户在搜索框输入的数据。

无论是两个数据中的哪一个发生变化，都需要过滤用户列表以获得需要展示的数据。

如果不使用 useMemo，无论组件为何要进行一次重新渲染，实际上都需要进行一次过滤的操作：

```jsx
import React, { useState, useEffect } from "react";

export default function SearchUserList() {
  const [users, setUsers] = useState(null);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    const doFetch = async () => {
      // 组件首次加载时发请求获取用户数据
      const res = await fetch("https://reqres.in/api/users/");
      setUsers(await res.json());
    };
    doFetch();
  }, []);
  let usersToShow = null;

  if (users) {
    // 无论组件为何刷新，这里一定会对数组做一次过滤的操作
    usersToShow = users.data.filter((user) =>
      user.first_name.includes(searchKey),
    );
  }

  return (
    <div>
      <input
        type="text"
        value={searchKey}
        onChange={(evt) => setSearchKey(evt.target.value)}
      />
      <ul>
        {usersToShow &&
          usersToShow.length > 0 &&
          usersToShow.map((user) => {
            return <li key={user.id}>{user.first_name}</li>;
          })}
      </ul>
    </div>
  );
}
```

实际上只需要在 `users` 或者 `searchKey` 这两个状态中的某一个发生变化时，重新计算获得需要展示的数据就行了。使用 useMemo 以后：

```jsx
//...
// 使用 userMemo 缓存计算的结果
const usersToShow = useMemo(() => {
  if (!users) return null;
  return users.data.filter((user) => {
    return user.first_name.includes(searchKey)
  });
}, [users, searchKey]);
//...
```

这么做以后，既可以避免重复计算，也可以避免子组件的重复渲染。

### useMemo 与 useCallback

useCallback 的功能其实是可以用 useMemo 来实现的。

比如下面利用 useMemo 实现了 useCallback 的功能：

```jsx
const myEventHandler = useMemo(() => {
  // 返回一个函数作为缓存结果
  return () => {
  // 在这里进行事件处理
  }
}, [dep1, dep2]);
```

从本质上来说，它们只是做了同一件事情：建立了一个绑定某个结果到依赖数据的关系。只有当依赖变了，这个结果才需要被重新得到。

## useRef

useRef 这个 Hook 用于在多次渲染之间共享数据。

在类组件中，我们可以定义类的成员变量，以便能在对象上通过成员属性去保存一些数据。但是在函数组件中，是没有这样一个空间去保存数据的。因此 useRef 就是提供这个功能的。

### 用法示例

```jsx
const myRefContainer = useRef(initialValue);
```

可以把 useRef 看作是在函数组件之外创建的一个容器空间。在这个容器上，我们可以通过唯一的 `current` 属性设置一个值，从而在函数组件的多次渲染之间共享这个值。

比如要实现一个计时器组件，包含开始和暂停两个功能。通过 `window.setInterval` 提供计时功能；在用户点击暂停按钮时需要从某个地方读取计数器的引用，然后才能清除定时器，达到暂停计时的目的。

那么这个保存计数器引用的最合适的地方，就是 useRef，因为它可以存储跨渲染的数据。代码如下：

```jsx
import React, { useState, useCallback, useRef } from "react";

export default function Timer() {
  // 定义 time state 用于保存计时的累积时间
  const [time, setTime] = useState(0);

  // 定义 timer 这样一个容器用于在跨组件渲染之间保存一个变量
  const timer = useRef(null);

  // 开始计时的事件处理函数
  const handleStart = useCallback(() => {
    // 使用 current 属性设置 ref 的值
    timer.current = window.setInterval(() => {
      setTime((time) => time + 1);
    }, 100);
  }, []);

  // 暂停计时的事件处理函数
  const handlePause = useCallback(() => {
    // 使用 clearInterval 来停止计时
    window.clearInterval(timer.current);
    timer.current = null;
  }, []);

  return (
    <div>
      {time / 10} seconds.
      <br />
      <button onClick={handleStart}>Start</button>
      <button onClick={handlePause}>Pause</button>
    </div>
  );
}
```

除了存储跨渲染的数据之外，useRef 还有一个重要的功能，就是**保存某个 DOM 节点的引用**。

毕竟在某些场景中，我们也需要获得真实 DOM 节点的引用，所以结合 React 的 `ref` 属性和 useRef 这个 Hook，我们就可以获得真实的 DOM 节点，并对这个节点进行操作。

比如，需要在点击某个按钮时让某个输入框获得焦点：

```jsx
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // current 属性指向了真实的 input 这个 DOM 节点，从而可以调用 focus 方法
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

上面代码中，`ref` 这个属性提供了获得 DOM 节点的能力，并利用 useRef 保存了这个节点的引用。

### useRef 和 useState

使用 useRef 保存的数据一般是和 UI 的渲染无关的，因此当 `ref` 的值发生变化时，不会触发组件的重新渲染，这是 useRef 区别于 useState 的地方。

## useContext

useContext 这个 Hook 用于定义全局状态，它是一种**全局状态管理**的解决方案。

父子组件之间进行数据通信可以通过 props，而跨层次或者同层的组件之间要进行数据的共享，就需要用到全局状态管理。

这个机制是在某个组件开始的组件树上创建一个 Context。这样这个组件树上的所有组件，就都能访问和修改这个 Context 了。在函数组件里，通过 useContext 来管理 Context。

### 用法示例

```jsx
const value = useContext(MyContext);
```

因为一个 Context 是在某个组件为根组件的组件树上的，所以需要先创建一个 Context：

```jsx
const MyContext = React.createContext(initialValue);
```

这里的 `MyContext` 具有一个 `Provider` 的属性，一般是作为组件树的根组件。以主题的切换功能为例：

```jsx
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

// 创建一个 Theme 的 Context
const ThemeContext = React.createContext(themes.light);
function App() {
  // 使用 state 来保存 theme 从而可以动态修改
  const [theme, setTheme] = useState("light");

  // 切换 theme 的回调函数
  const toggleTheme = useCallback(() => {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  }, []);

  // 整个应用使用 ThemeContext.Provider 作为根组件
  return (
    // 使用 themes.dark 作为当前 Context 
    <ThemeContext.Provider value={themes[theme]}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 在 Toolbar 组件中使用一个会使用 Theme 的 Button
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

// 在 Theme Button 中使用 useContext 来获取当前的主题
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{
      background: theme.background,
      color: theme.foreground
    }}>
      I am styled by theme context!
    </button>
  );
}
```

### Context 和全局变量

Context 看起来是一个全局变量，但其实是有数据绑定的作用，当 Context 的数据发生变化时会触发使用这个数据的组件自动刷新。这是全局变量做不到的。

### 弊端

Context 相当于提供了一个定义 React 世界中全局变量的机制，而全局变量则意味着两点：

* 会让调试变得困难，因为你很难跟踪某个 Context 的变化究竟是如何产生的。
* 让组件的复用变得困难，因为一个组件如果使用了某个 Context，它就必须确保被用到的地方一定有这个 Context 的 Provider 在其父组件的路径上。

## Hooks 的使用规则

* 在 `useEffect` 的回调函数中使用的变量，都必须在依赖项中声明。
  * 依赖那里没有传任何参数的话，会每次 `render` 都执行。
  * 依赖项有传值，但是有部分依赖没有传，那么没有传的那部分，数据即使变化也不会执行副作用。
* Hooks 不能出现在条件语句或者循环中，也不能出现在 `return` 之后。
* Hooks 只能在函数组件或者自定义 Hooks 中使用。

## 参考资料

* [Hooks API Reference](https://zh-hans.reactjs.org/docs/hooks-reference.html)

（完）
