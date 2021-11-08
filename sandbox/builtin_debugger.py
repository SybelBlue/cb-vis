from functools import partialmethod
from sys import stdin
from types import FrameType
from typing import *

from dataclasses import dataclass

from bdb import Bdb

from os.path import join, split

ignore_modules = {}

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
    def __init__(self, trace_fn: Callable[[TraceData], None]) -> None:
        super().__init__(skip=ignore_modules)
        self.trace_fn = trace_fn

    # Derived classes should override the user_* methods
    # to gain control.

    # def user_call(self, frame, argument_list):
    #     """Called if we might stop in a function."""
    #     print('call', frame, argument_list)

    # def user_line(self, frame):
    #     """Called when we stop or break at a line."""
    #     print('line', frame)
    
    # def user_return(self, frame, return_value):
    #     """Called when a return trap is set here."""
    #     print('return', frame, return_value)

    # def user_exception(self, frame, exc_info):
    #     """Called when we stop on an exception."""
    #     print('exception', frame, exc_info)
    
    # def trace_dispatch(self, frame: FrameType, event: str, arg: Any):
    #     import asyncio as aio
    #     sup = super()
    #     async def inner():
    #         print('trace', event, frame, arg)
    #         await aio.sleep(0.5)
    #         return sup.trace_dispatch(frame, event, arg)
    #     return aio.run(inner())

    def user(self, type, *args) -> TraceData:
        self.trace_fn(type(*args))

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
    
    print({k: v for k, v in gs.items() if k not in reg})
    

    


if __name__ == '__main__':
    __main__()

