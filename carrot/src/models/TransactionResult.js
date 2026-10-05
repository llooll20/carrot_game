
//거래 결과를 나타내는 클래스
export class TransactionResult {
    constructor(success, resources, moneyAmount) {
        this.Success = success;
        this.Resources = resources;
        this.MoneyAmount = moneyAmount;
    }
}