export class ProductionBase {
    constructor(number, productionBasetype,resourceNumber, position) {
        this.Number = number;
        this.ProductionBasetype = productionBasetype;
        this.AssignedEmployees = [];
        this.AssignedResource = resourceNumber;
        this.Position = position;
        this.Activate = 0;
        this.CurrentProgress=0;
    }

    setAssingedEmployee(employee)
    {
        employee.setAssignedProductionBase(this);
        this.AssignedEmployees.push(employee);
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
        this.AssignedResource=null;
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