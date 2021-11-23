import type { EditorError } from '../types/editor';

import styles from './DebuggerControls.module.css';

interface Props {
  onExecute: () => void;
  onPlayToEnd: () => void;
  executing: boolean;
  error?: EditorError;
}

const DebuggerControls: React.FC<Props> = ({
  onExecute,
  onPlayToEnd,
  executing,
  error,
}) => (
  <div className={styles['debugger-controls']}>
    <button
      onClick={onExecute}
      className={styles['debugger-controls__button']}
      type="button"
      name={executing ? 'next' : 'execute'}
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
      {executing ? 'Next' : 'Execute'}
    </button>
    {executing ? (
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
