import { TransactionResult } from '../models/TransactionResult.js';
import { Transport } from '../models/Transport.js';
import { ProductionBase } from '../models/ProductionBase.js';
import { StorageFacility } from '../models/StorageFacility.js';
import { IExchangeParticipant } from './interfaces/IExchangeParticipant.js';

export class Player extends IExchangeParticipant {
    /** @type {number} */
    Money;

    /** @type {number} */
    Credit;

    /** @type {{ ContractId: number, Status: string }[]} */
    Contracts;

    /** @type {Map<Resource, number>} */
    Resources;

    /** @type {Transport} */
    Transport;

    /** @type {ProductionBase[]} */
    ProductionBases;

    /** @type {StorageFacility[]} */
    StorageFacilities;

    //현재 사용중인 공간
    CurrentAmount=0;

    //저장가능한 총 공간
    CurrentTotalCapacity=0;

    constructor() {
        super();
        this.Money = 1000;
        this.Credit = 0;
        this.Contracts = [];
        this.Resources= new Map();
        this.Transport = new Transport(1, 100);
        this.ProductionBases = [];
        this.StorageFacilities = [];
        this.NextProductionBase=1;
    }

    getMoney() {
        return this.Money;
    }

    addMoney(amount) {
        if (Number.isFinite(amount) && amount > 0) this.Money += amount;
    }

    removeMoney(amount) {
        if (!Number.isFinite(amount) || amount <= 0 || this.Money < amount) return false;
        this.Money -= amount;
        return true;
    }

    getResource(resourceNumber) {
        return this.Resources.get(resourceNumber) ?? 0;
    }

    addResource(resourceNumber, amount) {
        if (resourceNumber == null || !Number.isFinite(amount) || amount <= 0) return;
        this.AddResource(resourceNumber, amount);
    }

    removeResource(resourceNumber, amount) {
        const currentAmount = this.getResource(resourceNumber);
        if (!Number.isFinite(amount) || amount <= 0 || currentAmount < amount) return false;
        this.RemoveResource(resourceNumber, amount);
        return true;
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
        console.log(amount,"추가!");
        this.CurrentAmount+=amount;
        
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

        this.CurrentAmount-=amount;
    }

    //플레이어의 총 자원량 계산
    getUsedStorage(dataManager) {
        let totalAmount = 0;

        for (const [resourceNumber, amount] of this.Resources) {
            const resource = dataManager.GetResource(resourceNumber);

            if (!resource){
                continue
            }

            // 기계는 1개당 10, 나머지는 1
            const unitCapacity = resource.ResourceType === "Machine" ? 10 : 1;

            totalAmount += amount * unitCapacity;
        }

        this.CurrentAmount = totalAmount;
        return totalAmount;
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

    //저장시설 추가
    setStorageFacility(number = 1, capacity= 100){
        this.StorageFacilities.push(new StorageFacility(number, capacity));
        this.CurrentTotalCapacity+=capacity;
    }

    //현재 총 저장공간 추출
    getCapacityOfStorage() {
        return this.CurrentTotalCapacity;
    }

    //현재 저장가능공간 추출
    getAvailableStorage() {
    return Math.max(
        0,
        this.CurrentTotalCapacity - this.CurrentAmount
    );
}
}
