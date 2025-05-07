import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Search,
  Filter,
  Building2,
  ShoppingCart,
  FileText,
} from "lucide-react";
import {
  getEnterpriseProducts,
  getEnterpriseProductCategories,
  EnterpriseProduct,
} from "../../services/productService";

const BusinessProcurementPage = () => {
  const [products, setProducts] = useState<EnterpriseProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnterpriseProduct[]>(
    [],
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availability, setAvailability] = useState<string>("all");

  // Format price in CFA format
  const formatPrice = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  // Load products and categories on component mount
  useEffect(() => {
    const enterpriseProducts = getEnterpriseProducts();
    const productCategories = getEnterpriseProductCategories();

    setProducts(enterpriseProducts);
    setFilteredProducts(enterpriseProducts);
    setCategories(productCategories);
  }, []);

  // Filter products when filters change
  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Filter by availability
    if (availability !== "all") {
      result = result.filter(
        (product) => product.availability === availability,
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query),
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, availability, products]);

  return (
    <div className="container mx-auto py-8 bg-gray-950 text-white min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">
            Business Procurement
          </h1>
          <p className="text-gray-400 mt-2">
            Enterprise solutions tailored for your business needs
          </p>
        </div>
        <Link to="/business/rfq">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            <FileText className="mr-2 h-4 w-4" /> Submit RFQ
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-gray-800 border-b border-gray-700 w-full justify-start mb-6">
          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-gray-700"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="data-[state=active]:bg-gray-700"
          >
            Services
          </TabsTrigger>
          <TabsTrigger
            value="solutions"
            className="data-[state=active]:bg-gray-700"
          >
            Solutions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-0">
          {/* Filters and search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search enterprise products..."
                className="pl-10 bg-gray-800 border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Limited Stock">Limited Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Pre-order">Pre-order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-gray-900 border-gray-800 text-white hover:border-amber-500 transition-all duration-200"
                >
                  <div className="relative h-[200px] overflow-hidden bg-gray-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${
                        product.availability === "In Stock"
                          ? "bg-green-600"
                          : product.availability === "Limited Stock"
                            ? "bg-amber-500"
                            : product.availability === "Out of Stock"
                              ? "bg-red-600"
                              : "bg-blue-600"
                      }`}
                    >
                      {product.availability}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-600"
                      >
                        {product.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500 text-amber-500"
                      >
                        Min. Order: {product.minOrderQuantity}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-2">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-amber-500">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Lead Time: {product.leadTime}
                      </div>
                      <Separator className="my-3 bg-gray-800" />
                      <div className="text-sm">
                        <strong>Key Features:</strong>
                        <ul className="list-disc pl-5 mt-1 text-gray-300">
                          {product.features
                            .slice(0, 3)
                            .map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
                    >
                      View Details
                    </Button>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to RFQ
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-300">
                  No products found
                </h3>
                <p className="text-gray-400 mt-2">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-0">
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-300">
              Enterprise Services Coming Soon
            </h3>
            <p className="text-gray-400 mt-2">
              Our enterprise services section is currently under development.
              Please check back later or contact our sales team for assistance.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="solutions" className="mt-0">
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-300">
              Enterprise Solutions Coming Soon
            </h3>
            <p className="text-gray-400 mt-2">
              Our enterprise solutions section is currently under development.
              Please check back later or contact our sales team for assistance.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessProcurementPage;
