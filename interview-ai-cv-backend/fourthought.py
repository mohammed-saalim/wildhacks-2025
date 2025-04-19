import sys
from itertools import product

ops = ['+', '-', '*', '/']

def compute(a, b, op):
    if op == '+':
        return a + b
    elif op == '-':
        return a - b
    elif op == '*':
        return a * b
    elif op == '/':
        if b == 0 or a % b != 0:
            raise ZeroDivisionError
        return a // b

results = {}

# Generate all expressions: 4 op1 4 op2 4 op3 4
for o1, o2, o3 in product(ops, repeat=3):
    try:
        val = compute(4, 4, o1)
        val = compute(val, 4, o2)
        val = compute(val, 4, o3)
        expression = f"4 {o1} 4 {o2} 4 {o3} 4 = {val}"
        results[val] = expression
    except ZeroDivisionError:
        continue

# Read input values
for line in sys.stdin:
    n = int(line.strip())
    if n in results:
        print(results[n])
    else:
        print("no solution")
