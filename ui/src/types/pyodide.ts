export interface Pyodide {
  runPython: (source: string) => void;
  PythonError: {
    name: string;
  };
}

export interface TraceData {
  frame: { lineno: number; locals: Record<string, unknown> };
  type: string;
  arg?: string;
  arg_name?: string;
}
