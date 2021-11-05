import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-dracula';

import HtmlLogo from '../assets/html-logo.svg';
import PythonLogo from '../assets/python-logo.svg';

import styles from './Editor.module.css';

interface Props {
  source: string;
  setSource: (value: string) => void;
  mode: 'python' | 'html';
}

const Editor: React.FC<Props> = ({ source, setSource, mode }) => {
  const { src, alt } =
    mode === 'html'
      ? { src: HtmlLogo, alt: 'HTML' }
      : { src: PythonLogo, alt: 'Python' };

  return (
    <>
      <AceEditor
        mode={mode}
        theme="dracula"
        onChange={setSource}
        value={source}
        highlightActiveLine
        height="100%"
        width="100%"
        fontSize={14}
      />
      <img src={src} alt={alt} className={styles['lang-logo']} />
    </>
  );
};

export default Editor;
