'use strict'

class Vec2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Character {
  constructor(aa) {
    this.aa = aa
  }
}

let maze = [
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1],
]

const character = {
  player: 0,
  enemy0: 1,
  enemy1: 2,
  max: 3,
}

let ai = {
  random: 0,
  chase: 1,
  max: 2,
}

const cell = {
  none: 0,
  wall: 1,
  dot: 2,
  max: 3,
}

let direction = {
  up: 0,
  left: 1,
  down: 2,
  right: 3,
  max: 4,
}

let directions = [
  new Vec2(0, -1),
  new Vec2(-1, 0),
  new Vec2(0, 1),
  new Vec2(1, 0),
]
let intervalID

const cellAA = ['　', '■', '・']
let characters = [new Character('Ｐ'), new Character('Ｒ'), new Character('Ｃ')]
let player = characters[character.player]
let enemies = [characters[character.enemy0], characters[character.enemy1]]

init()

function init() {
  player.pos = new Vec2(4, 1)
  enemies[0].pos = new Vec2(1, 4)
  enemies[1].pos = new Vec2(7, 4)
  enemies[0].ai = ai.random
  enemies[1].ai = ai.chase

  for (let i = 0; i < enemies.length; i++)
    enemies[i].lastPos = new Vec2(enemies[i].pos.x, enemies[i].pos.y)

  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === cell.none) maze[i][j] = cell.dot
    }
  }
  if (typeof intervalID != 'undefined') clearInterval(intervalID)
  intervalID = window.setInterval(interval, 1000)

  draw()

  window.onkeydown = onKeyDown
}
function onKeyDown(e) {
  draw()
}

function draw() {
  let html = ''
  let str

  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      str = cellAA[maze[i][j]]
      for (let k = 0; k < characters.length; k++)
        if (i === characters[k].pos.y && j === characters[k].pos.x)
          str = characters[k].aa
      html += str
    }
    html += '<br>'
  }

  html += `<br> [w, x, a, d]: プレイヤーの移動`

  let div = document.querySelector('div')
  div.innerHTML = html
}

function onKeyDown(e) {
  let targetPos = new Vec2(player.pos.x, player.pos.y)
  switch (e.key) {
    case 'ArrowUp':
      targetPos.y--
      break
    case 'ArrowDown':
      targetPos.y++
      break
    case 'ArrowLeft':
      targetPos.x--
      break
    case 'ArrowRight':
      targetPos.x++
      break
  }

  loopPos(targetPos)

  switch (maze[targetPos.y][targetPos.x]) {
    case cell.none:
      player.pos = new Vec2(targetPos.x, targetPos.y)
      break
    case cell.wall:
      break
    case cell.dot:
      player.pos = new Vec2(targetPos.x, targetPos.y)
      maze[targetPos.y][targetPos.x] = cell.none
  }
  if (isEnd()) {
    init()
    return
  }
  draw()
}

function loopPos(v) {
  if (v.x < 0) v.x = maze[0].length - 1
  if (v.x >= maze[0].length) v.x = 0
  if (v.y < 0) v.y += maze.length
  if (v.y >= maze.length) v.y -= maze.length
}

function interval() {
  for (let i = 0; i < enemies.length; i++) enemyMove(enemies[i])
  if (isEnd()) {
    init()
    return
  }
}

function enemyMove(enemy) {
  let canMoveList = []
  let v

  for (let i = 0; i < direction.max; i++) {
    v = new Vec2(enemy.pos.x + directions[i].x, enemy.pos.y + directions[i].y)
    loopPos(v)
    if (maze[v.y][v.x] === cell.wall) continue
    if (v.x === enemy.lastPos.x && v.y === enemy.lastPos.y) continue

    canMoveList.push(v)
  }

  enemy.lastPos = new Vec2(enemy.pos.x, enemy.pos.y)
  switch (enemy.ai) {
    case ai.random:
      let r = parseInt(Math.random() * canMoveList.length)
      enemy.pos = canMoveList[r]
      break
    case ai.chase:
      function getDistance(v0, v1) {
        return (
          Math.sqrt(Math.pow(v0.x - v1.x, 2)) +
          Math.sqrt(Math.pow(v0.y - v1.y, 2))
        )
      }
      let nearest = canMoveList[0]
      for (let i = 1; i < canMoveList.length; i++) {
        if (
          getDistance(player.pos, nearest) >
          getDistance(player.pos, canMoveList[i])
        )
          nearest = canMoveList[i]
      }
      enemy.pos = new Vec2(nearest.x, nearest.y)
      break
  }
  draw()
}

function isEnd() {
  for (let i = 0; i < enemies.length; i++)
    if (
      enemies[i].pos.x === player.pos.x &&
      enemies[i].pos.y === player.pos.y
    ) {
      alert('You are loss')
      return true
    }

  for (let i = 0; i < maze.length; i++)
    for (let j = 0; j < maze[i].length; j++)
      if (maze[i][j] === cell.dot) return false
  alert('You are Win!!')
  return true
}
