import React, {memo, createContext, useContext, useMemo} from 'react';
import {ReactNode, Reducer, Dispatch} from 'react';

import {ActionType} from './action';
import {ReducerCreator} from './reducer';
import {Store, createStore} from './store';

type ConnectedComponentProps<S extends Store<any, any>> = Pick<S, 'dispatch'>;

export function createReduxContext<S, Actions extends ActionType>(rootReducer: ReducerCreator<Actions, S>) {
  type UserStore = Store<S, Actions>;
  // TODO: I should separate the provider for state and dispatcher?
  const ReduxContext = createContext((null as any) as UserStore); // technically null is wrong but correct in runtime use case.

  return {
    Provider({children}: {children: ReactNode}) {
      const store = createStore(rootReducer);
      return <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>;
    },

    connect<OwnProps, ReceivedProps>(mapStateToProps: (state: UserStore['state'], ownProps: OwnProps) => ReceivedProps) {
      // tee hee we no longer need to use class component! :clap:
      return (ConnectedComponent: React.FunctionComponent<ReceivedProps & OwnProps & ConnectedComponentProps<UserStore>>) => {
        const wrapper = (props: OwnProps) => {
          // TODO: consider `observedBits` (but it's not a public API so far)
          const store = useContext(ReduxContext);
          const mappedProps = useMemo(() => mapStateToProps(store.state, props), [store.state]);

          return <ConnectedComponent {...mappedProps} dispatch={store.dispatch} {...props} />;
        };

        wrapper.displayName = `connected(${ConnectedComponent.name})`;

        return memo(wrapper);
      };
    },
  };
}
