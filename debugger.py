from ast import *

class Debugger:
    def __init__(self):
        self.globals = dict()
        self.user_names = dict()

    def run(self, statement: stmt):
        if isinstance(statement, Expr) and \
                isinstance(statement.value, Call) and \
                    isinstance(statement.value.func, Name) and \
                        statement.value.func.id in self.user_names:
            print('called', statement.value.func.id)
        print('highlight line(s)', *range(statement.lineno, statement.end_lineno + 1))
        try:
            locals = dict()
            exec(unparse(statement), self.globals, locals)
            if locals:
                print(locals)
                self.globals.update(locals)
                self.user_names.update({k: statement for k in locals.keys()})
        except Exception as e:
            print(e)
