// Initialize the Matter.js engine and renderer
// ...

const grassColors = [
    "rgb(34, 139, 34)",   // Forest Green
    "rgb(46, 139, 87)",   // Sea Green
    "rgb(0, 128, 0)",    // Green
    "rgb(0, 100, 0)",    // Dark Green
    "rgb(50, 205, 50)",  // Lime Green
    "rgb(60, 179, 113)", // Medium Sea Green
    "rgb(34, 139, 34)",   // Forest Green (repeated for more regularity)
    "rgb(46, 139, 87)",   // Sea Green (repeated for more regularity)
    "rgb(0, 128, 0)",    // Green (repeated for more regularity)
    "rgb(0, 100, 0)"     // Dark Green (repeated for more regularity)
  ];

let engine = Matter.Engine.create();
let render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false // Set wireframes to false to show styles
    }
});

function setFullScreenCanvas() {
    let canvas = render.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    render.bounds.max.x = window.innerWidth;
    render.bounds.max.y = window.innerHeight;
}

window.addEventListener('resize', function() {
    setFullScreenCanvas();
});
setFullScreenCanvas();

let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, { mouse: mouse });
Matter.World.add(engine.world, mouseConstraint);

// Variables to store the starting point and the temporary box
let startPoint = null;
let tempBox = null;
let boxes = [];

// Mouse down event
render.canvas.addEventListener('mousedown', function(event) {
    startPoint = { x: event.pageX, y: event.pageY };
    // if the temporary box exists, remove it from the world
    if (tempBox) {
        Matter.World.remove(engine.world, tempBox);
    }
    tempBox = Matter.Bodies.rectangle(startPoint.x, startPoint.y, 0, 0, { isStatic: true });
    // set the temporary box to a random shade of green
    tempBox.render.fillStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
    Matter.World.add(engine.world, tempBox);
});

// Mouse move event
render.canvas.addEventListener('mousemove', function(event) {
    if (startPoint) {
        const width = Math.abs(event.pageX - startPoint.x);
        const height = Math.abs(event.pageY - startPoint.y);
        const centerX = startPoint.x + width / 2;
        const centerY = startPoint.y + height / 2;

        Matter.Body.setPosition(tempBox, { x: centerX, y: centerY });
        Matter.Body.setVertices(tempBox, Matter.Vertices.create([
            { x: centerX - width / 2, y: centerY - height / 2 },
            { x: centerX + width / 2, y: centerY - height / 2 },
            { x: centerX + width / 2, y: centerY + height / 2 },
            { x: centerX - width / 2, y: centerY + height / 2 }
        ]));
    }
});

// Mouse up event
render.canvas.addEventListener('mouseup', function() {
    if (startPoint) {
        boxes.push(tempBox);
        tempBox = null;
        startPoint = null;
    }
});


// Add a keydown event listener for the space bar
document.addEventListener('keydown', function(event) {
    if (event.keyCode === 32) {
        const exportData = boxes.map(box => {
            return {
                type: 'rectangle',
                x: box.position.x,
                y: box.position.y,
                width: box.bounds.max.x - box.bounds.min.x,
                height: box.bounds.max.y - box.bounds.min.y,
                color: box.render.fillStyle
            };
        });
    
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ terrain: exportData }));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "level.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
});

// load the terrain from the JSON data
let terrainJson = await (await fetch('json-levels/level1.json')).json();
terrainJson.terrain.forEach(item => {
    let body;
    if (item.type === 'rectangle') {
        body = Matter.Bodies.rectangle(item.x, item.y, item.width, item.height, { isStatic: true });
    } else if (item.type === 'circle') {
        body = Matter.Bodies.circle(item.x, item.y, item.radius, { isStatic: true });
    }
    // set the color from the JSON data
    body.render.fillStyle = item.color;
    console.log(body.render.fillStyle);
    if (body) {
        boxes.push(body);
    }
});

// Add terrain to the world
Matter.World.add(engine.world, boxes);

// Run the engine and the renderer
Matter.Engine.run(engine);
Matter.Render.run(render);