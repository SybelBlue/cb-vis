import { useAtom } from 'jotai';

import Editor from './components/Editor';
import DebuggerControls from './components/DebuggerControls';
import Document from './components/Document';
import { documentAtom, programAtom } from './atoms/editor-atoms';
import styles from './App.module.css';

const App: React.FC = () => {
  const [htmlSource, setHtmlSource] = useAtom(documentAtom);
  const [pythonSource, setPythonSource] = useAtom(programAtom);

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
        />
        <DebuggerControls />
      </div>
      <div className={styles.panel}></div>
    </>
  );
};

export default App;
