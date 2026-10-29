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
import { MainHUD } from './MainHUD.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');

        this.load.image('basicfield', 'assets/tiles/basicfield.png');
        this.load.image('beach', 'assets/tiles/beach.png');
        this.load.image('container', 'assets/tiles/container.png');
        this.load.image('garden', 'assets/tiles/garden.png');
        this.load.image('grassfield', 'assets/tiles/grassfield.png');
        this.load.image('mountain', 'assets/tiles/mountain.png');
        this.load.image('house', 'assets/tiles/house.png');
        this.load.image('sea_close', 'assets/tiles/sea_close.png');
        this.load.image('sea_deep', 'assets/tiles/sea_deep.png');
        this.load.image('wagon', 'assets/tiles/wagon.png');

        this.load.image('carrot', 'assets/crops/carrot.png');
        this.load.image('carrotseed', 'assets/crops/carrotseed.png');
        this.load.image('plantcarrot', 'assets/crops/plantcarrot.png');

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
        this.map = new GameMap(100, 100);
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

        this.input.setTopOnly(true);
        this.mainHUD = new MainHUD(this);
        this.mainHUD.create();
        this.createDeveloperDebugAccess();
        this.createContractSceneAccess();
        this.createBankSceneAccess();
        this.createMap();

        const tileSize = 32;
        const mapSize = 100;
        const camera = this.cameras.main;
        camera.setBounds(0, 0, 300 + mapSize * tileSize, 100 + mapSize * tileSize);

        let dragStartX = 0;
        let dragStartY = 0;
        let cameraStartX = 0;
        let cameraStartY = 0;

        this.input.on('pointerdown', pointer => {
            dragStartX = pointer.x;
            dragStartY = pointer.y;
            cameraStartX = camera.scrollX;
            cameraStartY = camera.scrollY;
        });

        this.input.on('pointermove', pointer => {
            if (!pointer.isDown) return;

            camera.scrollX = cameraStartX - (pointer.x - dragStartX);
            camera.scrollY = cameraStartY - (pointer.y - dragStartY);
        });

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
        const tileSize = 32;
        const mapSize = 100;
        const offsetX = 300;
        const offsetY = 100;
        this.tileObjects = new Map();

        for (let y = 0; y < mapSize; y++) {
            for (let x = 0; x < mapSize; x++) {
                const mapTile = this.map.getTile(x, y);
                const imageKey = mapTile.TerrainType;

                const tile = this.add.image(
                    x * tileSize + offsetX + tileSize / 2,
                    y * tileSize + offsetY + tileSize / 2,
                    imageKey
                );

                tile.setDisplaySize(tileSize, tileSize);
                tile.setInteractive();
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
                tileObject.setTint(0x00ff00);
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

        tileObject.setTint(0x808080);

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
        this.tileObjects.get(`${x},${y}`)?.setTint(0x808080);
        this.updateUI();
    }

    update() {
        this.background.tilePositionX += 2;
    }

    updateUI() {
        this.mainHUD?.updateUI();
    }
}
