import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DeviceEvaluationForm, {
  DeviceCondition,
} from "@/components/tradein/DeviceEvaluationForm";

const TradeInPage = () => {
  const [step, setStep] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);
  const [deviceModel, setDeviceModel] = useState("");
  const [tradeInValue, setTradeInValue] = useState(0);
  const [deviceCondition, setDeviceCondition] =
    useState<DeviceCondition | null>(null);
  const [tradeInOption, setTradeInOption] = useState<"credit" | "cash" | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gold-500 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Service de Troc
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Échangez vos anciens appareils contre des crédits ou des réductions
            sur vos nouveaux achats
          </motion.p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-gold-500 text-black" : "bg-gray-800 text-gray-400"}`}
            >
              {step > 1 ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <div
              className={`w-16 h-1 ${step >= 2 ? "bg-gold-500" : "bg-gray-800"}`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-gold-500 text-black" : "bg-gray-800 text-gray-400"}`}
            >
              {step > 2 ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <div
              className={`w-16 h-1 ${step >= 3 ? "bg-gold-500" : "bg-gray-800"}`}
            ></div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-gold-500 text-black" : "bg-gray-800 text-gray-400"}`}
            >
              {step > 3 ? <Check className="h-5 w-5" /> : "3"}
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Sélectionnez votre appareil
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deviceCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-gray-900 border-gray-800 hover:border-gold-500/50 transition-all cursor-pointer"
                  >
                    <CardHeader>
                      <CardTitle className="text-white">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="w-full text-gold-500 hover:text-gold-400 hover:bg-gray-800"
                        onClick={() => {
                          setSelectedDevice(category);
                          setStep(2);
                        }}
                      >
                        Sélectionner <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  Continuer
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Évaluez votre {selectedDevice?.name}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modèle de l'appareil (optionnel)
                </label>
                <input
                  type="text"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  placeholder="Ex: iPhone 13, MacBook Pro 2021..."
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                />
              </div>

              <DeviceEvaluationForm
                deviceType={selectedDevice?.name || ""}
                deviceModel={deviceModel}
                onComplete={(value, condition) => {
                  setTradeInValue(value);
                  setDeviceCondition(condition);
                  setStep(3);
                }}
              />

              <div className="mt-8 flex justify-between">
                <Button
                  onClick={() => {
                    setSelectedDevice(null);
                    setDeviceModel("");
                    setStep(1);
                  }}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Votre estimation
              </h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-300 mb-2">
                      Valeur estimée de votre {selectedDevice?.name}{" "}
                      {deviceModel && `- ${deviceModel}`}:
                    </p>
                    <p className="text-4xl font-bold text-gold-500 mb-4">
                      {tradeInValue.toLocaleString()} FCFA
                    </p>
                    <p className="text-gray-400 mb-6">
                      Cette valeur peut être utilisée comme crédit pour un
                      nouvel achat ou échangée contre de l'argent (frais
                      applicables).
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        className={`${tradeInOption === "credit" ? "bg-gold-500" : "bg-gray-700"} hover:bg-gold-600 text-black`}
                        onClick={() => setTradeInOption("credit")}
                      >
                        Utiliser comme crédit
                      </Button>
                      <Button
                        variant="outline"
                        className={`${tradeInOption === "cash" ? "border-gold-500 text-gold-500" : "border-gray-700 text-white"} hover:bg-gray-800`}
                        onClick={() => setTradeInOption("cash")}
                      >
                        Échanger contre de l'argent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-8 flex justify-between">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <Button
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                  disabled={!tradeInOption}
                  onClick={() => setStep(4)}
                >
                  Planifier un rendez-vous
                </Button>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Planifier un rendez-vous
              </h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-300 mb-4">
                      Merci d'avoir choisi notre service de troc. Un agent vous
                      contactera sous peu pour confirmer votre rendez-vous.
                    </p>

                    <div className="bg-gray-800 p-4 rounded-md mb-6">
                      <h3 className="text-lg font-semibold text-gold-500 mb-2">
                        Récapitulatif
                      </h3>
                      <p className="text-gray-300">
                        Appareil: {selectedDevice?.name}{" "}
                        {deviceModel && `- ${deviceModel}`}
                      </p>
                      <p className="text-gray-300">
                        Valeur estimée: {tradeInValue.toLocaleString()} FCFA
                      </p>
                      <p className="text-gray-300">
                        Option choisie:{" "}
                        {tradeInOption === "credit"
                          ? "Crédit pour achat"
                          : "Échange contre argent"}
                      </p>
                    </div>

                    <Button
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                      onClick={() => {
                        // Reset all states and go back to step 1
                        setStep(1);
                        setSelectedDevice(null);
                        setDeviceModel("");
                        setTradeInValue(0);
                        setDeviceCondition(null);
                        setTradeInOption(null);
                      }}
                    >
                      Terminer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sample data
const deviceCategories = [
  {
    id: 1,
    name: "Smartphones",
    description: "iPhone, Samsung, Huawei, etc.",
  },
  {
    id: 2,
    name: "Ordinateurs Portables",
    description: "MacBook, Dell, HP, Lenovo, etc.",
  },
  {
    id: 3,
    name: "Tablettes",
    description: "iPad, Samsung Galaxy Tab, etc.",
  },
  {
    id: 4,
    name: "Ordinateurs de Bureau",
    description: "iMac, PC Gaming, etc.",
  },
  {
    id: 5,
    name: "Accessoires",
    description: "Écouteurs, Montres connectées, etc.",
  },
  {
    id: 6,
    name: "Autres Appareils",
    description: "Consoles, Appareils photo, etc.",
  },
];

export default TradeInPage;
