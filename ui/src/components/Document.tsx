import $ from 'jquery';
import { useEffect } from 'react';
import cs from 'classnames';

import { TraceFn } from '../types/pyodide';

import styles from './Document.module.css';

interface Props {
  srcDoc: string;
  traceData?: {
    id: string;
    trace: TraceFn;
    callbacks: { selector: string; event: string; cb: string }[];
  };
  blurred: boolean;
}

const Document: React.FC<Props> = ({ srcDoc, traceData, blurred }) => {
  useEffect(() => {
    // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
    let isMounted = true;
    if (traceData) {
      const innerDoc = $('#' + traceData.id).contents();
      traceData.callbacks.forEach((c) => {
        innerDoc
          .find(c.selector)
          .toArray()
          .forEach((res) =>
            res.addEventListener(c.event, () => traceData.trace(c.cb, true))
          );
      });
      innerDoc
        .find('*')
        .toArray()
        .forEach((elem: HTMLElement, i: number) => {
          let j = 0;
          for (const key in elem) {
            const v = (elem as unknown as { [k: string]: object })[key];
            if (v && key.startsWith('on')) {
              const newV = `trace${i}_${j++}`;
              const fnText: string = v.toString();
              const inner = fnText
                .slice(fnText.indexOf('{') + 1, fnText.lastIndexOf('}'))
                .trim();
              if (!inner.startsWith('trace')) {
                elem.setAttribute(key, newV + '()');
                Object.defineProperty(innerDoc[0], newV, {
                  value: (): void => {
                    traceData.trace(inner, true);
                  },
                });
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
