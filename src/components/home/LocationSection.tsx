import React from "react";
import { MapPin, Truck, Clock, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeliveryZone {
  city: string;
  estimatedTime: string;
}

interface LocationSectionProps {
  headquartersAddress?: string;
  deliveryZones?: DeliveryZone[];
  mapImageUrl?: string;
}

const LocationSection = ({
  headquartersAddress = "Quartier Elig-Essono, Yaoundé, Cameroon",
  deliveryZones = [
    { city: "Yaoundé", estimatedTime: "Same day - 24h" },
    { city: "Douala", estimatedTime: "24h - 48h" },
    { city: "Bafoussam", estimatedTime: "48h - 72h" },
    { city: "Bamenda", estimatedTime: "48h - 72h" },
    { city: "Garoua", estimatedTime: "3 - 5 days" },
    { city: "Maroua", estimatedTime: "3 - 5 days" },
  ],
  mapImageUrl = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=800&q=80",
}: LocationSectionProps) => {
  return (
    <section className="w-full py-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-gold-500 border-b border-gold-500 pb-2 inline-block">
              <span className="text-red-500">237</span> Nationwide Delivery
            </h2>

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
                    Free shipping on orders above 100,000 FCFA
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {deliveryZones.map((zone, index) => (
                <Card key={index} className="bg-gray-900 border-gold-500/30">
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
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
                    Get Directions
                  </button>
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
