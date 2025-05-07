// Mock enterprise product data service

export interface EnterpriseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  minOrderQuantity: number;
  image: string;
  features: string[];
  specifications: Record<string, string>;
  availability: "In Stock" | "Limited Stock" | "Out of Stock" | "Pre-order";
  leadTime: string;
  bulkDiscounts?: {
    quantity: number;
    discountPercentage: number;
  }[];
}

export type ProductCategory =
  | "Computers"
  | "Servers"
  | "Networking"
  | "Storage"
  | "Peripherals"
  | "Software"
  | "Services";

// Mock enterprise products data
const enterpriseProducts: EnterpriseProduct[] = [
  {
    id: "ep-001",
    name: "ThinkCentre M720 Business Desktop",
    description:
      "Powerful desktop computer for business use with enhanced security features",
    price: 850000,
    category: "Computers",
    minOrderQuantity: 5,
    image:
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80",
    features: [
      "Intel Core i7 processor",
      "16GB RAM",
      "512GB SSD",
      "Windows 11 Pro",
      "TPM 2.0 security chip",
    ],
    specifications: {
      Processor: "Intel Core i7-10700",
      Memory: "16GB DDR4",
      Storage: "512GB NVMe SSD",
      Graphics: "Intel UHD Graphics 630",
      "Operating System": "Windows 11 Pro",
    },
    availability: "In Stock",
    leadTime: "1-2 weeks",
    bulkDiscounts: [
      { quantity: 10, discountPercentage: 5 },
      { quantity: 20, discountPercentage: 10 },
      { quantity: 50, discountPercentage: 15 },
    ],
  },
  {
    id: "ep-002",
    name: "PowerEdge R740 Server",
    description: "Enterprise-grade server for mission-critical applications",
    price: 5500000,
    category: "Servers",
    minOrderQuantity: 1,
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
    features: [
      "Dual Intel Xeon processors",
      "64GB RAM expandable to 3TB",
      "Hot-swappable drives",
      "Redundant power supplies",
      "iDRAC remote management",
    ],
    specifications: {
      Processor: "2x Intel Xeon Gold 6248R",
      Memory: "64GB DDR4 ECC",
      Storage: "4x 1.2TB 10K SAS HDDs",
      Network: "4x 1GbE, 2x 10GbE SFP+",
      Power: "2x 750W redundant PSUs",
    },
    availability: "Limited Stock",
    leadTime: "3-4 weeks",
  },
  {
    id: "ep-003",
    name: "Cisco Catalyst 9300 Switch",
    description:
      "Enterprise-grade network switch with advanced security features",
    price: 1200000,
    category: "Networking",
    minOrderQuantity: 2,
    image:
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
    features: [
      "24 ports 10/100/1000 Ethernet",
      "4 SFP+ uplink ports",
      "StackWise technology",
      "Advanced security features",
      "Cisco DNA support",
    ],
    specifications: {
      Ports: "24x 10/100/1000 Ethernet",
      Uplinks: "4x 10G SFP+",
      "Switching Capacity": "208 Gbps",
      "Forwarding Rate": "154.76 Mpps",
      Power: "Redundant power supplies",
    },
    availability: "In Stock",
    leadTime: "1-2 weeks",
    bulkDiscounts: [
      { quantity: 5, discountPercentage: 3 },
      { quantity: 10, discountPercentage: 7 },
    ],
  },
  {
    id: "ep-004",
    name: "NetApp AFF A400 Storage Array",
    description:
      "High-performance all-flash storage array for enterprise applications",
    price: 8500000,
    category: "Storage",
    minOrderQuantity: 1,
    image:
      "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=80",
    features: [
      "All-flash storage",
      "NVMe technology",
      "Data reduction technologies",
      "ONTAP data management",
      "Cloud integration",
    ],
    specifications: {
      "Raw Capacity": "24x 3.8TB NVMe SSDs",
      "Effective Capacity": "Up to 700TB",
      Controllers: "Dual controllers",
      Network: "4x 25GbE SFP28",
      "Protocol Support": "FC, iSCSI, NFS, SMB",
    },
    availability: "Pre-order",
    leadTime: "6-8 weeks",
  },
  {
    id: "ep-005",
    name: "Microsoft 365 Business Premium",
    description: "Complete productivity and security solution for businesses",
    price: 25000,
    category: "Software",
    minOrderQuantity: 10,
    image:
      "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=600&q=80",
    features: [
      "Office desktop apps",
      "Email and calendar",
      "Teams for collaboration",
      "Advanced security features",
      "Device management",
    ],
    specifications: {
      "License Type": "Per user subscription",
      Duration: "Annual",
      "Apps Included": "Word, Excel, PowerPoint, Outlook, Teams",
      "Cloud Storage": "1TB OneDrive per user",
      Security: "Advanced Threat Protection",
    },
    availability: "In Stock",
    leadTime: "Immediate",
    bulkDiscounts: [
      { quantity: 50, discountPercentage: 5 },
      { quantity: 100, discountPercentage: 10 },
      { quantity: 250, discountPercentage: 15 },
    ],
  },
];

// Get all enterprise products
export const getEnterpriseProducts = () => {
  return [...enterpriseProducts];
};

// Get enterprise product by ID
export const getEnterpriseProductById = (id: string) => {
  return enterpriseProducts.find((product) => product.id === id);
};

// Get enterprise products by category
export const getEnterpriseProductsByCategory = (category: string) => {
  return enterpriseProducts.filter((product) => product.category === category);
};

// Get all unique enterprise product categories
export const getEnterpriseProductCategories = (): string[] => {
  const categories = new Set(
    enterpriseProducts.map((product) => product.category),
  );
  return Array.from(categories);
};

// Filter enterprise products by availability
export const filterEnterpriseProductsByAvailability = (
  availability: string,
) => {
  return enterpriseProducts.filter(
    (product) => product.availability === availability,
  );
};

// Search enterprise products by name or description
export const searchEnterpriseProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return enterpriseProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery),
  );
};
