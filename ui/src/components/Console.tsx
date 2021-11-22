import * as React from 'react';

import type { Statement } from '../types/console';
import TerminalIcon from '../assets/terminal.svg';

import styles from './Console.module.css';

interface Props {
  statements: Statement[];
}

const Console: React.FC<Props> = ({ statements }) => {
  return (
    <div className={styles['console']}>
      <img
        src={TerminalIcon}
        alt="Console"
        className={styles['console__icon']}
      />
      {statements.map((statement, i) => (
        <p
          key={i}
          className={`${styles['console__stmt']} ${
            statement.type === 'stderr' ? styles['console__stmt--stderr'] : ''
          }`}
        >
          <svg
            className={styles['console__stmt-icon']}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
          </svg>
          {statement.message}
        </p>
      ))}
    </div>
  );
};

export default Console;
