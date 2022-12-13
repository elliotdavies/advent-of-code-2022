const fs = require('fs')

const mkGrid = lines => lines.map((row, r) => row.split('').map((char, c) => {
  if (char === 'S') { 
    return { r, c, val: 1, dist: null, start: true }
  } else if (char === 'E') {
    return { r, c, val: 26, dist: 0 }
  } else {
    return { r, c, val: char.charCodeAt(0) - 96, dist: null }
  }
}))

const printDist = ({ dist }) => dist === null ? '__' : dist < 10 ? `0${dist}` : dist

const printGrid = grid => grid.map(row => row.map(printDist).join(',')).join('\n')

const neighbours = (grid, cell) => [
    grid[cell.r + 1]?.[cell.c],
    grid[cell.r]?.[cell.c + 1],
    grid[cell.r - 1]?.[cell.c],
    grid[cell.r]?.[cell.c - 1],
  ].filter(c => c !== undefined)

const go = grid => {
  const calculatedCells = grid.flatMap(row => row.filter(cell => cell.dist !== null))

  const cellsToCalculate = calculatedCells.flatMap(cell =>
    neighbours(grid, cell)
      .filter(c => c.dist === null) // Cell hasn't been calculated yet
      .filter(c => cell.val <= c.val + 1) // And could move from neighbour to cell
  )

  if (cellsToCalculate.length === 0) return grid

  const updatedGrid = cellsToCalculate.reduce((acc, cell) => {
    const neighbourDists =
      neighbours(grid, cell)
        .filter(c => c.dist !== null) // Cell has been calculated
        .filter(c => c.val <= cell.val + 1) // And could move from cell to neighbour
        .map(c => c.dist)

    const updatedCell = { ...cell, dist: Math.min(...neighbourDists) + 1 }

    return acc.map((row,r) =>
      r === updatedCell.r
        ? row.map((cell_, c) => c === updatedCell.c ? updatedCell : cell_)
        : row
    )
  }, grid)

  return go(updatedGrid)
}

const part1 = lines => {
  const finalGrid = go(mkGrid(lines))
  // console.log(printGrid(finalGrid)) 
  console.log(finalGrid.flat().find(c => c.start).dist)
}

const part2 = lines => {
  const finalGrid = go(mkGrid(lines))
  const dists = finalGrid.flat()
    .filter(c => c.val === 1 && c.dist !== null)
    .map(c => c.dist)
  console.log(Math.min(...dists))
}

const input = fs.readFileSync('./input.txt', {encoding:'utf8'})
const inputLines = input.split('\n').filter(line => !!line)

part1(inputLines)
part2(inputLines)
