import { SpikeBlock, WheelBlock, RemoteBlock, TNTBlock } from "../vehicle/blocks.js";
// a dictionary of bonus objectives and their images
let bonusObjectives = {
    "Beat the Level": "../../img/silver-crown.png",
    "First win": "../../img/crown.png",
    "Who needs blocks?": ["../../img/bonus-objectives/noBlock1.png", "../../img/bonus-objectives/noBlock2.png", "../../img/bonus-objectives/noBlock3.png", "../../img/bonus-objectives/noBlock4.png", "../../img/bonus-objectives/noBlock5.png", "../../img/bonus-objectives/noBlock6.png"],
    "Unarmed and Dangerous": "../../img/bonus-objectives/noWeapon.png",
    "Complete Overkill": "../../img/bonus-objectives/overkill.png",
    "Not a Scratch": "../../img/bonus-objectives/noDamage.png",
    "No Wheels": "../../img/bonus-objectives/noWheels.png",
    "Disarmament": "../../img/bonus-objectives/noTNT.png",
    "No Remote Blocks": "../../img/bonus-objectives/noRemote.png",
  };

  function displayObjective(name, value) {
    // Find the image path from the bonusObjectives dictionary
    let imagePath = bonusObjectives[name];
    // if the image path is an array, choose a random image
    if (Array.isArray(imagePath)) {
        imagePath = imagePath[value - 1];
    }
    if (!imagePath) {
        console.error('Objective not found');
        return;
    }

    // Create an image element
    let img = document.createElement('img');
    img.src = imagePath;
    img.style.position = 'absolute';
    img.style.left = '50%';
    img.style.top = '30%';
    img.style.transform = 'translate(-50%, -50%)';
    img.style.zIndex = '1000'; // Ensure it's above other elements
    img.style.width = '100px'; // Set an appropriate size
    img.style.height = '100px';
    img.className = 'spinAnimation'; // Assign the animation class

    // Append the image to the body
    document.body.appendChild(img);

    // Remove the image after a few seconds
    setTimeout(() => {
        img.remove();
    }, 3000);
}
function limitedBlocks(gameplayObject, objective) {
  // check how many blocks are in the player's contraption
  let contraption = gameplayObject.parent.playerContraption;
  let blockCount = contraption.blocks.length;
  if (blockCount <= objective.value) {
    // make sure the objective hasn't already been completed
    if (!gameplayObject.parent.LevelHandler.isMedalEarned(
      gameplayObject.parent.worldSelected,
      gameplayObject.parent.LevelHandler.getLevelIndex(),
      objective.name
    )) {
      console.log("Bonus Objective Unlocked!");
      // celebrate by displaying the objective
      displayObjective(objective.name, objective.value);
      // mark the objective as completed
      gameplayObject.parent.LevelHandler.completeBonusObjective(
          gameplayObject.parent.worldSelected,
          gameplayObject.parent.LevelHandler.getLevelIndex(),
          objective.name
      );
    }
  }
  else {
      console.log("too many blocks");
  }
}
function unarmedAndDangerous(gameplayObject, objective) {
  let contraption = gameplayObject.parent.playerContraption;
  // loop through the blocks in the contraption looking for spike blocks
  for (let i = 0; i < contraption.blocks.length; i++) {
    let block = contraption.blocks[i];
    if (block instanceof SpikeBlock) {
      console.log("Spike block found! Objective failed.");
      return;
    }
  }
  // make sure the objective hasn't already been completed
  if (!gameplayObject.parent.LevelHandler.isMedalEarned(
    gameplayObject.parent.worldSelected,
    gameplayObject.parent.LevelHandler.getLevelIndex(),
    objective.name
  )) {
    console.log("Bonus Objective Unlocked!");
    // celebrate by displaying the objective
    displayObjective(objective.name, objective.value);
    // mark the objective as completed
    gameplayObject.parent.LevelHandler.completeBonusObjective(
        gameplayObject.parent.worldSelected,
        gameplayObject.parent.LevelHandler.getLevelIndex(),
        objective.name
    );
  }

}

function noDamage(gameplayObject, objective) {
  let contraption = gameplayObject.parent.playerContraption;
  // loop through the blocks in the contraption and make sure all have health remaining
  for (let i = 0; i < contraption.blocks.length; i++) {
    let block = contraption.blocks[i];
    console.log(block.hitPoints);
    if (block.hitPoints <= 0) {
      console.log("Block with no health found! Objective failed.");
      return;
    }
  }
  // make sure the objective hasn't already been completed
  if (!gameplayObject.parent.LevelHandler.isMedalEarned(
    gameplayObject.parent.worldSelected,
    gameplayObject.parent.LevelHandler.getLevelIndex(),
    objective.name
  )) {
    console.log("Bonus Objective Unlocked!");
    // celebrate by displaying the objective
    displayObjective(objective.name, objective.value);
    // mark the objective as completed
    gameplayObject.parent.LevelHandler.completeBonusObjective(
        gameplayObject.parent.worldSelected,
        gameplayObject.parent.LevelHandler.getLevelIndex(),
        objective.name
    );
  }
}

