# Overview

The high level concepts of react


- `view = function(state)` = component in react
- `useState`
- `useEffect`




## Hooks

> "Hooks are functions, but it’s helpful to think of them as unconditional declarations about your component’s needs. You use React features at the top of your component similar to how you import modules at the top of your file." - React docs




## React flow

1. To get data down the tree, use props.
2. To get data back up the tree, use callbacks.
3. For side effects outside of react:
    1. If triggered by an event, put the logic in the event handler.
    2. If synchronizing with an outside system, use useEffect
    3. If you need to preserve a value and it's not related to the view/re-render, then use useRef

