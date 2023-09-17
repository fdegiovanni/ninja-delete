import { PoleStatus } from "../utils/PoleStatus.js";
import { InputStatus } from "../utils/InputStatus.js";
import {
  addSounds,
  getCoords,
  getStoredScore,
  playSound,
  setStoredScore,
  stopSound,
} from "../utils/functions.js";

const { IDLE, WAITING_START, WAITING_STOP } = InputStatus;

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");

    this.points = getStoredScore();
    this.mountains = 0;
    this.timeLeft = 30;

    this.defaultSize = {
      width: 750,
      height: 1334,
      maxRatio: 4 / 3,
    };
    this.platformHeight = 0.6;
    this.platformGapRange = [200, 400];
    this.platformWidthRange = [50, 150];
    this.scrollTime = 250;
    this.poleWidth = 8;
    this.poleGrowTime = 400;
    this.poleRotateTime = 500;
    this.heroWalkTime = 2;
    this.heroFallTime = 500;

    this.gameMode = WAITING_START;
  }

  init() {
    this.mountains = 0;
    this.points = getStoredScore();
  }

  create() {
    this.coords = getCoords(this);
    addSounds(this);
    this.addBackground();
    this.addClouds();
    this.addPlatforms();
    this.addPole();
    this.addPlayer();

    this.addGameInfo();

    // input management
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.on("pointerup", this.handlePointerUp, this);
  }

  update() {}

  addBackground() {
    this.background = this.add.sprite(400, 300, "background");
    this.background.displayWidth = this.sys.game.config.width + 100;
    this.background.displayHeight = this.sys.game.config.height + 100;
  }

  addClouds() {
    let clouds = Math.ceil(this.sys.game.config.width / 128);
    let cloudsArray = [];

    for (let i = 0; i <= 1; i++) {
      for (let j = 0; j <= clouds; j++) {
        let cloud = this.add.sprite(
          128 * j + Phaser.Math.Between(-10, 10),
          game.config.height + i * 32 + Phaser.Math.Between(-10, 10),
          "cloud"
        );
        cloud.setFrame(i);
        cloudsArray.push(cloud);
      }
    }

    this.tweens.add({
      targets: cloudsArray,
      props: {
        x: {
          value: {
            getEnd: function (target, key, value) {
              return target.x + Phaser.Math.Between(-10, 10);
            },
          },
        },
        y: {
          value: {
            getEnd: function (target, key, value) {
              return target.y + Phaser.Math.Between(-10, 10);
            },
          },
        },
      },
      duration: 3000,
      repeat: -1,
      yoyo: true,
    });
  }

  addPlatforms() {
    // main platform is platform zero...
    this.mainPlatform = 0;
    // ... of this array of two platforms created with addPlatform method.
    // the argument is the x position
    this.platforms = [
      this.addPlatform((game.config.width - this.defaultSize.width) / 2),
      this.addPlatform(game.config.width),
    ];
    // finally, another method to tween a platform
    this.tweenPlatform();
  }

  addPlatform(posX) {
    // add the platform sprite according to posX and .platformHeight
    let platform = this.add.sprite(
      posX,
      game.config.height * this.platformHeight,
      "tile"
    );

    // platform width initially is the arithmetic average of .platformWidthRange values
    let width = (this.platformWidthRange[0] + this.platformWidthRange[1]) / 2;

    // adjust platform display width
    platform.displayWidth = width;

    // height is determined by the distance from the platform and the bottom of the screen
    // remember to add 50 more pixels for the shake effect
    platform.displayHeight =
      game.config.height * (1 - this.platformHeight) + 50;

    // set platform origin to top left corner
    platform.setOrigin(0, 0);

    // return platform variable to be used by addPlatforms method
    return platform;
  }

  tweenPlatform() {
    // get the right coordinate of left platform
    let rightBound = this.platforms[this.mainPlatform].getBounds().right;

    let minGap = this.platformGapRange[0];
    let maxGap = this.platformGapRange[1];

    // determine the random gap between the platforms
    let gap = Phaser.Math.Between(minGap, maxGap);

    // right platform destination is determined by adding the right coordinate of the platform to the gap
    let destination = rightBound + gap;
    let minWidth = this.platformWidthRange[0];
    let maxWidth = this.platformWidthRange[1];

    // determine a random platform width
    let width = Phaser.Math.Between(minWidth, maxWidth);

    // adjust right platform width
    this.platforms[1 - this.mainPlatform].displayWidth = width;

    // tweening the right platform to destination
    this.tweens.add({
      targets: [this.platforms[1 - this.mainPlatform]],
      x: destination,
      duration: this.scrollTime,
    });
  }

  addPole() {
    let bounds = this.platforms[this.mainPlatform].getBounds();
    this.pole = this.add.sprite(
      bounds.right - this.poleWidth,
      bounds.top,
      "tile"
    );

    // set pole anchor point to bottom right
    this.pole.setOrigin(1, 1);

    // adjust pole size. The pole starts very short.
    this.pole.displayWidth = this.poleWidth;
    this.pole.displayHeight = this.poleWidth;
  }

  poleFallDown() {
    this.tweens.add({
      targets: [this.pole],
      angle: 180,
      duration: this.poleRotateTime,
      ease: "Cubic.easeIn",
    });
  }

  showGameOver() {
    const score = this.points.score;
    this.points = {
      ...this.points,
      score: 0,
      streak: 0,
    };
    setStoredScore(this.points);
    this.scene.start("game-over", { score });
  }

  showWin() {
    this.scene.pause("game");
    this.scene.launch("win", this.points);
  }

  fallAndDie() {
    this.gameTimer?.remove();
    playSound(this.sounds.death, {
      delay: this.heroFallTime / 2000,
    });

    this.tweens.add({
      targets: [this.hero],
      y: this.coords.height + this.hero.displayHeight * 2,
      angle: 180,
      duration: this.heroFallTime,
      ease: "Cubic.easeIn",
      callbackScope: this,
      onComplete: function () {
        this.cameras.main.shake(200, 0.01);
        setTimeout(() => {
          this.showGameOver();
        }, 200);
      },
    });
  }

  nextPlatform() {
    this.hero.anims.play("idle");
    this.hero.y = this.platforms[this.mainPlatform].getBounds().top;
    let rightPlatformPosition = this.platforms[1 - this.mainPlatform].x;
    let distance =
      this.platforms[1 - this.mainPlatform].x -
      this.platforms[this.mainPlatform].x;

    this.tweens.add({
      targets: [this.hero, this.pole, this.platforms[0], this.platforms[1]],
      props: {
        x: {
          value: "-= " + distance,
        },
        alpha: {
          value: {
            getEnd: function (target, key, value) {
              if (target.x < rightPlatformPosition) {
                return 0;
              }
              return 1;
            },
          },
        },
      },
      duration: this.scrollTime,
      callbackScope: this,
      onComplete: function () {
        this.prepareNextMove();
      },
    });
  }

  updateScore() {
    this.scoreText?.setText(`DISTANCE: ${this.mountains}`);
    this.points.score = this.mountains;
    if (this.mountains > this.points.best) {
      this.points.best = this.mountains;
      this.bestScoreText?.setText(`MAX DISTANCE: ${this.points.best}`);
    }
    this.points.streak++;
    if (this.points.streak % 3 === 0) {
      this.showWin();
    }
    setStoredScore(this.points);
  }

  prepareNextMove() {
    this.mountains++;
    this.updateScore();

    this.platforms[this.mainPlatform].x = this.sys.game.config.width;
    this.platforms[this.mainPlatform].alpha = 1;
    this.mainPlatform = 1 - this.mainPlatform;

    this.tweenPlatform();

    // reset pole angle, alpha, position and height
    this.pole.angle = 0;
    this.pole.alpha = 1;
    this.pole.x =
      this.platforms[this.mainPlatform].getBounds().right - this.poleWidth;
    this.pole.displayHeight = this.poleWidth;

    this.gameMode = WAITING_START;
  }

  moveHero(poleStatus) {
    let platformBounds = this.platforms[1 - this.mainPlatform].getBounds();
    let heroBounds = this.hero.getBounds();
    let poleBounds = this.pole.getBounds();
    let heroDestination;
    switch (poleStatus) {
      case PoleStatus.SUCCESS:
        heroDestination = platformBounds.right - this.poleWidth;
        break;
      case PoleStatus.TOO_SHORT:
        heroDestination = poleBounds.right;
        break;
      case PoleStatus.TOO_LONG:
        heroDestination = poleBounds.right + heroBounds.width / 2;
        break;
    }
    this.hero.anims.play("run");
    playSound(this.sounds.run);

    this.walkTween = this.tweens.add({
      targets: [this.hero],
      x: heroDestination,
      duration: this.heroWalkTime * this.pole.displayHeight,
      callbackScope: this,
      onComplete: function () {
        stopSound(this.sounds.run);
        switch (poleStatus) {
          case PoleStatus.TOO_SHORT:
            this.poleFallDown();
            this.fallAndDie();
            break;
          case PoleStatus.TOO_LONG:
            this.fallAndDie();
            break;

          // if it was a SUCCESS landing...
          case PoleStatus.SUCCESS:
            // ...call nextPlatform method
            this.nextPlatform();
            break;
        }
      },
      onUpdate: function () {
        let heroBounds = this.hero.getBounds();
        let poleBounds = this.pole.getBounds();
        let platformBounds = this.platforms[1 - this.mainPlatform].getBounds();
        if (
          heroBounds.centerX > poleBounds.left &&
          heroBounds.centerX < poleBounds.right
        ) {
          this.hero.y = poleBounds.top;
        } else {
          this.hero.y = platformBounds.top;
        }
      },
    });
  }

  addPlayer(poleStatus) {
    // get bounds of main platforms
    let platformBounds = this.platforms[this.mainPlatform].getBounds();
    // determine horizontal hero position subtracting pole width from right main platform bound
    let heroPosX = platformBounds.right - this.poleWidth;
    // vertical hero position is the same as top bound of main platform
    let heroPosY = platformBounds.top;

    this.hero = this.add.sprite(heroPosX, heroPosY, "hero");
    // set hero registration point to right bottom corner
    this.hero.setOrigin(1, 1);
    this.hero.play("idle");
  }

  showGameScore() {
    this.firstMove = false;
    let energyBar = this.add.sprite(
      this.coords.centerX,
      this.coords.height / 5,
      "energybar"
    );

    // get energyBar bounds
    let energyBounds = energyBar.getBounds();
    this.scoreText = this.add
      .text(
        energyBounds.right,
        energyBounds.top - 40,
        `DISTANCE: ${this.mountains}`,
        {
          fontFamily: "Quicksand",
          fontSize: "22px",
          color: "#FFFFFF",
        }
      )
      .setOrigin(1, 0);

    this.bestScoreText = this.add
      .text(
        energyBounds.left,
        energyBounds.bottom + 10,
        `MAX DISTANCE: ${this.points.best || 0}`,
        {
          fontFamily: "Quicksand",
          fontSize: "22px",
          color: "#FFFFFF",
        }
      )
      .setOrigin(0, 0);

    // fill energy bar with a white tile
    this.energyStatus = this.add.sprite(
      energyBounds.left + 5,
      energyBounds.top + 5,
      "whitetile"
    );
    this.energyStatus.setOrigin(0, 0);
    this.energyStatus.displayWidth = 500;
    this.energyStatus.displayHeight = energyBounds.height - 10;
  }

  updateTimer() {
    this.energyStatus.displayWidth = (500 * this.timeLeft) / 30;
    if (this.timeLeft == 0) {
      this.tweens.killTweensOf(this.hero);
      this.tweens.killTweensOf(this.pole);

      this.fallAndDie();
    }
  }

  addGameTimer() {
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: function () {
        this.timeLeft--;
        this.updateTimer();
      },
      callbackScope: this,
      loop: true,
    });
  }

  handlePointerDown() {
    if (this.gameMode === WAITING_START) {
      this.gameMode = WAITING_STOP;
      let maxPoleWidth = this.platformGapRange[1] + this.platformWidthRange[1];
      playSound(this.sounds.grow);

      this.growTween = this.tweens.add({
        targets: [this.pole],
        displayHeight: maxPoleWidth + 50,
        duration: this.poleGrowTime,
        callbackScope: this,
        onComplete: function () {
          stopSound(this.sounds.grow);
        },
      });

      if (this.firstMove) {
        this.info.visible = false;
        this.showGameScore();
        this.addGameTimer();
      }
    }
  }

  handlePointerUp() {
    if (this.gameMode === WAITING_STOP) {
      this.gameMode = IDLE;

      stopSound(this.sounds.grow);
      playSound(this.sounds.stick);

      this.growTween.stop();

      // add a tween to make the pole rotate by 90 degrees.
      this.tweens.add({
        targets: [this.pole],
        angle: 90,
        duration: this.poleRotateTime,
        ease: "Bounce.easeOut",
        callbackScope: this,
        onComplete: function () {
          let poleBounds = this.pole.getBounds();
          let platformBounds =
            this.platforms[1 - this.mainPlatform].getBounds();

          // we assume the landing was SUCCESS, but...
          let poleStatus = PoleStatus.SUCCESS;

          if (poleBounds.right < platformBounds.left) {
            // the pole was too short
            poleStatus = PoleStatus.TOO_SHORT;
          } else {
            if (poleBounds.right > platformBounds.right) {
              // the pole was too long
              poleStatus = PoleStatus.TOO_LONG;
            }
          }
          this.moveHero(poleStatus);
        },
      });
    }
  }

  addGameInfo() {
    const { centerX, centerY } = this.coords;
    const content = `HOLD YOUR FINGER ON THE SCREEN
    TO STRECHT OUT THE STICK
    AND REACH NEXT PLATFORM`;
    this.info = this.add
      .text(centerX, centerY * 0.5, content, {
        fontFamily: "Quicksand",
        fontSize: "22px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5);
    this.gameMode = WAITING_START;
    this.firstMove = true;
  }
}
