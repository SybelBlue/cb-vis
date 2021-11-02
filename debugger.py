from ast import *
from typing import *

import inspect as ins

class Debugger:
    def __init__(self):
        self.globals = dict()
        self.user_names = dict()

    def user_call_wrapper(self, f, f_name):
        def inner(*args, **kwargs):
            bindings = ins.signature(f).bind(*args, **kwargs)
            for b in self.user_names[f_name].body:
                self.run(b, bindings=bindings.arguments, record_locals=False)
        return inner
    
    def run(self, statement: stmt, *, bindings=None, record_locals=True):
        print('highlight line(s)', *range(statement.lineno, statement.end_lineno + 1))

        if isinstance(statement, Expr) and \
                isinstance(statement.value, Call) and \
                    isinstance(statement.value.func, Name) and \
                        statement.value.func.id in self.user_names:
            print('called', statement.value.func.id)
            # do something here?
        try:
            locals = bindings or dict()
            
            exec(unparse(statement), self.globals, locals)

            if not record_locals or not locals:
                return
            
            if bindings:
                for b in bindings.keys():
                    del locals[b]
            
            print(locals)
            for k, v in locals.items():
                self.globals[k] = self.user_call_wrapper(v, k) if callable(v) else v
                self.user_names[k] = statement
        except Exception as e:
            print(e)
