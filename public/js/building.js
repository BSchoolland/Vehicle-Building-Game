// Import necessary classes from your block definitions
import {BasicBlock, WheelBlock, CannonBlock, rocketBoosterBlock } from './blocks.js';
import {Contraption} from './contraption.js';



class Building {
    constructor(engine, camera) {
        this.engine = engine;
        this.camera = camera;
        this.currentBlockType = BasicBlock; // Default block type
        this.buildInProgress = false;
        this.contraption = null;
        this.buildArea = {
            x: 100,
            y: 200,
            width: 300,
            height: 200
        };
        this.grid = 50;
        this.gridLines = [];
    }

    setCurrentBlockType(blockType) {
        this.currentBlockType = blockType;
    }

    init() {
        // Add event listener for canvas click
        const canvas = document.querySelector('canvas');
        // Add event listener for left click
        canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
        // Add event listener for space bar
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        // Add event listener for right click
        canvas.addEventListener('contextmenu', (event) => this.handleRightClick(event));

    }

    handleCanvasClick(event) {
        // make sure build mode is enabled
        if (!this.buildInProgress) {
            return;
        }
        // get the click position
        let pos = this.camera.getMousePosition();
        // Round the position to the nearest grid line
        let x = Math.round(pos.x / this.grid) * this.grid;
        let y = Math.round(pos.y / this.grid) * this.grid;
        
        // make sure the position is within the build area
        if (x < this.buildArea.x || x > this.buildArea.x + this.buildArea.width) {
            console.log('Cannot place block here');
            return;
        }
        if (y < this.buildArea.y || y > this.buildArea.y + this.buildArea.height) {
            console.log('Cannot place block here');
            return;
        }
        // make sure there is not already a block in the contraption here
        for (let i = 0; i < this.contraption.blocks.length; i++) {
            if (this.contraption.blocks[i].x === x && this.contraption.blocks[i].y === y) {
                console.log('Cannot place block here');
                return;
            }
        }
        // Create a new block at the click position
        let newBlock = new this.currentBlockType(x, y, this.contraption);
        // Add the block to the contraption
        this.contraption.addBlock(newBlock);
    }
    createRightClickMenu(block) {
        // create a menu for the block
        let menu = document.createElement('div');
        menu.classList.add('menu');
        // create a button to flip the block
        let flipButton = document.createElement('button');
        flipButton.classList.add('menu-button');
        flipButton.innerText = 'Flip';
        flipButton.onclick = () => {
            this.contraption.flipX(block);
            menu.remove();
        };
        menu.appendChild(flipButton);
        // create a button to remove the block
        let removeButton = document.createElement('button');
        removeButton.classList.add('menu-button');
        removeButton.innerText = 'Remove';
        removeButton.onclick = () => {
            this.contraption.removeBlock(block);
            menu.remove();
        };
        menu.appendChild(removeButton);
        // create a button to cancel
        let cancelButton = document.createElement('button');
        cancelButton.classList.add('menu-button');
        cancelButton.innerText = 'Cancel';
        cancelButton.onclick = () => {
            menu.remove();
        };
        menu.appendChild(cancelButton);
        // Add the menu to the document
    document.body.appendChild(menu);

    // Get the canvas element and its bounding rectangle
    let canvas = document.querySelector('canvas'); // Adjust selector if necessary
    let rect = canvas.getBoundingClientRect();

    // Convert block's position to screen coordinates
    let scaleX = canvas.width / rect.width; // Canvas vs. screen scaling for width
    let scaleY = canvas.height / rect.height; // Canvas vs. screen scaling for height

    // Calculate the screen position
    let screenX = rect.left + block.x * scaleX;
    let screenY = rect.top + block.y * scaleY;

    // Position the menu
    menu.style.position = 'absolute';
    menu.style.left = `${screenX}px`;
    menu.style.top = `${screenY}px`;
}

    handleRightClick(_e) {
        // edit the block at the click position
        // make sure build mode is enabled
        if (!this.buildInProgress) {
            return;
        }
        //get the mouse position from the camera
        let pos = this.camera.getMousePosition();
        
        // Round the position to the nearest grid line
        let x = Math.round(pos.x / this.grid) * this.grid;
        let y = Math.round(pos.y / this.grid) * this.grid;
        // find the block at this position
        let block = this.contraption.blocks.find(block => block.x === x && block.y === y);
        if (block) {
            this.createRightClickMenu(block);
        }
    }

