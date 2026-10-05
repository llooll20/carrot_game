import { TransactionResult } from "../models/TransactionResult.js";

export class Market {
    /** @type {Map<number, {Price: number, Stock: number}>} */
    MarketItems;

    //DataManager를 통해 시장 데이터를 가져와 초기화
    constructor(dataManager) {
        this.MarketItems = new Map();

        for (const data of dataManager.GetMarketData()) {
            this.MarketItems.set(data.ResourceNumber, {
                Price: data.Price,
                Stock: data.Stock
            });
        }
    }

    // 플레이어가 시장에서 자원을 구매하도록 처리하는 메서드
    /** @returns {TransactionResult} */
    ProcessPurchase(player, resource, amount) {

        const marketItem = this.MarketItems.get(resource);


        const price = marketItem.Price;
        const totalPrice = marketItem.Price * amount;
        const supply = marketItem.Stock;

        const resources=new Map();
        resources.set(resource, amount);

        // 거래 결과지
        const result = new TransactionResult(
            false,
            resources,
            -totalPrice
        );

        // 거래 실패 조건:
        // 플레이어의 돈이 부족하거나 시장에 자원이 부족한 경우
        if (player.Money < totalPrice || supply < amount)
            return result;
        result.Success = true;

        // 시장 자원 감소
        marketItem.Stock -= amount;

        return result;
    }

    // 운송 장치로 판매를 요청하고 거래 결과를 플레이어 상태에 반영한다.
    /** @returns {TransactionResult} */
    ProcessSale(Transport) {

        const resources = Transport.getResources();
        const soldResources = new Map();
        let totalPrice = 0;

        for (const [resource, amount] of resources) {

            const marketItem = this.MarketItems.get(resource);

            const price = marketItem.Price;
            const resourcePrice = amount * price;

            totalPrice += resourcePrice;
            soldResources.set(resource, -amount);

            // 시장 자원 증가
            marketItem.Stock += amount;
        }
        // 거래 결과지
        const result = new TransactionResult(
            true,
            soldResources,
            totalPrice
        );

        return result;
    }
}
