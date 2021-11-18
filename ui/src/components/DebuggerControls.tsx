import styles from './DebuggerControls.module.css';

interface Props {
  onExecute: () => void;
  onPlayToEnd: () => void;
  executing: boolean;
}

const DebuggerControls: React.FC<Props> = ({ onExecute, onPlayToEnd, executing }) => (
  <div className={styles['debugger-controls']}>
    <button
      onClick={onExecute}
      className={styles['debugger-controls__button']}
      type="button"
      name={ executing ? "next" : "execute" }
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
      Execute
    </button>
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
  </div>
);

export default DebuggerControls;
