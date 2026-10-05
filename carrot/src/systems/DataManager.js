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

    GetRecipe(resourceNumber) {
        return this.recipeData.find(
            recipe =>
                recipe.ResourceNumber === resourceNumber
        );
    }

    GetMarketData(resourceNumber) {
        return this.marketData;
    }
}