import { createMachine, assign, AssignAction } from 'xstate';

import type { TraceData } from '../types/pyodide';
import type { Statement } from '../types/console';

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
        always: [{ target: 'stopped', cond: 'finishedPlayback' }],
        on: {
          NEXT: {
            actions: ['next', 'logCurrent'],
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
    },
  }
);

const currentStatements = (ctxt: Context): Statement[] => {
  const { index, data } = ctxt;

  const statements = data
    .slice(0, index + 1)
    .reduce<Statement[]>((acc, trace) => {
      if (trace.stdout) {
        const lines = trace.stdout
          .trim()
          .split('\n')
          .map((line) => ({ type: <const>'stdout', message: line }));

        return [...acc, ...lines];
      } else if (trace.stderr) {
        const lines = trace.stderr
          .trim()
          .split('\n')
          .map((line) => ({ type: <const>'stderr', message: line }));

        return [...acc, ...lines];
      } else {
        return acc;
      }
    }, []);

  return statements;
};

export { debuggerMachine, currentTrace, currentStatements };
