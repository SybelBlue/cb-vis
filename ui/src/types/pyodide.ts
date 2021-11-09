export interface Pyodide {
  runPython: (source: string) => void;
  PythonError: {
    name: string;
  };
}
