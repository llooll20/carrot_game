import { Player } from '../domain/Player.js';
import { Market } from '../systems/Market.js';
import { TurnSystem } from '../systems/TurnSystem.js';
import { Turn } from '../models/Turn.js';
import { DataManager } from '../systems/DataManager.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');

        this.load.json('Resource', 'src/data/Resource.json');
        this.load.json('Recipe', 'src/data/Recipe.json');
        this.load.json('Market', 'src/data/Market.json');

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

        const resources = this.cache.json.get('Resource');
        const recipes = this.cache.json.get('Recipe');
        const market = this.cache.json.get('Market');

        this.dataManager = new DataManager();
        this.dataManager.LoadData(
            resources,
            recipes,
            market
        );

        this.player = new Player();
        this.market = new Market(this.dataManager);
        this.turn = new Turn();
        this.turnSystem = new TurnSystem(this.turn, this.market, this.player);
        // 테스트용 초기값
        this.player.Money = 1000;

        // 당근 0개
        this.player.Resources.set('carrot', 5);

        // -------------------------
        // UI
        // -------------------------

        this.createPlayerUI();
        this.createMarketUI();
        this.createPurchaseButton();
        this.createLoadButton();
        this.createTurnEndButton();
        this.createTransportUI();
        this.createMarketButton();

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
    createMarketButton() {
    const button = this.add.text(
        640,
        300,
        '상점',
        {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: {
                left: 25,
                right: 25,
                top: 15,
                bottom: 15
            }
        }
    ).setOrigin(0.5).setInteractive();

    button.on('pointerdown', () => {
        this.scene.launch('MarketWindow', {
            player: this.player,
            market: this.market
        });
        this.events.on('updateUI', () => {
            this.updateUI();
        });
    });
}
    createLoadButton() {

    const button = this.add.text(
        640,
        480,
        '당근 적재\n5개 적재',
        {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#333333',
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

        const amount = 5;
        const resource = 1;

        // Player가 가지고 있는 당근 확인
        const currentAmount =
            this.player.Resources.get(resource) ?? 0;

        if (currentAmount < amount) {
            console.log('당근이 부족합니다.');
            return;
        }

        // Transport에 적재
        this.player.setResourceToTransport(resource, amount);

        this.updateUI();
    });

    button.on('pointerover', () => {
        button.setTint(0x44ff44);
    });

    button.on('pointerout', () => {
        button.clearTint();
    });
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

            const resource = 1;
            const amount = 5;
            console.log('구매 전:', this.player.Resources.get(resource));
            this.player.Purchase(
                this.market,
                resource,
                amount
            );

                console.log('구매 후:', this.player.Resources.get(resource));
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
    createTransportUI() {

        this.transportText = this.add.text(
            950,
            600,
            '',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: {
                    left: 15,
                    right: 15,
                    top: 15,
                    bottom: 15
                }
            }
        );
        // 당근 5개 반환 버튼
    const returnButton = this.add.text(
        950,
        680,
        '당근 5개 반환',
        {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        }
    )
    .setInteractive();

    returnButton.on('pointerover', () => {
        returnButton.setTint(0x44ff44);
    });

    returnButton.on('pointerout', () => {
        returnButton.clearTint();
    });

    returnButton.on('pointerdown', () => {
        const resource = 1; // 당근 ResourceNumber
        const amount = 5;

        console.log('버튼 클릭됨');

        const currentAmount =
            this.player.Transport.getResourceAmount(resource);

        if (currentAmount < amount) {
            console.log('운송 중인 당근이 부족합니다.');
            return;
        }

        this.player.getResourceFromTransport(resource, amount);

        this.updateUI();
        });
    }

    createTurnEndButton() {
        const button = this.add.text(
            50,
            650,
            '턴 종료',
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: {
                    left: 25,
                    right: 25,
                    top: 15,
                    bottom: 15
                }
            }
        ).setInteractive();

        button.on('pointerdown', () => {

            console.log('턴 종료');

            this.turnSystem.EndTurn(this.turn, this.market, this.player);

            this.updateUI();
        });

        button.on('pointerover', () => {
            button.setTint(0x44ff44);
        });

        button.on('pointerout', () => {
            button.clearTint();
        });
    }

    updateUI() {

        const resource = 1; // 당근의 ResourceNumber

        const carrot = this.player.Resources.get(resource) ?? 0;

        const marketItem = this.market.MarketItems.get(resource);

        const marketCarrot = marketItem?.Stock ?? 0;
        const price = marketItem?.Price ?? 0;

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

        // 운송 장치 UI 갱신
        const resources = this.player.Transport.getResources();
        let transportText = 'Transport\n';

        for (const [resource, amount] of resources) {
            transportText += `${resource}: ${amount}\n`;
        }

        this.transportText.setText(transportText);
    }
}
