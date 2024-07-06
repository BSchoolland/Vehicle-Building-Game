function LocalToWorld(body, localPoint) {
    // convert local coordinates to world coordinates
    let worldPoint = Matter.Vector.add(body.position, Matter.Vector.rotate(localPoint, 0));
    return worldPoint;
}

function WorldToLocal(body, worldPoint) {
    // convert world coordinates to local coordinates
    let localPoint = Matter.Vector.rotate(Matter.Vector.sub(worldPoint, body.position), 0);
    return localPoint;
}
function constrainBodyToBody(bodyA, bodyB, stiffness = 1, visible = false) {
    // this function constrains bodyA to bodyB using two constraints
    // the result is that the bodies are rigidly connected as if they were welded together
    // get the center of bodyA in world coordinates
    let localPointA = { x: 0, y: 0 };
    let worldPointA = LocalToWorld(bodyA, localPointA);
    // get that point in bodyB local coordinates
    let localPointB = WorldToLocal(bodyB, worldPointA);
    // first constraint
    let constraint1 = Matter.Constraint.create({
        bodyA: bodyA,
        bodyB: bodyB,
        pointA: localPointA,
        pointB: localPointB,
        stiffness: stiffness,
        length: 0,
        // invisible
        render: {
            visible: visible
        }
    });
    // for the next constraint, we need the center of bodyB in world coordinates
    let localPointB2 = { x: 0, y: 0 };
    let worldPointB = LocalToWorld(bodyB, localPointB2);
    // get that point in bodyA local coordinates
    let localPointA2 = WorldToLocal(bodyA, worldPointB);
    // second constraint
    let constraint2 = Matter.Constraint.create({
        bodyA: bodyB,
        bodyB: bodyA,
        pointA: localPointB2,
        pointB: localPointA2,
        stiffness: stiffness,
        length: 0,
        // invisible
        render: {
            visible: visible
        }
    });
    // return the constraints
    return [constraint1, constraint2];
}

// Function to rotate a Matter.js body around a given point
function rotateBodyAroundPoint(body, point, angle) {
    // Convert angle from degrees to radians
    const angleRadians = angle * (Math.PI / 180);

    // Get the current position of the body's center of mass
    const bodyPosX = body.position.x;
    const bodyPosY = body.position.y;

    // Calculate the vector from the point of rotation to the body's center
    const dx = bodyPosX - point.x;
    const dy = bodyPosY - point.y;

    // Calculate the rotated vector
    const rotatedDx = dx * Math.cos(angleRadians) - dy * Math.sin(angleRadians);
    const rotatedDy = dx * Math.sin(angleRadians) + dy * Math.cos(angleRadians);

    // Calculate the new position of the body's center
    const newPosX = point.x + rotatedDx;
    const newPosY = point.y + rotatedDy;

    // Move the body to the new position
    Matter.Body.setPosition(body, { x: newPosX, y: newPosY });

    // Rotate the body to the new angle
    Matter.Body.rotate(body, angleRadians);
}

function rotateConstraintAroundPoint(constraint, point, angle) {
    // no need to rotate
}

export {
    LocalToWorld,
    WorldToLocal,
    constrainBodyToBody,
    rotateBodyAroundPoint,
    rotateConstraintAroundPoint
}