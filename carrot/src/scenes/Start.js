import { Player } from '../domain/Player.js';
import { Market } from '../domain/Market.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');
    }

    create() {
        // -------------------------
        // Game Objects
        // -------------------------

        this.background = this.add.tileSprite(
            640,
            360,
            1280,
            720,
            'background'
        );

        // -------------------------
        // Game State
        // -------------------------

        this.player = new Player();
        this.market = new Market();

        // 테스트용 초기값
        this.player.Money = 1000;

        // 당근 0개
        this.player.Resources.set('carrot', 5);

        // 시장 당근 100개
        this.market.MarketSupplies.set('carrot', 100);

        // 당근 가격 50
        this.market.MarketPrices.set('carrot', 50);

        // -------------------------
        // UI
        // -------------------------

        this.createPlayerUI();
        this.createMarketUI();
        this.createPurchaseButton();

        this.updateUI();
    }

    update() {
        this.background.tilePositionX += 2;
    }

    createPlayerUI() {

        this.playerMoneyText = this.add.text(
            50,
            50,
            '',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );

        this.playerCarrotText = this.add.text(
            50,
            90,
            '',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );
    }

    createMarketUI() {

        this.marketCarrotText = this.add.text(
            950,
            50,
            '',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );

        this.marketPriceText = this.add.text(
            950,
            90,
            '',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        );
    }

    createPurchaseButton() {

        const button = this.add.text(
            640,
            360,
            '당근 구매\n5개 구매',
            {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: {
                    left: 30,
                    right: 30,
                    top: 20,
                    bottom: 20
                },
                align: 'center'
            }
        ).setOrigin(0.5);

        button.setInteractive();

        button.on('pointerdown', () => {

            console.log('구매 전:', this.player.Resources.get('carrot'));


            this.player.Purchase(
                this.market,
                'carrot',
                5
            );

              console.log('구매 후:', this.player.Resources.get('carrot'));
            this.updateUI();

             console.log('UI 갱신 후:', this.playerCarrotText.text);
        });

        button.on('pointerover', () => {
            button.setTint(0x44ff44);
        });

        button.on('pointerout', () => {
            button.clearTint();
        });
    }

    updateUI() {
        console.log(this.player.Resources);
        console.log(this.player.Resources.get('carrot'));

        const carrot = this.player.Resources.get('carrot') ?? 0;
        const marketCarrot =
            this.market.MarketSupplies.get('carrot') ?? 0;

        const price =
            this.market.MarketPrices.get('carrot') ?? 0;

        this.playerMoneyText.setText(
            `Money: ${this.player.Money}`
        );

        this.playerCarrotText.setText(
        `Carrot: ${carrot}`
        );

        this.marketCarrotText.setText(
            `Market Carrot: ${marketCarrot}`
        );

        this.marketPriceText.setText(
            `Price: ${price}`
        );
    }
}
