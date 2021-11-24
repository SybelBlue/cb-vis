from typing import *

import ast

from io import StringIO
from functools import partialmethod
from types import FrameType
from dataclasses import fields, dataclass
from bdb import Bdb
from json import dumps
from contextlib import redirect_stdout, redirect_stderr


def safe_serialize(obj, first_call=True):
    if hasattr(obj, 'items'):
        out = {str(k): safe_serialize(v, False) for k, v in obj.items()}
        return dumps(out) if first_call else out
    if isinstance(obj, str) or isinstance(obj, int):
        return obj
    if isinstance(obj, Iterable):
        out = list(map(lambda x: safe_serialize(x, False), obj))
        return dumps(out) if first_call else out
    try:
        return dumps(obj)
    except TypeError:
        return str(obj)


@dataclass(frozen=True, init=True, repr=True)
class TraceData:
    frame: FrameType

    def to_dict(self):
        arg_name = fields(self)[-1].name
        return {
            'frame': {
                'lineno': self.frame.f_lineno,
                'locals': {k: v for k, v in self.frame.f_locals.items() if k != '__builtins__'}
            },
            'type': self.__class__.__name__[:-9].lower(),
            'arg': getattr(self, arg_name),
            'arg_name': arg_name
        }


@dataclass(frozen=True, init=True, repr=True)
class CallTraceData(TraceData):
    arg: Any


@dataclass(frozen=True, init=True, repr=True)
class LineTraceData(TraceData):
    pass


@dataclass(frozen=True, init=True, repr=True)
class ReturnTraceData(TraceData):
    return_value: Any


@dataclass(frozen=True, init=True, repr=True)
class ExceptionTraceData(TraceData):
    exc_info: Any


def with_std(src_fn: Callable, stdout: StringIO, stderr: StringIO):
    def inner(*args, **kwargs):
        with redirect_stderr(stderr), redirect_stdout(stdout):
            return src_fn(*args, **kwargs)
    return inner


class Debugger(Bdb):
    def __init__(self, trace_fn: Callable[[TraceData], None], skip=None) -> None:
        super().__init__(skip=skip)
        self.trace_fn = trace_fn

    def user(self, Type, *args) -> TraceData:
        self.trace_fn(Type(*args))

    user_call = partialmethod(user, CallTraceData)
    user_line = partialmethod(user, LineTraceData)
    user_return = partialmethod(user, ReturnTraceData)
    user_exception = partialmethod(user, ExceptionTraceData)


def trace_exec(code, report_record, set_callback, gs=None):
    record = list()
    gs = gs or { 'set_callback': set_callback }
    std = StringIO(), StringIO()

    def log(x: TraceData):
        x_dict = x.to_dict()
        x_dict['stdout'], x_dict['stderr'] = (x.getvalue() for x in std)
        record.append(x_dict)

    db = Debugger(log)
    run_with_std = with_std(db.run, *std)
    run_with_std(code, gs)

    report_record(safe_serialize(record))

    return gs


def check_syntax(code):
    try:
        ast.parse(code)
        return None
    except SyntaxError as e:
        return safe_serialize({
            'class': e.__class__,
            'lineno': e.lineno,
            'filename': e.filename,
            'msg': e.msg
        }) 


def __main__():
    def print_record(record):
        for r in record:
            print(safe_serialize(r))

    from os.path import join, split
    with open(join(split(__file__)[0], 'test/dummy_editor.py'), 'r') as f:
        return trace_exec(f.read(), print_record)


if __name__ == '__main__':
    check_syntax(', x = 3')
    __main__()
