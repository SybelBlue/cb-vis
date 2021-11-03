from ast import *
from typing import *

from os.path import join, split


class ASTDebugger(NodeVisitor):
    def __init__(self) -> None:
        super().__init__()

    def visit(self, node: AST) -> Iterable[stmt]:
        if isinstance(node, stmt):
            yield dump(node)
        for n in iter_child_nodes(node):
            for x in self.visit(n):
                yield x




def __main__():
    with open(join(split(__file__)[0], '../test/dummy_editor.py'), 'r') as f:
        code = ''.join(f.readlines())
    db = ASTDebugger()
    for x in db.visit(parse(code)):
        input(';')
        print(x)


if __name__ == '__main__':
    __main__()

