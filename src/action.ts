/** actions ----------------------- */
export type ActionType = string; //  <T, Root extends ActionType = ''> = Root extends '' ? :

export interface SucceedAction<T extends ActionType, V> {
  type: T;
  payload: V;
  error?: undefined;

  __marker: 'succeed';
}
export interface FailedAction<T extends ActionType, E = Error> {
  type: T;
  error: E;

  __marker: 'failed';
}

// NOTE: technically this is not a FSA though, more TypeScript friendlily.
export type StandardAction<T extends ActionType, V, E = Error> = SucceedAction<T, V> | FailedAction<T, E>;

export const createStandardAction = <T extends ActionType, V>(type: T, payload: V): SucceedAction<T, V> => ({
  type,
  payload,
  __marker: 'succeed',
});
export const failedStandardAction = <T extends ActionType, V, E>(type: T, error: E): FailedAction<T, E> => ({
  type,
  error,
  __marker: 'failed',
});

type NoneArg<Payload> = () => Payload;
type WithArg<I, Payload> = (input: I) => Payload;
type ActionCreatorTransformer<I, Payload> = NoneArg<Payload> | WithArg<I, Payload>;

export interface ActionCreator<T extends ActionType, Input, V = Input, E = Error> {
  (): StandardAction<T, V, E>;
  (input: Input): StandardAction<T, V, E>;

  actionTypeMarker: T;
}

export function createActionCreator<T extends ActionType, I, V = I>(
  type: T,
  transformer: ActionCreatorTransformer<I, V>
): ActionCreator<T, I, V, Error> {
  const ac = (input?: I) => {
    try {
      // FIXME: I need help to define a type if the `input` is no provider. `void` looks suitable for but doesn't.
      const payload = (transformer as any)(input);
      return createStandardAction(type, payload);
    } catch (e) {
      return failedStandardAction(type, e);
    }
  };
  ac.actionTypeMarker = type;
  return ac;
}
/** ----------------------- actions */
