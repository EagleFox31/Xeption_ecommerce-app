import { Injectable, BadRequestException } from "@nestjs/common";
import {
  ProductRepositoryPort,
  ProductListOptions,
} from "../../domain/catalog/product.port";
import { Product } from "../../domain/catalog/product.entity";
import {
  AdvisoryBudget,
  AdvisoryPreferences,
} from "../../domain/advisory/advisory.entity";

export interface ProductRecommendation {
  product: Product;
  score: number;
  reason: string;
  fits_budget: boolean;
}

export interface ProductRecommendationResult {
  recommendations: ProductRecommendation[];
  total_found: number;
  budget_summary: {
    min_price: number;
    max_price: number;
    average_price: number;
    products_in_budget: number;
  };
}

@Injectable()
export class GetAvailableProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(
    budget: AdvisoryBudget,
    preferences: AdvisoryPreferences = {},
    limit: number = 20,
  ): Promise<ProductRecommendationResult> {
    // Validate budget
    if (budget.min_amount < 0 || budget.max_amount < 0) {
      throw new BadRequestException("Budget amounts must be positive");
    }

    if (budget.min_amount > budget.max_amount) {
      throw new BadRequestException(
        "Minimum budget cannot be greater than maximum budget",
      );
    }

    // Build product search options
    const searchOptions: ProductListOptions = {
      filters: {
        in_stock: true,
        min_price: budget.is_flexible ? 0 : budget.min_amount,
        max_price: budget.is_flexible ? undefined : budget.max_amount,
      },
      sort_by: "price",
      sort_order: "asc",
      limit: limit * 2, // Get more products to filter and score
    };

    // Apply category filter if specified
    if (preferences.categories && preferences.categories.length > 0) {
      // Note: This would need to be enhanced to handle multiple categories
      // For now, we'll use the first category
      searchOptions.filters!.category_id = preferences.categories[0];
    }

    // Apply brand filter if specified
    if (preferences.brands && preferences.brands.length > 0) {
      // Note: This would need to be enhanced to handle multiple brands
      // For now, we'll use the first brand
      searchOptions.filters!.brand_id = preferences.brands[0];
    }

    // Apply tags filter if features are specified
    if (preferences.features && preferences.features.length > 0) {
      searchOptions.filters!.tags = preferences.features;
    }

    const productResult = await this.productRepository.findMany(searchOptions);
    const products = productResult.products;

    // Score and rank products
    const recommendations = products
      .map((product) => this.scoreProduct(product, budget, preferences))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Calculate budget summary
    const prices = products.map((p) => p.getFinalPrice());
    const productsInBudget = products.filter(
      (p) =>
        p.getFinalPrice() >= budget.min_amount &&
        p.getFinalPrice() <= budget.max_amount,
    );

    const budgetSummary = {
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      average_price:
        prices.reduce((sum, price) => sum + price, 0) / prices.length,
      products_in_budget: productsInBudget.length,
    };

    return {
      recommendations,
      total_found: products.length,
      budget_summary: budgetSummary,
    };
  }

  private scoreProduct(
    product: Product,
    budget: AdvisoryBudget,
    preferences: AdvisoryPreferences,
  ): ProductRecommendation {
    let score = 0;
    const reasons: string[] = [];
    const finalPrice = product.getFinalPrice();
    const fitsbudget =
      finalPrice >= budget.min_amount && finalPrice <= budget.max_amount;

    // Base score for being in stock
    if (product.isInStock()) {
      score += 10;
      reasons.push("In stock");
    }

    // Budget fit scoring
    if (fitsbudget) {
      score += 20;
      reasons.push("Within budget");
    } else if (budget.is_flexible) {
      // Flexible budget - score based on how close to budget
      const budgetMidpoint = (budget.min_amount + budget.max_amount) / 2;
      const priceDifference = Math.abs(finalPrice - budgetMidpoint);
      const maxDifference = budget.max_amount - budget.min_amount;
      const proximityScore = Math.max(
        0,
        10 - (priceDifference / maxDifference) * 10,
      );
      score += proximityScore;
      reasons.push("Close to budget range");
    }

    // Discount scoring
    if (product.hasDiscount()) {
      score += 5;
      reasons.push("On sale");
    }

    // Featured product bonus
    if (product.is_featured) {
      score += 5;
      reasons.push("Featured product");
    }

    // Category preference scoring
    if (
      preferences.categories &&
      preferences.categories.length > 0 &&
      product.category
    ) {
      if (preferences.categories.includes(product.category.id)) {
        score += 15;
        reasons.push("Matches preferred category");
      }
    }

    // Brand preference scoring
    if (preferences.brands && preferences.brands.length > 0 && product.brand) {
      if (preferences.brands.includes(product.brand.id)) {
        score += 10;
        reasons.push("Matches preferred brand");
      }
    }

    // Feature/tags preference scoring
    if (preferences.features && preferences.features.length > 0) {
      const matchingFeatures = preferences.features.filter((feature) =>
        product.tags.includes(feature),
      );
      if (matchingFeatures.length > 0) {
        score += matchingFeatures.length * 3;
        reasons.push(`Matches ${matchingFeatures.length} preferred feature(s)`);
      }
    }

    return {
      product,
      score,
      reason: reasons.join(", ") || "Available product",
      fits_budget: fitsbudget,
    };
  }
}
