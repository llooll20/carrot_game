import { TransactionResult } from '../models/TransactionResult.js';
import { Market } from '../systems/Market.js';
import { Transport } from '../models/Transport.js';
import { ProductionBase } from '../models/ProductionBase.js';

export class Player {
    /** @type {number} */
    Money;

    /** @type {Map<Resource, number>} */
    Resources;

    /** @type {Transport} */
    Transport;
    /** @type {ProductionBase[]} */
    ProductionBases;

    constructor() {
        this.Money = 1000;
        this.Resources = new Map([['carrot', 10]]);
        this.Transport = new Transport(1, 100);
        this.ProductionBases = [];
        this.NextProductionBase=1;
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
        this.Resources.set(resource, (this.Resources.get(resource) ?? 0) - amount);
        return true;
    }

    // 운송 장치에서 상품을 가져옴
    /** @returns {boolean} */
    getResourceFromTransport(resource, amount) {
        const retrievedAmount = this.Transport.getResource(resource, amount);
        this.Resources.set(resource, (this.Resources.get(resource) ?? 0) + retrievedAmount);
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
            this.AddResource(resource, amount);
        }
    }

    //플레이어의 자원 추가
    AddResource(resourceNumber, amount) {
        const currentAmount =
            this.Resources.get(resourceNumber) ?? 0;

        this.Resources.set(
            resourceNumber,
            currentAmount + amount
        );
    }
    //플레이어의 자원 삭제
    RemoveResource(resourceNumber, amount)
    {
        const currentAmount =
            this.Resources.get(resourceNumber) ?? 0;

        this.Resources.set(
            resourceNumber,
            currentAmount - amount
        );
    }

    // 생산기반을 플레이어에게 할당하는 메서드
    setProductionBase(productionBase) {
        this.ProductionBases.push(productionBase);
        
    }

    // 생산기반을 플레이어에게서 제거하는 메서드
    removeProductionBase(number) {
        const index = this.ProductionBases.findIndex((pb) => pb.Number === number);

        if (index === -1) {   return false; }

        this.ProductionBases.splice(index, 1);
        return true;
    }
    // 생산기반을 정보를 가져오는 메서드
    getProductionBases() {
        return this.ProductionBases;
    }
    //생산 기반 번호 상승
    getProductionBaseNumber() {
        return this.NextProductionBase++;
    }


}
