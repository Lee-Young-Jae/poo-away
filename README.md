# Poo Away

## 🚀 체험하기

[플레이! - https://lee-young-jae.github.io/poo-away/](https://lee-young-jae.github.io/poo-away/)

## 🙋 소개

`Phaser.js`를 경험해보고자 재미삼아 만든 간단한 게임입니다.

## 🤖 게임 방법

> [!TIP] > `⭐️`의 특수효과를 이용하면 더 높은 점수와 코인을 획득할 수 있습니다.

### 모바일

- 화면에 있는 가상 키패드를 이용해 플레이합니다.
  - `←` 왼쪽으로 이동
  - `➡️` 오른쪽으로 이동
  - `↑` 점프

### PC

- 키보드 입력을 이용해 플레이합니다.
  - `←` 왼쪽으로 이동
  - `→` 오른쪽으로 이동
  - `↑` 점프

### 공통

- `💩`을 피해 최대한 오래 살아남습니다.
- `⭐️`을 먹으면 특수효과를 랜덤으로 얻습니다.
  - `⭐️`을 먹으면 3초간 무적이 됩니다.
  - `⭐️`을 먹으면 3초간 무적이 되며 속도가 1.5배 증가합니다.
  - `⭐️`을 먹으면 모든 `💩`이 사라집니다.
- `🪙` 을 먹어서 높은 점수를 획득하세요
  - `🪙`을 먹을 때마다 10점씩 획득합니다.
  - 100점 달성 시 **Level Up!**
- 낮은 확률로 피버타임이 발생합니다.
  - 피버타임 동안 `🪙`이 많이 생성됩니다.
- `🪙` 을 모아 상점을 이용하세요!
  - 상점에서는 `🪙`을 사용해 캐릭터를 구매할 수 있습니다.
  - 캐릭터는 능력치가 다릅니다.

## 📁 폴더구조

```bash
📦poo-away
 ┣ 📂assets
 ┃ ┣ 📂sounds
 ┣ 📂objects
 ┃ ┣ 📜Obstacles.js
 ┃ ┗ 📜Player.js
 ┣ 📂scenes
 ┃ ┣ 📜MainScene.js
 ┃ ┗ 📜ShopScene.js
 ┣ 📂utils
 ┃ ┣ 📜InputManager.js
 ┃ ┗ 📜SoundManager.js
 ┣ 📜README.md
 ┣ 📜config.js
 ┣ 📜index.html
 ┣ 📜index.js
 ┗ 📜styles.css
```

## ⚡️ Preview

![게임화면](https://github.com/Lee-Young-Jae/poo-away/assets/78532129/71ff8028-3fa4-422b-b480-e36cbaa5f59b)
