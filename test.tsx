import React, {useEffect} from 'react';
import {render} from 'react-dom';

import {createActionCreator, createReducer, createReduxContext} from './src';

const initialize = createActionCreator('first', () => 1);
const secondAction = createActionCreator('second', (prev: number) => {
  if (prev === 10) {
    throw new Error('overflow!!!!!!!');
  }
  return prev + 1;
});

interface Store {
  count: number;
  errorMessage?: string;
}

const reducer = createReducer<Store>({count: 0})
  .case(initialize, (state, action) => ({
    count: action.payload,
    errorMessage: undefined,
  }))
  .case(
    secondAction,
    (state, action) => {
      return {
        count: action.payload,
      };
    },
    (state, err) => ({
      ...state,
      errorMessage: err.error.message,
    })
  );

const {connect, Provider} = createReduxContext(reducer);

interface ReceivedProps {
  ccc: number;
  ems: string;
}
interface OwnProps {
  name: string;
}
type AppProps = ReceivedProps & OwnProps;

const App = connect<OwnProps, ReceivedProps>(s => ({
  ccc: s.count,
  ems: s.errorMessage,
}))(function App(props) {
  useEffect(() => {
    props.dispatch(initialize());
  }, []);
  return (
    <div>
      <p>{props.name}</p>
      <p>{props.ccc}</p>
      {props.ems && <p style={{color: 'red'}}>{props.ems}</p>}
      <button onClick={() => props.dispatch(secondAction(props.ccc))}>count up</button>
    </div>
  );
});

render(
  <Provider>
    <App name="Rosy" />
  </Provider>,
  document.getElementById('app')!
);
