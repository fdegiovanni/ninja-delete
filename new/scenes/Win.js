import { getCoords, getGameName } from "../utils/functions.js";

export default class Win extends Phaser.Scene {
  constructor() {
    super("win");
  }

  init({ score = 0, streak = 0 }) {
    console.log("🚀 ~ file: Win.js:9 ~ Win ~ init ~ streak:", streak);
    console.log("🚀 ~ file: Win.js:9 ~ Win ~ init ~ score:", score);
    this.score = score;
    this.streak = streak;
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    const { centerX, centerY, height } = getCoords(this);

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

    const gifs = ["win1", "win2", "win3"];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    this.add.image(centerX, centerY + 50, gif).setScale(0.5);

    this.add
      .text(centerX, 200, "Excellent!", {
        fontFamily: "Quicksand",
        fontSize: "60px",
        color: "green",
        fixedWidth: 450,
        wordWrap: { width: 450 },
        align: "center",
      })
      .setOrigin(0.5);

    const content = [`Score: ${this.score}`, `Streak: ${this.streak}`];
    this.add
      .text(centerX, centerY + 200, content, {
        fontFamily: "Quicksand",
        fontSize: "20px",
        color: "gray",
        fixedWidth: 450,
        wordWrap: { width: 450 },
        align: "center",
      })
      .setOrigin(0.5);

    setTimeout(() => {
      this.scene.resume("game");
      this.scene.stop("win");
    }, 3000);
  }
}
