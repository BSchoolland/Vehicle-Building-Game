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
      console.log("<--- DEBUGGING GRAVITY --->");
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
    console.log("<--- DEBUGGING COMPLETE --->");
    }
  };

  // Add the event listener to the engine
  Matter.Events.on(engine, "afterUpdate", afterUpdateListener);
}
