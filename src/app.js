import isEqual from 'lodash/isEqual';
import isFunction from 'lodash/isFunction';
import React from 'react';

const STATE = {};
const SET_STATE_FNS = [];
const REDUCERS = {};
const SUBSCRIBED = [];
const REACT_CONTEXT = React.createContext();

export const GetState = () => STATE;

export function Subscribe(callback) {
  if (!isFunction(callback)) return 0;
  SUBSCRIBED.push(callback);
  const index = SUBSCRIBED.length - 1;
  return () => {
    SUBSCRIBED[index] = () => 0;
    return 1;
  };
}

export function CreateStore(reducers) {
  // if (initialState && !STATE) STATE = initialState;
  // REDUCERS.push(...reducers);
  Object.keys(reducers).forEach(reducer => {
    // For each reducer set default state
    STATE[reducer] = reducers[reducer](undefined, {
      type: null,
    });
    // Add reducer to REDUCERS array
    REDUCERS[reducer] = reducers[reducer];
  });
}

export function Dispatch(PAYLOAD) {
  if (!PAYLOAD.type)
    throw Error('No type passed when calling dispatch');
  let stop = false;
  // Loop over every reducer middleware until a different state is returned
  Object.keys(REDUCERS).forEach(reducer => {
    if (!stop) {
      // State stored
      const reducerState = STATE[reducer];
      // New State returned
      const newState = REDUCERS[reducer](reducerState, PAYLOAD);
      if (isEqual(newState, reducerState)) return 0;
      // If states are different then update
      STATE[reducer] = newState;
      stop = true;
    }
    return 1;
  });
  if (stop) {
    // If state was changed then trigger changes in react
    reactStateUpdate();
  }
}

// Provider wrapper
export class Provider extends React.Component {
  constructor(props) {
    super(props);
    const exportSetState = this.setState.bind(this);
    this.state = addToSetStateFNs(
      exportSetState,
      state => state,
    );
  }

  render() {
    return (
      <REACT_CONTEXT.Provider value={this.state}>
        {this.props.children}
      </REACT_CONTEXT.Provider>
    );
  }
}

// Connect the state to the properties of the component passed
export function Connect(mapStateToProps, Component) {
  const ContextWrapper = originalProps => {
    return (
      <REACT_CONTEXT.Consumer>
        {props =>
          new Component({
            ...mapStateToProps(props),
            ...originalProps,
          })
        }
      </REACT_CONTEXT.Consumer>
    );
  };
  return ContextWrapper;
}

function reactStateUpdate() {
  // Update all states
  SET_STATE_FNS.forEach(setStateFN => {
    const { reactSetState, mapStateToProps } = setStateFN;
    // Update all places where state is used
    reactSetState(mapStateToProps(STATE));
  });
  triggerSubscribed();
}

// Add state parent to SET_STATE_FNS
function addToSetStateFNs(reactSetState, mapStateToProps) {
  SET_STATE_FNS.push({
    reactSetState,
    mapStateToProps,
  });
  // Return default state
  return mapStateToProps(STATE);
}

function triggerSubscribed() {
  SUBSCRIBED.forEach(callback => callback(STATE));
}

/*
<==========================================>
<                 DEPRECATED               >
<==========================================>
*/

// function reactStateUpdate(setInitialState) {
//   if (setInitialState) {
//     const { mapStateToProps } = SET_STATE_FNS[
//       SET_STATE_FNS.length - 1
//     ];
//     // reactSetState(mapStateToProps(STATE));
//     setInitialState = mapStateToProps(STATE);

//     return;
//   }
// }
