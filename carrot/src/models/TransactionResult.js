
//거래 결과를 나타내는 클래스
export class TransactionResult {
    constructor(success, resource, resourceAmount, moneyAmount) {
        this.Success = success;
        this.Resource = resource;
        this.ResourceAmount = resourceAmount;
        this.MoneyAmount = moneyAmount;
    }
}