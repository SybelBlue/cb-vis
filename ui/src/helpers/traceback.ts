export const getExceptionLineNumber = (tb: string): number => {
  const lineIdx = tb.lastIndexOf('line ') + 'line '.length;
  const searchString = tb.slice(lineIdx);
  const lineno = searchString.slice(0, searchString.indexOf('\n'));

  return parseInt(lineno, 10);
};
