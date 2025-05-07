// Types for repair appointments
export interface RepairAppointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  appointmentDateTime: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  userId?: string; // Optional, linked to authenticated user if available
}

// Mock storage for repair appointments
const repairAppointments: RepairAppointment[] = [];

// Generate a unique appointment reference
const generateAppointmentReference = (): string => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `REP-${timestamp}-${random}`;
};

// Schedule a new repair appointment
export const scheduleRepairAppointment = (
  data: Omit<RepairAppointment, "id" | "status" | "createdAt">,
): RepairAppointment => {
  // Check if the appointment time is available
  const isTimeSlotAvailable = checkTimeSlotAvailability(
    data.appointmentDateTime,
  );

  if (!isTimeSlotAvailable) {
    throw new Error(
      "Ce créneau horaire n'est plus disponible. Veuillez en choisir un autre.",
    );
  }

  const newAppointment: RepairAppointment = {
    ...data,
    id: generateAppointmentReference(),
    status: "scheduled",
    createdAt: new Date(),
  };

  repairAppointments.push(newAppointment);
  console.log("New repair appointment:", newAppointment);
  return newAppointment;
};

// Check if a time slot is available
const checkTimeSlotAvailability = (dateTimeString: string): boolean => {
  // In a real application, this would check against existing appointments
  // For this mock service, we'll simulate some time slots being unavailable
  const randomAvailability = Math.random() > 0.2; // 80% chance of being available
  return randomAvailability;
};

// Get all repair appointments
export const getRepairAppointments = (): RepairAppointment[] => {
  return [...repairAppointments];
};

// Get repair appointments for a specific user
export const getUserRepairAppointments = (
  userId: string,
): RepairAppointment[] => {
  return repairAppointments.filter(
    (appointment) => appointment.userId === userId,
  );
};

// Get a repair appointment by ID
export const getRepairAppointmentById = (
  id: string,
): RepairAppointment | undefined => {
  return repairAppointments.find((appointment) => appointment.id === id);
};

// Update a repair appointment status
export const updateRepairAppointmentStatus = (
  id: string,
  status: RepairAppointment["status"],
): RepairAppointment | undefined => {
  const appointmentIndex = repairAppointments.findIndex(
    (appointment) => appointment.id === id,
  );

  if (appointmentIndex === -1) return undefined;

  repairAppointments[appointmentIndex].status = status;
  return repairAppointments[appointmentIndex];
};

// Cancel a repair appointment
export const cancelRepairAppointment = (id: string): boolean => {
  const appointmentIndex = repairAppointments.findIndex(
    (appointment) => appointment.id === id,
  );

  if (appointmentIndex === -1) return false;

  repairAppointments[appointmentIndex].status = "cancelled";
  return true;
};
