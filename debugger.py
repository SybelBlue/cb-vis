from typing import *

from functools import partialmethod
from types import FrameType
from dataclasses import fields, dataclass
from bdb import Bdb
from json import dumps


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


def get_user_code():
    try:
        import js
        return js.document.getUserCode()
    except Exception:
        from os.path import join, split
        with open(join(split(__file__)[0], 'test/dummy_editor.py'), 'r') as f:
            return f.read()


def __main__():
    code = get_user_code()
    record = list()
    gs, reg = dict(), globals()

    def log(x: TraceData):
        x_dict = x.to_dict()
        try:
            import js
            x_dict['iframestate'] = js.document.getIframeState()
        except Exception:
            pass
        record.append(x_dict)

    db = Debugger(log)
    db.run(code, gs)

    try:
        import js
        js.document.reportRecord(safe_serialize(record))
    except Exception:
        ls = {k: v for k, v in gs.items() if k not in reg}
        for r in record:
            print(safe_serialize(r))
        print('final user globals:', ls)


if __name__ == '__main__':
    __main__()
