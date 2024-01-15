function LocalToWorld(body, localPoint) {
    // convert local coordinates to world coordinates
    let worldPoint = Matter.Vector.add(body.position, Matter.Vector.rotate(localPoint, body.angle));
    return worldPoint;
}

function WorldToLocal(body, worldPoint) {
    // convert world coordinates to local coordinates
    let localPoint = Matter.Vector.rotate(Matter.Vector.sub(worldPoint, body.position), -body.angle);
    return localPoint;
}
function constrainBodyToBody(bodyA, bodyB) {
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
        stiffness: 1,
        length: 0,
        // invisible
        render: {
            visible: false
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
        stiffness: 1,
        length: 0,
        // invisible
        render: {
            visible: false
        }
    });
    // return the constraints
    return [constraint1, constraint2];
}

export {
    LocalToWorld,
    WorldToLocal
}