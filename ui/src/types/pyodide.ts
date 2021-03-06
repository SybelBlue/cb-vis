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
  has: (name: string) => boolean;
  get: (name: string) => unknown | PyProxy;
  set: (name: string, value: unknown) => void;
  [Symbol.iterator]: () => { next: () => { value: string } };
}

export type SyntaxChecker = (code: string) => string | undefined;

export type TraceExec = (
  code: string,
  reporter: (json: string) => void,
  setCallback: (selector: string, event: string, cb: object) => void,
  append: (selector: string, html: string) => void,
  globals?: PyProxy
) => PyProxy;

export type TraceFn = (
  code: string,
  ignoreFirst?: boolean
) => PyProxy | undefined;

export interface TraceData {
  frame: { lineno: number; locals: Record<string, unknown> };
  type: 'call' | 'line' | 'return' | 'exception';
  arg?: string;
  arg_name?: string;
  stdout: string;
  stderr: string;
}
