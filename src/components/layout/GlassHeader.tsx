import { useState, useEffect } from "react";
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
  Menu as MenuIcon,
  X,
  Smartphone,
  Laptop,
  Headphones,
  Printer,
  RefreshCw,
  Wrench,
  Building2,
} from "lucide-react";
import { getCurrentUser, logout } from "@/services/auth";

const GlassHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-gold-500/20 shadow-lg"
          : "bg-black/50 backdrop-blur-sm",
      )}
    >
      <div className="container flex items-center justify-between h-20 px-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-gold-500 drop-shadow-md">
            XEPTION
          </span>
          <span className="ml-1 text-xs text-white">NETWORK</span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="relative hidden md:flex flex-1 max-w-md mx-8">
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            className="bg-gray-900/70 border-gray-700/50 text-white pr-10 focus-visible:ring-gold-500"
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
                <NavigationMenuTrigger className="text-white hover:text-gold-500 hover:bg-gray-900/70">
                  Produits
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-gray-900/90 backdrop-blur-md border border-gray-800/50">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/products/computers"
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-800/70"
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
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-800/70"
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
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-800/70"
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
                          className="flex p-3 space-x-2 rounded-md hover:bg-gray-800/70"
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
                    className="text-white hover:text-gold-500 hover:bg-gray-900/70"
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
                    className="text-white hover:text-gold-500 hover:bg-gray-900/70"
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
                    className="text-white hover:text-gold-500 hover:bg-gray-900/70"
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
              className="relative text-white hover:text-gold-500 hover:bg-gray-900/70"
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
                className="text-white hover:text-gold-500 hover:bg-gray-900/70"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-gray-900/90 backdrop-blur-md border-gray-800/50 text-white"
            >
              {user ? (
                <>
                  <Link to="/account">
                    <DropdownMenuItem className="hover:bg-gray-800/70 hover:text-gold-500 cursor-pointer">
                      Mon Compte
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/account/orders">
                    <DropdownMenuItem className="hover:bg-gray-800/70 hover:text-gold-500 cursor-pointer">
                      Mes Commandes
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/account/addresses">
                    <DropdownMenuItem className="hover:bg-gray-800/70 hover:text-gold-500 cursor-pointer">
                      Mes Adresses
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-gray-800/70 hover:text-gold-500 cursor-pointer"
                  >
                    Déconnexion
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <Link to="/auth/login">
                    <DropdownMenuItem className="hover:bg-gray-800/70 hover:text-gold-500 cursor-pointer">
                      Connexion
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/auth/register">
                    <DropdownMenuItem className="hover:bg-gray-800/70 hover:text-gold-500 cursor-pointer">
                      Inscription
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
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
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/90 backdrop-blur-md border-t border-gray-800/50">
          <div className="container px-4 py-3 mx-auto">
            <div className="relative mb-4">
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="bg-gray-800/70 border-gray-700/50 text-white pr-10"
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
                className="flex items-center p-3 rounded-md hover:bg-gray-800/70"
              >
                <span className="text-white">Produits</span>
              </Link>
              <Link
                to="/trade-in"
                className="flex items-center p-3 rounded-md hover:bg-gray-800/70"
              >
                <RefreshCw className="mr-2 h-4 w-4 text-gold-500" />
                <span className="text-white">Troc</span>
              </Link>
              <Link
                to="/repair"
                className="flex items-center p-3 rounded-md hover:bg-gray-800/70"
              >
                <Wrench className="mr-2 h-4 w-4 text-gold-500" />
                <span className="text-white">Réparation</span>
              </Link>
              <Link
                to="/business"
                className="flex items-center p-3 rounded-md hover:bg-gray-800/70"
              >
                <Building2 className="mr-2 h-4 w-4 text-gold-500" />
                <span className="text-white">Entreprise</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/account"
                    className="flex items-center p-3 rounded-md hover:bg-gray-800/70"
                  >
                    <User className="mr-2 h-4 w-4 text-gold-500" />
                    <span className="text-white">Mon Compte</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center p-3 rounded-md hover:bg-gray-800/70 text-left"
                  >
                    <span className="text-white">Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="flex items-center p-3 rounded-md hover:bg-gray-800/70"
                  >
                    <User className="mr-2 h-4 w-4 text-gold-500" />
                    <span className="text-white">Connexion</span>
                  </Link>
                  <Link
                    to="/auth/register"
                    className="flex items-center p-3 rounded-md hover:bg-gray-800/70"
                  >
                    <span className="text-white">Inscription</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default GlassHeader;
