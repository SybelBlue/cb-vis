import { createMachine, assign, AssignAction } from 'xstate';

import { TraceData } from '../types/pyodide';

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
            actions: assign((_ctxt, e) => ({
              index: 0,
              data: e.payload,
            })),
          },
        },
      },
      idle: {
        on: {
          NEXT: {
            actions: ['next'],
          },
          PREV: {
            actions: ['prev'],
          },
          LOAD: {
            actions: ['activate'],
          },
          STOP: {
            target: 'stopped',
          },
        },
      },
    },
  },
  {
    actions: {
      next: delta(1),
      prev: delta(-1),
    },
  }
);

export default debuggerMachine;
