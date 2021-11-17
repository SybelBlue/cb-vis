import * as React from 'react';
import { useAtom } from 'jotai';
import { interpret } from 'xstate';

import Editor from './components/Editor';
import DebuggerControls from './components/DebuggerControls';
import Document from './components/Document';
import { documentAtom, programAtom } from './atoms/editor-atoms';
import { getExceptionLineNumber } from './helpers/traceback';
import type { Pyodide } from './types/pyodide';
import type { EditorError } from './types/editor';
import styles from './App.module.css';
import debuggerMachine from './helpers/debugger-fsm';

// TODO: window.document needs to satsify:
// interface PythonBridge {
//   getIframeState: () => string,
//   getUserCode: () => string,
//   reportRecord: (list_of_json: string) => void,
// }

const App: React.FC = () => {
  const [htmlSource, setHtmlSource] = useAtom(documentAtom);
  const [pythonSource, setPythonSource] = useAtom(programAtom);

  const pyodide = React.useRef<Pyodide | null>(null);
  const [pyodideInitialized, setPyodideInitialized] = React.useState(false);
  const [pythonError, setPythonError] = React.useState<EditorError>();

  const debuggerService = interpret(debuggerMachine)
    // .onTransition((state) => console.log(state));

  React.useEffect(() => {
    if (!pyodideInitialized) {
      const initPyodide = async (): Promise<void> => {
        // @ts-expect-error – pyodide/pyodide.js has no TypeScript declarations.
        const pyodidePkg = await import('pyodide/pyodide.js');

        pyodide.current = await pyodidePkg.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/',
        });

        setPyodideInitialized(true);
      };

      initPyodide();
    } else {
      try {
        pyodide.current?.runPython(pythonSource);
        setPythonError(undefined);
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
    }
  }, [pyodideInitialized, pythonSource]);

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
        <DebuggerControls />
      </div>
      <div className={styles.panel}></div>
    </>
  );
};

export default App;