function DestroyAllEnemies(gameplayObject, objective) {
  let enemiesDestroyed = gameplayObject.enemyContraptionsDestroyed
  if (enemiesDestroyed >= objective.value) {
    console.log("Bonus Objective Unlocked!");
    // celebrate by displaying the objective
    displayObjective(objective.name, objective.value);
    // mark the objective as completed
    gameplayObject.parent.LevelHandler.completeBonusObjective(
        gameplayObject.parent.worldSelected,
        gameplayObject.parent.LevelHandler.getLevelIndex(),
        objective.name
    );
  }
  else {
      console.log("Not enough enemies destroyed");
  }
}

function noWheels(gameplayObject, objective) {
  let contraption = gameplayObject.parent.playerContraption;
  // loop through the blocks in the contraption looking for wheel blocks
  for (let i = 0; i < contraption.blocks.length; i++) {
    let block = contraption.blocks[i];
    if (block instanceof WheelBlock) {
      console.log("Wheel block found! Objective failed.");
      return;
    }
  }
  // make sure the objective hasn't already been completed
  if (!gameplayObject.parent.LevelHandler.isMedalEarned(
    gameplayObject.parent.worldSelected,
    gameplayObject.parent.LevelHandler.getLevelIndex(),
    objective.name
  )) {
    console.log("Bonus Objective Unlocked!");
    // celebrate by displaying the objective
    displayObjective(objective.name, objective.value);
    // mark the objective as completed
    gameplayObject.parent.LevelHandler.completeBonusObjective(
        gameplayObject.parent.worldSelected,
        gameplayObject.parent.LevelHandler.getLevelIndex(),
        objective.name
    );
  }
}

function noTNT(gameplayObject, objective) {
  let contraption = gameplayObject.parent.playerContraption;
  // loop through the blocks in the contraption looking for tnt blocks
  for (let i = 0; i < contraption.blocks.length; i++) {
    let block = contraption.blocks[i];
    if (block instanceof TNTBlock) {
      console.log("TNT block found! Objective failed.");
      return;
    }
  }
  // make sure the objective hasn't already been completed
  if (!gameplayObject.parent.LevelHandler.isMedalEarned(
    gameplayObject.parent.worldSelected,
    gameplayObject.parent.LevelHandler.getLevelIndex(),
    objective.name
  )) {
    console.log("Bonus Objective Unlocked!");
    // celebrate by displaying the objective
    displayObjective(objective.name, objective.value);
    // mark the objective as completed
    gameplayObject.parent.LevelHandler.completeBonusObjective(
        gameplayObject.parent.worldSelected,
        gameplayObject.parent.LevelHandler.getLevelIndex(),
        objective.name
    );
  }
}

function noRemote(gameplayObject, objective) {
  let contraption = gameplayObject.parent.playerContraption;
  // loop through the blocks in the contraption looking for remote blocks
  for (let i = 0; i < contraption.blocks.length; i++) {
    let block = contraption.blocks[i];
    if (block instanceof RemoteBlock) {
      console.log("Remote block found! Objective failed.");
      return;
    }
  }
  // make sure the objective hasn't already been completed
  if (!gameplayObject.parent.LevelHandler.isMedalEarned(
    gameplayObject.parent.worldSelected,
    gameplayObject.parent.LevelHandler.getLevelIndex(),
    objective.name
  )) {
    console.log("Bonus Objective Unlocked!");
    // celebrate by displaying the objective
    displayObjective(objective.name, objective.value);
    // mark the objective as completed
    gameplayObject.parent.LevelHandler.completeBonusObjective(
        gameplayObject.parent.worldSelected,
        gameplayObject.parent.LevelHandler.getLevelIndex(),
        objective.name
    );
  }
}

// a file for handling the bonus objectives of the level
function checkBonusObjectives(gameplayObject) {
    // get a list of bonus objectives from the level object
    let bonusObjectives = gameplayObject.parent.LevelHandler.getBonusChallenges(
        gameplayObject.parent.worldSelected,
        gameplayObject.parent.LevelHandler.getLevelIndex()
      );
      if (!bonusObjectives) {
        return;
      }
      for (let i = 0; i < bonusObjectives.length; i++) {
        let objective = bonusObjectives[i];
        if (objective.name === "Who needs blocks?") {
          limitedBlocks(gameplayObject, objective);
        }
        else if (objective.name === "Unarmed and Dangerous") {
          unarmedAndDangerous(gameplayObject, objective);
        }
        else if (objective.name === "Not a Scratch") {
          noDamage(gameplayObject, objective);
        }
        else if (objective.name === "Complete Overkill") {
          DestroyAllEnemies(gameplayObject, objective);
        }
        else if (objective.name === "No Wheels") {
          noWheels(gameplayObject, objective);
        }
        else if (objective.name === "Disarmament") {
          noTNT(gameplayObject, objective);
        }
        else if (objective.name === "No Remote Blocks") {
          noRemote(gameplayObject, objective);
        }
      }
}

export {checkBonusObjectives, displayObjective, bonusObjectives}