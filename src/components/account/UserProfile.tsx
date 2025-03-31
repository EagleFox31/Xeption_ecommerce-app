import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, User, Mail, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getCurrentUser,
  updateUserProfile,
  User as UserType,
} from "@/services/auth";

const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse e-mail invalide"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const UserProfile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      form.reset({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || "",
      });
    }
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      setUser(updatedUser);
      setSuccess("Votre profil a été mis à jour avec succès.");
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

  if (!user) {
    return (
      <div className="w-full p-6 bg-gray-900 rounded-lg border border-gray-800">
        <p className="text-white">
          Vous devez être connecté pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 border-2 border-gold-500">
              <AvatarImage
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback className="bg-gray-800 text-gold-500">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-400">{user.email}</p>
          </div>

          <div className="flex-1 w-full">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert
                    variant="destructive"
                    className="mb-6 bg-red-900/50 border-red-800 text-white"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-6 bg-green-900/50 border-green-800 text-white">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  className="pl-10 bg-gray-700 border-gray-600 text-white"
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
                                  className="pl-10 bg-gray-700 border-gray-600 text-white"
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
                          <FormLabel className="text-white">
                            Adresse e-mail
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                className="pl-10 bg-gray-700 border-gray-600 text-white"
                                disabled={true} // Email cannot be changed
                              />
                            </div>
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
                          <FormLabel className="text-white">
                            Téléphone
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                {...field}
                                placeholder="+237 6XXXXXXXX"
                                className="pl-10 bg-gray-700 border-gray-600 text-white"
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="bg-gold-500 hover:bg-gold-600 text-black font-medium"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? "Mise à jour..."
                          : "Mettre à jour le profil"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Separator className="my-6 bg-gray-700" />

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Changer le mot de passe
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
