const config = {
  type: Phaser.AUTO,
  width: window.innerWidth, // 게임 화면 너비
  height: window.innerHeight, // 게임 화면 높이
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let player;
let poops;
let coins;
let stars;
let powerUps;
let cursors;
let score = 0;
let scoreText;
let levelText;
let gameOver = false;
let level = 1;
let dropInterval = 1000;
let powerUpActive = false;
let powerUpTimer;
let highScore = 0;
let highScoreText;
let boss;
let isBossStage = false;
let isFeverTime = false;
let feverTimeTimer;
let sounds = {};

function preload() {
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

function create() {
  sounds.jump = this.sound.add("jump");
  sounds.collect = this.sound.add("collect");
  sounds.hit = this.sound.add("hit");
  sounds.powerup = this.sound.add("powerup");
  sounds.powerupBgm = this.sound.add("powerupBgm");
  sounds.boss = this.sound.add("boss");
  sounds.bgm = this.sound.add("bgm");
  sounds.feverbgm = this.sound.add("feverbgm");

  sounds.bgm.play({
    loop: true,
  });

  player = this.physics.add.sprite(400, 550, "player");
  player.setCollideWorldBounds(true);

  poops = this.physics.add.group();
  coins = this.physics.add.group();
  stars = this.physics.add.group();
  powerUps = this.physics.add.group();
  boss = this.physics.add.group();

  cursors = this.input.keyboard.createCursorKeys();

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#fff",
  });
  highScoreText = this.add.text(16, 50, "High Score: 0", {
    fontSize: "32px",
    fill: "#fff",
  });
  levelText = this.add.text(16, 84, "Level: 1", {
    fontSize: "32px",
    fill: "#fff",
  });

  highScore = localStorage.getItem("highScore") || 0;
  highScoreText.setText("High Score: " + highScore);

  this.time.addEvent({
    delay: dropInterval,
    callback: dropObjects,
    callbackScope: this,
    loop: true,
  });

  this.physics.add.overlap(player, poops, hitPoop, null, this);
  this.physics.add.overlap(player, coins, collectCoin, null, this);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.overlap(player, powerUps, collectPowerUp, null, this);

  this.anims.create({
    key: "spin",
    frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  adjustForMobile.call(this);
  if (!this.sys.game.device.os.desktop) {
    addVirtualJoystick();
  }
}

function addVirtualJoystick() {
  const leftButton = document.getElementById("left-button");
  const rightButton = document.getElementById("right-button");
  const jumpButton = document.getElementById("jump-button");

  leftButton.addEventListener("touchstart", () => {
    cursors.left.isDown = true;
  });
  leftButton.addEventListener("touchend", () => {
    cursors.left.isDown = false;
  });

  rightButton.addEventListener("touchstart", () => {
    cursors.right.isDown = true;
  });
  rightButton.addEventListener("touchend", () => {
    cursors.right.isDown = false;
  });

  jumpButton.addEventListener("touchstart", () => {
    cursors.up.isDown = true;
  });
  jumpButton.addEventListener("touchend", () => {
    cursors.up.isDown = false;
  });
}

function adjustForMobile() {
  if (!this.sys.game.device.os.desktop) {
    // 화면 크기 조정
    this.scale.resize(window.innerWidth, window.innerHeight);

    // 텍스트 크기 조정
    scoreText.setFontSize(24);
    highScoreText.setFontSize(24);
    levelText.setFontSize(24);

    // 조이스틱 위치 및 크기 조정
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

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    player.setVelocityX(powerUpActive ? -240 : -160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(powerUpActive ? 240 : 160);
  } else {
    player.setVelocityX(0);
  }

  // 점프
  if (cursors.up.isDown && player.body.onFloor()) {
    player.setVelocityY(-200);
    sounds.jump.play();
    cursors.up.isDown = false; // 모바일에서 점프 후 버튼을 떼기 위해
  }

  if (score > level * 100) {
    levelUp.call(this);
  }

  if (!isFeverTime && Phaser.Math.Between(1, 5000) === 1) {
    startFeverTime.call(this);
  }
}

function dropObjects() {
  if (Phaser.Math.Between(1, 10) === 1) {
    dropPowerUp.call(this);
  } else if (Phaser.Math.Between(1, 4) === 1 || isFeverTime) {
    dropCoin.call(this);
  } else {
    dropPoop.call(this);
  }

  const additionalDrop = Math.floor(level / 2); // 레벨이 2배가 될 때마다 추가로 떨어지는 개수 증가
  for (let i = 0; i < additionalDrop; i++) {
    if (Phaser.Math.Between(1, 2) === 1 || isFeverTime) {
      dropCoin.call(this);
    } else {
      dropPoop.call(this);
    }
  }
}

function dropPoop() {
  const x = Phaser.Math.Between(0, 800);
  const poop = poops.create(x, 0, "poop");
  poop.setBounce(0.7);
  poop.setCollideWorldBounds(false);
  poop.setVelocity(Phaser.Math.Between(-200, 200), 20 + level * 10);
}

function dropCoin() {
  const x = Phaser.Math.Between(0, 800);
  const coin = coins.create(x, 0, "coin");
  coin.setBounce(0.7);
  coin.setCollideWorldBounds(false);
  coin.setVelocity(Phaser.Math.Between(-100, 100), 50);
  coin.anims.play("spin");
  coin.setScale(2);
}

function dropPowerUp() {
  const x = Phaser.Math.Between(0, 800);
  const powerUpType = Phaser.Math.Between(1, 3);
  let powerUp;
  if (powerUpType === 1) {
    powerUp = powerUps.create(x, 0, "star"); // 무적
  } else if (powerUpType === 2) {
    powerUp = powerUps.create(x, 0, "star"); // 시간 슬로우
  } else {
    powerUp = powerUps.create(x, 0, "star"); // 똥 제거
  }
  powerUp.type = powerUpType;
  powerUp.setBounce(0.7);
  powerUp.setCollideWorldBounds(false);
  powerUp.setVelocity(Phaser.Math.Between(-50, 50), 50);
}

function hitPoop(player, poop) {
  if (!powerUpActive) {
    this.physics.pause();
    player.setTint(0xff0000);
    sounds.hit.play();
    gameOver = true;
    this.add
      .text(window.innerWidth / 2, window.innerHeight / 2, "Game Over", {
        fontSize: "64px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreText.setText("High Score: " + highScore);
    }
    sounds.bgm.stop();
    sounds.feverbgm.stop();
    this.time.removeAllEvents();
  } else {
    poop.destroy();
  }
}

function collectCoin(player, coin) {
  coin.disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);
  sounds.collect.play();
}

function collectStar(player, star) {
  star.destroy();
  powerUpActive = true;
  player.setTint(0x00ff00);
  sounds.powerup.play();
  if (powerUpTimer) powerUpTimer.remove();
  powerUpTimer = this.time.delayedCall(5000, endPowerUp, [], this);
}

function collectPowerUp(player, powerUp) {
  powerUp.destroy();
  powerUpActive = true;
  player.setTint(0x00ff00);
  sounds.powerup.play();
  sounds.powerupBgm.play({ loop: true });

  if (powerUp.type === 2) {
    this.physics.world.timeScale = 0.5;
    if (powerUpTimer) powerUpTimer.remove();
    powerUpTimer = this.time.delayedCall(
      5000,
      () => {
        this.physics.world.timeScale = 1;
        endPowerUp.call(this);
      },
      [],
      this
    );
  } else if (powerUp.type === 3) {
    poops.clear(true, true);
    endPowerUp.call(this);
  } else {
    if (powerUpTimer) powerUpTimer.remove();
    powerUpTimer = this.time.delayedCall(5000, endPowerUp, [], this);
  }
}

function endPowerUp() {
  powerUpActive = false;
  sounds.powerupBgm.stop();
  player.clearTint();
}

function levelUp() {
  level++;
  levelText.setText("Level: " + level);
  dropInterval -= 100;
  if (dropInterval < 500) dropInterval = 500;

  this.time.removeAllEvents();

  if (isFeverTime) {
    this.time.addEvent({
      delay: dropInterval,
      callback: dropObjects,
      callbackScope: this,
      loop: true,
    });
    if (feverTimeTimer) {
      feverTimeTimer.remove();
      feverTimeTimer = this.time.delayedCall(10000, endFeverTime, [], this);
    }
  } else {
    this.time.addEvent({
      delay: dropInterval,
      callback: dropObjects,
      callbackScope: this,
      loop: true,
    });
  }
}

function startBossStage() {
  isBossStage = true;

  sounds.bgm.stop();
  sounds.boss.play({ loop: true });

  dropInterval = 500;
  this.time.removeAllEvents();
  this.time.addEvent({
    delay: dropInterval,
    callback: dropObjects,
    callbackScope: this,
    loop: true,
  });

  this.time.delayedCall(15000, endBossStage, [], this); // 보스 스테이지 15초 지속
}

function hitBoss(player, boss) {
  if (!powerUpActive) {
    this.physics.pause();
    player.setTint(0xff0000);
    sounds.hit.play();
    gameOver = true;
    this.add
      .text(400, 300, "Game Over", { fontSize: "64px", fill: "#fff" })
      .setOrigin(0.5);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreText.setText("High Score: " + highScore);
    }
  } else {
    boss.destroy();
    endBossStage();
  }
}

function endBossStage() {
  isBossStage = false;
  sounds.boss.stop();
  this.time.addEvent({
    delay: dropInterval,
    callback: dropObjects,
    callbackScope: this,
    loop: true,
  });
}

function startFeverTime() {
  sounds.bgm.stop();
  sounds.feverbgm.play({ loop: true });

  isFeverTime = true;
  dropInterval = 500;

  this.time.removeAllEvents();
  this.time.addEvent({
    delay: dropInterval,
    callback: dropObjects,
    callbackScope: this,
    loop: true,
  });

  if (feverTimeTimer) feverTimeTimer.remove();
  feverTimeTimer = this.time.delayedCall(10000, endFeverTime, [], this); // 피버 타임 10초 지속
}

function endFeverTime() {
  sounds.feverbgm.stop();
  sounds.bgm.play({ loop: true });

  isFeverTime = false;
  dropInterval = 1000;

  this.time.removeAllEvents();
  this.time.addEvent({
    delay: dropInterval,
    callback: dropObjects,
    callbackScope: this,
    loop: true,
  });
}
