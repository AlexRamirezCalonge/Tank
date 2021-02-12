"use strict";
// auxiliary functions
//Check the location of enemies
async function check(tank, diagonals, distance) {
  for (var i = diagonals? 45 : 0; i < 360; i = i + 90) {
    console.log("scanning angle: ", i)
    distance = await tank.scan(i, 10);
    if (distance > 0) return [i, distance]
  }
  return false
}

//avoid walls
async function avoidWall(tank, x, y) {
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

//Detect and shoot enemies
async function detectAndShoot(tank, diagonals, tankInRadar, distance, targetFound) {
  tankInRadar = await check(tank, diagonals, distance)
  if (tankInRadar) {
    await tank.shoot(tankInRadar[0] - 5, tankInRadar[1])
    await tank.shoot(tankInRadar[0] + 5, tankInRadar[1])
    return tankInRadar[0]
  }
  else{
    return false
  }
}

async function main(tank) {
  //variables
  let angleToDrive = 0
  let lastKnownDamage = 0
  let newDamage = await tank.getDamage()
  let diagonals = false
  let x
  let y
  let tankInRadar
  let distance
  let detected

  // main loop
  while (true) {
    x = await tank.getX()
    y = await tank.getY()
    await avoidWall(tank, x, y)
    if (newDamage !== lastKnownDamage) {
      await runAway(tank, angleToDrive)
      lastKnownDamage = newDamage
    }
    else {
      detected = await detectAndShoot(tank, diagonals, tankInRadar, distance)
      if(detected == false){
        await tank.drive(angleToDrive, 45)
      }
      else{
        await tank.drive(detected+25, 90)
      }
      angleToDrive += 25
      if (angleToDrive > 360) angleToDrive -= 360
    }
    diagonals = !diagonals
  }
}
