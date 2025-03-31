import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="w-full bg-black border-b border-gold-500/20 py-4">
        <div className="container px-4 mx-auto">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gold-500">XEPTION</span>
            <span className="ml-1 text-xs text-white">NETWORK</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black border-t border-gold-500/20 py-4">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Xeption Network. Tous droits
              réservés.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-gold-500 text-sm"
              >
                Conditions d'utilisation
              </Link>
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-gold-500 text-sm"
              >
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
