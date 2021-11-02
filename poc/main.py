import inspect as ins
from dataclasses import dataclass, replace

class PeekableLines:
    @staticmethod
    def from_file(path) -> 'PeekableLines':
        with open(path, 'r') as f:
            return PeekableLines(f.readlines())

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


@dataclass(init=True, repr=True, frozen=True)
class CodeBlock:
    headline: str
    headlineno: int
    headlinelen: int = 1
    body: list['CodeBlock'] = None

    def code(self):
        if not self.body:
            return self.headline
        return self.headline + ''.join(block.code() for block in self.body)
    
    def exec(self, globals=None):
        locals = dict()
        exec(self.code(), globals, locals)
        return locals


def next_block(line_iter: PeekableLines, skip_empty=True) -> CodeBlock:
    if not line_iter:
        return None

    lineno = ls.index + 1
    line = next(line_iter)
    out = CodeBlock(line, lineno)

    indent = ins.indentsize(line)

    stripped = line.strip()

    if stripped.endswith(':'):
        body = list()
        while line_iter:
            p, = line_iter.peek()
            if ins.indentsize(p) <= indent:
                break
            body.append(next_block(line_iter, skip_empty=False))
        out = replace(out, body=body)

    if stripped.endswith('\\'):
        rest = next_block(line_iter)
        if rest is None:
            return None
        return replace(
            out, 
            headlinelen=1+rest.headlinelen, 
            headline=line + rest.headline
        )

    if skip_empty and (not stripped or stripped.startswith('#')):
        return next_block(line_iter)

    return out

class Debugger:
    def __init__(self):
        self.globals = dict()
        self.user_names = dict()

    def advance(self, line_iter: PeekableLines):
        codeblock = next_block(line_iter)
        if codeblock is None:
            return
        
        print('highlight line(s)', *(codeblock.headlineno + i for i in range(codeblock.headlinelen)))
        try:
            locals = codeblock.exec(self.globals)
            if locals:
                print(locals)
                self.globals.update(locals)
                self.user_names.update({k: codeblock for k in locals.keys()})
        except Exception as e:
            print(e)


if __name__ == '__main__':
    ls = PeekableLines.from_file('poc/dummy_editor.py')
    db = Debugger()

    while ls:
        db.advance(ls)

    print()
