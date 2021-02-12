"use strict";
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
  let secDistanceRight
  let secDistanceLeft

  // auxiliary functions
  //Check the location of enemies
  async function check(tank, diagonals, distance, secDistanceRight, secDistanceLeft) {
    for (var i = diagonals? 45 : 0; i < 360; i = i + 90) {
      distance = await tank.scan(i, 10);
      if (distance > 0){
        //first shot
        await tank.shoot(i, distance)
        //try to presume enemies moves
        secDistanceRight = await tank.scan(i+10, 5);
        secDistanceLeft = await tank.scan(i-10, 5);
        if((secDistanceRight == 0 && secDistanceLeft>0) || (secDistanceRight>secDistanceLeft && secDistanceLeft!=0)){
          //is going left
          return [i-10, secDistanceLeft]
        }
        else if ((secDistanceRight > 0 && secDistanceLeft==0) || (secDistanceRight<secDistanceLeft && secDistanceRight!=0))
        {
          //is going right
          return [i+10, secDistanceRight]
        }
        else
        {          
          //Not in my scope
          return [i, distance]
        }
      } 
    }
    return false
  }

  //avoid walls
  async function avoidWall(tank, x, y) {
    while (x < 150) {
      await tank.drive(0, 75)
      x = await tank.getX()
    }
    while (x > 1190) {
      await tank.drive(180, 75)
      x = await tank.getX()
    }
    while (y < 150) {
      await tank.drive(90, 75)
      y = await tank.getY()
    }
    while (y > 850) {
      await tank.drive(270, 75)
      y = await tank.getY()
    }
  }

  //run away from danger
  async function runAway(tank, angleToDrive) {
    await tank.drive(angleToDrive + 45, 70)
  }

  //Detect and shoot enemies
  async function detectAndShoot(tank, diagonals, tankInRadar, distance, secDistanceRight, secDistanceLeft) {
    tankInRadar = await check(tank, diagonals, distance, secDistanceRight, secDistanceLeft)
    if (tankInRadar) {
      await tank.shoot(tankInRadar[0], tankInRadar[1])
      return tankInRadar
    }
    else{
      return false
    }
  }

  // main loop
  while (true) {
    angleToChange = null
    newDamage = await tank.getDamage()
    x = await tank.getX()
    y = await tank.getY()
    await avoidWall(tank, x, y)
    //Update damage state
    if (newDamage !== lastKnownDamage) {
      await runAway(tank, angleToDrive)
      lastKnownDamage = newDamage
    }
    else {
      detected = await detectAndShoot(tank, diagonals, tankInRadar, distance, secDistanceRight, secDistanceLeft)
      if(detected == false){
        //Mantaining the driving
        await tank.drive(angleToDrive, 45)
      }
      else{
        //Try to approach but carefully
        angleToChange = detected[0]+30
        await tank.drive(angleToChange, 80)
      }
      //Usual angle
      if(angleToChange == undefined){
        angleToDrive += 25
      }
      else{
        //Keep in mind new moves
        angleToDrive = angleToChange + 25
      }
      if (angleToDrive > 360) angleToDrive -= 360
    }
    diagonals = !diagonals
  }
}