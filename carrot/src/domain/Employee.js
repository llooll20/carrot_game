
export class Employee {
    constructor(number, name) {
        this.Number = number;
        this.Name = name;
        this.AssignedProductionBase = [];
    }
    setAssignedProductionBase(productionBase) {
        this.AssignedProductionBase.push(productionBase);
    }
}