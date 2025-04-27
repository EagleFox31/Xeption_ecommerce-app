import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Headphones, Laptop, Smartphone } from "lucide-react";
import { submitConsultationRequest } from "@/services/consultationService";

const ConsultationPage = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    budget: "",
    needs: "",
    preferredContactMethod: "phone" as "email" | "phone" | "whatsapp",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [consultationReference, setConsultationReference] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredContactMethod: value as "email" | "phone" | "whatsapp",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert budget string to number
    const budgetValue = parseFloat(formData.budget.replace(/\s/g, ""));

    const result = submitConsultationRequest({
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      budget: budgetValue,
      needs: formData.needs,
      preferredContactMethod: formData.preferredContactMethod,
    });

    setConsultationReference(result.id);
    setShowConfirmation(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      budget: "",
      needs: "",
      preferredContactMethod: "phone",
    });
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gold-500 mb-2">
            Consultation Personnalisée
          </h1>
          <p className="text-gray-300 mb-8">
            Vous avez un budget mais ne savez pas quel produit choisir ? Nos
            experts sont là pour vous conseiller et vous accompagner dans votre
            choix.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-2">
                <Smartphone className="h-8 w-8 text-gold-500 mb-2" />
                <CardTitle className="text-white">Smartphones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Trouvez le smartphone idéal qui correspond à vos besoins et
                  votre budget.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-2">
                <Laptop className="h-8 w-8 text-gold-500 mb-2" />
                <CardTitle className="text-white">Ordinateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Découvrez l'ordinateur qui répondra parfaitement à vos
                  attentes professionnelles ou personnelles.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader className="pb-2">
                <Headphones className="h-8 w-8 text-gold-500 mb-2" />
                <CardTitle className="text-white">Accessoires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Complétez votre équipement avec les accessoires adaptés à vos
                  appareils.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Formulaire de Consultation
              </CardTitle>
              <CardDescription className="text-gray-400">
                Remplissez ce formulaire pour être contacté par l'un de nos
                experts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-white">
                      Nom complet
                    </Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-white">
                      Téléphone
                    </Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+237 6XX XXX XXX"
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white">
                    Budget (FCFA)
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="Ex: 200 000"
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="needs" className="text-white">
                    Vos besoins
                  </Label>
                  <Textarea
                    id="needs"
                    name="needs"
                    value={formData.needs}
                    onChange={handleInputChange}
                    placeholder="Décrivez ce que vous recherchez, vos préférences et comment vous comptez utiliser le produit..."
                    required
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="preferredContactMethod"
                    className="text-white"
                  >
                    Méthode de contact préférée
                  </Label>
                  <Select
                    value={formData.preferredContactMethod}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Choisir une méthode" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="phone">Téléphone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                className="w-full bg-gold-500 hover:bg-gold-600 text-black"
              >
                Soumettre ma demande
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold text-green-500">
              <CheckCircle className="mr-2 h-5 w-5" />
              Demande Enregistrée
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Votre demande de consultation a été enregistrée avec succès.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">
              Un de nos experts vous contactera dans les plus brefs délais pour
              discuter de vos besoins et vous proposer les meilleures options.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Référence de votre demande:{" "}
              <span className="font-mono text-gold-500">
                {consultationReference}
              </span>
            </p>
            <p className="text-sm">
              Conservez cette référence pour le suivi de votre demande.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultationPage;
