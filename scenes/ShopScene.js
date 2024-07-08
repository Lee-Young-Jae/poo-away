class ShopScene extends Phaser.Scene {
  constructor() {
    super("ShopScene");
    this.coins = 0;
    this.colorPurchases = [];
    this.characterPurchases = [];
    this.currentColor = null;
    this.currentCharacter = null;
  }

  init(data) {
    this.coins = data.coins || 0;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;

    this.add
      .text(centerX, height * 0.05, "Shop", { fontSize: this.getFontSize(32) })
      .setOrigin(0.5);
    this.coinsText = this.add
      .text(centerX, height * 0.1, `Coins: ${this.coins}`, {
        fontSize: this.getFontSize(24),
      })
      .setOrigin(0.5);

    this.loadPurchases();

    const colorItems = [
      { name: "Default", price: 0, key: "default" },
      { name: "Blue", price: 100, key: "blue" },
      { name: "Green", price: 150, key: "green" },
      { name: "Red", price: 200, key: "red" },
    ];

    const characterItems = [
      { name: "Default", price: 0, key: "player" },
      { name: "모험가", price: 300, key: "adventurer" },
      { name: "???", price: 1000, key: "knight" },
    ];

    const colorItemsY = height * 0.15;
    this.add
      .text(centerX, colorItemsY, "Colors", { fontSize: this.getFontSize(24) })
      .setOrigin(0.5);
    this.createShopItems(
      colorItems,
      centerX,
      colorItemsY + height * 0.05,
      this.colorPurchases,
      (item) => this.buyColor(item)
    );

    const characterItemsY =
      colorItemsY + (colorItems.length + 1) * height * 0.07;
    this.add
      .text(centerX, characterItemsY, "Characters", {
        fontSize: this.getFontSize(24),
      })
      .setOrigin(0.5);
    this.createShopItems(
      characterItems,
      centerX,
      characterItemsY + height * 0.05,
      this.characterPurchases,
      (item) => this.buyCharacter(item)
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
          purchases === this.characterPurchases)
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
    return Math.max(Math.floor(baseSize * scaleFactor), 12) + "px";
  }

  buyColor(item) {
    if (this.colorPurchases.includes(item.key)) {
      this.currentColor = item.key;
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
      this.currentCharacter = item.key;
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

  loadPurchases() {
    const savedColorPurchases = localStorage.getItem("colorPurchases");
    this.colorPurchases = savedColorPurchases
      ? JSON.parse(savedColorPurchases)
      : ["green"];

    const savedCharacterPurchases = localStorage.getItem("characterPurchases");
    this.characterPurchases = savedCharacterPurchases
      ? JSON.parse(savedCharacterPurchases)
      : ["player"];

    this.currentColor = localStorage.getItem("currentColor") || "green";
    this.currentCharacter = localStorage.getItem("currentCharacter") || "";
  }

  savePurchases() {
    localStorage.setItem("colorPurchases", JSON.stringify(this.colorPurchases));
    localStorage.setItem(
      "characterPurchases",
      JSON.stringify(this.characterPurchases)
    );
    localStorage.setItem("coins", this.coins.toString());
  }

  saveSelections() {
    localStorage.setItem("currentColor", this.currentColor);
    localStorage.setItem("currentCharacter", this.currentCharacter);
  }
}
