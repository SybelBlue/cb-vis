import { createMachine, assign, AssignAction } from 'xstate';

import type { TraceData } from '../types/pyodide';

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
  Math.max(0, Math.min(array.length, n));

const delta = (d: number): AssignAction<Context, Event> =>
  assign((context: Context) => ({
    index: clampIndex(context.index + d, context.data),
  }));

const currentTrace = (ctxt: Context): TraceData | undefined =>
  ctxt.data[ctxt.index];

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
        always: [
          { target: 'stopped', cond: 'finishedPlayback' },
          { target: 'idle', cond: 'isReturn', actions: ['next'] },
        ],
        on: {
          NEXT: {
            actions: ['next'],
          },
          PREV: {
            actions: ['prev'],
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
      logCurrent: (ctxt) => {
        // eslint-disable-next-line no-console
        console.log(currentTrace(ctxt));
      },
    },
    guards: {
      finishedPlayback: (ctxt) => ctxt.data.length == ctxt.index,
      isReturn: (ctxt) => currentTrace(ctxt)?.type === 'return',
    },
  }
);

export { debuggerMachine, currentTrace };
