// handles gameplay mechanics for the level (objectives, level completion, etc.)
import { playSound } from "../sounds/playSound.js";
import { checkBonusObjectives, displayObjective } from "./bonusObjectives.js";

class Gameplay {
  // constructor
  constructor(parent) {
    this.parent = parent;

    // keep track of win conditions
    this.won = false;

    this.coinsCollected = 0;
    this.mustCollect = 1;
    this.parent.coins = [];

    this.enemyContraptionsDestroyed = 0;
    this.mustDestroy = 0;

    this.mustCompleteBefore = 0; // no limit
    this.remainingTime = 0;
    this.secondsSurvived = 0;
    this.mustSurvive = 0;
    this.startTime = 0;
    this.baseTimeScale = 1;
    this.reward = {};
  }
  setBaseTimeScale(baseTimeScale) {
    this.baseTimeScale = baseTimeScale;
    // set the time scale to the base time scale
    this.parent.engine.timing.timeScale = this.baseTimeScale;
  }

  startLevel() {
    // tell the tutorial that the level has started
    this.parent.LevelTutorial.checkStart();
    // set time to normal speed
    this.parent.engine.timing.timeScale = this.baseTimeScale;
    this.won = false;

    // spawn in the enemy contraptions
    this.parent.enemyContraptions.forEach((enemyContraption) => {
      enemyContraption.spawn();
    });

    // reset the win conditions
    this.coinsCollected = 0;
    this.enemyContraptionsDestroyed = 0;
    this.secondsSurvived = 0;
    this.startTime = Date.now();

    // reset each coin
    this.parent.coins.forEach((coin) => {
      coin.reset();
    });
  }
  updateHelpText() {
    console.log("updating help text");
    let help = document.getElementById("help-container");
    // if the help container is not found, return
    if (!help) {
      return;
    }
    // make the help visible
    help.style.display = "block";
    console.log("help container found");
  }
  updateStats() {
    let stats = document.getElementById("stats");
    if (!stats) {
      return;
    }
    stats.innerHTML = "";
    if (this.mustCollect > 0) {
      let collect = document.createElement("h1");
      collect.innerHTML = `Coins ${this.coinsCollected}/${this.mustCollect}`;
      stats.appendChild(collect);
    }
    if (this.mustDestroy > 0) {
      let destroy = document.createElement("h1");
      destroy.innerHTML = `Destroyed ${this.enemyContraptionsDestroyed}/${this.mustDestroy}`;
      stats.appendChild(destroy);
    }
    if (this.mustSurvive > 0) {
      let survive = document.createElement("h1");
      if (this.secondsSurvived >= this.mustSurvive) {
        // set seconds survived to the must survive time
        this.secondsSurvived = this.mustSurvive;
      }
      survive.innerHTML = `Survive ${this.secondsSurvived}/${this.mustSurvive}`;
      stats.appendChild(survive);
    }
    if (this.mustCompleteBefore > 0) {
      let before = document.createElement("h1");
      if (this.remainingTime <= 0) {
        before.innerHTML = `Complete before FAILED!`;
      } else {
        before.innerHTML = `Complete before ${this.remainingTime}`;
      }
      stats.appendChild(before);
    }

    stats.style.display = "block";
  }
  incrementEnemyContraptionsDestroyed() {
    this.enemyContraptionsDestroyed++;
    console.log("enemy contraptions destroyed: ", this.enemyContraptionsDestroyed);
    this.updateStats();
  }

  setBuildMode() {
    // despawn all enemy contraptions
    this.parent.LevelLoader.despawnEnemyContraptions();
    // reset the win conditions
    this.coinsCollected = 0;
    this.enemyContraptionsDestroyed = 0;
    this.secondsSurvived = 0;
    this.startTime = 0;
    // update the stats
    this.updateStats();
  }

