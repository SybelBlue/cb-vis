from types import FrameType
from typing import *

from bdb import Bdb

from os.path import join, split

ignore_modules = {}

class Debugger(Bdb):
    def __init__(self) -> None:
        super().__init__(skip=ignore_modules)

    # Derived classes should override the user_* methods
    # to gain control.

    def trace_dispatch(self, frame: FrameType, event: str, arg: Any):
        return super().trace_dispatch(frame, event, arg)

    def user_call(self, frame, argument_list):
        """Called if we might stop in a function."""
        print('call', frame, argument_list)

    def user_line(self, frame):
        """Called when we stop or break at a line."""
        print('line', frame)
    
    def user_return(self, frame, return_value):
        """Called when a return trap is set here."""
        print('return', frame, return_value)

    def user_exception(self, frame, exc_info):
        """Called when we stop on an exception."""
        print('exception', frame, exc_info)


def __main__():
    db = Debugger()

    with open(join(split(__file__)[0], '../test/dummy_editor.py'), 'r') as f:
        code = ''.join(f.readlines())
    db = Debugger()
    gs, reg = dict(), globals()
    db.run(code, gs)
    
    print({k: v for k, v in gs.items() if k not in reg})

    


if __name__ == '__main__':
    __main__()

