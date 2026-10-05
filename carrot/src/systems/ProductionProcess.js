/*
생산 클래스
플레이어가 갖고 있는 생산 물품을 가져오고 턴 종료시 상태를 갱신한다.
*/

export class ProductionProcess {

    /** @type {Set<ProductionInput>} */
    ProductionInputs;

    constructor(ProductionInputs, player) {
        this.ProductionInputs = ProductionInputs;
        this.Player = player;
    }
}