//운송장치 클래스
export class Transport {
    /** @type {number} */
    Transport_Id;

    /** @type {Map<Resource, number>} */
    Resources;

    /** @type {number} */
    Total_storage;

    /** @type {number} */
    Current_storage;

    constructor(transport_id, total_storage) {
        this.Transport_Id = transport_id;
        this.Total_storage = total_storage;
        this.Current_storage = 0;
        this.Resources = new Map();
    }

    // 자원 추가 매서드
    addResource(resource, amount) {
        const currentAmount = this.Resources.get(resource) ?? 0;
        this.Resources.set(resource, currentAmount + amount);
        this.Current_storage += amount;
    }

    // 특정 자원 제거 매서드
    removeResource(resource, amount) {
        const currentAmount = this.Resources.get(resource) ?? 0;
        const newAmount = Math.max(0, currentAmount - amount);
        this.Resources.set(resource, newAmount);
        this.Current_storage -= (currentAmount - newAmount);
    }

    // 전체 자원 제거 매서드
    clearResources() {
        this.Resources.clear();
        this.Current_storage = 0;
    }

    // 운송장치 상태 반환 매서드

    getTransportId() {
        return this.Transport_Id;
    }

    getResources() {
        return this.Resources;
    }

    getCurrentStorage() {
        return this.Current_storage;
    }

    getTotalStorage() {
        return this.Total_storage;
    }
}