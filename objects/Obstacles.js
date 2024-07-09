class Obstacles {
  constructor(scene) {
    this.scene = scene;
    this.poops = scene.physics.add.group();
    this.coins = scene.physics.add.group();
    this.stars = scene.physics.add.group();
    this.powerUps = scene.physics.add.group();
    this.boss = scene.physics.add.group();
  }

  dropPoop() {
    const x = Phaser.Math.Between(0, this.scene.game.config.width);
    const poop = this.poops.create(x, 0, "poop");
    poop.setBounce(0.7);
    poop.setCollideWorldBounds(false);
    const scale = Phaser.Math.FloatBetween(0.2, 1.5);
    poop.setScale(scale);
    poop.setVelocity(
      Phaser.Math.Between(-200, 200),
      20 + this.scene.level * 10
    );
    this.setPoopCollisionArea(poop);
  }

  setPoopCollisionArea(poop) {
    const width = poop.width * poop.scaleX;
    const height = poop.height * poop.scaleY;

    const collisionWidth = width * 0.4; // 원래 너비의 40%
    const collisionHeight = height * 0.8; // 원래 높이의 80%

    poop.body.setSize(collisionWidth, collisionHeight);
  }

  dropCoin() {
    const x = Phaser.Math.Between(0, this.scene.game.config.width);
    const coin = this.coins.create(x, 0, "coin");
    coin.setBounce(0.7);
    coin.setCollideWorldBounds(false);
    coin.setVelocity(Phaser.Math.Between(-100, 100), 50);
    coin.anims.play("spin");
    coin.setScale(2);
  }

  dropPowerUp() {
    const x = Phaser.Math.Between(0, this.scene.game.config.width);
    const powerUpType = Phaser.Math.Between(1, 3);
    const powerUp = this.powerUps.create(x, 0, "star");
    powerUp.type = powerUpType;
    // type에 따라, tint를 다르게 설정
    switch (powerUpType) {
      case 1:
        powerUp.tint = 0x00ff00;
        break;
      case 2:
        powerUp.tint = 0xff0000;
        break;
      case 3:
        powerUp.tint = 0xfeff00;
        break;
    }
    powerUp.setBounce(0.7);
    powerUp.setCollideWorldBounds(false);
    powerUp.setVelocity(Phaser.Math.Between(-50, 50), 50);
  }
}
