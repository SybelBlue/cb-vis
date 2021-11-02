from ast import *

class StatementExtractor(NodeVisitor):
    @staticmethod
    def extract_from_file(path) -> list[stmt]:
        with open(path, 'r') as f:
            ls = ''.join(f.readlines())

        return StatementExtractor().visit(parse(ls))
    
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


