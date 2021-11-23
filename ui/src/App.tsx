import * as React from 'react';
import { useAtom } from 'jotai';
import { useMachine } from '@xstate/react';

import Editor from './components/Editor';
import DebuggerControls from './components/DebuggerControls';
import Document from './components/Document';
import Console from './components/Console';
import { documentAtom, programAtom } from './atoms/editor-atoms';
import { getExceptionLineNumber } from './helpers/traceback';
import type { Pyodide, PyProxy, TraceData, TraceExec } from './types/pyodide';
import type { EditorError } from './types/editor';
import styles from './App.module.css';
import { debuggerMachine, currentTrace } from './helpers/debugger-fsm';

const App: React.FC = () => {
  const [htmlSource, setHtmlSource] = useAtom(documentAtom);
  const [pythonSource, setPythonSource] = useAtom(programAtom);

  const pyodide = React.useRef<Pyodide | null>(null);
  const userGlobals = React.useRef<PyProxy | undefined>(undefined);
  const [pyodideInitialized, setPyodideInitialized] = React.useState(false);
  const [pythonError, setPythonError] = React.useState<EditorError>();

  React.useEffect(() => {
    if (!pyodideInitialized) {
      const initPyodide = async (): Promise<void> => {
        // @ts-expect-error – pyodide/pyodide.js has no TypeScript declarations.
        const pyodidePkg = await import('pyodide/pyodide.js');

        pyodide.current = await pyodidePkg.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/',
        });

        const body = await fetch('debugger.py');
        const debuggerProgram = await body.text();

        await pyodide.current?.runPythonAsync(debuggerProgram);

        setPyodideInitialized(true);
      };

      initPyodide();
    }
  }, [pyodideInitialized]);

  const [current, send] = useMachine(debuggerMachine);

  const getNames = (ctxt: PyProxy): string[] => {
    const localNames: string[] = [];
    for (const x of ctxt) localNames.push(x);
    return localNames;
  };

  const executePython = React.useCallback(() => {
    if (current.value == 'stopped') {
      const reportRecord = (json: string): void => {
        const traceData = JSON.parse(json) as TraceData[];
        const next = send({ type: 'LOAD', payload: traceData });
        // eslint-disable-next-line no-console
        console.log('loaded', next);
      };

      try {
        const traceExec = pyodide.current?.globals.get(
          'trace_exec'
        ) as TraceExec;
        if (traceExec) {
          userGlobals.current = traceExec(
            pythonSource,
            reportRecord,
            userGlobals.current
          );
          // eslint-disable-next-line no-console
          console.log('local names', getNames(userGlobals.current));
        }
      } catch (err) {
        // FATAL CRASH?
        // if (
        //   err instanceof Error &&
        //   err.name === pyodide.current?.PythonError.name
        // ) {
        //   setPythonError({
        //     lineNumber: getExceptionLineNumber(err.message),
        //   });
        // }
      }
    } else {
      const next = send('NEXT');
      // eslint-disable-next-line no-console
      console.log('advanced', next);
    }
  }, [current, send, pythonSource, userGlobals]);

  const onPlayToEnd = React.useCallback(() => {
    const next = send('STOP');
    // eslint-disable-next-line no-console
    console.log('stopped', next);
  }, [send]);

  const trace = currentTrace(current.context);

  const debuggerLine =
    current.value == 'stopped' ? undefined : trace?.frame.lineno;
  const stdout = trace?.stdout ?? '';
  const stderr = trace?.stderr ?? '';

  const checkPythonSource = React.useCallback(
    (source) => {
      try {
        pyodide.current?.runPython(source);

        // If we have an existing error flagged from a previous execution, remove it.
        if (pythonError) {
          setPythonError(undefined);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === pyodide.current?.PythonError.name
        ) {
          setPythonError({
            lineNumber: getExceptionLineNumber(err.message),
          });
        }
      }
    },
    [pythonError]
  );

  return (
    <>
      <div className={styles.panel}>
        <Editor
          source={htmlSource}
          setSource={setHtmlSource}
          mode="html"
          debuggerLine={debuggerLine}
        />
      </div>
      <div className={styles.panel}>
        <Document srcDoc={htmlSource} />
      </div>
      <div className={styles.panel}>
        <Editor
          source={pythonSource}
          setSource={(source: string): void => {
            checkPythonSource(source);
            setPythonSource(source);
          }}
          mode="python"
          error={pythonError}
          debuggerLine={debuggerLine}
        />
        <DebuggerControls
          onExecute={executePython}
          onPlayToEnd={onPlayToEnd}
          executing={current.value == 'idle'}
          error={pythonError}
        />
      </div>
      <div className={styles.panel}>
        <Console stdout={stdout} stderr={stderr} />
      </div>
    </>
  );
};

export default App;
