import { Start } from './scenes/Start.js';
import { MarketWindow } from './scenes/MarketWindow.js';
import { DeveloperDebugScene } from './scenes/DeveloperDebugScene.js';
import { ContractScene } from './scenes/ContractScene.js';
import { BankScene } from './scenes/BankSecene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Start,
        MarketWindow,
        DeveloperDebugScene,
        ContractScene,
        BankScene,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            
