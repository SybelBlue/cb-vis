from typing import *

from functools import partialmethod
from types import FrameType
from dataclasses import dataclass
from bdb import Bdb
from os.path import join, split

@dataclass(frozen=True, init=True, repr=True)
class TraceData:
    frame: FrameType


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
    user_call = partialmethod(user, ExceptionTraceData)


def __main__():
    with open(join(split(__file__)[0], '../test/dummy_editor.py'), 'r') as f:
        code = ''.join(f.readlines())

    record = list()
    db = Debugger(record.append)
    gs, reg = dict(), globals()
    db.run(code, gs)
    ls = {k: v for k, v in gs.items() if k not in reg}
    
    print(ls)

if __name__ == '__main__':
    __main__()

