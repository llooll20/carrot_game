/*
생산과정 클래스
플레이어가 갖고 있는 생산 물품을 가져오고 턴 종료시 상태를 갱신한다.
*/
export class ProductionProcess {

    constructor(player, dataManager) {
        this.Owner=player;
        this.DataManager=dataManager;
    }

    ProcessAllProduction()
    {
        for (const productionBase of this.Owner.ProductionBases) {
            const materialNumber = productionBase.AssignedResource;

             if (materialNumber === null) {
                continue;
            }
            //레시피 가져오기
            const recipe = this.DataManager.GetRecipe(materialNumber);

            if (recipe === null) {
                continue;
            }

            //생산 기반과 직원 조건 검사
            if(
                recipe.RequiredWorkers !== productionBase.getNumberOfEmployees() ||
                recipe.ProductionBaseNumber !== productionBase.getBaseType())
            {
                continue;
            }
            let hasMaterials = true;

            //필요한 재료 확인
            for (const material of recipe.Materials) {
                const amount = this.Owner.Resources.get(material.ResourceNumber) ?? 0;

                if (amount < material.Amount) {
                    hasMaterials = false;
                    break;
                }
            }

            if(!hasMaterials)
            {
                continue;
            }

            
            //생산에 필요한 재료 소비
            for (const material of recipe.Materials) {
                this.Owner.RemoveResource(
                    material.ResourceNumber,
                    material.Amount
                );
            }

            
            // 생산 진행
            productionBase.IncreaseProgress();

            console.log("productionBase.CurrentProgress:",productionBase.CurrentProgress);
            console.log("recipe.CycleTime:",recipe.CycleTime);
            //생산 완료
            if (productionBase.CurrentProgress >= recipe.CycleTime)
            {
                
                productionBase.clearProgress();

                this.Owner.AddResource(
                    recipe.ResourceNumber,
                    recipe.OutputAmount
                )
            }
        
        }   
    }
}