import { LOGIN_REQUEST } from '../_actions/ACTIONS';
import { REHYDRATE } from '../wiedly';

const INITIAL_STATE = {
  isFetching: false,
  isAuthenticated: false,
  formErrors: null,
};
// console.log(REHYDRATE);
export default function(
  state = INITIAL_STATE,
  { type, payload },
) {
  switch (type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        isFetching: true,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}
