import { Dispatch } from '../wiedly';

import { LOGIN_REQUEST } from './ACTIONS';

export function handle_LoginRequest() {
  Dispatch({ type: LOGIN_REQUEST });
}
