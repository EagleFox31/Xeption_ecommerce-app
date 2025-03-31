import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-gold-500 mb-4">
              Xeption Network
            </h3>
            <p className="text-gray-300 mb-4">
              Votre partenaire technologique de confiance au Cameroun. Nous
              offrons des solutions complètes pour tous vos besoins
              informatiques.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-white hover:text-gold-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-gold-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-gold-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-gold-500 transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-gold-500 mb-4">
              Liens Rapides
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Produits
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Services de Troc
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Réparation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Solutions Entreprise
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  À Propos de Nous
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contactez-Nous
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-gold-500 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="text-red-500 mt-1" size={18} />
                <p className="text-gray-300">Siège Social: Yaoundé, Cameroun</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-gold-500" size={18} />
                <p className="text-gray-300">+237 6XX XXX XXX</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-gold-500" size={18} />
                <p className="text-gray-300">info@xeptionnetwork.cm</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold text-gold-500 mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Abonnez-vous pour recevoir nos dernières offres et promotions.
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Votre email"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                S'abonner
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Xeption Network. Tous droits réservés.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Conditions d'utilisation
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Politique de confidentialité
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Livraison
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
