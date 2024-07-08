class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();

    if (!scene.sys.game.device.os.desktop) {
      this.addVirtualJoystick();
    }

    this.jumpPressed = false;
  }

  addVirtualJoystick() {
    const leftButton = document.getElementById("left-button");
    const rightButton = document.getElementById("right-button");
    const jumpButton = document.getElementById("jump-button");

    leftButton.addEventListener("touchstart", () => {
      this.cursors.left.isDown = true;
    });
    leftButton.addEventListener("touchend", () => {
      this.cursors.left.isDown = false;
    });

    rightButton.addEventListener("touchstart", () => {
      this.cursors.right.isDown = true;
    });
    rightButton.addEventListener("touchend", () => {
      this.cursors.right.isDown = false;
    });

    jumpButton.addEventListener("touchstart", () => {
      if (!this.jumpPressed) {
        this.cursors.up.isDown = true;
        this.jumpPressed = true;
        setTimeout(() => {
          this.jumpPressed = false;
        }, 200);
      }
    });

    jumpButton.addEventListener("touchend", () => {
      this.cursors.up.isDown = false;
    });
  }
}
