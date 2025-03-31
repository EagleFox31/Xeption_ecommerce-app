import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, MapPin, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock address type
interface Address {
  id: string;
  name: string;
  recipient: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

// Mock addresses data
const mockAddresses: Address[] = [
  {
    id: "addr-1",
    name: "Domicile",
    recipient: "Jean Dupont",
    phone: "+237 691234567",
    address: "123 Avenue Kennedy, Quartier Bastos",
    city: "Yaoundé",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Bureau",
    recipient: "Jean Dupont",
    phone: "+237 691234567",
    address: "45 Rue Foch, Quartier Akwa",
    city: "Douala",
    isDefault: false,
  },
];

const formSchema = z.object({
  name: z.string().min(1, "Le nom de l'adresse est requis"),
  recipient: z.string().min(1, "Le nom du destinataire est requis"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, "La ville est requise"),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      recipient: "",
      phone: "",
      address: "",
      city: "",
      isDefault: false,
    },
  });

  const handleEdit = (address: Address) => {
    setIsEditing(address.id);
    form.reset({
      name: address.name,
      recipient: address.recipient,
      phone: address.phone,
      address: address.address,
      city: address.city,
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setIsEditing(null);
    form.reset({
      name: "",
      recipient: "",
      phone: "",
      address: "",
      city: "",
      isDefault: false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((address) => address.id !== id));
    setSuccess("L'adresse a été supprimée avec succès.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    );
    setSuccess("L'adresse par défaut a été mise à jour.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const onSubmit = (data: FormValues) => {
    if (isEditing) {
      // Update existing address
      setAddresses(
        addresses.map((address) =>
          address.id === isEditing
            ? {
                ...address,
                ...data,
                isDefault: data.isDefault || false,
              }
            : data.isDefault
              ? { ...address, isDefault: false }
              : address,
        ),
      );
      setSuccess("L'adresse a été mise à jour avec succès.");
    } else {
      // Add new address
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        ...data,
        isDefault: data.isDefault || false,
      };

      // If this is set as default, update other addresses
      if (newAddress.isDefault) {
        setAddresses(
          addresses.map((address) => ({ ...address, isDefault: false })),
        );
      }

      setAddresses([...addresses, newAddress]);
      setSuccess("L'adresse a été ajoutée avec succès.");
    }

    setIsDialogOpen(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Adresses enregistrées
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAdd}
                className="bg-gold-500 hover:bg-gold-600 text-black"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une adresse
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Modifier l'adresse" : "Ajouter une adresse"}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'adresse</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Domicile, Bureau, etc."
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du destinataire</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nom complet"
                            className="bg-gray-700 border-gray-600 text-white"
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
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+237 6XXXXXXXX"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Rue, quartier, etc."
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Yaoundé, Douala, etc."
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-gold-500 focus:ring-gold-500"
                        />
                        <label
                          htmlFor="isDefault"
                          className="text-sm font-medium text-gray-300"
                        >
                          Définir comme adresse par défaut
                        </label>
                      </div>
                    )}
                  />

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-black ml-2"
                    >
                      {isEditing ? "Mettre à jour" : "Ajouter"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-900/50 border-green-800 text-white">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {addresses.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white">
                  Aucune adresse enregistrée
                </h3>
                <p className="text-gray-400 mt-2">
                  Ajoutez une adresse pour faciliter vos commandes futures.
                </p>
                <Button
                  onClick={handleAdd}
                  className="mt-4 bg-gold-500 hover:bg-gold-600 text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une adresse
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card
                key={address.id}
                className={`bg-gray-800 border-gray-700 ${address.isDefault ? "ring-2 ring-gold-500" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <CardTitle className="text-white">
                        {address.name}
                      </CardTitle>
                      {address.isDefault && (
                        <Badge className="ml-2 bg-gold-500 text-black">
                          Par défaut
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(address)}
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer l'adresse
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Êtes-vous sûr de vouloir supprimer cette adresse ?
                              Cette action ne peut pas être annulée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-600 text-white hover:bg-gray-700">
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(address.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-white">{address.recipient}</p>
                    <p className="text-gray-400">{address.phone}</p>
                    <p className="text-gray-400">{address.address}</p>
                    <p className="text-gray-400">{address.city}</p>
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      onClick={() => handleSetDefault(address.id)}
                      className="mt-4 border-gold-500 text-gold-500 hover:bg-gold-500/10"
                    >
                      Définir par défaut
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAddresses;
