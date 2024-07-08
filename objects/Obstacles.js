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
    poop.setVelocity(
      Phaser.Math.Between(-200, 200),
      20 + this.scene.level * 10
    );
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
    powerUp.setBounce(0.7);
    powerUp.setCollideWorldBounds(false);
    powerUp.setVelocity(Phaser.Math.Between(-50, 50), 50);
  }
}
