import $ from 'jquery';
import { useEffect } from 'react';

import { TraceFn } from '../types/pyodide';

import styles from './Document.module.css';

interface Props {
  srcDoc: string;
  traceData?: { id: string; trace: TraceFn };
}

const Document: React.FC<Props> = ({ srcDoc, traceData }) => {
  useEffect(() => {
    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
    let isMounted = true;
    if (traceData) {
      console.log('iframe effect');
      
      const innerDoc = $('#' + traceData.id).contents();
      innerDoc.find('*').map((i, elem: HTMLElement) => {
        let j = 0;
        for (const key in elem) {
          const v = elem[key];
          if (v && key.startsWith('on')) {
            const newV = `$__trace__${i}_${j++}`;
            const fnText: string = v.toString();
            const inner = fnText
              .slice(fnText.indexOf('{') + 1, fnText.lastIndexOf('}'))
              .trim();
            if (!inner.startsWith('$__trace__')) {
              elem.setAttribute(key, newV + '()');
              innerDoc[0][newV] = (): void => {
                traceData.trace(inner, true);
              };
              console.log('capture');
            }
          }
        }
      });
    }
  });
  return (
    <iframe
      id={traceData?.id}
      className={styles.document}
      title="document"
      srcDoc={srcDoc}
    />
  );
};

export default Document;
