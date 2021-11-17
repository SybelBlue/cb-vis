import { createMachine, assign, AssignAction } from 'xstate';

interface TraceData {
  frame: { lineno: number; locals: Record<string, unknown> };
  type: string;
  arg?: string;
  arg_name?: string;
}

interface Context {
  index: number;
  data: TraceData[];
}

type Event =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'STOP' }
  | { type: 'LOAD'; payload: TraceData[] };

const clampIndex = (n: number, array: unknown[]): number =>
  Math.max(0, Math.min(array.length - 1, n));

const delta = (d: number): AssignAction<Context, Event> =>
  assign((context: Context) => ({
    index: clampIndex(context.index + d, context.data),
  }));

const debuggerMachine = createMachine<Context, Event>(
  {
    context: { index: 0, data: [] },
    initial: 'stopped',
    states: {
      stopped: {
        on: {
          LOAD: {
            target: 'idle',
            actions: (_ctxt, e) => ({
              index: 0,
              data: e.payload,
            }),
          },
        },
      },
      idle: {
        on: {
          NEXT: {
            actions: ['next', 'debug'],
          },
          PREV: {
            actions: ['prev', 'debug'],
          },
          LOAD: {
            actions: ['activate', 'debug'],
          },
          STOP: {
            target: 'stopped',
            actions: ['debug'],
          },
        },
      },
    },
  },
  {
    actions: {
      // eslint-disable-next-line no-console
      debug: console.log,
      next: delta(1),
      prev: delta(-1),
    },
  }
);

export default debuggerMachine;
