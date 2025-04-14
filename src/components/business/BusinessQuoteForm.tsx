import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

interface BusinessQuoteFormProps {
  onSubmitSuccess?: () => void;
}

const BusinessQuoteForm = ({ onSubmitSuccess }: BusinessQuoteFormProps) => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    requirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Le nom de l'entreprise est requis";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Le nom du contact est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = "Veuillez décrire vos besoins";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gold">
          Demande Envoyée
        </h3>
        <p className="text-gray-300 mb-6">
          Votre demande de devis a été envoyée avec succès. Un représentant de
          Xeption Network vous contactera dans les 24 heures.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Soumettre une autre demande
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-4 text-center text-gold">
        Demande de Devis Entreprise
      </h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Nom de l'Entreprise*
          </label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Votre Entreprise"
            className="bg-gray-800 border-gray-700 text-white"
            aria-invalid={!!errors.companyName}
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="contactPerson"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Personne à Contacter*
          </label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Nom Complet"
            className="bg-gray-800 border-gray-700 text-white"
            aria-invalid={!!errors.contactPerson}
          />
          {errors.contactPerson && (
            <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email*
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@entreprise.com"
              className="bg-gray-800 border-gray-700 text-white"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Téléphone*
            </label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+237 6XX XXX XXX"
              className="bg-gray-800 border-gray-700 text-white"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="requirements"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Besoins Professionnels*
          </label>
          <Textarea
            id="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Décrivez vos besoins en équipement, quantités, et spécifications..."
            className="bg-gray-800 border-gray-700 text-white"
            rows={4}
            aria-invalid={!!errors.requirements}
          />
          {errors.requirements && (
            <p className="text-red-500 text-xs mt-1">{errors.requirements}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Envoi en cours..." : "Demander un Devis"}
        </Button>

        <p className="text-xs text-center text-gray-400 mt-2">
          Un représentant de Xeption Network vous contactera dans les 24 heures
        </p>
      </form>
    </div>
  );
};

export default BusinessQuoteForm;
