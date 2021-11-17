import sys
from os.path import join, split
import trace


def __main__():
    tracer = trace.Trace(
        ignoredirs=[sys.prefix, sys.exec_prefix],
        trace=0,
        count=0
    )

    with open(join(split(__file__)[0], '../test/dummy_editor.py'), 'r') as f:
        code = ''.join(f.readlines())

    tracer.run(code)

    r = tracer.results()
    r.write_results(show_missing=True, coverdir='.')
