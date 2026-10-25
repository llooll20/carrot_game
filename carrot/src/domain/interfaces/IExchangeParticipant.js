/**
 * 교환 주체가 제공해야 하는 공통 메서드 규약.
 *
 * Player, Bank, NPC 등의 도메인 객체가 구현하는 메서드 규약이다.
 * 하위 클래스는 모든 메서드를 재정의해야 하며, 기본 구현은 미구현 오류를 낸다.
 */
export class IExchangeParticipant {
    /** @returns {number} 현재 보유 화폐 */
    getMoney() {
        throw new Error('getMoney() must be implemented');
    }

    /** @param {number} amount 추가할 화폐 */
    addMoney(amount) {
        throw new Error('addMoney() must be implemented');
    }

    /** @param {number} amount 차감할 화폐 @returns {boolean} 차감 성공 여부 */
    removeMoney(amount) {
        throw new Error('removeMoney() must be implemented');
    }

    /** @param {number|string} resourceNumber 자원 ID @returns {number} 보유량 */
    getResource(resourceNumber) {
        throw new Error('getResource() must be implemented');
    }

    /** @param {number|string} resourceNumber 자원 ID @param {number} amount 추가량 */
    addResource(resourceNumber, amount) {
        throw new Error('addResource() must be implemented');
    }

    /** @param {number|string} resourceNumber 자원 ID @param {number} amount 차감량 @returns {boolean} 차감 성공 여부 */
    removeResource(resourceNumber, amount) {
        throw new Error('removeResource() must be implemented');
    }
}
