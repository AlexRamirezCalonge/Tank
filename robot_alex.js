"use strict";

async function main(tank) {

  // auxiliary functions
  async function fireLeftOrRight(tank) {
    let dir = 0;
    if (Math.random() > 0.5) {
      dir = 180;
    }
    await tank.shoot(dir, 700);
  }

  // definicion de otras funciones
  async function stop(tank) {
    while (await tank.getSpeed() > 50) {
      await tank.drive(0, 0);
    }
  }
  //Check the location of enemies
  async function check(tank, numTan1, location){
    var numTan1;
    var location;
    for(var i = 0; i<=360; i=i+10){
      numTan1 = await tank.scan(i, 10);
      if(location==null && numTan1!=0){
        location = i + 5;        
      }
      else if (location!=null){
        break;
      }
    }
    await tank.shoot(location, 700);
    if(await tank.getY() > 100)
    await tank.drive(location, 30);
    await tank.shoot(location, 700);
    await tank.shoot(location, 700);

    location = null;
    numTan1 = null;
  }

  // main loop

  while (true) {
    // go up
    while (await tank.getY() < 900) {
      await check(tank);
      //await tank.drive(location, 50);
      //await tank.scan(0, 10);
      //await tank.drive(0, distancia);
    }
    // shoot
    await tank.shoot(0, 700);
    await fireLeftOrRight(tank);
    // go down
    while (await tank.getY() > 100) {
      await tank.drive(270, 0);
    }
    // shoot
    await tank.shoot(90, 700);
    await fireLeftOrRight(tank);
  }
}
