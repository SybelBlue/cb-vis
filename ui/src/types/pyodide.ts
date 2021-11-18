export interface Pyodide {
  runPython: (source: string) => void;
  globals: PyProxy;
  runPythonAsync: (source: string) => Promise<void>;
  PythonError: {
    name: string;
  };
}

export interface PyProxy {
  length: number;
  type: string;
  get: (name: string) => unknown | PyProxy;
  [Symbol.iterator]: () => { next: () => { value: string } };
}

export type TraceExec = (
  code: string,
  reporter: (json: string) => void,
  globals?: PyProxy
) => PyProxy;

export interface TraceData {
  frame: { lineno: number; locals: Record<string, unknown> };
  type: string;
  arg?: string;
  arg_name?: string;
}
