class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {
      jump: scene.sound.add("jump"),
      collect: scene.sound.add("collect"),
      hit: scene.sound.add("hit"),
      powerup: scene.sound.add("powerup"),
      powerupBgm: scene.sound.add("powerupBgm"),
      boss: scene.sound.add("boss"),
      bgm: scene.sound.add("bgm"),
      feverbgm: scene.sound.add("feverbgm"),
    };

    this.sounds.bgm.play({ loop: true });
  }

  play(key, config = {}) {
    if (this.sounds[key]) {
      this.sounds[key].play(config);
    }
  }

  stop(key) {
    if (this.sounds[key]) {
      this.sounds[key].stop();
    }
  }
}
