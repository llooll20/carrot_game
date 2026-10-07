export class ProductionBase {
    constructor(number, productionBasetype,resourceNumber, position) {
        this.Number = number;
        this.ProductionBasetype = productionBasetype;
        this.AssignedEmployees = [];
        this.AssignedResource = resourceNumber;
        this.Position = position;
    }
}