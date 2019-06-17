/* eslint-disable react/prop-types */
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import localStorage from 'store2';

import {
  STATE,
  SET_STATE_FNS,
  REDUCERS,
  SUBSCRIBED,
  DEFAULT_OPTIONS,
  OPTIONS,
  PERSISTOR_TYPES,
} from './constants';

export const REHYDRATE = PERSISTOR_TYPES.REHYDRATE;
export const GetState = () => ({ ...STATE });

const REACT_CONTEXT = React.createContext();

export function Subscribe(callback) {
  if (!isFunction(callback)) return 0;
  SUBSCRIBED.push(callback);
  const index = SUBSCRIBED.length - 1;
  return () => {
    SUBSCRIBED[index] = () => 0;
    return 1;
  };
}

export function CreateStore(reducers, options = {}) {
  if (!isPlainObject(options))
    throw Error('Options parameter is not an object');

  Object.keys(DEFAULT_OPTIONS).forEach(key => {
    OPTIONS[key] = options[key]
      ? options[key]
      : DEFAULT_OPTIONS[key];
  });
  // if (initialState && !STATE) STATE = initialState;
  // REDUCERS.push(...reducers);
  Object.keys(reducers).forEach(reducer => {
    // Add reducer to REDUCERS array
    REDUCERS[reducer] = reducers[reducer];
  });

  if (Persistor_get()) return 1;

  Object.keys(REDUCERS).forEach(reducer => {
    // If no state in local storage
    // For each reducer set default state
    STATE[reducer] = REDUCERS[reducer](undefined, {
      type: null,
    });
  });

  Persistor_save();
}

export function Dispatch(PAYLOAD) {
  if (!PAYLOAD.type)
    throw Error('No type passed when calling dispatch');

  DebugLog('Dispatching: ', PAYLOAD);
  // Loop over every reducer middleware until a different state is returned
  // debugger;
  Object.keys(REDUCERS).forEach(reducer => {
    // New State returned
    const newState = REDUCERS[reducer](STATE[reducer], PAYLOAD);
    // If states are different then update
    STATE[reducer] = newState;
    return 1;
  });
  Persistor_save();
  reactStateUpdate();
}

// Provider wrapper
export class Provider extends React.Component {
  constructor(props) {
    super(props);
    const exportSetState = this.setState.bind(this);
    this.state = addToSetStateFN(exportSetState);
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
          Component({
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
    // Update all places where state is used
    setStateFN(STATE);
  });
  triggerSubscribed();
}

// Add state parent to SET_STATE_FNS
function addToSetStateFN(reactSetState) {
  SET_STATE_FNS.push(reactSetState);
  // Return default state
  return STATE;
}

function triggerSubscribed() {
  SUBSCRIBED.forEach(callback => callback(STATE));
}

function Persistor_save() {
  // debugger;
  if (!OPTIONS.persistor) return 0;
  const persistedState = {};
  Object.keys(STATE).forEach(stateKey => {
    // If there is no whitelist go over blacklist
    if (!OPTIONS.whitelist.length) {
      let isBlacklisted = false;
      OPTIONS.blacklist.forEach(blackListElm => {
        if (blackListElm === stateKey) isBlacklisted = true;
      });
      if (isBlacklisted) return true;
      persistedState[stateKey] = STATE[stateKey];
    } else {
      // If there is whitelist go over it and override blacklist
      OPTIONS.whitelist.forEach(whitelistElm => {
        if (whitelistElm === stateKey) {
          persistedState[stateKey] = STATE[stateKey];
        }
      });
    }
  });

  localStorage(OPTIONS.key, persistedState);
  DebugLog(`State saved to Local Storage`, persistedState);
}

function Persistor_get() {
  if (!OPTIONS.persistor) return 0;

  const localState = localStorage(OPTIONS.key);
  if (isEmpty(localState)) return 0;
  DebugLog(`Got State from local Storage`, localState);

  Dispatch({
    type: PERSISTOR_TYPES.REHYDRATE,
    payload: localState,
  });
  return 1;
}

// eslint-disable-next-line fp/no-rest-parameters
function DebugLog(...args) {
  if (OPTIONS.debug) console.log(...args);
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
