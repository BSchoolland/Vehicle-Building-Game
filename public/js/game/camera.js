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

    smoothUpdate() {
        // move the camera twards the targetBounds smoothly
        let targetBounds = {
            min: { x: this.position.x, y: this.position.y },
            max: { x: this.position.x + this.size.x, y: this.position.y + this.size.y }
        };
        // get the current bounds
        let currentBounds = this.Renderer.bounds;
        // calculate the new bounds
        let newBounds = {
            min: { x: currentBounds.min.x + (targetBounds.min.x - currentBounds.min.x) / 10, y: currentBounds.min.y + (targetBounds.min.y - currentBounds.min.y) / 10 },
            max: { x: currentBounds.max.x + (targetBounds.max.x - currentBounds.max.x) / 10, y: currentBounds.max.y + (targetBounds.max.y - currentBounds.max.y) / 10 }
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

    toggleFullScreen() {
        let container = document.getElementById('game-container');
    
        if (!document.fullscreenElement) {
            // If not in fullscreen mode, enter fullscreen mode
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
