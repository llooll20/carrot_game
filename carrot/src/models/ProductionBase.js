export class ProductionBase {
    constructor(number, productionBasetype, position) {
        this.Number = number;
        this.ProductionBasetype = productionBasetype;
        this.AssignedEmployees = [];
        this.AssignedResource = null;
        this.Position = position;
        this.Activate = 0;
        this.CurrentProgress=0;
        this.HasConsumedMaterials = false;
    }

    setResource(resourceNumber)
    {
        this.AssignedResource=resourceNumber;
        // 재료는 생산 처리에서 실제 차감한 뒤 소비 완료로 표시한다.
        this.HasConsumedMaterials=false;
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
        this.HasConsumedMaterials=false;
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
