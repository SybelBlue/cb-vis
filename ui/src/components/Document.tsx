import styles from './Document.module.css';

interface Props {
  srcDoc: string;
}

const Document: React.FC<Props> = ({ srcDoc }) => {
  return (
    <iframe className={styles.document} title="document" srcDoc={srcDoc} />
  );
};

export default Document;
