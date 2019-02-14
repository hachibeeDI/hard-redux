import React, {memo, createContext, useContext, useReducer, useMemo} from 'react';
import {ReactNode, Reducer, Dispatch, ReducerState, ReducerAction} from 'react';

import {ActionType, StandardAction} from './action';
import {ReducerCreator} from './reducer';

export interface Store<S, T extends ActionType> {
  state: ReducerState<Reducer<S, StandardAction<T, any, any>>>;
  dispatch: (action: StandardAction<T, any, any>) => void;
}

export function createStore<S, T extends ActionType>(
  reducers: ReducerCreator<T, S>
  // initialState?: ReducerState<Reducer<S, Actions>>
): Store<S, T> {
  const [state, dispatch] = useReducer(reducers.toReducer(), reducers.initialState);
  return {state, dispatch};
}
