# React Hooks（自定义）

Hooks 的两个核心优点：

* 方便进行逻辑复用
* 帮助关注分离

## 创建规则

创建自定义 Hooks 的规则：

* 名字一定是以 `use` 开头的函数，这样 React 才能够知道这个函数是一个 Hook。
* 函数内部一定调用了其它的 Hooks，可以是内置的 Hooks，也可以是其它自定义 Hooks。否则也只能算是一个普通函数。

下面是四个典型的业务场景。

## 抽取业务逻辑

一个简单的计数器的实现，如果把业务逻辑都写在函数组件内部，是这样的：

```jsx
import { useState, useCallback } from 'react';
 
function useCounter() {
  // 定义 count 这个 state 用于保存当前数值
  const [count, setCount] = useState(0);
  // 实现加 1 的操作
  const increment = useCallback(() => setCount(count + 1), [count]);
  // 实现减 1 的操作
  const decrement = useCallback(() => setCount(count - 1), [count]);
  // 重置计数器
  const reset = useCallback(() => setCount(0), []);
  
  // 将业务逻辑的操作 export 出去供调用者使用
  return { count, increment, decrement, reset };
}
```

那么就可以把业务逻辑提取出来成为一个 Hook，变成这样：

```jsx
import { useState, useCallback } from 'react';
 
function useCounter() {
  // 定义 count 这个 state 用于保存当前数值
  const [count, setCount] = useState(0);
  // 实现加 1 的操作
  const increment = useCallback(() => setCount(count + 1), [count]);
  // 实现减 1 的操作
  const decrement = useCallback(() => setCount(count - 1), [count]);
  // 重置计数器
  const reset = useCallback(() => setCount(0), []);
  
  // 将业务逻辑的操作 export 出去供调用者使用
  return { count, increment, decrement, reset };
}
```

有了这个 Hook，就可以在原先的函数组件中使用它：

```jsx
import React from 'react';

function Counter() {
  // 调用自定义 Hook
  const { count, increment, decrement, reset } = useCounter();

  // 渲染 UI
  return (
    <div>
      <button onClick={decrement}> - </button>
      <p>{count}</p>
      <button onClick={increment}> + </button>
      <button onClick={reset}> reset </button>
    </div>
  );
}
```

上面的代码就是把原来在函数组件中实现的逻辑提取了出来，成为一个单独的 Hook，一方面能让这个逻辑得到重用，另外一方面也能让代码更加语义化，并且易于理解和维护。

扩展一下：现在是固定让数字每次加一。假如要允许灵活配置点击加号时应该加几，比如说每次加 `10`，可以这样实现：

```jsx
import { useState, useCallback } from 'react';

// Hooks 作为普通函数，是可以传递任何参数的
const useCounter = (step) => {
  const [counter, setCounter] = useState(0);
  const increment = useCallback(() => setCounter(counter + step), [counter, step]);
  const decrement = useCallback(() => setCounter(counter - step), [counter, step]);
  const reset = useCallback(() => setCounter(0), []);
  
  return {counter, increment, decrement, reset};
}

export default useCounter;
```

## 封装通用逻辑

一个常见的需求：发起异步请求获取数据并显示在界面上。

通常都会遵循下面步骤：

* 创建 `data`，`loading`，`error` 这 3 个 state。
* 请求发出后，设置 `loading` state 为 `true`。
* 请求成功后，将返回的数据放到某个 state 中，并将 `loading` state 设为 `false`。
* 请求失败后，设置 `error` state 为 `true`，并将 `loading` state 设为 `false`。

最后基于 `data`、`loading`、`error` 这 3 个 state 的数据，UI 就可以正确地显示数据，或者将 loading、error 这些反馈给用户。

通过创建一个自定义 Hook，将这样的逻辑提取出来，成为一个可重用的模块：

