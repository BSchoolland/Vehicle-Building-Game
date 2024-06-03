import {
    slightRampBlockRUpsideDown,
    slightRampBlockLUpsideDown,
    GrassBlock,
    DirtBlock,
    RampBlockL,
    RampBlockR,
    slightRampBlockL,
    slightRampBlockR,
    CoinBlock,
    BuildingAreaBlock,
    EnemySpawnBlock,
  } from "../world/mapBlocks.js";
  const blockTypes = {
    GrassBlock,
    DirtBlock,
    RampBlockL,
    slightRampBlockL,
    RampBlockR,
    slightRampBlockR,
    CoinBlock,
    BuildingAreaBlock,
    EnemySpawnBlock,
    slightRampBlockRUpsideDown,
    slightRampBlockLUpsideDown,
  };
  
  
  class EditManager {
    constructor(engine, building, progressBar, isEnemyEditor = false) {
      this.engine = engine;
      this.playerContraption = building.contraption;
      this.building = building;
      this.isEnemyEditor = isEnemyEditor;
      // todo: add movement and zoom handler

      // todo: add action type handler

      // todo: add level configuration handler

      // todo: add loading and saving handler

      // todo: add building handlers

      this.enemyContraptions = [];
      this.blocks = [];
      this.loaded = false;
    }
  }
  
  export default EditManager;
  