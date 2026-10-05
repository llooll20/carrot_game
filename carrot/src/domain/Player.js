import { TransactionResult } from '../models/TransactionResult.js';
import { Market } from '../systems/Market.js';
import { Transport } from '../models/Transport.js';

export class Player {
    /** @type {number} */
    Money;

    /** @type {Map<Resource, number>} */
    Resources;

    /** @type {Transport} */
    Transport;


    constructor() {
        this.Money = 1000;
        this.Resources = new Map([['carrot', 10]]);
        this.Transport = new Transport(1, 100);
    }
    
    // 구매를 위해 상품 거래를 요청하고 결과를 플레이어 상태에 반영하는 메서드
    Purchase(market, resource, amount) {
        const result = market.ProcessPurchase(this, resource, amount);
        this.ApplyTransactionResult(result);
        return result.Success;
    }

    // 판매를 위해 운송 장치로 상품을 적재
    /** @returns {boolean} */
    setResourceToTransport(resource, amount) {
        this.Transport.addResource(resource, amount);
        return true;
    }

    // 거래 결과를 플레이어 상태에 반영하는 메서드
    /** @param {TransactionResult} result */
    ApplyTransactionResult(result) {
        if (!result.Success)
            return;

        this.Money += result.MoneyAmount;

        for (const [resource, amount] of result.Resources) 
        {
            const currentAmount = this.Resources.get(resource) ?? 0;
            this.Resources.set( resource, currentAmount + amount);
        }
    }
}
