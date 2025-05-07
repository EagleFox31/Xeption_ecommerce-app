import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse e-mail invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    isBusinessClient: z.boolean().default(false),
    companyName: z.string().optional(),
    businessType: z.string().optional(),
    employeeCount: z.string().optional(),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "Vous devez accepter les conditions d'utilisation",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.isBusinessClient) {
        return (
          !!data.companyName && !!data.businessType && !!data.employeeCount
        );
      }
      return true;
    },
    {
      message:
        "Les informations d'entreprise sont requises pour un compte professionnel",
      path: ["companyName"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const RegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isBusinessClient: false,
      companyName: "",
      businessType: "",
      employeeCount: "",
      terms: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // This would be replaced with actual registration logic
      console.log("Registration attempt with:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, always succeed unless email contains "exists"
      if (data.email.includes("exists")) {
        throw new Error("Cette adresse e-mail est déjà utilisée.");
      }

      // In a real app, we would call the register function from auth service
      // For now, we'll just simulate it
      const businessDetails = data.isBusinessClient
        ? {
            companyName: data.companyName,
            businessType: data.businessType,
            employeeCount: data.employeeCount,
          }
        : undefined;

      // Redirect would happen here after successful registration
      window.location.href = "/auth/login?registered=true";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gold-500">XEPTION</h1>
        <p className="text-gray-400 mt-2">Créer un nouveau compte</p>
      </div>

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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Prénom</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        placeholder="Jean"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nom</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        placeholder="Dupont"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Adresse e-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      placeholder="votre@email.com"
                      type="email"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      placeholder="••••••••"
                      type="password"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  Confirmer le mot de passe
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      placeholder="••••••••"
                      type="password"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isBusinessClient"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500 mt-1"
                  />
                </FormControl>
                <FormLabel className="text-sm text-gray-400">
                  Je crée un compte professionnel pour mon entreprise
                </FormLabel>
              </FormItem>
            )}
          />

          {form.watch("isBusinessClient") && (
            <div className="space-y-4 border border-gray-700 rounded-md p-4 bg-gray-800/50 mt-4">
              <h3 className="text-gold-500 font-medium">
                Informations Entreprise
              </h3>

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Nom de l'entreprise
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nom de votre entreprise"
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Type d'entreprise
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
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
                        Nombre d'employés
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
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
            </div>
          )}

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500 mt-1"
                  />
                </FormControl>
                <FormLabel className="text-sm text-gray-400">
                  J'accepte les{" "}
                  <Link to="/terms" className="text-gold-500 hover:underline">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link to="/privacy" className="text-gold-500 hover:underline">
                    politique de confidentialité
                  </Link>
                </FormLabel>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Création en cours..." : "Créer un compte"}
          </Button>
        </form>
      </Form>

      <Separator className="my-6 bg-gray-700" />

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Déjà un compte?{" "}
          <Link to="/auth/login" className="text-gold-500 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
