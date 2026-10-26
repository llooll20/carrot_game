import { Player } from '../domain/Player.js';
import { Market } from '../domain/Market.js';
import { TurnSystem } from '../systems/TurnSystem.js';
import { Turn } from '../models/Turn.js';
import { DataManager } from '../systems/DataManager.js';
import { ProductionBase } from '../models/ProductionBase.js'
import { GameMap } from '../domain/GameMap.js';
import { Employee } from '../domain/Employee.js';
import { Bank } from '../domain/Bank.js';
import { ContractSystem } from '../systems/ContractSystem.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');

        this.load.json('Resource', 'src/data/Resource.json');
        this.load.json('Recipe', 'src/data/Recipe.json');
        this.load.json('Market', 'src/data/Market.json');
        this.load.json('ProductionBase', 'src/data/ProductionBase.json');
        this.load.json('Contract', 'src/data/Contract.json');

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
        // 테스트용 초기값
        this.player.Money = 1000;
        this.player.CreditRating = 2;
        this.player.AddResource(2,10);
        this.player.setStorageFacility(1,50);

        this.market = new Market(this.dataManager);
        this.map=new GameMap(10,10);
        this.turn = new Turn();
        this.bank = new Bank(1000000);
        this.bank.AddCustomer(this.player);
        const contracts = this.cache.json.get('Contract');
        this.bank.LoadContracts(contracts);
        // Bank.LoadContracts historically omits Contract_Id 1; keep the JSON catalogue intact here.
        this.bank.Contracts = Array.isArray(contracts) ? [...contracts] : [];
        this.contractSystem = new ContractSystem(contracts);
        this.contractSystem.Contractors.set('Player:1', this.player);
        this.contractSystem.Contractors.set('Bank:1', this.bank);
        this.turnSystem = new TurnSystem(
            this.turn, this.market, this.player, this.dataManager, this.contractSystem
        );
        

        // -------------------------
        // UI
        // -------------------------

        this.createPlayerUI();
        this.createMarketUI();
        this.createTurnCalendarUI();
        this.createLoadButton();
        this.createTurnEndButton();
        this.createTransportUI();
        this.createMarketButton();
        this.createDeveloperDebugAccess();
        this.createContractSceneAccess();
        this.createBankSceneAccess();
        this.createMap();
        this.updateUI();
    }

    createBankSceneAccess() {
        const button = this.add.text(1000, 360, '은행', {
            fontSize: '24px', color: '#ffffff', backgroundColor: '#5b4030',
            padding: { left: 25, right: 25, top: 12, bottom: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        button.on('pointerdown', this.openBankScene, this);
        button.on('pointerover', () => button.setTint(0xffddaa));
        button.on('pointerout', () => button.clearTint());
    }

    openBankScene() {
        if (this.scene.isActive('BankScene')) return;
        this.scene.pause();
        this.scene.launch('BankScene', { player: this.player, bank: this.bank, dataManager: this.dataManager });
    }

    createContractSceneAccess() {
        this.add.text(1000, 580, '계약서 프로토타입: F2', {
            fontSize: '16px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 8, y: 6 }
        });
        this.input.keyboard.on('keydown-F2', this.openContractScene, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keydown-F2', this.openContractScene, this);
        });
    }

    openContractScene() {
        if (this.scene.isActive('ContractScene')) return;
        const contracts = this.cache.json.get('Contract');
        this.scene.pause();
        this.scene.launch('ContractScene', {
            contract: this.contractSystem?.Contracts?.find(contract => contract.Contract_Id === 1) ??
                (Array.isArray(contracts) ? contracts[0] : null),
            player: this.player,
            contractSystem: this.contractSystem,
            dataManager: this.dataManager,
            returnScene: 'Start'
        });
    }

    createDeveloperDebugAccess() {
        this.add.text(1000, 540, '개발자 상태 보기: F3', {
            fontSize: '16px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 8, y: 6 }
        });
        this.input.keyboard.on('keydown-F3', this.openDeveloperDebugScene, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.keyboard.off('keydown-F3', this.openDeveloperDebugScene, this);
        });
    }

    openDeveloperDebugScene() {
        if (this.scene.isActive('DeveloperDebugScene')) return;

        this.scene.launch('DeveloperDebugScene', {
            player: this.player,
            market: this.market,
            turn: this.turn,
            turnSystem: this.turnSystem,
            dataManager: this.dataManager
        });
    }

    createMap() {
        const tileSize = 64;
        this.tileObjects= new Map();
        

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {

                const tile = this.add.rectangle(
                    x * tileSize + 300,
                    y * tileSize + 100,
                    tileSize,
                    tileSize
                );

                tile.setStrokeStyle(1, 0xffffff);
                tile.setInteractive();
                //화면의 타일 객체 저장
                this.tileObjects.set(`${x},${y}`, tile);

                tile.on('pointerdown', () => {
                    this.onTileClicked(x, y);
                });
            }
        }
    }
    onTileClicked(x, y) {
        const employee = new Employee(1,"Lee")
        const tile = this.map.getTile(x, y);
        const tileObject = this.tileObjects.get(`${x},${y}`);

        if (tile.ProductionBase !== null) {
            const productionBase = this.player.ProductionBases.find(base =>
                base.Position.x === x && base.Position.y === y
            );
            if (productionBase?.getProductionState() === 'Harvestable') {
                this.harvestProductionBase(productionBase);
                return;
            }

            if (productionBase?.isProductionStateEmpty() && productionBase.getInputResources().size === 0) {
                const inputResourceNumber = 2;
                const initialInputAmount = 1;
                if (!this.player.removeResource(inputResourceNumber, initialInputAmount)) {
                    console.log('투입할 자원이 부족합니다.');
                    return;
                }

                productionBase.setInputResource(inputResourceNumber, initialInputAmount);
                tileObject.setFillStyle(0x00ff00);
                this.updateUI();
                return;
            }

            console.log('이미 생산 기반이 있습니다.');

            return;
        }

        const land = new ProductionBase(
            this.player.getProductionBaseNumber(),
            1,
            { x, y }
        );

        tileObject.setFillStyle(0x808080);

        land.onActivate();

        this.player.ProductionBases.push(land);
        tile.ProductionBase = 1;

        console.log('토지 설치 완료');
        console.log('플레이어 생산기반:', this.player.ProductionBases);
    }

    harvestProductionBase(productionBase) {
        for (const [resourceNumber, amount] of productionBase.getProducedResources()) {
            this.player.AddResource(resourceNumber, amount);
            productionBase.setProducedResource(resourceNumber, 0);
        }
        productionBase.clearProgress();
        const { x, y } = productionBase.Position;
        this.tileObjects.get(`${x},${y}`)?.setFillStyle(0x808080);
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

    createTurnCalendarUI() {
        this.turnCalendarText = this.add.text(640, 20, '', {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { left: 12, right: 12, top: 8, bottom: 8 }
        }).setOrigin(0.5, 0);
    }

    createMarketButton() {
    const button = this.add.text(
        1000,
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
        1000,
        480,
        '당근 적재\n5개 적재',
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
            this.restoreCompletedProductionTiles();

            console.log("플레이어의 총 저장공간", this.player.getCapacityOfStorage());
            console.log("플레이어의 가용 저장공간", this.player.getAvailableStorage());
            console.log("플레이어의 자원량", this.player.CurrentAmount);
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

    restoreCompletedProductionTiles() {
        for (const productionBase of this.player.ProductionBases) {
            const { x, y } = productionBase.Position;
            const tileObject = this.tileObjects.get(`${x},${y}`);
            if (!tileObject) continue;

            const state = productionBase.getProductionState();
            if (state === 'Harvestable') {
                tileObject.setFillStyle(0x8b4513);
            } else if (state === 'Growing' || productionBase.getInputResources().size > 0) {
                tileObject.setFillStyle(0x00ff00);
            } else {
                tileObject.setFillStyle(0x808080);
            }
        }
    }

    updateUI() {

        const currentTurn = this.turn?.CurrentTurn ?? 0;
        this.turnCalendarText?.setText(currentTurn > 0
            ? `턴 ${currentTurn}주차  ·  ${this.turn.GetYear()}년 ${this.turn.GetMonth()}월`
            : '게임 시작 전');

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
