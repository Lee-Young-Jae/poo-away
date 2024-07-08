class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.score = 0;
    this.level = 1;
    this.gameOver = false;
    this.dropInterval = 1000;
    this.powerUpActive = false;
    this.isBossStage = false;
    this.isFeverTime = false;
  }

  preload() {
    this.load.image(
      "player",
      "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
    this.load.image("poop", "./assets/poo.png");
    this.load.image("star", "./assets/star.png");
    // this.load.spritesheet("foods", "./assets/foods-16x16x64.png", {
    //   frameWidth: 16,
    //   frameHeight: 16,
    // });
    this.load.spritesheet("coin", "./assets/coin-16x16x4.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    // this.load.image("boss", "./assets/boss.png");
    this.load.spritesheet("adventurer", "./assets/adventurer-50x37x6.png", {
      frameWidth: 50,
      frameHeight: 37,
    });
    this.load.spritesheet("knight", "./assets/knight-120x80x12.png", {
      frameWidth: 120,
      frameHeight: 80,
    });
    this.load.spritesheet("mystery", "./assets/mystery-32x32x72.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.audio("jump", "./assets/sounds/jump.mp3");
    this.load.audio("collect", "./assets/sounds/collect.mp3");
    this.load.audio("hit", "./assets/sounds/hit.mp3");
    this.load.audio("powerup", "./assets/sounds/powerup.mp3");
    this.load.audio("powerupBgm", "./assets/sounds/powerupBgm.mp3");
    this.load.audio("boss", "./assets/sounds/boss.mp3");
    this.load.audio("bgm", "./assets/sounds/backgroundSound.mp3");
    this.load.audio("feverbgm", "./assets/sounds/feverTime.mp3");
  }

  init(data) {
    if (data.coins !== undefined) {
      this.coins = data.coins;
    } else {
      const savedCoins = localStorage.getItem("coins");
      this.coins = savedCoins ? parseInt(savedCoins) : 0;
    }
  }

  create() {
    this.player = new Player(this, 400, 550);
    this.obstacles = new Obstacles(this);
    this.soundManager = new SoundManager(this);
    this.inputManager = new InputManager(this);

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#fff",
    });
    this.highScoreText = this.add.text(16, 50, "High Score: 0", {
      fontSize: "32px",
      fill: "#fff",
    });
    this.levelText = this.add.text(16, 84, "Level: 1", {
      fontSize: "32px",
      fill: "#fff",
    });

    this.highScore = localStorage.getItem("highScore") || 0;
    this.highScoreText.setText("High Score: " + this.highScore);

    this.time.addEvent({
      delay: this.dropInterval,
      callback: this.dropObjects,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.overlap(
      this.player,
      this.obstacles.poops,
      this.hitPoop,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.obstacles.coins,
      this.collectCoin,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.obstacles.stars,
      this.collectStar,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.obstacles.powerUps,
      this.collectPowerUp,
      null,
      this
    );

    this.anims.create({
      key: "spin",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "run-adv",
      frames: this.anims.generateFrameNumbers("adventurer", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "run-knight",
      frames: this.anims.generateFrameNumbers("knight", {
        start: 0,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "run-mystery",
      frames: this.anims.generateFrameNumbers("mystery", {
        start: 40,
        end: 47,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.add
      .text(this.game.config.width - 100, 20, "Shop", {
        fontSize: "24px",
        fill: "#fff",
      })
      .setInteractive()
      .on("pointerdown", () =>
        this.scene.start("ShopScene", { coins: this.coins })
      );

    // 구매한 캐릭터 적용
    this.loadCharacter();

    // 상점에서 캐릭터를 변경한 경우, 애니메이션을 다시 시작하기 위함
    this.events.on("resume", (scene, data) => {
      this.loadCharacter();
    });

    // 모바일 환경에 맞게 조정
    this.adjustForMobile();
  }

  update() {
    if (this.gameOver) return;

    this.player.update(this.inputManager.cursors, this.powerUpActive);

    if (this.score > this.level * 100) {
      this.levelUp();
    }

    if (
      !this.isFeverTime &&
      !this.powerUpActive &&
      Phaser.Math.Between(1, 5000) === 1
    ) {
      this.startFeverTime();
    }
  }

  dropObjects() {
    if (Phaser.Math.Between(1, 10) === 1 && !this.isFeverTime) {
      this.obstacles.dropPowerUp();
    } else if (Phaser.Math.Between(1, 4) === 1 || this.isFeverTime) {
      this.obstacles.dropCoin();
    } else {
      this.obstacles.dropPoop();
    }

    const additionalDrop = Math.floor(this.level / 2);
    for (let i = 0; i < additionalDrop; i++) {
      if (Phaser.Math.Between(1, 3) === 1 && !this.isFeverTime) {
        this.obstacles.dropPoop();
      } else {
        this.obstacles.dropCoin();
      }
    }
  }

  hitPoop(player, poop) {
    if (this.powerUpActive) {
      poop.destroy();
      // 점수를 올린다
      this.score += 10;
      this.scoreText.setText("Score: " + this.score);
      this.soundManager.play("collect");
      return;
    }

    this.physics.pause();
    player.setTint(0xff0000);
    this.soundManager.play("hit");
    this.gameOver = true;
    this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 2,
        "Game Over",
        {
          fontSize: "64px",
          fill: "#fff",
        }
      )
      .setOrigin(0.5);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.highScore);
      this.highScoreText.setText("High Score: " + this.highScore);
    }
    this.soundManager.stop("bgm");
    this.soundManager.stop("feverbgm");
    this.time.removeAllEvents();
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
    this.coins += 1;
    this.soundManager.play("collect");
    localStorage.setItem("coins", this.coins.toString());
  }

  loadCharacter() {
    this.coins = parseInt(localStorage.getItem("coins")) || 0;
    const currentColor = localStorage.getItem("currentColor") || "default";
    const currentCharacter =
      localStorage.getItem("currentCharacter") || "player";
    const currentSpecial =
      JSON.parse(localStorage.getItem("currentSpecial")) || [];

    switch (currentColor) {
      case "magenta":
        this.player.setTint(0xff00ff);
        break;
      case "yellow":
        this.player.setTint(0xffff00);
        break;
      case "orange":
        this.player.setTint(0xffa500);
        break;
      case "purple":
        this.player.setTint(0x800080);
        break;
      case "gray":
        this.player.setTint(0x808080);
        break;
      case "sky":
        this.player.setTint(0x87ceeb);
        break;
      case "brown":
        this.player.setTint(0xa52a2a);
        break;
      default:
        this.player.clearTint();
        break;
    }

    this.player.setTexture(currentCharacter);

    this.player.anims.stop();

    if (currentCharacter === "adventurer") {
      this.player.play("run-adv");
      this.player.setAllowJumpAcceleration();
    }

    if (currentCharacter === "knight") {
      this.player.play("run-knight");
      this.player.setOffset(35, 40);
      this.player.jumpHigher();
      this.player.setAllowJumpAcceleration();
    }

    if (currentCharacter === "mystery") {
      this.player.play("run-mystery");
      this.player.setOffset(10, 10);
      this.player.setScale(1.2);
      this.player.jumpHigher();
      this.player.setAllowJumpAcceleration();
      this.player.setAllowDoubleJump();
    }

    // sizeUp 상태일 경우 가로 크기를 1.5배로 키움
    if (currentSpecial.includes("sizeUp")) {
      this.player.setScale(1.5);
    }

    // speedUp 상태일 경우 속도를 1.5배로 키움
    if (currentSpecial.includes("speedUp")) {
      this.player.speedUp();
    }

    this.gameOver = false;
    this.score = 0;
    this.scoreText.setText("Score: 0");
    this.level = 1;
    this.levelText.setText("Level: 1");
    this.dropInterval = 1000;
    this.time.removeAllEvents();
  }

  collectStar(player, star) {
    star.destroy();
    this.powerUpActive = true;
    player.setTint(0x00ff00);
    this.soundManager.play("powerup");
    if (this.powerUpTimer) this.powerUpTimer.remove();
    this.powerUpTimer = this.time.delayedCall(5000, this.endPowerUp, [], this);
  }

  collectPowerUp(player, powerUp) {
    powerUp.destroy();
    this.powerUpActive = true;
    player.setTint(0x00ff00);
    this.soundManager.play("powerup");
    this.soundManager.play("powerupBgm", { loop: true });

    if (powerUp.type === 2) {
      this.physics.world.timeScale = 0.5;
      if (this.powerUpTimer) this.powerUpTimer.remove();
      this.powerUpTimer = this.time.delayedCall(
        5000,
        () => {
          this.physics.world.timeScale = 1;
          this.endPowerUp();
        },
        [],
        this
      );
    } else if (powerUp.type === 3) {
      const poops = this.obstacles.poops.getChildren().length;
      this.coins += poops * 10;
      this.score += poops * 10;
      this.scoreText.setText("Score: " + this.score);
      this.soundManager.play("collect");
      localStorage.setItem("coins", this.coins.toString());
      this.obstacles.poops.clear(true, true);

      this.endPowerUp();
    } else {
      if (this.powerUpTimer) this.powerUpTimer.remove();
      this.powerUpTimer = this.time.delayedCall(
        5000,
        this.endPowerUp,
        [],
        this
      );
    }
  }

  endPowerUp() {
    this.powerUpActive = false;
    this.soundManager.stop("powerupBgm");
    this.player.clearTint();
  }

  levelUp() {
    this.level++;
    this.levelText.setText("Level: " + this.level);

    this.dropInterval -= 100;
    if (this.dropInterval < 500) this.dropInterval = 500;
  }

  startFeverTime() {
    this.soundManager.stop("bgm");
    this.soundManager.play("feverbgm", { loop: true });

    this.isFeverTime = true;
    const feverInterval = 500;

    this.time.removeAllEvents();
    this.time.addEvent({
      delay: feverInterval,
      callback: this.dropObjects,
      callbackScope: this,
      loop: true,
    });

    if (this.feverTimeTimer) this.feverTimeTimer.remove();
    this.feverTimeTimer = this.time.delayedCall(
      Phaser.Math.Between(5000, 15000),
      this.endFeverTime,
      [],
      this
    );
  }

  endFeverTime() {
    this.soundManager.stop("feverbgm");
    this.soundManager.play("bgm", { loop: true });

    this.isFeverTime = false;
    this.time.removeAllEvents();
    this.time.addEvent({
      delay: this.dropInterval, // 원래 dropInterval로 복구
      callback: this.dropObjects,
      callbackScope: this,
      loop: true,
    });
  }

  adjustForMobile() {
    if (!this.sys.game.device.os.desktop) {
      this.scale.resize(window.innerWidth, window.innerHeight);
    }
  }
}
