
import { IExchangeParticipant } from './interfaces/IExchangeParticipant.js';

export class NPC extends IExchangeParticipant {
    constructor(money = 0) {
        super();
        this.Money = money;
        this.Resources = new Map();
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
        this.Resources.set(resourceNumber, this.getResource(resourceNumber) + amount);
    }

    removeResource(resourceNumber, amount) {
        const currentAmount = this.getResource(resourceNumber);
        if (!Number.isFinite(amount) || amount <= 0 || currentAmount < amount) return false;
        this.Resources.set(resourceNumber, currentAmount - amount);
        return true;
    }
}
