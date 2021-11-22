import * as React from 'react';

import TerminalIcon from '../assets/terminal.svg';

import styles from './Console.module.css';

interface Props {
  stdout: string;
}

const Console: React.FC<Props> = ({ stdout }) => {
  const statements = stdout.trim().split('\n');

  return (
    <div className={styles['console']}>
      <img
        src={TerminalIcon}
        alt="Console"
        className={styles['console__icon']}
      />
      {statements.map((statement) => (
        <p key={statement} className={styles['console__stmt']}>
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
          {statement}
        </p>
      ))}
    </div>
  );
};

export default Console;
