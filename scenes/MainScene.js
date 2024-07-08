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
    this.load.spritesheet("coin", "./assets/coin-16x16x4.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("boss", "./assets/boss.png");

    this.load.audio("jump", "./assets/sounds/jump.mp3");
    this.load.audio("collect", "./assets/sounds/collect.mp3");
    this.load.audio("hit", "./assets/sounds/hit.mp3");
    this.load.audio("powerup", "./assets/sounds/powerup.mp3");
    this.load.audio("powerupBgm", "./assets/sounds/powerupBgm.mp3");
    this.load.audio("boss", "./assets/sounds/boss.mp3");
    this.load.audio("bgm", "./assets/sounds/backgroundSound.mp3");
    this.load.audio("feverbgm", "./assets/sounds/feverTime.mp3");
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

    this.adjustForMobile();
  }

  update() {
    if (this.gameOver) return;

    this.player.update(this.inputManager.cursors, this.powerUpActive);

    if (this.score > this.level * 100) {
      this.levelUp();
    }

    if (!this.isFeverTime && Phaser.Math.Between(1, 5000) === 1) {
      this.startFeverTime();
    }
  }

  dropObjects() {
    if (Phaser.Math.Between(1, 10) === 1) {
      this.obstacles.dropPowerUp();
    } else if (Phaser.Math.Between(1, 4) === 1 || this.isFeverTime) {
      this.obstacles.dropCoin();
    } else {
      this.obstacles.dropPoop();
    }

    const additionalDrop = Math.floor(this.level / 2);
    for (let i = 0; i < additionalDrop; i++) {
      if (Phaser.Math.Between(1, 2) === 1 || this.isFeverTime) {
        this.obstacles.dropCoin();
      } else {
        this.obstacles.dropPoop();
      }
    }
  }

  hitPoop(player, poop) {
    if (!this.powerUpActive) {
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
    } else {
      poop.destroy();
    }
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
    this.soundManager.play("collect");
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

    this.time.removeAllEvents();

    this.time.addEvent({
      delay: this.dropInterval,
      callback: this.dropObjects,
      callbackScope: this,
      loop: true,
    });

    if (this.isFeverTime) {
      if (this.feverTimeTimer) {
        this.feverTimeTimer.remove();
        this.feverTimeTimer = this.time.delayedCall(
          10000,
          this.endFeverTime,
          [],
          this
        );
      }
    }
  }

  startFeverTime() {
    this.soundManager.stop("bgm");
    this.soundManager.play("feverbgm", { loop: true });

    this.isFeverTime = true;
    this.dropInterval = 500;

    this.time.removeAllEvents();
    this.time.addEvent({
      delay: this.dropInterval,
      callback: this.dropObjects,
      callbackScope: this,
      loop: true,
    });

    if (this.feverTimeTimer) this.feverTimeTimer.remove();
    this.feverTimeTimer = this.time.delayedCall(
      10000,
      this.endFeverTime,
      [],
      this
    );
  }

  endFeverTime() {
    this.soundManager.stop("feverbgm");
    this.soundManager.play("bgm", { loop: true });

    this.isFeverTime = false;
    this.dropInterval = 1000;

    this.time.removeAllEvents();
    this.time.addEvent({
      delay: this.dropInterval,
      callback: this.dropObjects,
      callbackScope: this,
      loop: true,
    });
  }

  adjustForMobile() {
    if (!this.sys.game.device.os.desktop) {
      this.scale.resize(window.innerWidth, window.innerHeight);

      this.scoreText.setFontSize(24);
      this.highScoreText.setFontSize(24);
      this.levelText.setFontSize(24);

      const joystick = document.getElementById("virtual-joystick");
      joystick.style.width = "80%";
      joystick.style.bottom = "5%";

      const buttons = joystick.getElementsByTagName("button");
      for (let button of buttons) {
        button.style.padding = "15px";
        button.style.fontSize = "16px";
      }
    }
  }
}
