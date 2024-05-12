export default function gameTest(engine, ActualGravity = 1, levelObject, tries = 0) {
  // Create a circle at a more practical location
  let circle = Matter.Bodies.circle(10000, 10000, 10, {
    isStatic: false,
  });

  // remove air resistance from the circle
  circle.frictionAir = 0;

  // Set initial velocity, assuming horizontal motion
  const initialVelocity = 10; // distance per frame (likely in cm)
  Matter.Body.setVelocity(circle, { x: initialVelocity, y: 0 });

  // Add the circle to the world
  Matter.World.add(engine.world, circle);
  // Initial setup for measurement
  let counter = 0;
  const framesPerSecond = 60; // Baseline FPS is 60
  const durationInSeconds = 1; // We want to measure the distance after one second
  const desiredFrames = framesPerSecond * durationInSeconds;
  let firstX = circle.position.x; // Start position for distance measurement
  let firstY = circle.position.y;
  let startTime = Date.now();

  // Define the event listener as a named function
  const afterUpdateListener = () => {
    counter++;
    if (counter >= desiredFrames) {
      let endTime = Date.now();
      let elapsedSeconds = (endTime - startTime) / 1000; // time elapsed in seconds
      let x = circle.position.x;
      console.log(circle.position);
      let distance = x - firstX; // distance traveled
      console.log("<--- CALIBRATING GRAVITY --->");
      console.log(
        `Time elapsed (should be ~1): ${elapsedSeconds.toFixed(
          2
        )} s, Frames watched: ${counter}`
      );
      console.log(
        "Desired time: ",
        durationInSeconds,
        "s",
        "Actual gravity: ",
        ActualGravity
      );
      console.log(`X Distance traveled (should be ~600): ${distance}`);
      console.log(
        `Y Distance traveled (should be ~525): ${circle.position.y - firstY}`
      );
      // log the measured frame rate
      console.log(
        `Measured frame rate (should be ~60): ${counter / elapsedSeconds}`
      );
      // calculate the Measured gravity based on the y distance traveled
      let MeasuredGravity =
        (2 * (circle.position.y - firstY)) /
        (elapsedSeconds * elapsedSeconds) /
        1000;
      console.log(
        `Measured gravity (should be ~1): ${MeasuredGravity.toFixed(2)}`
      );
      // Clean-up and remove event listener
    Matter.World.remove(engine.world, circle);
    Matter.Events.off(engine, "afterUpdate", afterUpdateListener);
    // propose a new timescale value based on the measured gravity
    console.log(ActualGravity, MeasuredGravity)
    let newTimeScale = Math.sqrt(ActualGravity / MeasuredGravity) ;
    console.log(
        `Proposed time scale (should be ~1): ${newTimeScale.toFixed(2)}`
    );
    // check if the new time scale is within a reasonable range
    if (newTimeScale < 1.2 && newTimeScale > 0.8) {
        console.log('<--- GRAVITY OK --->');
    }
    // if the new timescale is above 1, it will probably break the game, so we set it to 1
    else if (newTimeScale > 1) {
        console.log('<--- GRAVITY CANNOT BE FIXED, SETTING TIME SCALE TO 1 --->');
        levelObject.GameplayHandler.setBaseTimeScale(1);
    }
    else {
        if (tries >= 5) {
            console.log('<--- GRAVITY NOT OK, TOO MANY TRIES, STOPPING --->');
            alert('Uh oh! Your game may be running at the wrong speed.  Try refreshing the page or contact the developer');
            // if we have tried too many times, just set the time scale to 1, 
            levelObject.GameplayHandler.setBaseTimeScale(1);

        }
        else {
            console.log('<--- GRAVITY NOT OK, ADJUSTING TIME SCALE --->');
            // apply the new time scale
            levelObject.GameplayHandler.setBaseTimeScale(newTimeScale);
            // run the test again
            gameTest(engine, ActualGravity, levelObject, tries + 1);
        }
    }
    
    }
  };

  // Add the event listener to the engine
  Matter.Events.on(engine, "afterUpdate", afterUpdateListener);
}
