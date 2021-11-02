from ast import *
from typing import *

class Debugger:
    def __init__(self, on_recurse: Callable[[stmt], Any]):
        self.globals = dict()
        self.user_names = dict()
        self.on_recurse = on_recurse

    def run(self, statement: stmt):
        print('highlight line(s)', *range(statement.lineno, statement.end_lineno + 1))

        if isinstance(statement, Expr) and \
                isinstance(statement.value, Call) and \
                    isinstance(statement.value.func, Name) and \
                        statement.value.func.id in self.user_names:
            print('called', statement.value.func.id)
            def_node = self.user_names[statement.value.func.id]
            body_stmts = def_node.body  # must be stmts by spec
            for bs in body_stmts:
                self.on_recurse(bs)    
        else:
            try:
                locals = dict()
                exec(unparse(statement), self.globals, locals)
                if locals:
                    print(locals)
                    self.globals.update(locals)
                    self.user_names.update({k: statement for k in locals.keys()})
            except Exception as e:
                print(e)
