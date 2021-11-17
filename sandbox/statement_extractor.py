from ast import *
from typing import Iterable

class StatementExtractor(NodeVisitor):
    @staticmethod
    def extract_from_file(path) -> Iterable[stmt]:
        with open(path, 'r') as f:
            ls = ''.join(f.readlines())

        return StatementExtractor.extract(parse(ls))
    
    @staticmethod
    def extract(node: AST) -> Iterable[stmt]:
        return StatementExtractor().visit(node)
    
    def visit(self, node: AST) -> Iterable[stmt]:
        if isinstance(node, stmt):
            yield node
        else:
            for child in iter_child_nodes(node):
                for x in self.visit(child):
                    yield x


