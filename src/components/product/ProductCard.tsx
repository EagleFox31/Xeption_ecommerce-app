import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProductCardProps {
  id?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  category?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  onAddToCart?: () => void;
  onAddToFavorite?: () => void;
}

const ProductCard = ({
  id = "prod-1",
  name = "MacBook Pro M2",
  price = 1200000,
  originalPrice = 1350000,
  image = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
  rating = 4.5,
  category = "Computers",
  isNew = false,
  isFeatured = false,
  onAddToCart = () => {},
  onAddToFavorite = () => {},
}: ProductCardProps) => {
  // Format price in CFA format
  const formatPrice = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  // Calculate discount percentage
  const discountPercentage = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Prevent event propagation for buttons
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <Card className="w-full max-w-[280px] overflow-hidden bg-gray-900 border-gray-800 text-white hover:border-amber-500 transition-all duration-200">
      <Link to={`/products/detail/${id}`}>
        <div className="relative h-[180px] overflow-hidden bg-gray-800">
          {/* Product image */}
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Badge className="bg-red-600 hover:bg-red-700 text-white">
                Nouveau
              </Badge>
            )}
            {isFeatured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-black">
                Vedette
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full h-8 w-8"
            onClick={(e) => handleButtonClick(e, onAddToFavorite)}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-400 mb-1">{category}</p>

          {/* Product name */}
          <h3 className="font-semibold text-white mb-1 line-clamp-2 h-12">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm text-gray-300">{rating}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-amber-400">
              {formatPrice(price)}
            </span>
            {originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600 text-black"
          onClick={(e) => handleButtonClick(e, onAddToCart)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
