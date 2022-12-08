const fs = require('fs')

const lookFrom = (trees, idx) => {
  const self = trees[idx]

  let visible = true, dist = null

  for (let i = idx - 1; i > -1; i--) {
    const tree = trees[i]

    // Part 1: not visible if any tree is >= our size
    if (tree >= self) {
      visible = false

      // Part 2: distance to first tree that is >= our size
      if (dist === null) dist = idx - i

    } else {
      visible = true && visible
    }
  }

  // We hit the edge of the grid without finding a tree >= our size
  if (dist === null) dist = idx

  return { visible, dist }
}

const lookEachWayFrom = (trees, idx) => [
  lookFrom(trees, idx),
  lookFrom([...trees].reverse(), trees.length - idx - 1),
]

const mapTrees = (grid, c, r) => {
  const row = grid[r]
  const col = grid.map(row => row[c])

  const [left, right] = lookEachWayFrom(row, c)
  const [up, down] = lookEachWayFrom(col, r)
  const trees = [left, right, up, down]

  const visible = trees.some(t => t.visible)
  const scenicScore = trees.reduce((acc, t) => t.dist * acc, 1)

  return { visible, scenicScore }
}

const part1 = mapped => {
  console.log(mapped.flatMap(row => row.filter(({ visible }) => visible)).length)
}

const part2 = mapped => {
  console.log(mapped.flatMap(row => row.map(({ scenicScore }) => scenicScore)).sort((a,b) => b-a)[0])
}

const input = fs.readFileSync('./input.txt', {encoding:'utf8'})
const inputGrid = input.split('\n').filter(s => s !== "").map(s => s.split('').map(c => parseInt(c, 10)))
const mapped = inputGrid.map((row, r) => row.map((_, c) => mapTrees(inputGrid, c, r)))

part1(mapped)
part2(mapped)
