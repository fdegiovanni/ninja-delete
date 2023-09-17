import {
  addSounds,
  getCoords,
  getGameName,
  playSound,
} from "../utils/functions.js";

export default class GameOver extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  init(data) {
    this.score = data.score || 0;
    this.streak = data.streak || 0;
    this.best = data.best || 0;
  }

  create() {
    const { centerX, centerY, height } = getCoords(this);
    addSounds(this);

    this.add
      .text(centerX, 100, getGameName(this), {
        fontFamily: "Quicksand",
        fontSize: "40px",
        color: "#fff",
        fixedWidth: 450,
        wordWrap: { width: 450 },
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 200, "Game Over", {
        fontFamily: "Quicksand",
        fontSize: "48px",
        color: "red",
        fixedWidth: 450,
        wordWrap: { width: 450 },
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY, `Score: ${this.score}`, {
        fontFamily: "Quicksand",
        fontSize: "20px",
        color: "gray",
        fixedWidth: 450,
        wordWrap: { width: 450 },
        align: "center",
      })
      .setOrigin(0.5);

    let restartIcon = this.add
      .sprite(centerX - 120, height - 10, "icons")
      .setOrigin(0.5);

    restartIcon.setInteractive();
    restartIcon.on(
      "pointerup",
      function () {
        playSound(this.sounds.click);
        this.scene.start("game");
      },
      this
    );

    let homeIcon = this.add
      .sprite(centerX + 120, height - 10, "icons")
      .setOrigin(0.5);

    homeIcon.setFrame(1);
    homeIcon.setInteractive();
    homeIcon.on(
      "pointerup",
      function () {
        playSound(this.sounds.click);
        this.scene.start("menu");
      },
      this
    );

    this.tweens.add({
      targets: [restartIcon, homeIcon],
      y: centerY + 180,
      duration: 800,
      ease: "Cubic.easeIn",
    });
  }
}
