// define vector2 class
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function generateSmoothPath(orderedTourPoints, pointsPerSegment = 10) {
    let smoothPath = [];
    for (let i = 0; i < orderedTourPoints.length - 1; i++) {
        const start = orderedTourPoints[i];
        const end = orderedTourPoints[i + 1];
        for (let j = 0; j <= pointsPerSegment; j++) {
            const t = j / pointsPerSegment;
            const interpolatedPoint = {
                x: lerp(start.x, end.x, t),
                y: lerp(start.y, end.y, t),
            };
            smoothPath.push(interpolatedPoint);
        }
    }
    // Add the last point manually to close the path
    smoothPath.push(orderedTourPoints[orderedTourPoints.length - 1]);
    return smoothPath;
}

// define camera class
class Camera {
    constructor(Renderer, mouse, canvas, position = new Vector2(0, 0), size = new Vector2(800, 600)) {
        this.position = position;
        this.mouse = mouse;
        this.canvas = canvas;
        this.size = size;
        this.Renderer = Renderer;
        this.target = null;
        // create a loop which follows the target if it exists
        // print the mouse position every render update
        Matter.Events.on(this.Renderer, 'afterRender', () => {
            if (this.target) {
                this.follow(this.target);
            }
        });

        this.strength = 1; // the strength of the camera's pull towards the target (for smooth update)
        this.doingTour = false; // whether the camera is currently doing a level tour
        this.tourCancelled = false; // whether the current tour has been cancelled
        this.tourNumber = 0; // the current tour number
    }
    
    update() {
        // Calculate the new viewport bounds based on the camera's position and size
        let newBounds = {
            min: { x: this.position.x, y: this.position.y },
            max: { x: this.position.x + this.size.x, y: this.position.y + this.size.y }
        };

        // Update the renderer's bounds to match the new viewport
        Matter.Render.lookAt(this.Renderer, newBounds);    
    }
    levelTour(levelJson, buildArea) { // make a set of camera positions to tour the level
        // levelJson is a json object that contain all the blocs in the level 
        // We're only interested in coins and enemies for the tour.
        let unorderedTourPoints = [];
        let playerSpawn = {
            x: buildArea.x + buildArea.width / 2,
            y: buildArea.y + buildArea.height / 2
        };
        levelJson.blocks.forEach((block) => {
            if (block.type === 'CoinBlock') {
                unorderedTourPoints.push({ x: block.x, y: block.y });
            }
            else if (block.type === 'EnemySpawnBlock') {
                unorderedTourPoints.push({ x: block.x, y: block.y });
            }
        })
        // sort the tour points by distance to the player spawn
        unorderedTourPoints.sort((a, b) => {
            return Math.sqrt((a.x - playerSpawn.x) ** 2 + (a.y - playerSpawn.y) ** 2) - Math.sqrt((b.x - playerSpawn.x) ** 2 + (b.y - playerSpawn.y) ** 2);
        });
        // add the player spawn to the beginning of the tour
        unorderedTourPoints.unshift(playerSpawn);
        // invert the order of the tour points
        let orderedTourPoints = unorderedTourPoints.reverse();
        // smooth the path
        orderedTourPoints = generateSmoothPath(orderedTourPoints, 100);
        this.doLevelTour(orderedTourPoints, buildArea); // do the tour
    }
    doLevelTour(orderedTourPoints, buildArea){
        // set the camera's viewport
        const canvas = document.querySelector("canvas");
        this.setViewport(canvas.width*2, canvas.height*2);
        this.setCenterPosition(orderedTourPoints[0].x, orderedTourPoints[0].y);
        // immediately update the camera to the first point
        this.update();
        // set the strength to 0.1 for extra smoothness
        this.strength = 0.1;
        // go to each point for 1/2 a second 
        const timePerPoint = 10; // milliseconds
        let numPoints = orderedTourPoints.length;
        // use the setTimoout function to go to each point in the orderedTourPoints array
        // record the current tour number so that the tour can be stopped if the tour number changes
        let tourNumber = this.tourNumber + 1;
        this.tourNumber = tourNumber;
        for (let i = 0; i < numPoints; i++) {
            setTimeout(() => {
                if (this.tourNumber !== tourNumber) {
                    return; // if the tour number has changed, stop the tour
                }
                this.setCenterPosition(orderedTourPoints[i].x, orderedTourPoints[i].y);
            }, i * timePerPoint);
        }
        // after the tour is done, slowly return the strength to 1
        setTimeout(() => {
            if (this.tourNumber !== tourNumber) {
                return; // if the tour number has changed, stop the tour
            }
            // focus the camera on the build area
            this.setViewport(
                buildArea.width * 2,
                buildArea.height * 2
            );
            this.setCenterPosition(
                buildArea.x + buildArea.width / 2,
                buildArea.y + buildArea.height / 2
            );
            console.log('center:', this.position.x, this.position.y);

            this.strength = 1;
            this.tourCancelled = false;
            this.doingTour = false;


        }, numPoints * timePerPoint);
    }

