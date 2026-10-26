import { TransactionResult } from "../models/TransactionResult.js";
import { IExchangeParticipant } from './interfaces/IExchangeParticipant.js';
import { TransferSystem } from '../systems/TransferSystem.js';

export class Market extends IExchangeParticipant {
    /** @type {Map<number, {Price: number, Stock: number}>} */
    MarketItems;

    //DataManager를 통해 시장 데이터를 가져와 초기화
    constructor(dataManager) {
        super();
        // 교환 인터페이스 호환용 자금(시장 자체 화폐 시스템은 미구현)
        this.Money = 0;
        this.MarketItems = new Map();
        this.TransferSystem = new TransferSystem();

        for (const data of dataManager.GetAllMarketData()) {
            this.MarketItems.set(data.ResourceNumber, {
                Price: data.Price,
                Stock: data.Stock
            });
        }
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
        return this.MarketItems.get(resourceNumber)?.Stock ?? 0;
    }

    addResource(resourceNumber, amount) {
        const marketItem = this.MarketItems.get(resourceNumber);
        if (!marketItem || !Number.isFinite(amount) || amount <= 0) return;
        marketItem.Stock += amount;
    }

    removeResource(resourceNumber, amount) {
        const marketItem = this.MarketItems.get(resourceNumber);
        if (!marketItem || !Number.isFinite(amount) || amount <= 0 || marketItem.Stock < amount) {
            return false;
        }
        marketItem.Stock -= amount;
        return true;
    }

    // 플레이어가 시장에서 자원을 구매하도록 처리하는 메서드
    /** @returns {TransactionResult} */
    ProcessPurchase(player, resource, amount) {
        const marketItem = this.MarketItems.get(resource);
        const result = new TransactionResult(false, new Map(), 0);
        if (!marketItem || !Number.isFinite(marketItem.Price) || marketItem.Price < 0 ||
            !Number.isFinite(amount) || amount <= 0) {
            result.Reason = '상품 또는 구매 수량이 유효하지 않습니다.';
            return result;
        }

        const totalPrice = marketItem.Price * amount;
        const paymentResult = totalPrice > 0
            ? this.TransferSystem.Transfer(player, this, totalPrice)
            : null;
        if (paymentResult && !paymentResult.Success) {
            result.Reason = paymentResult.Reason;
            return result;
        }

        const resourceResult = this.TransferSystem.Transfer(this, player, resource, amount);
        if (!resourceResult.Success) {
            const refundResult = totalPrice > 0
                ? this.TransferSystem.Transfer(this, player, totalPrice)
                : { Success: true };
            result.Reason = refundResult.Success
                ? resourceResult.Reason
                : `${resourceResult.Reason} 환불 실패: ${refundResult.Reason}`;
            return result;
        }

        // 이전이 완료된 자산은 Player.Purchase()에서 다시 적용하지 않도록 결과에는 기록만 남긴다.
        result.Success = true;
        result.PurchasedResource = resource;
        result.PurchasedAmount = amount;
        result.PaidAmount = totalPrice;
        result.AssetsApplied = true;

        return result;
    }

    // 운송 장치로 판매를 요청하고 거래 결과를 플레이어 상태에 반영한다.
    /** @returns {TransactionResult} */
    ProcessSale(Transport) {

        const resources = Transport.getResources();
        const soldResources = new Map();
        let totalPrice = 0;

        // 거래 결과지
        const result = new TransactionResult(
            false,
            soldResources,
            totalPrice
        );

        //아무것도 적재 x
        if(resources===null)
        {
            return result;
        }

        for (const [resource, amount] of resources) {

            const marketItem = this.MarketItems.get(resource);

            const price = marketItem.Price;
            const resourcePrice = amount * price;

            totalPrice += resourcePrice;

            // 시장 자원 증가
            marketItem.Stock += amount;
        }
        // 거래 결과지
        result.Success=true;
        result.Resources=soldResources;
        result.MoneyAmount=totalPrice;

        return result;
    }
}
