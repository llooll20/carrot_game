import { TransactionResult } from '../models/TransactionResult.js';

export class Market {
    /** @type {Map<Resource, number>} */
    MarketPrices;

    /** @type {Map<Resource, number>} */
    MarketSupplies;

    constructor() {
        this.MarketSupplies = new Map([['carrot', 100]]);
        this.MarketPrices = new Map([['carrot', 10]]);
    }

    /** @returns {TransactionResult} */
    ProcessPurchase(player, resource, amount) {
        const price = this.MarketPrices.get(resource);
        const totalPrice = price * amount;
        const supply = this.MarketSupplies.get(resource) ?? 0;

        const result = new TransactionResult(
            false,
            resource,
            amount,
            -totalPrice
        );

        // 거래 실패 조건:
        // 플레이어의 돈이 부족하거나 시장에 자원이 부족한 경우
        if (player.Money < totalPrice || supply < amount)
            return result;


        result.Success = true;

        // 시장 자원 감소
        this.MarketSupplies.set(
            resource,
            supply - amount
        );

        return result;
    }

    /** @returns {TransactionResult} */
    ProcessSale(player, resource, amount) {
        const price = this.MarketPrices.get(resource);
        const totalPrice = price * amount;

        const result = new TransactionResult(
            false,
            resource,
            amount,
            totalPrice
        );

        // 거래 실패 조건:
        // 플레이어가 해당 자원을 소유하지 않거나 플레이어가 판매하려는 수량보다 적게 소유한 경우
        if (
            !player.Resources.has(resource) ||
            player.Resources.get(resource) < amount
        ) {
            return result;
        }

        result.Success = true;

        // 시장 자원 증가
        this.MarketSupplies.set(
            resource,
            this.MarketSupplies.get(resource) + amount
        );

        return result;
    }
}
