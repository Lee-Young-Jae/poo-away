class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.speed = 160;
  }

  speedUp() {
    this.speed *= 1.5;
  }

  update(cursors, powerUpActive) {
    if (cursors.left.isDown) {
      this.flipX = true;
      this.setVelocityX(powerUpActive ? this.speed * -1.5 : this.speed * -1);
    } else if (cursors.right.isDown) {
      this.flipX = false;
      this.setVelocityX(powerUpActive ? this.speed * 1.5 : this.speed);
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
