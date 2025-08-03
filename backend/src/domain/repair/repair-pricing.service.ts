import { Injectable } from "@nestjs/common";

@Injectable()
export class RepairPricingService {
  private readonly costMatrix = {
    smartphone: {
      screen: { min: 15000, max: 50000 },
      battery: { min: 10000, max: 25000 },
      charging: { min: 8000, max: 20000 },
      water_damage: { min: 25000, max: 75000 },
      camera: { min: 15000, max: 45000 },
      software: { min: 5000, max: 20000 },
      default: { min: 15000, max: 50000 },
    },
    laptop: {
      screen: { min: 35000, max: 120000 },
      keyboard: { min: 15000, max: 45000 },
      battery: { min: 20000, max: 60000 },
      charging: { min: 15000, max: 40000 },
      storage: { min: 25000, max: 100000 },
      motherboard: { min: 70000, max: 200000 },
      default: { min: 25000, max: 100000 },
    },
    tablet: {
      screen: { min: 25000, max: 85000 },
      battery: { min: 15000, max: 40000 },
      charging: { min: 10000, max: 30000 },
      default: { min: 20000, max: 75000 },
    },
    desktop: {
      power_supply: { min: 15000, max: 45000 },
      motherboard: { min: 50000, max: 150000 },
      storage: { min: 20000, max: 80000 },
      ram: { min: 10000, max: 40000 },
      cpu: { min: 40000, max: 180000 },
      gpu: { min: 60000, max: 250000 },
      default: { min: 30000, max: 120000 },
    },
    tv: {
      screen: { min: 50000, max: 250000 },
      power: { min: 20000, max: 60000 },
      connectivity: { min: 15000, max: 50000 },
      default: { min: 35000, max: 200000 },
    },
    default: { min: 15000, max: 50000 },
  } as const;

  async calculateRepairCost(deviceType: string, issueType: string): Promise<{ min: number; max: number }> {
    const normalizedDeviceType = deviceType.toLowerCase();
    const normalizedIssueType = issueType.toLowerCase().replace(/\s+/g, "_");
    const deviceCosts =
      (this.costMatrix as any)[normalizedDeviceType] || (this.costMatrix as any).default;
    const issueCosts = deviceCosts[normalizedIssueType] || deviceCosts.default;
    return issueCosts;
  }
}