```jsx
import { useState } from 'react';

const useAsync = (asyncFunction) => {
  // 设置三个异步逻辑相关的 state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 定义一个 callback 用于执行异步逻辑
  const execute = useCallback(() => {
    // 请求开始时，设置 loading 为 true，清除已有数据和 error 状态
    setLoading(true);
    setData(null);
    setError(null);
    return asyncFunction()
      .then((response) => {
        // 请求成功时，将数据写进 state，设置 loading 为 false
        setData(response);
        setLoading(false);
      })
      .catch((error) => {
        // 请求失败时，设置 loading 为 false，并设置错误状态
        setError(error);
        setLoading(false);
      });
  }, [asyncFunction]);

  return { execute, loading, data, error };
};
```

在组件中可以这么使用：

```jsx
import React from "react";
import useAsync from './useAsync';

export default function UserList() {
  // 通过 useAsync 这个函数，只需要提供异步逻辑的实现
  const {
    execute: fetchUsers,
    data: users,
    loading,
    error,
  } = useAsync(async () => {
    const res = await fetch("https://reqres.in/api/users/");
    const json = await res.json();
    return json.data;
  });
  
  return (
    // 根据状态渲染 UI...
    <div className="user-list">...</div>
  );
}
```

封装成自定义 Hook 比起普通工具类的好处：

* 在 Hooks 中，可以管理当前组件的 state，从而将更多的逻辑写在可重用的 Hooks 中。
* 在普通的工具类中是无法直接修改组件 state 的，也就无法在数据改变的时候触发组件的重新渲染。

## 监听浏览器状态

这也是一个常见的需求：

* 界面需要根据窗口大小变化重新布局。
* 在页面滚动时，需要根据滚动条位置，来决定是否显示一个「返回顶部」的按钮。

这都需要用到浏览器的 API 来监听这些状态的变化。以滚动条位置的场景为例，写一个自定义 Hook 来优雅地监听浏览器状态。

```jsx
import { useState, useEffect } from 'react';

// 获取横向，纵向滚动条位置
const getPosition = () => {
  return {
    x: document.body.scrollLeft,
    y: document.body.scrollTop,
  };
};
const useScroll = () => {
  // 定义一个保存滚动条位置的 state 
  const [position, setPosition] = useState(getPosition());
  useEffect(() => {
    const handler = () => {
      setPosition(getPosition(document));
    };
    // 监听 scroll 事件，更新滚动条位置
    document.addEventListener("scroll", handler);
    return () => {
      // 组件销毁时，取消事件监听
      document.removeEventListener("scroll", handler);
    };
  }, []);
  return position;
};
```

有了这个 Hook，就可以非常方便地监听当前浏览器窗口的滚动条位置了。比如「返回顶部」这样一个功能的实现：

```jsx
import React, { useCallback } from 'react';
import useScroll from './useScroll';

function ScrollTop() {
  const { y } = useScroll();

  const goTop = useCallback(() => {
    document.body.scrollTop = 0;
  }, []);

  const style = {
    position: "fixed",
    right: "10px",
    bottom: "10px",
  };
  // 当滚动条位置纵向超过 300 时，显示返回顶部按钮
  if (y > 300) {
    return (
      <button onClick={goTop} style={style}>
        Back to Top
      </button>
    );
  }
  // 否则不 render 任何 UI
  return null;
}
```

Hooks 可以让 React 的组件绑定在任何可能的数据源上，这样当数据源发生变化时，组件能够自动刷新。

这个例子就是组件绑定到当前滚动条的位置数据上。在实际使用中，除了窗口大小、滚动条位置这些状态，还有其它一些数据也可以这样操作，比如 cookies，localStorage, URL，等等。

## 拆分复杂组件

如果一个函数代码特别长，比如超过 500 行，这就变得非常难维护。对于函数组件，方法就是尽量将相关的逻辑做成独立的 Hooks，然后在函数组中使用这些 Hooks，通过参数传递和返回值让 Hooks 之间完成交互。

在这种场景下，拆分逻辑的目的不一定是为了重用，而是仅仅为了业务逻辑的隔离。所以此时不一定要把 Hooks 放到独立的文件中，而是可以和函数组件写在一个文件中，这样反而可以表明这些 Hooks 是和当前函数组件紧密相关的。

以文章列表页面为例：

