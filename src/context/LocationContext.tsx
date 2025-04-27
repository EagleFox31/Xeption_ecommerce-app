import React, { createContext, useState, useContext, ReactNode } from "react";
import {
  DeliveryZone,
  deliveryZonesData,
} from "@/components/home/LocationSection";

interface LocationContextType {
  userLocation: string;
  setUserLocation: (location: string) => void;
  getDeliveryZone: (location?: string) => DeliveryZone | undefined;
  calculateDeliveryCost: (subtotal: number, location?: string) => number;
}

export const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<string>("Yaoundé");

  const getDeliveryZone = (location?: string): DeliveryZone | undefined => {
    const locationToUse = location || userLocation;
    return deliveryZonesData.find((zone) => zone.city === locationToUse);
  };

  const calculateDeliveryCost = (
    subtotal: number,
    location?: string,
  ): number => {
    const zone = getDeliveryZone(location);
    if (!zone) return 0;

    // If free shipping is eligible and order meets minimum amount
    if (
      zone.isFreeShippingEligible &&
      ((zone.minFreeShippingAmount && subtotal >= zone.minFreeShippingAmount) ||
        !zone.minFreeShippingAmount)
    ) {
      return 0;
    }

    return zone.deliveryCost;
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        setUserLocation,
        getDeliveryZone,
        calculateDeliveryCost,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
