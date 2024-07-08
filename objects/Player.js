class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  update(cursors, powerUpActive) {
    if (cursors.left.isDown) {
      this.setVelocityX(powerUpActive ? -240 : -160);
    } else if (cursors.right.isDown) {
      this.setVelocityX(powerUpActive ? 240 : 160);
    } else {
      this.setVelocityX(0);
    }

    if (cursors.up.isDown && this.body.onFloor()) {
      this.setVelocityY(-200);
      this.scene.soundManager.play("jump");
      cursors.up.isDown = false;
    }
  }
}
