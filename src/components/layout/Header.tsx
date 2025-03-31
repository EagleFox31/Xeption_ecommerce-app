import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Smartphone,
  Laptop,
  Headphones,
  Printer,
  Wrench,
  RefreshCw,
  Building2,
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-gold-500/20">
      <div className="container flex items-center justify-between h-20 px-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-gold-500">XEPTION</span>
          <span className="ml-1 text-xs text-white">NETWORK</span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="relative hidden md:flex flex-1 max-w-md mx-8">
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            className="bg-gray-900 border-gray-700 text-white pr-10 focus-visible:ring-gold-500"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 text-gray-400 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-white hover:text-gold-500 hover:bg-gray-900">
                  Produits
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products/computers"
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-900"
                        >
                          <Laptop className="h-5 w-5 text-gold-500" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              Ordinateurs
                            </div>
                            <div className="text-xs text-gray-400">
                              Laptops, Desktops, All-in-Ones
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products/smartphones"
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-900"
                        >
                          <Smartphone className="h-5 w-5 text-gold-500" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              Smartphones
                            </div>
                            <div className="text-xs text-gray-400">
                              Téléphones, Tablettes
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products/accessories"
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-900"
                        >
                          <Headphones className="h-5 w-5 text-gold-500" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              Accessoires
                            </div>
                            <div className="text-xs text-gray-400">
                              Écouteurs, Chargeurs, Coques
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products/consumables"
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-900"
                        >
                          <Printer className="h-5 w-5 text-gold-500" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              Consommables
                            </div>
                            <div className="text-xs text-gray-400">
                              Encre, Papier, Câbles
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/trade-in">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-gold-500 hover:bg-gray-900"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Troc
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/repair">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-gold-500 hover:bg-gray-900"
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Réparation
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/business">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-gold-500 hover:bg-gray-900"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Entreprise
                  </Button>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Cart */}
          <Link to="/cart">
            <Button
              variant="ghost"
              className="relative text-white hover:text-gold-500 hover:bg-gray-900"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-white hover:text-gold-500 hover:bg-gray-900"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-gray-900 border-gray-800 text-white"
            >
              <Link to="/account">
                <DropdownMenuItem className="hover:bg-gray-800 hover:text-gold-500 cursor-pointer">
                  Mon Compte
                </DropdownMenuItem>
              </Link>
              <Link to="/account/orders">
                <DropdownMenuItem className="hover:bg-gray-800 hover:text-gold-500 cursor-pointer">
                  Mes Commandes
                </DropdownMenuItem>
              </Link>
              <Link to="/account/addresses">
                <DropdownMenuItem className="hover:bg-gray-800 hover:text-gold-500 cursor-pointer">
                  Mes Adresses
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => {
                  // Check if user is logged in
                  const user = localStorage.getItem("xeption_user");
                  if (user) {
                    localStorage.removeItem("xeption_user");
                    window.location.href = "/";
                  } else {
                    window.location.href = "/auth/login";
                  }
                }}
                className="hover:bg-gray-800 hover:text-gold-500 cursor-pointer"
              >
                {localStorage.getItem("xeption_user")
                  ? "Déconnexion"
                  : "Connexion"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden space-x-4">
          <Link to="/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-gold-500"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-gold-500"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <div className="container px-4 py-3 mx-auto">
            <div className="relative mb-4">
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="bg-gray-800 border-gray-700 text-white pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 text-gray-400 hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-1">
              <Link
                to="/products"
                className="flex items-center p-3 rounded-md hover:bg-gray-800"
              >
                <span className="text-white">Produits</span>
              </Link>
              <Link
                to="/trade-in"
                className="flex items-center p-3 rounded-md hover:bg-gray-800"
              >
                <RefreshCw className="mr-2 h-4 w-4 text-gold-500" />
                <span className="text-white">Troc</span>
              </Link>
              <Link
                to="/repair"
                className="flex items-center p-3 rounded-md hover:bg-gray-800"
              >
                <Wrench className="mr-2 h-4 w-4 text-gold-500" />
                <span className="text-white">Réparation</span>
              </Link>
              <Link
                to="/business"
                className="flex items-center p-3 rounded-md hover:bg-gray-800"
              >
                <Building2 className="mr-2 h-4 w-4 text-gold-500" />
                <span className="text-white">Entreprise</span>
              </Link>
              <Link
                to={
                  localStorage.getItem("xeption_user")
                    ? "/account"
                    : "/auth/login"
                }
                className="flex items-center p-3 rounded-md hover:bg-gray-800"
              >
                <User className="mr-2 h-4 w-4 text-gold-500" />
                <span className="text-white">
                  {localStorage.getItem("xeption_user")
                    ? "Mon Compte"
                    : "Connexion"}
                </span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