    handleKeyDown(event) {
        // If the space bar is pressed, toggle build mode
        if (event.keyCode === 32) {
            this.buildInProgress = !this.buildInProgress;
            if (this.buildInProgress) {
                console.log('Build mode enabled');
                if (this.contraption) {
                    this.contraption.despawn();
                }
                else {
                    console.log('Creating new contraption');
                    this.contraption = new Contraption(this.engine, this.camera);
                }
                // display a grid over the build area
                this.displayGrid();
                // get rid of the camera target
                this.camera.removeTarget();
                // set the camera viewport to the size of the build area 
                this.camera.setViewport(this.buildArea.width * 2, this.buildArea.height * 2);

                // set the camera position to the center of the build area
                this.camera.setCenterPosition(this.buildArea.x + this.buildArea.width / 2, this.buildArea.y + this.buildArea.height / 2);
                
            } else {
                this.removeGrid();
                console.log('Build mode disabled');
                // spawn the contraption
                this.contraption.spawn();

                // set the camera viewport to the size of the canvas
                const canvas = document.querySelector('canvas');
                this.camera.setViewport(canvas.width, canvas.height);
                // set the camera target to a block in the contraption
                this.camera.setTarget(this.contraption.blocks[0]);
                
            }
        }
        // if the 1 key is pressed, set the current block type to BasicBlock
        if (event.keyCode === 49) {
            this.setCurrentBlockType(BasicBlock);
        }
        // if the 2 key is pressed, set the current block type to WheelBlock
        if (event.keyCode === 50) {
            this.setCurrentBlockType(WheelBlock);
        }
        // if the 3 key is pressed, set the current block type to CannonBlock
        if (event.keyCode === 51) {
            this.setCurrentBlockType(CannonBlock);
        }
        // if the 4 key is pressed, set the current block type to rocketBoosterBlock
        if (event.keyCode === 52) {
            this.setCurrentBlockType(rocketBoosterBlock);
        }
        // If the Z key is pressed, undo the last block placed
        if (event.keyCode === 90) {
            this.contraption.undo();
        }
        // If the X key is pressed, redo the last block placed
        if (event.keyCode === 88) {
            this.contraption.redo();
        }
        // If the C key is pressed, clear the contraption
        if (event.keyCode === 67) {
            if (!this.buildInProgress) {
                return;
            }
            this.contraption.clear();
        }
        // if the S key is pressed, save the contraption
        if (event.keyCode === 83) {
            // make sure build mode is enabled
            if (!this.buildInProgress) {
                return;
            }
            // save the contraption to a JSON object
            let contraptionJson = this.contraption.save();
            // download the JSON object as a file
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contraptionJson));
            let dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", "contraption.json");
            dlAnchorElem.click();
        }
        // if the L key is pressed, load a contraption
        if (event.keyCode === 76) {
            if (!this.buildInProgress) {
                return;
            }
            // bring up a file input dialog
            let fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.click();
            // when a file is selected, load the contraption
            fileInput.onchange = (event) => {
                let file = event.target.files[0];
                let reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    let contraptionJson = JSON.parse(reader.result);
                    // clear the existing contraption
                    this.contraption.clear();
                    // load the contraption from the JSON object
                    this.contraption.load(contraptionJson);
                };
            };
        }
    }
    displayGrid() {
        const buildArea = this.buildArea;
        const gridSpacing = this.grid;
    
        // Vertical lines
        for (let x = buildArea.x; x <= buildArea.x + buildArea.width + gridSpacing; x += gridSpacing) {
            let line = Matter.Bodies.rectangle(x - gridSpacing / 2, buildArea.y + buildArea.height / 2, 1, buildArea.height + gridSpacing, { isStatic: true, render: { visible: true }});
            Matter.World.add(this.engine.world, line);
            this.gridLines.push(line);
        }
    
        // Horizontal lines
        for (let y = buildArea.y; y <= buildArea.y + buildArea.height + gridSpacing; y += gridSpacing) {
            let line = Matter.Bodies.rectangle(buildArea.x + buildArea.width / 2, y - gridSpacing / 2, buildArea.width + gridSpacing, 1, { isStatic: true, render: { visible: true }});
            Matter.World.add(this.engine.world, line);
            this.gridLines.push(line);
        }
    }
    removeGrid() {
        for (let i = 0; i < this.gridLines.length; i++) {
            Matter.World.remove(this.engine.world, this.gridLines[i]);
        }
        this.gridLines = [];
    }
        
}

export default Building;
