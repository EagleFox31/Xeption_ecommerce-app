import React from "react";
import { cn } from "@/lib/utils";
import { Computer, Smartphone, Headphones, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryProps {
  categories?: {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    href: string;
  }[];
}

const ProductCategories = ({ categories }: CategoryProps) => {
  const defaultCategories = [
    {
      id: "computers",
      name: "Computers",
      icon: <Computer className="h-10 w-10 text-yellow-500" />,
      description: "Laptops, desktops, and accessories for all budgets",
      href: "/products/computers",
    },
    {
      id: "smartphones",
      name: "Smartphones",
      icon: <Smartphone className="h-10 w-10 text-yellow-500" />,
      description: "Latest models and affordable options",
      href: "/products/smartphones",
    },
    {
      id: "accessories",
      name: "Accessories",
      icon: <Headphones className="h-10 w-10 text-yellow-500" />,
      description: "Enhance your tech with quality accessories",
      href: "/products/accessories",
    },
    {
      id: "consumables",
      name: "Consumables",
      icon: <Printer className="h-10 w-10 text-yellow-500" />,
      description: "Ink, paper, and other tech supplies",
      href: "/products/consumables",
    },
  ];

  const displayCategories = categories || defaultCategories;

  return (
    <section className="w-full py-12 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Product Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category) => (
            <a
              key={category.id}
              href={`/products/${category.id}`}
              className="transition-transform hover:scale-105"
            >
              <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-yellow-500 transition-colors">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 p-3 rounded-full bg-zinc-800">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
