import { atom } from 'jotai';

export const documentAtom = atom<string>(
  `<h1>Hello cb-vis!</h1>\n<button>Click Me!</button>\n<ol id='list'></ol>`
);
export const iframeAtom = atom<string>('');
export const programAtom = atom<string>(
  `def pows_of_2(n):
  for i in range(n):
    print(2 ** i)

pows_of_2(3)

set_callback('button', 'click', "add_item('howdy')")

def add_item(text):
	append_to('#list', '<li> ' + text + ' </li>')
`
);
