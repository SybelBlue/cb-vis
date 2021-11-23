/* eslint-disable no-console */
import $ from 'jquery';
import { useEffect } from 'react';

import styles from './Document.module.css';

interface Props {
  srcDoc: string;
  traceData?: { id: string; trace: (code: string) => void };
}

const Document: React.FC<Props> = ({ srcDoc, traceData }) => {
  useEffect(() => {
    let isMounted = true;
    if (traceData) {
      console.log('iframe effect');

      const innerDoc = $('#' + traceData.id).contents();
      innerDoc.find('*').map((i, elem: HTMLElement) => {
        for (const key in elem) {
          const v = elem[key];
          if (v && key.startsWith('on')) {
            const newV = 'trace' + i;
            const fnText: string = v.toString();
            const inner = fnText
              .slice(fnText.indexOf('{') + 1, fnText.lastIndexOf('}'))
              .trim();
            elem.setAttribute(key, newV + '()');
            innerDoc[0][newV] = () => {
              console.log('run');
              traceData.trace(inner);
            };
            console.log('capture', elem, inner);
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
