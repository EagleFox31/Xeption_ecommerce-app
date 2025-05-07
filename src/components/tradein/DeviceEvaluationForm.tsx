import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface DeviceCondition {
  cosmetic: string;
  functional: string;
  accessories: string;
  age: string;
}

export interface DeviceEvaluationFormProps {
  deviceType: string;
  deviceModel?: string;
  onComplete: (value: number, condition: DeviceCondition) => void;
}

const DeviceEvaluationForm = ({
  deviceType,
  deviceModel = "",
  onComplete,
}: DeviceEvaluationFormProps) => {
  const [condition, setCondition] = useState<DeviceCondition>({
    cosmetic: "excellent",
    functional: "fullyFunctional",
    accessories: "all",
    age: "lessThanOneYear",
  });

  const handleChange = (category: keyof DeviceCondition, value: string) => {
    setCondition((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const calculateValue = () => {
    // Base values for different device types (in FCFA)
    const baseValues: Record<string, number> = {
      Smartphones: 50000,
      "Ordinateurs Portables": 100000,
      Tablettes: 40000,
      "Ordinateurs de Bureau": 80000,
      Accessoires: 10000,
      "Autres Appareils": 30000,
    };

    // Get base value for the device type
    let baseValue = baseValues[deviceType] || 30000;

    // Multipliers based on condition
    const cosmeticMultipliers: Record<string, number> = {
      excellent: 1.0,
      good: 0.8,
      fair: 0.6,
      poor: 0.4,
    };

    const functionalMultipliers: Record<string, number> = {
      fullyFunctional: 1.0,
      minorIssues: 0.7,
      majorIssues: 0.4,
      notWorking: 0.1,
    };

    const accessoriesMultipliers: Record<string, number> = {
      all: 1.0,
      most: 0.9,
      some: 0.8,
      none: 0.7,
    };

    const ageMultipliers: Record<string, number> = {
      lessThanOneYear: 1.0,
      oneToTwoYears: 0.8,
      twoToThreeYears: 0.6,
      moreThanThreeYears: 0.4,
    };

    // Calculate final value
    const value =
      baseValue *
      cosmeticMultipliers[condition.cosmetic] *
      functionalMultipliers[condition.functional] *
      accessoriesMultipliers[condition.accessories] *
      ageMultipliers[condition.age];

    return Math.round(value / 1000) * 1000; // Round to nearest 1000 FCFA
  };

  const handleSubmit = () => {
    const value = calculateValue();
    onComplete(value, condition);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Évaluation de votre {deviceType} {deviceModel && `- ${deviceModel}`}
        </h3>

        <div className="space-y-6">
          {/* Cosmetic Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              État cosmétique
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={
                  condition.cosmetic === "excellent" ? "default" : "outline"
                }
                className={
                  condition.cosmetic === "excellent"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("cosmetic", "excellent")}
              >
                Excellent
              </Button>
              <Button
                type="button"
                variant={condition.cosmetic === "good" ? "default" : "outline"}
                className={
                  condition.cosmetic === "good"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("cosmetic", "good")}
              >
                Bon
              </Button>
              <Button
                type="button"
                variant={condition.cosmetic === "fair" ? "default" : "outline"}
                className={
                  condition.cosmetic === "fair"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("cosmetic", "fair")}
              >
                Moyen
              </Button>
              <Button
                type="button"
                variant={condition.cosmetic === "poor" ? "default" : "outline"}
                className={
                  condition.cosmetic === "poor"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("cosmetic", "poor")}
              >
                Mauvais
              </Button>
            </div>
          </div>

          {/* Functional Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              État fonctionnel
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={
                  condition.functional === "fullyFunctional"
                    ? "default"
                    : "outline"
                }
                className={
                  condition.functional === "fullyFunctional"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("functional", "fullyFunctional")}
              >
                Parfaitement fonctionnel
              </Button>
              <Button
                type="button"
                variant={
                  condition.functional === "minorIssues" ? "default" : "outline"
                }
                className={
                  condition.functional === "minorIssues"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("functional", "minorIssues")}
              >
                Problèmes mineurs
              </Button>
              <Button
                type="button"
                variant={
                  condition.functional === "majorIssues" ? "default" : "outline"
                }
                className={
                  condition.functional === "majorIssues"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("functional", "majorIssues")}
              >
                Problèmes majeurs
              </Button>
              <Button
                type="button"
                variant={
                  condition.functional === "notWorking" ? "default" : "outline"
                }
                className={
                  condition.functional === "notWorking"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("functional", "notWorking")}
              >
                Ne fonctionne pas
              </Button>
            </div>
          </div>

          {/* Accessories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Accessoires inclus
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={
                  condition.accessories === "all" ? "default" : "outline"
                }
                className={
                  condition.accessories === "all"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("accessories", "all")}
              >
                Tous les accessoires
              </Button>
              <Button
                type="button"
                variant={
                  condition.accessories === "most" ? "default" : "outline"
                }
                className={
                  condition.accessories === "most"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("accessories", "most")}
              >
                La plupart
              </Button>
              <Button
                type="button"
                variant={
                  condition.accessories === "some" ? "default" : "outline"
                }
                className={
                  condition.accessories === "some"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("accessories", "some")}
              >
                Quelques-uns
              </Button>
              <Button
                type="button"
                variant={
                  condition.accessories === "none" ? "default" : "outline"
                }
                className={
                  condition.accessories === "none"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("accessories", "none")}
              >
                Aucun
              </Button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Âge de l'appareil
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={
                  condition.age === "lessThanOneYear" ? "default" : "outline"
                }
                className={
                  condition.age === "lessThanOneYear"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("age", "lessThanOneYear")}
              >
                Moins d'un an
              </Button>
              <Button
                type="button"
                variant={
                  condition.age === "oneToTwoYears" ? "default" : "outline"
                }
                className={
                  condition.age === "oneToTwoYears"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("age", "oneToTwoYears")}
              >
                1-2 ans
              </Button>
              <Button
                type="button"
                variant={
                  condition.age === "twoToThreeYears" ? "default" : "outline"
                }
                className={
                  condition.age === "twoToThreeYears"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("age", "twoToThreeYears")}
              >
                2-3 ans
              </Button>
              <Button
                type="button"
                variant={
                  condition.age === "moreThanThreeYears" ? "default" : "outline"
                }
                className={
                  condition.age === "moreThanThreeYears"
                    ? "bg-gold-500 text-black"
                    : "border-gray-700 text-white"
                }
                onClick={() => handleChange("age", "moreThanThreeYears")}
              >
                Plus de 3 ans
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              className="w-full bg-gold-500 hover:bg-gold-600 text-black"
            >
              Obtenir une estimation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceEvaluationForm;
