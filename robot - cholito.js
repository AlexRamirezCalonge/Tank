"use strict";
// auxiliary functions
//Check the location of enemies
async function check(tank, diagonals) {
  let distance;
  for (var i = diagonals? 45 : 0; i < 360; i = i + 90) {
    console.log("scanning angle: ", i)
    distance = await tank.scan(i, 10);
    if (distance > 0) return [i, distance]
  }
  return false
}

//avoid walls
async function avoidWall(tank) {
  let x = await tank.getX()
  let y = await tank.getY()
  while (x < 150) {
    await tank.drive(0, 100)
    x = await tank.getX()
  }
  while (x > 1190) {
    await tank.drive(180, 100)
    x = await tank.getX()
  }
  while (y < 150) {
    await tank.drive(90, 100)
    y = await tank.getY()
  }
  while (y > 850) {
    await tank.drive(270, 100)
    y = await tank.getY()
  }
}

//run away from danger
async function runAway(tank, angleToDrive) {
  for (let i = 0; i <= 10; i++) {
    await tank.drive(angleToDrive + 45, 100)
  }
}

async function detectAndShoot(tank, diagonals) {
  let tankInRadar = await check(tank, diagonals)
  if (tankInRadar) {
    let angle = tankInRadar[0]
    let distance = tankInRadar[1]
    await tank.shoot(angle - 5, distance)
    await tank.shoot(angle + 5, distance)
  }
}

async function main(tank) {
  // main loop
  let angleToDrive = 0
  let lastKnownDamage = 0
  let diagonals = false
  while (true) {
    await avoidWall(tank)
    let newDamage = await tank.getDamage()
    if (newDamage !== lastKnownDamage) {
      await runAway(tank, angleToDrive)
      lastKnownDamage = newDamage
    } else {
      await tank.drive(angleToDrive, 45)
      await detectAndShoot(tank, diagonals)
      angleToDrive += 25
      if (angleToDrive > 360) angleToDrive = 0
    }
    diagonals = !diagonals
  }
}
