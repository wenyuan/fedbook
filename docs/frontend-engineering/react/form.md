# React 表单知识点

## 受控组件和非受控组件

React 中对表单组件的处理分为两种：受控组件和非受控组件。

* **受控组件**：组件的 `value` 属性与 React 中的状态绑定，组件内声明了 `onChange` 事件结合 `setState()` 来处理 `value` 的变化。
  * 例如 `<input value={value} onChange={handleChange} />`
  * React 没有类似 Vue 里 `v-model` 这种双向绑定功能，我们不能通过一个指令能够将数据和输入框结合起来，用户在输入框中输入内容，然后数据同步更新。
* **非受控组件**：更像是传统的 HTML 表单元素，数据存储在 DOM 中，而不是组件内部，获取数据的方式是通过 `ref` 引用。
  * 例如 `<input ref={eleRef} />` 

## 受控组件的用法

```jsx
import { useState, useCallback } from 'react';

function MyForm() {
  const [value, setValue] = useState('');
  const handleChange = useCallback(evt => {
    setValue(evt.target.value);
  }, []);
  return <input value={value} onChange={handleChange} />;
}
```

* 输入框的值是由传入的 `value` 属性决定
* 在 `onChange` 的事件处理函数中，设置 `value` 这个状态的值，这样输入框就显示了用户的输入。

但这种方式有性能问题。用户每输入一个字符，React 的状态都会发生变化，那么整个组件就会重新渲染。如果表单比较复杂，那么每次都重新渲染就可能会引起输入的卡顿。在这个时候，可以考虑将一些表单元素使用非受控组件去实现，从而避免性能问题。

## 非受控组件的用法

```jsx
import { useRef } from "react";

export default function MyForm() {
  // 定义一个 ref 用于保存 input 节点的引用
  const inputRef = useRef();
  const handleSubmit = (evt) => {
    evt.preventDefault();
    // 使用的时候直接从 input 节点获取值
    alert("Name: " + inputRef.current.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" ref={inputRef} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
```

input 的输入过程对整个组件状态没有任何影响，自然也就不会导致组件的重新渲染。

缺点是输入过程因为没有对应的状态变化，因此无法实现动态地根据用户输入做 UI 上的调整。这是因为所有的用户输入都是 input 这个组件的内部状态，没有任何对外的交互。

## 使用 Hooks 简化表单处理

对受控组件的处理中，每个表单元素都要设置一个 state 来绑定 `value` 值，还要监听表单元素的 `onChange` 事件，将值的变化同步到 state，比较繁琐。

于是可以用 Hooks 实现逻辑的重用，主要思想就是用一个 Hook 去维护整个表单的状态，并提供根据名字去取值和设值的方法，从而方便表单在组件中的使用。

该 Hook 的简单实现：

```jsx
import { useState, useCallback } from "react";

const useForm = (initialValues = {}) => {
  // 设置整个 form 的状态：values
  const [values, setValues] = useState(initialValues);
  
  // 提供一个方法用于设置 form 上的某个字段的值
  const setFieldValue = useCallback((name, value) => {
    setValues((values) => ({
      ...values,
      [name]: value,
    }));
  }, []);

  // 返回整个 form 的值以及设置值的方法
  return { values, setFieldValue };
};
```

这样就不用很繁琐地为每个表单元素单独设置状态了，可以这样使用该 Hook：

```jsx
import { useCallback } from "react";
import useForm from './useForm';

export default () => {
  // 使用 useForm 得到表单的状态管理逻辑
  const { values, setFieldValue } = useForm();
  // 处理表单的提交事件
  const handleSubmit = useCallback(
    (evt) => {
      // 使用 preventDefault() 防止页面被刷新
      evt.preventDefault();
      console.log(values);
    },
    [values],
  );
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name: </label>
        <input
          value={values.name || null}
          onChange={(evt) => setFieldValue("name", evt.target.value)}
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          value={values.email || null}
          onChange={(evt) => setFieldValue("email", evt.target.value)}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};
```

通过将表单状态管理的逻辑提取出来，使之成为一个通用的 Hook，这样就简化了在 React 中使用表单的逻辑。

很多开源的表单方案都是基于这么一个核心的原理：**把表单的状态管理单独提取出来，成为一个可重用的 Hook**。这样在表单的实现组件中，我们就只需要更多地去关心 UI 的渲染，而无需关心状态是如何存储和管理的，从而方便表单组件的开发。

## 使用 Hooks 处理表单验证

表单验证也是一个表单处理必备的业务逻辑。

基于上面的 `useForm` 这个 Hook 增加验证的 API 接口：

```jsx
// 除了初始值之外，还提供了一个 validators 对象，
// 用于提供针对某个字段的验证函数
const useForm = (initialValues = {}, validators) => {
  const [values, setValues] = useState(initialValues);
  // 定义了 errors 状态
  const [errors, setErrors] = useState({});

  const setFieldValue = useCallback(
    (name, value) => {
      setValues((values) => ({
        ...values,
        [name]: value,
      }));

      // 如果存在验证函数，则调用验证用户输入
      if (validators[name]) {
        const errMsg = validators[name](value);
        setErrors((errors) => ({
          ...errors,
          // 如果返回错误信息，则将其设置到 errors 状态，否则清空错误状态
          [name]: errMsg || null,
        }));
      }
    },
    [validators],
  );
  // 将 errors 状态也返回给调用者
  return { values, errors, setFieldValue };
};
```

在使用的时候传递下面的 `validators` 对象给 `useForm` 这个 Hook：

```jsx
function MyForm() {
  // 用 useMemo 缓存 validators 对象
  const validators = useMemo(() => {
    return {
      name: (value) => {
        // 要求 name 的长度不得小于 2
        if (value.length < 2) return "Name length should be no less than 2.";
        return null;
      },
      email: (value) => {
        // 简单的实现一个 email 验证逻辑：必须包含 @ 符号。
        if (!value.includes("@")) return "Invalid email address";
        return null;
      },
    };
  }, []);
  // 从 useForm 的返回值获取 errors 状态
  const { values, errors, setFieldValue } = useForm({}, validators);
  // UI 渲染逻辑...
}
```

这样就将表单验证的逻辑也封装到了通用的 `useForm` 这个 Hook 中了。

虽然这个 API 只支持通过函数执行进行验证，但是能很容易扩展支持更多的类型，比如正则匹配、值范围等等。

（完）
