class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.speed = 160;
    this.jumpSpeed = -200;
    this.allowJumpAcceleration = false;
    this.allowDoubleJump = false;
    this.jumps = 0;
  }

  speedUp() {
    this.speed *= 1.5;
  }

  jumpHigher() {
    this.jumpSpeed = -350;
  }

  setAllowJumpAcceleration() {
    this.allowJumpAcceleration = true;
  }

  setAllowDoubleJump() {
    this.allowDoubleJump = true;
  }

  update(cursors, powerUpActive) {
    const isJumping = !this.body.onFloor();
    const jumpAcceleration = this.allowJumpAcceleration && isJumping ? 1.5 : 1;

    if (cursors.left.isDown) {
      this.flipX = true;
      this.setVelocityX(
        powerUpActive
          ? this.speed * -1.5 * jumpAcceleration
          : this.speed * -1 * jumpAcceleration
      );
    } else if (cursors.right.isDown) {
      this.flipX = false;
      this.setVelocityX(
        powerUpActive
          ? this.speed * 1.5 * jumpAcceleration
          : this.speed * jumpAcceleration
      );
    } else {
      this.setVelocityX(0);
    }

    if (
      this.scene.sys.game.device.os.desktop &&
      (Phaser.Input.Keyboard.JustDown(cursors.up) ||
        Phaser.Input.Keyboard.JustDown(cursors.space))
    ) {
      if (this.body.onFloor() || (this.allowDoubleJump && this.jumps < 2)) {
        console.log("jump");
        this.jump();
      }
    } else if (
      cursors.up.isDown &&
      (this.body.onFloor() || (this.allowDoubleJump && this.jumps < 2))
    ) {
      this.jump();
    }

    // 땅에 닿았을 때 점프 횟수 리셋
    if (this.body.onFloor()) {
      this.jumps = 0;
    }
  }

  jump() {
    this.setVelocityY(this.jumpSpeed);
    this.scene.soundManager.play("jump");
    this.jumps++;
  }
}
