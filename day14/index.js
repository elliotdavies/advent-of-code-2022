const fs = require('fs')

const arrayFrom = n => Array.from(new Array(n)).map((_,i) => i)

const printGrid = g => g.map(r => r.join('')).join('\n') + '\n'

const mkPathRocks = ([c1, c2, ...cs], rocks) => {
  if (!c1 || !c2) return rocks

  const newRocks = []
  if (c1[0] === c2[0]) {
    const max = Math.max(c1[1], c2[1])
    const min = Math.min(c1[1], c2[1])

    for (let i = min; i <= max; i++) {
      newRocks.push([c1[0], i])
    }
  } else {
    const max = Math.max(c1[0], c2[0])
    const min = Math.min(c1[0], c2[0])

    for (let i = min; i <= max; i++) {
      newRocks.push([i, c1[1]])
    }
  }

  return mkPathRocks([c2, ...cs], [...rocks, ...newRocks])
}

const mkGrid = (paths, addFloor) => {
  const rocks = paths.reduce((acc, path) => {
    return [...acc, ...mkPathRocks(path, [])]
  }, [])

  const xCoords = rocks.map(([x]) => x)
  const yCoords = rocks.map(([,y]) => y)

  let height = Math.max(...yCoords) + 1
  if (addFloor) height += 2

  let maxX = Math.max(...xCoords)
  if (addFloor) maxX += height

  let minX = Math.min(...xCoords)
  if (addFloor) minX -= height

  const width = maxX - minX + 2

  const origin = [500 - minX + 1, 0]

  const grid = arrayFrom(height).map(row => arrayFrom(width).map(col => {
    if (origin[0] === col && origin[1] === row) return '+'

    if (rocks.some(([x,y]) => x - minX + 1 === col && y === row)) {
      return '#'
    } else if (addFloor && row === height - 1) {
      return '#'
    } else {
      return '.'
    }
  }))

  return [grid, origin]
}

const nextSandPos = (grid, origin) => {
  let [x,y] = origin

  while (true) {
    const below = grid[y+1]?.[x]

    if (below === undefined) {
      return false // Grid is full = done
    }

    if (below === '.') {
      y++
      continue
    }

    const belowLeft = grid[y+1][x-1]

    if (belowLeft === '.') {
      x--
      y++
      continue
    }

    const belowRight = grid[y+1][x+1]

    if (belowRight === '.') {
      x++
      y++
      continue
    }

    // Blocked = done
    return [x,y]
  }
}

const part1 = paths => {
  const [grid, origin] = mkGrid(paths, false)
  console.log(printGrid(grid))

  while (true) {
    const pos = nextSandPos(grid, origin)
    if (pos === false) break
    grid[pos[1]][pos[0]] = 'o'
  }

  console.log(printGrid(grid))

  console.log(grid.flat().filter(c => c === 'o').length)
}

const part2 = paths => {
  const [grid, origin] = mkGrid(paths, true)
  console.log(printGrid(grid))

  while (true) {
    const pos = nextSandPos(grid, origin)
    if (pos === false || grid[origin[1]][origin[0]] === 'o') break
    grid[pos[1]][pos[0]] = 'o'
  }

  console.log(printGrid(grid))

  console.log(grid.flat().filter(c => c === 'o').length)
}

const input = fs.readFileSync('./input.txt', {encoding:'utf8'})

const paths = input.split('\n').filter(line => !!line).reduce((acc, line) => {
  const coords = line.split(' -> ')
  return [
    ...acc,
    coords.map(c => c.split(',').map(n => parseInt(n, 10)))
  ]
}, [])

part1(paths)
part2(paths)
