class ShopScene extends Phaser.Scene {
  constructor() {
    super("ShopScene");
    this.coins = 0;
    this.colorPurchases = [];
    this.characterPurchases = [];
    this.specialPurchases = [];
    this.currentColor = null;
    this.currentCharacter = null;
    this.currentSpecial = null;
    this.sizeUpCounter = 0; // 히든 커맨드를 위한 카운터
  }

  init(data) {
    this.coins = data.coins || 0;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    this.coinsText = this.add
      .text(centerX, height * 0.05, `Coins: ${this.coins.toLocaleString()}`, {
        fontSize: this.getFontSize(24),
      })
      .setOrigin(0.5);

    this.loadPurchases();

    const colorItems = [
      { name: "마젠타", price: 50, key: "magenta" },
      { name: "오랑게", price: 50, key: "orange" },
    ];
    const characterItems = [
      { name: "모험가", price: 100, key: "adventurer" },
      { name: "기사", price: 300, key: "knight" },
      { name: "???", price: 700, key: "mystery" },
    ];
    const specialItems = [
      { name: "사이즈업", price: 10, key: "sizeUp" },
      { name: "스피드업", price: 50, key: "speedUp" },
    ];

    const colorItemsY = height * 0.1;
    this.add
      .text(centerX, colorItemsY, "색상", { fontSize: this.getFontSize(24) })
      .setOrigin(0.5);
    this.createShopItems(
      colorItems,
      centerX,
      colorItemsY + height * 0.03,
      this.colorPurchases,
      (item) => this.buyColor(item)
    );

    const characterItemsY =
      colorItemsY + (colorItems.length + 1) * height * 0.07;
    this.add
      .text(centerX, characterItemsY, "캐릭터", {
        fontSize: this.getFontSize(24),
      })
      .setOrigin(0.5);
    this.createShopItems(
      characterItems,
      centerX,
      characterItemsY + height * 0.03,
      this.characterPurchases,
      (item) => this.buyCharacter(item)
    );

    const specialItemsY =
      characterItemsY + (characterItems.length + 1) * height * 0.07;
    this.add
      .text(centerX, specialItemsY, "Specials", {
        fontSize: this.getFontSize(24),
      })
      .setOrigin(0.5);
    this.createShopItems(
      specialItems,
      centerX,
      specialItemsY + height * 0.03,
      this.specialPurchases,
      (item) => this.buySpecial(item)
    );

    this.add
      .text(centerX, height * 0.9, "Back to Game", {
        fontSize: this.getFontSize(24),
      })
      .setInteractive()
      .setOrigin(0.5)
      .on("pointerdown", () =>
        this.scene.start("MainScene", { coins: this.coins })
      );

    this.add
      .text(
        width * 0.95,
        height * 0.95,
        "Designed by Lee-Young-Jae, Game Version: 1.0.2.",
        {
          fontSize: this.getFontSize(8),
        }
      )
      .setColor("#ff00ff")
      .setOrigin(1);
  }

  createShopItems(items, centerX, startY, purchases, buyCallback) {
    const itemHeight = this.scale.height * 0.07;
    items.forEach((item, index) => {
      const y = startY + index * itemHeight;
      this.add
        .text(centerX - this.scale.width * 0.25, y, item.name, {
          fontSize: this.getFontSize(20),
        })
        .setOrigin(0, 0.5);
      const buyButton = this.add
        .text(centerX + this.scale.width * 0.25, y, item.price.toString(), {
          fontSize: this.getFontSize(20),
        })
        .setOrigin(1, 0.5)
        .setInteractive()
        .on("pointerdown", () => buyCallback(item));

      if (purchases.includes(item.key)) {
        buyButton.setText("Select").setColor("#00ff00");
      }

      if (
        (item.key === this.currentColor && purchases === this.colorPurchases) ||
        (item.key === this.currentCharacter &&
          purchases === this.characterPurchases) ||
        (this.currentSpecial.includes(item.key) &&
          purchases === this.specialPurchases)
      ) {
        buyButton.setText("Selected").setColor("#0000ff");
      }
    });
  }

