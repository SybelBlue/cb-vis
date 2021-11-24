import $ from 'jquery';
import { useEffect } from 'react';

import { TraceFn } from '../types/pyodide';

import cs from 'classnames';

import styles from './Document.module.css';

interface Props {
  srcDoc: string;
  traceData?: { id: string; trace: TraceFn };
  blurred: boolean;
}

const Document: React.FC<Props> = ({ srcDoc, traceData, blurred }) => {
  useEffect(() => {
    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
    let isMounted = true;
    if (traceData) {
      const innerDoc = $('#' + traceData.id).contents();
      innerDoc.find('*').map((i, elem: HTMLElement) => {
        let j = 0;
        for (const key in elem) {
          const v = (elem as unknown as { [k: string]: object | undefined })[key];
          if (v && key.startsWith('on')) {
            const newV = `$__trace__${i}_${j++}`;
            const fnText: string = v.toString();
            const inner = fnText
              .slice(fnText.indexOf('{') + 1, fnText.lastIndexOf('}'))
              .trim();
            if (!inner.startsWith('$__trace__')) {
              elem.setAttribute(key, newV + '()');
              Object.defineProperty(innerDoc[0], newV, { value: (): void => {
                traceData.trace(inner, true);
              }});
            }
          }
        }
      });
    }
  });
  
  return (
    <>
      <iframe
        id={traceData?.id}
        className={cs(
          styles['document'],
          blurred && styles['document--blurred']
        )}
        title="document"
        srcDoc={srcDoc}
      />
      {blurred ? <div className={styles['document__overlay']} /> : null}
    </>
  );
};

export default Document;
