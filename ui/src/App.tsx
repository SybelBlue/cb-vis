import * as React from 'react';
import $ from 'jquery';
import { useAtom } from 'jotai';
import { useMachine } from '@xstate/react';

import Editor from './components/Editor';
import DebuggerControls from './components/DebuggerControls';
import Document from './components/Document';
import { documentAtom, iframeAtom, programAtom } from './atoms/editor-atoms';
import type {
  Pyodide,
  PyProxy,
  SyntaxChecker,
  TraceData,
  TraceExec,
  TraceFn,
} from './types/pyodide';
import Console from './components/Console';
import { getExceptionLineNumber } from './helpers/traceback';
import type { EditorError } from './types/editor';
import styles from './App.module.css';
import { debuggerMachine, currentTrace } from './helpers/debugger-fsm';

const App: React.FC = () => {
  const frameId = 'frame';

  const [htmlSource, setHtmlSource] = useAtom(documentAtom);
  const [iframeSource, setIFrameSource] = useAtom(iframeAtom);
  const [pythonSource, setPythonSource] = useAtom(programAtom);

  const pyodide = React.useRef<Pyodide | null>(null);
  const userGlobals = React.useRef<PyProxy | undefined>(undefined);
  const userCallbacks = React.useRef<
    { selector: string; event: string; cb: string }[]
  >([]);
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

        const debuggerProgram = await (await fetch('debugger.py')).text();

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
        let traceData = JSON.parse(json) as TraceData[];

        if (ignoreFirst) {
          const firstFrame = traceData.shift()?.frame;
          traceData = traceData.filter(
            (t: TraceData) => t.frame !== firstFrame
          );
        }

        send({ type: 'LOAD', payload: traceData });
      };
      const convertCallback = (cb: object) => {
        const casted = cb as { __name__?: string };
        if (
          !cb ||
          (typeof cb !== 'string' && typeof casted.__name__ !== 'string')
        ) {
          alert('TypeError: callback must be a named function or str');
          return;
        }
        return casted.__name__ ? casted.__name__ + '()' : cb.toString();
      };
      const setCallback = (
        selector: string,
        event: string,
        callback: object
      ) => {
        const cb = convertCallback(callback);
        cb && userCallbacks.current.push({ selector, event, cb });
      };
      const append = (selector: string, html: string) =>
        $('#' + frameId)
          .contents()
          .find(selector)
          .append(html);
      const traceExec = pyodide.current?.globals.get('trace_exec') as TraceExec;
      if (!traceExec) return;

      try {
        userGlobals.current = traceExec(
          pySrc,
          reportRecord,
          setCallback,
          append,
          userGlobals.current
        );
      } catch (e) {
        alert((e as { message: string }).message);
      } finally {
        return userGlobals.current;
      }
    },
    [send, userGlobals]
  );

  const executePython = React.useCallback(() => {
    if (!pyodideInitialized) return;
    if (current.value === 'stopped') {
      userCallbacks.current = [];
      trace(pythonSource);
      setIFrameSource(htmlSource);
    } else {
      send('NEXT');
    }
  }, [
    current,
    send,
    setIFrameSource,
    pythonSource,
    htmlSource,
    pyodideInitialized,
  ]);

  const onPlayToEnd = React.useCallback(() => send('STOP'), [send]);

  const currentTraceData = currentTrace(current.context);

  const debuggerLine =
    current.value == 'stopped' ? undefined : currentTraceData?.frame.lineno;
  const stdout = currentTraceData?.stdout ?? '';
  const stderr = currentTraceData?.stderr ?? '';

  const checkPythonSource = React.useCallback(
    (source) => {
      const checker = pyodide.current?.globals.get(
        'check_syntax'
      ) as SyntaxChecker;
      if (!checker) return;

      const e = checker(source);
      const err = e && JSON.parse(e);

      setPythonError(
        err && {
          lineNumber: err.lineno as number,
        }
      );
    },
    [pythonError]
  );

  const enterEditing = React.useCallback(() => {
    userGlobals.current = undefined;
    send('STOP');
    setIFrameSource('');
  }, [send, userGlobals, setIFrameSource]);

  const mode =
    current.value === 'idle'
      ? 'debug'
      : userGlobals.current
      ? 'locked'
      : 'edit';

  return (
    <>
      <div className={styles.panel}>
        <Editor
          source={htmlSource}
          setSource={setHtmlSource}
          mode="html"
          debuggerLine={debuggerLine || (userGlobals.current && 0)}
        />
      </div>
      <div className={styles.panel}>
        <Document
          traceData={{ id: frameId, trace, callbacks: userCallbacks.current }}
          srcDoc={iframeSource}
          blurred={current.value === 'idle'}
        />
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
          debuggerLine={debuggerLine || (userGlobals.current && 0)}
        />
        {pyodideInitialized ? (
          <DebuggerControls
            onEdit={enterEditing}
            onExecute={executePython}
            onPlayToEnd={onPlayToEnd}
            mode={mode}
            error={pythonError}
          />
        ) : null}
      </div>
      <div className={styles.panel}>
        <Console stdout={stdout} stderr={stderr} />
      </div>
    </>
  );
};

export default App;
