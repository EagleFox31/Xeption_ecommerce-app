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
import { Mail, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // This would be replaced with actual authentication logic
      console.log("Login attempt with:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, always succeed unless email contains "error"
      if (data.email.includes("error")) {
        throw new Error("Identifiants incorrects. Veuillez réessayer.");
      }

      // Redirect would happen here after successful login
      window.location.href = "/account";
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
        <p className="text-gray-400 mt-2">Connectez-vous à votre compte</p>
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

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-400 cursor-pointer">
                    Se souvenir de moi
                  </FormLabel>
                </FormItem>
              )}
            />

            <Link
              to="/auth/reset-password"
              className="text-sm text-gold-500 hover:underline"
            >
              Mot de passe oublié?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </Form>

      <Separator className="my-6 bg-gray-700" />

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Pas encore de compte?{" "}
          <Link to="/auth/register" className="text-gold-500 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
