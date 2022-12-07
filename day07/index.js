const fs = require('fs')

class Dir {
  constructor(name, children) {
    this.name = name
    this.children = children
  }
}

class File {
  constructor(name, size) {
    this.name = name
    this.size = parseInt(size, 10)
  }
}

const sum = xs => xs.reduce((acc, x) => acc + x, 0)

const readFileAndDirLines = ([line, ...lines], [files, dirs]) =>
  !line || line.startsWith('$ ')
    ? [[files, dirs], [line, ...lines]]
    : line.startsWith('dir ')
      ? readFileAndDirLines(lines, [files, [...dirs, line]])
      : readFileAndDirLines(lines, [[...files, line], dirs])

const mkTree = ([dirLine, lsLine, ...lines]) => {
  if (dirLine === '$ cd ..') {
    return mkTree([lsLine, ...lines])
  }

  const [
    [fileLines, dirLines],
    restLines
  ] = readFileAndDirLines(lines, [[], []])

  const [dirs, restLines2] = dirLines.reduce(([dirs, lines], _dirLine) => {
    const [dir, lines2] = mkTree(lines)
    return [[...dirs, dir], lines2]
  }, [[], restLines])

  const files = fileLines.map(fileLine => {
    const [size, name] = fileLine.split(' ')
    return new File(name, size)
  })

  const dir = new Dir(dirLine.slice(5), [...files,...dirs])

  return [dir, restLines2]
}

const nodeSize = (node) => {
  if (node instanceof File) {
    return node.size
  } else {
    return sum(node.children.map(nodeSize))
  }
}

const findDirsWhereSize = (node, f) => {
  if (node instanceof File) {
    return []
  }

  const size = nodeSize(node)

  return [
    ...(f(size) ? [size] : []),
    ...node.children.flatMap(c => findDirsWhereSize(c, f))
  ]
}

const part1 = (tree) => {
  const sizes = findDirsWhereSize(tree, size => size <= 100000)
  console.log(sum(sizes))
}

const part2 = (tree) => {
  const spaceUsed = nodeSize(tree)

  const totalSpace = 70000000
  const spaceUnused = totalSpace - spaceUsed

  const goal = 30000000
  const amountToFree = goal - spaceUnused

  const sizes = findDirsWhereSize(tree, size => size >= amountToFree)
  console.log(sizes.sort((a,b) => a-b)[0])
}

const input = fs.readFileSync('./input.txt', {encoding:'utf8'})
const inputLines = input.split('\n').filter(line => !!line)
const [tree] = mkTree(inputLines)

part1(tree)
part2(tree)
