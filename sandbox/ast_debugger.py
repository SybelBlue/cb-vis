from ast import *
from typing import *

import inspect as ins

from dataclasses import dataclass, field

from os.path import join, split

@dataclass(frozen=True, init=True, repr=True)
class LocalsStack:
    prev: 'LocalsStack'
    data: dict[str, Any] = field(default_factory=dict)

    def flatten(self) -> dict[str, Any]:
        out = self.prev.flatten() if self.prev else dict()
        out.update(self.data)
        return out
    
    def __setitem__(self, name, val):
        self.data[name] = val
    
    def __getitem__(self, name):
        return self.data[name]
    
    def __contains__(self, name):
        return name in self.data

class ASTDebugger(NodeVisitor):
    def __init__(self) -> None:
        super().__init__()
        self.globals = dict()
        self.locals = None
        self.funcs: dict[str, FunctionDef] = dict()
    
    def lookup(self, name):
        return (self.locals if self.locals and name in self.locals else self.globals)[name]
    
    def visit(self, node):
        """Visit a node."""
        method = 'visit_' + node.__class__.__name__
        if hasattr(self, method):
            for x in getattr(self, method)(node):
                yield x
        elif isinstance(node, mod):
            for c in iter_child_nodes(node):
                for x in self.visit(c):
                    yield x
        else:
            print('missed', unparse(node))
            yield self.exec_in_scope(node)
        
    def visit_FunctionDef(self, node: FunctionDef) -> Any:
        self.funcs[node.name] = node
        yield self.exec_in_scope(node)

    def visit_Assign(self, node: Assign) -> Any:
        v = self.eval_in_scope(node.value)
        for t in node.targets:
            (self.locals or self.globals)[unparse(t)] = v
        yield v
    
    def visit_AugAssign(self, node: AugAssign) -> Any:
        self.exec_in_scope(node)
        yield (self.locals or self.globals)[unparse(node.target)]

    def visit_Expr(self, node: Expr) -> Any:
        for c in iter_child_nodes(node):
            for x in self.visit(c):
                yield x
    
    def visit_Call(self, node: Call) -> Any:
        self.locals = LocalsStack(self.locals)
        if isinstance(node.func, Name) and node.func.id in self.funcs:
            f = self.lookup(node.func.id)
            f_def = self.funcs[node.func.id]
            sig = ins.signature(f)
        else:
            v = self.exec_in_scope(node)
            self.locals = self.locals.prev
            yield v
    
    def visit_Return(self, node: Return) -> Any:
        yield self.eval_in_scope(node.value)
    
    def exec_in_scope(self, node: AST):
        return exec(unparse(node), self.globals, self.locals and self.locals.data)
    
    def eval_in_scope(self, node: AST):
        return eval(unparse(node), self.globals, self.locals and self.locals.data)





def __main__():
    with open(join(split(__file__)[0], '../test/dummy_editor.py'), 'r') as f:
        code = ''.join(f.readlines())
    db = ASTDebugger()
    for x in db.visit(parse(code)):
        # input(';')
        print('>', x, db.locals)


if __name__ == '__main__':
    __main__()

