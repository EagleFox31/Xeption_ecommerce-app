import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  TechnicianRepositoryPort,
} from "../../../domain/repair/technician.repository.port";
import {
  Technician,
  TechnicianSpecialty,
  AppointmentTimeSlot,
} from "../../../domain/repair/repair.entity";

@Injectable()
export class PrismaTechnicianRepository implements TechnicianRepositoryPort {
  constructor(private prisma: PrismaService) {}

  async getById(id: string): Promise<Technician | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { technicianAvailability: true },
    });
    if (!user || user.role !== "agent") {
      return null;
    }
    return this.mapUserToTechnician(user);
  }

  async findAvailable(criteria: {
    specialty: TechnicianSpecialty;
    location: { region: string; city?: string };
  }): Promise<Technician[]> {
    const users = await this.prisma.user.findMany({
      where: { role: "agent" },
      include: { technicianAvailability: true },
    });
    return users
      .map((u) => this.mapUserToTechnician(u))
      .filter((tech) => {
        if (!tech.isAvailable) return false;
        if (!tech.specialties.includes(criteria.specialty)) return false;
        if (tech.location.region !== criteria.location.region) return false;
        if (
          criteria.location.city &&
          tech.location.city !== criteria.location.city
        )
          return false;
        return true;
      });
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<void> {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    const formattedDate = new Date(dateString);

    if (isAvailable) {
      await this.prisma.technicianAvailability.upsert({
        where: {
          technicianId_availableDate: {
            technicianId: id,
            availableDate: formattedDate,
          },
        },
        update: {},
        create: {
          technicianId: id,
          availableDate: formattedDate,
          availableHours: [
            AppointmentTimeSlot.MORNING_8_10,
            AppointmentTimeSlot.MORNING_10_12,
            AppointmentTimeSlot.AFTERNOON_14_16,
            AppointmentTimeSlot.AFTERNOON_16_18,
          ],
        },
      });
    } else {
      await this.prisma.technicianAvailability.deleteMany({
        where: {
          technicianId: id,
          availableDate: formattedDate,
        },
      });
    }
  }

  async checkTimeSlotAvailability(
    technicianId: string,
    date: Date,
    timeSlot: AppointmentTimeSlot,
  ): Promise<boolean> {
    const availability = await this.prisma.technicianAvailability.findUnique({
      where: {
        technicianId_availableDate: {
          technicianId,
          availableDate: new Date(date.toISOString().split("T")[0]),
        },
      },
    });
    if (!availability) {
      return true;
    }
    return !availability.availableHours.includes(timeSlot);
  }

  async getAvailableTimeSlots(
    technicianId: string,
    date: Date,
  ): Promise<AppointmentTimeSlot[]> {
    const allTimeSlots = [
      AppointmentTimeSlot.MORNING_8_10,
      AppointmentTimeSlot.MORNING_10_12,
      AppointmentTimeSlot.AFTERNOON_14_16,
      AppointmentTimeSlot.AFTERNOON_16_18,
    ];
    const formattedDate = new Date(date.toISOString().split("T")[0]);
    const availability = await this.prisma.technicianAvailability.findUnique({
      where: {
        technicianId_availableDate: {
          technicianId,
          availableDate: formattedDate,
        },
      },
    });
    if (!availability) {
      return allTimeSlots;
    }
    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        technicianNotes: {
          path: ["appointment", "technicianId"],
          equals: technicianId,
        },
        preferredDate: {
          gte: new Date(formattedDate.setHours(0, 0, 0, 0)),
          lt: new Date(formattedDate.setHours(23, 59, 59, 999)),
        },
      },
    });
    const bookedTimeSlots: AppointmentTimeSlot[] = [];
    for (const job of repairJobs) {
      const notes = job.technicianNotes as any;
      if (notes && notes.appointment) {
        const appointment = notes.appointment;
        const appointmentDate = new Date(appointment.scheduledDate);
        if (appointmentDate.toDateString() === formattedDate.toDateString()) {
          bookedTimeSlots.push(appointment.timeSlot);
        }
      }
    }
    return allTimeSlots.filter((ts) => !bookedTimeSlots.includes(ts));
  }

  private mapUserToTechnician(user: any): Technician {
    const isAvailable =
      user.technicianAvailability && user.technicianAvailability.length > 0;
    let specialties = [] as TechnicianSpecialty[];
    if (user.technicianNotes) {
      const notes = user.technicianNotes as any;
      if (notes.specialties && Array.isArray(notes.specialties)) {
        specialties = notes.specialties.filter((s: string) =>
          Object.values(TechnicianSpecialty).includes(s as TechnicianSpecialty),
        );
      }
    }
    if (specialties.length === 0) {
      specialties = [TechnicianSpecialty.SMARTPHONE];
    }
    let rating = 0;
    if (user.technicianNotes && (user.technicianNotes as any).rating) {
      rating = (user.technicianNotes as any).rating;
    } else {
      rating = 5;
    }
    const location = {
      region: "Central",
      city: "Yaoundé",
      commune: "Nlongkak",
    };
    if (user.addresses && user.addresses.length > 0) {
      const defaultAddress =
        user.addresses.find((addr: any) => addr.isDefault) || user.addresses[0];
      if (defaultAddress.region) {
        location.region = defaultAddress.region.name;
      }
      if (defaultAddress.city) {
        location.city = defaultAddress.city.name;
      }
      if (defaultAddress.commune) {
        location.commune = defaultAddress.commune.name;
      }
    }
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone237,
      specialties,
      rating,
      isAvailable,
      location,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
