from typing import *

from ast import *

from dataclasses import dataclass


@dataclass
class SourceFileMap:
    pass


class StatementExtractor(NodeVisitor):
    def __init__(self):
        super().__init__()
        self.stmts = list()
    
    def visit(self, node: AST) -> list[stmt]:
        if isinstance(node, stmt):
            self.stmts.append(node)
        else:
            for child in iter_child_nodes(node):
                self.visit(child)
        return self.stmts


if __name__ == '__main__':
    with open('test/dummy_editor.py', 'r') as f:
        ls = ''.join(f.readlines())

    code = parse(ls, 'editor.py')

    top_level_statements = StatementExtractor().visit(code)
    
