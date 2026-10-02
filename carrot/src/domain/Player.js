import { TransactionResult } from '../models/TransactionResult.js';
import { Market } from './Market.js';

export class Player {
    /** @type {number} */
    Money;

    /** @type {Map<Resource, number>} */
    Resources;

    constructor() {
        this.Money = 1000;
        this.Resources = new Map([['carrot', 10]]);
    }

    /**
     * 시장에 자원 구매를 요청하고 거래 결과를 플레이어 상태에 반영한다.
     * @param {Market} market 거래를 요청할 시장
     * @param {Resource} resource 구매할 자원
     * @param {number} amount 구매 수량
     * @returns {boolean} 구매 성공 여부
     */
    
    Purchase(market, resource, amount) {
        const result = market.ProcessPurchase(this, resource, amount);
        this.ApplyTransactionResult(result);
        return result.Success;
    }

    /** @returns {boolean} */
    Sell(market, resource, amount) {
        const result = market.ProcessSale(this, resource, amount);
        this.ApplyTransactionResult(result);
        return result.Success;
    }

    /** @param {TransactionResult} result */
    ApplyTransactionResult(result) {
        if (!result.Success)
            return;

        this.Money += result.MoneyAmount;

        const currentAmount =
            this.Resources.get(result.Resource) ?? 0;

        this.Resources.set(
            result.Resource,
            currentAmount + result.ResourceAmount
        );
    }
}
