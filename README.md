# Wieldy

Wieldy is an alternative to using Redux.
It makes everything a lot easier!

## Installation

Use the package manager [NPM](https://www.npmjs.com/package/wieldy) to install Wieldy.

```bash
npm i wieldy
```

## Usage

```javascript
import {CreateStore, Dispatch, Provider, Connect, GetState, Subscribe} from 'wieldy';
...
// Create your action types
export const LOGIN_REQUEST = 'LOGIN_REQUEST'
...
// Create your reducers with initial state
const INITIAL_STATE = {
    login: {
        isFetching: false,
        isAuthenticated: false,
        formErrors: null,
    },
};
export default function(state = INITIAL_STATE, { type, payload }) {
  switch (type) {
    case LOGIN_REQUEST:
      return {
          ...state,
          login: {
            isFetching: true,
            isAuthenticated: false,
          },
      };
    default:
      return state;
  }
}
...
// Create the store with your reducers
const reducers = { Auth };
createStore(reducers);
...
// Dispatch inside the actions
export const handle_LoginRequest = () => {
  Dispatch({ type: LOGIN_REQUEST });
};
...
// Wrap your main APP inside the Provider
export default function App() {
  return (
    <Provider>
      <MyComponent />
    </Provider>
  );
}
...
// Connect your components
function MyComponent(props) {
  return (
    <div>
      <h1>Login</h1>
      <h2>{props.state.isFetching}</h2>
      <button onClick={handle_LoginRequest}>Request Login</button>
    </div>
  );
}
export default Connect(
  state => ({state: state.Auth.login}),
  MyComponent,
);
...
// Subscribe to trigger a callback on state change
const Unsubscribe = Subscribe((state)=>console.log('State was changed'))
// Callback gets the state as an argument
...
// You can also call GetState() manually to get the complete State
GetState()
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
