import * as React from 'react';
import { useAtom } from 'jotai';
import { interpret } from 'xstate';

import Editor from './components/Editor';
import DebuggerControls from './components/DebuggerControls';
import Document from './components/Document';
import { documentAtom, programAtom } from './atoms/editor-atoms';
import { getExceptionLineNumber } from './helpers/traceback';
import type { Pyodide, PyProxy, TraceData, TraceExec } from './types/pyodide';
import type { EditorError } from './types/editor';
import styles from './App.module.css';
import debuggerMachine from './helpers/debugger-fsm';

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

  const debuggerService = interpret(debuggerMachine)
    .onTransition((state) => console.log('state transition', state))
    .start();

  const reportRecord = (json: string) => {
    const traceData = JSON.parse(json) as TraceData[];
    debuggerService.send({ type: 'LOAD', payload: traceData });
  };

  const getNames = (ctxt: PyProxy) => {
    const localNames: string[] = [];
    for (const x of ctxt) localNames.push(x);
    return localNames;
  };

  const executePython = React.useCallback(() => {
    try {
      const traceExec = pyodide.current?.globals.get('trace_exec') as TraceExec;
      if (traceExec) {
        userGlobals.current = traceExec(
          pythonSource,
          reportRecord,
          userGlobals.current
        );
        console.log('local names', getNames(userGlobals.current));
      }
      // If we have an existing error flagged from a previous execution, remove it.
      // if (pythonError) {
      //   setPythonError(undefined);
      // }
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
  }, [pythonError, pythonSource, userGlobals]);

  return (
    <>
      <div className={styles.panel}>
        <Editor source={htmlSource} setSource={setHtmlSource} mode="html" />
      </div>
      <div className={styles.panel}>
        <Document srcDoc={htmlSource} />
      </div>
      <div className={styles.panel}>
        <Editor
          source={pythonSource}
          setSource={setPythonSource}
          mode="python"
          error={pythonError}
        />
        <DebuggerControls onExecute={executePython} />
      </div>
      <div className={styles.panel}></div>
    </>
  );
};

export default App;