    smoothUpdate() {
      // move the camera twards the targetBounds smoothly
      let targetBounds = {
        min: { x: this.position.x, y: this.position.y },
        max: {
          x: this.position.x + this.size.x,
          y: this.position.y + this.size.y,
        },
      };
      // get the current bounds
      let currentBounds = this.Renderer.bounds;
      // calculate the new bounds
      let newBounds = {
        min: {
          x:
            currentBounds.min.x +
            ((targetBounds.min.x - currentBounds.min.x) / 10) * this.strength,
          y:
            currentBounds.min.y +
            ((targetBounds.min.y - currentBounds.min.y) / 10) * this.strength,
        },
        max: {
          x:
            currentBounds.max.x +
            ((targetBounds.max.x - currentBounds.max.x) / 10) * this.strength,
          y:
            currentBounds.max.y +
            ((targetBounds.max.y - currentBounds.max.y) / 10) * this.strength,
        },
      };
      // update the renderer's bounds
      Matter.Render.lookAt(this.Renderer, newBounds);
    }

    
    setViewport(width, height) {
        this.size.x = width;
        this.size.y = height;
    }
    setPosition(x = 0, y = 0) {
        this.position.x = x //- this.size.x / 2;
        this.position.y = y //- this.size.y / 2;
    }
    setCenterPosition(x = 0, y = 0) {
        this.position.x = x - this.size.x / 2;
        this.position.y = y - this.size.y / 2;
    }
    getPosition() {
        return this.position;
    }
    getSize() {
        return this.size;
    }
    follow(target) { // target is a matter.js body
        // this.setCenterPosition(target.bodies[0].position.x, target.bodies[0].position.y);  
        // move the center of the camera towards the target at a speed of 10 
        this.position.x += (target.bodies[0].position.x - (this.position.x + this.size.x / 2)) / 10;
        this.position.y += (target.bodies[0].position.y - (this.position.y + this.size.y / 2)) / 10;

    }
    removeTarget() {
        this.target = null;
    }

    setTarget(target) {
        if (!target) {
            return;
        }
        this.setCenterPosition(target.bodies[0].position.x, target.bodies[0].position.y);
        this.target = target;
    }
    // correct the mouse position to account for the camera's position and scale
    getMousePosition() {
        // Get the mouse position relative to the canvas
        const canvasMouseX = this.mouse.position.x;
        const canvasMouseY = this.mouse.position.y;
    
        // Get the bounds of the current view from the renderer
        const viewBounds = this.Renderer.bounds;
    
        // Calculate the scale factor between the canvas and the view
        const viewWidth = viewBounds.max.x - viewBounds.min.x;
        const viewHeight = viewBounds.max.y - viewBounds.min.y;
        const scaleX = viewWidth / this.Renderer.canvas.width;
        const scaleY = viewHeight / this.Renderer.canvas.height;
    
        // Translate the mouse position to world coordinates
        const correctedX = viewBounds.min.x + canvasMouseX * scaleX;
        const correctedY = viewBounds.min.y + canvasMouseY * scaleY;
    
        // Return the corrected mouse position
        return new Vector2(correctedX, correctedY);
    }

    getTouchPosition(touch) {
        // Get the touch position relative to the canvas
        const canvasTouchX = touch.clientX - this.Renderer.canvas.offsetLeft;
        const canvasTouchY = touch.clientY - this.Renderer.canvas.offsetTop;

        // Get the bounds of the current view from the renderer
        const viewBounds = this.Renderer.bounds;

        // Calculate the scale factor between the canvas and the view
        const viewWidth = viewBounds.max.x - viewBounds.min.x;
        const viewHeight = viewBounds.max.y - viewBounds.min.y;
        const scaleX = viewWidth / this.Renderer.canvas.width;
        const scaleY = viewHeight / this.Renderer.canvas.height;

        // Translate the touch position to world coordinates
        const correctedX = viewBounds.min.x + canvasTouchX * scaleX;
        const correctedY = viewBounds.min.y + canvasTouchY * scaleY;

        // Return the corrected touch position
        console.log(correctedX, correctedY);
        return new Vector2(correctedX, correctedY);
    }

    toggleFullScreen() {
        let container = document.getElementById('game-container');
    
        if (!document.fullscreenElement) {
            // If not in fullscreen mode, enter fullscreen mode with a white background
            container.style.backgroundColor = "white"; // Set the background color to white

            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) { /* Firefox */
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) { /* IE/Edge */
                container.msRequestFullscreen();
            }
        } else {
            // If already in fullscreen mode, exit fullscreen mode
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
    }
}
export { Camera };