* 我们需要展示一个文章的列表，并且有一列要显示文章的分类。同时，我们还需要提供表格过滤功能，以便能够只显示某个分类的文章。
* 对应的要用到两个 API：一个用于获取文章的列表，另一个用于获取所有的分类。
* 为了支持过滤功能，需要在前端将文章列表返回的分类 ID 映射到分类的名字，以便显示在列表里。

直观思路是这样的：

```jsx
function BlogList() {
  // 获取文章列表...
  // 获取分类列表...
  // 组合文章数据和分类数据...
  // 根据选择的分类过滤文章...
  
  // 渲染 UI ...
}
```

下面拆分成 4 个 Hooks：

```jsx
import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Select, Table } from "antd";
import _ from "lodash";
import useAsync from "./useAsync";

const endpoint = "https://myserver.com/api/";
const useArticles = () => {
  // 使用上面创建的 useAsync 获取文章列表
  const { execute, data, loading, error } = useAsync(
    useCallback(async () => {
      const res = await fetch(`${endpoint}/posts`);
      return await res.json();
    }, []),
  );
  // 执行异步调用
  useEffect(() => execute(), [execute]);
  // 返回语义化的数据结构
  return {
    articles: data,
    articlesLoading: loading,
    articlesError: error,
  };
};
const useCategories = () => {
  // 使用上面创建的 useAsync 获取分类列表
  const { execute, data, loading, error } = useAsync(
    useCallback(async () => {
      const res = await fetch(`${endpoint}/categories`);
      return await res.json();
    }, []),
  );
  // 执行异步调用
  useEffect(() => execute(), [execute]);

  // 返回语义化的数据结构
  return {
    categories: data,
    categoriesLoading: loading,
    categoriesError: error,
  };
};
const useCombinedArticles = (articles, categories) => {
  // 将文章数据和分类数据组合到一起
  return useMemo(() => {
    // 如果没有文章或者分类数据则返回 null
    if (!articles || !categories) return null;
    return articles.map((article) => {
      return {
        ...article,
        category: categories.find(
          (c) => String(c.id) === String(article.categoryId),
        ),
      };
    });
  }, [articles, categories]);
};
const useFilteredArticles = (articles, selectedCategory) => {
  // 实现按照分类过滤
  return useMemo(() => {
    if (!articles) return null;
    if (!selectedCategory) return articles;
    return articles.filter((article) => {
      console.log("filter: ", article.categoryId, selectedCategory);
      return String(article?.category?.name) === String(selectedCategory);
    });
  }, [articles, selectedCategory]);
};

const columns = [
  { dataIndex: "title", title: "Title" },
  { dataIndex: ["category", "name"], title: "Category" },
];

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  // 获取文章列表
  const { articles, articlesError } = useArticles();
  // 获取分类列表
  const { categories, categoriesError } = useCategories();
  // 组合数据
  const combined = useCombinedArticles(articles, categories);
  // 实现过滤
  const result = useFilteredArticles(combined, selectedCategory);

  // 分类下拉框选项用于过滤
  const options = useMemo(() => {
    const arr = _.uniqBy(categories, (c) => c.name).map((c) => ({
      value: c.name,
      label: c.name,
    }));
    arr.unshift({ value: null, label: "All" });
    return arr;
  }, [categories]);

  // 如果出错，简单返回 Failed
  if (articlesError || categoriesError) return "Failed";

  // 如果没有结果，说明正在加载
  if (!result) return "Loading...";

  return (
    <div>
      <Select
        value={selectedCategory}
        onChange={(value) => setSelectedCategory(value)}
        options={options}
        style={{ width: "200px" }}
        placeholder="Select a category"
      />
      <Table dataSource={result} columns={columns} />
    </div>
  );
}
```

这样就把一个较为复杂的逻辑拆分成一个个独立的 Hook 了，不仅隔离了业务逻辑，也让代码在语义上更加明确。比如说有 `useArticles`、`useCategories` 这样与业务相关的名字，就非常易于理解。

在实际的开发中，对于 API 返回的数据需要做一些数据的转换，进行数据的缓存，等等。这时就要避免把这些逻辑都放到一起，一个好的方案就是拆分到独立的 Hooks，以免产生过于复杂的组件。

（完）
