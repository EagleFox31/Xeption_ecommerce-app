import React, { useState, useEffect } from "react";
import {
  MapPin,
  Truck,
  Clock,
  Building,
  Navigation,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DeliveryZone {
  city: string;
  estimatedTime: string;
  deliveryCost: number;
  isFreeShippingEligible: boolean;
  minFreeShippingAmount?: number;
}

export const deliveryZonesData: DeliveryZone[] = [
  {
    city: "Yaoundé",
    estimatedTime: "Same day - 24h",
    deliveryCost: 0,
    isFreeShippingEligible: true,
  },
  {
    city: "Douala",
    estimatedTime: "24h - 48h",
    deliveryCost: 5000,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 100000,
  },
  {
    city: "Bafoussam",
    estimatedTime: "48h - 72h",
    deliveryCost: 7500,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 150000,
  },
  {
    city: "Bamenda",
    estimatedTime: "48h - 72h",
    deliveryCost: 7500,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 150000,
  },
  {
    city: "Garoua",
    estimatedTime: "3 - 5 days",
    deliveryCost: 10000,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 200000,
  },
  {
    city: "Maroua",
    estimatedTime: "3 - 5 days",
    deliveryCost: 10000,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 200000,
  },
  {
    city: "Limbe",
    estimatedTime: "48h - 72h",
    deliveryCost: 7500,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 150000,
  },
  {
    city: "Buea",
    estimatedTime: "48h - 72h",
    deliveryCost: 7500,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 150000,
  },
  {
    city: "Kribi",
    estimatedTime: "48h - 72h",
    deliveryCost: 7500,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 150000,
  },
  {
    city: "Bertoua",
    estimatedTime: "3 - 5 days",
    deliveryCost: 10000,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 200000,
  },
  {
    city: "Ngaoundéré",
    estimatedTime: "3 - 5 days",
    deliveryCost: 10000,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 200000,
  },
  {
    city: "Ebolowa",
    estimatedTime: "3 - 5 days",
    deliveryCost: 10000,
    isFreeShippingEligible: true,
    minFreeShippingAmount: 200000,
  },
];

interface LocationSectionProps {
  headquartersAddress?: string;
  deliveryZones?: DeliveryZone[];
  mapImageUrl?: string;
  onLocationSelect?: (location: string) => void;
}

const LocationSection = ({
  headquartersAddress = "Quartier Elig-Essono, Yaoundé, Cameroon",
  deliveryZones = deliveryZonesData,
  mapImageUrl = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=800&q=80",
  onLocationSelect,
}: LocationSectionProps) => {
  const [userLocation, setUserLocation] = useState<string>("Yaoundé");
  const [isLocating, setIsLocating] = useState(false);

  // Function to handle location detection (simulated)
  const detectLocation = () => {
    setIsLocating(true);
    // Simulate geolocation detection with a timeout
    setTimeout(() => {
      // In a real app, this would use the browser's geolocation API
      // and then reverse geocode to get the city name
      setUserLocation("Yaoundé");
      setIsLocating(false);
      if (onLocationSelect) onLocationSelect("Yaoundé");
    }, 1500);
  };

  // Handle location change from dropdown
  const handleLocationChange = (value: string) => {
    setUserLocation(value);
    if (onLocationSelect) onLocationSelect(value);
  };

  // Get current delivery zone info
  const currentZone =
    deliveryZones.find((zone) => zone.city === userLocation) ||
    deliveryZones[0];
  return (
    <section className="w-full py-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-gold-500 border-b border-gold-500 pb-2 inline-block">
              <span className="text-red-500">237</span> Nationwide Delivery
            </h2>

            {/* Location selector */}
            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gold-500/30">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Your Location
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Select
                    value={userLocation}
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {deliveryZones.map((zone) => (
                        <SelectItem key={zone.city} value={zone.city}>
                          {zone.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black"
                  onClick={detectLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    "Detecting..."
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Detect My Location
                    </>
                  )}
                </Button>
              </div>

              {/* Current location delivery info */}
              {currentZone && (
                <div className="mt-4 p-3 bg-gray-800 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-white">
                      Delivery available to {currentZone.city}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>
                        Estimated delivery: {currentZone.estimatedTime}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-gray-500">•</span>
                    <div>
                      <span>
                        Delivery cost:{" "}
                        {currentZone.deliveryCost === 0
                          ? "Free"
                          : `${currentZone.deliveryCost.toLocaleString()} FCFA`}
                      </span>
                      {currentZone.minFreeShippingAmount && (
                        <span className="text-xs text-green-500 ml-1">
                          (Free for orders above{" "}
                          {currentZone.minFreeShippingAmount.toLocaleString()}{" "}
                          FCFA)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Building className="h-6 w-6 text-gold-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">Headquarters</h3>
                  <p className="text-gray-300">{headquartersAddress}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Visit our showroom for exclusive deals!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-gold-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Delivery Options
                  </h3>
                  <p className="text-gray-300">
                    We deliver tech products to all major cities in Cameroon
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Free shipping on orders above 100,000 FCFA in Yaoundé
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {deliveryZones.slice(0, 6).map((zone, index) => (
                <Card
                  key={index}
                  className={`${zone.city === userLocation ? "bg-gray-800 border-gold-500" : "bg-gray-900 border-gold-500/30"} transition-all duration-200`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gold-500 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {zone.city}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <Clock className="h-3 w-3 text-red-500" />
                      {zone.estimatedTime}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {zone.deliveryCost === 0
                        ? "Free delivery"
                        : `${zone.deliveryCost.toLocaleString()} FCFA`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="relative h-full min-h-[300px] rounded-lg overflow-hidden border-2 border-gold-500/50">
              <img
                src={mapImageUrl}
                alt="Xeption Network Cameroon Map"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center p-6 bg-black/70 rounded-lg max-w-xs">
                  <h3 className="text-xl font-bold text-gold-500 mb-2">
                    Find Us
                  </h3>
                  <p className="text-white mb-4">
                    Visit our headquarters in Yaoundé or contact us to arrange
                    delivery to your location.
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
