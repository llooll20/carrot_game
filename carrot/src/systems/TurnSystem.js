// 턴 종료 처리를 담당하는 클래스

import { Market } from './Market.js';
import { Turn } from '../models/Turn.js';

export class TurnSystem {

    constructor(turn, market, player) {
        this.Turn = turn;
        this.Market = market;
        this.Player = player;
    }

    EndTurn() {
        const salesResult = this.Market.ProcessSale(this.Player.Transport);
        this.Player.ApplyTransactionResult(salesResult);
        this.Player.Transport.clearResources();
        this.Turn.NextTurn();
    }
}
