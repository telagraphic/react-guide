
## react course

- [x] intro
- [x] jsx
- [x] events
- [x] state — useState
- [ ] side effects — useEffect
- [ ] optimizing react
- [ ] hooks
- [ ] ssc


### intro, jsx, components

- two way data binding model and view are bidrectional updates
- view = function(state)
- no side effects, inconsistent outputs
- props.children is we access data in between the tags of a component, it's children
- what is a react element, is an object version of the element for going from jsx to converting from react element to the dom element in the browser
- react components return a react element, then to html elements in the browser

```jsx
import f jsx } from "react/jsx-runtime"
function Component ()
	const element = jsx("h1", {
		className: "header",
		children: "Profile"
	})
	return element
}
```



```javascript

function add (x, y) {
  return * + y
} // definition

add (1, 2) // invocation

function Icon () {
  return ‹svg />
} // component definition

<Icon /> // an element, not a component or component element, jsx function turns the component into html element
```



### events



```jsx

// Do
<button onClick={handleClick}>
Passing a Reference c
</button>
// Don't
<button onClick={handleClick()}>
Passing an Invocation
</button>
```



### state


```jsx

const stateArray = React.usestate("initial state value");

const state = stateArray[0];
const setState = stateArray[1];

// or 

const [ state, setstate ] = React. useState("initial state value")

console.log(state) // "initial state value"
setstate("new state value")

```



```jsx
import * as React from "react";
export default function App() {

	const [mode, setMode] = React.useState("dark");
	const handleDarkMode = () => {
		setMode("dark");
	};

	const handleLightMode = () => {
		setMode("light");
	};

return (
	<main className={mode}>
		{mode === "light" ? (
		<button onClick={handleDarkMode}>Activate Dark Mode</button> ) : (
		<button onClick={handleLightMode}>Activate Light Mode</button>
	)}
	</main>
	);
}
```



