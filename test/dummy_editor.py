x = 0

def pows_of_2(n):
    for i in range(n):
        print(2 ** \
            i)

def onclick(e):
    print('hello', e)
    global x
    x += 1
    pows_of_2(3)

print(x)
onclick('world')
print(x, \
    'te' + \
        'st')