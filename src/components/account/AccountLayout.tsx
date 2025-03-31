import { useState, ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { User, Package, MapPin, LogOut, ChevronRight } from "lucide-react";
import { getCurrentUser, logout } from "@/services/auth";

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = getCurrentUser();

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      window.location.href = "/";
    }, 500);
  };

  const navItems = [
    {
      label: "Mon Profil",
      path: "/account",
      icon: <User className="h-5 w-5" />,
    },
    {
      label: "Mes Commandes",
      path: "/account/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: "Mes Adresses",
      path: "/account/addresses",
      icon: <MapPin className="h-5 w-5" />,
    },
  ];

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile Navigation Toggle */}
        <div className="md:hidden w-full">
          <Button
            variant="outline"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex justify-between items-center border-gray-700 text-white hover:bg-gray-800"
          >
            <span>Menu du compte</span>
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform",
                isMobileMenuOpen ? "rotate-90" : "",
              )}
            />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div
          className={cn(
            "w-full md:w-64 flex-shrink-0",
            isMobileMenuOpen ? "block" : "hidden md:block",
          )}
        >
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-gold-500 font-bold text-lg">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              <Separator className="my-4 bg-gray-700" />

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        location.pathname === item.path
                          ? "bg-gray-800 text-gold-500"
                          : "text-white hover:bg-gray-800 hover:text-gold-500",
                      )}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Button>
                  </Link>
                ))}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800 hover:text-red-500"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">
                    {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
                  </span>
                </Button>
              </nav>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default AccountLayout;
