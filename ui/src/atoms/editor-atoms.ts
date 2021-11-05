import { atom } from 'jotai';

export const documentAtom = atom<string>('<h1>Hello cb-vis!</h1>');
export const programAtom = atom<string>(
  'def pows_of_2(n):\n\tfor i in range(n):\n\t\tprint(2 ** i)'
);
