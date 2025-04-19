from collections import defaultdict


fib_lengths = defaultdict(lambda: -1)
fib_lengths[1] = 1
fib_lengths[2] = 1


def get_length(index):
    if index > 87:
        return -1
    if index not in fib_lengths:
        fib_lengths[index] = get_length(index - 2) + get_length(index - 1)
    return fib_lengths[index]


def batmanacci_symbol(n, k):
    if n == 1:
        return 'N'
    if n == 2:
        return 'A'
    
    left_size = get_length(n - 2)

    while left_size == -1:
        n -= 1
        left_size = get_length(n - 2)

    if k <= left_size:
        return batmanacci_symbol(n - 2, k)
    else:
        return batmanacci_symbol(n - 1, k - left_size)


N, K = map(int, input().split())
print(batmanacci_symbol(N, K))
