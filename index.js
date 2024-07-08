const game = new Phaser.Game(config);

// 터치 이벤트 기본 동작 방지
document.addEventListener(
  "touchstart",
  function (e) {
    e.preventDefault();
  },
  { passive: false } // 스크롤 방지
);

document.getElementById("game-container").addEventListener(
  "touchstart",
  function (e) {
    e.preventDefault();
  },
  { passive: false } // 스크롤 방지
);
