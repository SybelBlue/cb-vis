from ast import stmt

class Debugger:
    def __init__(self):
        self.globals = dict()
        self.user_names = dict()

    def advance(self, statement: stmt):
        print('highlight line(s)', *range(statement.lineno, statement.end_lineno))
        try:
            locals = dict()
            exec(self.code(), globals, locals)
            if locals:
                print(locals)
                self.globals.update(locals)
                self.user_names.update({k: statement for k in locals.keys()})
        except Exception as e:
            print(e)
