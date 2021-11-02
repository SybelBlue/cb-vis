x = 0

def onclick():
    print('hello')
    global x
    x += 1

print(x)
onclick()
print(x, \
    'test')