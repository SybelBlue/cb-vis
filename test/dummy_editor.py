x = 0

def pows_of_2(n):
    for i in range(n):
        print(2 ** \
            i)

def onclick(e, opt=False):
    print('hello', e, ':' + (')' if opt else '('))
    global x
    x += 1
    pows_of_2(3)

print(x)
onclick(x, opt=True)
print(x, \
    'te' + \
        'st')