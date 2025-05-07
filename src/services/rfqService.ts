// Types for RFQ requests
export interface RFQRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  employeeCount: string;
  productCategory: string;
  quantity: string;
  budget?: string;
  timeframe: string;
  specifications: string;
  requestDate: Date;
  status:
    | "pending"
    | "processing"
    | "quoted"
    | "accepted"
    | "rejected"
    | "completed";
  userId?: string; // Optional, linked to authenticated user if available
}

// Mock storage for RFQ requests
const rfqRequests: RFQRequest[] = [];

// Generate a unique RFQ reference
const generateRFQReference = (): string => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `RFQ-${timestamp}-${random}`;
};

// Submit a new RFQ request
export const submitRFQRequest = (
  data: Omit<RFQRequest, "id" | "requestDate" | "status">,
): RFQRequest => {
  const newRequest: RFQRequest = {
    ...data,
    id: generateRFQReference(),
    requestDate: new Date(),
    status: "pending",
  };

  rfqRequests.push(newRequest);
  console.log("New RFQ request:", newRequest);
  return newRequest;
};

// Get all RFQ requests
export const getRFQRequests = (): RFQRequest[] => {
  return [...rfqRequests];
};

// Get RFQ requests for a specific user
export const getUserRFQRequests = (userId: string): RFQRequest[] => {
  return rfqRequests.filter((request) => request.userId === userId);
};

// Get an RFQ request by ID
export const getRFQRequestById = (id: string): RFQRequest | undefined => {
  return rfqRequests.find((request) => request.id === id);
};

// Update an RFQ request status
export const updateRFQRequestStatus = (
  id: string,
  status: RFQRequest["status"],
): RFQRequest | undefined => {
  const requestIndex = rfqRequests.findIndex((request) => request.id === id);

  if (requestIndex === -1) return undefined;

  rfqRequests[requestIndex].status = status;

  // In a real application, this would be where we'd update the database
  // and potentially trigger notifications to relevant parties
  console.log(`RFQ ${id} status updated to ${status}`);

  return rfqRequests[requestIndex];
};

// Get the next available status for an RFQ
export const getNextRFQStatus = (
  currentStatus: RFQRequest["status"],
): RFQRequest["status"] => {
  switch (currentStatus) {
    case "pending":
      return "processing";
    case "processing":
      return "quoted";
    case "quoted":
      return "accepted";
    case "accepted":
      return "completed";
    default:
      return currentStatus;
  }
};
