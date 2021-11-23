import * as React from 'react';

import TerminalIcon from '../assets/terminal.svg';

import styles from './Console.module.css';

interface Props {
  stdout: string;
  stderr: string;
}

const InputIcon = (
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
);

const Console: React.FC<Props> = ({ stdout, stderr }) => {
  const stdOutStatements = stdout.split('\n');
  const stdErrStatements = stderr.split('\n');

  return (
    <div className={styles['console']}>
      <img
        src={TerminalIcon}
        alt="Console"
        className={styles['console__icon']}
      />
      {stdOutStatements.map((statement, i) => (
        <p key={`${statement}-${i}`} className={styles['console__stmt']}>
          {InputIcon}
          {statement}
        </p>
      ))}
      {stderr
        ? stdErrStatements.map((statement, i) => (
            <p
              key={`${statement}-${i}`}
              className={`${styles['console__stmt']} ${styles['console__stmt--stderr']}`}
            >
              {InputIcon}
              {statement}
            </p>
          ))
        : null}
    </div>
  );
};

export default Console;
