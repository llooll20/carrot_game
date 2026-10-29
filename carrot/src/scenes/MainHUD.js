export class MainHUD {
    constructor(startScene) {
        this.startScene = startScene;
        this.add = startScene.add;
        this.events = startScene.events;
        this.scene = startScene.scene;
        this.player = startScene.player;
        this.market = startScene.market;
        this.turn = startScene.turn;
        this.turnSystem = startScene.turnSystem;
    }

    // 메인 화면의 플레이어 HUD를 생성합니다.
    create() {
        this.createPlayerUI();
        this.createMarketUI();
        this.createTurnCalendarUI();
        this.createLoadButton();
        this.createTurnEndButton();
        this.createTransportUI();
        this.createMarketButton();
    }

    fixUIObject(gameObject) {
        gameObject
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();

        gameObject.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
        });

        return gameObject;
    }

    // 플레이어의 보유 자금과 당근 수량을 표시합니다.
    createPlayerUI() {
        this.playerMoneyText = this.fixUIObject(this.add.text(50, 50, '', {
            fontSize: '28px',
            color: '#ffffff'
        }));

        this.playerCarrotText = this.fixUIObject(this.add.text(50, 90, '', {
            fontSize: '28px',
            color: '#ffffff'
        }));
    }

    // 시장의 당근 재고와 가격을 표시합니다.
    createMarketUI() {
        this.marketCarrotText = this.fixUIObject(this.add.text(950, 50, '', {
            fontSize: '28px',
            color: '#ffffff'
        }));

        this.marketPriceText = this.fixUIObject(this.add.text(950, 90, '', {
            fontSize: '28px',
            color: '#ffffff'
        }));
    }

    // 현재 턴과 연월을 표시합니다.
    createTurnCalendarUI() {
        this.turnCalendarText = this.fixUIObject(this.add.text(640, 20, '', {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { left: 12, right: 12, top: 8, bottom: 8 }
        }).setOrigin(0.5, 0));
    }

    // 시장 창을 여는 버튼을 생성합니다.
    createMarketButton() {
        const button = this.fixUIObject(this.add.text(1000, 300, '상점', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: {
                left: 25,
                right: 25,
                top: 15,
                bottom: 15
            }
        }).setOrigin(0.5));

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

    // 플레이어의 당근을 운송 장치에 적재하는 버튼을 생성합니다.
    createLoadButton() {
        const button = this.fixUIObject(this.add.text(1000, 480, '당근 적재\n5개 적재', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: {
                left: 15,
                right: 15,
                top: 15,
                bottom: 15
            }
        }).setOrigin(0.5));

        button.on('pointerdown', () => {
            const amount = 5;
            const resource = 1;
            const currentAmount = this.player.Resources.get(resource) ?? 0;

            if (currentAmount < amount) {
                console.log('당근이 부족합니다.');
                return;
            }

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

    // 운송 중인 자원을 표시하고 당근 반환 버튼을 생성합니다.
    createTransportUI() {
        this.transportText = this.fixUIObject(this.add.text(950, 600, '', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: {
                left: 15,
                right: 15,
                top: 15,
                bottom: 15
            }
        }));

        const returnButton = this.fixUIObject(this.add.text(950, 680, '당근 5개 반환', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        }));

        returnButton.on('pointerover', () => {
            returnButton.setTint(0x44ff44);
        });

        returnButton.on('pointerout', () => {
            returnButton.clearTint();
        });

        returnButton.on('pointerdown', () => {
            console.log('버튼 클릭됨');
            const resource = 1;
            const amount = 5;
            const currentAmount = this.player.Transport.getResourceAmount(resource);

            if (currentAmount < amount) {
                console.log('운송 중인 당근이 부족합니다.');
                return;
            }

            this.player.getResourceFromTransport(resource, amount);
            this.updateUI();
        });
    }

    // 턴 종료를 실행하는 버튼을 생성합니다.
    createTurnEndButton() {
        const button = this.fixUIObject(this.add.text(50, 650, '턴 종료', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: {
                left: 25,
                right: 25,
                top: 15,
                bottom: 15
            }
        }));

        button.on('pointerdown', () => {
            console.log('턴 종료');
            this.turnSystem.EndTurn(this.turn, this.market, this.player);
            this.restoreCompletedProductionTiles();

            console.log('플레이어의 총 저장공간', this.player.getCapacityOfStorage());
            console.log('플레이어의 가용 저장공간', this.player.getAvailableStorage());
            console.log('플레이어의 자원량', this.player.CurrentAmount);
            console.log(this.player.Resources);

            this.updateUI();
        });

        button.on('pointerover', () => {
            button.setTint(0x44ff44);
        });

        button.on('pointerout', () => {
            button.clearTint();
        });
    }

    // 턴 종료 후 생산 기반 타일의 표시 색상을 갱신합니다.
    restoreCompletedProductionTiles() {
        for (const productionBase of this.player.ProductionBases) {
            const { x, y } = productionBase.Position;
            const tileObject = this.startScene.tileObjects.get(`${x},${y}`);
            if (!tileObject) continue;

            const state = productionBase.getProductionState();
            if (state === 'Harvestable') {
                tileObject.setTint(0x8b4513);
            } else if (state === 'Growing' || productionBase.getInputResources().size > 0) {
                tileObject.setTint(0x00ff00);
            } else {
                tileObject.setTint(0x808080);
            }
        }
    }

    // 플레이어, 시장, 운송 장치 및 달력 정보를 갱신합니다.
    updateUI() {
        const currentTurn = this.turn?.CurrentTurn ?? 0;
        this.turnCalendarText?.setText(currentTurn > 0
            ? `턴 ${currentTurn}주차  ·  ${this.turn.GetYear()}년 ${this.turn.GetMonth()}월`
            : '게임 시작 전');

        const resource = 1;
        const carrot = this.player.Resources.get(resource) ?? 0;
        const marketItem = this.market.MarketItems.get(resource);
        const marketCarrot = marketItem?.Stock ?? 0;
        const price = marketItem?.Price ?? 0;

        this.playerMoneyText.setText(`Money: ${this.player.Money}`);
        this.playerCarrotText.setText(`Carrot: ${carrot}`);
        this.marketCarrotText.setText(`Market Carrot: ${marketCarrot}`);
        this.marketPriceText.setText(`Price: ${price}`);

        const resources = this.player.Transport.getResources();
        let transportText = 'Transport\n';

        for (const [resourceNumber, amount] of resources) {
            transportText += `${resourceNumber}: ${amount}\n`;
        }

        this.transportText.setText(transportText);
    }
}
