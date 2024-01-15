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

export {
    LocalToWorld,
    WorldToLocal
}