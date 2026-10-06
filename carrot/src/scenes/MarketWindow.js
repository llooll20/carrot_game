export class MarketWindow extends Phaser.Scene {

    constructor() {
        super('MarketWindow');
    }

    init(data) {
        this.player = data.player;
        this.market = data.market;
    }

    create() {

        // 마켓 배경
        this.add.rectangle(
            640,
            360,
            800,
            500,
            0x222222
        );

        // 마켓 제목
        this.add.text(
            640,
            150,
            'MARKET',
            {
                fontSize: '40px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.createMarketUI();
        this.createPurchaseButton();
        this.createCloseButton();

        this.updateUI();
    }

    createMarketUI() {

        this.marketCarrotText = this.add.text(
            640,
            230,
            '',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this.marketPriceText = this.add.text(
            640,
            270,
            '',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
    }

    createPurchaseButton() {

        const button = this.add.text(
            640,
            370,
            '당근 구매\n5개 구매',
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#444444',
                padding: {
                    left: 25,
                    right: 25,
                    top: 15,
                    bottom: 15
                },
                align: 'center'
            }
        ).setOrigin(0.5);

        button.setInteractive();

        button.on('pointerdown', () => {

            const resource = 1;
            const amount = 5;

            this.player.Purchase(
                this.market,
                resource,
                amount
            );

            this.updateUI();
        });

        button.on('pointerover', () => {
            button.setTint(0x44ff44);
        });

        button.on('pointerout', () => {
            button.clearTint();
        });
    }

    createCloseButton() {

        const button = this.add.text(
            980,
            150,
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

        const resource = 1;
        const marketItem =
            this.market.MarketItems.get(resource);

        this.marketCarrotText.setText(
            `Market Carrot: ${marketItem?.Stock ?? 0}`
        );

        this.marketPriceText.setText(
            `Price: ${marketItem?.Price ?? 0}`
        );
    }
}