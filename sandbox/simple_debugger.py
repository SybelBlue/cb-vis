from ast import *
from functools import partial
from typing import *

import inspect as ins

class Debugger:
    def __init__(self):
        self.globals = dict()
        self.user_names = dict()

    def user_call_wrapper(self, f: Callable, f_name: str):
        def inner(*args, **kwargs):
            bindings = ins.signature(f).bind(*args, **kwargs)
            print('debugging', f_name, bindings)
            for b in self.user_names[f_name].body:
                v = self.run(b, bindings=bindings.arguments)
                if isinstance(v, SyntaxError) and v.msg.index('return') >= 0:
                    break
                if isinstance(v, Exception):
                    return v
            
            # todo: figure out how to execute f(*args, **kwargs) with ctxt self.globals
            return None
        return inner

    def run(self, statement: stmt, *, bindings=None):
        print('highlight line(s)', *range(statement.lineno, statement.end_lineno + 1))

        if self.is_user_defined_func_call(statement):
            pass # do something here?
        
        try:
            locals = bindings or dict()
            
            ret = exec(unparse(statement), self.globals, locals)

            if not locals:
                return ret
            
            if bindings:
                for b in bindings.keys():
                    del locals[b]
            
            print(locals)
            for k, v in locals.items():
                self.globals[k] = self.user_call_wrapper(v, k) \
                    if callable(v) else v
                self.user_names[k] = statement
            
            return ret
        except Exception as e:
            print('** exception', e)
            return e

    def is_user_defined_func_call(self, statement: stmt):
        return isinstance(statement, Expr) and \
                isinstance(statement.value, Call) and \
                    isinstance(statement.value.func, Name) and \
                        statement.value.func.id in self.user_names
