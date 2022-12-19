const fs = require('fs')

const arrayFrom = n => Array.from(new Array(n)).map((_,i) => i)

const moveHead = ([hX, hY], dir) => {
  switch (dir) {
    case 'U': {
      return [hX, hY - 1]
    }
    case 'D': {
      return [hX, hY + 1]
    }
    case 'L': {
      return [hX - 1, hY]
    }
    case 'R': {
      return [hX + 1, hY]
    }
  }
}

const moveKnot = (prevKnot, [x,y]) => {
  const [pkX, pkY] = prevKnot

  const sameRowOrCol = x === pkX || y === pkY

  const needsToMove = Math.abs(x - pkX) > 1 || Math.abs(y - pkY) > 1

  if (!needsToMove) {
    return [x,y]
  }
  // Horizontal / vertical
  else if (needsToMove && sameRowOrCol) {
    if (pkX > x) return [x+1,y]
    else if (pkX < x) return [x-1,y]
    else if (pkY > y) return [x,y+1]
    else if (pkY < y) return [x,y-1]
  }
  // Diagonal
  else {
    if (pkX > x && pkY > y) return [x+1,y+1]
    else if (pkX > x && pkY < y) return [x+1,y-1]
    else if (pkX < x && pkY > y) return [x-1,y+1]
    else return [x-1,y-1]
  }
}

const print = knots => {
  const width = 26
  const height = 21

  const grid = arrayFrom(height).map(i => i - height + 1).map(
    row => arrayFrom(width).map(
      col => {
        const k = knots.findIndex(([x,y]) => x === col && y === row)
        return k === -1 ? '.' : k === 0 ? 'H' : k
      }
    ).join('')
  ).join('\n')

  console.log(grid)
}

const step = (state, dir) => {
  const { visited, head, knots } = state

  const newHead = moveHead(head, dir)

  const newKnots = []
  for (let i = 0; i < knots.length; i++) {
    const newPrevKnot = newKnots[i - 1] ?? newHead
    newKnots.push(moveKnot(newPrevKnot, knots[i]))
  }

  const newTail = newKnots[newKnots.length - 1]

  return { visited: [...visited, newTail], head: newHead, knots: newKnots }
}

const go = (instrs, initialState) => {
  const { visited, knots, head } = instrs.reduce(step, initialState)
  const numUnique = new Set(visited.map(([x,y]) => `${x}-${y}`)).size
  console.log(numUnique)
}

const part1 = instrs => {
  const origin = [0,0]
  const initialState = { visited: [], head: origin, knots: [origin] }
  go(instrs, initialState)
}

const part2 = instrs => {
  const origin = [11,-5] // Only matters for visualisation

  const initialState = {
    visited: [],
    head: origin,
    knots: arrayFrom(9).map(() => origin)
  }

  go(instrs, initialState)
}

const input = fs.readFileSync('./input.txt', {encoding:'utf8'})

const instrs = input.split('\n').filter(line => !!line).reduce((acc,line,i) => {
  const [dir, n] = line.split(' ')
  return [
    ...acc,
    ...arrayFrom(parseInt(n, 10)).map(() => dir)
  ]
}, [])

part1(instrs)
part2(instrs)
