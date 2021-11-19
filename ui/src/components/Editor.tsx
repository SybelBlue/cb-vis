import AceEditor, { IMarker } from 'react-ace';

import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-pastel_on_dark';

import HtmlLogo from '../assets/html-logo.svg';
import PythonLogo from '../assets/python-logo.svg';
import { EditorError } from '../types/editor';

import styles from './Editor.module.css';

interface Props {
  source: string;
  setSource: (value: string) => void;
  mode: 'python' | 'html';
  debuggerLine?: number;
  error?: EditorError;
}

const Editor: React.FC<Props> = ({ source, setSource, mode, error, debuggerLine }) => {
  const { src, alt } =
    mode === 'html'
      ? { src: HtmlLogo, alt: 'HTML' }
      : { src: PythonLogo, alt: 'Python' };

  const debuggingMode = debuggerLine != null;

  const markers: IMarker[] =
    !debuggingMode || mode === 'html'
      ? []
      : [
          {
            startRow: debuggerLine - 1,
            startCol: 1,
            endRow: debuggerLine - 1,
            endCol: 2,
            className: 'debugger-cursor',
            type: 'fullLine',
          },
        ];

  return (
    <>
      <AceEditor
        mode={mode}
        theme={ debuggingMode ? "pastel_on_dark" : "dracula" }
        onChange={setSource}
        value={source}
        readOnly={debuggingMode}
        highlightActiveLine
        height="100%"
        width="100%"
        fontSize={14}
        markers={markers}
        annotations={
          error && [
            {
              row: error.lineNumber - 1,
              column: 0,
              text: 'Syntax error',
              type: 'error',
            },
          ]
        }
      />
      <img src={src} alt={alt} className={styles['lang-logo']} />
    </>
  );
};

export default Editor;
