import {Reducer} from 'react';

import {ActionCreator, StandardAction, ActionType, SucceedAction, FailedAction} from './action';

/** reducer ----------------------- */
type FunctionalReducer<A extends StandardAction<string, any, any>, S, V, E> = (state: S, action: A) => S;

type ReduceCase<T extends ActionType, S> = [
  ActionCreator<string, any, any, any>,
  FunctionalReducer<SucceedAction<T, any>, S, any, any>,
  FunctionalReducer<FailedAction<T, any>, S, any, any>
];

function DEFAULT_FAILED_REDUCER<S>(state: S) {
  return state;
}

export class ReducerCreator<T extends ActionType, S> {
  public initialState: S;
  private reducers: Array<ReduceCase<T, S>>;

  constructor(initial: ReduceCase<T, S>, initialState: S) {
    this.reducers = [initial];
    this.initialState = initialState;
  }

  public case<NewT extends ActionType, V, E>(
    actionCreator: ActionCreator<NewT, any, V, E>,
    succeedReducer: FunctionalReducer<SucceedAction<NewT, V>, S, V, E>,
    failedReducer: FunctionalReducer<FailedAction<NewT, E>, S, V, E> = DEFAULT_FAILED_REDUCER
  ): ReducerCreator<T | NewT, S> {
    // trick to reduce a cost to create a new object
    this.reducers.push([actionCreator as any, succeedReducer as any, failedReducer as any]);
    return this as ReducerCreator<T | NewT, S>;
  }

  public toReducer(): Reducer<S, StandardAction<T, any, any>> {
    return (prevState: S, action: StandardAction<T, any, any>) => {
      return this.reducers.reduce((prevResult: S, [ac, succeedReducer, failedReducer]) => {
        if (action.type === ac.actionTypeMarker) {
          if (action.__marker === 'succeed') {
            return succeedReducer(prevResult, action);
          } else {
            return failedReducer(prevResult, action);
          }
        }
        return prevResult;
      }, prevState);
    };
  }
}

class ReducerCreatorInitiator<S> {
  private state: S;

  constructor(initialState: S) {
    this.state = initialState;
  }

  public case<T extends ActionType, V, E>(
    actionCreator: ActionCreator<T, any, V, E>,
    succeedReducer: FunctionalReducer<SucceedAction<T, V>, S, V, E>,
    failedReducer: FunctionalReducer<FailedAction<T, E>, S, V, E> = DEFAULT_FAILED_REDUCER
  ): ReducerCreator<T, S> {
    return new ReducerCreator([actionCreator, succeedReducer, failedReducer], this.state);
  }
}

export function createReducer<S>(initialState: S) {
  return new ReducerCreatorInitiator(initialState);
}
/** ----------------------- reducer */
