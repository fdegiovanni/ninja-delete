import {
  getCoords,
  getGameName,
  getStoredScore,
  addSounds,
  playSound,
} from "../utils/functions.js";

export default class Menu extends Phaser.Scene {
  constructor() {
    super("menu");
    window.soundOn = true;
  }

  init() {
    const { best } = getStoredScore();
    this.best = best;
  }

  create() {
    this.coords = getCoords(this);
    const { centerX, height } = this.coords;
    addSounds(this);
    this.addBackground();

    this.addCover();

    this.title = this.add
      .text(centerX, 100, getGameName(this), {
        fontFamily: "Quicksand",
        fontSize: "48px",
        color: "#fff",
        fixedWidth: 450,
        wordWrap: { width: 450 },
        align: "center",
      })
      .setOrigin(0.5);

    this.bestText = this.add
      .text(centerX, height - 110, `Best distance: ${this.best}`, {
        fontFamily: "Quicksand",
        fontSize: "26px",
        color: "#fff",
        fixedWidth: 450,
        wordWrap: { width: 450 },
        align: "center",
      })
      .setOrigin(0.5);

    this.addEffectsOnClick();

    this.addCredits();

    this.addSoundButton();
  }

  addBackground() {
    const { centerX, centerY, width, height } = this.coords;
    this.background = this.add.sprite(centerX, centerY, "background");
    this.background.displayWidth = width + 100;
    this.background.displayHeight = height + 100;
  }

  addCover() {
    const { centerX, centerY } = this.coords;
    this.cover = this.add
      .image(centerX, centerY, "cover")
      .setInteractive(this.input.makePixelPerfect());

    this.cover.on("pointerover", () => {
      this.cover.setScale(1.1);
    });

    this.cover.on("pointerout", () => {
      this.cover.setScale(1);
    });
  }

  addCredits() {
    const { width, height } = this.coords;
    const creditsButton = this.add.text(width - 150, height - 30, "Créditos", {
      fontSize: "24px",
      fill: "#fff",
    });

    creditsButton.setInteractive({ useHandCursor: true });

    creditsButton.on("pointerup", () => {
      playSound(this.sounds.click);
      this.scene.pause();
      this.scene.launch("credits");
    });
  }

  addEffectsOnClick() {
    playSound(this.sounds.click);
    const { height } = this.coords;
    this.cover.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.add.tween({
        targets: [this.cover, this.title],
        ease: "Bounce.easeIn",
        y: -200,
        duration: 1000,
        onComplete: () => {
          this.scene.start("game");
        },
      });

      this.add.tween({
        targets: [this.bestText],
        ease: "Bounce.easeIn",
        y: height + 100,
        duration: 300,
      });
    });
  }

  addSoundButton() {
    const { centerX, height } = this.coords;
    this.soundButton = this.add
      .sprite(centerX, height - 50, "icons")
      .setScale(0.5);
    this.soundButton.setFrame(window.soundOn ? 2 : 3);
    this.soundButton.setInteractive();
    this.soundButton.on(
      "pointerup",
      function () {
        window.soundOn = !window.soundOn;
        this.soundButton.setFrame(window.soundOn ? 2 : 3);

        playSound(this.sounds.click);
      },
      this
    );
  }
}
