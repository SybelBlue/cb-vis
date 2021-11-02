x = 0

def onclick():
    print('hello')
    global x
    x += 1
    for i in range(3):
        print(2 ** \
            i)

print(x)
onclick()
print(x, \
    'test')