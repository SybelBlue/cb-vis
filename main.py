from statement_extractor import StatementExtractor
from debugger import Debugger


if __name__ == '__main__':
    top_level_statements = StatementExtractor.extract_from_file('test/dummy_editor.py')

    db = Debugger(lambda s: db.run(s))

    for s in top_level_statements:
        # cmd = input('>')
        # if not cmd:
        #     db.run(s)
        # elif cmd.lower() == 'q':
        #     break
        db.run(s)