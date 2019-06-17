import React from 'react';
import { CreateStore, GetState } from './wiedly';
import auth from './_reducers/auth';

import { handle_LoginRequest } from './_actions/auth';
const reducers = { auth };

CreateStore(reducers, {
  persistor: true,
  debug: true,
  key: 'test',
});

export default function App() {
  return <div>Hello World</div>;
}

console.log('Before state', GetState());
handle_LoginRequest();
console.log('After state', GetState());
