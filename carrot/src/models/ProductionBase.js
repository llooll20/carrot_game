export class ProductionBase {
    constructor(number, productionBasetype, position) {
        this.Number = number;
        this.ProductionBasetype = productionBasetype;
        this.AssignedEmployees = [];
        this.InputResources = new Map();
        this.ProducedResources = new Map();
        this.Position = position;
        this.Activate = 0;
        this.CurrentProgress=0;
        this.ProductionState="Empty";
        this.HasConsumedMaterials=false;
    }

    setInputResource(resourceNumber, amount) {
        if (resourceNumber == null || !Number.isFinite(amount) || amount < 0) return;
        if (amount === 0) {
            this.InputResources.delete(resourceNumber);
            return;
        }
        this.InputResources.set(resourceNumber, amount);
    }

    getInputResource(resourceNumber) {
        return this.InputResources.get(resourceNumber) ?? 0;
    }

    getInputResources() {
        return this.InputResources;
    }

    removeInputResource(resourceNumber, amount) {
        const currentAmount = this.getInputResource(resourceNumber);
        if (!Number.isFinite(amount) || amount <= 0 || currentAmount < amount) return false;
        const remainingAmount = currentAmount - amount;
        if (remainingAmount === 0) this.InputResources.delete(resourceNumber);
        else this.InputResources.set(resourceNumber, remainingAmount);
        return true;
    }

    setProducedResource(resourceNumber, amount) {
        if (resourceNumber == null || !Number.isFinite(amount) || amount < 0) return;
        if (amount === 0) {
            this.ProducedResources.delete(resourceNumber);
            return;
        }
        this.ProducedResources.set(resourceNumber, amount);
    }

    getProducedResource(resourceNumber) {
        return this.ProducedResources.get(resourceNumber) ?? 0;
    }

    getProducedResources() {
        return this.ProducedResources;
    }

    addProducedResource(resourceNumber, amount) {
        if (resourceNumber == null || !Number.isFinite(amount) || amount <= 0) return;
        this.setProducedResource(resourceNumber, this.getProducedResource(resourceNumber) + amount);
    }

    removeProducedResource(resourceNumber, amount) {
        const currentAmount = this.getProducedResource(resourceNumber);
        if (!Number.isFinite(amount) || amount <= 0 || currentAmount < amount) return false;
        const remainingAmount = currentAmount - amount;
        if (remainingAmount === 0) this.ProducedResources.delete(resourceNumber);
        else this.ProducedResources.set(resourceNumber, remainingAmount);
        return true;
    }

    setAssingedEmployee(employee)
    {
        employee.setAssignedProductionBase(this);
        this.AssignedEmployees.push(employee);
    }

    setProductionState(state) {
    this.ProductionState = state;
    }

    getProductionState() {
        return this.ProductionState;
    }

    isProductionStateEmpty() {
        return this.ProductionState === "Empty";
    }

    getAssingedEmployee()
    {
        return this.AssignedEmployees;
    }
    onActivate()
    {
        this.Activate=1;
    }
    offActivate()
    {
        this.Activate=0;
    }
    IncreaseProgress()
    {
        this.CurrentProgress++;
    }
    clearProgress()
    {
        this.CurrentProgress=0;
        this.HasConsumedMaterials=false;
        this.ProductionState="Empty";
    }

    getNumberOfEmployees()
    {
        return this.AssignedEmployees.length;
    }
    getBaseType()
    {
        return this.ProductionBasetype;
    }
}
