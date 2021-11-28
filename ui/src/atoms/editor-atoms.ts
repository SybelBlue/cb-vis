import { atom } from 'jotai';

export const documentAtom = atom<string>(
  `<h1>Hello cb-vis!</h1>\n<button onclick="add_item('howdy')">Click Me!</button>\n<ol id='list'></ol>`
);
export const iframeAtom = atom<string>('');
export const programAtom = atom<string>(
  `def pows_of_2(n):\n\tfor i in range(n):\n\t\tprint(2 ** i)\n\npows_of_2(3)\n\ndef add_item(text):\n\tappend_to('#list', '<li> ' + text + ' </li>')\n`
);
