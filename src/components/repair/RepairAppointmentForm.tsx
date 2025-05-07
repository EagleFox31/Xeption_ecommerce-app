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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { scheduleRepairAppointment } from "@/services/repairService";

const formSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().min(9, "Le numéro de téléphone est requis"),
  deviceType: z.string().min(1, "Le type d'appareil est requis"),
  deviceBrand: z.string().min(1, "La marque est requise"),
  deviceModel: z.string().min(1, "Le modèle est requis"),
  issueDescription: z
    .string()
    .min(10, "La description du problème est requise"),
  appointmentDate: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  appointmentTime: z.string().min(1, "L'heure est requise"),
});

type FormValues = z.infer<typeof formSchema>;

const RepairAppointmentForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentReference, setAppointmentReference] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      deviceType: "",
      deviceBrand: "",
      deviceModel: "",
      issueDescription: "",
      appointmentTime: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Format the date and time for the appointment
      const formattedDate = format(data.appointmentDate, "yyyy-MM-dd");
      const appointmentDateTime = `${formattedDate} ${data.appointmentTime}`;

      // Submit the appointment request
      const result = await scheduleRepairAppointment({
        ...data,
        appointmentDateTime,
      });

      // Set reference from the result
      setAppointmentReference(result.id);
      setIsSubmitted(true);
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

  const availableTimes = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  if (isSubmitted) {
    return (
      <Card className="bg-gray-900 border-gray-800 p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gold-500">
          Rendez-vous Confirmé
        </h3>
        <p className="text-gray-300 mb-2">
          Votre rendez-vous a été programmé avec succès. Un email de
          confirmation vous a été envoyé avec tous les détails.
        </p>
        <p className="text-gold-500 font-semibold mb-6">
          Référence: {appointmentReference}
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            form.reset();
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Prendre un autre rendez-vous
        </Button>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-center text-gold-500">
          Prendre Rendez-vous pour une Réparation
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Remplissez le formulaire ci-dessous pour planifier un rendez-vous avec
          nos techniciens. Nous vous contacterons pour confirmer l'heure et les
          détails.
        </p>

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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nom Complet*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Votre nom"
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
                      placeholder="votre@email.com"
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="deviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Type d'Appareil*
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="smartphone">Smartphone</SelectItem>
                        <SelectItem value="laptop">
                          Ordinateur Portable
                        </SelectItem>
                        <SelectItem value="desktop">
                          Ordinateur de Bureau
                        </SelectItem>
                        <SelectItem value="tablet">Tablette</SelectItem>
                        <SelectItem value="tv">Télévision</SelectItem>
                        <SelectItem value="audio">Système Audio</SelectItem>
                        <SelectItem value="printer">Imprimante</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deviceBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Marque*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Apple, Samsung"
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
                name="deviceModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Modèle*</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: iPhone 13, Galaxy S21"
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="issueDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Description du Problème*
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Décrivez le problème que vous rencontrez avec votre appareil..."
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">
                      Date du Rendez-vous*
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-gray-800 border-gray-700 text-white",
                              !field.value && "text-gray-400",
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-gray-800 border-gray-700"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            // Disable dates in the past and weekends
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const day = date.getDay();
                            return date < today || day === 0 || day === 6;
                          }}
                          initialFocus
                          locale={fr}
                          className="bg-gray-800 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Heure du Rendez-vous*
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Sélectionner une heure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isSubmitting
                ? "Traitement en cours..."
                : "Confirmer le Rendez-vous"}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default RepairAppointmentForm;
