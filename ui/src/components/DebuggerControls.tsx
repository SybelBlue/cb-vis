import type { EditorError } from '../types/editor';

import styles from './DebuggerControls.module.css';

interface Props {
  onEdit: () => void;
  onExecute: () => void;
  onPlayToEnd: () => void;
  mode: 'edit' | 'debug' | 'locked';
  error?: EditorError;
}

const DebuggerControls: React.FC<Props> = ({
  onEdit,
  onExecute,
  onPlayToEnd,
  mode,
  error,
}) => (
  <div className={styles['debugger-controls']}>
    {mode === 'locked' ? (
      <button
        onClick={onEdit}
        className={styles['debugger-controls__button']}
        type="button"
        name="edit"
        disabled={Boolean(error)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 17 17"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={styles['debugger-controls__icon']}
        >
          <defs></defs>
          <g>
            <polygon points="13.6,6.2 2.8,17 0,17 0,14.1 10.8,3.4  " />
            <path d="M16.4,3.4L15,4.8L12.2,2l1.4-1.4c0.8-0.8,2-0.8,2.8,0l0,0C17.2,1.4,17.2,2.6,16.4,3.4z" />
          </g>
        </svg>
        Edit
      </button>
    ) : (
      <button
        onClick={onExecute}
        className={styles['debugger-controls__button']}
        type="button"
        name={mode === 'debug' ? 'next' : 'execute'}
        disabled={Boolean(error)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={styles['debugger-controls__icon']}
        >
          <path d="m5 3 14 9-14 9V3z" />
        </svg>
        {mode === 'debug' ? 'Next' : 'Execute'}
      </button>
    )}

    {mode === 'debug' ? (
      <button
        onClick={onPlayToEnd}
        className={styles['debugger-controls__button']}
        type="button"
        name="play-to-end"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={styles['debugger-controls__icon']}
        >
          <path d="m13 19 9-7-9-7v14zM2 19l9-7-9-7v14z" />
        </svg>
        Play to End
      </button>
    ) : null}
    {error ? (
      <p className={styles['debugger-controls__error']}>
        Error in Python source on L{error?.lineNumber}
      </p>
    ) : null}
  </div>
);

export default DebuggerControls;
