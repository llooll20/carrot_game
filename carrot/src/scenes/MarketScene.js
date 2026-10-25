export class MarketScene extends Phaser.Scene {

    constructor() {
        super('MarketWindow');
        this.quantityInput = '1';
        this.quantityInputActive = false;
        this.marketRowObjects = [];
    }

    init(data) {
        this.player = data.player;
        this.market = data.market;
    }

    create() {

        // 마켓 배경
        this.add.rectangle(640, 360, 1000, 600, 0x222222);

        // 마켓 제목
        this.add.text(
            640,
            100,
            'MARKET',
            {
                fontSize: '40px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.createMarketUI();
        this.createPurchaseControls();
        this.createCloseButton();
        this.input.keyboard.on('keydown', this.handleQuantityKey, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keydown', this.handleQuantityKey, this);
        });

        this.updateUI();
    }

    createMarketUI() {
        this.add.text(220, 160, '상품', { fontSize: '20px', color: '#bbbbbb' });
        this.add.text(700, 160, '가격', { fontSize: '20px', color: '#bbbbbb' });
        this.add.text(920, 160, '수량', { fontSize: '20px', color: '#bbbbbb' });
        this.marketListTop = 190;
    }

    refreshMarketList() {
        for (const object of this.marketRowObjects) object.destroy();
        this.marketRowObjects = [];

        const marketItems = [...(this.market?.MarketItems?.entries?.() ?? [])];
        if (!marketItems.some(([resourceNumber]) => resourceNumber === this.selectedResourceNumber)) {
            this.selectedResourceNumber = marketItems[0]?.[0] ?? null;
        }

        const resources = this.cache.json.get('Resource') ?? [];
        marketItems.forEach(([resourceNumber, item], index) => {
            const y = this.marketListTop + 24 + index * 48;
            const isSelected = resourceNumber === this.selectedResourceNumber;
            const background = this.add.rectangle(640, y, 860, 42, isSelected ? 0x40556b : 0x303030)
                .setInteractive({ useHandCursor: true });
            const name = resources.find(resource => resource.ResourceNumber === resourceNumber)?.ResourceName
                ?? `ID ${resourceNumber}`;
            const nameText = this.add.text(220, y, name, { fontSize: '22px', color: '#ffffff' })
                .setOrigin(0, 0.5);
            const priceText = this.add.text(700, y, `${item.Price}`, { fontSize: '22px', color: '#ffffff' })
                .setOrigin(0, 0.5);
            const stockText = this.add.text(920, y, `${item.Stock}`, { fontSize: '22px', color: '#ffffff' })
                .setOrigin(0, 0.5);

            background.on('pointerdown', () => {
                this.selectedResourceNumber = resourceNumber;
                this.refreshMarketList();
            });
            this.marketRowObjects.push(background, nameText, priceText, stockText);
        });
    }

    createPurchaseControls() {
        this.add.text(755, 570, '수량', { fontSize: '22px', color: '#ffffff' }).setOrigin(0, 0.5);
        this.quantityInputBackground = this.add.rectangle(870, 570, 130, 44, 0x111111)
            .setStrokeStyle(2, 0x888888)
            .setInteractive({ useHandCursor: true });
        this.quantityInputText = this.add.text(870, 570, this.quantityInput, {
            fontSize: '22px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);
        this.quantityInputBackground.on('pointerdown', () => {
            this.quantityInputActive = true;
            this.quantityInput = '';
            this.quantityInputText.setText('');
            this.quantityInputBackground.setStrokeStyle(2, 0xffcc55);
        });

        const button = this.add.text(1030, 570, '구매', {
            fontSize: '22px', color: '#ffffff', backgroundColor: '#356b45',
            padding: { left: 24, right: 24, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        button.on('pointerdown', this.purchaseSelectedItem, this);
        button.on('pointerover', () => button.setTint(0xccffcc));
        button.on('pointerout', () => button.clearTint());

        this.purchaseStatusText = this.add.text(640, 625, '', {
            fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);
    }

    handleQuantityKey(event) {
        if (!this.quantityInputActive) return;

        if (event.key === 'Backspace') {
            this.quantityInput = this.quantityInput.slice(0, -1);
        } else if (/^\d$/.test(event.key) && this.quantityInput.length < 6) {
            this.quantityInput += event.key;
        } else if (event.key === 'Enter') {
            this.quantityInputActive = false;
            this.quantityInputBackground.setStrokeStyle(2, 0x888888);
        }

        this.quantityInputText.setText(this.quantityInput || '');
    }

    purchaseSelectedItem() {
        const amount = Number(this.quantityInput);
        if (!Number.isInteger(amount) || amount <= 0 || this.selectedResourceNumber == null) {
            this.purchaseStatusText.setText('구매할 상품과 올바른 수량을 선택하세요.');
            return;
        }

        const success = this.player.Purchase(this.market, this.selectedResourceNumber, amount);
        this.purchaseStatusText.setText(success ? '구매했습니다.' : '구매할 수 없습니다. 수량과 보유 자금을 확인하세요.');
        this.updateUI();
    }

    createCloseButton() {

        const button = this.add.text(
            1100,
            100,
            'X',
            {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#555555',
                padding: {
                    left: 15,
                    right: 15,
                    top: 5,
                    bottom: 5
                }
            }
        ).setOrigin(0.5);

        button.setInteractive();

        button.on('pointerdown', () => {
            this.scene.get('Start').events.emit('updateUI');
            this.scene.stop();
        });

        button.on('pointerover', () => {
            button.setTint(0xff4444);
        });

        button.on('pointerout', () => {
            button.clearTint();
        });
    }

    updateUI() {
        this.refreshMarketList();
    }
}
