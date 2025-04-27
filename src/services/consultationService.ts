// Types for consultation requests
export interface ConsultationRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  budget: number;
  needs: string;
  preferredContactMethod: "email" | "phone" | "whatsapp";
  requestDate: Date;
  status: "pending" | "contacted" | "completed" | "cancelled";
}

// Mock storage for consultation requests
const consultationRequests: ConsultationRequest[] = [];

// Generate a unique consultation reference
const generateConsultationReference = (): string => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `CONS-${timestamp}-${random}`;
};

// Submit a new consultation request
export const submitConsultationRequest = (
  data: Omit<ConsultationRequest, "id" | "requestDate" | "status">,
): ConsultationRequest => {
  const newRequest: ConsultationRequest = {
    ...data,
    id: generateConsultationReference(),
    requestDate: new Date(),
    status: "pending",
  };

  consultationRequests.push(newRequest);
  console.log("New consultation request:", newRequest);
  return newRequest;
};

// Get all consultation requests
export const getConsultationRequests = (): ConsultationRequest[] => {
  return [...consultationRequests];
};

// Get a consultation request by ID
export const getConsultationRequestById = (
  id: string,
): ConsultationRequest | undefined => {
  return consultationRequests.find((request) => request.id === id);
};

// Update a consultation request status
export const updateConsultationRequestStatus = (
  id: string,
  status: ConsultationRequest["status"],
): ConsultationRequest | undefined => {
  const requestIndex = consultationRequests.findIndex(
    (request) => request.id === id,
  );

  if (requestIndex === -1) return undefined;

  consultationRequests[requestIndex].status = status;
  return consultationRequests[requestIndex];
};
