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
    this.jumpPressed = false;
  }

  sizeUp() {
    this.setScale(2);
    this.setCollisionArea();
  }

  speedUp() {
    this.speed *= 1.5;
  }

  jumpHigher() {
    this.jumpSpeed = -350;
  }

  jumpLower() {
    this.jumpSpeed = -170;
  }

  setAllowJumpAcceleration() {
    this.allowJumpAcceleration = true;
  }

  setAllowDoubleJump() {
    this.allowDoubleJump = true;
  }

  // 충돌 영역 조정
  setCollisionArea() {
    const width = this.width;
    const height = this.height;

    // Offset을 중앙으로 설정
    const offsetX = (width - this.body.width) / 2;
    const offsetY = (height - this.body.height) / 2;
    this.body.setOffset(offsetX, offsetY);
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
      Phaser.Input.Keyboard.JustDown(cursors.up) ||
      Phaser.Input.Keyboard.JustDown(cursors.space)
    ) {
      if (this.body.onFloor() || (this.allowDoubleJump && this.jumps < 2)) {
        this.jumps = this.jump();
      }
    } else if (
      cursors.up.isDown &&
      !this.jumpPressed &&
      (this.body.onFloor() || (this.allowDoubleJump && this.jumps < 2))
    ) {
      this.jumps = this.jump();
    }

    // 땅에 닿았을 때 점프 횟수 리셋
    if (this.body.onFloor()) {
      this.jumps = 0;
    }
  }

  jump() {
    if (this.jumpPressed) {
      return this.jumps;
    }
    this.jumpPressed = true;
    this.setVelocityY(this.jumpSpeed);
    this.scene.soundManager.play("jump");
    this.jumps++;

    setTimeout(() => {
      this.jumpPressed = false;
    }, 300);

    return this.jumps;
  }
}
