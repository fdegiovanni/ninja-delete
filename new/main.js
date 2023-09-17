import Preload from "./scenes/Preload.js";
import Menu from "./scenes/Menu.js";
import Credits from "./scenes/Credits.js";
import Game from "./scenes/Game.js";
import GameOver from "./scenes/GameOver.js";
import Win from "./scenes/Win.js";

const gameOptions = { developer: "fdegiovanni" };
export default gameOptions;

// Create a new Phaser config object
const config = {
  title: "IRRESPONSIBLE NINJA",
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  // scale: {
  //   mode: Phaser.Scale.FIT,
  //   autoCenter: Phaser.Scale.CENTER_BOTH,
  //   min: {
  //     width: 800,
  //     height: 600,
  //   },
  //   max: {
  //     width: 1600,
  //     height: 1200,
  //   },
  // },
  // physics: {
  //   default: "arcade",
  //   arcade: {
  //     gravity: { y: 200 },
  //     debug: true,
  //   },
  // },

  scene: [Preload, Menu, Credits, Game, GameOver, Win],
};

// Create a new Phaser game instance
window.game = new Phaser.Game(config);
