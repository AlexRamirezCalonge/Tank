"use strict";
// auxiliary functions
//Check the location of enemies
async function check(tank, diagonals, distance) {
  let enhancedDistanceRight
  let enhancedDistanceLeft
  for (var i = diagonals? 45 : 0; i < 360; i = i + 90) {
    distance = await tank.scan(i, 10);
    if (distance > 0){
      enhancedDistanceRight = await tank.scan(i, 5);
      enhancedDistanceLeft = await tank.scan(i+5, 5);
      if(enhancedDistanceRight == 0 && enhancedDistanceLeft>0){
        //is going left
        return [i+5, enhancedDistanceLeft]
      }
      else if (enhancedDistanceRight > 0 && enhancedDistanceLeft==0)
      {
        //is going right
        return [i+5, enhancedDistanceRight]
      }
      else
      {
        return [i, distance]
      }
    } 
  }
  return false
}

//avoid walls
async function avoidWall(tank, x, y) {
  while (x < 150) {
    await tank.drive(0, 90)
    x = await tank.getX()
    return 0
  }
  while (x > 1190) {
    await tank.drive(180, 90)
    x = await tank.getX()
    return 180
  }
  while (y < 150) {
    await tank.drive(90, 90)
    y = await tank.getY()
    return 90
  }
  while (y > 850) {
    await tank.drive(270, 90)
    y = await tank.getY()
    return 270
  }
}

//run away from danger
async function runAway(tank, angleToDrive) {
    await tank.drive(angleToDrive + 45, 90)
    return angleToDrive + 90
}

//Detect and shoot enemies
async function detectAndShoot(tank, diagonals, tankInRadar, distance, targetFound) {
  tankInRadar = await check(tank, diagonals, distance)
  if (tankInRadar) {
    await tank.shoot(tankInRadar[0] - 2, tankInRadar[1])
    await tank.shoot(tankInRadar[0] + 2, tankInRadar[1])
    return tankInRadar
  }
  else{
    return false
  }
}

async function main(tank) {
  //variables
  let angleToDrive = 0
  let lastKnownDamage = 0
  let angleToChange = 0
  let newDamage 
  let diagonals = false
  let x
  let y
  let tankInRadar
  let distance
  let detected

  // main loop
  while (true) {
    newDamage = await tank.getDamage()
    x = await tank.getX()
    y = await tank.getY()
    angleToChange = await avoidWall(tank, x, y)
    if (newDamage !== lastKnownDamage) {
      angleToChange = await runAway(tank, angleToDrive)
      lastKnownDamage = newDamage
    }
    else {
      detected = await detectAndShoot(tank, diagonals, tankInRadar, distance)
      if(detected == false){
        await tank.drive(angleToDrive, 45)
      }
      else if (detected[1] < 100){
        angleToChange = detected[0]+135
        await tank.drive(angleToChange, 80)
      }
      else{
        angleToChange = detected[0]+25
        await tank.drive(angleToChange, 80)
      }
      if(angleToChange === undefined){
        angleToDrive += 25
      }
      else{
        angleToDrive = angleToChange + 25
      }
      if (angleToDrive > 360) angleToDrive -= 360
    }
    diagonals = !diagonals
  }
}
