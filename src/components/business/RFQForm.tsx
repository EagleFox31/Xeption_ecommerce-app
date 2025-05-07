import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAuthenticated, getCurrentUser } from "@/services/auth";
import { submitRFQRequest } from "@/services/rfqService";

const formSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  contactPerson: z.string().min(2, "Le nom du contact est requis"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().min(9, "Le numéro de téléphone est requis"),
  businessType: z.string().min(1, "Le type d'entreprise est requis"),
  employeeCount: z.string().min(1, "Le nombre d'employés est requis"),
  productCategory: z.string().min(1, "La catégorie de produit est requise"),
  quantity: z.string().min(1, "La quantité est requise"),
  budget: z.string().optional(),
  timeframe: z.string().min(1, "Le délai est requis"),
  specifications: z.string().min(10, "Les spécifications sont requises"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez accepter les conditions",
    }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface RFQFormProps {
  onSubmitSuccess?: () => void;
  isBusinessClient?: boolean;
}

const RFQForm = ({
  onSubmitSuccess,
  isBusinessClient = false,
}: RFQFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rfqReference, setRfqReference] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      businessType: "",
      employeeCount: "",
      productCategory: "",
      quantity: "",
      budget: "",
      timeframe: "",
      specifications: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user if authenticated
      const currentUser = getCurrentUser();

      // Prepare RFQ data
      const rfqData = {
        ...data,
        userId: currentUser?.id, // Associate with user if logged in
      };

      // Submit RFQ request
      const result = await submitRFQRequest(rfqData);

      // Set reference from the result
      setRfqReference(result.id);
      setIsSubmitted(true);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gold-500">
          Demande de Devis Envoyée
        </h3>
        <p className="text-gray-300 mb-2">
          Votre demande de devis a été envoyée avec succès. Un représentant de
          Xeption Network vous contactera dans les 24 heures ouvrables.
        </p>
        <p className="text-gold-500 font-semibold mb-6">
          Référence: {rfqReference}
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            form.reset();
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Soumettre une autre demande
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-4 text-center text-gold-500">
        Demande de Devis Entreprise
      </h3>

      {!isBusinessClient && !isAuthenticated() && (
        <Alert className="mb-6 bg-blue-900/50 border-blue-800 text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pour un suivi optimal de vos demandes, nous vous recommandons de{" "}
            <a href="/auth/login" className="text-gold-500 underline">
              vous connecter
            </a>{" "}
            ou de{" "}
            <a href="/auth/register" className="text-gold-500 underline">
              créer un compte entreprise
            </a>
            .
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert
          variant="destructive"
          className="mb-6 bg-red-900/50 border-red-800 text-white"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Nom de l'Entreprise*
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Votre Entreprise"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Personne à Contacter*
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nom Complet"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email*</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@entreprise.com"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Téléphone*</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+237 6XX XXX XXX"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Type d'Entreprise*
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="pme">PME</SelectItem>
                      <SelectItem value="grande-entreprise">
                        Grande Entreprise
                      </SelectItem>
                      <SelectItem value="administration">
                        Administration
                      </SelectItem>
                      <SelectItem value="ong">ONG</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Nombre d'Employés*
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Sélectionnez une taille" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501+">501+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="productCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Catégorie de Produit*
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="ordinateurs">Ordinateurs</SelectItem>
                      <SelectItem value="serveurs">
                        Serveurs & Stockage
                      </SelectItem>
                      <SelectItem value="reseaux">
                        Équipements Réseau
                      </SelectItem>
                      <SelectItem value="smartphones">
                        Smartphones & Tablettes
                      </SelectItem>
                      <SelectItem value="peripheriques">
                        Périphériques
                      </SelectItem>
                      <SelectItem value="logiciels">Logiciels</SelectItem>
                      <SelectItem value="services">Services IT</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Quantité Estimée*
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Sélectionnez une quantité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="1-5">1-5 unités</SelectItem>
                      <SelectItem value="6-20">6-20 unités</SelectItem>
                      <SelectItem value="21-50">21-50 unités</SelectItem>
                      <SelectItem value="51-100">51-100 unités</SelectItem>
                      <SelectItem value="100+">Plus de 100 unités</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Budget Estimé (FCFA)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Budget approximatif"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Délai Souhaité*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Sélectionnez un délai" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="urgent">
                        Urgent (moins de 1 semaine)
                      </SelectItem>
                      <SelectItem value="court">
                        Court terme (1-2 semaines)
                      </SelectItem>
                      <SelectItem value="moyen">
                        Moyen terme (3-4 semaines)
                      </SelectItem>
                      <SelectItem value="long">
                        Long terme (1-3 mois)
                      </SelectItem>
                      <SelectItem value="planifie">
                        Projet planifié (plus de 3 mois)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="specifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  Spécifications & Exigences*
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Décrivez en détail vos besoins, spécifications techniques, et toute exigence particulière..."
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={4}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500 mt-1"
                  />
                </FormControl>
                <FormLabel className="text-sm text-gray-400">
                  J'accepte que mes informations soient utilisées pour le
                  traitement de ma demande et j'accepte les{" "}
                  <a href="/terms" className="text-gold-500 hover:underline">
                    conditions d'utilisation
                  </a>
                </FormLabel>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Envoi en cours..."
              : "Soumettre la demande de devis"}
          </Button>

          <p className="text-xs text-center text-gray-400 mt-2">
            Un représentant de Xeption Network vous contactera dans les 24
            heures ouvrables
          </p>
        </form>
      </Form>
    </div>
  );
};

export default RFQForm;
