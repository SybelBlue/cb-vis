import cs from 'classnames';

import styles from './Document.module.css';

interface Props {
  srcDoc: string;
  blurred: boolean;
}

const Document: React.FC<Props> = ({ srcDoc, blurred }) => {
  return (
    <iframe
      className={cs(styles['document'], blurred && styles['document--blurred'])}
      title="document"
      srcDoc={srcDoc}
    />
  );
};

export default Document;
