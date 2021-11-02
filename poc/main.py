import inspect as ins


class Peekable:
    def __init__(self, data) -> None:
        self.data = iter(data)
        self.peeked = None  # None, False, or (_,)
        self.index = 0

    def peek(self):
        if self.peeked is None:
            try:
                self.peeked = (next(self.data),)
            except StopIteration as e:
                self.peeked = False
        return self.peeked

    def __next__(self):
        if self.peeked:  # only when (_,)
            val, = self.peeked
            self.peeked = None
            self.index += 1
            return val

        out = next(self.data)
        self.index += 1  # don't incr if next raises StopIter
        return out

    def __iter__(self):
        return self

    def __bool__(self):
        return bool(self.peek())


def next_execable(line_iter: Peekable):
    if not line_iter:
        return None

    line = next(line_iter)

    indent = ins.indentsize(line)

    stripped = line.strip()

    if stripped.endswith(':'):
        body = ''
        while line_iter:
            p, = line_iter.peek()
            if ins.indentsize(p) <= indent:
                break
            body += next(line_iter)
        line += body

    if stripped.endswith('\\'):
        rest = next_execable(line_iter)
        if rest is None:
            return None
        return line + rest

    if not stripped or stripped.startswith('#'):
        return next_execable(line_iter)

    return line


class Debugger:
    def __init__(self):
        self.globals = dict()
        self.user_names = set()

    def advance(self, line_iter: Peekable):
        lineno = ls.index + 1
        l = next_execable(line_iter)
        if l is None:
            return
        print('highlight line', lineno)
        try:
            locals = dict()
            exec(l, self.globals, locals)
            if locals:
                print(locals)
                self.globals.update(locals)
                self.user_names.update(locals.keys())
        except Exception as e:
            print(e)


if __name__ == '__main__':
    with open('poc/dummy_editor.py', 'r') as f:
        ls = Peekable(f.readlines())

    db = Debugger()

    while ls:
        db.advance(ls)

    print()
