export class DataManager {

    constructor() {
        this.resourceData = null;
        this.recipeData = null;
        this.marketData = null;
    }

    LoadData(resources, recipes, market) {
        this.resourceData = resources;
        this.recipeData = recipes;
        this.marketData = market;
    }

    GetResource(resourceNumber) {
        return this.resourceData.find(
            resource =>
                resource.ResourceNumber === resourceNumber
        );
    }

    GetRecipe(materialNumber) {
        return this.recipeData.find(recipe =>
            recipe.Materials.some(
                material => material.ResourceNumber === materialNumber
            )
        );
    }

    GetAllMarketData() {
        return this.marketData;
    }
    GetMarketData(resourceNumber) {
        return this.marketData.find(
            data =>
                data.ResourceNumber === resourceNumber
        );
    }
}