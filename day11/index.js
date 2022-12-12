const fs = require('fs')

const parseBlock = ([
  monkeyLine,
  itemsLine,
  opLine,
  testLine,
  trueLine,
  falseLine,
]) => {
  const id = monkeyLine.split(' ')[1].slice(0, -1)
  const items = itemsLine.split(': ')[1].split(', ').map(s => parseInt(s, 10))
  const [operatorStr, opAmountStr] = opLine.split('old ')[1].split(' ')

  const opAmount = opAmountStr === 'old' ? 'old' : parseInt(opAmountStr, 10)
  const op = old => operatorStr === '*'
    ? opAmount === 'old' ? old * old : old * opAmount
    : opAmount === 'old' ? old + old : old + opAmount

  const divAmount = parseInt(testLine.split('by ')[1], 10)
  const trueTarget = trueLine.split('monkey ')[1]
  const falseTarget = falseLine.split('monkey ')[1]

  return { id, items,  op, divAmount, trueTarget, falseTarget }
}

const goMonkey = reduceWorryBy => (state, monkeyId) => {
  const monkey = state[monkeyId]

  return monkey.items.reduce((acc, item) => {
    const afterOp = monkey.op(item)

    const worryLevel = reduceWorryBy.type === 'mod'
      ? afterOp % reduceWorryBy.val
      : Math.floor(afterOp / 3)

    const target = (worryLevel % monkey.divAmount === 0)
      ? monkey.trueTarget
      : monkey.falseTarget

    return {
      ...acc,
      [target]: {
        ...acc[target],
        items: [...acc[target].items, worryLevel]
      },
      [monkeyId]: {
        ...acc[monkeyId],
        items: acc[monkeyId].items.slice(1),
        inspected: acc[monkeyId].inspected + 1,
      }
    }
  }, state)
}

const goRound = (state, reduceWorryBy) => Object.keys(state).reduce(goMonkey(reduceWorryBy), state)

const goFor = (initialState, rounds, reduceWorryBy) => {
  let state = initialState
  for (let i = 0; i < rounds; i++) {
    state = goRound(state, reduceWorryBy)
  }

  const [first,second] = Object.values(state).map(s => s.inspected).sort((a,b) => b - a)
  return first * second
}

const part1 = initialState => {
  console.log(goFor(initialState, 20, { type: 'div' }))
}

/**
 * Without the division by 3, the numbers will overflow an int, so need to
 * reduce them while preserving behaviour – modding by the LCM is an easy way
 * to do that
 */
const part2 = initialState => {
  const lcm = Object.values(initialState)
    .map(s => s.divAmount)
    .reduce((acc, n) => acc * n, 1)

  console.log(goFor(initialState, 10000, { type: 'mod', val: lcm }))
}

const input = fs.readFileSync('./input.txt', {encoding:'utf8'})

const initialState = input
  .split('\n\n')
  .map(b => b.trim())
  .map(b => parseBlock(b.split('\n')))
  .reduce((acc, monkey) => ({
    ...acc,
    [monkey.id]: { ...monkey, inspected: 0 },
  }), {})

part1(initialState)
part2(initialState)
