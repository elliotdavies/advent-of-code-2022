const fs = require('fs')

const initialState = {
  crtPixels: [],
  cycles: 1,
  registers: {
    x: 1
  },
  currentInstruction: null,
}

const updateRegisters = (instr, rs) => {
  switch (instr.type) {
    case 'addx': {
      return { ...rs, x: rs.x + instr.v }
    }
    default:
      throw new Error(`Unexpected instr: ${instr}`)
  }
}

const go = (lines, state, stopAt) => {
  const { crtPixels, cycles, registers, currentInstruction } = state

  if (cycles === stopAt) {
    return [state, lines]
  }

  // CRT stuff
  const crtColIdx = (cycles - 1) % 40 // 0 to 39
  const crtRowIdx = Math.floor((cycles - 1) / 40) // 0-indexed

  const pixel = [crtColIdx - 1, crtColIdx, crtColIdx + 1].includes(registers.x) ? '#' : '.'

  const crtPixels_ = crtColIdx === 0
    ? [...crtPixels, [pixel]]  // Start a new row
    : crtPixels.map((row, i) => i === crtRowIdx ? [...row, pixel] : row) // Extend existing row

  // Pending instr = execute, do not parse line
  if (currentInstruction) {
    const updatedState = {
      crtPixels: crtPixels_,
      cycles: cycles + 1,
      registers: updateRegisters(currentInstruction, registers),
      currentInstruction: null,
    }
    return go(lines, updatedState, stopAt)
  }
  // No pending instr and no lines left
  else if (lines.length === 0) {
    return [state, lines]
  }
  // No pending instr = parse next line
  else {
    const [line, ...rest] = lines

    let instr
    if (line === 'noop') {
      instr = { type: 'noop' }
    } else {
      [,v] = line.split(' ')
      instr = { type: 'addx', v: parseInt(v, 10) }
    }

    const updatedState = {
      crtPixels: crtPixels_,
      cycles: cycles + 1,
      registers,
      currentInstruction: instr.type === 'noop' ? null : instr
    }

    return go(rest, updatedState, stopAt)
  }
}

const part1 = initialLines => {
  const stops = [20, 60, 100, 140, 180, 220]

  const [score] = stops.reduce(([score, state, lines], stop) => {
    const [state_, lines_] = go(lines, state, stop)
    const score_ = score + (state_.registers.x * state_.cycles)
    return [score_, state_, lines_]
  }, [0, initialState, initialLines])

  console.log(score)
}

const part2 = initialLines => {
  const [{crtPixels}] = go(initialLines, initialState)
  console.log(crtPixels.map(row => row.join('')).join('\n'))
}

const input = fs.readFileSync('./input.txt', {encoding:'utf8'})
const inputLines = input.split('\n').filter(line => !!line)

part1(inputLines)
part2(inputLines)