  getFontSize(baseSize) {
    const scaleFactor = Math.min(
      this.scale.width / 800,
      this.scale.height / 600
    );
    return Math.max(Math.floor(baseSize * scaleFactor), 10) + "px";
  }

  buyColor(item) {
    if (this.colorPurchases.includes(item.key)) {
      if (this.currentColor === item.key) {
        this.currentColor = "default";
      } else {
        this.currentColor = item.key;
      }
      this.saveSelections();
      this.scene.restart();
    } else if (this.coins >= item.price) {
      this.coins -= item.price;
      this.colorPurchases.push(item.key);
      this.currentColor = item.key;
      this.savePurchases();
      this.saveSelections();
      this.scene.restart();
    }
  }

  buyCharacter(item) {
    if (this.characterPurchases.includes(item.key)) {
      if (this.currentCharacter === item.key) {
        this.currentCharacter = "player";
      } else {
        this.currentCharacter = item.key;
      }
      this.saveSelections();
      this.scene.restart();
    } else if (this.coins >= item.price) {
      this.coins -= item.price;
      this.characterPurchases.push(item.key);
      this.currentCharacter = item.key;
      this.savePurchases();
      this.saveSelections();
      this.scene.restart();
    }
  }

  buySpecial(item) {
    if (item.key === "sizeUp") {
      this.sizeUpCounter++;
      if (this.sizeUpCounter === 10) {
        this.coins += 1000;
        this.sizeUpCounter = 0;
        this.coinsText.setText(`Coins: ${this.coins.toLocaleString()}`);
        this.savePurchases();
        alert("히든 커맨드 활성화: 1000 코인 추가!");
      }
    }

    if (this.specialPurchases.includes(item.key)) {
      if (this.currentSpecial.includes(item.key)) {
        this.currentSpecial = this.currentSpecial.filter(
          (special) => special !== item.key
        );
      } else {
        this.currentSpecial.push(item.key);
      }
      this.saveSelections();
      this.scene.restart();
    } else if (this.coins >= item.price) {
      this.coins -= item.price;
      this.specialPurchases.push(item.key);
      this.currentSpecial.push(item.key);
      this.savePurchases();
      this.saveSelections();
      this.scene.restart();
    }
  }

  loadPurchases() {
    const savedColorPurchases = localStorage.getItem("colorPurchases");
    this.colorPurchases = savedColorPurchases
      ? JSON.parse(savedColorPurchases)
      : ["default"];

    const savedCharacterPurchases = localStorage.getItem("characterPurchases");
    this.characterPurchases = savedCharacterPurchases
      ? JSON.parse(savedCharacterPurchases)
      : ["player"];

    const savedSpecialPurchases = localStorage.getItem("specialPurchases");
    this.specialPurchases = savedSpecialPurchases
      ? JSON.parse(savedSpecialPurchases)
      : ["default"];

    this.currentColor = localStorage.getItem("currentColor") || "default";
    this.currentCharacter = localStorage.getItem("currentCharacter") || "";
    const savedSpecial = localStorage.getItem("currentSpecial");
    this.currentSpecial = savedSpecial ? JSON.parse(savedSpecial) : [];
  }

  savePurchases() {
    localStorage.setItem("colorPurchases", JSON.stringify(this.colorPurchases));
    localStorage.setItem(
      "characterPurchases",
      JSON.stringify(this.characterPurchases)
    );
    localStorage.setItem(
      "specialPurchases",
      JSON.stringify(this.specialPurchases)
    );
    localStorage.setItem("coins", this.coins.toString());
  }

  saveSelections() {
    localStorage.setItem("currentColor", this.currentColor);
    localStorage.setItem("currentCharacter", this.currentCharacter);
    localStorage.setItem("currentSpecial", JSON.stringify(this.currentSpecial));
  }
}
