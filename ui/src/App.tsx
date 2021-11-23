import * as React from 'react';
import { useAtom } from 'jotai';
import { useMachine } from '@xstate/react';

import Editor from './components/Editor';
import DebuggerControls from './components/DebuggerControls';
import Document from './components/Document';
import { documentAtom, iframeAtom, programAtom } from './atoms/editor-atoms';
import type { Pyodide, PyProxy, TraceData, TraceExec, TraceFn } from './types/pyodide';
import Console from './components/Console';
import { getExceptionLineNumber } from './helpers/traceback';
import type { EditorError } from './types/editor';
import styles from './App.module.css';
import { debuggerMachine, currentTrace } from './helpers/debugger-fsm';

const App: React.FC = () => {
  const [htmlSource, setHtmlSource] = useAtom(documentAtom);
  const [iframeSource, setIFrameSource] = useAtom(iframeAtom);
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

  const trace: TraceFn = React.useCallback(
    (pySrc: string, ignoreFirst: boolean = false) => {
      const reportRecord = (json: string): void => {
        let traceData = (JSON.parse(json) as TraceData[]);
        
        if (ignoreFirst) {
          const firstFrame = traceData.shift()?.frame;
          traceData = traceData.filter((t: TraceData) => t.frame != firstFrame);
        }

        send({ type: 'LOAD', payload: traceData });
      };
      const traceExec = pyodide.current?.globals.get('trace_exec') as TraceExec;
      if (!traceExec) return;

      const out = traceExec(pySrc, reportRecord, userGlobals.current);
      return (userGlobals.current = out);
    },
    [send, userGlobals]
  );

  const executePython = React.useCallback(() => {
    if (!pyodideInitialized) return;
    if (current.value == 'stopped') {
      trace(pythonSource);
      setIFrameSource(htmlSource);
    } else {
      send('NEXT');
    }
  }, [current, send, setIFrameSource, pythonSource, htmlSource, pyodideInitialized]);

  const onPlayToEnd = React.useCallback(() => send('STOP'), [send]);

  const currentTraceData = currentTrace(current.context);

  const debuggerLine =
    current.value == 'stopped' ? undefined : currentTraceData?.frame.lineno;
  const stdout = currentTraceData?.stdout ?? '';
  const stderr = currentTraceData?.stderr ?? '';

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
        <Document traceData={{ id: 'frame', trace }} srcDoc={iframeSource} />
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
        {pyodideInitialized 
          ? <DebuggerControls
            onExecute={executePython}
            onPlayToEnd={onPlayToEnd}
            executing={current.value == 'idle'}
            error={pythonError}
          />
          : null
        }
      </div>
      <div className={styles.panel}>
        <Console stdout={stdout} stderr={stderr} />
      </div>
    </>
  );
};

export default App;