  completeLevel() {
    // stop gameplay
    try {
      window.CrazyGames.SDK.game.gameplayStop();
    }
    catch (e) {
      console.log("CrazyGames SDK not found");
    }
    // give the player infinite health so that they don't die during the level complete animation
    this.parent.playerContraption.seat.hitPoints = Infinity;
    this.parent.LevelUI.destroyBackArrow();
    let level = this.parent.LevelHandler.getLevelIndex() + 1;
    let world = this.parent.worldSelected;
    // if the player has completed the level before, they are able to achieve bonus objectives
    if (this.parent.LevelHandler.isLevelCompleted(world, level)) {
      checkBonusObjectives(this);
    } else if (typeof this.reward === "string") {
      // split unlocksWorld to get the number of the world to unlock
      let unlocksWorld = parseInt(this.reward.split("unlocksWorld")[0]);
      
      displayObjective("First win", 1);
      // update the player's local storage to show that the level has been completed
      this.parent.LevelHandler.completeLevel(
        this.parent.worldSelected,
        this.parent.LevelHandler.getLevelIndex() + 1
      );
    } else {
      // add each reward to the player's resources
      for (let key in this.reward) {
        this.parent.building.ResourceHandler.addBlockToResources(
          world,
          key,
          this.reward[key]
        );
      }
      displayObjective("First win", 1);
      // update the player's local storage to show that the level has been completed
      this.parent.LevelHandler.completeLevel(
        this.parent.worldSelected,
        this.parent.LevelHandler.getLevelIndex() + 1
      );
    }
    // tell the level handler to sync the levels the player has beaten with the server
    this.parent.LevelHandler.syncLevelsBeat();
    // hide the tutorial text
    document.getElementById("tutorial-text").style.display = "none";
    // hide the help container
    document.getElementById("help-container").style.display = "none";
    // play the level complete sound
    playSound("win");
    // make a bunch of confetti all over the top of the screen
    for (let i = 0; i < 500; i++) {
      let confettiColors = [
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
      ];
      let x =
        this.parent.playerContraption.seat.bodies[0].position.x +
        Math.random() * 4000 -
        2000;
      let y = this.parent.playerContraption.seat.bodies[0].position.y - 1000;
      let color =
        confettiColors[Math.floor(Math.random() * confettiColors.length)];
      let confetti = Matter.Bodies.rectangle(x, y, 20, 16, {
        render: { fillStyle: color },
      });
      Matter.Body.setVelocity(confetti, {
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
      });
      // randomly set the confetti's angular velocity
      Matter.Body.setAngularVelocity(confetti, Math.random() * 0.5 - 0.25);

      // make the confetti not collide with anything
      (confetti.collisionFilter = {
        category: 0x0003,
      }),
      // make the confetti experience a lot of air resistance
      confetti.frictionAir = 0.03;
        Matter.World.add(this.parent.engine.world, confetti);
      // remove the confetti after 5 seconds
      setTimeout(() => {
        Matter.World.remove(this.parent.engine.world, confetti);
      }, 5000);
      // delete any html objects with className "build-menu"
      let buildMenus = document.getElementsByClassName("build-menu");
      for (let i = 0; i < buildMenus.length; i++) {
        buildMenus[i].remove();
      }
    }
    setTimeout(() => {
      // clear the level
      this.parent.LevelLoader.clear();
      if (this.parent.test) {
        // if this is a test level, return to the level editor by setting href to /editor
        window.location.href = "/editor.html";
      } else {
        //open the level selector
        this.parent.LevelUI.loadLevelSelector();
      }
      // clear the player contraption
      this.parent.playerContraption.clear();
      // set the stats to be invisible
      document.getElementById("stats").style.display = "none";
      // set the survival time to 0
      this.secondsSurvived = 0;
      // sync resources with the server
      this.parent.building.ResourceHandler.syncResources(this.parent.worldSelected);
      // tell the tutorial that the level has been completed
      this.parent.LevelTutorial.checkVictory();
    }, 3000);
  }
  update() {
    // update the level (check coins, survival time, etc.)
    if (!this.parent.playerContraption.seat) return;
    if (this.startTime === 0) {
      // if the level hasn't started yet, don't check for win conditions
      return;
    }
    this.parent.coins.forEach((coin) => {
      if (coin.checkCollection(this.parent.playerContraption)) {
        // play the coin sound
        this.coinsCollected++;
        // show that coins have been increased
        this.updateStats();
      }
    });
    // check if enough coins have been collected
    if (this.coinsCollected >= this.mustCollect) {
      // check that the playercontraption's seat is not destroyed
      if (this.parent.playerContraption.seat.destroyed) {
        // the player loses
        this.startTime = 0;
        return;
      }
      // check if the player has survived long enough
      let pastSecondsSurvived = this.secondsSurvived;
      this.secondsSurvived = Math.floor((Date.now() - this.startTime) / 1000);
      // if the seconds survived has increased, and has not reached the win condition, play the time sound
      if (
        this.secondsSurvived > pastSecondsSurvived &&
        this.secondsSurvived <= this.mustSurvive
      ) {
        // playSound("time");
        this.updateStats();
      }
      // check if the time limit has been reached
      else if (this.mustCompleteBefore > 0) {
        this.remainingTime = this.mustCompleteBefore - this.secondsSurvived;
        this.updateStats();
        if (this.remainingTime <= 0) {
          // the player can no longer win
          return;
        }
      }

      if (this.secondsSurvived >= this.mustSurvive) {
        // set seconds survived to the must survive time
        this.secondsSurvived = this.mustSurvive;
        // check if the player has destroyed enough enemy contraptions
        if (this.enemyContraptionsDestroyed >= this.mustDestroy) {
          // check if the player has completed the level before the time limit

          // the player wins!
          if (this.won) {
            return;
          }
          this.won = true;
          // slow down time
          // this.parent.engine.timing.timeScale = this.baseTimeScale / 10;
          // deactivate build mode if it is somehow active
          if (this.parent.building.buildInProgress) {
            this.parent.building.toggleBuildingMode();
          }
          // prevent build mode
          this.parent.building.canEnterBuildMode = false;
          setTimeout(() => {
            // if the player contraption's seat is destroyed, the player loses instead of winning
            if (this.parent.playerContraption.seat.destroyed) {
              this.startTime = 0;
              this.won = false;
              this.parent.building.canEnterBuildMode = true;
              this.parent.engine.timing.timeScale = this.baseTimeScale;
              return;
            }
            this.completeLevel();
          }, 500);
        }
      }
    } else {
      // update tbhe stats but don't allow a win
      let pastSecondsSurvived = this.secondsSurvived;
      this.secondsSurvived = Math.floor((Date.now() - this.startTime) / 1000);
      // if the seconds survived has increased, and has not reached the win condition, play the time sound
      if (
        this.secondsSurvived > pastSecondsSurvived &&
        this.secondsSurvived <= this.mustSurvive
      ) {
        // playSound("time");
        this.updateStats();
      }
      if (this.mustCompleteBefore > 0) {
        this.remainingTime = this.mustCompleteBefore - this.secondsSurvived;
        this.updateStats();
      }
    }
  }
}
13
export default Gameplay;
