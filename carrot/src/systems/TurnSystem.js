// 턴 종료 처리를 담당하는 클래스

import { Market } from '../domain/Market.js';
import { ProductionProcess } from './ProductionProcess.js';
import { StorageSystem } from './StorageSystem.js';

export class TurnSystem {

    constructor(turn, market, player, dataManager, contractSystem = null) {
        this.Turn = turn;
        this.Market = market;
        this.Player = player;
        this.DataManager=dataManager;
        this.ProductionProcess=new ProductionProcess(player,dataManager);
        this.StorageSystem=new StorageSystem(player, dataManager);
        this.ContractSystem = contractSystem;
    }

    EndTurn() {
        const salesResult = this.Market.ProcessSale(this.Player.Transport);
        this.Player.ApplyTransactionResult(salesResult);
        this.Player.Transport.clearResources();
        this.ProductionProcess.ProcessAllProduction();
        this.StorageSystem.ProcessDisposals();
        this.StorageSystem.CheckStorageCapacity();
        this.Turn.NextTurn();
        if (this.Turn?.IsMonthEnd?.()) {
            this.ContractSystem?.ProgressContracts?.();
        }
    }
}
