/*
생산과정 클래스
플레이어가 갖고 있는 생산 물품을 가져오고 턴 종료시 상태를 갱신한다.
*/
export class ProductionProcess {

    constructor(player, dataManager) {
        this.Owner=player;
        this.DataManager=dataManager;
        this.ActiveRecipes = new Map();
    }

    ProcessAllProduction()
    {
        const recipes = this.DataManager.GetAllRecipe?.() ?? [];

        for (const productionBase of this.Owner.ProductionBases) {
            let recipe = this.ActiveRecipes.get(productionBase);

            if (productionBase.isProductionStateEmpty()) {
                const inputResources = productionBase.getInputResources();
                recipe = recipes.find(candidate =>
                    candidate.ProductionBaseNumber === productionBase.getBaseType() &&
                    candidate.Materials?.length > 0 &&
                    this.hasRecipeMaterials(inputResources, candidate.Materials)
                );

                if (!recipe) continue;

                for (const material of recipe.Materials) {
                    if (!productionBase.removeInputResource(material.ResourceNumber, material.Amount)) {
                        recipe = null;
                        break;
                    }
                }
                if (!recipe) continue;

                this.ActiveRecipes.set(productionBase, recipe);
                productionBase.setProductionState("Growing");
            }

            if (productionBase.getProductionState() !== "Growing" || !recipe) continue;

            productionBase.IncreaseProgress();
            if (productionBase.CurrentProgress >= recipe.CycleTime) {
                productionBase.addProducedResource(recipe.ResourceNumber, recipe.OutputAmount);
                productionBase.setProductionState("Harvestable");
                this.ActiveRecipes.delete(productionBase);
            }
        }
    }

    hasRecipeMaterials(inputResources, materials) {
        const requiredAmounts = new Map();
        for (const material of materials) {
            requiredAmounts.set(
                material.ResourceNumber,
                (requiredAmounts.get(material.ResourceNumber) ?? 0) + material.Amount
            );
        }

        return [...requiredAmounts].every(([resourceNumber, amount]) =>
            (inputResources.get(resourceNumber) ?? 0) >= amount
        );
    }
}
